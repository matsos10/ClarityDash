package com.claritydash.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.claritydash.app.model.NetEvent
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

fun ago(ts: Long): String {
    if (ts <= 0) return "—"
    val s = (System.currentTimeMillis() - ts) / 1000
    return when {
        s < 60 -> "agora"
        s < 3600 -> "há ${s / 60} min"
        s < 86400 -> "há ${s / 3600} h"
        s < 172800 -> "ontem"
        else -> "há ${s / 86400} dias"
    }
}

fun dateTime(ts: Long): String =
    if (ts <= 0) "—" else SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()).format(Date(ts))

fun ms(v: Double?): String = when {
    v == null -> "—"
    v < 10 -> String.format(Locale.US, "%.1f ms", v)
    else -> "${v.toInt()} ms"
}

@Composable
fun SectionCard(
    title: String? = null,
    modifier: Modifier = Modifier,
    action: (@Composable () -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    Card(modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            if (title != null || action != null) {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Text(title ?: "", style = MaterialTheme.typography.titleMedium, modifier = Modifier.weight(1f))
                    action?.invoke()
                }
            }
            content()
        }
    }
}

@Composable
fun StatCard(label: String, value: String, sub: String, modifier: Modifier = Modifier, color: Color = Color.Unspecified) {
    Card(modifier, colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow)) {
        Column(Modifier.padding(14.dp)) {
            Text(label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, fontSize = 24.sp, fontWeight = FontWeight.SemiBold, color = color, maxLines = 1)
            Text(sub, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
    }
}

@Composable
fun StatusDot(online: Boolean, size: Int = 10) {
    Box(
        Modifier.size(size.dp).clip(CircleShape)
            .background(if (online) Ok else MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
    )
}

@Composable
fun InfoRow(label: String, value: String) {
    Row(Modifier.fillMaxWidth().padding(vertical = 2.dp)) {
        Text(label, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.width(130.dp),
            style = MaterialTheme.typography.bodyMedium)
        Text(value, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
    }
}

@Composable
fun Muted(text: String, modifier: Modifier = Modifier) {
    Text(text, modifier = modifier, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
}

@Composable
fun Badge(text: String, color: Color = Warn) {
    Surface(shape = RoundedCornerShape(50), color = color.copy(alpha = 0.14f)) {
        Text(text, color = color, fontSize = 11.sp, modifier = Modifier.padding(horizontal = 7.dp, vertical = 1.dp))
    }
}

@Composable
fun Mono(text: String) {
    Surface(shape = RoundedCornerShape(8.dp), color = MaterialTheme.colorScheme.surfaceContainerHighest,
        modifier = Modifier.fillMaxWidth()) {
        Text(text, fontFamily = FontFamily.Monospace, fontSize = 13.sp, modifier = Modifier.padding(12.dp))
    }
}

@Composable
fun EventRow(e: NetEvent, compact: Boolean, onClick: (() -> Unit)?) {
    Row(
        Modifier.fillMaxWidth().then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(vertical = 6.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Text(NetEvent.ICONS[e.kind] ?: "•", modifier = Modifier.width(28.dp))
        Text(e.message, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
        Spacer(Modifier.width(8.dp))
        Muted(if (compact) ago(e.ts) else dateTime(e.ts))
    }
}
