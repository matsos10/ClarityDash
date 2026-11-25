package com.claritydash.app.net

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
import kotlinx.coroutines.withContext
import com.claritydash.app.model.OpenPort
import org.json.JSONObject
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.Socket
import java.net.URL
import java.util.concurrent.TimeUnit

data class PingStats(val host: String, val results: List<Double?>) {
    val ok = results.filterNotNull()
    val sent get() = results.size
    val received get() = ok.size
    val loss get() = if (sent == 0) 0 else 100 * (sent - received) / sent
    val min get() = ok.minOrNull()
    val avg get() = if (ok.isEmpty()) null else ok.average()
    val max get() = ok.maxOrNull()
}

data class DnsResult(val name: String, val addresses: List<String>, val ms: Double?, val error: String?)

object Tools {
    val COMMON_PORTS = linkedMapOf(
        21 to "FTP", 22 to "SSH", 23 to "Telnet", 53 to "DNS", 80 to "HTTP", 139 to "NetBIOS", 443 to "HTTPS",
        445 to "SMB (partilha de ficheiros)", 515 to "LPD (impressora)", 548 to "AFP", 554 to "RTSP (câmara)",
        631 to "IPP (impressora)", 1883 to "MQTT", 3000 to "HTTP alt", 3389 to "Área de trabalho remota",
        5000 to "HTTP alt / UPnP", 5900 to "VNC", 6466 to "Android TV", 7000 to "AirPlay", 8008 to "Chromecast",
        8009 to "Chromecast", 8080 to "HTTP alt", 8123 to "Home Assistant", 8443 to "HTTPS alt", 8883 to "MQTT TLS",
        9000 to "HTTP alt", 9100 to "Impressora (RAW)", 32400 to "Plex", 49152 to "UPnP", 62078 to "iPhone/iPad",
    )
    val WEB_PORTS = mapOf(
        80 to "http", 443 to "https", 3000 to "http", 5000 to "http", 8080 to "http", 8123 to "http",
        8443 to "https", 9000 to "http", 32400 to "http",
    )
    private val HOST_RE = Regex("""^[A-Za-z0-9][A-Za-z0-9.\-:]{0,252}$""")
    private val TIME_RE = Regex("""time[=<]\s*([\d.]+)\s*ms""")

    fun validHost(h: String) = HOST_RE.matches(h.trim())

    /** Uma sonda: usa o `ping` do sistema; se não existir, cai para InetAddress.isReachable. */
    suspend fun pingOnce(host: String, timeoutMs: Int = 1000): Double? = withContext(Dispatchers.IO) {
        if (!validHost(host)) return@withContext null
        try {
            val p = ProcessBuilder("/system/bin/ping", "-c", "1", "-W", "${maxOf(1, timeoutMs / 1000)}", host)
                .redirectErrorStream(true).start()
            val finished = p.waitFor(timeoutMs + 1500L, TimeUnit.MILLISECONDS)
            val out = if (finished) p.inputStream.bufferedReader().readText() else { p.destroy(); "" }
            if (finished && p.exitValue() == 0) {
                return@withContext TIME_RE.find(out)?.groupValues?.get(1)?.toDoubleOrNull() ?: 0.0
            }
            if (finished) return@withContext null
        } catch (_: Exception) { /* sem ping no sistema */ }
        val t0 = System.nanoTime()
        runCatching { if (InetAddress.getByName(host).isReachable(timeoutMs)) (System.nanoTime() - t0) / 1e6 else null }
            .getOrNull()
    }

    suspend fun ping(host: String, count: Int = 4): PingStats {
        val results = mutableListOf<Double?>()
        repeat(count) { i ->
            results += pingOnce(host)
            if (i < count - 1) delay(250)
        }
        return PingStats(host, results)
    }

    /** true = porta aberta, false = recusada (o aparelho existe), null = sem resposta. */
    fun tcpConnect(ip: String, port: Int, timeoutMs: Int): Boolean? = try {
        Socket().use { it.connect(InetSocketAddress(ip, port), timeoutMs) }
        true
    } catch (e: Exception) {
        val m = e.message ?: ""
        if ("ECONNREFUSED" in m || "Connection refused" in m) false else null
    }

    fun parsePorts(text: String, limit: Int = 2048): List<Int> {
        if (text.isBlank()) return COMMON_PORTS.keys.toList()
        val ports = sortedSetOf<Int>()
        for (part in text.replace(" ", "").split(",").filter { it.isNotEmpty() }) {
            if ("-" in part) {
                val (a, b) = part.split("-", limit = 2).map { it.toInt() }
                ports.addAll(a..b)
            } else ports.add(part.toInt())
        }
        val valid = ports.filter { it in 1..65535 }
        require(valid.isNotEmpty() && valid.size <= limit) { "Indica entre 1 e $limit portas." }
        return valid
    }

    suspend fun portScan(host: String, ports: List<Int> = COMMON_PORTS.keys.toList()): List<OpenPort> =
        withContext(Dispatchers.IO) {
            require(validHost(host)) { "Endereço inválido." }
            val ip = InetAddress.getByName(host).hostAddress ?: host
            val sem = Semaphore(128)
            coroutineScope {
                ports.map { port ->
                    async { sem.withPermit { if (tcpConnect(ip, port, 700) == true) port else null } }
                }.awaitAll()
            }.filterNotNull().map { OpenPort(it, COMMON_PORTS[it] ?: "", WEB_PORTS[it]) }
        }

    fun normalizeMac(text: String): String? {
        val hex = text.lowercase().filter { it in "0123456789abcdef" }
        if (hex.length != 12 || hex == "000000000000" || hex == "ffffffffffff") return null
        return hex.chunked(2).joinToString(":")
    }

    suspend fun wakeOnLan(macText: String, broadcasts: List<String>): String = withContext(Dispatchers.IO) {
        val mac = normalizeMac(macText) ?: throw IllegalArgumentException("MAC inválido.")
        val macBytes = mac.split(":").map { it.toInt(16).toByte() }.toByteArray()
        val packet = ByteArray(6) { 0xff.toByte() } + (1..16).flatMap { macBytes.toList() }
        DatagramSocket().use { s ->
            s.broadcast = true
            for (b in broadcasts.distinct()) for (port in listOf(9, 7)) {
                runCatching { s.send(DatagramPacket(packet, packet.size, InetAddress.getByName(b), port)) }
            }
        }
        mac
    }

    suspend fun dns(name: String): DnsResult = withContext(Dispatchers.IO) {
        require(validHost(name)) { "Nome inválido." }
        val t0 = System.nanoTime()
        try {
            val addrs = InetAddress.getAllByName(name).mapNotNull { it.hostAddress }.distinct()
            DnsResult(name, addrs, (System.nanoTime() - t0) / 1e6, null)
        } catch (e: Exception) {
            DnsResult(name, emptyList(), null, e.message ?: "Falhou")
        }
    }

    suspend fun publicIp(): String = withContext(Dispatchers.IO) {
        val c = URL("https://api.ipify.org?format=json").openConnection()
        c.connectTimeout = 6000; c.readTimeout = 6000
        JSONObject(c.getInputStream().bufferedReader().readText()).getString("ip")
    }
}
