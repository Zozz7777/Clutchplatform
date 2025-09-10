# 🔧 **CLUTCH AUTO PARTS - TEMPORARY SOLUTION IMPLEMENTATION**

## 📱 **CLIENT APP AUTO PARTS ORDERING SYSTEM**

### **1. Enhanced Client App Features**

#### **A. Auto Parts Ordering Flow**
```typescript
// New Auto Parts Ordering Interface
interface AutoPartsOrder {
  orderId: string;
  userId: string;
  vehicle: {
    year: number;
    make: string;
    model: string;
    trim: string;
    vin?: string;
  };
  deliveryLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
    deliveryInstructions?: string;
  };
  parts: Array<{
    id: string;
    name: string;
    description: string;
    quantity: number;
    category: string;
    notes?: string;
  }>;
  status: 'draft' | 'submitted' | 'quoted' | 'accepted' | 'processing' | 'shipped' | 'delivered';
  quotes: Array<{
    shopId: string;
    shopName: string;
    totalPrice: number;
    estimatedDelivery: string;
    availableParts: string[];
    missingParts: string[];
    notes: string;
  }>;
  selectedQuote?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **B. User Interface Components**

**1. Parts Order Button (Home Screen)**
```tsx
// Add to existing home screen
<PartsOrderButton 
  onPress={() => navigation.navigate('PartsOrder')}
  title="Order Auto Parts"
  icon="wrench"
/>
```

**2. Vehicle Selection Screen**
```tsx
interface VehicleSelectionProps {
  onVehicleSelect: (vehicle: Vehicle) => void;
  userVehicles: Vehicle[];
}

const VehicleSelectionScreen: React.FC<VehicleSelectionProps> = ({
  onVehicleSelect,
  userVehicles
}) => {
  return (
    <ScrollView>
      <Text style={styles.title}>Select Vehicle for Parts</Text>
      {userVehicles.map(vehicle => (
        <VehicleCard 
          key={vehicle.id}
          vehicle={vehicle}
          onSelect={() => onVehicleSelect(vehicle)}
        />
      ))}
      <AddNewVehicleButton />
    </ScrollView>
  );
};
```

**3. Location Selection Screen**
```tsx
interface LocationSelectionProps {
  onLocationSelect: (location: DeliveryLocation) => void;
  currentLocation?: Location;
}

const LocationSelectionScreen: React.FC<LocationSelectionProps> = ({
  onLocationSelect,
  currentLocation
}) => {
  return (
    <View>
      <Text style={styles.title}>Delivery Location</Text>
      <MapView 
        initialRegion={currentLocation}
        onRegionChangeComplete={handleLocationChange}
      />
      <LocationInput 
        placeholder="Enter delivery address"
        onLocationSelect={onLocationSelect}
      />
      <DeliveryInstructionsInput />
    </View>
  );
};
```

**4. Parts Selection Screen**
```tsx
interface PartsSelectionProps {
  vehicle: Vehicle;
  onPartsSubmit: (parts: Part[]) => void;
}

const PartsSelectionScreen: React.FC<PartsSelectionProps> = ({
  vehicle,
  onPartsSubmit
}) => {
  const [parts, setParts] = useState<Part[]>([]);
  
  const addPart = () => {
    setParts([...parts, {
      id: generateId(),
      name: '',
      description: '',
      quantity: 1,
      category: '',
      notes: ''
    }]);
  };

  return (
    <ScrollView>
      <Text style={styles.title}>Add Parts for {vehicle.make} {vehicle.model}</Text>
      
      {parts.map((part, index) => (
        <PartInputRow 
          key={part.id}
          part={part}
          index={index}
          onChange={(updatedPart) => updatePart(index, updatedPart)}
          onRemove={() => removePart(index)}
        />
      ))}
      
      <AddPartButton onPress={addPart} />
      <SubmitOrderButton 
        onPress={() => onPartsSubmit(parts)}
        disabled={parts.length === 0}
      />
    </ScrollView>
  );
};
```

### **2. Backend API Enhancements**

#### **A. New Auto Parts Ordering Routes**
```javascript
// shared-backend/routes/autoPartsOrders.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../services/database');

// Create auto parts order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { vehicle, deliveryLocation, parts } = req.body;
    const userId = req.user.userId;

    const orderData = {
      orderId: `parts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      vehicle,
      deliveryLocation,
      parts,
      status: 'submitted',
      quotes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const ordersCollection = await getCollection('autoPartsOrders');
    const result = await ordersCollection.insertOne(orderData);
    orderData._id = result.insertedId;

    // Trigger quote generation process
    await generateQuotesForOrder(orderData._id);

    res.status(201).json({
      success: true,
      data: orderData,
      message: 'Auto parts order created successfully'
    });
  } catch (error) {
    console.error('Create auto parts order error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_ORDER_FAILED',
      message: 'Failed to create auto parts order'
    });
  }
});

// Get user's auto parts orders
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 20, page = 1 } = req.query;

    const filters = { userId };
    if (status) filters.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const ordersCollection = await getCollection('autoPartsOrders');
    const [orders, total] = await Promise.all([
      ordersCollection.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      ordersCollection.countDocuments(filters)
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_ORDERS_FAILED',
      message: 'Failed to retrieve orders'
    });
  }
});

// Accept quote
router.post('/:orderId/accept-quote', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { quoteId, paymentMethod } = req.body;
    const userId = req.user.userId;

    const ordersCollection = await getCollection('autoPartsOrders');
    const order = await ordersCollection.findOne({ 
      _id: new ObjectId(orderId), 
      userId 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: 'Order not found'
      });
    }

    const selectedQuote = order.quotes.find(q => q.id === quoteId);
    if (!selectedQuote) {
      return res.status(400).json({
        success: false,
        error: 'QUOTE_NOT_FOUND',
        message: 'Quote not found'
      });
    }

    // Update order with selected quote
    await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          selectedQuote: quoteId,
          paymentMethod,
          status: 'accepted',
          updatedAt: new Date()
        }
      }
    );

    // Notify parts shop
    await notifyPartsShop(selectedQuote.shopId, orderId);

    res.json({
      success: true,
      message: 'Quote accepted successfully'
    });
  } catch (error) {
    console.error('Accept quote error:', error);
    res.status(500).json({
      success: false,
      error: 'ACCEPT_QUOTE_FAILED',
      message: 'Failed to accept quote'
    });
  }
});

module.exports = router;
```

#### **B. Quote Generation Service**
```javascript
// shared-backend/services/quoteGeneration.js
const { getCollection } = require('./database');
const { calculateDistance } = require('./location');

class QuoteGenerationService {
  async generateQuotesForOrder(orderId) {
    try {
      const ordersCollection = await getCollection('autoPartsOrders');
      const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
      
      if (!order) {
        throw new Error('Order not found');
      }

      // Find nearby parts shops that handle the vehicle brand
      const partsShopsCollection = await getCollection('partsShops');
      const nearbyShops = await this.findNearbyPartsShops(
        order.deliveryLocation.coordinates,
        order.vehicle.make
      );

      // Generate quotes for each shop
      const quotes = [];
      for (const shop of nearbyShops) {
        const quote = await this.generateShopQuote(order, shop);
        if (quote) {
          quotes.push(quote);
        }
      }

      // Update order with quotes
      await ordersCollection.updateOne(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            quotes,
            status: 'quoted',
            updatedAt: new Date()
          }
        }
      );

      // Notify user about available quotes
      await this.notifyUserAboutQuotes(order.userId, quotes.length);

    } catch (error) {
      console.error('Quote generation error:', error);
      throw error;
    }
  }

  async findNearbyPartsShops(coordinates, vehicleMake, radiusKm = 50) {
    const partsShopsCollection = await getCollection('partsShops');
    
    // Find shops that handle this vehicle make
    const shops = await partsShopsCollection.find({
      status: 'active',
      supportedBrands: { $in: [vehicleMake] },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [coordinates.lng, coordinates.lat]
          },
          $maxDistance: radiusKm * 1000 // Convert to meters
        }
      }
    }).toArray();

    return shops;
  }

  async generateShopQuote(order, shop) {
    try {
      // This is a placeholder - in the temporary solution, shops will manually provide quotes
      // In the permanent solution, this will integrate with their inventory system
      
      const quote = {
        id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        shopId: shop._id,
        shopName: shop.name,
        shopLocation: shop.location,
        totalPrice: 0, // Will be set by shop
        estimatedDelivery: this.calculateEstimatedDelivery(order.deliveryLocation, shop.location),
        availableParts: [], // Will be set by shop
        missingParts: [], // Will be set by shop
        notes: 'Quote pending - shop will provide pricing',
        status: 'pending',
        createdAt: new Date()
      };

      // Notify shop about the order
      await this.notifyShopAboutOrder(shop._id, order._id);

      return quote;
    } catch (error) {
      console.error('Generate shop quote error:', error);
      return null;
    }
  }

  calculateEstimatedDelivery(deliveryLocation, shopLocation) {
    const distance = calculateDistance(deliveryLocation.coordinates, shopLocation.coordinates);
    
    if (distance <= 10) return '1-2 hours';
    if (distance <= 25) return '2-4 hours';
    if (distance <= 50) return '4-8 hours';
    if (distance <= 100) return '1 day';
    return '1-2 days';
  }

  async notifyShopAboutOrder(shopId, orderId) {
    // Send push notification to shop
    // This will be implemented with the partners app integration
    console.log(`Notifying shop ${shopId} about order ${orderId}`);
  }

  async notifyUserAboutQuotes(userId, quoteCount) {
    // Send push notification to user
    console.log(`Notifying user ${userId} about ${quoteCount} quotes`);
  }
}

module.exports = new QuoteGenerationService();
```

### **3. Database Schema Updates**

#### **A. Auto Parts Orders Collection**
```javascript
// shared-backend/models/AutoPartsOrder.js
const mongoose = require('mongoose');

const autoPartsOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    year: { type: Number, required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    trim: { type: String, required: true },
    vin: String
  },
  deliveryLocation: {
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    deliveryInstructions: String
  },
  parts: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    quantity: { type: Number, required: true, min: 1 },
    category: { type: String, required: true },
    notes: String
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'quoted', 'accepted', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'draft'
  },
  quotes: [{
    id: { type: String, required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'PartsShop', required: true },
    shopName: { type: String, required: true },
    shopLocation: {
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    totalPrice: { type: Number, default: 0 },
    estimatedDelivery: { type: String, required: true },
    availableParts: [String],
    missingParts: [String],
    notes: String,
    status: {
      type: String,
      enum: ['pending', 'provided', 'accepted', 'rejected'],
      default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
  }],
  selectedQuote: String,
  paymentMethod: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  trackingInfo: {
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AutoPartsOrder', autoPartsOrderSchema);
```

### **4. Implementation Timeline**

**Week 1:**
- [ ] Create auto parts ordering UI components
- [ ] Implement vehicle selection screen
- [ ] Implement location selection screen
- [ ] Implement parts selection screen

**Week 2:**
- [ ] Create backend API routes
- [ ] Implement quote generation service
- [ ] Set up database collections
- [ ] Implement basic notification system

**Week 3:**
- [ ] Integrate with existing payment system
- [ ] Add order tracking functionality
- [ ] Implement quote acceptance flow
- [ ] Testing and bug fixes

### **5. Key Features**

✅ **No Pricing Display** - Orders show "Quote Pending" until shops provide pricing
✅ **Location-Based Matching** - Finds nearby shops that handle the vehicle brand
✅ **Flexible Parts Input** - Users can add any parts they need
✅ **Quote Comparison** - Users can compare quotes from multiple shops
✅ **Delivery Tracking** - Real-time delivery status updates
✅ **Payment Integration** - Seamless payment processing

### **6. User Experience Flow**

1. **User clicks "Order Auto Parts"** → Vehicle selection screen
2. **Selects vehicle** → Location selection screen  
3. **Sets delivery location** → Parts selection screen
4. **Adds required parts** → Order submission
5. **System finds nearby shops** → Shops receive notifications
6. **Shops provide quotes** → User receives quote notifications
7. **User compares quotes** → Selects preferred quote
8. **Payment processing** → Order confirmation
9. **Shop processes order** → Delivery tracking
10. **Parts delivered** → Order completion

This temporary solution provides immediate value while we work on the permanent inventory integration system.
