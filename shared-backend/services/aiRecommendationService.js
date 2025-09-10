/**
 * AI Recommendation Service
 * Handles AI-powered recommendations, predictions, and analysis
 */

const AIProviderManager = require('./aiProviderManager');

class AIRecommendationService {
    constructor() {
        this.aiProviderManager = new AIProviderManager();
        this.isInitialized = false;
        this.recommendationCache = new Map();
        this.cacheTTL = 30 * 60 * 1000; // 30 minutes
    }

    async initialize() {
        try {
            // Test AI provider connection
            const testResponse = await this.aiProviderManager.generateResponse('Test connection', { maxTokens: 10 });
            
            if (!testResponse.success) {
                throw new Error('AI Provider connection failed');
            }
            
            this.isInitialized = true;
            console.log('✅ AI Recommendation Service initialized');
        } catch (error) {
            console.error('❌ AI Recommendation Service initialization failed:', error);
            throw error;
        }
    }

    async getRecommendations(userId, context = {}) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const cacheKey = `recommendations_${userId}_${JSON.stringify(context)}`;
            const cached = this.recommendationCache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
                return cached.data;
            }

            // Generate recommendations based on context
            const recommendations = await this.generateRecommendations(userId, context);
            
            // Cache the results
            this.recommendationCache.set(cacheKey, {
                data: recommendations,
                timestamp: Date.now()
            });

            return recommendations;
        } catch (error) {
            console.error('❌ Failed to get recommendations:', error);
            throw error;
        }
    }

    async generateRecommendations(userId, context) {
        try {
            const prompt = this.buildRecommendationPrompt(userId, context);
            
            const aiResponse = await this.aiProviderManager.generateResponse(prompt, {
                systemPrompt: "You are an automotive service recommendation AI. Provide helpful, relevant recommendations for car maintenance and services.",
                maxTokens: 500,
                temperature: 0.7
            });

            if (!aiResponse.success) {
                throw new Error(`AI recommendation generation failed: ${aiResponse.error}`);
            }

            return this.parseRecommendations(aiResponse.response);
        } catch (error) {
            console.error('❌ Failed to generate recommendations:', error);
            return this.getFallbackRecommendations();
        }
    }

    buildRecommendationPrompt(userId, context) {
        const { vehicleType, lastService, mileage, issues } = context;
        
        return `
        User ID: ${userId}
        Vehicle Type: ${vehicleType || 'Unknown'}
        Last Service: ${lastService || 'Unknown'}
        Mileage: ${mileage || 'Unknown'}
        Current Issues: ${issues || 'None reported'}
        
        Please provide 3-5 relevant automotive service recommendations based on this information.
        Format the response as a JSON array with objects containing:
        - service: service name
        - priority: high/medium/low
        - estimatedCost: cost range
        - description: brief explanation
        - urgency: immediate/soon/later
        `;
    }

    parseRecommendations(response) {
        try {
            // Try to parse JSON from response
            const jsonMatch = response.match(/\[.*\]/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // Fallback to structured parsing
            return this.parseStructuredRecommendations(response);
        } catch (error) {
            console.error('❌ Failed to parse recommendations:', error);
            return this.getFallbackRecommendations();
        }
    }

    parseStructuredRecommendations(response) {
        const recommendations = [];
        const lines = response.split('\n');
        
        for (const line of lines) {
            if (line.includes('service:') || line.includes('Service:')) {
                const service = line.split(':')[1]?.trim();
                if (service) {
                    recommendations.push({
                        service,
                        priority: 'medium',
                        estimatedCost: '$50-$200',
                        description: 'Recommended automotive service',
                        urgency: 'soon'
                    });
                }
            }
        }
        
        return recommendations.length > 0 ? recommendations : this.getFallbackRecommendations();
    }

    getFallbackRecommendations() {
        return [
            {
                service: 'Oil Change',
                priority: 'high',
                estimatedCost: '$30-$80',
                description: 'Regular oil change to maintain engine health',
                urgency: 'soon'
            },
            {
                service: 'Tire Rotation',
                priority: 'medium',
                estimatedCost: '$20-$50',
                description: 'Rotate tires for even wear and extended life',
                urgency: 'later'
            },
            {
                service: 'Brake Inspection',
                priority: 'high',
                estimatedCost: '$50-$150',
                description: 'Check brake system for safety',
                urgency: 'immediate'
            }
        ];
    }

    async predictMaintenance(vehicleData, historicalData = []) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const prompt = this.buildMaintenancePredictionPrompt(vehicleData, historicalData);
            
            const aiResponse = await this.aiProviderManager.generateResponse(prompt, {
                systemPrompt: "You are an automotive maintenance prediction AI. Analyze vehicle data and predict when maintenance will be needed.",
                maxTokens: 400,
                temperature: 0.5
            });

            if (!aiResponse.success) {
                throw new Error(`AI maintenance prediction failed: ${aiResponse.error}`);
            }

            return this.parseMaintenancePrediction(aiResponse.response);
        } catch (error) {
            console.error('❌ Failed to predict maintenance:', error);
            return this.getFallbackMaintenancePrediction();
        }
    }

    buildMaintenancePredictionPrompt(vehicleData, historicalData) {
        const { make, model, year, mileage, lastService } = vehicleData;
        
        return `
        Vehicle: ${year} ${make} ${model}
        Current Mileage: ${mileage}
        Last Service: ${lastService || 'Unknown'}
        Historical Data: ${JSON.stringify(historicalData)}
        
        Predict when the next maintenance services will be needed.
        Format as JSON with:
        - service: service name
        - predictedMileage: when service will be needed
        - confidence: high/medium/low
        - estimatedCost: cost range
        - urgency: immediate/soon/later
        `;
    }

    parseMaintenancePrediction(response) {
        try {
            const jsonMatch = response.match(/\[.*\]/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return this.getFallbackMaintenancePrediction();
        } catch (error) {
            console.error('❌ Failed to parse maintenance prediction:', error);
            return this.getFallbackMaintenancePrediction();
        }
    }

    getFallbackMaintenancePrediction() {
        return [
            {
                service: 'Oil Change',
                predictedMileage: 'Every 5,000-7,500 miles',
                confidence: 'high',
                estimatedCost: '$30-$80',
                urgency: 'soon'
            },
            {
                service: 'Brake Service',
                predictedMileage: 'Every 20,000-30,000 miles',
                confidence: 'medium',
                estimatedCost: '$150-$300',
                urgency: 'later'
            }
        ];
    }

    async analyzeSentiment(text, context = '') {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const prompt = `Analyze the sentiment of this text: "${text}"\nContext: ${context}\n\nRespond with JSON: {"sentiment": "positive/negative/neutral", "confidence": 0.0-1.0, "keywords": ["word1", "word2"]}`;

            const aiResponse = await this.aiProviderManager.generateResponse(prompt, {
                systemPrompt: "You are a sentiment analysis AI. Analyze the sentiment of automotive service reviews and feedback.",
                maxTokens: 200,
                temperature: 0.3
            });

            if (!aiResponse.success) {
                throw new Error(`AI sentiment analysis failed: ${aiResponse.error}`);
            }

            return this.parseSentimentAnalysis(aiResponse.response);
        } catch (error) {
            console.error('❌ Failed to analyze sentiment:', error);
            return {
                sentiment: 'neutral',
                confidence: 0.5,
                keywords: []
            };
        }
    }

    parseSentimentAnalysis(response) {
        try {
            const jsonMatch = response.match(/\{.*\}/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return {
                sentiment: 'neutral',
                confidence: 0.5,
                keywords: []
            };
        } catch (error) {
            console.error('❌ Failed to parse sentiment analysis:', error);
            return {
                sentiment: 'neutral',
                confidence: 0.5,
                keywords: []
            };
        }
    }

    async getChatCompletion(messages, model = 'gpt-3.5-turbo', temperature = 0.7) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            // Convert messages to prompt format
            const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

            const aiResponse = await this.aiProviderManager.generateResponse(prompt, {
                systemPrompt: "You are a helpful AI assistant for automotive services.",
                maxTokens: 1000,
                temperature: temperature
            });

            if (!aiResponse.success) {
                throw new Error(`AI chat completion failed: ${aiResponse.error}`);
            }

            return {
                content: aiResponse.response,
                model: aiResponse.model,
                usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } // Placeholder
            };
        } catch (error) {
            console.error('❌ Failed to get chat completion:', error);
            throw error;
        }
    }

    async analyzeImage(imageUrl, analysisType = 'general') {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const prompt = `Analyze this automotive image for ${analysisType}. Provide detailed analysis including any issues, damage, or maintenance needs. Image URL: ${imageUrl}`;

            const aiResponse = await this.aiProviderManager.generateResponse(prompt, {
                systemPrompt: "You are an automotive image analysis AI. Analyze images for issues, damage, and maintenance needs.",
                maxTokens: 500,
                temperature: 0.3
            });

            if (!aiResponse.success) {
                throw new Error(`AI image analysis failed: ${aiResponse.error}`);
            }

            return {
                analysis: aiResponse.response,
                type: analysisType,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('❌ Failed to analyze image:', error);
            throw error;
        }
    }

    clearCache() {
        this.recommendationCache.clear();
        console.log('✅ AI Recommendation Service cache cleared');
    }

    async getServiceStatus() {
        return {
            isInitialized: this.isInitialized,
            cacheSize: this.recommendationCache.size,
            aiProviderStats: this.aiProviderManager.getProviderStats(),
            lastActivity: new Date()
        };
    }
}

module.exports = new AIRecommendationService();
