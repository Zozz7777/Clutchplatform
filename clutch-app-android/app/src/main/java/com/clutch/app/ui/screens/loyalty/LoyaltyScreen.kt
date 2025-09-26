package com.clutch.app.ui.screens.loyalty

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.components.ClutchLogoSmall
import com.clutch.app.ui.theme.ClutchRed

@Composable
fun LoyaltyScreen(
    onNavigateBack: () -> Unit
) {
    var currentPoints by remember { mutableStateOf(1250) }
    var currentTier by remember { mutableStateOf("Gold") }
    var pointsToNextTier by remember { mutableStateOf(250) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5))
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onNavigateBack) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = ClutchRed
                )
            }
            
            Text(
                text = "Loyalty Program",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = ClutchRed
            )
            
            ClutchLogoSmall(
                size = 32.dp,
                color = ClutchRed
            )
        }
        
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                // Points Balance Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Your Points Balance",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        Text(
                            text = "$currentPoints",
                            fontSize = 48.sp,
                            fontWeight = FontWeight.Bold,
                            color = ClutchRed
                        )
                        
                        Text(
                            text = "Clutch Points",
                            fontSize = 16.sp,
                            color = Color.Gray
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Tier Progress
                        Card(
                            colors = CardDefaults.cardColors(containerColor = ClutchRed.copy(alpha = 0.1f)),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "Current Tier: $currentTier",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ClutchRed
                                )
                                
                                Spacer(modifier = Modifier.height(8.dp))
                                
                                Text(
                                    text = "$pointsToNextTier points to next tier",
                                    fontSize = 14.sp,
                                    color = Color.Gray
                                )
                                
                                Spacer(modifier = Modifier.height(8.dp))
                                
                                LinearProgressIndicator(
                                    progress = 0.75f,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(8.dp),
                                    color = ClutchRed,
                                    trackColor = Color.LightGray
                                )
                            }
                        }
                    }
                }
            }
            
            item {
                // Badges Section
                Text(
                    text = "Your Badges",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(5) { index ->
                        BadgeCard(
                            badgeName = when (index) {
                                0 -> "First Order"
                                1 -> "10 Bookings"
                                2 -> "1000 Points"
                                3 -> "First Review"
                                else -> "Community Starter"
                            },
                            isUnlocked = index < 3
                        )
                    }
                }
            }
            
            item {
                // Rewards Section
                Text(
                    text = "Available Rewards",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(5) { index ->
                        RewardCard(
                            title = when (index) {
                                0 -> "10% Off Next Service"
                                1 -> "Free Oil Change"
                                2 -> "Premium Car Wash"
                                3 -> "Discount on Parts"
                                else -> "Free Inspection"
                            },
                            pointsRequired = 500 - (index * 100),
                            canRedeem = currentPoints >= (500 - (index * 100))
                        )
                    }
                }
            }
            
            item {
                // Recent Activity
                Text(
                    text = "Recent Activity",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(5) { index ->
                        ActivityItem(
                            action = when (index) {
                                0 -> "Earned 50 points for booking service"
                                1 -> "Earned 25 points for writing review"
                                2 -> "Earned 100 points for first order"
                                3 -> "Redeemed 200 points for discount"
                                else -> "Earned 30 points for sharing tip"
                            },
                            date = "2 days ago"
                        )
                    }
                }
            }
            
            item {
                Spacer(modifier = Modifier.height(100.dp))
            }
        }
    }
}

@Composable
private fun BadgeCard(
    badgeName: String,
    isUnlocked: Boolean
) {
    Card(
        modifier = Modifier.size(100.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isUnlocked) ClutchRed.copy(alpha = 0.1f) else Color.LightGray
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = if (isUnlocked) Icons.Default.EmojiEvents else Icons.Default.Lock,
                contentDescription = "Badge",
                tint = if (isUnlocked) ClutchRed else Color.Gray,
                modifier = Modifier.size(32.dp)
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = badgeName,
                fontSize = 10.sp,
                fontWeight = FontWeight.Medium,
                color = if (isUnlocked) Color.Black else Color.Gray,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
        }
    }
}

@Composable
private fun RewardCard(
    title: String,
    pointsRequired: Int,
    canRedeem: Boolean
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Black
                )
                Text(
                    text = "$pointsRequired points",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
            
            Button(
                onClick = { /* Redeem */ },
                enabled = canRedeem,
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (canRedeem) ClutchRed else Color.Gray
                ),
                shape = RoundedCornerShape(20.dp)
            ) {
                Text(
                    text = "Redeem",
                    color = Color.White,
                    fontSize = 12.sp
                )
            }
        }
    }
}

@Composable
private fun ActivityItem(
    action: String,
    date: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.History,
                contentDescription = "Activity",
                tint = ClutchRed,
                modifier = Modifier.size(20.dp)
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column {
                Text(
                    text = action,
                    fontSize = 14.sp,
                    color = Color.Black
                )
                Text(
                    text = date,
                    fontSize = 12.sp,
                    color = Color.Gray
                )
            }
        }
    }
}
