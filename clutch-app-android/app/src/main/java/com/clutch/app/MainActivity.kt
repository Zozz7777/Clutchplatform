package com.clutch.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.clutch.app.ui.components.BottomNavigation
import com.clutch.app.ui.navigation.ClutchNavigation
import com.clutch.app.ui.theme.ClutchAppTheme
import com.clutch.app.utils.SessionManager
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    @Inject
    lateinit var sessionManager: SessionManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        setContent {
            ClutchAppTheme {
                val navController = rememberNavController()
                var currentRoute by remember { mutableStateOf("dashboard") }
                
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        if (sessionManager.isLoggedIn()) {
                            BottomNavigation(
                                selectedRoute = currentRoute,
                                onNavigate = { route ->
                                    currentRoute = route
                                    navController.navigate(route)
                                }
                            )
                        }
                    }
                ) { innerPadding ->
                    ClutchNavigation(
                        modifier = Modifier.padding(innerPadding),
                        navController = navController,
                        sessionManager = sessionManager
                    )
                }
            }
        }
    }
}
