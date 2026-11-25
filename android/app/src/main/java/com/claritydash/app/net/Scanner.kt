package com.claritydash.app.net

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
import kotlinx.coroutines.withContext
import java.net.InetAddress
import java.util.concurrent.Callable
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger

data class Found(
    val ip: String,
    val latency: Double?,
    val mac: String?,
    val hostname: String?,
    val info: Discovered,
)

data class ScanResult(val cidr: String, val hosts: Int, val found: List<Found>)

object Scanner {
    private val PROBE_PORTS = listOf(80, 443, 62078, 445, 8080, 7000)
    private val dnsPool = Executors.newCachedThreadPool { r -> Thread(r).apply { isDaemon = true } }

    /** DNS reverso com tempo-limite real (a chamada do sistema não é interrompível). */
    private fun reverseDns(ip: String): String? = try {
        dnsPool.submit(Callable { InetAddress.getByName(ip).canonicalHostName })
            .get(2500, TimeUnit.MILLISECONDS)?.takeIf { it != ip }
    } catch (_: Exception) { null }

    /** Verifica se um IP tem alguém: ICMP e, se falhar, ligações TCP (uma recusa também conta). */
    private fun probe(ip: String): Double? {
        val t0 = System.nanoTime()
        val addr = runCatching { InetAddress.getByName(ip) }.getOrNull() ?: return null
        if (runCatching { addr.isReachable(700) }.getOrDefault(false)) return (System.nanoTime() - t0) / 1e6
        for (port in PROBE_PORTS) {
            val t1 = System.nanoTime()
            if (Tools.tcpConnect(ip, port, 250) != null) return (System.nanoTime() - t1) / 1e6
        }
        return null
    }

    suspend fun scan(net: NetInfo, subnetOverride: String, onProgress: (Float) -> Unit): ScanResult =
        withContext(Dispatchers.IO) {
            val (cidr, targets) = Ip.hosts(subnetOverride.ifBlank { net.cidr!! }, net.localIp)
            coroutineScope {
                val mdns = async { Mdns.discover(3500) }
                val ssdp = async { Ssdp.discover(3500) }

                val done = AtomicInteger()
                val sem = Semaphore(48)
                val alive = targets.map { ip ->
                    async {
                        sem.withPermit {
                            val ms = if (ip == net.localIp) 0.0 else probe(ip)
                            onProgress(done.incrementAndGet().toFloat() / targets.size)
                            ip to ms
                        }
                    }
                }.awaitAll().filter { it.second != null }.toMap().toMutableMap()

                val discovered = mutableMapOf<String, Discovered>()
                discovered.putAll(mdns.await())
                for ((ip, d) in ssdp.await()) {
                    val cur = discovered.getOrPut(ip) { Discovered() }
                    cur.name = cur.name ?: d.name
                    cur.vendor = cur.vendor ?: d.vendor
                    cur.model = cur.model ?: d.model
                    cur.services += d.services
                }
                // Quem respondeu a mDNS/UPnP está vivo, mesmo que ignore ping.
                for (ip in discovered.keys) if (Ip.contains(cidr, ip) && ip !in alive) alive[ip] = null

                val arp = Arp.table()
                val names = alive.keys.map { ip ->
                    async {
                        sem.withPermit {
                            val dns = reverseDns(ip)
                            val nb = if (discovered[ip]?.name == null) NetBios.name(ip) else null
                            Triple(ip, dns, nb)
                        }
                    }
                }.awaitAll()

                val found = names.map { (ip, dns, nb) ->
                    val info = discovered[ip] ?: Discovered()
                    if (info.name == null && nb != null) info.name = nb
                    Found(ip, alive[ip], arp[ip], dns?.removeSuffix(".local")?.removeSuffix(".lan"), info)
                }
                ScanResult(cidr, targets.size, found)
            }
        }
}
