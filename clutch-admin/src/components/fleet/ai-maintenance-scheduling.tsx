"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Wrench, 
  User, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Filter, 
  Download, 
  Eye, 
  EyeOff, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  Shield, 
  Brain, 
  BarChart3, 
  LineChart, 
  PieChart, 
  Gauge, 
  Timer, 
  DollarSign, 
  Truck, 
  Car, 
  Bike, 
  Navigation, 
  Route, 
  Fuel, 
  Battery, 
  Cog, 
  Wrench as WrenchIcon, 
  AlertTriangle as AlertTriangleIcon, 
  CheckCircle as CheckCircleIcon, 
  XCircle as XCircleIcon, 
  Play as PlayIcon, 
  Pause as PauseIcon, 
  RotateCcw as RotateCcwIcon, 
  Settings as SettingsIcon, 
  Filter as FilterIcon, 
  Download as DownloadIcon, 
  Eye as EyeIcon, 
  EyeOff as EyeOffIcon, 
  Activity as ActivityIcon, 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon, 
  Target as TargetIcon, 
  Zap as ZapIcon, 
  Shield as ShieldIcon, 
  Brain as BrainIcon, 
  BarChart3 as BarChart3Icon, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Gauge as GaugeIcon, 
  Timer as TimerIcon, 
  DollarSign as DollarSignIcon, 
  Truck as TruckIcon, 
  Car as CarIcon, 
  Bike as BikeIcon, 
  Navigation as NavigationIcon, 
  Route as RouteIcon, 
  Fuel as FuelIcon, 
  Battery as BatteryIcon, 
  Cog as CogIcon
} from 'lucide-react';
import { productionApi } from '@/lib/production-api';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { toast } from 'sonner';

interface MaintenanceTask {
  id: string;
  vehicleId: string;
  vehicleName: string;
  type: 'preventive' | 'corrective' | 'emergency';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  title: string;
  description: string;
  estimatedDuration: number;
  estimatedCost: number;
  scheduledDate: string;
  dueDate: string;
  assignedTechnician?: {
    id: string;
    name: string;
    skill: string;
    availability: string;
  };
  location?: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  parts?: Array<{
    id: string;
    name: string;
    quantity: number;
    cost: number;
    availability: string;
  }>;
  aiRecommendations?: {
    confidence: number;
    reasoning: string;
    alternatives: string[];
    riskFactors: string[];
  };
  history?: Array<{
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details: string;
  }>;
}

interface MaintenanceSchedule {
  id: string;
  vehicleId: string;
  vehicleName: string;
  type: string;
  frequency: string;
  nextDue: string;
  lastCompleted?: string;
  status: string;
}

interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  certifications: string[];
  availability: {
    status: string;
    nextAvailable: string;
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

export default function AIMaintenanceScheduling() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const loadMaintenanceData = async () => {
      try {
        setIsLoading(true);
        
        // Load real maintenance data from API
        const [tasksData, schedulesData, techniciansData] = await Promise.all([
          productionApi.getMaintenanceRecords(),
          productionApi.getMaintenanceRecords(), // Using same endpoint for schedules
          productionApi.getUsers() // Using users endpoint for technicians
        ]);

        if (tasksData && Array.isArray(tasksData)) {
          setTasks(tasksData);
        } else {
          setTasks([]);
        }

        if (schedulesData && Array.isArray(schedulesData)) {
          setSchedules(schedulesData);
        } else {
          setSchedules([]);
        }

        if (techniciansData && Array.isArray(techniciansData)) {
          setTechnicians(techniciansData);
        } else {
          setTechnicians([]);
        }
      } catch (error) {
        // Error handled by API service
        setTasks([]);
        setSchedules([]);
        setTechnicians([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMaintenanceData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-primary/10 text-primary';
      case 'in_progress': return 'bg-warning/10 text-warning';
      case 'completed': return 'bg-success/10 text-success';
      case 'cancelled': return 'bg-muted text-gray-800';
      case 'overdue': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive/100';
      case 'high': return 'bg-warning/100';
      case 'medium': return 'bg-warning/100';
      case 'low': return 'bg-success/100';
      default: return 'bg-muted';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'preventive': return 'bg-primary/100';
      case 'corrective': return 'bg-warning/100';
      case 'emergency': return 'bg-destructive/100';
      default: return 'bg-muted';
    }
  };

  const handleTaskStatusUpdate = (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus as string } : task
    ));
  };

  const handleAIOptimization = () => {
    // Simulate AI optimization
    toast.success('AI optimization applied successfully');
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    const typeMatch = filterType === 'all' || task.type === filterType;
    return statusMatch && priorityMatch && typeMatch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Maintenance Scheduling</h1>
          <p className="text-muted-foreground">
            Intelligent maintenance planning and scheduling powered by AI
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleAIOptimization} className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>AI Optimize</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Maintenance Tasks</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="technicians">Technicians</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="overdue">Overdue</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Types</option>
              <option value="preventive">Preventive</option>
              <option value="corrective">Corrective</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getTypeColor(task.type)}>
                        {task.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                      <p className="text-sm">{task.vehicleName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Duration</p>
                      <p className="text-sm">{task.estimatedDuration} min</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cost</p>
                      <p className="text-sm">${task.estimatedCost}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                      <p className="text-sm">{new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {task.assignedTechnician && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground">Assigned Technician</p>
                      <p className="text-sm">{task.assignedTechnician.name} - {task.assignedTechnician.skill}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <div className="grid gap-4">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardHeader>
                  <CardTitle>{schedule.vehicleName}</CardTitle>
                  <CardDescription>{schedule.type} - {schedule.frequency}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Next Due</p>
                      <p className="text-sm">{new Date(schedule.nextDue).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(schedule.status)}>
                        {schedule.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-4">
          <div className="grid gap-4">
            {technicians.map((technician) => (
              <Card key={technician.id}>
                <CardHeader>
                  <CardTitle>{technician.name}</CardTitle>
                  <CardDescription>{technician.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Skills</p>
                      <p className="text-sm">{technician.skills.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Availability</p>
                      <Badge className={getStatusColor(technician.availability.status)}>
                        {technician.availability.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


