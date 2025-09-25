package com.clutch.partners.ui.screens.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.partners.data.model.PartnerPayment
import com.clutch.partners.data.model.PartnerRole
import com.clutch.partners.data.model.Permission
import com.clutch.partners.ui.components.RoleBasedButton
import com.clutch.partners.ui.components.RoleBasedView

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PaymentsScreen(
    weeklyIncome: Double,
    payoutCountdown: String,
    paymentHistory: List<PartnerPayment>,
    userRole: PartnerRole,
    userPermissions: List<Permission>,
    onRefresh: () -> Unit,
    onDownloadReport: () -> Unit,
    isLoading: Boolean = false
) {
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
                text = "Payments",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
            
            Row {
                // Refresh button - all roles with view_payments permission
                RoleBasedButton(
                    requiredPermission = Permission.VIEW_PAYMENTS,
                    userRole = userRole,
                    userPermissions = userPermissions,
                    onClick = onRefresh
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                }
                
                // Download report - only accountants, managers, and owners
                RoleBasedButton(
                    requiredPermission = Permission.VIEW_PAYMENTS,
                    userRole = userRole,
                    userPermissions = userPermissions,
                    onClick = onDownloadReport
                ) {
                    Icon(Icons.Default.Download, contentDescription = "Download Report")
                }
            }
        }

        if (isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Weekly income card
                item {
                    WeeklyIncomeCard(
                        weeklyIncome = weeklyIncome,
                        payoutCountdown = payoutCountdown
                    )
                }
                
                // Payment history
                item {
                    Text(
                        text = "Payment History",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }
                
                if (paymentHistory.isEmpty()) {
                    item {
                        EmptyPaymentsState()
                    }
                } else {
                    items(paymentHistory) { payment ->
                        PaymentCard(payment = payment)
                    }
                }
            }
        }
    }
}

@Composable
fun WeeklyIncomeCard(
    weeklyIncome: Double,
    payoutCountdown: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        )
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            Text(
                text = "This Week's Income",
                fontSize = 16.sp,
                color = MaterialTheme.colorScheme.onPrimaryContainer
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "EGP ${String.format("%.2f", weeklyIncome)}",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onPrimaryContainer
            )
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Next Payout",
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
                Text(
                    text = payoutCountdown,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
        }
    }
}

@Composable
fun PaymentCard(payment: PartnerPayment) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "EGP ${String.format("%.2f", payment.amount)}",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = payment.type.replaceFirstChar { it.uppercase() },
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Text(
                    text = payment.createdAt.toString().substring(0, 10),
                    fontSize = 12.sp,
                    color = Color.Gray
                )
            }
            
            PaymentStatusBadge(status = payment.status)
        }
    }
}

@Composable
fun PaymentStatusBadge(status: String) {
    val (backgroundColor, textColor) = when (status.lowercase()) {
        "pending" -> Color(0xFFFFA726) to Color.White
        "completed" -> Color(0xFF4CAF50) to Color.White
        "failed" -> Color(0xFFF44336) to Color.White
        "cancelled" -> Color(0xFF9E9E9E) to Color.White
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
fun EmptyPaymentsState() {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = androidx.compose.material.icons.Icons.Default.CreditCard,
                contentDescription = null,
                modifier = Modifier.size(48.dp),
                tint = Color.Gray
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "No payments yet",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.Gray
            )
            Text(
                text = "Your payment history will appear here once you start receiving payments.",
                fontSize = 14.sp,
                color = Color.Gray,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
        }
    }
}
