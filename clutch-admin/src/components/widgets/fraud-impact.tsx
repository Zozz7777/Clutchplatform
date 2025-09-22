"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence } from '@/lib/business-intelligence';
import { 
  Shield, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Download,
  Eye,
  BarChart3,
  Target,
  Activity
} from 'lucide-react';

interface FraudImpactProps {
  className?: string;
}

interface FraudImpactData {
  casesDetected: number;
  amountSaved: number;
  falsePositives: number;
  accuracy: number;
  trend: 'improving' | 'stable' | 'declining';
}

export function FraudImpact({ className = '' }: FraudImpactProps) {
  const { t } = useTranslations();
  const [fraudData, setFraudData] = React.useState<FraudImpactData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadFraudData = async () => {
      try {
        const data = await Promise.resolve(null);
        setFraudData(data);
      } catch (error) {
        // Failed to load fraud impact data
      } finally {
        setIsLoading(false);
      }
    };

    loadFraudData();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return TrendingUp;
      case 'declining': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-success';
      case 'declining': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case 'improving': return 'bg-success/10 text-green-800';
      case 'declining': return 'bg-destructive/10 text-red-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-success';
    if (accuracy >= 80) return 'text-warning';
    return 'text-destructive';
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 90) return 'bg-success/10 text-green-800';
    if (accuracy >= 80) return 'bg-warning/10 text-yellow-800';
    return 'bg-destructive/10 text-red-800';
  };

  const getAccuracyLevel = (accuracy: number) => {
    if (accuracy >= 90) return 'Excellent';
    if (accuracy >= 80) return 'Good';
    if (accuracy >= 70) return 'Fair';
    return 'Poor';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-success" />
            <span>Fraud Case Impact</span>
          </CardTitle>
          <CardDescription>Loading fraud impact data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded-[0.625rem] w-3/4"></div>
            <div className="h-4 bg-muted rounded-[0.625rem] w-1/2"></div>
            <div className="h-4 bg-muted rounded-[0.625rem] w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!fraudData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-success" />
            <span>Fraud Case Impact</span>
          </CardTitle>
          <CardDescription>Unable to load fraud impact data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const TrendIcon = getTrendIcon(fraudData.trend);
  const falsePositiveRate = fraudData.casesDetected > 0 ? (fraudData.falsePositives / fraudData.casesDetected) * 100 : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-success" />
          <span>Fraud Case Impact</span>
        </CardTitle>
        <CardDescription>
          $ saved by fraud detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <DollarSign className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">
              ${fraudData.amountSaved.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Amount Saved</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <Shield className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{fraudData.casesDetected}</p>
            <p className="text-xs text-muted-foreground">Cases Detected</p>
          </div>
        </div>

        {/* Amount Saved */}
        <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <DollarSign className="h-6 w-6 text-success" />
            <span className="text-2xl font-bold text-success">
              ${fraudData.amountSaved.toLocaleString()}
            </span>
            <Badge className={getTrendBadge(fraudData.trend)}>
              {fraudData.trend}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Total Amount Saved</p>
          <div className="mt-3">
            <Progress value={Math.min((fraudData.amountSaved / 100000) * 100, 100)} className="h-2" />
          </div>
        </div>

        {/* Fraud Detection Metrics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Detection Metrics</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-success" />
                <div>
                  <p className="text-sm font-medium text-foreground">Cases Detected</p>
                  <p className="text-xs text-muted-foreground">Fraud attempts blocked</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{fraudData.casesDetected}</p>
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <div>
                  <p className="text-sm font-medium text-foreground">False Positives</p>
                  <p className="text-xs text-muted-foreground">Incorrectly flagged</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{fraudData.falsePositives}</p>
                <Badge variant="outline" className="text-xs">
                  {falsePositiveRate.toFixed(1)}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
              <div className="flex items-center space-x-3">
                <Target className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Accuracy Rate</p>
                  <p className="text-xs text-muted-foreground">Detection accuracy</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${getAccuracyColor(fraudData.accuracy)}`}>
                  {fraudData.accuracy.toFixed(1)}%
                </p>
                <Badge className={getAccuracyBadge(fraudData.accuracy)}>
                  {getAccuracyLevel(fraudData.accuracy)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <BarChart3 className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold text-primary">
              {fraudData.casesDetected > 0 ? (fraudData.amountSaved / fraudData.casesDetected).toFixed(0) : 0}
            </p>
            <p className="text-xs text-muted-foreground">Avg Saved Per Case</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]-lg">
            <TrendIcon className={`h-4 w-4 ${getTrendColor(fraudData.trend)} mx-auto mb-1`} />
            <p className={`text-sm font-bold ${getTrendColor(fraudData.trend)}`}>
              {fraudData.trend}
            </p>
            <p className="text-xs text-muted-foreground">Performance Trend</p>
          </div>
        </div>

        {/* Accuracy Visualization */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Accuracy Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Detection Accuracy</span>
              <span>{fraudData.accuracy.toFixed(1)}%</span>
            </div>
            <Progress value={fraudData.accuracy} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span>False Positive Rate</span>
              <span>{falsePositiveRate.toFixed(1)}%</span>
            </div>
            <Progress value={falsePositiveRate} className="h-2" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-primary/10 rounded-[0.625rem]-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Fraud Impact Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total amount saved: ${fraudData.amountSaved.toLocaleString()}</li>
            <li>• {fraudData.casesDetected} fraud cases detected and blocked</li>
            <li>• Detection accuracy: {fraudData.accuracy.toFixed(1)}%</li>
            <li>• False positive rate: {falsePositiveRate.toFixed(1)}%</li>
            <li>• Performance trend: {fraudData.trend}</li>
            {fraudData.accuracy >= 90 && (
              <li>• Excellent detection accuracy - system performing well</li>
            )}
            {fraudData.accuracy < 80 && (
              <li>• Accuracy below target - consider model retraining</li>
            )}
            {falsePositiveRate > 10 && (
              <li>• High false positive rate - review detection thresholds</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default FraudImpact;





