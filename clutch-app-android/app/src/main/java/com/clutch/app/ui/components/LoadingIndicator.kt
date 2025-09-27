package com.clutch.app.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.R
import com.clutch.app.ui.theme.ClutchRed

@Composable
fun LoadingIndicator(
    message: String = "Loading...",
    modifier: Modifier = Modifier
) {
    // Animation for rotation
    val infiniteTransition = rememberInfiniteTransition(label = "rotor_rotation")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )

    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Rotating rotor image
        Image(
            painter = painterResource(id = R.drawable.rotor_loading),
            contentDescription = "Loading",
            modifier = Modifier
                .size(80.dp)
                .rotate(rotation)
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Loading message
        Text(
            text = message,
            fontSize = 16.sp,
            fontWeight = FontWeight.Medium,
            color = ClutchRed,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun LoadingIndicatorOverlay(
    message: String = "Loading...",
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier.padding(32.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            shape = androidx.compose.foundation.shape.RoundedCornerShape(16.dp)
        ) {
            LoadingIndicator(
                message = message,
                modifier = Modifier.padding(32.dp)
            )
        }
    }
}

@Composable
fun CompactLoadingIndicator(
    modifier: Modifier = Modifier
) {
    // Animation for rotation
    val infiniteTransition = rememberInfiniteTransition(label = "rotor_rotation")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )

    Image(
        painter = painterResource(id = R.drawable.rotor_loading),
        contentDescription = "Loading",
        modifier = modifier
            .size(24.dp)
            .rotate(rotation)
    )
}
