package com.claritydash.app.ui

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

val Ok = Color(0xFF16A34A)
val Warn = Color(0xFFD97706)
val Bad = Color(0xFFDC2626)
val GatewayColor = Color(0xFF3B82F6)
val InternetColor = Color(0xFF14B8A6)

@Composable
fun ClarityTheme(content: @Composable () -> Unit) {
    val dark = isSystemInDarkTheme()
    val ctx = LocalContext.current
    val scheme = when {
        Build.VERSION.SDK_INT >= 31 -> if (dark) dynamicDarkColorScheme(ctx) else dynamicLightColorScheme(ctx)
        dark -> darkColorScheme(primary = Color(0xFF60A5FA), secondary = Color(0xFF2DD4BF))
        else -> lightColorScheme(primary = Color(0xFF2563EB), secondary = Color(0xFF0D9488))
    }
    MaterialTheme(colorScheme = scheme, content = content)
}
