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
import { hybridApi } from "@/lib/hybrid-api";

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

  // Mock data for development
  const mockProjects: Project[] = [
    {
      _id: "1",
      name: "Clutch Mobile App Redesign",
      description: "Complete redesign of the Clutch mobile application with new UI/UX",
      status: "active",
      priority: "high",
      startDate: "2024-01-15",
      endDate: "2024-06-30",
      budget: 150000,
      progress: 65,
      team: [
        { id: "1", name: "Ahmed Hassan", role: "Project Manager" },
        { id: "2", name: "Fatma Ali", role: "UI/UX Designer" },
        { id: "3", name: "Mohamed Ibrahim", role: "Frontend Developer" },
        { id: "4", name: "Nour El-Din", role: "Backend Developer" },
      ],
      client: {
        id: "1",
        name: "Clutch Technologies",
        email: "contact@yourclutch.com",
      },
      tasks: {
        total: 45,
        completed: 29,
        inProgress: 12,
        pending: 4,
      },
      timeTracking: {
        estimated: 1200,
        logged: 780,
        remaining: 420,
      },
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-03-15T14:30:00Z",
    },
    {
      _id: "2",
      name: "Enterprise Dashboard Development",
      description: "Build comprehensive dashboard for enterprise clients",
      status: "planning",
      priority: "medium",
      startDate: "2024-04-01",
      endDate: "2024-08-31",
      budget: 200000,
      progress: 15,
      team: [
        { id: "5", name: "Omar Khaled", role: "Project Manager" },
        { id: "6", name: "Yasmin Mostafa", role: "Full Stack Developer" },
        { id: "7", name: "Tarek Mohamed", role: "DevOps Engineer" },
      ],
      client: {
        id: "2",
        name: "Enterprise Solutions Ltd",
        email: "projects@enterprise.com",
      },
      tasks: {
        total: 32,
        completed: 5,
        inProgress: 3,
        pending: 24,
      },
      timeTracking: {
        estimated: 800,
        logged: 120,
        remaining: 680,
      },
      createdAt: "2024-03-01T09:00:00Z",
      updatedAt: "2024-03-15T16:45:00Z",
    },
    {
      _id: "3",
      name: "API Integration Platform",
      description: "Develop platform for third-party API integrations",
      status: "completed",
      priority: "high",
      startDate: "2023-10-01",
      endDate: "2024-02-29",
      budget: 100000,
      progress: 100,
      team: [
        { id: "8", name: "Hassan Mahmoud", role: "Tech Lead" },
        { id: "9", name: "Dina Salah", role: "Backend Developer" },
        { id: "10", name: "Karim Farouk", role: "API Developer" },
      ],
      client: {
        id: "3",
        name: "Integration Partners",
        email: "tech@integration.com",
      },
      tasks: {
        total: 28,
        completed: 28,
        inProgress: 0,
        pending: 0,
      },
      timeTracking: {
        estimated: 600,
        logged: 580,
        remaining: 0,
      },
      createdAt: "2023-09-15T08:00:00Z",
      updatedAt: "2024-02-29T17:00:00Z",
    },
  ];

  const mockTasks: Task[] = [
    {
      _id: "1",
      title: "Design new user interface",
      description: "Create wireframes and mockups for the new mobile app design",
      status: "in_progress",
      priority: "high",
      assignee: {
        id: "2",
        name: "Fatma Ali",
      },
      estimatedHours: 40,
      loggedHours: 25,
      dueDate: "2024-04-15",
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      _id: "2",
      title: "Implement authentication system",
      description: "Build secure authentication with JWT tokens",
      status: "completed",
      priority: "high",
      assignee: {
        id: "3",
        name: "Mohamed Ibrahim",
      },
      estimatedHours: 32,
      loggedHours: 32,
      dueDate: "2024-03-01",
      createdAt: "2024-01-20T09:00:00Z",
    },
    {
      _id: "3",
      title: "Database optimization",
      description: "Optimize database queries and add indexing",
      status: "pending",
      priority: "medium",
      assignee: {
        id: "4",
        name: "Nour El-Din",
      },
      estimatedHours: 24,
      loggedHours: 0,
      dueDate: "2024-04-30",
      createdAt: "2024-02-01T14:00:00Z",
    },
  ];

  const mockTimeEntries: TimeEntry[] = [
    {
      _id: "1",
      taskId: "1",
      userId: "2",
      userName: "Fatma Ali",
      description: "UI design work on login screen",
      hours: 4,
      date: "2024-03-15",
      createdAt: "2024-03-15T18:00:00Z",
    },
    {
      _id: "2",
      taskId: "1",
      userId: "2",
      userName: "Fatma Ali",
      description: "Wireframe creation for dashboard",
      hours: 6,
      date: "2024-03-14",
      createdAt: "2024-03-14T17:30:00Z",
    },
    {
      _id: "3",
      taskId: "2",
      userId: "3",
      userName: "Mohamed Ibrahim",
      description: "JWT implementation and testing",
      hours: 8,
      date: "2024-03-13",
      createdAt: "2024-03-13T19:00:00Z",
    },
  ];

  useEffect(() => {
    loadProjects();
    loadTasks();
    loadTimeEntries();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await hybridApi.getProjects();
      setProjects(data || mockProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects(mockProjects);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await hybridApi.getProjectTasks(selectedProject?._id || "");
      setTasks(data || mockTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks(mockTasks);
    }
  };

  const loadTimeEntries = async () => {
    try {
      const data = await hybridApi.getTimeTracking(selectedProject?._id || "");
      setTimeEntries(data || mockTimeEntries);
    } catch (error) {
      console.error("Error loading time entries:", error);
      setTimeEntries(mockTimeEntries);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary-foreground";
      case "planning":
        return "bg-secondary/10 text-secondary-foreground";
      case "on_hold":
        return "bg-secondary/10 text-secondary-foreground";
      case "completed":
        return "bg-muted text-muted-foreground";
      case "cancelled":
        return "bg-destructive/10 text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive/10 text-destructive-foreground";
      case "high":
        return "bg-secondary/10 text-secondary-foreground";
      case "medium":
        return "bg-secondary/10 text-secondary-foreground";
      case "low":
        return "bg-primary/10 text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === "active").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalLoggedHours = projects.reduce((sum, p) => sum + p.timeTracking.logged, 0);

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
              {new Set(projects.flatMap(p => p.team.map(t => t.id))).size}
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
              <Card key={project._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{project.name}</h3>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace("_", " ")}
                        </Badge>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{project.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Progress</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">{project.progress}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Budget</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(project.budget)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Team Size</p>
                          <p className="text-sm text-muted-foreground">{project.team.length} members</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Tasks</p>
                          <p className="text-sm text-muted-foreground">
                            {project.tasks.completed}/{project.tasks.total} completed
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{project.timeTracking.logged}h logged</span>
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
                <Input id="name" placeholder="Enter project name" />
              </div>
              <div>
                <Label htmlFor="client">Client</Label>
                <Input id="client" placeholder="Client name" />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Project description" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" />
              </div>
              <div>
                <Label htmlFor="budget">Budget (EGP)</Label>
                <Input id="budget" type="number" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select className="w-full p-2 border rounded-md">
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
            <Button onClick={() => setShowCreateDialog(false)}>
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
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="task">Task</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="">Select task</option>
                {tasks.map((task) => (
                  <option key={task._id} value={task._id}>
                    {task.title}
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
    </div>
  );
}
