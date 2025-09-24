package com.clutch.partners

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.ui.Modifier
import com.clutch.partners.navigation.ClutchPartnersNavigation
import com.clutch.partners.ui.theme.ClutchPartnersTheme
import org.koin.android.ext.android.inject

class MainActivity : ComponentActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        setContent {
            ClutchPartnersTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    ClutchPartnersNavigation(
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}
