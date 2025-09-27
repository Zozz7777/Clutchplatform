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
fun BrandSelectionScreen(
    onNavigateBack: () -> Unit,
    onBrandSelected: (String) -> Unit
) {
    val context = LocalContext.current
    var searchQuery by remember { mutableStateOf("") }
    var selectedBrand by remember { mutableStateOf("") }
    
    // Mock data for brands - in real app, this would come from API
    val brands = remember {
        listOf(
            "ASTON MARTIN",
            "AUDI",
            "BMW",
            "MERCEDES-BENZ",
            "TOYOTA",
            "HONDA",
            "FORD",
            "CHEVROLET",
            "NISSAN",
            "HYUNDAI",
            "KIA",
            "VOLKSWAGEN",
            "PORSCHE",
            "FERRARI",
            "LAMBORGHINI",
            "MASERATI",
            "JAGUAR",
            "LAND ROVER",
            "LEXUS",
            "INFINITI"
        )
    }
    
    val filteredBrands = brands.filter { 
        it.contains(searchQuery.uppercase(), ignoreCase = true) 
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = TranslationManager.getString(context, R.string.your_car),
                        color = ClutchRed,
                        fontWeight = FontWeight.Bold
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

            // Brands List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredBrands) { brand ->
                    BrandItem(
                        brand = brand,
                        isSelected = selectedBrand == brand,
                        onClick = { 
                            selectedBrand = brand
                            onBrandSelected(brand)
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun BrandItem(
    brand: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val backgroundColor = if (isSelected) ClutchRed else Color(0xFFF5F5F5)
    val textColor = if (isSelected) Color.White else Color.Black
    val iconColor = if (isSelected) Color.White else Color.LightGray

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
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.KeyboardArrowDown,
                    contentDescription = "Select",
                    tint = iconColor
                )
                
                Text(
                    text = brand,
                    color = textColor,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium
                )
            }
            
            // Brand logo placeholder - in real app, this would be the actual brand logo
            Icon(
                imageVector = Icons.Default.DirectionsCar,
                contentDescription = "Brand Logo",
                tint = iconColor,
                modifier = Modifier.size(24.dp)
            )
        }
    }
}
