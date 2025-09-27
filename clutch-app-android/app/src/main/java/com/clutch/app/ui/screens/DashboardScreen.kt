package com.clutch.app.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.R
import com.clutch.app.ui.theme.*
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalLayoutDirection
import com.clutch.app.utils.TranslationManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToCarHealth: () -> Unit = {},
    onNavigateToBookService: () -> Unit = {},
    onNavigateToOrderParts: () -> Unit = {},
    onNavigateToCommunity: () -> Unit = {},
    onNavigateToLoyalty: () -> Unit = {},
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val currentLanguage = TranslationManager.getCurrentLanguage()
    val layoutDirection = if (currentLanguage == "ar") LayoutDirection.Rtl else LayoutDirection.Ltr
    
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    val selectedCar = uiState.selectedCar
    val carHealth = uiState.carHealth
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5)),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            // Header with Clutch logo and car info
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Clutch Logo
                Image(
                    painter = painterResource(id = R.drawable.clutch_logo_red),
                    contentDescription = TranslationManager.getString(context, R.string.clutch_logo),
                    modifier = Modifier.size(40.dp)
                )
                
                // Car Info
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = TranslationManager.getString(context, R.string.your_car),
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.DirectionsCar,
                            contentDescription = TranslationManager.getString(context, R.string.car),
                            tint = ClutchRed,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = selectedCar?.let { "${it.brand} ${it.model} ${it.year}" } ?: TranslationManager.getString(context, R.string.no_car_selected),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = ClutchRed
                        )
                        Icon(
                            imageVector = Icons.Default.KeyboardArrowDown,
                            contentDescription = TranslationManager.getString(context, R.string.dropdown),
                            tint = ClutchRed,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    Text(
                        text = selectedCar?.trim ?: "",
                        fontSize = 14.sp,
                        color = ClutchRed
                    )
                }
                
                // Mileage
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "${selectedCar?.currentMileage ?: 0} KM",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = TranslationManager.getString(context, R.string.edit),
                            tint = Color.Gray,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
        
        item {
            // Quick Actions - Find Mechanics and Shop Car Parts
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    QuickActionCard(
                        title = TranslationManager.getString(context, R.string.book_service),
                        icon = Icons.Default.CalendarToday,
                        onClick = onNavigateToBookService
                    )
                }
                item {
                    QuickActionCard(
                        title = TranslationManager.getString(context, R.string.order_parts),
                        icon = Icons.Default.ShoppingCart,
                        onClick = onNavigateToOrderParts
                    )
                }
                item {
                    QuickActionCard(
                        title = TranslationManager.getString(context, R.string.car_health),
                        icon = Icons.Default.MonitorHeart,
                        onClick = onNavigateToCarHealth
                    )
                }
                item {
                    QuickActionCard(
                        title = TranslationManager.getString(context, R.string.community),
                        icon = Icons.Default.People,
                        onClick = onNavigateToCommunity
                    )
                }
                item {
                    QuickActionCard(
                        title = TranslationManager.getString(context, R.string.loyalty),
                        icon = Icons.Default.EmojiEvents,
                        onClick = onNavigateToLoyalty
                    )
                }
            }
        }
        
        item {
            // Car Health Meter - Circular Progress
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                onClick = onNavigateToCarHealth
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Circular Progress Bar
                    Box(
                        modifier = Modifier.size(120.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        // Background circle
                        androidx.compose.foundation.Canvas(
                            modifier = Modifier.fillMaxSize()
                        ) {
                            drawCircle(
                                color = Color.LightGray,
                                radius = size.minDimension / 2 - 10.dp.toPx(),
                                style = Stroke(width = 8.dp.toPx(), cap = StrokeCap.Round)
                            )
                            
                            // Progress circle (real health score)
                            val healthScore = carHealth?.overallScore ?: 0
                            val sweepAngle = (healthScore / 100f) * 360f
                            drawArc(
                                color = ClutchRed,
                                startAngle = -90f,
                                sweepAngle = sweepAngle,
                                useCenter = false,
                                style = Stroke(width = 8.dp.toPx(), cap = StrokeCap.Round)
                            )
                        }
                        
                        // Center text
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "${carHealth?.overallScore ?: 0}%",
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.Black
                            )
                            Text(
                                text = TranslationManager.getString(context, R.string.your_car_health),
                                fontSize = 12.sp,
                                color = Color.Gray
                            )
                        }
                    }
                }
            }
        }
        
        item {
            // Parts Expiring Soon
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = TranslationManager.getString(context, R.string.parts_expiring_soon),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )
                    
                    // For now, show placeholder parts data until we implement maintenance reminders API
                    PartItem(
                        partName = TranslationManager.getString(context, R.string.engine_oil),
                        status = "Expired 850 Km Ago", // TODO: Use formatted string
                        isExpired = true
                    )
                    PartItem(
                        partName = TranslationManager.getString(context, R.string.spark_plugs),
                        status = "9,150 Km ~ Remaining" // TODO: Use formatted string
                    )
                    PartItem(
                        partName = TranslationManager.getString(context, R.string.air_filter),
                        status = "4,150 Km ~ Remaining" // TODO: Use formatted string
                    )
                    PartItem(
                        partName = TranslationManager.getString(context, R.string.brakes),
                        status = "29,150 Km ~ Remaining" // TODO: Use formatted string
                    )
                    
                    Text(
                        text = TranslationManager.getString(context, R.string.view_all),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(100.dp)) // Space for bottom navigation
        }
    }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuickActionCard(
    title: String,
    icon: ImageVector,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.size(160.dp, 120.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = ClutchRed,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = title,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.Black,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
private fun PartItem(
    partName: String,
    status: String,
    isExpired: Boolean = false
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = partName,
            fontSize = 16.sp,
            color = if (isExpired) ClutchRed else Color.Black
        )
        Text(
            text = status,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = if (isExpired) ClutchRed else Color.Black
        )
    }
}