package com.claritydash.app.net

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import java.net.Inet4Address

data class NetInfo(
    val connected: Boolean = false,
    val onLocalNetwork: Boolean = false,
    val interfaceName: String? = null,
    val localIp: String? = null,
    val prefix: Int = 24,
    val gateway: String? = null,
    val dns: List<String> = emptyList(),
) {
    val cidr: String? get() = localIp?.let { Ip.cidr(it, prefix) }
    /** Identifica a rede (para não confundir a rede de casa com outra rede Wi-Fi). */
    val signature: String? get() = cidr?.let { "$it via ${gateway ?: "?"}" }

    companion object {
        fun read(ctx: Context): NetInfo {
            val cm = ctx.getSystemService(ConnectivityManager::class.java) ?: return NetInfo()
            val net = cm.activeNetwork ?: return NetInfo()
            val caps = cm.getNetworkCapabilities(net)
            val lp = cm.getLinkProperties(net) ?: return NetInfo(connected = true)
            val local = caps != null && (caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET))
            val addr = lp.linkAddresses.firstOrNull { it.address is Inet4Address }
            val gw = lp.routes.firstOrNull { it.isDefaultRoute && it.gateway is Inet4Address }?.gateway?.hostAddress
            return NetInfo(
                connected = true,
                onLocalNetwork = local,
                interfaceName = lp.interfaceName,
                localIp = addr?.address?.hostAddress,
                prefix = addr?.prefixLength ?: 24,
                gateway = gw,
                dns = lp.dnsServers.mapNotNull { it.hostAddress },
            )
        }
    }
}

object Ip {
    fun toInt(ip: String): Int = ip.split(".").fold(0) { acc, p -> (acc shl 8) or (p.toInt() and 0xff) }
    fun fromInt(v: Int): String = "${v ushr 24 and 0xff}.${v ushr 16 and 0xff}.${v ushr 8 and 0xff}.${v and 0xff}"
    private fun mask(prefix: Int): Int = if (prefix == 0) 0 else -1 shl (32 - prefix)

    fun cidr(ip: String, prefix: Int): String = "${fromInt(toInt(ip) and mask(prefix))}/$prefix"

    fun isValid(ip: String): Boolean =
        Regex("""^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$""").matchEntire(ip)
            ?.groupValues?.drop(1)?.all { it.toInt() in 0..255 } == true

    /** Devolve (cidr normalizado, prefixo) ou null se for inválido. */
    fun parseCidr(text: String): Pair<String, Int>? {
        val parts = text.trim().split("/")
        if (parts.size != 2 || !isValid(parts[0])) return null
        val prefix = parts[1].toIntOrNull() ?: return null
        if (prefix !in 0..32) return null
        return cidr(parts[0], prefix) to prefix
    }

    fun contains(cidr: String, ip: String): Boolean {
        val (net, prefix) = parseCidr(cidr) ?: return false
        if (!isValid(ip)) return false
        return (toInt(ip) and mask(prefix)) == toInt(net.substringBefore("/"))
    }

    fun broadcast(cidr: String): String {
        val (net, prefix) = parseCidr(cidr) ?: return "255.255.255.255"
        return fromInt(toInt(net.substringBefore("/")) or mask(prefix).inv())
    }

    /** Endereços de host de uma rede, no máximo [max] (redes maiores ficam pelo /24 do [around]). */
    fun hosts(cidr: String, around: String?, max: Int = 1024): Pair<String, List<String>> {
        var (net, prefix) = parseCidr(cidr) ?: return cidr to emptyList()
        if (prefix < 22 && around != null) { net = cidr(around, 24); prefix = 24 }
        val base = toInt(net.substringBefore("/"))
        val size = 1L shl (32 - prefix)
        val list = if (size <= 2) (0 until size).map { fromInt(base + it.toInt()) }
        else (1 until size - 1).take(max).map { fromInt(base + it.toInt()) }
        return net to list
    }
}
