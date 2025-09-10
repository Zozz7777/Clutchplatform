const mongoose = require('../shims/mongoose');

const aiPredictionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    predictionType: { 
        type: String, 
        enum: ['maintenance', 'driving', 'parts', 'damage', 'nlp', 'feedback', 'recommendations'], 
        required: true 
    },
    inputData: { type: mongoose.Schema.Types.Mixed, required: true },
    outputData: { type: mongoose.Schema.Types.Mixed, required: true },
    confidence: { type: Number, min: 0, max: 1 },
    accuracy: { type: Number, min: 0, max: 1 },
    processingTime: { type: Number }, // in milliseconds
    modelVersion: { type: String },
    status: { 
        type: String, 
        enum: ['pending', 'processing', 'completed', 'failed'], 
        default: 'pending' 
    },
    error: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

aiPredictionSchema.index({ userId: 1, predictionType: 1, createdAt: -1 });
aiPredictionSchema.index({ predictionType: 1, status: 1 });
aiPredictionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 }); // TTL: 1 year

module.exports = mongoose.model('AIPrediction', aiPredictionSchema);
