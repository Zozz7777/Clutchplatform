package com.clutch.app.ui.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.theme.ClutchRed
import com.clutch.app.ui.components.ClutchLogoSmall

@Composable
fun DashboardScreen(
    onNavigateToCarHealth: () -> Unit,
    onNavigateToMaintenance: () -> Unit,
    onNavigateToBookService: () -> Unit,
    onNavigateToOrderParts: () -> Unit,
    onNavigateToCommunity: () -> Unit,
    onNavigateToLoyalty: () -> Unit,
    onNavigateToProfile: () -> Unit
) {
    var selectedCar by remember { mutableStateOf("DS 7 crossback 2020") }
    var carMileage by remember { mutableStateOf("20,850 KM") }
    var carHealthScore by remember { mutableStateOf(80) }
    
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5))
    ) {
        item {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                ClutchLogoSmall(
                    size = 32.dp,
                    color = ClutchRed
                )
                
                Text(
                    text = "Your Car",
                    fontSize = 16.sp,
                    color = Color.Gray
                )
                
                IconButton(onClick = { /* Settings */ }) {
                    Icon(
                        imageVector = Icons.Default.Notifications,
                        contentDescription = "Notifications",
                        tint = ClutchRed
                    )
                }
            }
        }
        
        item {
            // Car Selection
            Column(
                modifier = Modifier.padding(horizontal = 16.dp)
            ) {
                Text(
                    text = selectedCar,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = ClutchRed
                )
                
                Text(
                    text = "OPERA",
                    fontSize = 16.sp,
                    color = ClutchRed
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Mileage
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            color = Color.White,
                            shape = RoundedCornerShape(8.dp)
                        )
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = carMileage,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    
                    IconButton(onClick = { /* Edit mileage */ }) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = "Edit",
                            tint = Color.Gray
                        )
                    }
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
        
        item {
            // Quick Actions
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Find Mechanics Card
                QuickActionCard(
                    title = "Find Mechanics",
                    icon = Icons.Default.Build,
                    onClick = onNavigateToBookService,
                    modifier = Modifier.weight(1f)
                )
                
                // Shop Car Parts Card
                QuickActionCard(
                    title = "Shop Car Parts",
                    icon = Icons.Default.ShoppingCart,
                    onClick = onNavigateToOrderParts,
                    modifier = Modifier.weight(1f)
                )
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
        
        item {
            // Car Health Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            ) {
                // Car Health Score
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Circular Progress Indicator
                        Box(
                            modifier = Modifier.size(120.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(
                                progress = carHealthScore / 100f,
                                modifier = Modifier.size(120.dp),
                                color = ClutchRed,
                                strokeWidth = 8.dp,
                                trackColor = Color.LightGray
                            )
                            
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "$carHealthScore%",
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.Black
                                )
                                Text(
                                    text = "Your Car Health",
                                    fontSize = 14.sp,
                                    color = Color.Gray
                                )
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(20.dp))
                        
                        // Parts Status
                        Text(
                            text = "Parts Expiring Soon",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black,
                            modifier = Modifier.align(Alignment.Start)
                        )
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        // Parts List
                        PartStatusItem(
                            partName = "Engine Oil",
                            status = "Expired 850 Km Ago",
                            isExpired = true
                        )
                        
                        PartStatusItem(
                            partName = "Spark Plugs",
                            status = "9,150 Km ~ Remaining",
                            isExpired = false
                        )
                        
                        PartStatusItem(
                            partName = "Air Filter",
                            status = "4,150 Km ~ Remaining",
                            isExpired = false
                        )
                        
                        PartStatusItem(
                            partName = "Brakes",
                            status = "29,150 Km ~ Remaining",
                            isExpired = false
                        )
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        TextButton(
                            onClick = { /* View All */ },
                            modifier = Modifier.align(Alignment.End)
                        ) {
                            Text(
                                text = "View All",
                                color = ClutchRed,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(100.dp)) // Space for bottom navigation
        }
    }
}

@Composable
private fun QuickActionCard(
    title: String,
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        onClick = onClick,
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                modifier = Modifier.size(48.dp),
                tint = ClutchRed
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = title,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = ClutchRed,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
private fun PartStatusItem(
    partName: String,
    status: String,
    isExpired: Boolean
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
            fontSize = 14.sp,
            color = if (isExpired) ClutchRed else Color.Black
        )
        
        Text(
            text = status,
            fontSize = 12.sp,
            color = if (isExpired) ClutchRed else Color.Gray
        )
    }
}
