package com.claritydash.app.net

import com.claritydash.app.model.DeviceType
import com.claritydash.app.model.DeviceType.*

/** Adivinha o tipo de aparelho a partir do nome, fabricante, modelo, serviços e portas. */
object Classify {
    private val RULES = listOf(
        NETWORK to listOf("router", "gateway", "access point", "repeater", "extender", "ubiquiti", "unifi",
            "mikrotik", "netgear", "fritz", "openwrt", "livebox", "vodafone", "meo", "mesh", "deco", "eero", "orbi", "ap"),
        TABLET to listOf("ipad", "kindle", "galaxy-tab", "galaxy tab", "tab"),
        PHONE to listOf("iphone", "android", "galaxy", "pixel", "redmi", "oneplus", "motorola", "moto", "poco", "xiaomi"),
        TV to listOf("bravia", "chromecast", "firetv", "fire-tv", "fire tv", "appletv", "apple tv", "webos", "tizen",
            "android tv", "shield", "roku", "television", "tv", "lgtv"),
        PRINTER to listOf("printer", "impressora", "epson", "brother", "canon", "laserjet", "officejet", "deskjet",
            "kyocera", "xerox", "lexmark"),
        CONSOLE to listOf("playstation", "nintendo", "xbox", "ps4", "ps5"),
        SPEAKER to listOf("sonos", "homepod", "audioaccessory", "google home", "google-home", "nest mini",
            "nest audio", "echo", "alexa", "speaker"),
        CAMERA to listOf("camera", "câmara", "ipcam", "hikvision", "dahua", "reolink", "wyze", "arlo", "eufy", "ring", "cam"),
        IOT to listOf("espressif", "esphome", "tuya", "shelly", "sonoff", "tasmota", "yeelight", "philips hue",
            "signify", "meross", "broadlink", "ecobee", "roborock", "dyson", "homekit", "matter", "esp", "hue", "kasa",
            "nest", "plug", "bulb"),
        SERVER to listOf("raspberry", "pihole", "pi-hole", "synology", "diskstation", "qnap", "unraid", "truenas",
            "home assistant", "homeassistant", "plex", "server", "nas"),
    )
    private val COMPUTER_WORDS = listOf("macbook", "imac", "mac-mini", "macmini", "macpro", "desktop", "laptop",
        "thinkpad", "notebook", "workstation", "surface", "windows", "computador", "pc", "dell", "lenovo", "asus", "hp")

    private val SERVICE_RULES = listOf(
        setOf("Chromecast", "Android TV", "Fire TV") to TV,
        setOf("Impressora", "Scanner") to PRINTER,
        setOf("Sonos", "Spotify Connect", "AirPlay áudio") to SPEAKER,
        setOf("HomeKit", "Matter", "Philips Hue", "ESPHome") to IOT,
        setOf("Home Assistant", "Servidor multimédia") to SERVER,
        setOf("Router") to NETWORK,
        setOf("Partilha de ficheiros", "Computador", "VNC") to COMPUTER,
        setOf("Media renderer") to TV,
    )
    private val PORT_RULES = listOf(
        setOf(9100, 631, 515) to PRINTER, setOf(62078) to PHONE, setOf(554) to CAMERA,
        setOf(8008, 8009, 6466) to TV, setOf(8123, 32400, 1883) to SERVER, setOf(3389, 445, 139) to COMPUTER,
    )

    fun guess(
        texts: List<String?>, services: Collection<String>, ports: Collection<Int>,
        isGateway: Boolean, isSelf: Boolean,
    ): DeviceType {
        if (isGateway) return NETWORK
        if (isSelf) return PHONE
        val text = texts.filterNotNull().joinToString(" ").lowercase()
        val tokens = text.split(Regex("[^a-z0-9]+")).toSet()
        fun matches(words: List<String>) = words.any { (it.length > 4 && it in text) || it in tokens }

        // Modelos Apple anunciados por mDNS (ex.: "iPhone14,2", "MacBookPro18,1", "AppleTV11,1").
        when {
            "iphone" in text -> return PHONE
            "ipad" in text -> return TABLET
            "appletv" in text -> return TV
            "audioaccessory" in text -> return SPEAKER
            Regex("mac(book|mini|pro|\\d)|imac").containsMatchIn(text) -> return COMPUTER
        }
        RULES.firstOrNull { matches(it.second) }?.let { return it.first }
        SERVICE_RULES.firstOrNull { (set, _) -> services.any { it in set } }?.let { return it.second }
        PORT_RULES.firstOrNull { (set, _) -> ports.any { it in set } }?.let { return it.second }
        return if (matches(COMPUTER_WORDS)) COMPUTER else OTHER
    }
}
