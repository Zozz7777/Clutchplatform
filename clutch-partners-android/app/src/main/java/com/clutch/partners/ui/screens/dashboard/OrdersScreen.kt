package com.clutch.partners.ui.screens.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.partners.data.model.PartnerOrder
import com.clutch.partners.data.model.PartnerRole
import com.clutch.partners.data.model.Permission
import com.clutch.partners.ui.components.RoleBasedButton
import com.clutch.partners.ui.components.RoleBasedView

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersScreen(
    orders: List<PartnerOrder>,
    userRole: PartnerRole,
    userPermissions: List<Permission>,
    onOrderClick: (PartnerOrder) -> Unit,
    onUpdateOrderStatus: (PartnerOrder, String) -> Unit,
    onRefresh: () -> Unit,
    isLoading: Boolean = false
) {
    var showFilterDialog by remember { mutableStateOf(false) }
    var selectedStatus by remember { mutableStateOf("all") }

    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        // Header with actions
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Orders & Appointments",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
            
            Row {
                // Filter button - only for managers and owners
                RoleBasedView(
                    requiredPermission = Permission.MANAGE_ORDERS,
                    userRole = userRole,
                    userPermissions = userPermissions
                ) {
                    IconButton(onClick = { showFilterDialog = true }) {
                        Icon(Icons.Default.FilterList, contentDescription = "Filter")
                    }
                }
                
                // Add order button - only for managers and owners
                RoleBasedButton(
                    requiredPermission = Permission.MANAGE_ORDERS,
                    userRole = userRole,
                    userPermissions = userPermissions,
                    onClick = { /* Navigate to add order */ }
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add Order")
                }
            }
        }

        // Orders list
        if (isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else if (orders.isEmpty()) {
            EmptyOrdersState()
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(orders) { order ->
                    OrderCard(
                        order = order,
                        userRole = userRole,
                        userPermissions = userPermissions,
                        onClick = { onOrderClick(order) },
                        onUpdateStatus = { onUpdateOrderStatus(order, it) }
                    )
                }
            }
        }
    }

    // Filter dialog
    if (showFilterDialog) {
        FilterDialog(
            selectedStatus = selectedStatus,
            onStatusSelected = { selectedStatus = it },
            onDismiss = { showFilterDialog = false }
        )
    }
}

@Composable
fun OrderCard(
    order: PartnerOrder,
    userRole: PartnerRole,
    userPermissions: List<Permission>,
    onClick: () -> Unit,
    onUpdateStatus: (String) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = onClick
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = order.serviceName,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "Customer: ${order.customerName}",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                    Text(
                        text = "Amount: EGP ${order.totalAmount}",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
                
                // Status badge
                StatusBadge(status = order.status)
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Action buttons based on role
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // View details - all roles
                OutlinedButton(onClick = onClick) {
                    Text("View Details")
                }
                
                // Update status - only staff, managers, and owners
                RoleBasedButton(
                    requiredPermission = Permission.UPDATE_ORDER_STATUS,
                    userRole = userRole,
                    userPermissions = userPermissions,
                    onClick = { onUpdateStatus("confirmed") }
                ) {
                    Text("Confirm")
                }
                
                // Reject order - only managers and owners
                RoleBasedButton(
                    requiredPermission = Permission.MANAGE_ORDERS,
                    userRole = userRole,
                    userPermissions = userPermissions,
                    onClick = { onUpdateStatus("rejected") }
                ) {
                    Text("Reject")
                }
            }
        }
    }
}

@Composable
fun StatusBadge(status: String) {
    val (backgroundColor, textColor) = when (status.lowercase()) {
        "pending" -> Color(0xFFFFA726) to Color.White
        "paid" -> Color(0xFF4CAF50) to Color.White
        "rejected" -> Color(0xFFF44336) to Color.White
        "completed" -> Color(0xFF2196F3) to Color.White
        else -> Color.Gray to Color.White
    }
    
    Surface(
        color = backgroundColor,
        shape = androidx.compose.foundation.shape.RoundedCornerShape(12.dp)
    ) {
        Text(
            text = status.replaceFirstChar { it.uppercase() },
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            color = textColor,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun EmptyOrdersState() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = androidx.compose.material.icons.Icons.Default.ShoppingCart,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = Color.Gray
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "No Orders Yet",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.Gray
            )
            Text(
                text = "You'll see customer orders and appointments here once they start coming in.",
                fontSize = 14.sp,
                color = Color.Gray,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
        }
    }
}

@Composable
fun FilterDialog(
    selectedStatus: String,
    onStatusSelected: (String) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Filter Orders") },
        text = {
            Column {
                val statuses = listOf("all", "pending", "paid", "rejected", "completed")
                statuses.forEach { status ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = selectedStatus == status,
                            onClick = { onStatusSelected(status) }
                        )
                        Text(
                            text = status.replaceFirstChar { it.uppercase() },
                            modifier = Modifier.padding(start = 8.dp)
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Apply")
            }
        }
    )
}
