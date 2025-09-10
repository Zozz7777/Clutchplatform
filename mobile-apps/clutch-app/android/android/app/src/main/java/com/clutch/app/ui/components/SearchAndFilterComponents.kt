package com.clutch.app.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.theme.ClutchRed
import com.clutch.app.ui.theme.White

/**
 * Advanced Search Bar with filters
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClutchSearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    onSearch: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "Search...",
    showFilters: Boolean = true,
    onFilterClick: (() -> Unit)? = null
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        OutlinedTextField(
            value = query,
            onValueChange = onQueryChange,
            placeholder = { Text(placeholder) },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = null,
                    tint = ClutchRed
                )
            },
            trailingIcon = {
                if (query.isNotEmpty()) {
                    IconButton(onClick = { onQueryChange("") }) {
                        Icon(
                            imageVector = Icons.Default.Clear,
                            contentDescription = "Clear",
                            tint = ClutchRed
                        )
                    }
                }
            },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(12.dp),
            singleLine = true
        )
        
        if (showFilters && onFilterClick != null) {
            IconButton(
                onClick = onFilterClick,
                modifier = Modifier
                    .size(48.dp)
                    .background(
                        color = ClutchRed,
                        shape = RoundedCornerShape(12.dp)
                    )
            ) {
                Icon(
                    imageVector = Icons.Default.FilterList,
                    contentDescription = "Filters",
                    tint = White
                )
            }
        }
    }
}

/**
 * Filter Chips Row
 */
@Composable
fun FilterChipsRow(
    filters: List<FilterChip>,
    selectedFilters: Set<String>,
    onFilterSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyRow(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(horizontal = 16.dp)
    ) {
        items(filters) { filter ->
            FilterChip(
                onClick = { onFilterSelected(filter.id) },
                label = { Text(filter.name) },
                selected = selectedFilters.contains(filter.id),
                leadingIcon = filter.icon?.let {
                    {
                        Icon(
                            imageVector = it,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = ClutchRed,
                    selectedLabelColor = White,
                    selectedLeadingIconColor = White
                )
            )
        }
    }
}

/**
 * Sort Options Bottom Sheet
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SortOptionsBottomSheet(
    isVisible: Boolean,
    onDismiss: () -> Unit,
    currentSort: SortOption,
    onSortSelected: (SortOption) -> Unit,
    modifier: Modifier = Modifier
) {
    if (isVisible) {
        ModalBottomSheet(
            onDismissRequest = onDismiss,
            modifier = modifier
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Text(
                    text = "Sort By",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
                
                SortOption.values().forEach { option ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = currentSort == option,
                            onClick = { onSortSelected(option) },
                            colors = RadioButtonDefaults.colors(selectedColor = ClutchRed)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = option.displayName,
                            fontSize = 16.sp,
                            color = Color.Black
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

/**
 * Advanced Filter Bottom Sheet
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdvancedFilterBottomSheet(
    isVisible: Boolean,
    onDismiss: () -> Unit,
    filters: FilterState,
    onFiltersChange: (FilterState) -> Unit,
    onApplyFilters: () -> Unit,
    onClearFilters: () -> Unit,
    modifier: Modifier = Modifier
) {
    if (isVisible) {
        ModalBottomSheet(
            onDismissRequest = onDismiss,
            modifier = modifier
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Text(
                    text = "Filters",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
                
                // Price Range
                Text(
                    text = "Price Range",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Black,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = filters.minPrice.toString(),
                        onValueChange = { 
                            filters.minPrice = it.toDoubleOrNull() ?: 0.0
                        },
                        label = { Text("Min Price") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp)
                    )
                    
                    OutlinedTextField(
                        value = filters.maxPrice.toString(),
                        onValueChange = { 
                            filters.maxPrice = it.toDoubleOrNull() ?: 0.0
                        },
                        label = { Text("Max Price") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp)
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Brand Filter
                Text(
                    text = "Brand",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Black,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(filters.availableBrands) { brand ->
                        FilterChip(
                            onClick = { 
                                filters.selectedBrands = if (filters.selectedBrands.contains(brand)) {
                                    filters.selectedBrands - brand
                                } else {
                                    filters.selectedBrands + brand
                                }
                            },
                            label = { Text(brand) },
                            selected = filters.selectedBrands.contains(brand),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = ClutchRed,
                                selectedLabelColor = White
                            )
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Availability Filter
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = filters.inStockOnly,
                        onCheckedChange = { filters.inStockOnly = it },
                        colors = CheckboxDefaults.colors(checkedColor = ClutchRed)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "In Stock Only",
                        fontSize = 16.sp,
                        color = Color.Black
                    )
                }
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    ClutchOutlinedButton(
                        text = "Clear",
                        onClick = onClearFilters,
                        modifier = Modifier.weight(1f)
                    )
                    
                    ClutchButton(
                        text = "Apply",
                        onClick = onApplyFilters,
                        modifier = Modifier.weight(1f)
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

/**
 * Filter Chip Data Class
 */
data class FilterChip(
    val id: String,
    val name: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector? = null
)

/**
 * Sort Options Enum
 */
enum class SortOption(val displayName: String) {
    RELEVANCE("Relevance"),
    PRICE_LOW_TO_HIGH("Price: Low to High"),
    PRICE_HIGH_TO_LOW("Price: High to Low"),
    NAME_A_TO_Z("Name: A to Z"),
    NAME_Z_TO_A("Name: Z to A"),
    NEWEST("Newest First"),
    RATING("Highest Rated")
}

/**
 * Filter State Data Class
 */
data class FilterState(
    var minPrice: Double = 0.0,
    var maxPrice: Double = 10000.0,
    var selectedBrands: Set<String> = emptySet(),
    var inStockOnly: Boolean = false,
    var availableBrands: List<String> = listOf("Toyota", "Honda", "Ford", "BMW", "Mercedes", "Audi")
)
