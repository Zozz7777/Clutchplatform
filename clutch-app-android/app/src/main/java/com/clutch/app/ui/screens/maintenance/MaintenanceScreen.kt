package com.clutch.app.ui.screens.maintenance

import androidx.compose.foundation.Image
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
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.R
import com.clutch.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MaintenanceScreen() {
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
            // Last Maintenance Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Last Maintenance",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = ClutchRed,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                    
                    // Date Input
                    OutlinedTextField(
                        value = "",
                        onValueChange = { },
                        label = { Text("Date") },
                        trailingIcon = {
                            Icon(Icons.Default.DateRange, contentDescription = "Date")
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ClutchRed,
                            unfocusedBorderColor = Color.Gray,
                            focusedTextColor = Color.Black,
                            unfocusedTextColor = Color.Black
                        )
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    // What Did You Do Input
                    OutlinedTextField(
                        value = "",
                        onValueChange = { },
                        label = { Text("What Did You Do") },
                        trailingIcon = {
                            Icon(Icons.Default.KeyboardArrowDown, contentDescription = "Dropdown")
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ClutchRed,
                            unfocusedBorderColor = Color.Gray,
                            focusedTextColor = Color.Black,
                            unfocusedTextColor = Color.Black
                        )
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    // Kilometers Input
                    OutlinedTextField(
                        value = "",
                        onValueChange = { },
                        label = { Text("Kilometers") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ClutchRed,
                            unfocusedBorderColor = Color.Gray,
                            focusedTextColor = Color.Black,
                            unfocusedTextColor = Color.Black
                        )
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Confirm Button
                    Button(
                        onClick = { /* TODO: Handle confirm */ },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            text = "CONFIRM",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(100.dp)) // Space for bottom navigation
        }
    }
}
