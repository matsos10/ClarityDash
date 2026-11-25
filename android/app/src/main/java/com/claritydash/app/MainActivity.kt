package com.claritydash.app

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import com.claritydash.app.ui.AppViewModel
import com.claritydash.app.ui.ClarityDashApp
import com.claritydash.app.ui.ClarityTheme

class MainActivity : ComponentActivity() {
    private val vm: AppViewModel by viewModels()
    private val askNotifications = registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        if (Build.VERSION.SDK_INT >= 33 && savedInstanceState == null) {
            askNotifications.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
        setContent { ClarityTheme { ClarityDashApp(vm) } }
    }

    override fun onResume() {
        super.onResume()
        vm.refreshNet()
    }
}
