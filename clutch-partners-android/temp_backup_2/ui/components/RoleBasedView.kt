package com.clutch.partners.ui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.clutch.partners.data.model.PartnerRole
import com.clutch.partners.data.model.Permission

@Composable
fun RoleBasedView(
    requiredRole: PartnerRole? = null,
    requiredPermission: Permission? = null,
    userRole: PartnerRole,
    userPermissions: List<Permission>,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    val hasAccess = when {
        requiredRole != null -> userRole == requiredRole || userRole == PartnerRole.OWNER
        requiredPermission != null -> userPermissions.contains(requiredPermission) || userRole == PartnerRole.OWNER
        else -> true
    }

    if (hasAccess) {
        content()
    } else {
        Box(
            modifier = modifier.fillMaxSize(),
            contentAlignment = androidx.compose.ui.Alignment.Center
        ) {
            androidx.compose.material3.Text(
                text = "Access Denied\nYou don't have permission to view this content",
                color = Color.Gray,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
        }
    }
}

@Composable
fun RoleBasedButton(
    requiredRole: PartnerRole? = null,
    requiredPermission: Permission? = null,
    userRole: PartnerRole,
    userPermissions: List<Permission>,
    enabled: Boolean = true,
    onClick: () -> Unit,
    content: @Composable () -> Unit
) {
    val hasAccess = when {
        requiredRole != null -> userRole == requiredRole || userRole == PartnerRole.OWNER
        requiredPermission != null -> userPermissions.contains(requiredPermission) || userRole == PartnerRole.OWNER
        else -> true
    }

    androidx.compose.material3.Button(
        onClick = onClick,
        enabled = enabled && hasAccess
    ) {
        content()
    }
}
