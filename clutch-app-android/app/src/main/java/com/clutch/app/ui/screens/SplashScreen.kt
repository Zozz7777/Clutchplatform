package com.clutch.app.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.R
import com.clutch.app.ui.theme.ClutchRed
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onNavigateToLogin: () -> Unit,
    onNavigateToDashboard: () -> Unit
) {
    var isVisible by remember { mutableStateOf(false) }
    var isLoggedIn by remember { mutableStateOf(false) }

    // Animation for fade in
    val alpha by animateFloatAsState(
        targetValue = if (isVisible) 1f else 0f,
        animationSpec = tween(1000),
        label = "alpha"
    )

    LaunchedEffect(Unit) {
        delay(100)
        isVisible = true

        // Check if user is logged in (this would be done through a repository/viewmodel)
        delay(2000)
        isLoggedIn = false // This should be checked from session manager

        delay(1000)
        if (isLoggedIn) {
            onNavigateToDashboard()
        } else {
            onNavigateToLogin()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ClutchRed), // Red background instead of black
        contentAlignment = Alignment.Center
    ) {
        // Logo inside the rotor circle - both centered
        Box(
            modifier = Modifier.size(380.dp),
            contentAlignment = Alignment.Center
        ) {
            // Animated Rotor - centered and 1.5x size
            AnimatedRotor()
            
            // White Clutch Logo inside the rotor circle
            Image(
                painter = painterResource(id = R.drawable.clutch_logo_white),
                contentDescription = "Clutch Logo",
                modifier = Modifier.size(120.dp)
            )
        }
        
        // Tagline below the logo
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Spacer(modifier = Modifier.height(200.dp)) // Space to position below rotor
            
        }
    }
}

@Composable
fun AnimatedRotor() {
    val infiniteTransition = rememberInfiniteTransition(label = "rotor")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )
    
    Image(
        painter = painterResource(id = R.drawable.rotor_clutch), // Using our rotor image
        contentDescription = "Loading Rotor",
        modifier = Modifier
            .size(380.dp) // Even bigger rotor size
            .graphicsLayer {
                rotationZ = rotation
            }
    )
}
