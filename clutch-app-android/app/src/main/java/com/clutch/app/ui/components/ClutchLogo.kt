package com.clutch.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.center
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.clipPath
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.*

@Composable
fun ClutchLogo(
    modifier: Modifier = Modifier,
    size: Dp = 120.dp,
    showText: Boolean = true,
    textColor: Color = Color.White,
    segmentColor: Color = Color.White,
    backgroundColor: Color = Color.Transparent
) {
    Box(
        modifier = modifier.size(size),
        contentAlignment = Alignment.Center
    ) {
        // Background circle (optional)
        if (backgroundColor != Color.Transparent) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                drawCircle(
                    color = backgroundColor,
                    radius = size.toPx() / 2
                )
            }
        }
        
        // Segmented C Logo
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawSegmentedC(
                size = size.toPx(),
                segmentColor = segmentColor
            )
        }
        
        // CLUTCH Text
        if (showText) {
            androidx.compose.material3.Text(
                text = "CLUTCH",
                style = TextStyle(
                    fontSize = (size.value * 0.15).sp,
                    fontWeight = FontWeight.Bold,
                    color = textColor
                ),
                textAlign = TextAlign.Center,
                modifier = Modifier.align(Alignment.Center)
            )
        }
    }
}

private fun DrawScope.drawSegmentedC(
    size: Float,
    segmentColor: Color
) {
    val center = Offset(size / 2, size / 2)
    val radius = size * 0.4f
    val innerRadius = size * 0.25f
    val segmentCount = 14
    val segmentAngle = 270f / segmentCount // 270 degrees for C shape
    val startAngle = 135f // Start from top-left
    
    // Create segments
    for (i in 0 until segmentCount) {
        val currentAngle = startAngle + (i * segmentAngle)
        val nextAngle = startAngle + ((i + 1) * segmentAngle)
        
        val path = Path().apply {
            // Outer arc
            arcTo(
                rect = androidx.compose.ui.geometry.Rect(
                    center.x - radius,
                    center.y - radius,
                    center.x + radius,
                    center.y + radius
                ),
                startAngleDegrees = currentAngle,
                sweepAngleDegrees = segmentAngle,
                forceMoveTo = true
            )
            
            // Line to inner radius
            lineTo(
                center.x + innerRadius * cos(Math.toRadians(nextAngle.toDouble())).toFloat(),
                center.y + innerRadius * sin(Math.toRadians(nextAngle.toDouble())).toFloat()
            )
            
            // Inner arc (reverse direction)
            arcTo(
                rect = androidx.compose.ui.geometry.Rect(
                    center.x - innerRadius,
                    center.y - innerRadius,
                    center.x + innerRadius,
                    center.y + innerRadius
                ),
                startAngleDegrees = nextAngle,
                sweepAngleDegrees = -segmentAngle,
                forceMoveTo = false
            )
            
            // Close path
            close()
        }
        
        drawPath(
            path = path,
            color = segmentColor,
            style = Stroke(width = 2.dp.toPx())
        )
    }
}

@Composable
fun ClutchLogoSmall(
    modifier: Modifier = Modifier,
    size: Dp = 32.dp,
    color: Color = MaterialTheme.colorScheme.primary
) {
    ClutchLogo(
        modifier = modifier,
        size = size,
        showText = false,
        segmentColor = color,
        backgroundColor = Color.Transparent
    )
}

@Composable
fun ClutchLogoWithText(
    modifier: Modifier = Modifier,
    size: Dp = 120.dp,
    textColor: Color = Color.White,
    segmentColor: Color = Color.White,
    backgroundColor: Color = Color.Transparent
) {
    ClutchLogo(
        modifier = modifier,
        size = size,
        showText = true,
        textColor = textColor,
        segmentColor = segmentColor,
        backgroundColor = backgroundColor
    )
}
