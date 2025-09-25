package com.clutch.partners.ui.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Store
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.partners.data.repository.PartnersRepository
import org.koin.compose.koinInject

@Composable
fun DashboardScreen(
    onLogout: () -> Unit
) {
    val repository: PartnersRepository = koinInject()
    val currentUser by repository.getCurrentUser().collectAsState(initial = null)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Welcome back!",
                        fontSize = 16.sp,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
                    )
                    Text(
                        text = currentUser?.businessName ?: "Partner",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                }
                
                Row {
                    IconButton(onClick = { /* TODO: Open notifications */ }) {
                        Icon(
                            imageVector = Icons.Default.Notifications,
                            contentDescription = "Notifications",
                            tint = MaterialTheme.colorScheme.onBackground
                        )
                    }
                    
                    IconButton(onClick = { /* TODO: Open settings */ }) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Settings",
                            tint = MaterialTheme.colorScheme.onBackground
                        )
                    }
                }
            }

            // Dashboard content
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Quick stats
                item {
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(getQuickStats()) { stat ->
                            QuickStatCard(stat = stat)
                        }
                    }
                }

                // Main sections
                item {
                    Text(
                        text = "Quick Actions",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onBackground,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }

                items(getDashboardSections()) { section ->
                    DashboardSectionCard(
                        section = section,
                        onClick = { /* TODO: Navigate to section */ }
                    )
                }
            }
        }
    }
}

@Composable
private fun QuickStatCard(stat: QuickStat) {
    Card(
        modifier = Modifier.width(140.dp),
        colors = CardDefaults.cardColors(
            containerColor = stat.backgroundColor
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 2.dp
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Icon(
                imageVector = stat.icon,
                contentDescription = stat.title,
                tint = stat.iconColor,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = stat.value,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = stat.textColor
            )
            
            Text(
                text = stat.title,
                fontSize = 12.sp,
                color = stat.textColor.copy(alpha = 0.8f)
            )
        }
    }
}

@Composable
private fun DashboardSectionCard(
    section: DashboardSection,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 4.dp
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = section.icon,
                contentDescription = section.title,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = section.title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Text(
                    text = section.description,
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            }
        }
    }
}

data class QuickStat(
    val title: String,
    val value: String,
    val icon: ImageVector,
    val backgroundColor: Color,
    val iconColor: Color,
    val textColor: Color
)

data class DashboardSection(
    val title: String,
    val description: String,
    val icon: ImageVector
)

private fun getQuickStats(): List<QuickStat> {
    return listOf(
        QuickStat(
            title = "Orders",
            value = "12",
            icon = Icons.Default.Assignment,
            backgroundColor = Color(0xFFE3F2FD),
            iconColor = Color(0xFF1976D2),
            textColor = Color(0xFF1976D2)
        ),
        QuickStat(
            title = "Revenue",
            value = "EGP 2,450",
            icon = Icons.Default.AccountBalanceWallet,
            backgroundColor = Color(0xFFE8F5E8),
            iconColor = Color(0xFF388E3C),
            textColor = Color(0xFF388E3C)
        ),
        QuickStat(
            title = "Pending",
            value = "3",
            icon = Icons.Default.Notifications,
            backgroundColor = Color(0xFFFFF3E0),
            iconColor = Color(0xFFF57C00),
            textColor = Color(0xFFF57C00)
        )
    )
}

private fun getDashboardSections(): List<DashboardSection> {
    return listOf(
        DashboardSection(
            title = "Orders & Appointments",
            description = "View and manage customer orders",
            icon = Icons.Default.Assignment
        ),
        DashboardSection(
            title = "Payments",
            description = "Track your earnings and payouts",
            icon = Icons.Default.AccountBalanceWallet
        ),
        DashboardSection(
            title = "Store Settings",
            description = "Manage your business profile",
            icon = Icons.Default.Store
        ),
        DashboardSection(
            title = "Business Dashboard",
            description = "View analytics and performance",
            icon = Icons.Default.Menu
        )
    )
}
