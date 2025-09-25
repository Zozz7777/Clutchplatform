package com.clutch.partners

import android.app.Application
import android.util.Log
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class ClutchPartnersApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        Log.d("ClutchPartnersApp", "ClutchPartnersApplication started")
    }
}
