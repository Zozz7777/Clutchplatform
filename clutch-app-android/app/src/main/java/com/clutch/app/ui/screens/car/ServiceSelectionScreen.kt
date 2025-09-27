package com.clutch.app.ui.screens.car

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.R
import com.clutch.app.ui.theme.ClutchRed
import com.clutch.app.utils.TranslationManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ServiceSelectionScreen(
    onNavigateBack: () -> Unit,
    onServicesSelected: (List<String>) -> Unit
) {
    val context = LocalContext.current
    var searchQuery by remember { mutableStateOf("") }
    var selectedServices by remember { mutableStateOf<Set<String>>(emptySet()) }
    var expandedGroups by remember { mutableStateOf<Set<String>>(emptySet()) }
    
    // Mock data for maintenance services - in real app, this would come from API
    val serviceGroups = remember {
        mapOf(
            "OILS" to listOf(
                "5000 KM OIL",
                "10,000 KM OIL",
                "15,000 KM OIL",
                "OIL FILTER"
            ),
            "ENGINE PARTS" to listOf(
                "SPARK PLUGS",
                "AIR FILTER",
                "FUEL FILTER",
                "TIMING BELT"
            ),
            "BRAKES" to listOf(
                "BRAKE PADS",
                "BRAKE DISCS",
                "BRAKE FLUID",
                "BRAKE LINES"
            ),
            "TIRES" to listOf(
                "TIRE ROTATION",
                "TIRE BALANCING",
                "TIRE ALIGNMENT",
                "TIRE REPLACEMENT"
            ),
            "TRANSMISSION" to listOf(
                "TRANSMISSION FLUID",
                "TRANSMISSION FILTER",
                "CLUTCH REPLACEMENT"
            ),
            "COOLING SYSTEM" to listOf(
                "COOLANT FLUSH",
                "RADIATOR CLEANING",
                "THERMOSTAT REPLACEMENT"
            )
        )
    }
    
    val filteredGroups = serviceGroups.filter { (groupName, services) ->
        groupName.contains(searchQuery.uppercase(), ignoreCase = true) ||
        services.any { it.contains(searchQuery.uppercase(), ignoreCase = true) }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = TranslationManager.getString(context, R.string.what_did_you_do_maintenance),
                        color = ClutchRed,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = ClutchRed
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF5F5F5))
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { 
                    Text(
                        text = TranslationManager.getString(context, R.string.search),
                        color = Color.LightGray
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        tint = Color.LightGray
                    )
                },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ClutchRed,
                    unfocusedBorderColor = Color.LightGray,
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black
                ),
                shape = RoundedCornerShape(8.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Service Groups List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredGroups.toList()) { (groupName, services) ->
                    ServiceGroupItem(
                        groupName = groupName,
                        services = services,
                        isExpanded = expandedGroups.contains(groupName),
                        selectedServices = selectedServices,
                        onToggleExpanded = { 
                            expandedGroups = if (expandedGroups.contains(groupName)) {
                                expandedGroups - groupName
                            } else {
                                expandedGroups + groupName
                            }
                        },
                        onServiceToggle = { service ->
                            selectedServices = if (selectedServices.contains(service)) {
                                selectedServices - service
                            } else {
                                selectedServices + service
                            }
                        }
                    )
                }
                
                // Other Things Input
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        OutlinedTextField(
                            value = "",
                            onValueChange = { },
                            placeholder = { 
                                Text(
                                    text = TranslationManager.getString(context, R.string.other_things_type_here),
                                    color = Color.LightGray
                                )
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = ClutchRed,
                                unfocusedBorderColor = Color.LightGray,
                                focusedTextColor = Color.Black,
                                unfocusedTextColor = Color.Black
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // GO Button
            Button(
                onClick = { onServicesSelected(selectedServices.toList()) },
                enabled = selectedServices.isNotEmpty(),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = ClutchRed,
                    disabledContainerColor = Color.LightGray
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = TranslationManager.getString(context, R.string.go),
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
fun ServiceGroupItem(
    groupName: String,
    services: List<String>,
    isExpanded: Boolean,
    selectedServices: Set<String>,
    onToggleExpanded: () -> Unit,
    onServiceToggle: (String) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(8.dp)
    ) {
        Column {
            // Group Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onToggleExpanded() }
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(
                        imageVector = if (isExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                        contentDescription = if (isExpanded) "Collapse" else "Expand",
                        tint = Color.LightGray
                    )
                    
                    Text(
                        text = groupName,
                        color = Color.Black,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
                
                // Service group icon
                Icon(
                    imageVector = Icons.Default.Build,
                    contentDescription = "Service Group",
                    tint = Color.LightGray,
                    modifier = Modifier.size(24.dp)
                )
            }
            
            // Services List (when expanded)
            if (isExpanded) {
                services.forEach { service ->
                    ServiceItem(
                        service = service,
                        isSelected = selectedServices.contains(service),
                        onToggle = { onServiceToggle(service) }
                    )
                }
            }
        }
    }
}

@Composable
fun ServiceItem(
    service: String,
    isSelected: Boolean,
    onToggle: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onToggle() }
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = service,
            color = Color.Black,
            fontSize = 14.sp
        )
        
        // Selection indicator
        Box(
            modifier = Modifier
                .size(16.dp)
                .background(
                    color = if (isSelected) ClutchRed else Color.LightGray,
                    shape = RoundedCornerShape(2.dp)
                )
        )
    }
}
