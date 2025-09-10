const mongoose = require('../shims/mongoose');

const performanceMetricsSchema = new mongoose.Schema({
    accuracy: { type: Number, min: 0, max: 1 },
    precision: { type: Number, min: 0, max: 1 },
    recall: { type: Number, min: 0, max: 1 },
    f1Score: { type: Number, min: 0, max: 1 },
    trainingDataSize: { type: Number },
    validationScore: { type: Number, min: 0, max: 1 },
    lastUpdated: { type: Date, default: Date.now }
});

const deploymentSchema = new mongoose.Schema({
    version: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['deployed', 'staging', 'testing', 'archived'], 
        default: 'testing' 
    },
    endpoint: { type: String },
    deployedAt: { type: Date },
    deployedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    configuration: { type: mongoose.Schema.Types.Mixed },
    performance: performanceMetricsSchema
});

const aiModelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['maintenance', 'driving', 'parts', 'damage', 'nlp', 'feedback', 'recommendations'], 
        required: true 
    },
    description: { type: String },
    currentVersion: { type: String },
    deployments: [deploymentSchema],
    architecture: { type: String },
    framework: { type: String, default: 'tensorflow' },
    inputShape: { type: mongoose.Schema.Types.Mixed },
    outputShape: { type: mongoose.Schema.Types.Mixed },
    parameters: { type: Number },
    fileSize: { type: Number }, // in bytes
    isActive: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: false },
    tags: [{ type: String }],
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

aiModelSchema.index({ name: 1 });
aiModelSchema.index({ type: 1, isActive: 1 });
aiModelSchema.index({ tags: 1 });

module.exports = mongoose.model('AIModel', aiModelSchema);
