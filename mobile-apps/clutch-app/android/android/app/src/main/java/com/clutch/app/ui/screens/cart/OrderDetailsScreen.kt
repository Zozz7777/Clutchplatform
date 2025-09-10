package com.clutch.app.ui.screens.cart

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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.clutch.app.ui.theme.ClutchRed
import com.clutch.app.ui.theme.White

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderDetailsScreen(
    navController: NavController,
    orderId: String,
    modifier: Modifier = Modifier
) {
    // Mock order data - will be replaced with real data from ViewModel
    val order = remember {
        OrderData(
            id = orderId,
            orderNumber = "ORD-2024-001",
            status = "Processing",
            orderDate = "2024-01-15",
            deliveryDate = "2024-01-20",
            totalAmount = "₹2,450.00",
            items = listOf(
                OrderItemData("Oil Filter", "Engine", 1, "₹450.00", "₹450.00"),
                OrderItemData("Brake Pads", "Brakes", 2, "₹800.00", "₹1,600.00"),
                OrderItemData("Air Filter", "Engine", 1, "₹400.00", "₹400.00")
            ),
            shippingAddress = "123 Main Street, Cairo, Egypt",
            paymentMethod = "Credit Card ending in 1234"
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5))
    ) {
        // Header
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = ClutchRed),
            shape = RoundedCornerShape(bottomStart = 24.dp, bottomEnd = 24.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { navController.popBackStack() }
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = White
                    )
                }
                
                Text(
                    text = "Order Details",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = White
                )
                
                IconButton(
                    onClick = { /* Share order */ }
                ) {
                    Icon(
                        imageVector = Icons.Default.Share,
                        contentDescription = "Share",
                        tint = White
                    )
                }
            }
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Order Status Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Order Status",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.Black
                            )
                            
                            Card(
                                colors = CardDefaults.cardColors(
                                    containerColor = when (order.status) {
                                        "Processing" -> Color(0xFF3B82F6).copy(alpha = 0.1f)
                                        "Shipped" -> Color(0xFF10B981).copy(alpha = 0.1f)
                                        "Delivered" -> Color(0xFF10B981).copy(alpha = 0.1f)
                                        else -> Color(0xFF6B7280).copy(alpha = 0.1f)
                                    }
                                ),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = order.status,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = when (order.status) {
                                        "Processing" -> Color(0xFF3B82F6)
                                        "Shipped" -> Color(0xFF10B981)
                                        "Delivered" -> Color(0xFF10B981)
                                        else -> Color(0xFF6B7280)
                                    },
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                                )
                            }
                        }
                        
                        Text(
                            text = "Order #${order.orderNumber}",
                            fontSize = 16.sp,
                            color = Color(0xFF6B7280)
                        )
                        
                        Text(
                            text = "Placed on ${order.orderDate}",
                            fontSize = 14.sp,
                            color = Color(0xFF6B7280)
                        )
                    }
                }
            }

            // Order Items Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp)
                    ) {
                        Text(
                            text = "Order Items",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black,
                            modifier = Modifier.padding(bottom = 16.dp)
                        )
                        
                        items(order.items) { item ->
                            OrderItemRow(item = item)
                            if (item != order.items.last()) {
                                Divider(
                                    color = Color(0xFFF3F4F6),
                                    thickness = 1.dp,
                                    modifier = Modifier.padding(vertical = 12.dp)
                                )
                            }
                        }
                    }
                }
            }

            // Order Summary Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Order Summary",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Subtotal",
                                fontSize = 16.sp,
                                color = Color(0xFF6B7280)
                            )
                            Text(
                                text = "₹2,450.00",
                                fontSize = 16.sp,
                                color = Color.Black
                            )
                        }
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Shipping",
                                fontSize = 16.sp,
                                color = Color(0xFF6B7280)
                            )
                            Text(
                                text = "Free",
                                fontSize = 16.sp,
                                color = Color(0xFF10B981)
                            )
                        }
                        
                        Divider(color = Color(0xFFF3F4F6), thickness = 1.dp)
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Total",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.Black
                            )
                            Text(
                                text = order.totalAmount,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = ClutchRed
                            )
                        }
                    }
                }
            }

            // Shipping Information Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Shipping Information",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                        
                        Row(
                            verticalAlignment = Alignment.Top
                        ) {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = null,
                                tint = ClutchRed,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = order.shippingAddress,
                                fontSize = 16.sp,
                                color = Color(0xFF6B7280)
                            )
                        }
                        
                        Row(
                            verticalAlignment = Alignment.Top
                        ) {
                            Icon(
                                imageVector = Icons.Default.Payment,
                                contentDescription = null,
                                tint = ClutchRed,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = order.paymentMethod,
                                fontSize = 16.sp,
                                color = Color(0xFF6B7280)
                            )
                        }
                    }
                }
            }

            // Action Buttons
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = { /* Track order */ },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = ClutchRed
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Track Order")
                    }
                    
                    Button(
                        onClick = { /* Contact support */ },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Contact Support", color = White)
                    }
                }
            }
        }
    }
}

@Composable
private fun OrderItemRow(item: OrderItemData) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = item.name,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Text(
                text = item.category,
                fontSize = 14.sp,
                color = Color(0xFF6B7280)
            )
            Text(
                text = "Qty: ${item.quantity}",
                fontSize = 14.sp,
                color = Color(0xFF6B7280)
            )
        }
        
        Column(
            horizontalAlignment = Alignment.End
        ) {
            Text(
                text = item.totalPrice,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Text(
                text = item.unitPrice,
                fontSize = 14.sp,
                color = Color(0xFF6B7280)
            )
        }
    }
}

// Data classes
data class OrderData(
    val id: String,
    val orderNumber: String,
    val status: String,
    val orderDate: String,
    val deliveryDate: String,
    val totalAmount: String,
    val items: List<OrderItemData>,
    val shippingAddress: String,
    val paymentMethod: String
)

data class OrderItemData(
    val name: String,
    val category: String,
    val quantity: Int,
    val unitPrice: String,
    val totalPrice: String
)
