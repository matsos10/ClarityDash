package com.claritydash.app.net

import java.io.File
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.HttpURLConnection
import java.net.InetAddress
import java.net.SocketTimeoutException
import java.net.URL

/** Informação recolhida de um aparelho pelos protocolos de descoberta. */
data class Discovered(
    var name: String? = null,
    var hostname: String? = null,
    var vendor: String? = null,
    var model: String? = null,
    val services: MutableSet<String> = linkedSetOf(),
)

/** Consulta mDNS/Bonjour "simples" (porta de origem ≠ 5353 → respostas em unicast, sem multicast lock). */
object Mdns {
    val SERVICES = mapOf(
        "_googlecast._tcp" to "Chromecast", "_androidtvremote2._tcp" to "Android TV", "_amzn-wplay._tcp" to "Fire TV",
        "_airplay._tcp" to "AirPlay", "_raop._tcp" to "AirPlay áudio", "_spotify-connect._tcp" to "Spotify Connect",
        "_sonos._tcp" to "Sonos", "_ipp._tcp" to "Impressora", "_printer._tcp" to "Impressora",
        "_pdl-datastream._tcp" to "Impressora", "_scanner._tcp" to "Scanner", "_uscan._tcp" to "Scanner",
        "_hap._tcp" to "HomeKit", "_matter._tcp" to "Matter", "_hue._tcp" to "Philips Hue",
        "_esphomelib._tcp" to "ESPHome", "_home-assistant._tcp" to "Home Assistant", "_mqtt._tcp" to "MQTT",
        "_companion-link._tcp" to "Apple", "_device-info._tcp" to "Info", "_smb._tcp" to "Partilha de ficheiros",
        "_afpovertcp._tcp" to "Partilha de ficheiros", "_workstation._tcp" to "Computador", "_ssh._tcp" to "SSH",
        "_rfb._tcp" to "VNC", "_http._tcp" to "Web", "_daap._tcp" to "Música", "_nvstream._tcp" to "GameStream",
    )

    fun discover(timeoutMs: Int = 3000): Map<String, Discovered> {
        val out = mutableMapOf<String, Discovered>()
        val query = buildQuery(SERVICES.keys.map { "$it.local" })
        try {
            DatagramSocket().use { s ->
                s.soTimeout = 300
                val group = InetAddress.getByName("224.0.0.251")
                val deadline = System.currentTimeMillis() + timeoutMs
                var nextSend = 0L
                val buf = ByteArray(9000)
                while (System.currentTimeMillis() < deadline) {
                    if (System.currentTimeMillis() >= nextSend) {
                        runCatching { s.send(DatagramPacket(query, query.size, group, 5353)) }
                        nextSend = System.currentTimeMillis() + 1200
                    }
                    val p = DatagramPacket(buf, buf.size)
                    try { s.receive(p) } catch (_: SocketTimeoutException) { continue }
                    val ip = p.address.hostAddress ?: continue
                    runCatching { parse(p.data.copyOf(p.length), out.getOrPut(ip) { Discovered() }) }
                }
            }
        } catch (_: Exception) { }
        return out.filterValues { it.services.isNotEmpty() || it.name != null }
    }

    private fun buildQuery(names: List<String>): ByteArray {
        val b = java.io.ByteArrayOutputStream()
        b.write(byteArrayOf(0x12, 0x34, 0, 0, 0, names.size.toByte(), 0, 0, 0, 0, 0, 0))
        for (n in names) {
            for (label in n.split(".")) { b.write(label.length); b.write(label.toByteArray()) }
            b.write(byteArrayOf(0, 0, 12, 0, 1)) // PTR, IN
        }
        return b.toByteArray()
    }

    private fun parse(d: ByteArray, info: Discovered) {
        fun u16(i: Int) = ((d[i].toInt() and 0xff) shl 8) or (d[i + 1].toInt() and 0xff)
        fun name(start: Int): Pair<String, Int> {
            val parts = mutableListOf<String>()
            var i = start; var end = -1; var jumps = 0
            while (true) {
                val len = d[i].toInt() and 0xff
                when {
                    len == 0 -> { if (end < 0) end = i + 1; break }
                    len and 0xc0 == 0xc0 -> {
                        if (end < 0) end = i + 2
                        i = ((len and 0x3f) shl 8) or (d[i + 1].toInt() and 0xff)
                        if (++jumps > 20) break
                    }
                    else -> { parts += String(d, i + 1, len, Charsets.UTF_8); i += len + 1 }
                }
            }
            return parts.joinToString(".") to end
        }

        val qd = u16(4); val records = u16(6) + u16(8) + u16(10)
        var i = 12
        repeat(qd) { i = name(i).second + 4 }
        repeat(records) {
            val (rname, after) = name(i)
            val type = u16(after); val rdlen = u16(after + 8); val rd = after + 10
            when (type) {
                12 -> { // PTR: serviço -> instância
                    val service = SERVICES.keys.firstOrNull { rname.startsWith(it) }
                    if (service != null) {
                        info.services += SERVICES.getValue(service)
                        val instance = name(rd).first.removeSuffix(".$service.local")
                        if (service != "_googlecast._tcp" && service != "_device-info._tcp" && info.name == null)
                            info.name = instance.replace("\\", "")
                    }
                }
                33 -> { // SRV: alvo = hostname
                    val target = name(rd + 6).first.removeSuffix(".local")
                    if (target.isNotBlank()) info.hostname = info.hostname ?: target
                }
                16 -> { // TXT: modelo / nome amigável
                    var j = rd
                    while (j < rd + rdlen) {
                        val l = d[j].toInt() and 0xff
                        val kv = String(d, j + 1, l, Charsets.UTF_8)
                        val k = kv.substringBefore("=").lowercase(); val v = kv.substringAfter("=", "")
                        if (v.isNotBlank()) when (k) {
                            "fn" -> info.name = v
                            "md", "model", "am", "ty", "usb_mdl", "product" -> info.model = info.model ?: v.trim('(', ')')
                            "manufacturer", "usb_mfg" -> info.vendor = info.vendor ?: v
                        }
                        j += l + 1
                    }
                }
            }
            i = rd + rdlen
        }
    }
}

/** Descoberta UPnP/SSDP: routers, TVs, colunas e NAS anunciam nome, fabricante e modelo. */
object Ssdp {
    fun discover(timeoutMs: Int = 3000): Map<String, Discovered> {
        val locations = mutableMapOf<String, String>()
        val servers = mutableMapOf<String, String>()
        val msg = ("M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1900\r\nMAN: \"ssdp:discover\"\r\n" +
            "MX: 2\r\nST: ssdp:all\r\n\r\n").toByteArray()
        try {
            DatagramSocket().use { s ->
                s.soTimeout = 300
                val group = InetAddress.getByName("239.255.255.250")
                repeat(2) { s.send(DatagramPacket(msg, msg.size, group, 1900)) }
                val deadline = System.currentTimeMillis() + timeoutMs
                val buf = ByteArray(4096)
                while (System.currentTimeMillis() < deadline) {
                    val p = DatagramPacket(buf, buf.size)
                    try { s.receive(p) } catch (_: SocketTimeoutException) { continue }
                    val ip = p.address.hostAddress ?: continue
                    val text = String(p.data, 0, p.length)
                    header(text, "location")?.let { if (ip !in locations) locations[ip] = it }
                    header(text, "server")?.let { servers.putIfAbsent(ip, it) }
                }
            }
        } catch (_: Exception) { }

        val out = mutableMapOf<String, Discovered>()
        for ((ip, loc) in locations) {
            val info = Discovered().also { it.services += "UPnP" }
            try {
                val c = URL(loc).openConnection() as HttpURLConnection
                c.connectTimeout = 1500; c.readTimeout = 1500
                val xml = c.inputStream.bufferedReader().use { it.readText() }
                info.name = tag(xml, "friendlyName")
                info.vendor = tag(xml, "manufacturer")
                info.model = listOfNotNull(tag(xml, "modelName"), tag(xml, "modelNumber"))
                    .distinct().joinToString(" ").ifBlank { null }
                tag(xml, "deviceType")?.let { t ->
                    when {
                        "InternetGatewayDevice" in t || "WFADevice" in t -> info.services += "Router"
                        "MediaRenderer" in t -> info.services += "Media renderer"
                        "MediaServer" in t -> info.services += "Servidor multimédia"
                        "Printer" in t -> info.services += "Impressora"
                    }
                }
            } catch (_: Exception) {
                servers[ip]?.let { info.model = it }
            }
            out[ip] = info
        }
        return out
    }

    private fun header(text: String, name: String) =
        text.lineSequence().firstOrNull { it.lowercase().startsWith("$name:") }?.substringAfter(":")?.trim()

    private fun tag(xml: String, name: String) =
        Regex("<$name>([^<]{1,120})</$name>").find(xml)?.groupValues?.get(1)?.trim()?.ifBlank { null }
}

/** Nome NetBIOS (computadores Windows, NAS com Samba). */
object NetBios {
    private val QUERY = byteArrayOf(0x13, 0x37, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0x20, 'C'.code.toByte(), 'K'.code.toByte()) +
        ByteArray(30) { 'A'.code.toByte() } + byteArrayOf(0, 0, 0x21, 0, 1)

    fun name(ip: String, timeoutMs: Int = 800): String? = try {
        DatagramSocket().use { s ->
            s.soTimeout = timeoutMs
            s.send(DatagramPacket(QUERY, QUERY.size, InetAddress.getByName(ip), 137))
            val buf = ByteArray(1024)
            val p = DatagramPacket(buf, buf.size)
            s.receive(p)
            val count = buf[56].toInt() and 0xff
            (0 until count).map { 57 + it * 18 }.firstNotNullOfOrNull { off ->
                val suffix = buf[off + 15].toInt() and 0xff
                val group = buf[off + 16].toInt() and 0x80 != 0
                if (suffix == 0 && !group) String(buf, off, 15, Charsets.US_ASCII).trim() else null
            }
        }
    } catch (_: Exception) { null }
}

/** Tabela ARP — só legível em Android 9 ou anterior; nas versões recentes devolve vazio. */
object Arp {
    fun table(): Map<String, String> = try {
        File("/proc/net/arp").readLines().drop(1).mapNotNull { line ->
            val c = line.trim().split(Regex("\\s+"))
            if (c.size >= 4 && c[2] != "0x0") Tools.normalizeMac(c[3])?.let { c[0] to it } else null
        }.toMap()
    } catch (_: Exception) { emptyMap() }
}
