'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target,
  BarChart3,
  RefreshCw,
  Plus,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Users,
  Package
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  features: string[];
  targetAudience: string;
  popularity: number;
  conversionRate: number;
  revenue: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface PricingAnalytics {
  totalRevenue: number;
  averagePrice: number;
  conversionRate: number;
  churnRate: number;
  priceSensitivity: number;
  competitorComparison: {
    competitor: string;
    price: number;
    marketShare: number;
  }[];
}

export default function RevenuePricingPage() {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [analytics, setAnalytics] = useState<PricingAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadPricingData();
  }, [filterStatus]);

  const loadPricingData = async () => {
    try {
      setIsLoading(true);
      
      // Load pricing tiers
      const tiersResponse = await fetch(`/api/v1/revenue/pricing?status=${filterStatus}`);
      if (tiersResponse.ok) {
        const tiersData = await tiersResponse.json();
        setPricingTiers(tiersData.data || []);
      }
      
      // Load pricing analytics
      const analyticsResponse = await fetch('/api/v1/revenue/pricing/analytics');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.data || null);
      }
    } catch (error) {
      console.error('Failed to load pricing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 80) return 'bg-green-100 text-green-800';
    if (popularity >= 60) return 'bg-yellow-100 text-yellow-800';
    if (popularity >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing Management</h1>
          <p className="text-gray-600">Manage pricing tiers and analyze pricing performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <Button onClick={loadPricingData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Pricing Tier
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics ? formatCurrency(analytics.totalRevenue) : '$0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Average Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics ? formatCurrency(analytics.averagePrice) : '$0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics ? formatPercentage(analytics.conversionRate) : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics ? formatPercentage(analytics.churnRate) : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tiers">Pricing Tiers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pricing Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Pricing performance chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Tiers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pricingTiers
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map((tier) => (
                    <div key={tier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Package className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">{tier.name}</p>
                          <p className="text-xs text-gray-500">{tier.targetAudience}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(tier.price, tier.currency)}</p>
                        <div className="flex items-center space-x-1">
                          <Badge className={getPopularityColor(tier.popularity)}>
                            {tier.popularity}%
                          </Badge>
                          <Badge className={getStatusColor(tier.status)}>
                            {tier.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pricing Tiers Tab */}
        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Tiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricingTiers.map((tier) => (
                  <div key={tier.id} className="border rounded-lg p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="font-semibold text-xl">{tier.name}</h3>
                          <Badge className={getStatusColor(tier.status)}>
                            {tier.status}
                          </Badge>
                          <Badge className={getPopularityColor(tier.popularity)}>
                            {tier.popularity}% popular
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{tier.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Price</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency(tier.price, tier.currency)}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">{tier.billingCycle}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                            <p className="text-xl font-semibold text-gray-900">
                              {formatPercentage(tier.conversionRate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Revenue</p>
                            <p className="text-xl font-semibold text-gray-900">
                              {formatCurrency(tier.revenue, tier.currency)}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-500 mb-2">Key Features</p>
                          <div className="flex flex-wrap gap-2">
                            {tier.features.slice(0, 5).map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {tier.features.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{tier.features.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{tier.targetAudience}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>Created: {new Date(tier.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>Updated: {new Date(tier.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price Sensitivity Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Price Sensitivity Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Price Sensitivity Score</span>
                    <Badge className={
                      analytics && analytics.priceSensitivity < 0.3 ? 'bg-green-100 text-green-800' :
                      analytics && analytics.priceSensitivity < 0.6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {analytics ? (analytics.priceSensitivity * 100).toFixed(0) : 0}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        analytics && analytics.priceSensitivity < 0.3 ? 'bg-green-500' :
                        analytics && analytics.priceSensitivity < 0.6 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(analytics?.priceSensitivity || 0) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {analytics && analytics.priceSensitivity < 0.3 ? 'Low price sensitivity - customers are less price-sensitive' :
                     analytics && analytics.priceSensitivity < 0.6 ? 'Medium price sensitivity - moderate price impact' :
                     'High price sensitivity - customers are very price-sensitive'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Competitor Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Competitor Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.competitorComparison.map((competitor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{competitor.competitor}</p>
                        <p className="text-xs text-gray-500">
                          Market Share: {formatPercentage(competitor.marketShare)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(competitor.price)}
                        </p>
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${competitor.marketShare}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
