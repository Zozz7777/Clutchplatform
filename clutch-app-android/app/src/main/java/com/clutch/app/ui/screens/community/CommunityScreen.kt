package com.clutch.app.ui.screens.community

import androidx.compose.foundation.background
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
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.theme.ClutchAppTheme
import com.clutch.app.ui.theme.ClutchRed

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CommunityScreen() {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Community",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = ClutchRed
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { /* TODO: Add new tip */ },
                containerColor = ClutchRed
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Tip", tint = Color.White)
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFFF0F2F5))
                .padding(16.dp)
        ) {
            // Community Stats
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                CommunityStatCard(title = "Tips", count = "24", icon = Icons.Default.Lightbulb)
                CommunityStatCard(title = "Reviews", count = "156", icon = Icons.Default.Star)
                CommunityStatCard(title = "Points", count = "1,250", icon = Icons.Default.EmojiEvents)
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Recent Tips
            Text(
                text = "Recent Tips",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    CommunityTipCard(
                        title = "How to Check Engine Oil",
                        content = "Always check your engine oil when the car is cold and on level ground...",
                        author = "Ahmed M.",
                        votes = 12,
                        timeAgo = "2 hours ago"
                    )
                }
                item {
                    CommunityTipCard(
                        title = "Winter Tire Maintenance",
                        content = "Make sure to rotate your winter tires every 5,000 km for even wear...",
                        author = "Sarah K.",
                        votes = 8,
                        timeAgo = "5 hours ago"
                    )
                }
                item {
                    CommunityTipCard(
                        title = "Battery Care Tips",
                        content = "Keep your battery terminals clean and check the water level monthly...",
                        author = "Mohammed A.",
                        votes = 15,
                        timeAgo = "1 day ago"
                    )
                }
            }
        }
    }
}

@Composable
fun CommunityStatCard(
    title: String,
    count: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector
) {
    Card(
        modifier = Modifier.width(100.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = ClutchRed,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = count,
                fontSize = 20.sp,
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
fun CommunityTipCard(
    title: String,
    content: String,
    author: String,
    votes: Int,
    timeAgo: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = title,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = content,
                fontSize = 14.sp,
                color = Color.Gray,
                maxLines = 2
            )
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "By $author • $timeAgo",
                    fontSize = 12.sp,
                    color = Color.Gray
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.ThumbUp,
                        contentDescription = "Votes",
                        tint = ClutchRed,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = votes.toString(),
                        fontSize = 12.sp,
                        color = ClutchRed
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun CommunityScreenPreview() {
    ClutchAppTheme {
        CommunityScreen()
    }
}
