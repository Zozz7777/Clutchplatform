package com.clutch.app.ui.screens.car

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalLayoutDirection
import com.clutch.app.R
import com.clutch.app.ui.theme.ClutchRed
import com.clutch.app.utils.TranslationManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddCarScreen(
    onNavigateBack: () -> Unit,
    onNavigateToBrandSelection: () -> Unit,
    onNavigateToModelSelection: (String) -> Unit,
    onNavigateToTrimSelection: (String, String) -> Unit,
    onNavigateToLastMaintenance: () -> Unit,
    initialYear: String = "",
    initialBrand: String = "",
    initialModel: String = "",
    initialTrim: String = "",
    initialKilometers: String = "",
    initialColor: String = "",
    initialLicensePlate: String = "",
    onDataChange: (String, String, String, String, String, String, String) -> Unit = { _, _, _, _, _, _, _ -> }
) {
    val context = LocalContext.current
    val currentLanguage = TranslationManager.getCurrentLanguage()
    val layoutDirection = if (currentLanguage == "ar") LayoutDirection.Rtl else LayoutDirection.Ltr
    
    var year by remember { mutableStateOf(initialYear) }
    var selectedBrand by remember { mutableStateOf(initialBrand) }
    var selectedModel by remember { mutableStateOf(initialModel) }
    var selectedTrim by remember { mutableStateOf(initialTrim) }
    var kilometers by remember { mutableStateOf(initialKilometers) }
    var color by remember { mutableStateOf(initialColor) }
    var licensePlate by remember { mutableStateOf(initialLicensePlate) }
    
    val isFormValid = year.isNotEmpty() && selectedBrand.isNotEmpty() && 
                     selectedModel.isNotEmpty() && selectedTrim.isNotEmpty() && 
                     kilometers.isNotEmpty() && color.isNotEmpty() && licensePlate.isNotEmpty()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = TranslationManager.getString(context, R.string.add_your_car),
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
                actions = {
                    Image(
                        painter = painterResource(id = R.drawable.clutch_logo_red),
                        contentDescription = "Clutch Logo",
                        modifier = Modifier
                            .size(32.dp)
                            .padding(end = 16.dp)
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        }
    ) { paddingValues ->
        CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFFF5F5F5))
                    .padding(paddingValues)
                    .padding(horizontal = 24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
            Spacer(modifier = Modifier.height(32.dp))

            // Year Input
            OutlinedTextField(
                value = year,
                onValueChange = { 
                    year = it
                    onDataChange(year, selectedBrand, selectedModel, selectedTrim, kilometers, color, licensePlate)
                },
                label = { Text(TranslationManager.getString(context, R.string.year)) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ClutchRed,
                    focusedLabelColor = ClutchRed,
                    unfocusedBorderColor = Color.LightGray,
                    unfocusedLabelColor = Color.LightGray,
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black
                )
            )

            // Brand Selection Button
            OutlinedTextField(
                value = selectedBrand,
                onValueChange = { },
                label = { Text(TranslationManager.getString(context, R.string.brand_name)) },
                readOnly = true,
                trailingIcon = {
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = "Select Brand",
                        tint = Color.LightGray
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToBrandSelection() },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ClutchRed,
                    focusedLabelColor = ClutchRed,
                    unfocusedBorderColor = Color.LightGray,
                    unfocusedLabelColor = Color.LightGray,
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black
                )
            )

            // Model Selection Button
            OutlinedTextField(
                value = selectedModel,
                onValueChange = { },
                label = { Text(TranslationManager.getString(context, R.string.all_models)) },
                readOnly = true,
                trailingIcon = {
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = "Select Model",
                        tint = if (selectedBrand.isNotEmpty()) Color.LightGray else Color.LightGray.copy(alpha = 0.5f)
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { 
                        if (selectedBrand.isNotEmpty()) {
                            onNavigateToModelSelection(selectedBrand)
                        }
                    },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ClutchRed,
                    focusedLabelColor = ClutchRed,
                    unfocusedBorderColor = if (selectedBrand.isNotEmpty()) Color.LightGray else Color.LightGray.copy(alpha = 0.5f),
                    unfocusedLabelColor = if (selectedBrand.isNotEmpty()) Color.LightGray else Color.LightGray.copy(alpha = 0.5f),
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = if (selectedBrand.isNotEmpty()) Color.Black else Color.Black.copy(alpha = 0.6f)
                )
            )

            // Trim Selection Button
            OutlinedTextField(
                value = selectedTrim,
                onValueChange = { },
                label = { Text(TranslationManager.getString(context, R.string.trim)) },
                readOnly = true,
                trailingIcon = {
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = "Select Trim",
                        tint = if (selectedModel.isNotEmpty()) Color.LightGray else Color.LightGray.copy(alpha = 0.5f)
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { 
                        if (selectedModel.isNotEmpty()) {
                            onNavigateToTrimSelection(selectedBrand, selectedModel)
                        }
                    },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ClutchRed,
                    focusedLabelColor = ClutchRed,
                    unfocusedBorderColor = if (selectedModel.isNotEmpty()) Color.LightGray else Color.LightGray.copy(alpha = 0.5f),
                    unfocusedLabelColor = if (selectedModel.isNotEmpty()) Color.LightGray else Color.LightGray.copy(alpha = 0.5f),
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = if (selectedModel.isNotEmpty()) Color.Black else Color.Black.copy(alpha = 0.6f)
                )
            )

            // Kilometers Input
            OutlinedTextField(
                value = kilometers,
                onValueChange = { 
                    kilometers = it
                    onDataChange(year, selectedBrand, selectedModel, selectedTrim, kilometers, color, licensePlate)
                },
                label = { Text(TranslationManager.getString(context, R.string.kilometers)) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ClutchRed,
                    focusedLabelColor = ClutchRed,
                    unfocusedBorderColor = Color.LightGray,
                    unfocusedLabelColor = Color.LightGray,
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black
                )
            )

            // Color Input
            OutlinedTextField(
                value = color,
                onValueChange = { 
                    color = it
                    onDataChange(year, selectedBrand, selectedModel, selectedTrim, kilometers, color, licensePlate)
                },
                label = { Text(TranslationManager.getString(context, R.string.color)) },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ClutchRed,
                    focusedLabelColor = ClutchRed,
                    unfocusedBorderColor = Color.LightGray,
                    unfocusedLabelColor = Color.LightGray,
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black
                )
            )

            // License Plate Input
            OutlinedTextField(
                value = licensePlate,
                onValueChange = { 
                    licensePlate = it.uppercase()
                    onDataChange(year, selectedBrand, selectedModel, selectedTrim, kilometers, color, licensePlate)
                },
                label = { Text(TranslationManager.getString(context, R.string.license_plate)) },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ClutchRed,
                    focusedLabelColor = ClutchRed,
                    unfocusedBorderColor = Color.LightGray,
                    unfocusedLabelColor = Color.LightGray,
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black
                )
            )

            Spacer(modifier = Modifier.weight(1f))

            // GO Button
            Button(
                onClick = { 
                    if (isFormValid) {
                        onNavigateToLastMaintenance()
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = ClutchRed,
                    disabledContainerColor = ClutchRed.copy(alpha = 0.6f)
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

            Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}
