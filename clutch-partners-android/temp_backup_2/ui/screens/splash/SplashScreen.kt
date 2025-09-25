package com.clutch.partners.ui.screens.splash

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.partners.R
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onNavigateToOnboarding: () -> Unit,
    onNavigateToDashboard: () -> Unit
) {
    var startAnimation by remember { mutableStateOf(false) }
    val alphaAnim = animateFloatAsState(
        targetValue = if (startAnimation) 1f else 0f,
        animationSpec = tween(2000),
        label = "alpha"
    )

    LaunchedEffect(key1 = true) {
        startAnimation = true
        delay(3000)
        // Check authentication status here
        // For now, navigate to onboarding
        onNavigateToOnboarding()
    }

    Splash(alpha = alphaAnim.value)
}

@Composable
fun Splash(alpha: Float) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.primary),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // App Icon
            Image(
                painter = painterResource(id = R.drawable.ic_launcher_foreground),
                contentDescription = "Clutch Partners Logo",
                modifier = Modifier
                    .size(120.dp)
                    .alpha(alpha)
            )
            
            // App Name
            Text(
                text = "Clutch Partners",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .padding(top = 24.dp)
                    .alpha(alpha)
            )
            
            // Subtitle
            Text(
                text = "Manage your business with ease",
                fontSize = 16.sp,
                color = Color.White.copy(alpha = 0.8f),
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .padding(top = 8.dp)
                    .alpha(alpha)
            )
        }
    }
}
