package com.claritydash.app.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.background
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.claritydash.app.model.LatencyPoint

@Composable
fun DashboardScreen(vm: AppViewModel, padding: PaddingValues, onOpen: (String) -> Unit, onGoto: (Tab) -> Unit) {
    val devices by vm.devices.collectAsStateWithLifecycle()
    val events by vm.events.collectAsStateWithLifecycle()
    val latency by vm.latency.collectAsStateWithLifecycle()
    val net by vm.net.collectAsStateWithLifecycle()
    val settings by vm.settings.collectAsStateWithLifecycle()
    val scanning by vm.scanning.collectAsStateWithLifecycle()
    val progress by vm.progress.collectAsStateWithLifecycle()
    val publicIp by vm.publicIp.collectAsStateWithLifecycle()

    val online = devices.count { it.online }
    val untrusted = devices.filter { !it.trusted }
    val last = latency.lastOrNull()

    LazyColumn(
        contentPadding = PaddingValues(16.dp, padding.calculateTopPadding() + 8.dp, 16.dp, padding.calculateBottomPadding() + 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        if (!net.onLocalNetwork) item {
            Notice("Sem Wi-Fi", "Liga o telemóvel ao Wi-Fi de casa para ver e analisar os aparelhos da rede.")
        } else if (settings.homeNetwork.isNotBlank() && net.signature != settings.homeNetwork) item {
            Notice("Outra rede", "Estás ligado a ${net.signature}, mas a rede de casa guardada é ${settings.homeNetwork}.") {
                Button(onClick = vm::useCurrentNetworkAsHome) { Text("Usar esta rede como casa") }
            }
        }
        if (scanning) item {
            SectionCard("A analisar a rede…") {
                LinearProgressIndicator(progress = { progress }, modifier = Modifier.fillMaxWidth())
                Muted("A procurar aparelhos em ${net.cidr ?: "—"}")
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatCard("Aparelhos online", "$online", "de ${devices.size} conhecidos", Modifier.weight(1f))
                StatCard("Por confirmar", "${untrusted.size}", "aparelhos desconhecidos", Modifier.weight(1f),
                    if (untrusted.isNotEmpty()) Warn else Color.Unspecified)
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatCard("Latência ao router", ms(last?.gateway), net.gateway ?: "—", Modifier.weight(1f), latencyColor(last?.gateway))
                StatCard("Latência à internet", ms(last?.internet), settings.latencyTarget, Modifier.weight(1f), latencyColor(last?.internet))
            }
        }
        item {
            SectionCard("Latência (24 h)", action = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Legend(GatewayColor, "Router"); Spacer(Modifier.width(10.dp)); Legend(InternetColor, "Internet")
                }
            }) { LatencyChart(latency) }
        }
        item {
            SectionCard("A minha rede") {
                InfoRow("IP do telemóvel", net.localIp ?: "—")
                InfoRow("Router", net.gateway ?: "—")
                InfoRow("Rede", net.cidr ?: "—")
                InfoRow("DNS", net.dns.joinToString(", ").ifBlank { "—" })
                InfoRow("Última análise", last?.let { "${dateTime(it.ts)} (${ago(it.ts)})" } ?: "ainda não feita")
                InfoRow("IP público", publicIp ?: "—")
                if (publicIp == null) TextButton(onClick = { vm.fetchPublicIp() }) { Text("Ver IP público") }
            }
        }
        if (untrusted.isNotEmpty()) item {
            SectionCard("Por confirmar", action = { TextButton(onClick = { vm.trustAll() }) { Text("Confirmar todos") } }) {
                untrusted.forEach { d ->
                    Row(Modifier.fillMaxWidth().clickable { onOpen(d.id) }.padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically) {
                        Text(d.effectiveType.icon, modifier = Modifier.width(30.dp))
                        androidx.compose.foundation.layout.Column(Modifier.weight(1f)) {
                            Text(d.label)
                            Muted(listOfNotNull(d.ip, d.vendor ?: d.model).joinToString(" · "))
                        }
                        Muted(ago(d.firstSeen))
                    }
                }
            }
        }
        item {
            SectionCard("Atividade recente", action = { TextButton(onClick = { onGoto(Tab.EVENTS) }) { Text("Ver tudo") } }) {
                if (events.isEmpty()) Muted("Sem eventos.")
                events.take(6).forEach { e -> EventRow(e, true, e.deviceId?.let { id -> { onOpen(id) } }) }
            }
        }
    }
}

private fun latencyColor(v: Double?) = when {
    v == null -> Bad
    v > 100 -> Warn
    else -> Ok
}

@Composable
private fun Legend(color: Color, text: String) {
    Box(Modifier.size(9.dp).clip(CircleShape).background(color))
    Spacer(Modifier.width(4.dp))
    Muted(text)
}

@Composable
fun Notice(title: String, text: String, action: (@Composable () -> Unit)? = null) {
    Card(colors = CardDefaults.cardColors(containerColor = Warn.copy(alpha = 0.12f)), modifier = Modifier.fillMaxWidth()) {
        androidx.compose.foundation.layout.Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(title, style = MaterialTheme.typography.titleSmall)
            Text(text, style = MaterialTheme.typography.bodyMedium)
            action?.invoke()
        }
    }
}

@Composable
private fun LatencyChart(all: List<LatencyPoint>) {
    val now = System.currentTimeMillis()
    val from = now - 86_400_000L
    val points = all.filter { it.ts >= from }
    if (points.isEmpty()) {
        Muted("Ainda sem medições. Cada análise da rede (manual ou automática) acrescenta um ponto.")
        return
    }
    val values = points.flatMap { listOfNotNull(it.gateway, it.internet) }.sorted()
    val p95 = values.getOrNull((values.size * 0.95).toInt().coerceAtMost(values.size - 1)) ?: 10.0
    val max = maxOf(10.0, Math.ceil(p95 * 1.25 / 10) * 10)
    val gridColor = MaterialTheme.colorScheme.outlineVariant

    Canvas(Modifier.fillMaxWidth().height(140.dp)) {
        val w = size.width; val h = size.height
        fun x(ts: Long) = ((ts - from).toFloat() / 86_400_000f) * w
        fun y(v: Double) = h - (minOf(v, max) / max).toFloat() * h
        listOf(0f, 0.5f, 1f).forEach { f ->
            drawLine(gridColor, Offset(0f, h * f), Offset(w, h * f), 1f,
                pathEffect = if (f == 1f) null else PathEffect.dashPathEffect(floatArrayOf(6f, 6f)))
        }
        for ((color, pick) in listOf(GatewayColor to { p: LatencyPoint -> p.gateway }, InternetColor to { p: LatencyPoint -> p.internet })) {
            var prev: LatencyPoint? = null
            for (p in points) {
                val v = pick(p)
                if (v == null) {
                    if (color == InternetColor) drawCircle(Bad, 3f, Offset(x(p.ts), h - 3f))
                    prev = null; continue
                }
                val pv = prev?.let(pick)
                if (prev != null && pv != null && p.ts - prev.ts < 3 * 3_600_000L) {
                    drawLine(color, Offset(x(prev.ts), y(pv)), Offset(x(p.ts), y(v)), 4f)
                } else {
                    drawCircle(color, 4f, Offset(x(p.ts), y(v)))
                }
                prev = p
            }
        }
    }
    Row(Modifier.fillMaxWidth()) {
        Muted("há 24 h", Modifier.weight(1f)); Muted("escala: 0–${max.toInt()} ms", Modifier.weight(1f)); Muted("agora")
    }
    val gw = points.mapNotNull { it.gateway }; val inet = points.mapNotNull { it.internet }
    Muted(
        "Router: média ${ms(gw.takeIf { it.isNotEmpty() }?.average())} · Internet: média ${ms(inet.takeIf { it.isNotEmpty() }?.average())}, " +
            "${100 * points.count { it.internet == null } / points.size}% sem resposta"
    )
}
