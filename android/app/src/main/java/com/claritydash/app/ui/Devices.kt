@file:OptIn(ExperimentalMaterial3Api::class)

package com.claritydash.app.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.claritydash.app.model.Device
import com.claritydash.app.model.DeviceType
import com.claritydash.app.net.PingStats
import com.claritydash.app.net.Tools
import kotlinx.coroutines.launch

private enum class Filter(val label: String) { ALL("Todos"), ONLINE("Online"), OFFLINE("Offline"), UNTRUSTED("Por confirmar") }

private fun ipKey(ip: String) = ip.split(".").joinToString(".") { it.padStart(3, '0') }

@Composable
fun DevicesScreen(vm: AppViewModel, padding: PaddingValues, onOpen: (String) -> Unit) {
    val devices by vm.devices.collectAsStateWithLifecycle()
    var query by rememberSaveable { mutableStateOf("") }
    var filter by rememberSaveable { mutableStateOf(Filter.ALL) }

    val list = devices.filter { d ->
        when (filter) {
            Filter.ALL -> true
            Filter.ONLINE -> d.online
            Filter.OFFLINE -> !d.online
            Filter.UNTRUSTED -> !d.trusted
        } && (query.isBlank() || listOfNotNull(d.label, d.ip, d.mac, d.vendor, d.model, d.hostname, d.owner, d.location,
            d.effectiveType.label).any { it.contains(query, ignoreCase = true) })
    }.sortedWith(compareByDescending<Device> { it.online }.thenBy { ipKey(it.ip) })

    LazyColumn(
        contentPadding = PaddingValues(0.dp, padding.calculateTopPadding(), 0.dp, padding.calculateBottomPadding() + 16.dp),
    ) {
        item {
            Column(Modifier.padding(16.dp, 8.dp, 16.dp, 4.dp)) {
                OutlinedTextField(
                    query, { query = it }, Modifier.fillMaxWidth(), singleLine = true,
                    placeholder = { Text("Procurar nome, IP, fabricante…") },
                    leadingIcon = { Icon(Icons.Filled.Search, null) },
                )
                Row(Modifier.horizontalScroll(rememberScrollState()).padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Filter.entries.forEach { f ->
                        val n = devices.count { d ->
                            when (f) { Filter.ALL -> true; Filter.ONLINE -> d.online; Filter.OFFLINE -> !d.online; Filter.UNTRUSTED -> !d.trusted }
                        }
                        FilterChip(filter == f, { filter = f }, label = { Text("${f.label} ($n)") })
                    }
                }
            }
        }
        if (list.isEmpty()) item {
            Muted(if (devices.isEmpty()) "Ainda não há aparelhos. Toca em ↻ para analisar a rede." else "Nenhum aparelho corresponde ao filtro.",
                Modifier.padding(24.dp))
        }
        items(list, key = { it.id }) { d ->
            DeviceRow(d) { onOpen(d.id) }
            HorizontalDivider(Modifier.padding(start = 72.dp), color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
        }
    }
}

@Composable
private fun DeviceRow(d: Device, onClick: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().clickable(onClick = onClick).padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.width(44.dp)) {
            Text(d.effectiveType.icon, style = MaterialTheme.typography.headlineSmall)
            Box(Modifier.align(Alignment.BottomEnd)) { StatusDot(d.online) }
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(d.label, style = MaterialTheme.typography.bodyLarge, maxLines = 1, overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f, fill = false),
                    color = if (d.online) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant)
                if (!d.trusted) { Spacer(Modifier.width(6.dp)); Badge("por confirmar") }
            }
            Muted(listOfNotNull(d.ip, d.effectiveType.label, d.owner.ifBlank { null }).joinToString(" · "))
        }
        Spacer(Modifier.width(8.dp))
        Muted(if (d.online) ms(d.latency) else ago(d.lastSeen))
    }
}

@Composable
fun DeviceDetail(vm: AppViewModel, id: String, onBack: () -> Unit) {
    val devices by vm.devices.collectAsStateWithLifecycle()
    val events by vm.events.collectAsStateWithLifecycle()
    val d = devices.firstOrNull { it.id == id }
    if (d == null) {
        LaunchedEffect(id) { onBack() }
        return
    }
    val scope = rememberCoroutineScope()
    val uri = LocalUriHandler.current

    var name by remember(id) { mutableStateOf(d.name) }
    var type by remember(id) { mutableStateOf(d.type) }
    var owner by remember(id) { mutableStateOf(d.owner) }
    var location by remember(id) { mutableStateOf(d.location) }
    var notes by remember(id) { mutableStateOf(d.notes) }
    var mac by remember(id) { mutableStateOf(d.mac ?: "") }
    var trusted by remember(id) { mutableStateOf(d.trusted) }
    var alert by remember(id) { mutableStateOf(d.alertOffline) }
    var busy by remember { mutableStateOf<String?>(null) }
    var ping by remember { mutableStateOf<PingStats?>(null) }
    var confirmDelete by remember { mutableStateOf(false) }

    fun run(label: String, block: suspend () -> Unit) {
        if (busy != null) return
        busy = label
        scope.launch {
            try { block() } catch (e: Exception) { vm.say(e.message ?: "Falhou.") } finally { busy = null }
        }
    }

    Scaffold(topBar = {
        TopAppBar(
            title = { Text(d.label, maxLines = 1, overflow = TextOverflow.Ellipsis) },
            navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Voltar") } },
        )
    }) { pad ->
        Column(
            Modifier.fillMaxSize().padding(pad).verticalScroll(rememberScrollState()).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(d.effectiveType.icon, style = MaterialTheme.typography.headlineMedium)
                Spacer(Modifier.width(12.dp))
                StatusDot(d.online, 12)
                Spacer(Modifier.width(8.dp))
                Text(if (d.online) "Online · ${ms(d.latency)}" else "Offline · visto ${ago(d.lastSeen)}")
            }
            SectionCard {
                InfoRow("IP", d.ip)
                InfoRow("MAC", d.mac ?: "desconhecido")
                d.discoveredName?.let { InfoRow("Nome anunciado", it) }
                d.hostname?.let { InfoRow("Hostname", it) }
                d.vendor?.let { InfoRow("Fabricante", it) }
                d.model?.let { InfoRow("Modelo", it) }
                if (d.services.isNotEmpty()) InfoRow("Serviços", d.services.joinToString(", "))
                InfoRow("Tipo detetado", d.guessedType.label)
                InfoRow("Visto pela 1.ª vez", dateTime(d.firstSeen))
                InfoRow("Última vez", dateTime(d.lastSeen))
            }

            Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(enabled = busy == null, onClick = { run("ping") { ping = Tools.ping(d.ip, 5) } }) {
                    Text(if (busy == "ping") "A testar…" else "Ping")
                }
                OutlinedButton(enabled = busy == null, onClick = { run("ports") { vm.scanPorts(d) } }) {
                    Text(if (busy == "ports") "A analisar…" else "Analisar portas")
                }
                OutlinedButton(enabled = busy == null && mac.isNotBlank(), onClick = {
                    run("wol") { vm.wake(mac, d.id, d.label); vm.say("Pacote Wake-on-LAN enviado.") }
                }) { Text("Wake-on-LAN") }
            }
            ping?.let { Mono(pingText(it)) }
            if (d.portsScannedAt > 0) {
                Muted("Portas abertas (análise ${ago(d.portsScannedAt)}):")
                if (d.openPorts.isEmpty()) Muted("Nenhuma porta comum aberta.")
                d.openPorts.forEach { p ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("${p.port}", modifier = Modifier.width(64.dp), style = MaterialTheme.typography.bodyMedium)
                        Text(p.service, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                        if (p.web != null) TextButton(onClick = {
                            runCatching { uri.openUri("${p.web}://${d.ip}:${p.port}/") }
                        }) { Text("Abrir") }
                    }
                }
            }

            SectionCard("Identificação") {
                OutlinedTextField(name, { name = it }, Modifier.fillMaxWidth(), label = { Text("Nome") },
                    placeholder = { Text(d.discoveredName ?: d.hostname ?: "ex.: Portátil da Ana") }, singleLine = true)
                TypePicker(type, d.guessedType) { type = it }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(owner, { owner = it }, Modifier.weight(1f), label = { Text("Dono") }, singleLine = true)
                    OutlinedTextField(location, { location = it }, Modifier.weight(1f), label = { Text("Local") }, singleLine = true)
                }
                OutlinedTextField(mac, { mac = it }, Modifier.fillMaxWidth(), label = { Text("MAC (para Wake-on-LAN)") },
                    singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Ascii))
                OutlinedTextField(notes, { notes = it }, Modifier.fillMaxWidth(), label = { Text("Notas") }, minLines = 2)
                SwitchRow("Aparelho confiável (conhecido)", trusted) { trusted = it }
                SwitchRow("Alertar quando fica offline / volta", alert) { alert = it }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Button(onClick = {
                        val m = mac.trim()
                        val norm = if (m.isEmpty()) null else Tools.normalizeMac(m)
                        if (m.isNotEmpty() && norm == null) { vm.say("MAC inválido."); return@Button }
                        vm.saveDevice(d.copy(name = name.trim(), type = type, owner = owner.trim(), location = location.trim(),
                            notes = notes.trim(), mac = norm, trusted = trusted, alertOffline = alert))
                    }) { Text("Guardar") }
                    Spacer(Modifier.weight(1f))
                    TextButton(onClick = { confirmDelete = true }) { Text("Esquecer", color = Bad) }
                }
            }

            Text("Histórico", style = MaterialTheme.typography.titleMedium)
            val mine = events.filter { it.deviceId == id }
            if (mine.isEmpty()) Muted("Sem eventos.")
            mine.take(50).forEach { EventRow(it, false, null) }
            Spacer(Modifier.height(24.dp))
        }
    }

    if (confirmDelete) AlertDialog(
        onDismissRequest = { confirmDelete = false },
        title = { Text("Esquecer aparelho?") },
        text = { Text("O nome, notas e histórico são apagados. Se voltar a ligar-se, aparece como novo.") },
        confirmButton = { TextButton(onClick = { confirmDelete = false; vm.deleteDevice(id); onBack() }) { Text("Esquecer", color = Bad) } },
        dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text("Cancelar") } },
    )
}

@Composable
fun SwitchRow(label: String, checked: Boolean, onChange: (Boolean) -> Unit) {
    Row(Modifier.fillMaxWidth().clickable { onChange(!checked) }.padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(label, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyLarge)
        Switch(checked, onChange)
    }
}

@Composable
private fun TypePicker(value: DeviceType?, guessed: DeviceType, onChange: (DeviceType?) -> Unit) {
    var open by remember { mutableStateOf(false) }
    ExposedDropdownMenuBox(open, { open = it }) {
        OutlinedTextField(
            value = value?.let { "${it.icon} ${it.label}" } ?: "Automático (${guessed.label})",
            onValueChange = {}, readOnly = true, label = { Text("Tipo") },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(open) },
            modifier = Modifier.fillMaxWidth().menuAnchor(MenuAnchorType.PrimaryNotEditable),
        )
        ExposedDropdownMenu(open, { open = false }) {
            DropdownMenuItem(text = { Text("Automático (${guessed.label})") }, onClick = { onChange(null); open = false })
            DeviceType.entries.forEach { t ->
                DropdownMenuItem(text = { Text("${t.icon}  ${t.label}") }, onClick = { onChange(t); open = false })
            }
        }
    }
}

fun pingText(r: PingStats): String = buildString {
    r.results.forEachIndexed { i, v -> appendLine("#${i + 1}  ${v?.let { ms(it) } ?: "sem resposta"}") }
    append("\n${r.received}/${r.sent} respostas · ${r.loss}% perdidos")
    if (r.avg != null) append("\nmín ${ms(r.min)} · média ${ms(r.avg)} · máx ${ms(r.max)}")
}
