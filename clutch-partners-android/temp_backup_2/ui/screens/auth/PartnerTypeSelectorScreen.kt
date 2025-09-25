package com.clutch.partners.ui.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.partners.data.model.PartnerType

@Composable
fun PartnerTypeSelectorScreen(
    onPartnerTypeSelected: (String) -> Unit
) {
    val partnerTypes = listOf(
        PartnerType.REPAIR_CENTER,
        PartnerType.AUTO_PARTS_SHOP,
        PartnerType.ACCESSORIES_SHOP,
        PartnerType.IMPORTER_MANUFACTURER,
        PartnerType.SERVICE_CENTER
    )

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
            Text(
                text = "What type of business are you?",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground,
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 32.dp)
            )

            // Partner type cards
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(partnerTypes) { partnerType ->
                    PartnerTypeCard(
                        partnerType = partnerType,
                        onClick = { onPartnerTypeSelected(partnerType.name.lowercase()) }
                    )
                }
            }
        }
    }
}

@Composable
private fun PartnerTypeCard(
    partnerType: PartnerType,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
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
            // Icon
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = partnerType.icon,
                    fontSize = 24.sp
                )
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            // Content
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = partnerType.displayName,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = getPartnerTypeDescription(partnerType),
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                    lineHeight = 20.sp
                )
            }
        }
    }
}

private fun getPartnerTypeDescription(partnerType: PartnerType): String {
    return when (partnerType) {
        PartnerType.REPAIR_CENTER -> "Provide automotive repair and maintenance services"
        PartnerType.AUTO_PARTS_SHOP -> "Sell automotive parts and accessories"
        PartnerType.ACCESSORIES_SHOP -> "Specialize in car accessories and modifications"
        PartnerType.IMPORTER_MANUFACTURER -> "Import or manufacture automotive parts"
        PartnerType.SERVICE_CENTER -> "Offer comprehensive automotive services"
    }
}
