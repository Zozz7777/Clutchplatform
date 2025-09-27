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
fun TrimSelectionScreen(
    selectedBrand: String,
    selectedModel: String,
    onNavigateBack: () -> Unit,
    onTrimSelected: (String) -> Unit
) {
    val context = LocalContext.current
    var searchQuery by remember { mutableStateOf("") }
    var selectedTrim by remember { mutableStateOf("") }
    
    // Mock data for trims based on brand and model - in real app, this would come from API
    val trims = remember(selectedBrand, selectedModel) {
        when (selectedBrand.uppercase()) {
            "ASTON MARTIN" -> when (selectedModel.uppercase()) {
                "DB9" -> listOf("Base", "Volante", "GT", "Carbon Black")
                "VANTAGE" -> listOf("Base", "S", "AMR", "F1 Edition")
                "RAPIDE S" -> listOf("Base", "AMR", "Luxury")
                else -> listOf("Base", "Premium", "Sport")
            }
            "BMW" -> when (selectedModel.uppercase()) {
                "3 SERIES" -> listOf("320i", "330i", "M340i", "M3")
                "5 SERIES" -> listOf("530i", "540i", "M550i", "M5")
                "X5" -> listOf("xDrive40i", "xDrive50i", "M50i", "X5M")
                else -> listOf("Base", "Premium", "Sport")
            }
            "MERCEDES-BENZ" -> when (selectedModel.uppercase()) {
                "C-CLASS" -> listOf("C200", "C300", "C43 AMG", "C63 AMG")
                "E-CLASS" -> listOf("E200", "E300", "E43 AMG", "E63 AMG")
                "S-CLASS" -> listOf("S350", "S450", "S500", "S63 AMG")
                else -> listOf("Base", "Premium", "AMG")
            }
            else -> listOf("Base", "Premium", "Sport", "Luxury")
        }
    }
    
    val filteredTrims = trims.filter { 
        it.contains(searchQuery, ignoreCase = true) 
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = TranslationManager.getString(context, R.string.trims),
                        color = ClutchRed,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
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
                .background(Color.White)
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
                        text = TranslationManager.getString(context, R.string.find_your_car),
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

            // Selected Car Display
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = ClutchRed),
                shape = RoundedCornerShape(8.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.KeyboardArrowDown,
                            contentDescription = "Change Car",
                            tint = Color.White
                        )
                        
                        Text(
                            text = "${selectedBrand.uppercase()} ${selectedModel.uppercase()}",
                            color = Color.White,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    
                    // Brand logo placeholder
                    Icon(
                        imageVector = Icons.Default.DirectionsCar,
                        contentDescription = "Brand Logo",
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Trims List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredTrims) { trim ->
                    TrimItem(
                        trim = trim,
                        isSelected = selectedTrim == trim,
                        onClick = { 
                            selectedTrim = trim
                            onTrimSelected(trim)
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun TrimItem(
    trim: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val backgroundColor = if (isSelected) Color(0xFFFFE0E0) else Color(0xFFF5F5F5)
    val textColor = Color.Black

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = trim,
                color = textColor,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium
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
}
