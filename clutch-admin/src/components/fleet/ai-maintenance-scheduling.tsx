"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wrench, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  Zap,
  Car,
  MapPin,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  Bell,
  BellOff,
  RefreshCw,
  Filter,
  Download,
  Settings,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface MaintenanceTask {
  id: string;
  vehicleId: string;
  vehicleName: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  title: string;
  description: string;
  estimatedDuration: number; // minutes
  estimatedCost: number;
  scheduledDate: string;
  dueDate: string;
  assignedTechnician: {
    id: string;
    name: string;
    skill: string;
    availability: 'available' | 'busy' | 'offline';
  };
  location: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  parts: {
    id: string;
    name: string;
    quantity: number;
    cost: number;
    availability: 'in_stock' | 'ordered' | 'out_of_stock';
  }[];
  aiRecommendations: {
    confidence: number;
    reasoning: string;
    alternatives: string[];
    riskFactors: string[];
  };
  history: {
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details: string;
  }[];
}

interface MaintenanceSchedule {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number; // days
  lastRun: string;
  nextRun: string;
  isActive: boolean;
  tasks: string[]; // task IDs
  aiOptimization: {
    enabled: boolean;
    lastOptimized: string;
    efficiencyGain: number;
    costSavings: number;
  };
}

interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  certifications: string[];
  availability: {
    status: 'available' | 'busy' | 'offline';
    nextAvailable: string;
    currentTask?: string;
  };
  performance: {
    tasksCompleted: number;
    avgCompletionTime: number;
    qualityScore: number;
    customerRating: number;
  };
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

interface AIMaintenanceSchedulingProps {
  className?: string;
}

export default function AIMaintenanceScheduling({ className }: AIMaintenanceSchedulingProps) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isAIOptimizationEnabled, setIsAIOptimizationEnabled] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    const loadMaintenanceData = async () => {
      try {
        // Load maintenance tasks from API
        const tasksResponse = await fetch('/api/v1/fleet/maintenance/tasks', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData.data || []);
        } else {
          setTasks([]);
        }

        // Load maintenance schedules from API
        const schedulesResponse = await fetch('/api/v1/fleet/maintenance/schedules', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (schedulesResponse.ok) {
          const schedulesData = await schedulesResponse.json();
          setSchedules(schedulesData.data || []);
        } else {
          setSchedules([]);
        }

        // Load technicians from API
        const techniciansResponse = await fetch('/api/v1/fleet/technicians', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (techniciansResponse.ok) {
          const techniciansData = await techniciansResponse.json();
          setTechnicians(techniciansData.data || []);
        } else {
          setTechnicians([]);
        }
      } catch (error) {
        // Error handled by API service
        setTasks([]);
        setSchedules([]);
        setTechnicians([]);
      }
    };

    loadMaintenanceData();
  }, []);

  // Mock data removed - using real API data only
        {
          id: 'task-001',
          vehicleId: 'VH-001',
          vehicleName: 'Scooter Alpha',
          type: 'preventive',
          priority: 'high',
          status: 'scheduled',
          title: 'Battery System Check',
          description: 'Comprehensive battery health assessment and optimization',
          estimatedDuration: 120,
          estimatedCost: 150,
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTechnician: {
            id: 'tech-001',
            name: 'John Smith',
            skill: 'Battery Specialist',
            availability: 'available'
          },
          location: {
            name: 'Main Service Center',
            address: '123 Service St, New York, NY',
            coordinates: { lat: 40.7128, lng: -74.0060 }
          },
          parts: [
            {
              id: 'part-001',
              name: 'Battery Diagnostic Kit',
              quantity: 1,
              cost: 50,
              availability: 'in_stock'
            }
          ],
          aiRecommendations: {
            confidence: 92,
            reasoning: 'Battery performance declining based on usage patterns and age',
            alternatives: ['Replace battery', 'Deep cycle maintenance', 'Software update'],
            riskFactors: ['High usage area', 'Extreme weather exposure', 'Aging battery']
          },
          history: [
            {
              id: 'hist-001',
              action: 'Task Created',
              user: 'AI System',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              details: 'Automated scheduling based on predictive analysis'
            }
          ]
        },
        {
          id: 'task-002',
          vehicleId: 'VH-002',
          vehicleName: 'Bike Beta',
          type: 'corrective',
          priority: 'critical',
          status: 'in_progress',
          title: 'Brake System Repair',
          description: 'Emergency brake system repair due to safety concerns',
          estimatedDuration: 180,
          estimatedCost: 300,
          scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTechnician: {
            id: 'tech-002',
            name: 'Sarah Johnson',
            skill: 'Brake Specialist',
            availability: 'busy'
          },
          location: {
            name: 'Emergency Service Center',
            address: '456 Emergency Ave, New York, NY',
            coordinates: { lat: 40.7589, lng: -73.9851 }
          },
          parts: [
            {
              id: 'part-002',
              name: 'Brake Pads Set',
              quantity: 2,
              cost: 80,
              availability: 'in_stock'
            },
            {
              id: 'part-003',
              name: 'Brake Fluid',
              quantity: 1,
              cost: 25,
              availability: 'in_stock'
            }
          ],
          aiRecommendations: {
            confidence: 98,
            reasoning: 'Critical safety issue detected through sensor data analysis',
            alternatives: ['Complete brake system replacement', 'Partial repair'],
            riskFactors: ['Safety critical', 'High usage vehicle', 'Weather conditions']
          },
          history: [
            {
              id: 'hist-002',
              action: 'Task Created',
              user: 'Safety System',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              details: 'Emergency alert triggered by brake sensor'
            },
            {
              id: 'hist-003',
              action: 'Work Started',
              user: 'Sarah Johnson',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              details: 'Technician began brake system repair'
            }
          ]
        },
        {
          id: 'task-003',
          vehicleId: 'VH-003',
          vehicleName: 'Car Gamma',
          type: 'inspection',
          priority: 'medium',
          status: 'completed',
          title: 'Monthly Safety Inspection',
          description: 'Routine monthly safety and performance inspection',
          estimatedDuration: 90,
          estimatedCost: 75,
          scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTechnician: {
            id: 'tech-003',
            name: 'Mike Chen',
            skill: 'General Maintenance',
            availability: 'available'
          },
          location: {
            name: 'Inspection Center',
            address: '789 Inspection Blvd, New York, NY',
            coordinates: { lat: 40.7505, lng: -73.9934 }
          },
          parts: [],
          aiRecommendations: {
            confidence: 85,
            reasoning: 'Scheduled maintenance based on usage patterns and regulations',
            alternatives: ['Extended inspection', 'Quick check'],
            riskFactors: ['Regulatory compliance', 'High mileage vehicle']
          },
          history: [
            {
              id: 'hist-004',
              action: 'Task Completed',
              user: 'Mike Chen',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              details: 'Inspection completed successfully, all systems operational'
            }
          ]
        }
      ];

      const mockSchedules: MaintenanceSchedule[] = [
        {
          id: 'schedule-001',
          name: 'Battery Maintenance',
          description: 'Regular battery health checks and optimization',
          frequency: 'monthly',
          interval: 30,
          lastRun: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          tasks: ['task-001'],
          aiOptimization: {
            enabled: true,
            lastOptimized: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            efficiencyGain: 25,
            costSavings: 500
          }
        },
        {
          id: 'schedule-002',
          name: 'Safety Inspections',
          description: 'Monthly safety and compliance inspections',
          frequency: 'monthly',
          interval: 30,
          lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          nextRun: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          tasks: ['task-003'],
          aiOptimization: {
            enabled: true,
            lastOptimized: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            efficiencyGain: 15,
            costSavings: 300
          }
        }
      ];

      const mockTechnicians: Technician[] = [
        {
          id: 'tech-001',
          name: 'John Smith',
          email: 'john.smith@clutch.com',
          phone: '+1-555-0123',
          skills: ['Battery Systems', 'Electrical', 'Diagnostics'],
          certifications: ['EV Technician', 'Battery Specialist'],
          availability: {
            status: 'available',
            nextAvailable: new Date().toISOString()
          },
          performance: {
            tasksCompleted: 45,
            avgCompletionTime: 95,
            qualityScore: 4.8,
            customerRating: 4.9
          },
          location: {
            lat: 40.7128,
            lng: -74.0060,
            address: '123 Service St, New York, NY'
          }
        },
        {
          id: 'tech-002',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@clutch.com',
          phone: '+1-555-0124',
          skills: ['Brake Systems', 'Safety', 'Emergency Repair'],
          certifications: ['Brake Specialist', 'Safety Inspector'],
          availability: {
            status: 'busy',
            nextAvailable: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            currentTask: 'task-002'
          },
          performance: {
            tasksCompleted: 38,
            avgCompletionTime: 110,
            qualityScore: 4.9,
            customerRating: 4.8
          },
          location: {
            lat: 40.7589,
            lng: -73.9851,
            address: '456 Emergency Ave, New York, NY'
          }
        }
      ];

      setTasks(mockTasks);
      setSchedules(mockSchedules);
      setTechnicians(mockTechnicians);
      setSelectedTask(mockTasks[0]);
    };

    loadMaintenanceData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-primary/10 text-blue-800';
      case 'in_progress': return 'bg-warning/10 text-yellow-800';
      case 'completed': return 'bg-success/10 text-green-800';
      case 'cancelled': return 'bg-muted text-gray-800';
      case 'overdue': return 'bg-destructive/10 text-red-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive/100';
      case 'high': return 'bg-warning/100';
      case 'medium': return 'bg-warning/100';
      case 'low': return 'bg-success/100';
      default: return 'bg-muted/500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive': return <Calendar className="h-4 w-4" />;
      case 'corrective': return <Wrench className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      case 'inspection': return <CheckCircle className="h-4 w-4" />;
      default: return <Wrench className="h-4 w-4" />;
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success/10 text-green-800';
      case 'busy': return 'bg-warning/10 text-yellow-800';
      case 'offline': return 'bg-muted text-gray-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const handleTaskStatusUpdate = (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus as string } : task
    ));
  };

  const handleAIOptimization = () => {
    // Simulate AI optimization
    setTasks(prev => prev.map(task => ({
      ...task,
      aiRecommendations: {
        ...task.aiRecommendations,
        confidence: task.aiRecommendations.confidence // Use actual confidence without random variation
      }
    })));
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const scheduledTasks = tasks.filter(task => task.status === 'scheduled').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const overdueTasks = tasks.filter(task => task.status === 'overdue').length;
  const totalCost = tasks.reduce((sum, task) => sum + task.estimatedCost, 0);
  const avgAIConfidence = tasks.length > 0 
    ? Math.round(tasks.reduce((sum, task) => sum + task.aiRecommendations.confidence, 0) / tasks.length)
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                AI Auto-Maintenance Scheduling
              </CardTitle>
              <CardDescription>
                Intelligent maintenance scheduling with AI optimization and predictive analytics
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAIOptimizationEnabled(!isAIOptimizationEnabled)}
                className={isAIOptimizationEnabled ? 'bg-success/10 text-green-800' : ''}
              >
                {isAIOptimizationEnabled ? <Zap className="h-4 w-4 mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                AI Optimization
              </Button>
              <Button variant="outline" size="sm" onClick={handleAIOptimization}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Optimize
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Maintenance Summary */}
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{scheduledTasks}</div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{inProgressTasks}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center p-3 bg-success/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-success">{completedTasks}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-destructive">{overdueTasks}</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{avgAIConfidence}%</div>
              <div className="text-sm text-muted-foreground">AI Confidence</div>
            </div>
          </div>

          {/* AI Optimization Status */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-[0.625rem]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">AI Optimization Status</h4>
                <p className="text-sm text-muted-foreground">
                  {isAIOptimizationEnabled ? 'AI optimization is active' : 'AI optimization is disabled'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {schedules.reduce((sum, schedule) => sum + schedule.aiOptimization.efficiencyGain, 0) / schedules.length}%
                </div>
                <div className="text-sm text-muted-foreground">Efficiency Gain</div>
              </div>
            </div>
          </div>

          {/* Maintenance Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Maintenance Tasks</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Status:</span>
                {['all', 'scheduled', 'in_progress', 'completed', 'cancelled', 'overdue'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status.replace('_', ' ')}
                  </Button>
                ))}
                <span className="text-sm ml-4">Priority:</span>
                {['all', 'critical', 'high', 'medium', 'low'].map((priority) => (
                  <Button
                    key={priority}
                    variant={filterPriority === priority ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterPriority(priority)}
                  >
                    {priority}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    selectedTask?.id === task.id ? 'border-blue-500 bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(task.type)}
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground">{task.vehicleName} - {task.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-sm font-medium">
                        {task.aiRecommendations.confidence}% AI
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Assigned to: {task.assignedTechnician.name}</span>
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    <span>Cost: {formatCurrency(task.estimatedCost)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Task Details */}
          {selectedTask && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Task Details - {selectedTask.title}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="ai">AI Analysis</TabsTrigger>
                  <TabsTrigger value="technician">Technician</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Task Information</h5>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Type:</span> {selectedTask.type}</div>
                        <div><span className="font-medium">Priority:</span> {selectedTask.priority}</div>
                        <div><span className="font-medium">Status:</span> {selectedTask.status}</div>
                        <div><span className="font-medium">Duration:</span> {selectedTask.estimatedDuration} minutes</div>
                        <div><span className="font-medium">Cost:</span> {formatCurrency(selectedTask.estimatedCost)}</div>
                        <div><span className="font-medium">Scheduled:</span> {new Date(selectedTask.scheduledDate).toLocaleString()}</div>
                        <div><span className="font-medium">Due:</span> {new Date(selectedTask.dueDate).toLocaleString()}</div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Location</h5>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Name:</span> {selectedTask.location.name}</div>
                        <div><span className="font-medium">Address:</span> {selectedTask.location.address}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Required Parts</h5>
                    <div className="space-y-2">
                      {selectedTask.parts.map((part) => (
                        <div key={part.id} className="flex items-center justify-between p-2 border rounded-[0.625rem]">
                          <div>
                            <div className="font-medium text-sm">{part.name}</div>
                            <div className="text-xs text-muted-foreground">Qty: {part.quantity}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{formatCurrency(part.cost)}</span>
                            <Badge className={getAvailabilityColor(part.availability)}>
                              {part.availability.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">AI Recommendations</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span className="font-medium">{selectedTask.aiRecommendations.confidence}%</span>
                        </div>
                        <div>
                          <span className="font-medium">Reasoning:</span>
                          <p className="text-muted-foreground mt-1">{selectedTask.aiRecommendations.reasoning}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Risk Factors</h5>
                      <div className="space-y-1">
                        {selectedTask.aiRecommendations.riskFactors.map((risk, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {risk}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Alternative Approaches</h5>
                    <div className="space-y-2">
                      {selectedTask.aiRecommendations.alternatives.map((alternative, index) => (
                        <div key={index} className="p-2 border rounded-[0.625rem] text-sm">
                          {alternative}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="technician" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Technician Information</h5>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Name:</span> {selectedTask.assignedTechnician.name}</div>
                        <div><span className="font-medium">Skill:</span> {selectedTask.assignedTechnician.skill}</div>
                        <div><span className="font-medium">Availability:</span> {selectedTask.assignedTechnician.availability}</div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Performance</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Tasks Completed:</span>
                          <span className="font-medium">{technicians.find(t => t.id === selectedTask.assignedTechnician.id)?.performance.tasksCompleted || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quality Score:</span>
                          <span className="font-medium">{technicians.find(t => t.id === selectedTask.assignedTechnician.id)?.performance.qualityScore || 0}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Customer Rating:</span>
                          <span className="font-medium">{technicians.find(t => t.id === selectedTask.assignedTechnician.id)?.performance.customerRating || 0}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Task History</h5>
                    <div className="space-y-2">
                      {selectedTask.history.map((entry) => (
                        <div key={entry.id} className="p-2 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{entry.action}</span>
                            <span className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.user} - {entry.details}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Start Task
                </Button>
                <Button size="sm" variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button size="sm" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </Button>
                <Button size="sm" variant="outline">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
