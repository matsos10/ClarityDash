package com.claritydash.app.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.claritydash.app.data.Monitor
import com.claritydash.app.data.Repository
import com.claritydash.app.data.ScanOutcome
import com.claritydash.app.model.Device
import com.claritydash.app.model.NetEvent
import com.claritydash.app.model.OpenPort
import com.claritydash.app.model.Settings
import com.claritydash.app.net.Classify
import com.claritydash.app.net.Ip
import com.claritydash.app.net.NetInfo
import com.claritydash.app.net.Tools
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AppViewModel(app: Application) : AndroidViewModel(app) {
    private val ctx = app.applicationContext
    val repo = Repository.get(app)
    val devices = repo.devices
    val events = repo.events
    val latency = repo.latency
    val settings = repo.settings

    private val _net = MutableStateFlow(NetInfo.read(app))
    val net = _net.asStateFlow()
    private val _scanning = MutableStateFlow(false)
    val scanning = _scanning.asStateFlow()
    private val _progress = MutableStateFlow(0f)
    val progress = _progress.asStateFlow()
    private val _message = MutableStateFlow<String?>(null)
    val message = _message.asStateFlow()
    private val _publicIp = MutableStateFlow<String?>(null)
    val publicIp = _publicIp.asStateFlow()

    init {
        if (repo.devices.value.isEmpty() && _net.value.onLocalNetwork) scan()
    }

    fun say(text: String) { _message.value = text }
    fun messageShown() { _message.value = null }
    fun refreshNet() { _net.value = NetInfo.read(ctx) }

    fun scan() {
        if (_scanning.value) return
        viewModelScope.launch {
            _scanning.value = true
            _progress.value = 0f
            refreshNet()
            val r = runCatching { Monitor.run(ctx) { _progress.value = it } }
            _scanning.value = false
            refreshNet()
            say(
                when (val o = r.getOrNull()) {
                    is ScanOutcome.Done -> "${o.found} aparelhos ativos" + if (o.new > 0) " · ${o.new} novos" else ""
                    is ScanOutcome.Skipped -> o.reason
                    null -> "O varrimento falhou: ${r.exceptionOrNull()?.message}"
                }
            )
        }
    }

    fun saveDevice(d: Device) = viewModelScope.launch {
        repo.edit { it.put(d) }
        say("Guardado.")
    }

    fun deleteDevice(id: String) = viewModelScope.launch {
        repo.edit { e ->
            e.devices.removeAll { it.id == id }
            e.events.removeAll { it.deviceId == id }
        }
    }

    fun trustAll() = viewModelScope.launch {
        repo.edit { e -> e.devices.toList().filter { !it.trusted }.forEach { e.put(it.copy(trusted = true)) } }
        say("Aparelhos confirmados.")
    }

    fun clearEvents() = viewModelScope.launch { repo.edit { it.events.clear() } }

    suspend fun scanPorts(d: Device): List<OpenPort> {
        val ports = Tools.portScan(d.ip)
        repo.edit { e ->
            e.devices.firstOrNull { it.id == d.id }?.let { cur ->
                e.put(cur.copy(
                    openPorts = ports, portsScannedAt = System.currentTimeMillis(),
                    guessedType = Classify.guess(listOf(cur.hostname, cur.discoveredName, cur.vendor, cur.model),
                        cur.services, ports.map { it.port }, cur.isGateway, cur.isSelf),
                ))
            }
        }
        return ports
    }

    private fun broadcasts(): List<String> =
        listOfNotNull("255.255.255.255", _net.value.cidr?.let { Ip.broadcast(it) })

    suspend fun wake(mac: String, deviceId: String? = null, label: String? = null): String {
        val m = Tools.wakeOnLan(mac, broadcasts())
        repo.edit { it.event(NetEvent.WOL, "Wake-on-LAN enviado para ${label ?: m} ($m)", deviceId) }
        return m
    }

    fun updateSettings(block: (Settings) -> Settings) {
        repo.updateSettings(block)
        Monitor.schedule(ctx)
    }

    fun useCurrentNetworkAsHome() {
        refreshNet()
        val sig = _net.value.signature ?: return say("Sem ligação a uma rede local.")
        repo.updateSettings { it.copy(homeNetwork = sig) }
        say("Rede de casa: $sig")
    }

    fun fetchPublicIp() = viewModelScope.launch {
        _publicIp.value = runCatching { Tools.publicIp() }.getOrElse { say("Não foi possível obter o IP público."); null }
    }
}
