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
fun ModelSelectionScreen(
    selectedBrand: String,
    onNavigateBack: () -> Unit,
    onModelSelected: (String) -> Unit
) {
    val context = LocalContext.current
    var searchQuery by remember { mutableStateOf("") }
    var selectedModel by remember { mutableStateOf("") }
    
    // Mock data for models based on brand - in real app, this would come from API
    val models = remember(selectedBrand) {
        when (selectedBrand.uppercase()) {
            "ASTON MARTIN" -> listOf(
                "Rapide S",
                "Vantage",
                "Austin",
                "DB9",
                "Vanquish",
                "DBX",
                "Valkyrie",
                "DBS"
            )
            "BMW" -> listOf(
                "3 Series",
                "5 Series",
                "7 Series",
                "X1",
                "X3",
                "X5",
                "X7",
                "Z4"
            )
            "MERCEDES-BENZ" -> listOf(
                "C-Class",
                "E-Class",
                "S-Class",
                "A-Class",
                "GLA",
                "GLC",
                "GLE",
                "GLS"
            )
            "AUDI" -> listOf(
                "A3",
                "A4",
                "A6",
                "A8",
                "Q3",
                "Q5",
                "Q7",
                "Q8"
            )
            else -> listOf(
                "Model 1",
                "Model 2",
                "Model 3",
                "Model 4",
                "Model 5"
            )
        }
    }
    
    val filteredModels = models.filter { 
        it.contains(searchQuery, ignoreCase = true) 
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = TranslationManager.getString(context, R.string.model),
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

            // Selected Brand Display
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
                            contentDescription = "Change Brand",
                            tint = Color.White
                        )
                        
                        Text(
                            text = selectedBrand.uppercase(),
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

            // Models List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredModels) { model ->
                    ModelItem(
                        model = model,
                        isSelected = selectedModel == model,
                        onClick = { 
                            selectedModel = model
                            onModelSelected(model)
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun ModelItem(
    model: String,
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
                text = model,
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
