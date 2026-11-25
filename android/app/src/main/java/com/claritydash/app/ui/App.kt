@file:OptIn(ExperimentalMaterial3Api::class)

package com.claritydash.app.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle

enum class Tab(val label: String, val icon: ImageVector) {
    DASHBOARD("Painel", Icons.Filled.Home),
    DEVICES("Aparelhos", Icons.AutoMirrored.Filled.List),
    EVENTS("Eventos", Icons.Filled.Notifications),
    TOOLS("Ferramentas", Icons.Filled.Build),
    SETTINGS("Definições", Icons.Filled.Settings),
}

@Composable
fun ClarityDashApp(vm: AppViewModel) {
    var tab by rememberSaveable { mutableStateOf(Tab.DASHBOARD) }
    var openId by rememberSaveable { mutableStateOf<String?>(null) }
    val scanning by vm.scanning.collectAsStateWithLifecycle()
    val message by vm.message.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }

    LaunchedEffect(message) {
        message?.let { snackbar.showSnackbar(it); vm.messageShown() }
    }

    val id = openId
    if (id != null) {
        BackHandler { openId = null }
        androidx.compose.foundation.layout.Box {
            DeviceDetail(vm, id) { openId = null }
            SnackbarHost(snackbar, Modifier.align(androidx.compose.ui.Alignment.BottomCenter).padding(16.dp))
        }
        return
    }
    BackHandler(enabled = tab != Tab.DASHBOARD) { tab = Tab.DASHBOARD }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (tab == Tab.DASHBOARD) "ClarityDash" else tab.label) },
                actions = {
                    if (scanning) CircularProgressIndicator(Modifier.padding(12.dp).size(24.dp), strokeWidth = 2.5.dp)
                    else IconButton(onClick = vm::scan) { Icon(Icons.Filled.Refresh, "Analisar a rede") }
                },
            )
        },
        bottomBar = {
            NavigationBar {
                Tab.entries.forEach { t ->
                    NavigationBarItem(
                        selected = tab == t, onClick = { tab = t; vm.refreshNet() },
                        icon = { Icon(t.icon, null) }, label = { Text(t.label, maxLines = 1) },
                    )
                }
            }
        },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        when (tab) {
            Tab.DASHBOARD -> DashboardScreen(vm, padding, { openId = it }, { tab = it })
            Tab.DEVICES -> DevicesScreen(vm, padding) { openId = it }
            Tab.EVENTS -> EventsScreen(vm, padding) { openId = it }
            Tab.TOOLS -> ToolsScreen(vm, padding)
            Tab.SETTINGS -> SettingsScreen(vm, padding)
        }
    }
}
