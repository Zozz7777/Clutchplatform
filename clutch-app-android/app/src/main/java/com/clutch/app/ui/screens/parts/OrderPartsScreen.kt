package com.clutch.app.ui.screens.parts

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
fun OrderPartsScreen(
    onNavigateBack: () -> Unit
) {
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
                text = "Shop Car Parts",
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
                // Search Bar
                OutlinedTextField(
                    value = "",
                    onValueChange = { },
                    placeholder = { Text("Search For Parts") },
                    modifier = Modifier.fillMaxWidth(),
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = Color.Gray
                        )
                    },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = ClutchRed,
                        unfocusedBorderColor = Color.Gray
                    ),
                    shape = RoundedCornerShape(8.dp)
                )
            }
            
            item {
                // Categories
                Text(
                    text = "Categories",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(4) { index ->
                        CategoryCard(
                            title = when (index) {
                                0 -> "Spare Parts"
                                1 -> "Fluids"
                                2 -> "Lighting"
                                3 -> "Batteries"
                                else -> "Other"
                            },
                            onClick = { /* Navigate to category */ }
                        )
                    }
                }
            }
            
            item {
                // Best Selling Products
                Text(
                    text = "Best Selling Products For Your Car",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(10) { index ->
                        ProductCard(
                            name = when (index) {
                                0 -> "Engine Oil - Castrol Magnatec"
                                1 -> "Air Filter - Bosch"
                                2 -> "Spark Plugs - NGK"
                                3 -> "Brake Pads - Brembo"
                                4 -> "Battery - Varta"
                                5 -> "Headlight Bulb - Philips"
                                6 -> "Oil Filter - Mann"
                                7 -> "Timing Belt - Gates"
                                8 -> "Water Pump - Aisin"
                                else -> "Thermostat - Wahler"
                            },
                            price = "$${(20 + index * 5)}.00",
                            rating = 4.0f + (index % 3) * 0.5f,
                            reviewCount = 50 + index * 10
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
private fun CategoryCard(
    title: String,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.size(120.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = when (title) {
                    "Spare Parts" -> Icons.Default.Settings
                    "Fluids" -> Icons.Default.WaterDrop
                    "Lighting" -> Icons.Default.Lightbulb
                    "Batteries" -> Icons.Default.BatteryFull
                    else -> Icons.Default.Build
                },
                contentDescription = title,
                tint = ClutchRed,
                modifier = Modifier.size(32.dp)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = title,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
        }
    }
}

@Composable
private fun ProductCard(
    name: String,
    price: String,
    rating: Float,
    reviewCount: Int
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
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    repeat(5) { index ->
                        Icon(
                            imageVector = if (index < rating.toInt()) Icons.Default.Star else Icons.Default.StarBorder,
                            contentDescription = "Star",
                            tint = Color.Yellow,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "($reviewCount)",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                }
            }
            
            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = price,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = ClutchRed
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Button(
                    onClick = { /* Add to cart */ },
                    colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                    shape = RoundedCornerShape(20.dp)
                ) {
                    Text(
                        text = "Add",
                        color = Color.White,
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}
