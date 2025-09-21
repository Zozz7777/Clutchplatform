"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Users,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Pause,
  Play,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Timer,
  UserPlus,
  FileText,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { productionApi } from "@/lib/production-api";
import { useTranslations } from "next-intl";

// Import new Phase 2 widgets
import ProjectROI from '@/components/widgets/project-roi';

interface Project {
  _id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  startDate: string;
  endDate: string;
  budget: number;
  progress: number;
  team: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }[];
  client: {
    id: string;
    name: string;
    email: string;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  };
  timeTracking: {
    estimated: number;
    logged: number;
    remaining: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  assignee: {
    id: string;
    name: string;
    avatar?: string;
  };
  estimatedHours: number;
  loggedHours: number;
  dueDate: string;
  createdAt: string;
}

interface TimeEntry {
  _id: string;
  taskId: string;
  userId: string;
  userName: string;
  description: string;
  hours: number;
  date: string;
  createdAt: string;
}

export default function ProjectManagementPage() {
  const t = useTranslations();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [createProjectData, setCreateProjectData] = useState({
    name: "",
    description: "",
    client: "",
    startDate: "",
    endDate: "",
    budget: "",
    status: "planning",
    priority: "medium"
  });


  useEffect(() => {
    loadProjects();
    loadTasks();
    loadTimeEntries();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await productionApi.getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await productionApi.getProjectTasks(selectedProject?._id || "");
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    }
  };

  const loadTimeEntries = async () => {
    try {
      const data = await productionApi.getTimeTracking(selectedProject?._id || "");
      setTimeEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading time entries:', error);
      setTimeEntries([]);
    }
  };

  const createProject = async () => {
    try {
      const projectData = {
        name: createProjectData.name,
        description: createProjectData.description,
        client: {
          name: createProjectData.client,
          email: "",
        },
        startDate: createProjectData.startDate,
        endDate: createProjectData.endDate,
        budget: parseFloat(createProjectData.budget) || 0,
        status: createProjectData.status,
        priority: createProjectData.priority,
        progress: 0,
        team: [],
        tasks: { total: 0, completed: 0, inProgress: 0, pending: 0 },
        timeTracking: { estimated: 0, logged: 0, remaining: 0 }
      };

      const newProject = await productionApi.createProject(projectData);
      if (newProject) {
        setProjects(prev => [...(Array.isArray(prev) ? prev : []), newProject]);
        setShowCreateDialog(false);
        setCreateProjectData({
          name: "",
          description: "",
          client: "",
          startDate: "",
          endDate: "",
          budget: "",
          status: "planning",
          priority: "medium"
        });
      }
    } catch (error) {
      // Error handled by API service
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "planning":
        return "secondary";
      case "on_hold":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "secondary";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const projectsArray = Array.isArray(projects) ? projects : [];
  
  const filteredProjects = projectsArray.filter((project) => {
    if (!project) return false;
    const matchesSearch = (project.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalProjects = projectsArray.length;
  const activeProjects = projectsArray.filter(p => p?.status === "active").length;
  const completedProjects = projectsArray.filter(p => p?.status === "completed").length;
  const totalBudget = projectsArray.reduce((sum, p) => sum + (p?.budget || 0), 0);
  const totalLoggedHours = projectsArray.reduce((sum, p) => sum + (p?.timeTracking?.logged || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
          <p className="text-muted-foreground">
            Manage projects, tasks, and time tracking across your organization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowTimeDialog(true)} variant="outline">
            <Timer className="mr-2 h-4 w-4" />
            Log Time
          </Button>
          <Button onClick={() => setShowTaskDialog(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {activeProjects} active, {completedProjects} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLoggedHours}</div>
            <p className="text-xs text-muted-foreground">
              Total hours tracked
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(projectsArray.flatMap(p => Array.isArray(p?.team) ? p.team.map(t => t?.id).filter(Boolean) : [])).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Active team members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>
            Manage and track all your projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Status: {statusFilter === "all" ? "All" : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("planning")}>
                  Planning
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("on_hold")}>
                  On Hold
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                  Completed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Projects Table */}
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Card key={project?._id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{project?.name || 'Unknown Project'}</h3>
                        <Badge variant={getStatusVariant(project?.status || 'unknown')}>
                          {(project?.status || 'unknown').replace("_", " ")}
                        </Badge>
                        <Badge variant={getPriorityVariant(project?.priority || 'unknown')}>
                          {project?.priority || 'unknown'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{project?.description || 'No description'}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Progress</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${project?.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">{project?.progress || 0}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Budget</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(project?.budget || 0)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Team Size</p>
                          <p className="text-sm text-muted-foreground">{(project?.team || []).length} members</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Tasks</p>
                          <p className="text-sm text-muted-foreground">
                            {project?.tasks?.completed || 0}/{project?.tasks?.total || 0} completed
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Start: {project?.startDate ? new Date(project.startDate).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>End: {project?.endDate ? new Date(project.endDate).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{project?.timeTracking?.logged || 0}h logged</span>
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedProject(project)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          View Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project to track tasks, time, and team collaboration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter project name" 
                  value={createProjectData.name}
                  onChange={(e) => setCreateProjectData({...createProjectData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="client">Client</Label>
                <Input 
                  id="client" 
                  placeholder="Client name" 
                  value={createProjectData.client}
                  onChange={(e) => setCreateProjectData({...createProjectData, client: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                placeholder="Project description" 
                value={createProjectData.description}
                onChange={(e) => setCreateProjectData({...createProjectData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={createProjectData.startDate}
                  onChange={(e) => setCreateProjectData({...createProjectData, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={createProjectData.endDate}
                  onChange={(e) => setCreateProjectData({...createProjectData, endDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="budget">Budget (EGP)</Label>
                <Input 
                  id="budget" 
                  type="number" 
                  placeholder="0" 
                  value={createProjectData.budget}
                  onChange={(e) => setCreateProjectData({...createProjectData, budget: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={createProjectData.status}
                  onChange={(e) => setCreateProjectData({...createProjectData, status: e.target.value})}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={createProjectData.priority}
                  onChange={(e) => setCreateProjectData({...createProjectData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createProject}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task for the selected project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="taskTitle">Task Title</Label>
              <Input id="taskTitle" placeholder="Enter task title" />
            </div>
            <div>
              <Label htmlFor="taskDescription">Description</Label>
              <Input id="taskDescription" placeholder="Task description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignee">Assignee</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">Select assignee</option>
                  <option value="1">Ahmed Hassan</option>
                  <option value="2">Fatma Ali</option>
                  <option value="3">Mohamed Ibrahim</option>
                </select>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input id="estimatedHours" type="number" placeholder="0" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowTaskDialog(false)}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Time Dialog */}
      <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Time Entry</DialogTitle>
            <DialogDescription>
              Log time spent on a specific task.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="project">Project</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="">Select project</option>
                {projectsArray.map((project) => (
                  <option key={project?._id} value={project?._id}>
                    {project?.name || 'Unknown Project'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="task">Task</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="">Select task</option>
                {(Array.isArray(tasks) ? tasks : []).map((task) => (
                  <option key={task?._id} value={task?._id}>
                    {task?.title || 'Unknown Task'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="What did you work on?" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hours">Hours</Label>
                <Input id="hours" type="number" step="0.5" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowTimeDialog(false)}>
              Log Time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Phase 2: Projects Analytics Widgets */}
      <div className="space-y-6 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Projects Analytics</h2>
            <p className="text-muted-foreground">
              Blend project execution with financial & ops impact
            </p>
          </div>
        </div>

        {/* Project ROI */}
        <div className="grid gap-6">
          <ProjectROI />
        </div>
      </div>
    </div>
  );
}
