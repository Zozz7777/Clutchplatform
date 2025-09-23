'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { productionApi } from '@/lib/production-api';

interface PipelineStage {
  name: string;
  count: number;
  value: number;
  color: string;
}

export default function SalesPipeline() {
  const { t } = useLanguage();
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productionApi.getPipeline();
      if (response.success) {
        // Transform API data to widget format
        const stages = response.pipeline || [];
        setPipelineStages(stages);
      } else {
        setError(response.message || t('errorFetchingPipeline'));
      }
    } catch (err) {
      setError(t('errorFetchingPipeline'));
      console.error('Error fetching pipeline data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalCount = pipelineStages.reduce((sum, stage) => sum + stage.count, 0);
  const totalValue = pipelineStages.reduce((sum, stage) => sum + stage.value, 0);

  if (loading) {
    return (
      <Card className="shadow-2xs rounded-[0.625rem] font-sans">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('salesPipeline')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-2xs rounded-[0.625rem] font-sans">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('salesPipeline')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchPipelineData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t('retry')}
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xs rounded-[0.625rem] font-sans">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t('salesPipeline')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pipeline Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">{totalCount}</p>
            <p className="text-sm text-primary/80">{t('totalDeals')}</p>
          </div>
          <div className="text-center p-4 bg-success/10 rounded-lg">
            <DollarSign className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-success">
              {(totalValue / 1000000).toFixed(1)}M
            </p>
            <p className="text-sm text-success/80">EGP {t('pipelineValue')}</p>
          </div>
        </div>

        {/* Pipeline Stages */}
        <div className="space-y-4">
          {pipelineStages.map((stage, index) => {
            const percentage = totalCount > 0 ? (stage.count / totalCount) * 100 : 0;
            const valuePercentage = totalValue > 0 ? (stage.value / totalValue) * 100 : 0;
            
            return (
              <div key={stage.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                    <span className="font-medium capitalize">{t(stage.name)}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{stage.count} {t('deals')}</p>
                    <p className="text-sm text-gray-600">
                      {stage.value.toLocaleString()} EGP
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{percentage.toFixed(1)}% {t('ofDeals')}</span>
                    <span>{valuePercentage.toFixed(1)}% {t('ofValue')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conversion Rate */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">{t('conversionRate')}</span>
            <span className="text-2xl font-bold text-green-600">
              {totalCount > 0 ? ((pipelineStages[3].count / totalCount) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {t('conversionRateDescription')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
