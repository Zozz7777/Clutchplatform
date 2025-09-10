const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');
const { ObjectId } = require('mongodb');

// ==================== SHOPPING CART ====================

// Get user's shopping cart
router.get('/cart', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const cartCollection = await getCollection('shopping_cart');
        const cart = await cartCollection.findOne({ userId });

        if (!cart) {
            // Create empty cart
            const emptyCart = {
                userId,
                items: [],
                subtotal: 0,
                tax: 0,
                shipping: 0,
                total: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const result = await cartCollection.insertOne(emptyCart);
            emptyCart._id = result.insertedId;
            
            return res.json({
                success: true,
                data: emptyCart
            });
        }

        // Get product details for cart items
        const productsCollection = await getCollection('products');
        const enrichedItems = await Promise.all(
            cart.items.map(async (item) => {
                const product = await productsCollection.findOne({ _id: new ObjectId(item.productId) });
                return {
                    ...item,
                    product: product ? {
                        id: product._id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        description: product.description,
                        category: product.category
                    } : null
                };
            })
        );

        const enrichedCart = {
            ...cart,
            items: enrichedItems
        };

        res.json({
            success: true,
            data: enrichedCart
        });
    } catch (error) {
        logger.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CART_ERROR',
            message: 'Failed to retrieve shopping cart'
        });
    }
});

// Add item to cart
router.post('/cart/add', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1, options = {} } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_PRODUCT_ID',
                message: 'Product ID is required'
            });
        }

        const cartCollection = await getCollection('shopping_cart');
        const productsCollection = await getCollection('products');

        // Verify product exists
        const product = await productsCollection.findOne({ _id: new ObjectId(productId) });
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'PRODUCT_NOT_FOUND',
                message: 'Product not found'
            });
        }

        // Check stock availability
        if (product.stockQuantity < quantity) {
            return res.status(400).json({
                success: false,
                error: 'INSUFFICIENT_STOCK',
                message: 'Insufficient stock available'
            });
        }

        let cart = await cartCollection.findOne({ userId });

        if (!cart) {
            // Create new cart
            cart = {
                userId,
                items: [],
                subtotal: 0,
                tax: 0,
                shipping: 0,
                total: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await cartCollection.insertOne(cart);
            cart._id = result.insertedId;
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(item => 
            item.productId === productId && 
            JSON.stringify(item.options) === JSON.stringify(options)
        );

        if (existingItemIndex >= 0) {
            // Update existing item quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                productId,
                quantity,
                options,
                price: product.price,
                addedAt: new Date()
            });
        }

        // Recalculate cart totals
        cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cart.tax = cart.subtotal * 0.08; // 8% tax rate
        cart.shipping = cart.subtotal > 50 ? 0 : 5.99; // Free shipping over $50
        cart.total = cart.subtotal + cart.tax + cart.shipping;
        cart.updatedAt = new Date();

        await cartCollection.updateOne(
            { userId },
            { $set: cart }
        );

        res.json({
            success: true,
            message: 'Item added to cart successfully',
            data: cart
        });
    } catch (error) {
        logger.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            error: 'ADD_TO_CART_ERROR',
            message: 'Failed to add item to cart'
        });
    }
});

// Update cart item
router.put('/cart/update/:itemId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const { quantity, options } = req.body;

        if (quantity !== undefined && quantity <= 0) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_QUANTITY',
                message: 'Quantity must be greater than 0'
            });
        }

        const cartCollection = await getCollection('shopping_cart');
        const cart = await cartCollection.findOne({ userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                error: 'CART_NOT_FOUND',
                message: 'Shopping cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(item => item._id?.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'ITEM_NOT_FOUND',
                message: 'Cart item not found'
            });
        }

        // Update item
        if (quantity !== undefined) {
            cart.items[itemIndex].quantity = quantity;
        }
        if (options !== undefined) {
            cart.items[itemIndex].options = options;
        }

        // Recalculate cart totals
        cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cart.tax = cart.subtotal * 0.08;
        cart.shipping = cart.subtotal > 50 ? 0 : 5.99;
        cart.total = cart.subtotal + cart.tax + cart.shipping;
        cart.updatedAt = new Date();

        await cartCollection.updateOne(
            { userId },
            { $set: cart }
        );

        res.json({
            success: true,
            message: 'Cart item updated successfully',
            data: cart
        });
    } catch (error) {
        logger.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_CART_ITEM_ERROR',
            message: 'Failed to update cart item'
        });
    }
});

// Remove item from cart
router.delete('/cart/remove/:itemId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;

        const cartCollection = await getCollection('shopping_cart');
        const cart = await cartCollection.findOne({ userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                error: 'CART_NOT_FOUND',
                message: 'Shopping cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(item => item._id?.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'ITEM_NOT_FOUND',
                message: 'Cart item not found'
            });
        }

        // Remove item
        cart.items.splice(itemIndex, 1);

        // Recalculate cart totals
        cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cart.tax = cart.subtotal * 0.08;
        cart.shipping = cart.subtotal > 50 ? 0 : 5.99;
        cart.total = cart.subtotal + cart.tax + cart.shipping;
        cart.updatedAt = new Date();

        await cartCollection.updateOne(
            { userId },
            { $set: cart }
        );

        res.json({
            success: true,
            message: 'Item removed from cart successfully',
            data: cart
        });
    } catch (error) {
        logger.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            error: 'REMOVE_FROM_CART_ERROR',
            message: 'Failed to remove item from cart'
        });
    }
});

// Clear cart
router.post('/cart/clear', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const cartCollection = await getCollection('shopping_cart');
        await cartCollection.updateOne(
            { userId },
            {
                $set: {
                    items: [],
                    subtotal: 0,
                    tax: 0,
                    shipping: 0,
                    total: 0,
                    updatedAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        logger.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            error: 'CLEAR_CART_ERROR',
            message: 'Failed to clear cart'
        });
    }
});

// ==================== CHECKOUT PROCESS ====================

// Initiate checkout
router.post('/checkout', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            shippingAddress, 
            billingAddress, 
            paymentMethod, 
            couponCode,
            notes 
        } = req.body;

        const cartCollection = await getCollection('shopping_cart');
        const cart = await cartCollection.findOne({ userId });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'EMPTY_CART',
                message: 'Cannot checkout with empty cart'
            });
        }

        // Validate addresses
        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_SHIPPING_ADDRESS',
                message: 'Shipping address is required'
            });
        }

        // Apply coupon if provided
        let discount = 0;
        if (couponCode) {
            const couponsCollection = await getCollection('coupons');
            const coupon = await couponsCollection.findOne({
                code: couponCode,
                isActive: true,
                validFrom: { $lte: new Date() },
                validTo: { $gte: new Date() }
            });

            if (coupon) {
                if (coupon.type === 'percentage') {
                    discount = (cart.subtotal * coupon.value) / 100;
                } else {
                    discount = coupon.value;
                }
                discount = Math.min(discount, cart.subtotal); // Don't discount more than subtotal
            }
        }

        // Create order
        const ordersCollection = await getCollection('orders');
        const order = {
            userId,
            items: cart.items,
            subtotal: cart.subtotal,
            tax: cart.tax,
            shipping: cart.shipping,
            discount,
            total: cart.total - discount,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            paymentMethod,
            status: 'pending',
            notes: notes || '',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await ordersCollection.insertOne(order);
        order._id = result.insertedId;

        // Clear cart after successful order creation
        await cartCollection.updateOne(
            { userId },
            {
                $set: {
                    items: [],
                    subtotal: 0,
                    tax: 0,
                    shipping: 0,
                    total: 0,
                    updatedAt: new Date()
                }
            }
        );

        res.status(201).json({
            success: true,
            message: 'Checkout initiated successfully',
            data: {
                orderId: order._id,
                total: order.total,
                status: order.status
            }
        });
    } catch (error) {
        logger.error('Checkout error:', error);
        res.status(500).json({
            success: false,
            error: 'CHECKOUT_ERROR',
            message: 'Failed to process checkout'
        });
    }
});

// Get checkout status
router.get('/checkout/:orderId/status', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        const ordersCollection = await getCollection('orders');
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

        res.json({
            success: true,
            data: {
                orderId: order._id,
                status: order.status,
                total: order.total,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            }
        });
    } catch (error) {
        logger.error('Get checkout status error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CHECKOUT_STATUS_ERROR',
            message: 'Failed to get checkout status'
        });
    }
});

// Confirm checkout
router.post('/checkout/:orderId/confirm', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        const { paymentConfirmation } = req.body;

        const ordersCollection = await getCollection('orders');
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

        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'INVALID_ORDER_STATUS',
                message: 'Order cannot be confirmed in current status'
            });
        }

        // Update order status
        await ordersCollection.updateOne(
            { _id: new ObjectId(orderId) },
            {
                $set: {
                    status: 'confirmed',
                    paymentConfirmation,
                    confirmedAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: 'Order confirmed successfully'
        });
    } catch (error) {
        logger.error('Confirm checkout error:', error);
        res.status(500).json({
            success: false,
            error: 'CONFIRM_CHECKOUT_ERROR',
            message: 'Failed to confirm checkout'
        });
    }
});

// ==================== ORDER MANAGEMENT ====================

// Get order tracking
router.get('/orders/:orderId/tracking', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        const ordersCollection = await getCollection('orders');
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

        // Get tracking information
        const trackingCollection = await getCollection('order_tracking');
        const tracking = await trackingCollection.findOne({ orderId: order._id });

        const trackingInfo = {
            orderId: order._id,
            status: order.status,
            tracking: tracking || null,
            estimatedDelivery: order.estimatedDelivery,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        };

        res.json({
            success: true,
            data: trackingInfo
        });
    } catch (error) {
        logger.error('Get order tracking error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ORDER_TRACKING_ERROR',
            message: 'Failed to get order tracking'
        });
    }
});

// Cancel order
router.post('/orders/:orderId/cancel', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        const { reason } = req.body;

        const ordersCollection = await getCollection('orders');
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

        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                error: 'ORDER_CANNOT_BE_CANCELLED',
                message: 'Order cannot be cancelled in current status'
            });
        }

        await ordersCollection.updateOne(
            { _id: new ObjectId(orderId) },
            {
                $set: {
                    status: 'cancelled',
                    cancellationReason: reason || '',
                    cancelledAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        logger.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            error: 'CANCEL_ORDER_ERROR',
            message: 'Failed to cancel order'
        });
    }
});

// Return order
router.post('/orders/:orderId/return', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        const { reason, items } = req.body;

        const ordersCollection = await getCollection('orders');
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

        if (order.status !== 'delivered') {
            return res.status(400).json({
                success: false,
                error: 'ORDER_CANNOT_BE_RETURNED',
                message: 'Order cannot be returned in current status'
            });
        }

        // Create return request
        const returnsCollection = await getCollection('returns');
        const returnRequest = {
            orderId: order._id,
            userId,
            reason,
            items: items || order.items,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await returnsCollection.insertOne(returnRequest);

        res.json({
            success: true,
            message: 'Return request submitted successfully'
        });
    } catch (error) {
        logger.error('Return order error:', error);
        res.status(500).json({
            success: false,
            error: 'RETURN_ORDER_ERROR',
            message: 'Failed to submit return request'
        });
    }
});

// Get order invoice
router.get('/orders/:orderId/invoice', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        const ordersCollection = await getCollection('orders');
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

        // Generate invoice data
        const invoice = {
            invoiceNumber: `INV-${order._id.toString().slice(-8).toUpperCase()}`,
            orderId: order._id,
            orderDate: order.createdAt,
            items: order.items,
            subtotal: order.subtotal,
            tax: order.tax,
            shipping: order.shipping,
            discount: order.discount,
            total: order.total,
            billingAddress: order.billingAddress,
            shippingAddress: order.shippingAddress
        };

        res.json({
            success: true,
            data: invoice
        });
    } catch (error) {
        logger.error('Get order invoice error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ORDER_INVOICE_ERROR',
            message: 'Failed to get order invoice'
        });
    }
});

// ==================== WISHLIST ====================

// Get user's wishlist
router.get('/wishlist', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const wishlistCollection = await getCollection('wishlist');
        const wishlist = await wishlistCollection.findOne({ userId });

        if (!wishlist) {
            const emptyWishlist = {
                userId,
                items: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const result = await wishlistCollection.insertOne(emptyWishlist);
            emptyWishlist._id = result.insertedId;
            
            return res.json({
                success: true,
                data: emptyWishlist
            });
        }

        // Get product details for wishlist items
        const productsCollection = await getCollection('products');
        const enrichedItems = await Promise.all(
            wishlist.items.map(async (item) => {
                const product = await productsCollection.findOne({ _id: new ObjectId(item.productId) });
                return {
                    ...item,
                    product: product ? {
                        id: product._id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        description: product.description,
                        category: product.category
                    } : null
                };
            })
        );

        const enrichedWishlist = {
            ...wishlist,
            items: enrichedItems
        };

        res.json({
            success: true,
            data: enrichedWishlist
        });
    } catch (error) {
        logger.error('Get wishlist error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_WISHLIST_ERROR',
            message: 'Failed to retrieve wishlist'
        });
    }
});

// Add item to wishlist
router.post('/wishlist/add/:productId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const wishlistCollection = await getCollection('wishlist');
        const productsCollection = await getCollection('products');

        // Verify product exists
        const product = await productsCollection.findOne({ _id: new ObjectId(productId) });
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'PRODUCT_NOT_FOUND',
                message: 'Product not found'
            });
        }

        let wishlist = await wishlistCollection.findOne({ userId });

        if (!wishlist) {
            wishlist = {
                userId,
                items: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await wishlistCollection.insertOne(wishlist);
            wishlist._id = result.insertedId;
        }

        // Check if item already exists in wishlist
        const existingItem = wishlist.items.find(item => item.productId === productId);
        if (existingItem) {
            return res.status(400).json({
                success: false,
                error: 'ITEM_ALREADY_IN_WISHLIST',
                message: 'Item already exists in wishlist'
            });
        }

        // Add item to wishlist
        wishlist.items.push({
            productId,
            addedAt: new Date()
        });
        wishlist.updatedAt = new Date();

        await wishlistCollection.updateOne(
            { userId },
            { $set: wishlist }
        );

        res.json({
            success: true,
            message: 'Item added to wishlist successfully',
            data: wishlist
        });
    } catch (error) {
        logger.error('Add to wishlist error:', error);
        res.status(500).json({
            success: false,
            error: 'ADD_TO_WISHLIST_ERROR',
            message: 'Failed to add item to wishlist'
        });
    }
});

// Remove item from wishlist
router.delete('/wishlist/remove/:productId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const wishlistCollection = await getCollection('wishlist');
        const wishlist = await wishlistCollection.findOne({ userId });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                error: 'WISHLIST_NOT_FOUND',
                message: 'Wishlist not found'
            });
        }

        const itemIndex = wishlist.items.findIndex(item => item.productId === productId);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'ITEM_NOT_FOUND',
                message: 'Wishlist item not found'
            });
        }

        // Remove item
        wishlist.items.splice(itemIndex, 1);
        wishlist.updatedAt = new Date();

        await wishlistCollection.updateOne(
            { userId },
            { $set: wishlist }
        );

        res.json({
            success: true,
            message: 'Item removed from wishlist successfully',
            data: wishlist
        });
    } catch (error) {
        logger.error('Remove from wishlist error:', error);
        res.status(500).json({
            success: false,
            error: 'REMOVE_FROM_WISHLIST_ERROR',
            message: 'Failed to remove item from wishlist'
        });
    }
});

module.exports = router;
