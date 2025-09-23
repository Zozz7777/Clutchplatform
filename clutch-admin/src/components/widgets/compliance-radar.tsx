"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence, type ComplianceStatus } from '@/lib/business-intelligence';
import { useLanguage } from '@/contexts/language-context';
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

export function ComplianceRadar(props: any) {
  console.log('ComplianceRadar component initializing...');
  console.log('ComplianceRadar ALL props received:', props);
  console.log('ComplianceRadar props keys:', Object.keys(props || {}));
  
  const { className = '' } = props;
  
  try {
    const { t } = useLanguage();
    console.log('ComplianceRadar: useLanguage hook successful');
    
    const [compliance, setCompliance] = React.useState<ComplianceStatus | null>(null);
    console.log('ComplianceRadar: compliance state initialized');
    
    const [isLoading, setIsLoading] = React.useState(true);
    console.log('ComplianceRadar: isLoading state initialized');
    
    const [hasError, setHasError] = React.useState(false);
    console.log('ComplianceRadar: hasError state initialized');

  React.useEffect(() => {
    const loadCompliance = async () => {
      try {
        const data = await businessIntelligence.getComplianceRadar();
        console.log('ComplianceRadar received data:', data);
        console.log('Data type:', typeof data);
        console.log('Data keys:', data ? Object.keys(data) : 'null');
        
        // Validate data structure before setting state
        if (data && typeof data === 'object') {
          // Check if data has the expected ComplianceStatus structure
          const hasValidStructure = 
            typeof data.pendingApprovals === 'number' &&
            typeof data.violations === 'number' &&
            typeof data.securityIncidents === 'number' &&
            typeof data.overallStatus === 'string';
            
          if (hasValidStructure) {
            console.log('✅ ComplianceRadar: Valid data structure confirmed');
            setCompliance(data);
            setHasError(false);
          } else {
            console.error('❌ ComplianceRadar: Invalid data structure:', data);
            setHasError(true);
            setCompliance(null);
          }
        } else {
          console.error('❌ ComplianceRadar: Invalid data type:', data);
          setHasError(true);
          setCompliance(null);
        }
      } catch (error) {
        console.error('❌ ComplianceRadar: Failed to load:', error);
        setHasError(true);
        setCompliance(null);
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
            <span>{t('widgets.complianceRadar')}</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">{t('widgets.loading')}</CardDescription>
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

  if (hasError) {
    return (
      <Card className={`${className} shadow-2xs border-destructive/20`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
            <Shield className="h-5 w-5 text-destructive" />
            <span>{t('widgets.complianceRadar')}</span>
          </CardTitle>
          <CardDescription className="text-destructive">
            {t('widgets.dataStructureError')}
          </CardDescription>
        </CardHeader>
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            {t('widgets.dataFormatMismatch')}
          </p>
        </div>
      </Card>
    );
  }

  if (!compliance) {
    return (
      <Card className={`${className} shadow-2xs`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
            <Shield className="h-5 w-5 text-primary" />
            <span>{t('widgets.complianceRadar')}</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">{t('widgets.unableToLoad')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Validate data structure
  if (!compliance.overallStatus || typeof compliance.pendingApprovals !== 'number') {
    console.error('Invalid compliance data structure:', compliance);
    return (
      <Card className={`${className} shadow-2xs`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
            <Shield className="h-5 w-5 text-primary" />
            <span>{t('widgets.complianceRadar')}</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">{t('widgets.invalidDataStructure')}</CardDescription>
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
          <span>{t('widgets.complianceRadar')}</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {t('widgets.complianceStatusSummary')}
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
              {compliance.overallStatus === 'green' ? t('widgets.allClear') :
               compliance.overallStatus === 'amber' ? t('widgets.attentionNeeded') :
               t('widgets.actionRequired')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Overall Compliance Status</p>
        </div>

        {/* Compliance Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem] border border-primary/20">
            <FileText className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{compliance.pendingApprovals}</p>
            <p className="text-xs text-muted-foreground">{t('widgets.pendingApprovals')}</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem] border border-warning/20">
            <AlertTriangle className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">{compliance.violations}</p>
            <p className="text-xs text-muted-foreground">{t('widgets.violations')}</p>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem] border border-destructive/20">
            <Lock className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">{compliance.securityIncidents}</p>
            <p className="text-xs text-muted-foreground">{t('widgets.securityIncidents')}</p>
          </div>
        </div>

        {/* Compliance Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-card-foreground">{t('widgets.complianceBreakdown')}</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem] border border-border">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">{t('widgets.pendingApprovals')}</p>
                  <p className="text-xs text-muted-foreground">{t('widgets.awaitingReview')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-card-foreground">{compliance.pendingApprovals}</p>
                <Badge variant="outline" className="text-xs">
                  {compliance.pendingApprovals > 5 ? t('widgets.high') : compliance.pendingApprovals > 2 ? t('widgets.medium') : t('widgets.low')}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem] border border-border">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">{t('widgets.complianceViolations')}</p>
                  <p className="text-xs text-muted-foreground">{t('widgets.policyBreaches')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-card-foreground">{compliance.violations}</p>
                <Badge variant="outline" className="text-xs">
                  {compliance.violations > 2 ? t('widgets.high') : compliance.violations > 0 ? t('widgets.medium') : t('widgets.none')}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem] border border-border">
              <div className="flex items-center space-x-3">
                <Lock className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">{t('widgets.securityIncidents')}</p>
                  <p className="text-xs text-muted-foreground">{t('widgets.securityBreaches')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-card-foreground">{compliance.securityIncidents}</p>
                <Badge variant="outline" className="text-xs">
                  {compliance.securityIncidents > 0 ? t('widgets.critical') : t('widgets.none')}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Timeline */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-card-foreground flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{t('widgets.auditTimeline')}</span>
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-[0.625rem] border border-success/20">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-success" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">{t('widgets.lastAudit')}</p>
                  <p className="text-xs text-muted-foreground">{t('widgets.completedSuccessfully')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-card-foreground">
                  {formatDate(compliance.lastAudit)}
                </p>
                <Badge variant="secondary" className="text-xs">{t('widgets.passed')}</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-[0.625rem] border border-primary/20">
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">{t('widgets.nextAudit')}</p>
                  <p className="text-xs text-muted-foreground">{t('widgets.scheduledAudit')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-card-foreground">
                  {formatDate(compliance.nextAudit)}
                </p>
                <Badge variant="outline" className="text-xs">
                  {daysUntilAudit > 0 ? `${daysUntilAudit} ${t('widgets.days')}` : t('widgets.overdue')}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Progress */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-card-foreground">{t('widgets.complianceProgress')}</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('widgets.overallCompliance')}</span>
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
            {t('widgets.viewDetails')}
          </Button>
          <Button variant="outline" size="sm" className="hover:bg-muted focus:ring-2 focus:ring-ring">
            <Download className="h-4 w-4 mr-2" />
            {t('widgets.exportReport')}
          </Button>
        </div>

        {/* Compliance Insights */}
        <div className="p-3 bg-primary/10 rounded-[0.625rem] border border-primary/20">
          <h5 className="text-sm font-medium text-primary mb-2">💡 {t('widgets.complianceInsights')}</h5>
          <ul className="text-xs text-primary/80 space-y-1">
            {compliance.overallStatus === 'green' && (
              <li>• {t('widgets.allRequirementsMet')}</li>
            )}
            {compliance.overallStatus === 'amber' && (
              <li>• {t('widgets.attentionNeededAreas')}</li>
            )}
            {compliance.overallStatus === 'red' && (
              <li>• {t('widgets.immediateActionRequired')}</li>
            )}
            <li>• {t('widgets.nextAuditIn', { days: daysUntilAudit })}</li>
            {compliance.pendingApprovals > 0 && (
              <li>• {t('widgets.approvalsPendingReview', { count: compliance.pendingApprovals })}</li>
            )}
            {compliance.violations > 0 && (
              <li>• {t('widgets.violationsNeedResolution', { count: compliance.violations })}</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
  } catch (error) {
    console.error('❌ ComplianceRadar: Component initialization error:', error);
    return (
      <Card className={`${className} shadow-2xs border-destructive/20`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
            <Shield className="h-5 w-5 text-destructive" />
            <span>Compliance Radar</span>
          </CardTitle>
          <CardDescription className="text-destructive">
            Component initialization failed
          </CardDescription>
        </CardHeader>
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </Card>
    );
  }
}

export default ComplianceRadar;





