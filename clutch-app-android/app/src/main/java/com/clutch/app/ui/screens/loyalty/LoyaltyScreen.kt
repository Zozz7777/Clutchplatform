package com.clutch.app.ui.screens.loyalty

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.theme.ClutchAppTheme
import com.clutch.app.ui.theme.ClutchRed

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoyaltyScreen() {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Loyalty & Rewards",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = ClutchRed
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFFF0F2F5))
                .padding(16.dp)
        ) {
            // Points Balance Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = ClutchRed),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.EmojiEvents,
                        contentDescription = "Points",
                        tint = Color.White,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Your Points",
                        fontSize = 18.sp,
                        color = Color.White
                    )
                    Text(
                        text = "1,250",
                        fontSize = 36.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Available for redemption",
                        fontSize = 14.sp,
                        color = Color.White.copy(alpha = 0.8f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Badges Section
            Text(
                text = "Your Badges",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    BadgeCard(
                        name = "First Order",
                        description = "Completed your first order",
                        isUnlocked = true,
                        icon = Icons.Default.ShoppingCart
                    )
                }
                item {
                    BadgeCard(
                        name = "10 Bookings",
                        description = "Booked 10 services",
                        isUnlocked = true,
                        icon = Icons.Default.CalendarToday
                    )
                }
                item {
                    BadgeCard(
                        name = "1000 Points",
                        description = "Earned 1000 points",
                        isUnlocked = true,
                        icon = Icons.Default.EmojiEvents
                    )
                }
                item {
                    BadgeCard(
                        name = "First Review",
                        description = "Left your first review",
                        isUnlocked = false,
                        icon = Icons.Default.Star
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Rewards Section
            Text(
                text = "Available Rewards",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    RewardCard(
                        name = "10% Off Next Service",
                        description = "Get 10% discount on your next service booking",
                        pointsRequired = 500,
                        icon = Icons.Default.LocalOffer
                    )
                }
                item {
                    RewardCard(
                        name = "Free Oil Change",
                        description = "Complimentary oil change service",
                        pointsRequired = 1000,
                        icon = Icons.Default.OilBarrel
                    )
                }
                item {
                    RewardCard(
                        name = "Premium Car Wash",
                        description = "Free premium car wash service",
                        pointsRequired = 300,
                        icon = Icons.Default.CarRental
                    )
                }
            }
        }
    }
}

@Composable
fun BadgeCard(
    name: String,
    description: String,
    isUnlocked: Boolean,
    icon: androidx.compose.ui.graphics.vector.ImageVector
) {
    Card(
        modifier = Modifier.width(140.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isUnlocked) Color.White else Color.Gray.copy(alpha = 0.3f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = name,
                tint = if (isUnlocked) ClutchRed else Color.Gray,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = name,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = if (isUnlocked) Color.Black else Color.Gray,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
            Text(
                text = description,
                fontSize = 12.sp,
                color = if (isUnlocked) Color.Gray else Color.Gray.copy(alpha = 0.7f),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
        }
    }
}

@Composable
fun RewardCard(
    name: String,
    description: String,
    pointsRequired: Int,
    icon: androidx.compose.ui.graphics.vector.ImageVector
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = name,
                tint = ClutchRed,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black
                )
                Text(
                    text = description,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "$pointsRequired pts",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = ClutchRed
                )
                Button(
                    onClick = { /* TODO: Redeem reward */ },
                    colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Redeem", color = Color.White, fontSize = 12.sp)
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun LoyaltyScreenPreview() {
    ClutchAppTheme {
        LoyaltyScreen()
    }
}
