"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Download,
  Eye,
  Target,
  Activity,
  BarChart3,
  Calendar,
  Star
} from 'lucide-react';

interface ReportUsageStatsProps {
  className?: string;
}

interface ReportUsage {
  reportName: string;
  category: string;
  usageCount: number;
  uniqueUsers: number;
  lastGenerated: string;
  popularity: number;
  avgGenerationTime: number;
}

export function ReportUsageStats({ className = '' }: ReportUsageStatsProps) {
  const [usageData, setUsageData] = React.useState<{
    reports: ReportUsage[];
    totalUsage: number;
    totalUsers: number;
    mostPopular: ReportUsage | null;
    averageGenerationTime: number;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUsageData = async () => {
      try {
        // Simulate report usage stats data
        const reports: ReportUsage[] = [
          {
            reportName: 'Revenue Summary',
            category: 'Finance',
            usageCount: 245,
            uniqueUsers: 18,
            lastGenerated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            popularity: 95,
            avgGenerationTime: 15
          },
          {
            reportName: 'Fleet Performance',
            category: 'Operations',
            usageCount: 189,
            uniqueUsers: 12,
            lastGenerated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            popularity: 88,
            avgGenerationTime: 22
          },
          {
            reportName: 'Customer Analytics',
            category: 'CRM',
            usageCount: 156,
            uniqueUsers: 15,
            lastGenerated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            popularity: 82,
            avgGenerationTime: 18
          },
          {
            reportName: 'System Health',
            category: 'Monitoring',
            usageCount: 134,
            uniqueUsers: 8,
            lastGenerated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            popularity: 75,
            avgGenerationTime: 12
          },
          {
            reportName: 'User Activity',
            category: 'Security',
            usageCount: 98,
            uniqueUsers: 6,
            lastGenerated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            popularity: 65,
            avgGenerationTime: 8
          },
          {
            reportName: 'Compliance Report',
            category: 'Compliance',
            usageCount: 67,
            uniqueUsers: 4,
            lastGenerated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            popularity: 45,
            avgGenerationTime: 35
          }
        ];

        const totalUsage = reports.reduce((sum, report) => sum + report.usageCount, 0);
        const totalUsers = new Set(reports.flatMap(r => Array(r.uniqueUsers).fill(r.reportName))).size;
        const mostPopular = reports.reduce((top, report) => report.usageCount > top.usageCount ? report : top, reports[0]);
        const averageGenerationTime = reports.reduce((sum, report) => sum + report.avgGenerationTime, 0) / reports.length;

        setUsageData({
          reports,
          totalUsage,
          totalUsers,
          mostPopular,
          averageGenerationTime
        });
      } catch (error) {
        console.error('Failed to load report usage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsageData();
  }, []);

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 80) return 'text-green-600';
    if (popularity >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPopularityBadge = (popularity: number) => {
    if (popularity >= 80) return 'bg-green-100 text-green-800';
    if (popularity >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPopularityLevel = (popularity: number) => {
    if (popularity >= 80) return 'High';
    if (popularity >= 60) return 'Medium';
    return 'Low';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Report Usage Stats</span>
          </CardTitle>
          <CardDescription>Loading report usage data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usageData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Report Usage Stats</span>
          </CardTitle>
          <CardDescription>Unable to load report usage data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span>Report Usage Stats</span>
        </CardTitle>
        <CardDescription>
          Who uses which reports most
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{usageData.totalUsage}</p>
            <p className="text-xs text-gray-500">Total Usage</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Users className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">{usageData.totalUsers}</p>
            <p className="text-xs text-gray-500">Unique Users</p>
          </div>
        </div>

        {/* Most Popular Report */}
        {usageData.mostPopular && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="h-6 w-6 text-yellow-600" />
              <span className="text-xl font-bold text-gray-900">{usageData.mostPopular.reportName}</span>
              <Badge className={getPopularityBadge(usageData.mostPopular.popularity)}>
                {getPopularityLevel(usageData.mostPopular.popularity)}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{usageData.mostPopular.usageCount} uses by {usageData.mostPopular.uniqueUsers} users</p>
            <div className="mt-3">
              <Progress value={usageData.mostPopular.popularity} className="h-2" />
            </div>
          </div>
        )}

        {/* Report Usage */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Report Usage</h4>
          <div className="space-y-2">
            {usageData.reports.map((report, index) => (
              <div key={report.reportName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                    <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{report.reportName}</p>
                    <p className="text-xs text-gray-500">
                      {report.category} • Last generated: {formatTime(report.lastGenerated)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-semibold text-gray-900">{report.usageCount}</p>
                    <Badge className={getPopularityBadge(report.popularity)}>
                      {getPopularityLevel(report.popularity)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <Users className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {report.uniqueUsers} users
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Usage Distribution</h4>
          <div className="space-y-2">
            {usageData.reports.map((report) => (
              <div key={report.reportName} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{report.reportName}</span>
                  <span className="text-gray-900 font-medium">{report.usageCount}</span>
                </div>
                <Progress value={(report.usageCount / Math.max(...usageData.reports.map(r => r.usageCount))) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Generation Time */}
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-bold text-blue-600">
              {usageData.averageGenerationTime.toFixed(0)}s
            </span>
            <Badge variant="outline" className="text-xs">
              Avg Generation
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Average Report Generation Time</p>
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
        <div className="p-3 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Report Usage Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total usage: {usageData.totalUsage} report generations</li>
            <li>• Unique users: {usageData.totalUsers}</li>
            <li>• Most popular: {usageData.mostPopular?.reportName} ({usageData.mostPopular?.usageCount} uses)</li>
            <li>• Average generation time: {usageData.averageGenerationTime.toFixed(0)} seconds</li>
            <li>• {usageData.reports.length} different reports available</li>
            <li>• {usageData.reports.filter(r => r.popularity >= 80).length} highly popular reports</li>
            {usageData.mostPopular && usageData.mostPopular.popularity >= 90 && (
              <li>• {usageData.mostPopular.reportName} is extremely popular - consider optimization</li>
            )}
            {usageData.averageGenerationTime > 20 && (
              <li>• High average generation time - consider performance optimization</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReportUsageStats;
