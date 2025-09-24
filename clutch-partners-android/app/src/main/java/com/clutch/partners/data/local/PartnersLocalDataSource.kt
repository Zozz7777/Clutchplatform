package com.clutch.partners.data.local

import com.clutch.partners.data.model.PartnerOrder
import com.clutch.partners.data.model.PartnerPayment
import com.clutch.partners.data.model.PartnerUser
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PartnersLocalDataSource @Inject constructor() {
    
    private val _currentUser = MutableStateFlow<PartnerUser?>(null)
    val currentUser: Flow<PartnerUser?> = _currentUser.asStateFlow()
    
    private val _cachedOrders = MutableStateFlow<List<PartnerOrder>>(emptyList())
    val cachedOrders: Flow<List<PartnerOrder>> = _cachedOrders.asStateFlow()
    
    private val _cachedPayments = MutableStateFlow<List<PartnerPayment>>(emptyList())
    val cachedPayments: Flow<List<PartnerPayment>> = _cachedPayments.asStateFlow()
    
    fun savePartnerUser(partner: PartnerUser) {
        _currentUser.value = partner
    }
    
    fun getCurrentUser(): Flow<PartnerUser?> = currentUser
    
    fun saveOrders(orders: List<PartnerOrder>) {
        _cachedOrders.value = orders
    }
    
    fun getCachedOrders(): Flow<List<PartnerOrder>> = cachedOrders
    
    fun updateOrder(updatedOrder: PartnerOrder) {
        val currentOrders = _cachedOrders.value.toMutableList()
        val index = currentOrders.indexOfFirst { it.orderId == updatedOrder.orderId }
        if (index != -1) {
            currentOrders[index] = updatedOrder
            _cachedOrders.value = currentOrders
        }
    }
    
    fun savePayments(payments: List<PartnerPayment>) {
        _cachedPayments.value = payments
    }
    
    fun getCachedPayments(): Flow<List<PartnerPayment>> = cachedPayments
    
    fun clearAllData() {
        _currentUser.value = null
        _cachedOrders.value = emptyList()
        _cachedPayments.value = emptyList()
    }
}
