package com.clutch.app.ui.screens.parts

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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalLayoutDirection
import com.clutch.app.R
import com.clutch.app.ui.theme.ClutchAppTheme
import com.clutch.app.ui.theme.ClutchRed
import com.clutch.app.utils.TranslationManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderPartsScreen() {
    val context = LocalContext.current
    val currentLanguage = TranslationManager.getCurrentLanguage()
    val layoutDirection = if (currentLanguage == "ar") LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = TranslationManager.getString(context, R.string.order_parts),
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
            // Search Bar
            OutlinedTextField(
                value = "", // TODO: Add search state
                onValueChange = { /* TODO */ },
                placeholder = { Text(TranslationManager.getString(context, R.string.search_for_parts)) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = TranslationManager.getString(context, R.string.search)) },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ClutchRed,
                    unfocusedBorderColor = Color.Gray
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Parts Categories
            Text(
                text = TranslationManager.getString(context, R.string.parts_categories),
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    PartCategoryCard(
                        name = TranslationManager.getString(context, R.string.engine_parts),
                        description = TranslationManager.getString(context, R.string.engine_parts_desc),
                        icon = Icons.Default.Settings
                    )
                }
                item {
                    PartCategoryCard(
                        name = TranslationManager.getString(context, R.string.brake_parts),
                        description = TranslationManager.getString(context, R.string.brake_parts_desc),
                        icon = Icons.Default.CarRepair
                    )
                }
                item {
                    PartCategoryCard(
                        name = TranslationManager.getString(context, R.string.tire_wheel),
                        description = TranslationManager.getString(context, R.string.tire_wheel_desc),
                        icon = Icons.Default.TireRepair
                    )
                }
                item {
                    PartCategoryCard(
                        name = TranslationManager.getString(context, R.string.electrical),
                        description = TranslationManager.getString(context, R.string.electrical_desc),
                        icon = Icons.Default.ElectricalServices
                    )
                }
                item {
                    PartCategoryCard(
                        name = TranslationManager.getString(context, R.string.body_parts),
                        description = TranslationManager.getString(context, R.string.body_parts_desc),
                        icon = Icons.Default.CarRental
                    )
                }
            }
        }
        }
    }
}

@Composable
fun PartCategoryCard(
    name: String,
    description: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector
) {
    val context = LocalContext.current
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
            verticalAlignment = Alignment.CenterVertically
        ) {
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
            Spacer(modifier = Modifier.weight(1f))
            Icon(
                imageVector = Icons.Default.KeyboardArrowRight,
                contentDescription = TranslationManager.getString(context, R.string.view),
                tint = Color.Gray
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun OrderPartsScreenPreview() {
    ClutchAppTheme {
        OrderPartsScreen()
    }
}
