package com.claritydash.app

import android.app.Application
import com.claritydash.app.data.Monitor
import com.claritydash.app.data.Notifier

class ClarityApp : Application() {
    override fun onCreate() {
        super.onCreate()
        Notifier.createChannel(this)
        Monitor.schedule(this)
    }
}
