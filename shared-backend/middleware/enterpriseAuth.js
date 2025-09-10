const jwt = require('jsonwebtoken');
const { CorporateAccount } = require('../models/corporateAccount');
const userService = require('../services/userService');
const databaseUtils = require('../utils/databaseUtils');

const enterpriseAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: 'Access denied. No token provided.' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userService.getUserById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid token. User not found.' 
            });
        }

        // Check if user has enterprise access
        if (user.accountType !== 'corporate' && user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                error: 'Access denied. Enterprise account required.' 
            });
        }

        // If user is part of a corporate account, verify the account is active
        if (user.corporateAccount) {
            const corporateAccount = await databaseUtils.findById('corporateaccounts', user.corporateAccount);
            if (!corporateAccount || corporateAccount.status !== 'active') {
                return res.status(403).json({ 
                    success: false, 
                    error: 'Access denied. Corporate account is not active.' 
                });
            }
            req.corporateAccount = corporateAccount;
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Enterprise auth error:', error);
        res.status(401).json({ 
            success: false, 
            error: 'Invalid token.' 
        });
    }
};

module.exports = enterpriseAuth;
