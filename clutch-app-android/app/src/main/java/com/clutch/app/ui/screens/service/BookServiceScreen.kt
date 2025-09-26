package com.clutch.app.ui.screens.service

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
fun BookServiceScreen(
    onNavigateBack: () -> Unit
) {
    var selectedDate by remember { mutableStateOf("Today") }
    var selectedTime by remember { mutableStateOf("") }
    
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
                text = "Book Service",
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
                // Service Center Card
                ServiceCenterCard(
                    name = "El Mikaneeky - ElNozha",
                    location = "Service Center Nasr City - Cairo",
                    rating = 4.0f,
                    reviewCount = 520,
                    services = listOf("Mechanical", "Electricity", "Suspensions", "Car Denting", "Paints", "Brakes", "Lubricants"),
                    availability = "Available Today: From 9:00 AM To 10:00 PM"
                )
            }
            
            item {
                // Date Selection
                Text(
                    text = "Select Date",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(7) { index ->
                        DateChip(
                            date = when (index) {
                                0 -> "Today"
                                1 -> "Tomorrow"
                                2 -> "Fri 22/03"
                                3 -> "Sat 23/03"
                                4 -> "Sun 24/03"
                                5 -> "Mon 25/03"
                                else -> "Tue 26/03"
                            },
                            isSelected = selectedDate == when (index) {
                                0 -> "Today"
                                1 -> "Tomorrow"
                                2 -> "Fri 22/03"
                                3 -> "Sat 23/03"
                                4 -> "Sun 24/03"
                                5 -> "Mon 25/03"
                                else -> "Tue 26/03"
                            },
                            onClick = { selectedDate = when (index) {
                                0 -> "Today"
                                1 -> "Tomorrow"
                                2 -> "Fri 22/03"
                                3 -> "Sat 23/03"
                                4 -> "Sun 24/03"
                                5 -> "Mon 25/03"
                                else -> "Tue 26/03"
                            } }
                        )
                    }
                }
            }
            
            item {
                // Time Slots
                Text(
                    text = "Available Time Slots",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(8) { index ->
                        TimeSlotChip(
                            time = "09:00 AM",
                            isSelected = selectedTime == "09:00 AM",
                            onClick = { selectedTime = "09:00 AM" }
                        )
                    }
                }
            }
            
            item {
                // Book Button
                Button(
                    onClick = { /* Book service */ },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                    shape = RoundedCornerShape(8.dp),
                    enabled = selectedTime.isNotEmpty()
                ) {
                    Text(
                        text = "Book Now",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }
            }
            
            item {
                Spacer(modifier = Modifier.height(100.dp))
            }
        }
    }
}

@Composable
private fun ServiceCenterCard(
    name: String,
    location: String,
    rating: Float,
    reviewCount: Int,
    services: List<String>,
    availability: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = name,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    Text(
                        text = location,
                        fontSize = 14.sp,
                        color = ClutchRed
                    )
                }
                
                Column(
                    horizontalAlignment = Alignment.End
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        repeat(5) { index ->
                            Icon(
                                imageVector = if (index < rating.toInt()) Icons.Default.Star else Icons.Default.StarBorder,
                                contentDescription = "Star",
                                tint = Color.Yellow,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                        Text(
                            text = "($reviewCount)",
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = "Provided Services",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = ClutchRed
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = services.joinToString(" • "),
                fontSize = 12.sp,
                color = Color.Black
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = availability,
                fontSize = 12.sp,
                color = Color.Black
            )
        }
    }
}

@Composable
private fun DateChip(
    date: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) ClutchRed else Color.White
        ),
        shape = RoundedCornerShape(8.dp)
    ) {
        Text(
            text = date,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
            color = if (isSelected) Color.White else Color.Black,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
        )
    }
}

@Composable
private fun TimeSlotChip(
    time: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) ClutchRed else Color.White
        ),
        shape = RoundedCornerShape(8.dp)
    ) {
        Text(
            text = time,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            color = if (isSelected) Color.White else Color.Black,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
        )
    }
}
