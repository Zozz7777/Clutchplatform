package com.clutch.app.ui.screens.car

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.clutch.app.R
import com.clutch.app.ui.theme.ClutchRed
import com.clutch.app.utils.TranslationManager
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LastMaintenanceScreen(
    onNavigateBack: () -> Unit,
    onNavigateToServiceSelection: () -> Unit,
    onMaintenanceCompleted: () -> Unit,
    initialDate: String? = null,
    initialServices: List<String> = emptyList(),
    initialKilometers: String = "",
    onDataChange: (String?, List<String>, String) -> Unit = { _, _, _ -> }
) {
    val context = LocalContext.current
    var selectedDate by remember { mutableStateOf<Date?>(null) }
    var selectedServices by remember { mutableStateOf(initialServices) }
    var kilometers by remember { mutableStateOf(initialKilometers) }
    var showDatePicker by remember { mutableStateOf(false) }
    
    val dateFormatter = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
    val isFormValid = selectedDate != null && selectedServices.isNotEmpty() && kilometers.isNotEmpty()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = TranslationManager.getString(context, R.string.last_maintenance),
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF5F5F5))
                .padding(paddingValues)
                .padding(horizontal = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Spacer(modifier = Modifier.height(32.dp))

            // Date Selection Button
            OutlinedTextField(
                value = selectedDate?.let { dateFormatter.format(it) } ?: "",
                onValueChange = { },
                label = { Text(TranslationManager.getString(context, R.string.date)) },
                readOnly = true,
                trailingIcon = {
                    Icon(
                        imageVector = Icons.Default.CalendarToday,
                        contentDescription = "Select Date",
                        tint = Color.LightGray
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { showDatePicker = true },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ClutchRed,
                    focusedLabelColor = ClutchRed,
                    unfocusedBorderColor = Color.LightGray,
                    unfocusedLabelColor = Color.LightGray,
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black
                )
            )

            // Service Selection Button
            OutlinedTextField(
                value = if (selectedServices.isEmpty()) "" else selectedServices.joinToString(", "),
                onValueChange = { },
                label = { Text(TranslationManager.getString(context, R.string.what_did_you_do)) },
                readOnly = true,
                trailingIcon = {
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = "Select Services",
                        tint = Color.LightGray
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToServiceSelection() },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ClutchRed,
                    focusedLabelColor = ClutchRed,
                    unfocusedBorderColor = Color.LightGray,
                    unfocusedLabelColor = Color.LightGray,
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black
                )
            )

            // Kilometers Input
            OutlinedTextField(
                value = kilometers,
                onValueChange = { 
                    kilometers = it
                    onDataChange(selectedDate?.let { dateFormatter.format(it) }, selectedServices, kilometers)
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

            Spacer(modifier = Modifier.weight(1f))

            // CONFIRM Button
            Button(
                onClick = { onMaintenanceCompleted() },
                enabled = isFormValid,
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
                    text = TranslationManager.getString(context, R.string.confirm),
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }

    // Date Picker Dialog
    if (showDatePicker) {
        val datePickerState = rememberDatePickerState(
            initialSelectedDateMillis = selectedDate?.time ?: System.currentTimeMillis()
        )
        
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
                confirmButton = {
                    TextButton(
                        onClick = {
                            datePickerState.selectedDateMillis?.let {
                                selectedDate = Date(it)
                                onDataChange(selectedDate?.let { dateFormatter.format(it) }, selectedServices, kilometers)
                            }
                            showDatePicker = false
                        }
                    ) {
                        Text(TranslationManager.getString(context, R.string.ok))
                    }
                },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) {
                    Text(TranslationManager.getString(context, R.string.cancel))
                }
            }
        ) {
            DatePicker(state = datePickerState)
        }
    }
}

@Composable
fun DatePickerDialog(
    onDismissRequest: () -> Unit,
    confirmButton: @Composable () -> Unit,
    dismissButton: @Composable (() -> Unit)? = null,
    content: @Composable () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismissRequest,
        confirmButton = confirmButton,
        dismissButton = dismissButton,
        text = content
    )
}
