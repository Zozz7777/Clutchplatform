package com.clutch.app.ui.screens.parts

import androidx.compose.foundation.Image
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
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.R
import com.clutch.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyPartsScreen() {
    var selectedCar by remember { mutableStateOf("DS 7 crossback 2020") }
    var currentMileage by remember { mutableStateOf("20,850 KM") }

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
                    contentDescription = "Clutch Logo",
                    modifier = Modifier.size(40.dp)
                )
                
                // Car Info
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Your Car",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.DirectionsCar,
                            contentDescription = "Car",
                            tint = ClutchRed,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = selectedCar,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = ClutchRed
                        )
                        Icon(
                            imageVector = Icons.Default.KeyboardArrowDown,
                            contentDescription = "Dropdown",
                            tint = ClutchRed,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    Text(
                        text = "OPERA",
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
                            text = currentMileage,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = "Edit",
                            tint = Color.Gray,
                            modifier = Modifier.size(16.dp)
                        )
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
                        text = "Parts Expiring Soon",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )
                    
                    PartItem(
                        partName = "Engine Oil",
                        status = "Expired 850 Km Ago",
                        isExpired = true
                    )
                    PartItem(
                        partName = "Spark Plugs",
                        status = "9,150 Km ~ Remaining"
                    )
                    PartItem(
                        partName = "Air Filter",
                        status = "4,150 Km ~ Remaining"
                    )
                    PartItem(
                        partName = "Brakes",
                        status = "29,150 Km ~ Remaining"
                    )
                    
                    Text(
                        text = "View All",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
        }
        
        item {
            // Parts List
            Text(
                text = "Parts",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                modifier = Modifier.padding(bottom = 8.dp)
            )
        }
        
        item {
            // Detailed Parts List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(getPartsList()) { part ->
                    PartDetailCard(part = part)
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(100.dp)) // Space for bottom navigation
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

@Composable
private fun PartDetailCard(part: PartDetail) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (part.isExpired) ClutchRed else Color.White
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Part Icon
            Icon(
                imageVector = part.icon,
                contentDescription = part.name,
                tint = if (part.isExpired) Color.White else Color.Black,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Part Info
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = part.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = if (part.isExpired) Color.White else Color.Black
                )
                Text(
                    text = part.status,
                    fontSize = 14.sp,
                    color = if (part.isExpired) Color.White else ClutchRed
                )
                if (part.averageExpiry.isNotEmpty()) {
                    Text(
                        text = part.averageExpiry,
                        fontSize = 12.sp,
                        color = if (part.isExpired) Color.White.copy(alpha = 0.8f) else Color.Gray
                    )
                }
            }
            
            // Edit Icon
            Icon(
                imageVector = Icons.Default.Edit,
                contentDescription = "Edit",
                tint = if (part.isExpired) Color.White else Color.Black,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

data class PartDetail(
    val name: String,
    val status: String,
    val averageExpiry: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val isExpired: Boolean = false
)

private fun getPartsList(): List<PartDetail> {
    return listOf(
        PartDetail(
            name = "Engine Oil",
            status = "Expired 850 Km Ago",
            averageExpiry = "Average Expiry Is 10,000",
            icon = Icons.Default.OilBarrel,
            isExpired = true
        ),
        PartDetail(
            name = "Brake Linings",
            status = "150 KM Remaining",
            averageExpiry = "Average Expiry Is 30,000 Km",
            icon = Icons.Default.Stop
        ),
        PartDetail(
            name = "Belts",
            status = "11,150 KM Remaining",
            averageExpiry = "Average Expiry Is 40,000 Km",
            icon = Icons.Default.Settings
        ),
        PartDetail(
            name = "Fuel Filter",
            status = "11,150 KM Remaining",
            averageExpiry = "Average Expiry Is 40,000 Km",
            icon = Icons.Default.FilterAlt
        ),
        PartDetail(
            name = "Water Pump",
            status = "39,150 KM Remaining",
            averageExpiry = "Average Expiry Is 60,000 Km",
            icon = Icons.Default.WaterDrop
        ),
        PartDetail(
            name = "Tires",
            status = "59,150 KM Remaining",
            averageExpiry = "Average Expiry Is 80,000 Km Or 2 Years",
            icon = Icons.Default.TireRepair
        )
    )
}
