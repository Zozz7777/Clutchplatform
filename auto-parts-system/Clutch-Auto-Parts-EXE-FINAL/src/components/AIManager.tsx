import React, { useState, useEffect } from 'react';
import { i18nManager } from '../client/i18n';

interface AIInsight {
  id: string;
  type: 'demand_forecast' | 'pricing_optimization' | 'inventory_optimization' | 'customer_insights';
  title: string;
  description: string;
  confidence: number;
  recommendations: string[];
  data: any;
}

export const AIManager: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);

  useEffect(() => {
    loadAIInsights();
  }, []);

  const loadAIInsights = async () => {
    try {
      setLoading(true);
      
      // Fetch AI insights from API
      const [demandResponse, pricingResponse, inventoryResponse, customerResponse] = await Promise.all([
        fetch('/api/ai/demand-forecast'),
        fetch('/api/ai/pricing-optimization'),
        fetch('/api/ai/inventory-optimization'),
        fetch('/api/ai/customer-insights')
      ]);

      const insightsData: AIInsight[] = [];

      if (demandResponse.ok) {
        const data = await demandResponse.json();
        insightsData.push({
          id: 'demand_forecast',
          type: 'demand_forecast',
          title: i18nManager.t('ai.demandForecast'),
          description: i18nManager.t('ai.demandForecastDescription'),
          confidence: data.data.confidence || 85,
          recommendations: data.data.recommendations || [],
          data: data.data
        });
      }

      if (pricingResponse.ok) {
        const data = await pricingResponse.json();
        insightsData.push({
          id: 'pricing_optimization',
          type: 'pricing_optimization',
          title: i18nManager.t('ai.pricingOptimization'),
          description: i18nManager.t('ai.pricingOptimizationDescription'),
          confidence: data.data.confidence || 78,
          recommendations: data.data.recommendations || [],
          data: data.data
        });
      }

      if (inventoryResponse.ok) {
        const data = await inventoryResponse.json();
        insightsData.push({
          id: 'inventory_optimization',
          type: 'inventory_optimization',
          title: i18nManager.t('ai.inventoryOptimization'),
          description: i18nManager.t('ai.inventoryOptimizationDescription'),
          confidence: data.data.confidence || 92,
          recommendations: data.data.recommendations || [],
          data: data.data
        });
      }

      if (customerResponse.ok) {
        const data = await customerResponse.json();
        insightsData.push({
          id: 'customer_insights',
          type: 'customer_insights',
          title: i18nManager.t('ai.customerInsights'),
          description: i18nManager.t('ai.customerInsightsDescription'),
          confidence: data.data.confidence || 88,
          recommendations: data.data.recommendations || [],
          data: data.data
        });
      }

      setInsights(insightsData);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'success';
    if (confidence >= 70) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <div className="ai-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{i18nManager.t('ai.analyzing')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-container">
      <div className="ai-header">
        <h1 className="ai-title">{i18nManager.t('ai.title')}</h1>
        <p className="ai-subtitle">{i18nManager.t('ai.subtitle')}</p>
      </div>

      <div className="insights-grid">
        {insights.map((insight) => (
          <div 
            key={insight.id} 
            className={`insight-card ${selectedInsight?.id === insight.id ? 'selected' : ''}`}
            onClick={() => setSelectedInsight(insight)}
          >
            <div className="insight-header">
              <h3>{insight.title}</h3>
              <div className={`confidence-badge ${getConfidenceColor(insight.confidence)}`}>
                {insight.confidence}%
              </div>
            </div>
            <p className="insight-description">{insight.description}</p>
            <div className="insight-footer">
              <span className="insight-type">{insight.type.replace('_', ' ')}</span>
              <button className="view-details-btn">
                {i18nManager.t('ai.viewDetails')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedInsight && (
        <div className="insight-details">
          <div className="details-header">
            <h2>{selectedInsight.title}</h2>
            <button 
              className="close-btn"
              onClick={() => setSelectedInsight(null)}
            >
              ×
            </button>
          </div>
          
          <div className="details-content">
            <div className="confidence-section">
              <h3>{i18nManager.t('ai.confidence')}</h3>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill"
                  style={{ width: `${selectedInsight.confidence}%` }}
                ></div>
              </div>
              <p>{selectedInsight.confidence}% {i18nManager.t('ai.confidenceLevel')}</p>
            </div>

            <div className="recommendations-section">
              <h3>{i18nManager.t('ai.recommendations')}</h3>
              <ul className="recommendations-list">
                {selectedInsight.recommendations.map((rec, index) => (
                  <li key={index} className="recommendation-item">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="data-section">
              <h3>{i18nManager.t('ai.dataAnalysis')}</h3>
              <div className="data-visualization">
                <pre>{JSON.stringify(selectedInsight.data, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIManager;
