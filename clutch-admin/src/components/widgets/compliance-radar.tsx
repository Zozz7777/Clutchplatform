"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence, type ComplianceStatus } from '@/lib/business-intelligence';
import { useTranslations } from '@/hooks/use-translations';
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
  const { t } = useTranslations();
  const [compliance, setCompliance] = React.useState<ComplianceStatus | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadCompliance = async () => {
      try {
        const data = await businessIntelligence.getComplianceRadar();
        setCompliance(data);
      } catch (error) {
        // Failed to load compliance data
      } finally {
        setIsLoading(false);
      }
    };

    loadCompliance();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'text-success';
      case 'amber': return 'text-warning';
      case 'red': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'green': return 'bg-success/10 text-success border-success/20';
      case 'amber': return 'bg-warning/10 text-warning border-warning/20';
      case 'red': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
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
      <Card className={`${className} shadow-2xs`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
            <Shield className="h-5 w-5 text-primary" />
            <span>Compliance Radar</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">Loading compliance status...</CardDescription>
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

  if (!compliance) {
    return (
      <Card className={`${className} shadow-2xs`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
            <Shield className="h-5 w-5 text-primary" />
            <span>Compliance Radar</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">Unable to load compliance status</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const StatusIcon = getStatusIcon(compliance.overallStatus);
  const daysUntilAudit = getDaysUntilAudit();

  return (
    <Card className={`${className} shadow-2xs`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
          <Shield className="h-5 w-5 text-primary" />
          <span>{t('dashboard.complianceRadar')}</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {t('dashboard.complianceStatusSummary')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className="text-center p-4 bg-muted/50 rounded-[0.625rem] border border-border">
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
          <p className="text-sm text-muted-foreground">Overall Compliance Status</p>
        </div>

        {/* Compliance Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem] border border-primary/20">
            <FileText className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{compliance.pendingApprovals}</p>
            <p className="text-xs text-muted-foreground">Pending Approvals</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem] border border-warning/20">
            <AlertTriangle className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">{compliance.violations}</p>
            <p className="text-xs text-muted-foreground">Violations</p>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem] border border-destructive/20">
            <Lock className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">{compliance.securityIncidents}</p>
            <p className="text-xs text-muted-foreground">Security Incidents</p>
          </div>
        </div>

        {/* Compliance Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-card-foreground">Compliance Breakdown</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem] border border-border">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">Pending Approvals</p>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-card-foreground">{compliance.pendingApprovals}</p>
                <Badge variant="outline" className="text-xs">
                  {compliance.pendingApprovals > 5 ? 'High' : compliance.pendingApprovals > 2 ? 'Medium' : 'Low'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem] border border-border">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">Compliance Violations</p>
                  <p className="text-xs text-muted-foreground">Policy breaches</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-card-foreground">{compliance.violations}</p>
                <Badge variant="outline" className="text-xs">
                  {compliance.violations > 2 ? 'High' : compliance.violations > 0 ? 'Medium' : 'None'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem] border border-border">
              <div className="flex items-center space-x-3">
                <Lock className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">Security Incidents</p>
                  <p className="text-xs text-muted-foreground">Security breaches</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-card-foreground">{compliance.securityIncidents}</p>
                <Badge variant="outline" className="text-xs">
                  {compliance.securityIncidents > 0 ? 'Critical' : 'None'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Timeline */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-card-foreground flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Audit Timeline</span>
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-[0.625rem] border border-success/20">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-success" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">Last Audit</p>
                  <p className="text-xs text-muted-foreground">Completed successfully</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-card-foreground">
                  {formatDate(compliance.lastAudit)}
                </p>
                <Badge variant="secondary" className="text-xs">Passed</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-[0.625rem] border border-primary/20">
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">Next Audit</p>
                  <p className="text-xs text-muted-foreground">Scheduled audit</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-card-foreground">
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
          <h4 className="text-sm font-medium text-card-foreground">Compliance Progress</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Compliance</span>
              <span className="text-card-foreground">
                {compliance.overallStatus === 'green' ? '100%' : 
                 compliance.overallStatus === 'amber' ? '75%' : 
                 compliance.overallStatus === 'red' ? '50%' : 'N/A'}
              </span>
            </div>
            <Progress 
              value={compliance.overallStatus === 'green' ? 100 : 
                     compliance.overallStatus === 'amber' ? 75 : 
                     compliance.overallStatus === 'red' ? 50 : 0} 
              className="h-2" 
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button variant="outline" size="sm" className="hover:bg-muted focus:ring-2 focus:ring-ring">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="hover:bg-muted focus:ring-2 focus:ring-ring">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Compliance Insights */}
        <div className="p-3 bg-primary/10 rounded-[0.625rem] border border-primary/20">
          <h5 className="text-sm font-medium text-primary mb-2">💡 Compliance Insights</h5>
          <ul className="text-xs text-primary/80 space-y-1">
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





