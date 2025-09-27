package com.clutch.partners.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
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
import com.clutch.partners.ui.components.PartnersButton
import com.clutch.partners.ui.components.PartnersTextField
import com.clutch.partners.ui.theme.PartnersBlue
import com.clutch.partners.viewmodel.InventoryManagementViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InventoryManagementScreen(
    onNavigateBack: () -> Unit,
    viewModel: InventoryManagementViewModel
) {
    val uiState by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()

    LaunchedEffect(Unit) {
        viewModel.loadInventory()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
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
                    tint = PartnersBlue
                )
            }
            Text(
                text = "Inventory Management",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            IconButton(onClick = { viewModel.showAddItemDialog() }) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Add Item",
                    tint = PartnersBlue
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Search and Filter
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            PartnersTextField(
                value = uiState.searchQuery,
                onValueChange = viewModel::updateSearchQuery,
                placeholder = "Search inventory...",
                leadingIcon = Icons.Default.Search,
                modifier = Modifier.weight(1f)
            )
            
            IconButton(onClick = { viewModel.showFilterDialog() }) {
                Icon(
                    imageVector = Icons.Default.FilterList,
                    contentDescription = "Filter",
                    tint = PartnersBlue
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Quick Stats
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(horizontal = 4.dp)
        ) {
            item {
                StatCard(
                    title = "Total Items",
                    value = uiState.totalItems.toString(),
                    icon = Icons.Default.Inventory,
                    color = PartnersBlue
                )
            }
            item {
                StatCard(
                    title = "Low Stock",
                    value = uiState.lowStockItems.toString(),
                    icon = Icons.Default.Warning,
                    color = Color.Orange
                )
            }
            item {
                StatCard(
                    title = "Out of Stock",
                    value = uiState.outOfStockItems.toString(),
                    icon = Icons.Default.Error,
                    color = Color.Red
                )
            }
            item {
                StatCard(
                    title = "Total Value",
                    value = "$${uiState.totalValue}",
                    icon = Icons.Default.AttachMoney,
                    color = Color.Green
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Inventory List
        if (uiState.isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = PartnersBlue)
            }
        } else if (uiState.filteredItems.isEmpty()) {
            EmptyInventoryView(
                onAddItem = { viewModel.showAddItemDialog() }
            )
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(uiState.filteredItems) { item ->
                    InventoryItemCard(
                        item = item,
                        onEdit = { viewModel.editItem(item) },
                        onDelete = { viewModel.deleteItem(item) },
                        onUpdateStock = { newStock -> viewModel.updateStock(item, newStock) }
                    )
                }
            }
        }
    }

    // Add Item Dialog
    if (uiState.showingAddItemDialog) {
        AddInventoryItemDialog(
            onDismiss = { viewModel.hideAddItemDialog() },
            onAddItem = { item -> viewModel.addItem(item) }
        )
    }

    // Edit Item Dialog
    uiState.editingItem?.let { item ->
        EditInventoryItemDialog(
            item = item,
            onDismiss = { viewModel.hideEditItemDialog() },
            onUpdateItem = { updatedItem -> viewModel.updateItem(updatedItem) }
        )
    }

    // Filter Dialog
    if (uiState.showingFilterDialog) {
        InventoryFilterDialog(
            currentFilter = uiState.currentFilter,
            onDismiss = { viewModel.hideFilterDialog() },
            onApplyFilter = { filter -> viewModel.applyFilter(filter) }
        )
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color
) {
    Card(
        modifier = Modifier.width(120.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(24.dp)
            )
            Text(
                text = value,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Text(
                text = title,
                fontSize = 12.sp,
                color = Color.Gray
            )
        }
    }
}

@Composable
fun InventoryItemCard(
    item: InventoryItem,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onUpdateStock: (Int) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = item.name,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    Text(
                        text = "SKU: ${item.sku}",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                }
                
                Row {
                    IconButton(onClick = onEdit) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = "Edit",
                            tint = PartnersBlue
                        )
                    }
                    IconButton(onClick = onDelete) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Delete",
                            tint = Color.Red
                        )
                    }
                }
            }

            // Details
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Price",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                    Text(
                        text = "$${item.price}",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.Black
                    )
                }
                
                Column {
                    Text(
                        text = "Stock",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                    Text(
                        text = "${item.stock} units",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = when {
                            item.stock == 0 -> Color.Red
                            item.stock <= item.lowStockThreshold -> Color.Orange
                            else -> Color.Green
                        }
                    )
                }
                
                Column {
                    Text(
                        text = "Category",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                    Text(
                        text = item.category,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.Black
                    )
                }
            }

            // Stock Update
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Update Stock:",
                    fontSize = 12.sp,
                    color = Color.Gray
                )
                
                OutlinedTextField(
                    value = item.stock.toString(),
                    onValueChange = { newValue ->
                        newValue.toIntOrNull()?.let { onUpdateStock(it) }
                    },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.width(80.dp),
                    singleLine = true
                )
                
                Spacer(modifier = Modifier.weight(1f))
                
                Button(
                    onClick = { onUpdateStock(item.stock + 1) },
                    modifier = Modifier.size(32.dp),
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Increase",
                        modifier = Modifier.size(16.dp)
                    )
                }
                
                Button(
                    onClick = { onUpdateStock(maxOf(0, item.stock - 1)) },
                    modifier = Modifier.size(32.dp),
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Remove,
                        contentDescription = "Decrease",
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun EmptyInventoryView(
    onAddItem: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.Inventory,
            contentDescription = null,
            modifier = Modifier.size(80.dp),
            tint = Color.Gray
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "No Inventory Items",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black
        )
        
        Text(
            text = "Add your first inventory item to get started",
            fontSize = 14.sp,
            color = Color.Gray
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        PartnersButton(
            text = "Add First Item",
            onClick = onAddItem,
            modifier = Modifier.padding(horizontal = 32.dp)
        )
    }
}

@Composable
fun AddInventoryItemDialog(
    onDismiss: () -> Unit,
    onAddItem: (InventoryItem) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var sku by remember { mutableStateOf("") }
    var price by remember { mutableStateOf("") }
    var stock by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var lowStockThreshold by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Inventory Item") },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                PartnersTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = "Item Name",
                    placeholder = "Enter item name"
                )
                
                PartnersTextField(
                    value = sku,
                    onValueChange = { sku = it },
                    label = "SKU",
                    placeholder = "Enter SKU"
                )
                
                PartnersTextField(
                    value = price,
                    onValueChange = { price = it },
                    label = "Price",
                    placeholder = "0.00",
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
                )
                
                PartnersTextField(
                    value = stock,
                    onValueChange = { stock = it },
                    label = "Initial Stock",
                    placeholder = "0",
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                
                PartnersTextField(
                    value = category,
                    onValueChange = { category = it },
                    label = "Category",
                    placeholder = "Enter category"
                )
                
                PartnersTextField(
                    value = lowStockThreshold,
                    onValueChange = { lowStockThreshold = it },
                    label = "Low Stock Threshold",
                    placeholder = "5",
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                
                PartnersTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = "Description",
                    placeholder = "Enter description"
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    val item = InventoryItem(
                        id = "",
                        name = name,
                        sku = sku,
                        price = price.toDoubleOrNull() ?: 0.0,
                        stock = stock.toIntOrNull() ?: 0,
                        category = category,
                        description = description,
                        lowStockThreshold = lowStockThreshold.toIntOrNull() ?: 5,
                        createdAt = System.currentTimeMillis(),
                        updatedAt = System.currentTimeMillis()
                    )
                    onAddItem(item)
                    onDismiss()
                },
                enabled = name.isNotBlank() && sku.isNotBlank() && price.isNotBlank()
            ) {
                Text("Add")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun EditInventoryItemDialog(
    item: InventoryItem,
    onDismiss: () -> Unit,
    onUpdateItem: (InventoryItem) -> Unit
) {
    var name by remember { mutableStateOf(item.name) }
    var sku by remember { mutableStateOf(item.sku) }
    var price by remember { mutableStateOf(item.price.toString()) }
    var stock by remember { mutableStateOf(item.stock.toString()) }
    var category by remember { mutableStateOf(item.category) }
    var description by remember { mutableStateOf(item.description) }
    var lowStockThreshold by remember { mutableStateOf(item.lowStockThreshold.toString()) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Edit Inventory Item") },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                PartnersTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = "Item Name",
                    placeholder = "Enter item name"
                )
                
                PartnersTextField(
                    value = sku,
                    onValueChange = { sku = it },
                    label = "SKU",
                    placeholder = "Enter SKU"
                )
                
                PartnersTextField(
                    value = price,
                    onValueChange = { price = it },
                    label = "Price",
                    placeholder = "0.00",
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
                )
                
                PartnersTextField(
                    value = stock,
                    onValueChange = { stock = it },
                    label = "Stock",
                    placeholder = "0",
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                
                PartnersTextField(
                    value = category,
                    onValueChange = { category = it },
                    label = "Category",
                    placeholder = "Enter category"
                )
                
                PartnersTextField(
                    value = lowStockThreshold,
                    onValueChange = { lowStockThreshold = it },
                    label = "Low Stock Threshold",
                    placeholder = "5",
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                
                PartnersTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = "Description",
                    placeholder = "Enter description"
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    val updatedItem = item.copy(
                        name = name,
                        sku = sku,
                        price = price.toDoubleOrNull() ?: item.price,
                        stock = stock.toIntOrNull() ?: item.stock,
                        category = category,
                        description = description,
                        lowStockThreshold = lowStockThreshold.toIntOrNull() ?: item.lowStockThreshold,
                        updatedAt = System.currentTimeMillis()
                    )
                    onUpdateItem(updatedItem)
                    onDismiss()
                },
                enabled = name.isNotBlank() && sku.isNotBlank() && price.isNotBlank()
            ) {
                Text("Update")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun InventoryFilterDialog(
    currentFilter: InventoryFilter,
    onDismiss: () -> Unit,
    onApplyFilter: (InventoryFilter) -> Unit
) {
    var selectedCategory by remember { mutableStateOf(currentFilter.category) }
    var stockFilter by remember { mutableStateOf(currentFilter.stockFilter) }
    var sortBy by remember { mutableStateOf(currentFilter.sortBy) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Filter Inventory") },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Category Filter
                Text("Category")
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        FilterChip(
                            selected = selectedCategory == "All",
                            onClick = { selectedCategory = "All" },
                            label = { Text("All") }
                        )
                    }
                    item {
                        FilterChip(
                            selected = selectedCategory == "Parts",
                            onClick = { selectedCategory = "Parts" },
                            label = { Text("Parts") }
                        )
                    }
                    item {
                        FilterChip(
                            selected = selectedCategory == "Accessories",
                            onClick = { selectedCategory = "Accessories" },
                            label = { Text("Accessories") }
                        )
                    }
                    item {
                        FilterChip(
                            selected = selectedCategory == "Tools",
                            onClick = { selectedCategory = "Tools" },
                            label = { Text("Tools") }
                        )
                    }
                }

                // Stock Filter
                Text("Stock Status")
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        FilterChip(
                            selected = stockFilter == StockFilter.ALL,
                            onClick = { stockFilter = StockFilter.ALL },
                            label = { Text("All") }
                        )
                    }
                    item {
                        FilterChip(
                            selected = stockFilter == StockFilter.IN_STOCK,
                            onClick = { stockFilter = StockFilter.IN_STOCK },
                            label = { Text("In Stock") }
                        )
                    }
                    item {
                        FilterChip(
                            selected = stockFilter == StockFilter.LOW_STOCK,
                            onClick = { stockFilter = StockFilter.LOW_STOCK },
                            label = { Text("Low Stock") }
                        )
                    }
                    item {
                        FilterChip(
                            selected = stockFilter == StockFilter.OUT_OF_STOCK,
                            onClick = { stockFilter = StockFilter.OUT_OF_STOCK },
                            label = { Text("Out of Stock") }
                        )
                    }
                }

                // Sort By
                Text("Sort By")
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        FilterChip(
                            selected = sortBy == SortBy.NAME,
                            onClick = { sortBy = SortBy.NAME },
                            label = { Text("Name") }
                        )
                    }
                    item {
                        FilterChip(
                            selected = sortBy == SortBy.PRICE,
                            onClick = { sortBy = SortBy.PRICE },
                            label = { Text("Price") }
                        )
                    }
                    item {
                        FilterChip(
                            selected = sortBy == SortBy.STOCK,
                            onClick = { sortBy = SortBy.STOCK },
                            label = { Text("Stock") }
                        )
                    }
                    item {
                        FilterChip(
                            selected = sortBy == SortBy.CATEGORY,
                            onClick = { sortBy = SortBy.CATEGORY },
                            label = { Text("Category") }
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    onApplyFilter(
                        InventoryFilter(
                            category = selectedCategory,
                            stockFilter = stockFilter,
                            sortBy = sortBy
                        )
                    )
                    onDismiss()
                }
            ) {
                Text("Apply")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

// Data Models
data class InventoryItem(
    val id: String,
    val name: String,
    val sku: String,
    val price: Double,
    val stock: Int,
    val category: String,
    val description: String,
    val lowStockThreshold: Int,
    val createdAt: Long,
    val updatedAt: Long
)

data class InventoryFilter(
    val category: String = "All",
    val stockFilter: StockFilter = StockFilter.ALL,
    val sortBy: SortBy = SortBy.NAME
)

enum class StockFilter {
    ALL, IN_STOCK, LOW_STOCK, OUT_OF_STOCK
}

enum class SortBy {
    NAME, PRICE, STOCK, CATEGORY
}
