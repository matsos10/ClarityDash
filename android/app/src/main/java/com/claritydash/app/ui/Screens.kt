package com.claritydash.app.ui

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.claritydash.app.BuildConfigInfo
import com.claritydash.app.model.NetEvent
import com.claritydash.app.net.Ip
import com.claritydash.app.net.Tools
import kotlinx.coroutines.launch

// ------------------------------------------------------------------ Eventos

private val EVENT_FILTERS = listOf(
    null to "Todos", NetEvent.NEW to "Novos", NetEvent.ONLINE to "Online", NetEvent.OFFLINE to "Offline",
    NetEvent.IP_CHANGE to "Mudança de IP", NetEvent.WOL to "Wake-on-LAN", NetEvent.INFO to "Informação",
)

@Composable
fun EventsScreen(vm: AppViewModel, padding: PaddingValues, onOpen: (String) -> Unit) {
    val events by vm.events.collectAsStateWithLifecycle()
    var kind by rememberSaveable { mutableStateOf<String?>(null) }
    var confirm by remember { mutableStateOf(false) }
    val list = events.filter { kind == null || it.kind == kind }

    LazyColumn(contentPadding = PaddingValues(16.dp, padding.calculateTopPadding() + 8.dp, 16.dp, padding.calculateBottomPadding() + 16.dp)) {
        item {
            Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                EVENT_FILTERS.forEach { (k, label) -> FilterChip(kind == k, { kind = k }, label = { Text(label) }) }
            }
        }
        if (list.isEmpty()) item { Muted("Sem eventos.", Modifier.padding(vertical = 24.dp)) }
        items(list.take(500)) { e ->
            EventRow(e, false, e.deviceId?.let { id -> { onOpen(id) } })
            HorizontalDivider()
        }
        if (events.isNotEmpty()) item {
            TextButton(onClick = { confirm = true }, modifier = Modifier.padding(top = 8.dp)) { Text("Limpar histórico", color = Bad) }
        }
    }
    if (confirm) AlertDialog(
        onDismissRequest = { confirm = false },
        title = { Text("Apagar todo o histórico de eventos?") },
        confirmButton = { TextButton(onClick = { confirm = false; vm.clearEvents() }) { Text("Apagar", color = Bad) } },
        dismissButton = { TextButton(onClick = { confirm = false }) { Text("Cancelar") } },
    )
}

// ------------------------------------------------------------------ Ferramentas

@Composable
fun ToolsScreen(vm: AppViewModel, padding: PaddingValues) {
    val net by vm.net.collectAsStateWithLifecycle()
    val scope = rememberCoroutineScope()

    @Composable
    fun Tool(title: String, hint: String, button: String, fields: List<Pair<String, String>>, action: suspend (List<String>) -> String) {
        val values = remember { fields.map { mutableStateOf(it.second) } }
        var result by remember { mutableStateOf<String?>(null) }
        var busy by remember { mutableStateOf(false) }
        SectionCard(title) {
            Muted(hint)
            fields.forEachIndexed { i, (label, _) ->
                OutlinedTextField(values[i].value, { values[i].value = it }, Modifier.fillMaxWidth(), label = { Text(label) },
                    singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri))
            }
            Button(enabled = !busy, onClick = {
                busy = true
                scope.launch {
                    result = try { action(values.map { it.value.trim() }) } catch (e: Exception) { "Erro: ${e.message}" }
                    busy = false
                }
            }) { Text(if (busy) "A trabalhar…" else button) }
            result?.let { Mono(it) }
        }
    }

    LazyColumn(
        contentPadding = PaddingValues(16.dp, padding.calculateTopPadding() + 8.dp, 16.dp, padding.calculateBottomPadding() + 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Tool("Ping", "Testa se um aparelho ou site responde e mede a latência.", "Testar",
                listOf("Endereço" to (net.gateway ?: ""), "Pacotes" to "4")) { (host, count) ->
                require(Tools.validHost(host)) { "endereço inválido" }
                "$host\n\n" + pingText(Tools.ping(host, (count.toIntOrNull() ?: 4).coerceIn(1, 20)))
            }
        }
        item {
            Tool("DNS", "Resolve um nome e mede o tempo de resposta do DNS.", "Resolver", listOf("Nome" to "google.com")) { (name) ->
                val r = Tools.dns(name)
                r.error?.let { "Erro: $it" } ?: (r.addresses.joinToString("\n") + "\n\nResolvido em ${ms(r.ms)}")
            }
        }
        item {
            Tool("Portas abertas", "Vazio = portas comuns. Aceita listas e intervalos: 22,80,8000-8100.", "Analisar",
                listOf("Endereço" to "", "Portas (opcional)" to "")) { (host, ports) ->
                val open = Tools.portScan(host, Tools.parsePorts(ports))
                if (open.isEmpty()) "Nenhuma das portas analisadas está aberta."
                else open.joinToString("\n") { "${it.port.toString().padEnd(6)} ${it.service}" }
            }
        }
        item {
            Tool("Wake-on-LAN", "Liga à distância um computador que suporte Wake-on-LAN.", "Acordar",
                listOf("MAC" to "")) { (mac) -> "Pacote mágico enviado para ${vm.wake(mac)}." }
        }
        item {
            Tool("Calculadora de rede", "Mostra o intervalo de endereços de uma sub-rede.", "Calcular",
                listOf("Sub-rede" to (net.cidr ?: "192.168.1.0/24"))) { (cidr) ->
                val (n, prefix) = Ip.parseCidr(cidr) ?: throw IllegalArgumentException("sub-rede inválida")
                val count = if (prefix >= 31) 1L shl (32 - prefix) else (1L shl (32 - prefix)) - 2
                "Rede: $n\nBroadcast: ${Ip.broadcast(n)}\nEndereços utilizáveis: $count"
            }
        }
    }
}

// ------------------------------------------------------------------ Configurações

@Composable
fun SettingsScreen(vm: AppViewModel, padding: PaddingValues) {
    val s by vm.settings.collectAsStateWithLifecycle()
    val net by vm.net.collectAsStateWithLifecycle()
    var target by remember(s.latencyTarget) { mutableStateOf(s.latencyTarget) }
    var subnet by remember(s.subnet) { mutableStateOf(s.subnet) }

    LazyColumn(
        contentPadding = PaddingValues(16.dp, padding.calculateTopPadding() + 8.dp, 16.dp, padding.calculateBottomPadding() + 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            SectionCard("Monitorização automática") {
                SwitchRow("Analisar a rede em segundo plano", s.monitorEnabled) { v -> vm.updateSettings { it.copy(monitorEnabled = v) } }
                Muted("Só corre quando o telemóvel está no Wi-Fi de casa. O Android limita a frequência a no mínimo 15 minutos.")
                Text("Frequência")
                Choices(listOf(15, 30, 60, 180), s.intervalMinutes, { if (it < 60) "$it min" else "${it / 60} h" }) { v ->
                    vm.updateSettings { it.copy(intervalMinutes = v) }
                }
                Text("Considerar offline após")
                Choices(listOf(15, 30, 60, 120), s.offlineAfterMinutes, { if (it < 60) "$it min" else "${it / 60} h" }) { v ->
                    vm.updateSettings { it.copy(offlineAfterMinutes = v) }
                }
                Muted("Telemóveis em repouso deixam de responder por momentos; um valor maior evita falsos alertas.")
            }
        }
        item {
            SectionCard("Notificações") {
                SwitchRow("Avisar quando aparece um aparelho novo", s.notifyNew) { v -> vm.updateSettings { it.copy(notifyNew = v) } }
                SwitchRow("Avisar quando um aparelho marcado fica offline / volta", s.notifyOffline) { v ->
                    vm.updateSettings { it.copy(notifyOffline = v) }
                }
            }
        }
        item {
            SectionCard("Rede") {
                InfoRow("Rede de casa", s.homeNetwork.ifBlank { "ainda não definida" })
                InfoRow("Rede atual", net.signature ?: "sem Wi-Fi")
                if (net.signature != null && net.signature != s.homeNetwork) {
                    OutlinedButton(onClick = vm::useCurrentNetworkAsHome) { Text("Usar a rede atual como casa") }
                }
                OutlinedTextField(subnet, { subnet = it }, Modifier.fillMaxWidth(), singleLine = true,
                    label = { Text("Sub-rede a analisar") }, placeholder = { Text("automático (${net.cidr ?: "—"})") })
                OutlinedTextField(target, { target = it }, Modifier.fillMaxWidth(), singleLine = true,
                    label = { Text("Servidor para medir a latência à internet") })
                Button(onClick = {
                    val sub = subnet.trim()
                    when {
                        sub.isNotEmpty() && (Ip.parseCidr(sub)?.second ?: 0) < 22 ->
                            vm.say("Sub-rede inválida — usa o formato 192.168.1.0/24 (máximo /22).")
                        !Tools.validHost(target.trim()) -> vm.say("Servidor de latência inválido.")
                        else -> {
                            vm.updateSettings { it.copy(subnet = sub.let { x -> Ip.parseCidr(x)?.first ?: "" }, latencyTarget = target.trim()) }
                            vm.say("Guardado.")
                        }
                    }
                }) { Text("Guardar") }
            }
        }
        item {
            SectionCard("Sobre") {
                InfoRow("Versão", BuildConfigInfo.VERSION)
                Muted("Nas versões recentes do Android, as apps não conseguem ler o endereço MAC dos outros aparelhos; " +
                    "a identificação usa o IP e os nomes anunciados (mDNS, UPnP, NetBIOS, DNS).")
            }
        }
    }
}

@Composable
private fun Choices(options: List<Int>, selected: Int, label: (Int) -> String, onSelect: (Int) -> Unit) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
        options.forEach { o -> FilterChip(selected == o, { onSelect(o) }, label = { Text(label(o)) }) }
    }
    Spacer(Modifier.width(0.dp))
}
