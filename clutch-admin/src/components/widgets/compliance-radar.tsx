"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence, type ComplianceStatus } from '@/lib/business-intelligence';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Users,
  Lock,
  Calendar,
  Eye,
  Download
} from 'lucide-react';

interface ComplianceRadarProps {
  className?: string;
}

export function ComplianceRadar({ className = '' }: ComplianceRadarProps) {
  const [compliance, setCompliance] = React.useState<ComplianceStatus | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadCompliance = async () => {
      try {
        const data = await businessIntelligence.getComplianceRadar();
        setCompliance(data);
      } catch (error) {
        console.error('Failed to load compliance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompliance();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'text-green-600';
      case 'amber': return 'text-yellow-600';
      case 'red': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'green': return 'bg-green-100 text-green-800';
      case 'amber': return 'bg-yellow-100 text-yellow-800';
      case 'red': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'green': return CheckCircle;
      case 'amber': return AlertTriangle;
      case 'red': return AlertTriangle;
      default: return Shield;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysUntilAudit = () => {
    if (!compliance) return 0;
    const nextAudit = new Date(compliance.nextAudit);
    const now = new Date();
    const diffTime = nextAudit.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>Compliance Radar</span>
          </CardTitle>
          <CardDescription>Loading compliance status...</CardDescription>
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

  if (!compliance) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>Compliance Radar</span>
          </CardTitle>
          <CardDescription>Unable to load compliance status</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const StatusIcon = getStatusIcon(compliance.overallStatus);
  const daysUntilAudit = getDaysUntilAudit();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span>Compliance Radar</span>
        </CardTitle>
        <CardDescription>
          Red-amber-green summary of compliance status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <StatusIcon className={`h-6 w-6 ${getStatusColor(compliance.overallStatus)}`} />
            <span className={`text-xl font-bold ${getStatusColor(compliance.overallStatus)}`}>
              {compliance.overallStatus.toUpperCase()}
            </span>
            <Badge className={getStatusBadge(compliance.overallStatus)}>
              {compliance.overallStatus === 'green' ? 'All Clear' :
               compliance.overallStatus === 'amber' ? 'Attention Needed' :
               'Action Required'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Overall Compliance Status</p>
        </div>

        {/* Compliance Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{compliance.pendingApprovals}</p>
            <p className="text-xs text-gray-500">Pending Approvals</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-yellow-600">{compliance.violations}</p>
            <p className="text-xs text-gray-500">Violations</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <Lock className="h-5 w-5 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-600">{compliance.securityIncidents}</p>
            <p className="text-xs text-gray-500">Security Incidents</p>
          </div>
        </div>

        {/* Compliance Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Compliance Breakdown</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Pending Approvals</p>
                  <p className="text-xs text-gray-500">Awaiting review</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{compliance.pendingApprovals}</p>
                <Badge variant="outline" className="text-xs">
                  {compliance.pendingApprovals > 5 ? 'High' : compliance.pendingApprovals > 2 ? 'Medium' : 'Low'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Compliance Violations</p>
                  <p className="text-xs text-gray-500">Policy breaches</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{compliance.violations}</p>
                <Badge variant="outline" className="text-xs">
                  {compliance.violations > 2 ? 'High' : compliance.violations > 0 ? 'Medium' : 'None'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Lock className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Security Incidents</p>
                  <p className="text-xs text-gray-500">Security breaches</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{compliance.securityIncidents}</p>
                <Badge variant="outline" className="text-xs">
                  {compliance.securityIncidents > 0 ? 'Critical' : 'None'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Timeline */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Audit Timeline</span>
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Audit</p>
                  <p className="text-xs text-gray-500">Completed successfully</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(compliance.lastAudit)}
                </p>
                <Badge variant="secondary" className="text-xs">Passed</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Next Audit</p>
                  <p className="text-xs text-gray-500">Scheduled audit</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(compliance.nextAudit)}
                </p>
                <Badge variant="outline" className="text-xs">
                  {daysUntilAudit > 0 ? `${daysUntilAudit} days` : 'Overdue'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Progress */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Compliance Progress</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Compliance</span>
              <span>{compliance.overallStatus === 'green' ? '100%' : compliance.overallStatus === 'amber' ? '75%' : '50%'}</span>
            </div>
            <Progress 
              value={compliance.overallStatus === 'green' ? 100 : compliance.overallStatus === 'amber' ? 75 : 50} 
              className="h-2" 
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Compliance Insights */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Compliance Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            {compliance.overallStatus === 'green' && (
              <li>• All compliance requirements are met</li>
            )}
            {compliance.overallStatus === 'amber' && (
              <li>• Some areas need attention - review pending approvals</li>
            )}
            {compliance.overallStatus === 'red' && (
              <li>• Immediate action required - address violations and incidents</li>
            )}
            <li>• Next audit in {daysUntilAudit} days</li>
            {compliance.pendingApprovals > 0 && (
              <li>• {compliance.pendingApprovals} approvals pending review</li>
            )}
            {compliance.violations > 0 && (
              <li>• {compliance.violations} compliance violations need resolution</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default ComplianceRadar;
