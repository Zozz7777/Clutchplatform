package com.clutch.app.ui.screens.service

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
fun BookServiceScreen() {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Book Service",
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
            // Service Categories
            Text(
                text = "Service Categories",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    ServiceCategoryCard(
                        name = "Oil Change",
                        description = "Regular oil change service",
                        price = "50 AED",
                        icon = Icons.Default.OilBarrel
                    )
                }
                item {
                    ServiceCategoryCard(
                        name = "Brake Service",
                        description = "Brake inspection and repair",
                        price = "150 AED",
                        icon = Icons.Default.CarRepair
                    )
                }
                item {
                    ServiceCategoryCard(
                        name = "Tire Service",
                        description = "Tire rotation and alignment",
                        price = "80 AED",
                        icon = Icons.Default.TireRepair
                    )
                }
                item {
                    ServiceCategoryCard(
                        name = "Engine Check",
                        description = "Complete engine inspection",
                        price = "120 AED",
                        icon = Icons.Default.Settings
                    )
                }
                item {
                    ServiceCategoryCard(
                        name = "AC Service",
                        description = "Air conditioning maintenance",
                        price = "100 AED",
                        icon = Icons.Default.Air
                    )
                }
            }
        }
    }
}

@Composable
fun ServiceCategoryCard(
    name: String,
    description: String,
    price: String,
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
                        text = description,
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = price,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = ClutchRed
                )
                Button(
                    onClick = { /* TODO: Book service */ },
                    colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Book", color = Color.White, fontSize = 12.sp)
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun BookServiceScreenPreview() {
    ClutchAppTheme {
        BookServiceScreen()
    }
}
