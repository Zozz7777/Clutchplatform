const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');
const axios = require('axios');
const { logger } = require('../config/logger');

class AIService {
  constructor() {
    this.models = new Map();
    this.tokenizer = new natural.WordTokenizer();
    this.classifier = new natural.BayesClassifier();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      logger.info('🤖 Initializing AI Service...');
      
      // Load pre-trained models
      await this.loadModels();
      
      // Initialize NLP components
      await this.initializeNLP();
      
      // Initialize recommendation engine
      await this.initializeRecommendationEngine();
      
      this.isInitialized = true;
      logger.info('✅ AI Service initialized successfully');
    } catch (error) {
      logger.error('❌ AI Service initialization failed:', error);
      throw error;
    }
  }

  async loadModels() {
    try {
      const useRemote = process.env.AI_MODELS_REMOTE_URL === 'true';
      const baseUrl = process.env.AI_MODELS_BASE_URL || '';

      const maintenanceUrl = useRemote ? `${baseUrl}/models/predictive_maintenance/model.json` : 'file://./models/predictive_maintenance/model.json';
      const fraudUrl = useRemote ? `${baseUrl}/models/fraud_detection/model.json` : 'file://./models/fraud_detection/model.json';
      const recommendationUrl = useRemote ? `${baseUrl}/models/recommendation/model.json` : 'file://./models/recommendation/model.json';

      // Load predictive maintenance model
      const maintenanceModel = await tf.loadLayersModel(maintenanceUrl);
      this.models.set('predictive_maintenance', maintenanceModel);

      // Load fraud detection model
      const fraudModel = await tf.loadLayersModel(fraudUrl);
      this.models.set('fraud_detection', fraudModel);

      // Load recommendation model
      const recommendationModel = await tf.loadLayersModel(recommendationUrl);
      this.models.set('recommendation', recommendationModel);

      logger.info('✅ AI models loaded successfully');
    } catch (error) {
      logger.warn('⚠️ Could not load pre-trained models, using fallback models');
      await this.createFallbackModels();
    }
  }

  async createFallbackModels() {
    // Create simple fallback models for development
    const maintenanceModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
    
    maintenanceModel.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    this.models.set('predictive_maintenance', maintenanceModel);
    
    // Similar fallback models for other AI features
    logger.info('✅ Fallback AI models created');
  }

  async initializeNLP() {
    // Train the classifier with automotive service data
    this.classifier.addDocument('engine making strange noise', 'engine_issue');
    this.classifier.addDocument('brake pedal feels soft', 'brake_issue');
    this.classifier.addDocument('check engine light on', 'engine_warning');
    this.classifier.addDocument('car won\'t start', 'starting_issue');
    this.classifier.addDocument('oil change needed', 'maintenance');
    this.classifier.addDocument('tire pressure low', 'tire_issue');
    this.classifier.addDocument('battery dead', 'electrical_issue');
    this.classifier.addDocument('transmission problems', 'transmission_issue');
    this.classifier.addDocument('air conditioning not working', 'ac_issue');
    this.classifier.addDocument('suspension noise', 'suspension_issue');
    
    this.classifier.train();
    logger.info('✅ NLP classifier trained');
  }

  async initializeRecommendationEngine() {
    // Initialize collaborative filtering and content-based recommendation systems
    this.recommendationEngine = {
      userPreferences: new Map(),
      serviceSimilarity: new Map(),
      collaborativeFilter: new Map()
    };
    
    logger.info('✅ Recommendation engine initialized');
  }

  // Predictive Maintenance
  async predictMaintenance(vehicleData) {
    try {
      if (!this.isInitialized) await this.initialize();
      
      const model = this.models.get('predictive_maintenance');
      
      // Prepare input data
      const inputTensor = tf.tensor2d([
        [
          vehicleData.mileage || 0,
          vehicleData.age || 0,
          vehicleData.lastServiceDays || 0,
          vehicleData.engineHours || 0,
          vehicleData.fuelLevel || 0,
          vehicleData.oilLevel || 0,
          vehicleData.tirePressure || 0,
          vehicleData.batteryVoltage || 0,
          vehicleData.temperature || 0,
          vehicleData.vibrationLevel || 0
        ]
      ]);
      
      // Make prediction
      const prediction = await model.predict(inputTensor).array();
      const maintenanceProbability = prediction[0][0];
      
      // Determine maintenance urgency
      let urgency = 'low';
      let recommendedServices = [];
      
      if (maintenanceProbability > 0.8) {
        urgency = 'critical';
        recommendedServices = ['immediate_inspection', 'oil_change', 'filter_replacement'];
      } else if (maintenanceProbability > 0.6) {
        urgency = 'high';
        recommendedServices = ['scheduled_maintenance', 'oil_change'];
      } else if (maintenanceProbability > 0.4) {
        urgency = 'medium';
        recommendedServices = ['routine_check'];
      } else {
        urgency = 'low';
        recommendedServices = ['next_scheduled_maintenance'];
      }
      
      return {
        maintenanceProbability,
        urgency,
        recommendedServices,
        nextMaintenanceDate: this.calculateNextMaintenanceDate(vehicleData, maintenanceProbability),
        confidence: this.calculateConfidence(maintenanceProbability)
      };
    } catch (error) {
      logger.error('❌ Predictive maintenance error:', error);
      throw new Error('Failed to predict maintenance');
    }
  }

  // Fraud Detection
  async detectFraud(transactionData) {
    try {
      if (!this.isInitialized) await this.initialize();
      
      const model = this.models.get('fraud_detection');
      
      // Prepare input features
      const inputTensor = tf.tensor2d([
        [
          transactionData.amount || 0,
          transactionData.hour || 0,
          transactionData.dayOfWeek || 0,
          transactionData.isWeekend ? 1 : 0,
          transactionData.userAge || 0,
          transactionData.userAccountAge || 0,
          transactionData.previousTransactions || 0,
          transactionData.locationMismatch ? 1 : 0,
          transactionData.deviceMismatch ? 1 : 0,
          transactionData.velocityScore || 0
        ]
      ]);
      
      // Make prediction
      const prediction = await model.predict(inputTensor).array();
      const fraudProbability = prediction[0][0];
      
      // Determine risk level
      let riskLevel = 'low';
      let riskScore = 0;
      
      if (fraudProbability > 0.8) {
        riskLevel = 'critical';
        riskScore = 95;
      } else if (fraudProbability > 0.6) {
        riskLevel = 'high';
        riskScore = 75;
      } else if (fraudProbability > 0.4) {
        riskLevel = 'medium';
        riskScore = 50;
      } else {
        riskLevel = 'low';
        riskScore = 25;
      }
      
      return {
        fraudProbability,
        riskLevel,
        riskScore,
        recommendedAction: this.getFraudAction(riskLevel),
        confidence: this.calculateConfidence(fraudProbability)
      };
    } catch (error) {
      logger.error('❌ Fraud detection error:', error);
      throw new Error('Failed to detect fraud');
    }
  }

  // Recommendation Engine
  async getRecommendations(userId, context = {}) {
    try {
      if (!this.isInitialized) await this.initialize();
      
      const model = this.models.get('recommendation');
      
      // Get user preferences and history
      const userProfile = await this.getUserProfile(userId);
      const userHistory = await this.getUserHistory(userId);
      
      // Prepare input for recommendation model
      const inputTensor = tf.tensor2d([
        [
          userProfile.age || 0,
          userProfile.vehicleCount || 0,
          userProfile.totalSpent || 0,
          userProfile.preferredServices || 0,
          userProfile.location || 0,
          context.season || 0,
          context.vehicleAge || 0,
          context.mileage || 0,
          context.lastServiceDays || 0
        ]
      ]);
      
      // Get recommendations
      const prediction = await model.predict(inputTensor).array();
      
      // Process recommendations
      const recommendations = await this.processRecommendations(prediction[0], userProfile, context);
      
      return {
        recommendations,
        confidence: this.calculateConfidence(prediction[0].reduce((a, b) => a + b, 0) / prediction[0].length),
        reasoning: this.generateRecommendationReasoning(recommendations, userProfile)
      };
    } catch (error) {
      logger.error('❌ Recommendation engine error:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  // Natural Language Processing
  async processText(text, task = 'classification') {
    try {
      if (!this.isInitialized) await this.initialize();
      
      switch (task) {
        case 'classification':
          return this.classifyText(text);
        case 'sentiment':
          return this.analyzeSentiment(text);
        case 'extraction':
          return this.extractEntities(text);
        case 'summarization':
          return this.summarizeText(text);
        default:
          throw new Error('Unsupported NLP task');
      }
    } catch (error) {
      logger.error('❌ NLP processing error:', error);
      throw new Error('Failed to process text');
    }
  }

  classifyText(text) {
    const classification = this.classifier.classify(text);
    const confidence = this.classifier.getClassifications(text);
    
    return {
      classification,
      confidence: confidence[0].value,
      alternatives: confidence.slice(1, 4)
    };
  }

  analyzeSentiment(text) {
    const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    const tokens = this.tokenizer.tokenize(text);
    const sentiment = analyzer.getSentiment(tokens);
    
    let sentimentLabel = 'neutral';
    if (sentiment > 0.5) sentimentLabel = 'positive';
    else if (sentiment < -0.5) sentimentLabel = 'negative';
    
    return {
      sentiment,
      sentimentLabel,
      confidence: Math.abs(sentiment)
    };
  }

  extractEntities(text) {
    // Simple entity extraction for automotive terms
    const entities = {
      vehicleParts: [],
      services: [],
      locations: [],
      dates: []
    };
    
    // Extract vehicle parts
    const partsRegex = /\b(engine|brake|tire|battery|transmission|suspension|ac|air conditioning|oil|filter)\b/gi;
    const parts = text.match(partsRegex) || [];
    entities.vehicleParts = [...new Set(parts.map(p => p.toLowerCase()))];
    
    // Extract services
    const servicesRegex = /\b(repair|maintenance|inspection|diagnostic|tune-up|alignment|replacement)\b/gi;
    const services = text.match(servicesRegex) || [];
    entities.services = [...new Set(services.map(s => s.toLowerCase()))];
    
    return entities;
  }

  summarizeText(text) {
    // Simple extractive summarization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = this.tokenizer.tokenize(text);
    
    // Calculate sentence scores based on word frequency
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    const sentenceScores = sentences.map(sentence => {
      const sentenceWords = this.tokenizer.tokenize(sentence);
      const score = sentenceWords.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
      return { sentence, score };
    });
    
    // Get top 2 sentences
    const summary = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(item => item.sentence)
      .join('. ');
    
    return {
      summary,
      originalLength: text.length,
      summaryLength: summary.length,
      compressionRatio: summary.length / text.length
    };
  }

  // Computer Vision (placeholder for image processing)
  async processImage(imageData, task = 'damage_assessment') {
    try {
      // This would integrate with actual computer vision APIs
      // For now, return mock results
      
      switch (task) {
        case 'damage_assessment':
          return {
            damageDetected: true,
            damageType: 'scratch',
            severity: 'minor',
            estimatedCost: 150,
            confidence: 0.85
          };
        case 'parts_identification':
          return {
            partsIdentified: ['headlight', 'bumper', 'hood'],
            confidence: 0.92
          };
        case 'quality_inspection':
          return {
            qualityScore: 0.88,
            issues: ['minor_paint_damage'],
            recommendations: ['repaint_required']
          };
        default:
          throw new Error('Unsupported computer vision task');
      }
    } catch (error) {
      logger.error('❌ Computer vision error:', error);
      throw new Error('Failed to process image');
    }
  }

  // Route Optimization
  async optimizeRoute(waypoints, constraints = {}) {
    try {
      // This would integrate with mapping APIs like Google Maps or Mapbox
      // For now, return optimized route based on simple algorithms
      
      const optimizedRoute = {
        waypoints: waypoints,
        totalDistance: this.calculateTotalDistance(waypoints),
        totalTime: this.calculateTotalTime(waypoints),
        fuelEfficiency: this.calculateFuelEfficiency(waypoints),
        optimizationScore: 0.85
      };
      
      return optimizedRoute;
    } catch (error) {
      logger.error('❌ Route optimization error:', error);
      throw new Error('Failed to optimize route');
    }
  }

  // Driver Behavior Analysis
  async analyzeDriverBehavior(drivingData) {
    try {
      const behaviorMetrics = {
        safetyScore: this.calculateSafetyScore(drivingData),
        efficiencyScore: this.calculateEfficiencyScore(drivingData),
        riskFactors: this.identifyRiskFactors(drivingData),
        recommendations: this.generateDriverRecommendations(drivingData)
      };
      
      return behaviorMetrics;
    } catch (error) {
      logger.error('❌ Driver behavior analysis error:', error);
      throw new Error('Failed to analyze driver behavior');
    }
  }

  // Helper methods
  calculateNextMaintenanceDate(vehicleData, probability) {
    const baseInterval = 90; // days
    const adjustment = (1 - probability) * 30; // Adjust based on probability
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + Math.round(baseInterval + adjustment));
    return nextDate;
  }

  calculateConfidence(probability) {
    return Math.abs(probability - 0.5) * 2; // Convert to 0-1 confidence scale
  }

  getFraudAction(riskLevel) {
    const actions = {
      critical: 'block_transaction',
      high: 'require_verification',
      medium: 'flag_for_review',
      low: 'allow_transaction'
    };
    return actions[riskLevel] || 'allow_transaction';
  }

  async getUserProfile(userId) {
    // This would fetch from database
    return {
      age: 35,
      vehicleCount: 2,
      totalSpent: 1500,
      preferredServices: 1,
      location: 1
    };
  }

  async getUserHistory(userId) {
    // This would fetch from database
    return [];
  }

  async processRecommendations(predictions, userProfile, context) {
    // Process raw predictions into service recommendations
    const services = [
      'oil_change', 'brake_service', 'tire_rotation', 'air_filter',
      'spark_plugs', 'transmission_service', 'ac_service', 'battery_check'
    ];
    
    return predictions.map((score, index) => ({
      service: services[index] || `service_${index}`,
      score,
      priority: score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low'
    })).sort((a, b) => b.score - a.score).slice(0, 5);
  }

  generateRecommendationReasoning(recommendations, userProfile) {
    return `Based on your vehicle profile and usage patterns, we recommend these services to maintain optimal performance and safety.`;
  }

  calculateTotalDistance(waypoints) {
    // Mock calculation
    return waypoints.length * 10; // km
  }

  calculateTotalTime(waypoints) {
    // Mock calculation
    return waypoints.length * 15; // minutes
  }

  calculateFuelEfficiency(waypoints) {
    // Mock calculation
    return 0.85; // efficiency score
  }

  calculateSafetyScore(drivingData) {
    // Mock calculation based on driving patterns
    return 0.78;
  }

  calculateEfficiencyScore(drivingData) {
    // Mock calculation based on fuel consumption and route efficiency
    return 0.82;
  }

  identifyRiskFactors(drivingData) {
    // Mock risk factor identification
    return ['hard_braking', 'rapid_acceleration'];
  }

  generateDriverRecommendations(drivingData) {
    // Mock recommendations
    return ['smooth_acceleration', 'maintain_safe_distance', 'regular_breaks'];
  }
}

module.exports = new AIService();

