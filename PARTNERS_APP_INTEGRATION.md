# 🤝 **CLUTCH PARTNERS APP - AUTO PARTS SHOP INTEGRATION**

## 📱 **ENHANCED PARTNERS APP FOR MECHANICS & AUTO PARTS SHOPS**

### **1. Dual-Sided Partners App Architecture**

#### **A. Mechanics Side Features**
```typescript
interface MechanicsAppFeatures {
  // Existing features
  serviceOrders: ServiceOrderManagement;
  customerManagement: CustomerManagement;
  scheduling: AppointmentScheduling;
  
  // New auto parts features
  partsOrdering: {
    orderParts: (parts: Part[], vehicle: Vehicle) => Promise<PartsOrder>;
    trackOrders: (orderId: string) => Promise<OrderStatus>;
    manageQuotes: (quotes: Quote[]) => Promise<void>;
  };
  
  // Enhanced features
  inventoryIntegration: {
    checkAvailability: (partId: string) => Promise<AvailabilityStatus>;
    requestParts: (parts: Part[]) => Promise<RequestResult>;
    trackDeliveries: (orderId: string) => Promise<DeliveryStatus>;
  };
}
```

#### **B. Auto Parts Shops Side Features**
```typescript
interface PartsShopAppFeatures {
  // Core shop management
  shopProfile: ShopProfileManagement;
  inventory: InventoryManagement;
  orders: OrderManagement;
  
  // New quote management
  quoteSystem: {
    receiveOrderNotifications: () => Promise<OrderNotification[]>;
    provideQuotes: (orderId: string, quote: Quote) => Promise<void>;
    manageInventory: (parts: Part[]) => Promise<void>;
    trackSales: () => Promise<SalesReport>;
  };
  
  // Enhanced features
  customerService: {
    chatWithCustomers: (customerId: string) => Promise<ChatSession>;
    provideSupport: (issue: SupportIssue) => Promise<void>;
    manageReviews: () => Promise<Review[]>;
  };
}
```

### **2. Auto Parts Shop Onboarding System**

#### **A. Shop Registration Process**
```typescript
interface ShopOnboardingFlow {
  step1: {
    businessInfo: {
      shopName: string;
      businessLicense: string;
      taxId: string;
      contactInfo: ContactInfo;
    };
  };
  
  step2: {
    locationInfo: {
      address: Address;
      coordinates: Coordinates;
      serviceRadius: number; // in kilometers
      deliveryAreas: DeliveryArea[];
    };
  };
  
  step3: {
    vehicleBrands: {
      supportedBrands: string[]; // ['Toyota', 'Honda', 'BMW', etc.]
      specializations: string[]; // ['Engine Parts', 'Brake Systems', etc.]
      certifications: string[]; // ['ASE Certified', 'OEM Parts', etc.]
    };
  };
  
  step4: {
    inventorySetup: {
      currentInventory: Part[];
      inventorySystem: 'manual' | 'existing_system' | 'clutch_system';
      existingSystemInfo?: ExistingSystemInfo;
    };
  };
  
  step5: {
    pricingStrategy: {
      markupPercentage: number;
      competitivePricing: boolean;
      bulkDiscounts: DiscountTier[];
    };
  };
  
  step6: {
    verification: {
      documents: Document[];
      bankAccount: BankAccountInfo;
      insuranceInfo: InsuranceInfo;
    };
  };
}
```

#### **B. Onboarding API Implementation**
```javascript
// shared-backend/routes/shopOnboarding.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../services/database');

// Start shop onboarding
router.post('/onboarding/start', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { businessInfo } = req.body;

    const onboardingData = {
      userId,
      businessInfo,
      status: 'in_progress',
      currentStep: 1,
      completedSteps: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const onboardingCollection = await getCollection('shopOnboarding');
    const result = await onboardingCollection.insertOne(onboardingData);
    onboardingData._id = result.insertedId;

    res.status(201).json({
      success: true,
      data: onboardingData,
      message: 'Onboarding started successfully'
    });
  } catch (error) {
    console.error('Start onboarding error:', error);
    res.status(500).json({
      success: false,
      error: 'ONBOARDING_START_FAILED',
      message: 'Failed to start onboarding'
    });
  }
});

// Update onboarding step
router.put('/onboarding/:id/step/:stepNumber', authenticateToken, async (req, res) => {
  try {
    const { id, stepNumber } = req.params;
    const stepData = req.body;
    const userId = req.user.userId;

    const onboardingCollection = await getCollection('shopOnboarding');
    const onboarding = await onboardingCollection.findOne({ 
      _id: new ObjectId(id), 
      userId 
    });

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        error: 'ONBOARDING_NOT_FOUND',
        message: 'Onboarding process not found'
      });
    }

    // Update step data
    const updateData = {
      [`step${stepNumber}`]: stepData,
      currentStep: Math.max(onboarding.currentStep, parseInt(stepNumber) + 1),
      updatedAt: new Date()
    };

    if (!onboarding.completedSteps.includes(parseInt(stepNumber))) {
      updateData.completedSteps = [...onboarding.completedSteps, parseInt(stepNumber)];
    }

    await onboardingCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Check if onboarding is complete
    if (updateData.completedSteps.length === 6) {
      await this.completeOnboarding(id);
    }

    res.json({
      success: true,
      message: 'Step updated successfully'
    });
  } catch (error) {
    console.error('Update onboarding step error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_STEP_FAILED',
      message: 'Failed to update step'
    });
  }
});

// Complete onboarding and create shop
async function completeOnboarding(onboardingId) {
  try {
    const onboardingCollection = await getCollection('shopOnboarding');
    const onboarding = await onboardingCollection.findOne({ _id: new ObjectId(onboardingId) });

    if (!onboarding) {
      throw new Error('Onboarding not found');
    }

    // Create shop profile
    const shopData = {
      userId: onboarding.userId,
      businessInfo: onboarding.step1.businessInfo,
      locationInfo: onboarding.step2.locationInfo,
      vehicleBrands: onboarding.step3.vehicleBrands,
      inventorySetup: onboarding.step4.inventorySetup,
      pricingStrategy: onboarding.step5.pricingStrategy,
      verification: onboarding.step6.verification,
      status: 'pending_verification',
      onboardingCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const shopsCollection = await getCollection('partsShops');
    const result = await shopsCollection.insertOne(shopData);
    shopData._id = result.insertedId;

    // Update onboarding status
    await onboardingCollection.updateOne(
      { _id: new ObjectId(onboardingId) },
      { 
        $set: { 
          status: 'completed',
          shopId: shopData._id,
          updatedAt: new Date()
        }
      }
    );

    // Trigger verification process
    await triggerShopVerification(shopData._id);

    return shopData;
  } catch (error) {
    console.error('Complete onboarding error:', error);
    throw error;
  }
}

module.exports = router;
```

### **3. Real-Time Order Notification System**

#### **A. Order Notification Flow**
```typescript
interface OrderNotificationSystem {
  // When a customer places an auto parts order
  customerOrderPlaced: {
    trigger: 'auto_parts_order_created';
    action: 'notify_nearby_shops';
    criteria: {
      location: Coordinates;
      vehicleBrand: string;
      serviceRadius: number;
    };
  };
  
  // Shop receives notification
  shopNotification: {
    type: 'new_parts_order';
    data: {
      orderId: string;
      customerLocation: Coordinates;
      vehicleInfo: VehicleInfo;
      partsList: Part[];
      estimatedDelivery: string;
      priority: 'high' | 'medium' | 'low';
    };
  };
  
  // Shop responds with quote
  shopQuoteResponse: {
    action: 'provide_quote';
    data: {
      orderId: string;
      availableParts: Part[];
      missingParts: Part[];
      totalPrice: number;
      estimatedDelivery: string;
      notes: string;
    };
  };
}
```

#### **B. Real-Time Notification Implementation**
```javascript
// shared-backend/services/notificationService.js
const { getCollection } = require('./database');
const { sendPushNotification } = require('./pushNotifications');
const { calculateDistance } = require('./location');

class NotificationService {
  async notifyShopsAboutOrder(orderId) {
    try {
      const ordersCollection = await getCollection('autoPartsOrders');
      const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });

      if (!order) {
        throw new Error('Order not found');
      }

      // Find nearby shops that handle this vehicle brand
      const shopsCollection = await getCollection('partsShops');
      const nearbyShops = await this.findNearbyShops(
        order.deliveryLocation.coordinates,
        order.vehicle.make,
        50 // 50km radius
      );

      // Send notifications to each shop
      const notifications = [];
      for (const shop of nearbyShops) {
        const notification = await this.sendOrderNotification(shop, order);
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Notify shops error:', error);
      throw error;
    }
  }

  async findNearbyShops(coordinates, vehicleMake, radiusKm) {
    const shopsCollection = await getCollection('partsShops');
    
    const shops = await shopsCollection.find({
      status: 'active',
      'vehicleBrands.supportedBrands': { $in: [vehicleMake] },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [coordinates.lng, coordinates.lat]
          },
          $maxDistance: radiusKm * 1000
        }
      }
    }).toArray();

    return shops;
  }

  async sendOrderNotification(shop, order) {
    try {
      const notificationData = {
        type: 'new_parts_order',
        shopId: shop._id,
        orderId: order._id,
        title: 'New Auto Parts Order',
        message: `New order for ${order.vehicle.make} ${order.vehicle.model} - ${order.parts.length} parts`,
        data: {
          orderId: order._id,
          customerLocation: order.deliveryLocation.coordinates,
          vehicleInfo: order.vehicle,
          partsList: order.parts,
          estimatedDelivery: this.calculateDeliveryTime(order.deliveryLocation, shop.location),
          priority: this.calculatePriority(order),
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
        },
        createdAt: new Date()
      };

      // Store notification in database
      const notificationsCollection = await getCollection('notifications');
      await notificationsCollection.insertOne(notificationData);

      // Send push notification
      await sendPushNotification(shop.userId, notificationData);

      return notificationData;
    } catch (error) {
      console.error('Send order notification error:', error);
      throw error;
    }
  }

  calculateDeliveryTime(customerLocation, shopLocation) {
    const distance = calculateDistance(customerLocation, shopLocation);
    
    if (distance <= 10) return '1-2 hours';
    if (distance <= 25) return '2-4 hours';
    if (distance <= 50) return '4-8 hours';
    if (distance <= 100) return '1 day';
    return '1-2 days';
  }

  calculatePriority(order) {
    // Priority based on order urgency and value
    const totalParts = order.parts.length;
    const hasUrgentParts = order.parts.some(part => 
      part.category.toLowerCase().includes('brake') || 
      part.category.toLowerCase().includes('engine')
    );

    if (hasUrgentParts && totalParts <= 3) return 'high';
    if (totalParts <= 5) return 'medium';
    return 'low';
  }
}

module.exports = new NotificationService();
```

### **4. Shop Quote Management System**

#### **A. Quote Response Interface**
```typescript
interface ShopQuoteResponse {
  orderId: string;
  shopId: string;
  availableParts: Array<{
    partId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    inStock: boolean;
    estimatedDelivery: string;
  }>;
  missingParts: Array<{
    partId: string;
    name: string;
    reason: 'out_of_stock' | 'not_available' | 'special_order';
    alternativeParts?: AlternativePart[];
  }>;
  totalPrice: number;
  estimatedDelivery: string;
  notes: string;
  validUntil: Date;
  terms: {
    warranty: string;
    returnPolicy: string;
    paymentTerms: string;
  };
}
```

#### **B. Quote Management API**
```javascript
// shared-backend/routes/shopQuotes.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../services/database');

// Provide quote for order
router.post('/provide-quote', authenticateToken, requireRole(['parts_shop']), async (req, res) => {
  try {
    const { orderId, availableParts, missingParts, totalPrice, estimatedDelivery, notes, terms } = req.body;
    const shopId = req.user.shopId;

    // Validate order exists and is still open for quotes
    const ordersCollection = await getCollection('autoPartsOrders');
    const order = await ordersCollection.findOne({ 
      _id: new ObjectId(orderId),
      status: 'quoted'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: 'Order not found or no longer accepting quotes'
      });
    }

    // Create quote
    const quoteData = {
      id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      shopId,
      availableParts,
      missingParts,
      totalPrice: parseFloat(totalPrice),
      estimatedDelivery,
      notes: notes || '',
      terms: terms || {},
      status: 'provided',
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date()
    };

    // Update order with new quote
    await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $push: { quotes: quoteData },
        $set: { updatedAt: new Date() }
      }
    );

    // Notify customer about new quote
    await this.notifyCustomerAboutQuote(order.userId, quoteData);

    res.json({
      success: true,
      data: quoteData,
      message: 'Quote provided successfully'
    });
  } catch (error) {
    console.error('Provide quote error:', error);
    res.status(500).json({
      success: false,
      error: 'PROVIDE_QUOTE_FAILED',
      message: 'Failed to provide quote'
    });
  }
});

// Get shop's quotes
router.get('/shop-quotes', authenticateToken, requireRole(['parts_shop']), async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const { status, limit = 20, page = 1 } = req.query;

    const ordersCollection = await getCollection('autoPartsOrders');
    const filter = { 'quotes.shopId': shopId };
    
    if (status) {
      filter['quotes.status'] = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [orders, total] = await Promise.all([
      ordersCollection.find(filter)
        .sort({ 'quotes.createdAt': -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      ordersCollection.countDocuments(filter)
    ]);

    // Extract quotes from orders
    const quotes = [];
    orders.forEach(order => {
      const shopQuotes = order.quotes.filter(quote => quote.shopId === shopId);
      shopQuotes.forEach(quote => {
        quotes.push({
          ...quote,
          order: {
            id: order._id,
            vehicle: order.vehicle,
            deliveryLocation: order.deliveryLocation,
            customerId: order.userId
          }
        });
      });
    });

    res.json({
      success: true,
      data: quotes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get shop quotes error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_QUOTES_FAILED',
      message: 'Failed to retrieve quotes'
    });
  }
});

module.exports = router;
```

### **5. Enhanced Partners App UI Components**

#### **A. Shop Dashboard**
```tsx
interface ShopDashboardProps {
  shop: PartsShop;
  notifications: Notification[];
  recentOrders: Order[];
  inventoryAlerts: InventoryAlert[];
}

const ShopDashboard: React.FC<ShopDashboardProps> = ({
  shop,
  notifications,
  recentOrders,
  inventoryAlerts
}) => {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.shopName}>{shop.businessInfo.shopName}</Text>
        <Text style={styles.status}>Status: {shop.status}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <StatCard 
          title="Pending Orders"
          value={notifications.filter(n => n.type === 'new_parts_order').length}
          icon="shopping-cart"
        />
        <StatCard 
          title="Active Quotes"
          value={recentOrders.filter(o => o.status === 'quoted').length}
          icon="dollar-sign"
        />
        <StatCard 
          title="Low Stock Items"
          value={inventoryAlerts.length}
          icon="alert-triangle"
        />
      </View>

      {/* Recent Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Notifications</Text>
        {notifications.slice(0, 5).map(notification => (
          <NotificationCard 
            key={notification.id}
            notification={notification}
            onPress={() => handleNotificationPress(notification)}
          />
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickActionButton 
            title="View Orders"
            icon="list"
            onPress={() => navigation.navigate('Orders')}
          />
          <QuickActionButton 
            title="Manage Inventory"
            icon="package"
            onPress={() => navigation.navigate('Inventory')}
          />
          <QuickActionButton 
            title="Provide Quote"
            icon="message-circle"
            onPress={() => navigation.navigate('Quotes')}
          />
        </View>
      </View>
    </ScrollView>
  );
};
```

#### **B. Order Notification Card**
```tsx
interface OrderNotificationCardProps {
  notification: OrderNotification;
  onPress: () => void;
}

const OrderNotificationCard: React.FC<OrderNotificationCardProps> = ({
  notification,
  onPress
}) => {
  const { orderId, vehicleInfo, partsList, estimatedDelivery, priority } = notification.data;

  return (
    <TouchableOpacity style={styles.notificationCard} onPress={onPress}>
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>New Parts Order</Text>
        <View style={[styles.priorityBadge, styles[`priority${priority}`]]}>
          <Text style={styles.priorityText}>{priority.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.vehicleInfo}>
        {vehicleInfo.make} {vehicleInfo.model} ({vehicleInfo.year})
      </Text>
      
      <Text style={styles.partsCount}>
        {partsList.length} parts requested
      </Text>
      
      <Text style={styles.deliveryTime}>
        Est. Delivery: {estimatedDelivery}
      </Text>
      
      <View style={styles.notificationFooter}>
        <Text style={styles.timeAgo}>
          {formatTimeAgo(notification.createdAt)}
        </Text>
        <Text style={styles.expiresAt}>
          Expires: {formatTime(notification.data.expiresAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
```

#### **C. Quote Response Screen**
```tsx
interface QuoteResponseScreenProps {
  order: AutoPartsOrder;
  onQuoteSubmit: (quote: ShopQuoteResponse) => void;
}

const QuoteResponseScreen: React.FC<QuoteResponseScreenProps> = ({
  order,
  onQuoteSubmit
}) => {
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [missingParts, setMissingParts] = useState<Part[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [notes, setNotes] = useState('');

  const handlePartAvailability = (part: Part, isAvailable: boolean) => {
    if (isAvailable) {
      setAvailableParts(prev => [...prev, part]);
      setMissingParts(prev => prev.filter(p => p.id !== part.id));
    } else {
      setMissingParts(prev => [...prev, part]);
      setAvailableParts(prev => prev.filter(p => p.id !== part.id));
    }
  };

  const calculateTotalPrice = () => {
    return availableParts.reduce((total, part) => {
      return total + (part.unitPrice * part.quantity);
    }, 0);
  };

  const handleSubmitQuote = () => {
    const quote: ShopQuoteResponse = {
      orderId: order._id,
      shopId: currentShop._id,
      availableParts,
      missingParts,
      totalPrice: calculateTotalPrice(),
      estimatedDelivery,
      notes,
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      terms: {
        warranty: '30 days',
        returnPolicy: '7 days',
        paymentTerms: 'Payment on delivery'
      }
    };

    onQuoteSubmit(quote);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Provide Quote</Text>
      
      {/* Order Summary */}
      <View style={styles.orderSummary}>
        <Text style={styles.vehicleInfo}>
          {order.vehicle.make} {order.vehicle.model} ({order.vehicle.year})
        </Text>
        <Text style={styles.deliveryLocation}>
          Delivery: {order.deliveryLocation.address}
        </Text>
      </View>

      {/* Parts List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parts Required</Text>
        {order.parts.map(part => (
          <PartAvailabilityCard 
            key={part.id}
            part={part}
            onAvailabilityChange={(isAvailable) => 
              handlePartAvailability(part, isAvailable)
            }
          />
        ))}
      </View>

      {/* Quote Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quote Summary</Text>
        <Text style={styles.availableCount}>
          Available: {availableParts.length} parts
        </Text>
        <Text style={styles.missingCount}>
          Missing: {missingParts.length} parts
        </Text>
        <Text style={styles.totalPrice}>
          Total: ${totalPrice.toFixed(2)}
        </Text>
      </View>

      {/* Delivery Time */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estimated Delivery</Text>
        <DeliveryTimePicker 
          value={estimatedDelivery}
          onChange={setEstimatedDelivery}
        />
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Notes</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any additional notes or conditions..."
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitButton, !canSubmit && styles.disabledButton]}
        onPress={handleSubmitQuote}
        disabled={!canSubmit}
      >
        <Text style={styles.submitButtonText}>Submit Quote</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
```

### **6. Implementation Timeline**

**Week 1-2:**
- [ ] Shop onboarding system
- [ ] Real-time notification system
- [ ] Basic quote management

**Week 3-4:**
- [ ] Enhanced partners app UI
- [ ] Order notification cards
- [ ] Quote response interface

**Week 5-6:**
- [ ] Integration testing
- [ ] Performance optimization
- [ ] Bug fixes and refinements

### **7. Key Features**

✅ **Real-Time Notifications** - Instant alerts for new orders
✅ **Location-Based Matching** - Finds shops within service radius
✅ **Flexible Quote System** - Shops can provide partial quotes
✅ **Inventory Integration** - Check availability in real-time
✅ **Competitive Pricing** - Multiple quotes for customer comparison
✅ **Delivery Tracking** - Real-time delivery status updates
✅ **Shop Management** - Complete shop profile and settings

This integration system bridges the gap between customers and auto parts shops while we develop the permanent inventory management solution.
