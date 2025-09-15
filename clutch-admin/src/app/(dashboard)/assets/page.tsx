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
  Package,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  MapPin,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Settings,
  Truck,
  Monitor,
  Smartphone,
  Wrench,
  FileText,
  History,
  Tag,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { hybridApi } from "@/lib/hybrid-api";

interface Asset {
  _id: string;
  name: string;
  type: "vehicle" | "equipment" | "it_hardware" | "furniture" | "other";
  category: string;
  description: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  status: "active" | "inactive" | "maintenance" | "retired" | "lost" | "stolen";
  location: {
    building: string;
    floor: string;
    room: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  assignedTo: {
    id: string;
    name: string;
    email: string;
    department: string;
  } | null;
  maintenance: {
    lastService: string;
    nextService: string;
    serviceInterval: number; // days
    totalServices: number;
    totalCost: number;
  };
  warranty: {
    startDate: string;
    endDate: string;
    provider: string;
    terms: string;
  };
  tags: string[];
  images: string[];
  documents: {
    name: string;
    url: string;
    type: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceRecord {
  _id: string;
  assetId: string;
  assetName: string;
  type: "routine" | "repair" | "inspection" | "upgrade";
  description: string;
  performedBy: {
    id: string;
    name: string;
  };
  cost: number;
  date: string;
  nextDueDate?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  notes: string;
  attachments: string[];
  createdAt: string;
}

interface AssetAssignment {
  _id: string;
  assetId: string;
  assetName: string;
  assignedTo: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
  assignedBy: {
    id: string;
    name: string;
  };
  assignedDate: string;
  returnDate?: string;
  status: "active" | "returned" | "overdue";
  notes: string;
  createdAt: string;
}

export default function AssetManagementPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Mock data for development
  const mockAssets: Asset[] = [
    {
      _id: "1",
      name: "Delivery Van - Toyota Hiace",
      type: "vehicle",
      category: "Delivery Vehicle",
      description: "White Toyota Hiace van for package delivery",
      serialNumber: "VH001",
      model: "Hiace",
      manufacturer: "Toyota",
      purchaseDate: "2023-01-15",
      purchasePrice: 450000,
      currentValue: 380000,
      status: "active",
      location: {
        building: "Main Warehouse",
        floor: "Ground Floor",
        room: "Parking Area A",
        coordinates: {
          lat: 30.0444,
          lng: 31.2357,
        },
      },
      assignedTo: {
        id: "1",
        name: "Ahmed Hassan",
        email: "ahmed@yourclutch.com",
        department: "Logistics",
      },
      maintenance: {
        lastService: "2024-02-15",
        nextService: "2024-05-15",
        serviceInterval: 90,
        totalServices: 5,
        totalCost: 15000,
      },
      warranty: {
        startDate: "2023-01-15",
        endDate: "2026-01-15",
        provider: "Toyota Egypt",
        terms: "3 years or 100,000 km",
      },
      tags: ["delivery", "vehicle", "logistics"],
      images: ["van1.jpg", "van2.jpg"],
      documents: [
        {
          name: "Purchase Invoice",
          url: "/documents/van_invoice.pdf",
          type: "invoice",
        },
        {
          name: "Insurance Certificate",
          url: "/documents/van_insurance.pdf",
          type: "insurance",
        },
      ],
      createdAt: "2023-01-15T10:00:00Z",
      updatedAt: "2024-03-15T14:30:00Z",
    },
    {
      _id: "2",
      name: "MacBook Pro 16-inch",
      type: "it_hardware",
      category: "Laptop",
      description: "MacBook Pro 16-inch with M2 Max chip for development",
      serialNumber: "MBP001",
      model: "MacBook Pro 16-inch",
      manufacturer: "Apple",
      purchaseDate: "2023-06-01",
      purchasePrice: 85000,
      currentValue: 65000,
      status: "active",
      location: {
        building: "Office Building",
        floor: "3rd Floor",
        room: "Development Lab",
      },
      assignedTo: {
        id: "2",
        name: "Fatma Ali",
        email: "fatma@yourclutch.com",
        department: "Engineering",
      },
      maintenance: {
        lastService: "2024-01-10",
        nextService: "2024-07-10",
        serviceInterval: 180,
        totalServices: 2,
        totalCost: 5000,
      },
      warranty: {
        startDate: "2023-06-01",
        endDate: "2025-06-01",
        provider: "Apple Egypt",
        terms: "2 years limited warranty",
      },
      tags: ["laptop", "development", "macbook"],
      images: ["macbook1.jpg"],
      documents: [
        {
          name: "Purchase Receipt",
          url: "/documents/macbook_receipt.pdf",
          type: "receipt",
        },
      ],
      createdAt: "2023-06-01T09:00:00Z",
      updatedAt: "2024-03-10T16:45:00Z",
    },
    {
      _id: "3",
      name: "Office Desk - Ergonomic",
      type: "furniture",
      category: "Desk",
      description: "Adjustable height ergonomic office desk",
      serialNumber: "DESK001",
      model: "ErgoDesk Pro",
      manufacturer: "OfficeMax",
      purchaseDate: "2023-03-20",
      purchasePrice: 12000,
      currentValue: 10000,
      status: "active",
      location: {
        building: "Office Building",
        floor: "2nd Floor",
        room: "Conference Room B",
      },
      assignedTo: null,
      maintenance: {
        lastService: "2023-12-01",
        nextService: "2024-12-01",
        serviceInterval: 365,
        totalServices: 1,
        totalCost: 500,
      },
      warranty: {
        startDate: "2023-03-20",
        endDate: "2025-03-20",
        provider: "OfficeMax Egypt",
        terms: "2 years warranty on mechanism",
      },
      tags: ["furniture", "desk", "ergonomic"],
      images: ["desk1.jpg"],
      documents: [
        {
          name: "Warranty Certificate",
          url: "/documents/desk_warranty.pdf",
          type: "warranty",
        },
      ],
      createdAt: "2023-03-20T11:30:00Z",
      updatedAt: "2024-02-15T10:20:00Z",
    },
  ];

  const mockMaintenanceRecords: MaintenanceRecord[] = [
    {
      _id: "1",
      assetId: "1",
      assetName: "Delivery Van - Toyota Hiace",
      type: "routine",
      description: "Regular oil change and filter replacement",
      performedBy: {
        id: "3",
        name: "Mohamed Ibrahim",
      },
      cost: 2500,
      date: "2024-02-15",
      nextDueDate: "2024-05-15",
      status: "completed",
      notes: "All systems checked, vehicle in good condition",
      attachments: ["service_report.pdf"],
      createdAt: "2024-02-15T14:00:00Z",
    },
    {
      _id: "2",
      assetId: "2",
      assetName: "MacBook Pro 16-inch",
      type: "repair",
      description: "Keyboard replacement due to sticky keys",
      performedBy: {
        id: "4",
        name: "Nour El-Din",
      },
      cost: 3000,
      date: "2024-01-10",
      status: "completed",
      notes: "Keyboard replaced, all keys working properly",
      attachments: ["repair_invoice.pdf"],
      createdAt: "2024-01-10T10:30:00Z",
    },
  ];

  const mockAssignments: AssetAssignment[] = [
    {
      _id: "1",
      assetId: "1",
      assetName: "Delivery Van - Toyota Hiace",
      assignedTo: {
        id: "1",
        name: "Ahmed Hassan",
        email: "ahmed@yourclutch.com",
        department: "Logistics",
      },
      assignedBy: {
        id: "5",
        name: "Omar Khaled",
      },
      assignedDate: "2023-01-20",
      status: "active",
      notes: "Primary delivery vehicle for downtown area",
      createdAt: "2023-01-20T09:00:00Z",
    },
    {
      _id: "2",
      assetId: "2",
      assetName: "MacBook Pro 16-inch",
      assignedTo: {
        id: "2",
        name: "Fatma Ali",
        email: "fatma@yourclutch.com",
        department: "Engineering",
      },
      assignedBy: {
        id: "6",
        name: "Yasmin Mostafa",
      },
      assignedDate: "2023-06-05",
      status: "active",
      notes: "Development workstation for frontend team",
      createdAt: "2023-06-05T11:00:00Z",
    },
  ];

  useEffect(() => {
    loadAssets();
    loadMaintenanceRecords();
    loadAssignments();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await hybridApi.getAssets();
      setAssets(data || mockAssets);
    } catch (error) {
      console.error("Error loading assets:", error);
      setAssets(mockAssets);
    } finally {
      setLoading(false);
    }
  };

  const loadMaintenanceRecords = async () => {
    try {
      const data = await hybridApi.getMaintenanceRecords();
      setMaintenanceRecords(data || mockMaintenanceRecords);
    } catch (error) {
      console.error("Error loading maintenance records:", error);
      setMaintenanceRecords(mockMaintenanceRecords);
    }
  };

  const loadAssignments = async () => {
    try {
      const data = await hybridApi.getAssetAssignments();
      setAssignments(data || mockAssignments);
    } catch (error) {
      console.error("Error loading assignments:", error);
      setAssignments(mockAssignments);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "retired":
        return "bg-blue-100 text-blue-800";
      case "lost":
        return "bg-orange-100 text-orange-800";
      case "stolen":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "vehicle":
        return <Truck className="h-4 w-4" />;
      case "it_hardware":
        return <Monitor className="h-4 w-4" />;
      case "equipment":
        return <Wrench className="h-4 w-4" />;
      case "furniture":
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || asset.type === typeFilter;
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status === "active").length;
  const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const maintenanceDue = assets.filter(a => 
    new Date(a.maintenance.nextService) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Management</h1>
          <p className="text-muted-foreground">
            Track and manage company assets, maintenance, and assignments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowMaintenanceDialog(true)} variant="outline">
            <Wrench className="mr-2 h-4 w-4" />
            Schedule Maintenance
          </Button>
          <Button onClick={() => setShowAssignmentDialog(true)} variant="outline">
            <User className="mr-2 h-4 w-4" />
            Assign Asset
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              {activeAssets} active, {totalAssets - activeAssets} inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Current market value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceDue}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Assets</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assets.filter(a => a.assignedTo).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently assigned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assets */}
      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
          <CardDescription>
            Manage and track all company assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
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
                  Type: {typeFilter === "all" ? "All" : typeFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("vehicle")}>
                  Vehicle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("it_hardware")}>
                  IT Hardware
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("equipment")}>
                  Equipment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("furniture")}>
                  Furniture
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                  Inactive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("maintenance")}>
                  Maintenance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("retired")}>
                  Retired
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-4">
            {filteredAssets.map((asset) => (
              <Card key={asset._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getTypeIcon(asset.type)}
                        <h3 className="text-lg font-semibold">{asset.name}</h3>
                        <Badge className={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                        <Badge variant="outline">
                          {asset.type.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{asset.description}</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Serial: <code className="bg-gray-100 px-2 py-1 rounded">{asset.serialNumber}</code>
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Current Value</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(asset.currentValue)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">
                            {asset.location.building}, {asset.location.room}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Assigned To</p>
                          <p className="text-sm text-muted-foreground">
                            {asset.assignedTo ? asset.assignedTo.name : "Unassigned"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Next Service</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(asset.maintenance.nextService).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Purchased: {new Date(asset.purchaseDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{asset.location.floor}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Tag className="h-4 w-4" />
                          <span>{asset.tags.join(", ")}</span>
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
                        <DropdownMenuItem onClick={() => setSelectedAsset(asset)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Asset
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <History className="mr-2 h-4 w-4" />
                          Maintenance History
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          View Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Manage Assignment
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Asset
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

      {/* Recent Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Maintenance</CardTitle>
          <CardDescription>
            Latest maintenance activities and upcoming services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceRecords.slice(0, 5).map((record) => (
              <div key={record._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wrench className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{record.assetName}</p>
                    <p className="text-sm text-muted-foreground">{record.description}</p>
                    <p className="text-xs text-muted-foreground">
                      By {record.performedBy.name} • {new Date(record.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(record.cost)}</p>
                  <Badge className={record.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {record.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Asset Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogDescription>
              Register a new asset in the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Asset Name</Label>
                <Input id="name" placeholder="Enter asset name" />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="vehicle">Vehicle</option>
                  <option value="it_hardware">IT Hardware</option>
                  <option value="equipment">Equipment</option>
                  <option value="furniture">Furniture</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Asset description" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input id="serialNumber" placeholder="Serial number" />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input id="model" placeholder="Model" />
              </div>
              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input id="manufacturer" placeholder="Manufacturer" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input id="purchaseDate" type="date" />
              </div>
              <div>
                <Label htmlFor="purchasePrice">Purchase Price (EGP)</Label>
                <Input id="purchasePrice" type="number" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="currentValue">Current Value (EGP)</Label>
                <Input id="currentValue" type="number" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="building">Building</Label>
                <Input id="building" placeholder="Building name" />
              </div>
              <div>
                <Label htmlFor="room">Room</Label>
                <Input id="room" placeholder="Room number" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateDialog(false)}>
              Add Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Maintenance Dialog */}
      <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
            <DialogDescription>
              Schedule maintenance for an asset.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="asset">Asset</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="">Select asset</option>
                {assets.map((asset) => (
                  <option key={asset._id} value={asset._id}>
                    {asset.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="maintenanceType">Maintenance Type</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="routine">Routine</option>
                <option value="repair">Repair</option>
                <option value="inspection">Inspection</option>
                <option value="upgrade">Upgrade</option>
              </select>
            </div>
            <div>
              <Label htmlFor="maintenanceDescription">Description</Label>
              <Input id="maintenanceDescription" placeholder="Describe the maintenance work" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maintenanceDate">Date</Label>
                <Input id="maintenanceDate" type="date" />
              </div>
              <div>
                <Label htmlFor="maintenanceCost">Estimated Cost (EGP)</Label>
                <Input id="maintenanceCost" type="number" placeholder="0" />
              </div>
            </div>
            <div>
              <Label htmlFor="maintenanceNotes">Notes</Label>
              <Input id="maintenanceNotes" placeholder="Additional notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMaintenanceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowMaintenanceDialog(false)}>
              Schedule Maintenance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Asset Dialog */}
      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Asset</DialogTitle>
            <DialogDescription>
              Assign an asset to an employee.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="assignAsset">Asset</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="">Select asset</option>
                {assets.filter(a => !a.assignedTo).map((asset) => (
                  <option key={asset._id} value={asset._id}>
                    {asset.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="assignTo">Assign To</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="">Select employee</option>
                <option value="1">Ahmed Hassan - Logistics</option>
                <option value="2">Fatma Ali - Engineering</option>
                <option value="3">Mohamed Ibrahim - Operations</option>
                <option value="4">Nour El-Din - Development</option>
              </select>
            </div>
            <div>
              <Label htmlFor="assignDate">Assignment Date</Label>
              <Input id="assignDate" type="date" />
            </div>
            <div>
              <Label htmlFor="assignNotes">Notes</Label>
              <Input id="assignNotes" placeholder="Assignment notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAssignmentDialog(false)}>
              Assign Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
