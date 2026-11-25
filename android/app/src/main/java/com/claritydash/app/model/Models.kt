package com.claritydash.app.model

import org.json.JSONArray
import org.json.JSONObject

enum class DeviceType(val label: String, val icon: String) {
    PHONE("Smartphone", "📱"),
    TABLET("Tablet", "📲"),
    COMPUTER("Computador", "💻"),
    SERVER("Servidor / NAS", "🗄️"),
    TV("TV / Streaming", "📺"),
    CONSOLE("Consola", "🎮"),
    SPEAKER("Coluna / Assistente", "🔊"),
    CAMERA("Câmara", "📷"),
    PRINTER("Impressora", "🖨️"),
    IOT("Casa inteligente", "💡"),
    NETWORK("Equipamento de rede", "📡"),
    OTHER("Outro", "❔");

    companion object {
        fun of(name: String?): DeviceType? = entries.firstOrNull { it.name == name }
    }
}

data class OpenPort(val port: Int, val service: String, val web: String?)

data class Device(
    val id: String,
    val ip: String,
    val mac: String? = null,
    val hostname: String? = null,
    val discoveredName: String? = null,
    val vendor: String? = null,
    val model: String? = null,
    val services: List<String> = emptyList(),
    val name: String = "",
    val type: DeviceType? = null,
    val guessedType: DeviceType = DeviceType.OTHER,
    val owner: String = "",
    val location: String = "",
    val notes: String = "",
    val trusted: Boolean = false,
    val alertOffline: Boolean = false,
    val online: Boolean = false,
    val latency: Double? = null,
    val firstSeen: Long = 0,
    val lastSeen: Long = 0,
    val openPorts: List<OpenPort> = emptyList(),
    val portsScannedAt: Long = 0,
    val isGateway: Boolean = false,
    val isSelf: Boolean = false,
) {
    val label: String
        get() = name.ifBlank {
            when {
                isSelf -> "Este telemóvel"
                else -> discoveredName ?: hostname ?: model ?: vendor ?: ip
            }
        }
    val effectiveType: DeviceType get() = type ?: guessedType

    fun toJson(): JSONObject = JSONObject().apply {
        put("id", id); put("ip", ip); putOpt("mac", mac); putOpt("hostname", hostname)
        putOpt("discoveredName", discoveredName); putOpt("vendor", vendor); putOpt("model", model)
        put("services", JSONArray(services)); put("name", name); putOpt("type", type?.name)
        put("guessedType", guessedType.name); put("owner", owner); put("location", location); put("notes", notes)
        put("trusted", trusted); put("alertOffline", alertOffline); put("online", online); putOpt("latency", latency)
        put("firstSeen", firstSeen); put("lastSeen", lastSeen); put("portsScannedAt", portsScannedAt)
        put("isGateway", isGateway); put("isSelf", isSelf)
        put("openPorts", JSONArray(openPorts.map {
            JSONObject().put("port", it.port).put("service", it.service).putOpt("web", it.web)
        }))
    }

    companion object {
        fun fromJson(o: JSONObject) = Device(
            id = o.getString("id"), ip = o.getString("ip"), mac = o.str("mac"), hostname = o.str("hostname"),
            discoveredName = o.str("discoveredName"), vendor = o.str("vendor"), model = o.str("model"),
            services = o.optJSONArray("services").strings(), name = o.optString("name"),
            type = DeviceType.of(o.str("type")), guessedType = DeviceType.of(o.str("guessedType")) ?: DeviceType.OTHER,
            owner = o.optString("owner"), location = o.optString("location"), notes = o.optString("notes"),
            trusted = o.optBoolean("trusted"), alertOffline = o.optBoolean("alertOffline"),
            online = o.optBoolean("online"), latency = if (o.isNull("latency")) null else o.optDouble("latency"),
            firstSeen = o.optLong("firstSeen"), lastSeen = o.optLong("lastSeen"),
            portsScannedAt = o.optLong("portsScannedAt"), isGateway = o.optBoolean("isGateway"),
            isSelf = o.optBoolean("isSelf"),
            openPorts = o.optJSONArray("openPorts")?.let { a ->
                (0 until a.length()).map { i ->
                    val p = a.getJSONObject(i)
                    OpenPort(p.getInt("port"), p.optString("service"), p.str("web"))
                }
            } ?: emptyList(),
        )
    }
}

data class NetEvent(val ts: Long, val kind: String, val message: String, val deviceId: String? = null) {
    fun toJson(): JSONObject = JSONObject().put("ts", ts).put("kind", kind).put("message", message).putOpt("deviceId", deviceId)

    companion object {
        const val NEW = "new_device"; const val ONLINE = "online"; const val OFFLINE = "offline"
        const val IP_CHANGE = "ip_change"; const val WOL = "wol"; const val INFO = "info"
        val ICONS = mapOf(NEW to "🆕", ONLINE to "🟢", OFFLINE to "🔴", IP_CHANGE to "🔀", WOL to "⚡", INFO to "ℹ️")
        fun fromJson(o: JSONObject) = NetEvent(o.getLong("ts"), o.getString("kind"), o.getString("message"), o.str("deviceId"))
    }
}

data class LatencyPoint(val ts: Long, val gateway: Double?, val internet: Double?) {
    fun toJson(): JSONObject = JSONObject().put("ts", ts).putOpt("gateway", gateway).putOpt("internet", internet)

    companion object {
        fun fromJson(o: JSONObject) = LatencyPoint(
            o.getLong("ts"),
            if (o.isNull("gateway")) null else o.optDouble("gateway"),
            if (o.isNull("internet")) null else o.optDouble("internet"),
        )
    }
}

data class Settings(
    val monitorEnabled: Boolean = true,
    val intervalMinutes: Int = 15,
    val offlineAfterMinutes: Int = 20,
    val notifyNew: Boolean = true,
    val notifyOffline: Boolean = true,
    val latencyTarget: String = "1.1.1.1",
    val subnet: String = "",
    val homeNetwork: String = "",
)

fun JSONObject.str(key: String): String? =
    if (has(key) && !isNull(key)) optString(key).ifEmpty { null } else null

fun JSONArray?.strings(): List<String> = this?.let { a -> (0 until a.length()).map { a.getString(it) } } ?: emptyList()
