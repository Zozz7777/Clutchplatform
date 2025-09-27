package com.clutch.app.ui.screens.car

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.components.ClutchButton
import com.clutch.app.ui.components.ClutchTextField
import com.clutch.app.ui.theme.ClutchRed
import com.clutch.app.viewmodel.CarRegistrationViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CarRegistrationScreen(
    onNavigateBack: () -> Unit,
    onCarRegistered: () -> Unit,
    viewModel: CarRegistrationViewModel
) {
    val uiState by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()

    LaunchedEffect(uiState.isSuccess) {
        if (uiState.isSuccess) {
            onCarRegistered()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(scrollState)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onNavigateBack) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = ClutchRed
                )
            }
            Text(
                text = "Add New Car",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Spacer(modifier = Modifier.width(48.dp))
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Car Information Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Car Information",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )

                // Make
                ClutchTextField(
                    value = uiState.make,
                    onValueChange = viewModel::updateMake,
                    label = "Make",
                    placeholder = "e.g., Toyota, Honda, BMW",
                    leadingIcon = Icons.Default.DirectionsCar,
                    error = uiState.makeError
                )

                // Model
                ClutchTextField(
                    value = uiState.model,
                    onValueChange = viewModel::updateModel,
                    label = "Model",
                    placeholder = "e.g., Camry, Civic, X5",
                    leadingIcon = Icons.Default.DirectionsCar,
                    error = uiState.modelError
                )

                // Year
                ClutchTextField(
                    value = uiState.year,
                    onValueChange = viewModel::updateYear,
                    label = "Year",
                    placeholder = "e.g., 2020",
                    leadingIcon = Icons.Default.CalendarToday,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    error = uiState.yearError
                )

                // License Plate
                ClutchTextField(
                    value = uiState.licensePlate,
                    onValueChange = viewModel::updateLicensePlate,
                    label = "License Plate",
                    placeholder = "e.g., ABC-123",
                    leadingIcon = Icons.Default.CreditCard,
                    error = uiState.licensePlateError
                )

                // VIN
                ClutchTextField(
                    value = uiState.vin,
                    onValueChange = viewModel::updateVin,
                    label = "VIN (Optional)",
                    placeholder = "17-character VIN number",
                    leadingIcon = Icons.Default.Fingerprint,
                    error = uiState.vinError
                )

                // Color
                ClutchTextField(
                    value = uiState.color,
                    onValueChange = viewModel::updateColor,
                    label = "Color",
                    placeholder = "e.g., Red, Blue, Black",
                    leadingIcon = Icons.Default.Palette,
                    error = uiState.colorError
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Additional Information Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Additional Information",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )

                // Current Mileage
                ClutchTextField(
                    value = uiState.mileage,
                    onValueChange = viewModel::updateMileage,
                    label = "Current Mileage",
                    placeholder = "e.g., 50000",
                    leadingIcon = Icons.Default.Speed,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    error = uiState.mileageError
                )

                // Fuel Type
                var fuelTypeExpanded by remember { mutableStateOf(false) }
                val fuelTypes = listOf("Gasoline", "Diesel", "Hybrid", "Electric", "Other")
                
                ExposedDropdownMenuBox(
                    expanded = fuelTypeExpanded,
                    onExpandedChange = { fuelTypeExpanded = !fuelTypeExpanded }
                ) {
                    OutlinedTextField(
                        value = uiState.fuelType,
                        onValueChange = { },
                        readOnly = true,
                        label = { Text("Fuel Type") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = fuelTypeExpanded) },
                        colors = ExposedDropdownMenuDefaults.outlinedTextFieldColors(),
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = fuelTypeExpanded,
                        onDismissRequest = { fuelTypeExpanded = false }
                    ) {
                        fuelTypes.forEach { fuelType ->
                            DropdownMenuItem(
                                text = { Text(fuelType) },
                                onClick = {
                                    viewModel.updateFuelType(fuelType)
                                    fuelTypeExpanded = false
                                }
                            )
                        }
                    }
                }

                // Transmission
                var transmissionExpanded by remember { mutableStateOf(false) }
                val transmissions = listOf("Automatic", "Manual", "CVT", "Other")
                
                ExposedDropdownMenuBox(
                    expanded = transmissionExpanded,
                    onExpandedChange = { transmissionExpanded = !transmissionExpanded }
                ) {
                    OutlinedTextField(
                        value = uiState.transmission,
                        onValueChange = { },
                        readOnly = true,
                        label = { Text("Transmission") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = transmissionExpanded) },
                        colors = ExposedDropdownMenuDefaults.outlinedTextFieldColors(),
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = transmissionExpanded,
                        onDismissRequest = { transmissionExpanded = false }
                    ) {
                        transmissions.forEach { transmission ->
                            DropdownMenuItem(
                                text = { Text(transmission) },
                                onClick = {
                                    viewModel.updateTransmission(transmission)
                                    transmissionExpanded = false
                                }
                            )
                        }
                    }
                }

                // Engine Size
                ClutchTextField(
                    value = uiState.engineSize,
                    onValueChange = viewModel::updateEngineSize,
                    label = "Engine Size (Optional)",
                    placeholder = "e.g., 2.0L, 3.5L",
                    leadingIcon = Icons.Default.Settings,
                    error = uiState.engineSizeError
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Insurance Information Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Insurance Information",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )

                // Insurance Company
                ClutchTextField(
                    value = uiState.insuranceCompany,
                    onValueChange = viewModel::updateInsuranceCompany,
                    label = "Insurance Company",
                    placeholder = "e.g., Allstate, State Farm",
                    leadingIcon = Icons.Default.Security,
                    error = uiState.insuranceCompanyError
                )

                // Policy Number
                ClutchTextField(
                    value = uiState.policyNumber,
                    onValueChange = viewModel::updatePolicyNumber,
                    label = "Policy Number",
                    placeholder = "Enter policy number",
                    leadingIcon = Icons.Default.Description,
                    error = uiState.policyNumberError
                )

                // Expiry Date
                ClutchTextField(
                    value = uiState.insuranceExpiry,
                    onValueChange = viewModel::updateInsuranceExpiry,
                    label = "Expiry Date",
                    placeholder = "MM/DD/YYYY",
                    leadingIcon = Icons.Default.DateRange,
                    error = uiState.insuranceExpiryError
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Register Button
        ClutchButton(
            text = "Register Car",
            onClick = viewModel::registerCar,
            isLoading = uiState.isLoading,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Error Message
        uiState.errorMessage?.let { errorMessage ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.Red.copy(alpha = 0.1f))
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Error,
                        contentDescription = "Error",
                        tint = Color.Red
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = errorMessage,
                        color = Color.Red,
                        fontSize = 14.sp
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
    }
}
