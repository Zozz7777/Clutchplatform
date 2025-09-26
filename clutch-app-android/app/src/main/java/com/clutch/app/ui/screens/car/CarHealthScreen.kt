package com.clutch.app.ui.screens.car

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
fun CarHealthScreen() {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Car Health",
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
            // Overall Health Score Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Overall Health Score",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "85%",
                        fontSize = 48.sp,
                        fontWeight = FontWeight.Bold,
                        color = ClutchRed
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Good Condition",
                        fontSize = 16.sp,
                        color = Color.Gray
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Component Status",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    HealthComponentCard(
                        name = "Engine",
                        status = "Good",
                        score = 90,
                        icon = Icons.Default.Settings
                    )
                }
                item {
                    HealthComponentCard(
                        name = "Battery",
                        status = "Good",
                        score = 85,
                        icon = Icons.Default.BatteryFull
                    )
                }
                item {
                    HealthComponentCard(
                        name = "Tires",
                        status = "Fair",
                        score = 75,
                        icon = Icons.Default.TireRepair
                    )
                }
                item {
                    HealthComponentCard(
                        name = "Brakes",
                        status = "Good",
                        score = 88,
                        icon = Icons.Default.CarRepair
                    )
                }
                item {
                    HealthComponentCard(
                        name = "Fluids",
                        status = "Good",
                        score = 82,
                        icon = Icons.Default.WaterDrop
                    )
                }
            }
        }
    }
}

@Composable
fun HealthComponentCard(
    name: String,
    status: String,
    score: Int,
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
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = icon,
                    contentDescription = name,
                    tint = ClutchRed,
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(
                        text = name,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                    Text(
                        text = status,
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
            }
            Text(
                text = "$score%",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = ClutchRed
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun CarHealthScreenPreview() {
    ClutchAppTheme {
        CarHealthScreen()
    }
}
