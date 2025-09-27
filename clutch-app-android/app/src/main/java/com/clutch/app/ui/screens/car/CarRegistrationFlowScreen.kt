package com.clutch.app.ui.screens.car

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.clutch.app.ui.components.ErrorDialog
import com.clutch.app.ui.viewmodel.CarRegistrationFlowViewModel

@Composable
fun CarRegistrationFlowScreen(
    onFlowCompleted: () -> Unit,
    viewModel: CarRegistrationFlowViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var currentStep by remember { mutableStateOf("check_cars") }
    var showErrorDialog by remember { mutableStateOf(false) }
    
    // Car registration data
    var year by remember { mutableStateOf("") }
    var selectedBrand by remember { mutableStateOf("") }
    var selectedModel by remember { mutableStateOf("") }
    var selectedTrim by remember { mutableStateOf("") }
    var kilometers by remember { mutableStateOf("") }
    var color by remember { mutableStateOf("") }
    var licensePlate by remember { mutableStateOf("") }
    
    // Maintenance data
    var selectedDate by remember { mutableStateOf<String?>(null) }
    var selectedServices by remember { mutableStateOf<List<String>>(emptyList()) }
    var maintenanceKilometers by remember { mutableStateOf("") }
    
    // Check for errors
    LaunchedEffect(uiState.errorMessage) {
        if (uiState.errorMessage != null) {
            showErrorDialog = true
        }
    }
    
    // Handle flow completion
    LaunchedEffect(uiState.isMaintenanceCompleted) {
        if (uiState.isMaintenanceCompleted) {
            onFlowCompleted()
        }
    }
    
    // Handle car registration completion
    LaunchedEffect(uiState.isCarRegistered) {
        if (uiState.isCarRegistered) {
            currentStep = "last_maintenance"
        }
    }
    
    // Initial check for user cars
    LaunchedEffect(Unit) {
        viewModel.checkUserCars()
    }
    
    // Handle car check result
    LaunchedEffect(uiState.hasCars) {
        if (!uiState.isLoading && uiState.hasCars) {
            // User has cars, go to last maintenance
            currentStep = "last_maintenance"
        } else if (!uiState.isLoading && !uiState.hasCars) {
            // User has no cars, go to car registration
            currentStep = "add_car"
        }
    }
    
    when (currentStep) {
        "check_cars" -> {
            // Loading screen while checking for cars
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(color = Color.Red)
                }
            }
        }
        
        "add_car" -> {
            AddCarScreen(
                onNavigateBack = { /* Cannot go back from here */ },
                onNavigateToBrandSelection = { currentStep = "brand_selection" },
                onNavigateToModelSelection = { brand -> 
                    selectedBrand = brand
                    currentStep = "model_selection" 
                },
                onNavigateToTrimSelection = { brand, model -> 
                    selectedBrand = brand
                    selectedModel = model
                    currentStep = "trim_selection" 
                },
                onNavigateToLastMaintenance = {
                    // Register the car first
                    if (year.isNotEmpty() && selectedBrand.isNotEmpty() && 
                        selectedModel.isNotEmpty() && selectedTrim.isNotEmpty() && 
                        kilometers.isNotEmpty() && color.isNotEmpty() && licensePlate.isNotEmpty()) {
                        
                        viewModel.registerCar(
                            year = year.toInt(),
                            brand = selectedBrand,
                            model = selectedModel,
                            trim = selectedTrim,
                            kilometers = kilometers.toInt(),
                            color = color,
                            licensePlate = licensePlate
                        )
                    }
                }
            )
        }
        
        "brand_selection" -> {
            BrandSelectionScreen(
                onNavigateBack = { currentStep = "add_car" },
                onBrandSelected = { brand ->
                    selectedBrand = brand
                    currentStep = "add_car"
                }
            )
        }
        
        "model_selection" -> {
            ModelSelectionScreen(
                selectedBrand = selectedBrand,
                onNavigateBack = { currentStep = "add_car" },
                onModelSelected = { model ->
                    selectedModel = model
                    currentStep = "add_car"
                }
            )
        }
        
        "trim_selection" -> {
            TrimSelectionScreen(
                selectedBrand = selectedBrand,
                selectedModel = selectedModel,
                onNavigateBack = { currentStep = "add_car" },
                onTrimSelected = { trim ->
                    selectedTrim = trim
                    currentStep = "add_car"
                }
            )
        }
        
        "last_maintenance" -> {
            LastMaintenanceScreen(
                onNavigateBack = { /* Cannot go back from here */ },
                onNavigateToServiceSelection = { currentStep = "service_selection" },
                onMaintenanceCompleted = {
                    // Complete the maintenance
                    val carId = uiState.registeredCar?.id ?: uiState.userCars.firstOrNull()?.id
                    if (carId != null && selectedDate != null && selectedServices.isNotEmpty() && maintenanceKilometers.isNotEmpty()) {
                        
                        // Convert services to the format expected by the API
                        val services = selectedServices.map { service ->
                            // For now, we'll use a simple mapping
                            // In a real app, you'd have proper service group mapping
                            "OILS" to service
                        }
                        
                        viewModel.updateCarMaintenance(
                            carId = carId,
                            maintenanceDate = selectedDate!!,
                            services = services,
                            kilometers = maintenanceKilometers.toInt()
                        )
                    }
                }
            )
        }
        
        "service_selection" -> {
            ServiceSelectionScreen(
                onNavigateBack = { currentStep = "last_maintenance" },
                onServicesSelected = { services ->
                    selectedServices = services
                    currentStep = "last_maintenance"
                }
            )
        }
    }
    
    // Error Dialog
    if (showErrorDialog && uiState.errorMessage != null) {
        ErrorDialog(
            title = "Error",
            message = uiState.errorMessage!!,
            onDismiss = { 
                showErrorDialog = false
                viewModel.clearError()
            }
        )
    }
}
