"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Calendar,
  Download,
  Eye,
  Activity,
  BarChart3,
  Clock,
  Users
} from 'lucide-react';

interface ProjectROIProps {
  className?: string;
}

interface ProjectROIData {
  projectId: string;
  projectName: string;
  status: 'completed' | 'in-progress' | 'planned';
  investment: number;
  value: number;
  roi: number;
  duration: number;
  teamSize: number;
  completionDate: string;
}

export function ProjectROI({ className = '' }: ProjectROIProps) {
  const [roiData, setRoiData] = React.useState<{
    projects: ProjectROIData[];
    totalInvestment: number;
    totalValue: number;
    averageROI: number;
    bestROI: ProjectROIData | null;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadROIData = async () => {
      try {
        // Simulate project ROI data
        const projects: ProjectROIData[] = [
          {
            projectId: '1',
            projectName: 'Fleet Management System',
            status: 'completed',
            investment: 150000,
            value: 450000,
            roi: 200,
            duration: 6,
            teamSize: 8,
            completionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            projectId: '2',
            projectName: 'AI-Powered Analytics',
            status: 'in-progress',
            investment: 200000,
            value: 350000,
            roi: 75,
            duration: 8,
            teamSize: 12,
            completionDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            projectId: '3',
            projectName: 'Mobile App Development',
            status: 'completed',
            investment: 120000,
            value: 280000,
            roi: 133,
            duration: 4,
            teamSize: 6,
            completionDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            projectId: '4',
            projectName: 'Security Enhancement',
            status: 'completed',
            investment: 80000,
            value: 150000,
            roi: 87.5,
            duration: 3,
            teamSize: 4,
            completionDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            projectId: '5',
            projectName: 'API Integration Platform',
            status: 'planned',
            investment: 100000,
            value: 200000,
            roi: 100,
            duration: 5,
            teamSize: 7,
            completionDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        const totalInvestment = projects.reduce((sum, project) => sum + project.investment, 0);
        const totalValue = projects.reduce((sum, project) => sum + project.value, 0);
        const averageROI = projects.reduce((sum, project) => sum + project.roi, 0) / projects.length;
        const bestROI = projects.reduce((best, project) => project.roi > best.roi ? project : best, projects[0]);

        setRoiData({
          projects,
          totalInvestment,
          totalValue,
          averageROI,
          bestROI
        });
      } catch (error) {
        // Failed to load project ROI data
      } finally {
        setIsLoading(false);
      }
    };

    loadROIData();
  }, []);

  const getROIColor = (roi: number) => {
    if (roi >= 150) return 'text-success';
    if (roi >= 100) return 'text-warning';
    return 'text-destructive';
  };

  const getROIBadge = (roi: number) => {
    if (roi >= 150) return 'bg-success/10 text-green-800';
    if (roi >= 100) return 'bg-warning/10 text-yellow-800';
    return 'bg-destructive/10 text-red-800';
  };

  const getROILevel = (roi: number) => {
    if (roi >= 150) return 'Excellent';
    if (roi >= 100) return 'Good';
    return 'Poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'in-progress': return 'text-primary';
      case 'planned': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-green-800';
      case 'in-progress': return 'bg-primary/10 text-blue-800';
      case 'planned': return 'bg-muted text-gray-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-success" />
            <span>Project ROI</span>
          </CardTitle>
          <CardDescription>Loading project ROI data...</CardDescription>
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

  if (!roiData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-success" />
            <span>Project ROI</span>
          </CardTitle>
          <CardDescription>Unable to load project ROI data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-success" />
          <span>Project ROI</span>
        </CardTitle>
        <CardDescription>
          $ spent vs value delivered
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <DollarSign className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">
              ${roiData.totalValue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total Value</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <Target className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">
              {roiData.averageROI.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">Avg ROI</p>
          </div>
        </div>

        {/* Best ROI Project */}
        {roiData.bestROI && (
          <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="h-6 w-6 text-success" />
              <span className="text-xl font-bold text-foreground">{roiData.bestROI.projectName}</span>
              <Badge className={getROIBadge(roiData.bestROI.roi)}>
                {getROILevel(roiData.bestROI.roi)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {roiData.bestROI.roi.toFixed(0)}% ROI • ${roiData.bestROI.value.toLocaleString()} value
            </p>
            <div className="mt-3">
              <Progress value={Math.min(roiData.bestROI.roi, 300)} className="h-2" />
            </div>
          </div>
        )}

        {/* Projects */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Project ROI Analysis</h4>
          <div className="space-y-2">
            {roiData.projects.map((project) => (
              <div key={project.projectId} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-[0.625rem]-full">
                    <span className="text-sm font-semibold text-primary">
                      {project.projectName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{project.projectName}</p>
                    <p className="text-xs text-muted-foreground">
                      {project.duration} months • {project.teamSize} team members
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <p className={`text-sm font-semibold ${getROIColor(project.roi)}`}>
                      {project.roi.toFixed(0)}%
                    </p>
                    <Badge className={getStatusBadge(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-xs text-muted-foreground">
                      ${project.value.toLocaleString()} value
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROI Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">ROI Distribution</h4>
          <div className="space-y-2">
            {roiData.projects.map((project) => (
              <div key={project.projectId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{project.projectName}</span>
                  <span className="text-foreground font-medium">{project.roi.toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(project.roi, 300)} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Investment vs Value */}
        <div className="text-center p-3 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-primary">
              ${(roiData.totalValue - roiData.totalInvestment).toLocaleString()}
            </span>
            <Badge variant="outline" className="text-xs">
              Net Value
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Total Value - Total Investment</p>
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
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Project ROI Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total investment: ${roiData.totalInvestment.toLocaleString()}</li>
            <li>• Total value: ${roiData.totalValue.toLocaleString()}</li>
            <li>• Average ROI: {roiData.averageROI.toFixed(0)}%</li>
            <li>• Best ROI: {roiData.bestROI?.projectName} ({roiData.bestROI?.roi.toFixed(0)}%)</li>
            <li>• {roiData.projects.length} projects analyzed</li>
            <li>• {roiData.projects.filter(p => p.status === 'completed').length} completed projects</li>
            {roiData.averageROI >= 100 && (
              <li>• Excellent average ROI - strong project performance</li>
            )}
            {roiData.bestROI && roiData.bestROI.roi >= 200 && (
              <li>• Outstanding ROI achieved - replicate success factors</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProjectROI;
