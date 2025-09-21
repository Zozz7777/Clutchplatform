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
import { productionApi } from "@/lib/production-api";
import { useTranslations } from "@/hooks/use-translations";
import { handleError, handleWarning, handleDataLoadError } from "@/lib/error-handler";

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
  const { t } = useTranslations();
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
  
  // Form data states
  const [createAssetData, setCreateAssetData] = useState({
    name: "",
    type: "vehicle",
    category: "",
    description: "",
    serialNumber: "",
    model: "",
    manufacturer: "",
    purchaseDate: "",
    purchasePrice: "",
    currentValue: "",
    building: "",
    floor: "",
    room: ""
  });
  
  const [createMaintenanceData, setCreateMaintenanceData] = useState({
    assetId: "",
    type: "routine",
    description: "",
    date: "",
    cost: "",
    notes: ""
  });
  
  const [createAssignmentData, setCreateAssignmentData] = useState({
    assetId: "",
    assignedTo: "",
    assignedDate: "",
    notes: ""
  });


  useEffect(() => {
    const loadAllAssetsData = async () => {
      try {
        setLoading(true);
        
        // Load all assets data with proper error handling
        const [assetsData, maintenanceData, assignmentsData] = await Promise.allSettled([
          productionApi.getAssets(),
          productionApi.getMaintenanceRecords(),
          productionApi.getAssetAssignments()
        ]);

        // Handle assets data
        if (assetsData.status === 'fulfilled') {
          const assets = assetsData.value || [];
          setAssets(Array.isArray(assets) ? assets as unknown as Asset[] : []);
        } else {
          handleWarning(`Failed to load assets: ${assetsData.reason}`, { component: 'AssetsPage' });
          setAssets([]);
        }

        // Handle maintenance records data
        if (maintenanceData.status === 'fulfilled') {
          const maintenance = maintenanceData.value || [];
          setMaintenanceRecords(Array.isArray(maintenance) ? maintenance as unknown as MaintenanceRecord[] : []);
        } else {
          handleWarning(`Failed to load maintenance records: ${maintenanceData.reason}`, { component: 'AssetsPage' });
          setMaintenanceRecords([]);
        }

        // Handle assignments data
        if (assignmentsData.status === 'fulfilled') {
          const assignments = assignmentsData.value || [];
          setAssignments(Array.isArray(assignments) ? assignments as unknown as AssetAssignment[] : []);
        } else {
          handleWarning(`Failed to load asset assignments: ${assignmentsData.reason}`, { component: 'AssetsPage' });
          setAssignments([]);
        }
        
      } catch (error) {
        handleDataLoadError(error, 'assets_data');
        setAssets([]);
        setMaintenanceRecords([]);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAllAssetsData();
  }, []);
  
  const createAsset = async () => {
    try {
      const assetData = {
        name: createAssetData.name,
        type: createAssetData.type,
        category: createAssetData.category,
        description: createAssetData.description,
        serialNumber: createAssetData.serialNumber,
        model: createAssetData.model,
        manufacturer: createAssetData.manufacturer,
        purchaseDate: createAssetData.purchaseDate,
        purchasePrice: parseFloat(createAssetData.purchasePrice) || 0,
        currentValue: parseFloat(createAssetData.currentValue) || 0,
        status: "active",
        location: {
          building: createAssetData.building,
          floor: createAssetData.floor,
          room: createAssetData.room
        },
        assignedTo: null,
        maintenance: {
          lastService: "",
          nextService: "",
          serviceInterval: 0,
          totalServices: 0,
          totalCost: 0
        },
        warranty: {
          startDate: "",
          endDate: "",
          provider: "",
          terms: ""
        },
        tags: [],
        images: [],
        documents: []
      };
      
      const newAsset = await productionApi.createAsset(assetData);
      if (newAsset) {
        setAssets(prev => [...prev, newAsset as unknown as Asset]);
        setShowCreateDialog(false);
        setCreateAssetData({
          name: "",
          type: "vehicle",
          category: "",
          description: "",
          serialNumber: "",
          model: "",
          manufacturer: "",
          purchaseDate: "",
          purchasePrice: "",
          currentValue: "",
          building: "",
          floor: "",
          room: ""
        });
      }
    } catch (error) {
      // Error handled by API service
    }
  };
  
  const createMaintenanceRecord = async () => {
    try {
      const maintenanceData = {
        assetId: createMaintenanceData.assetId,
        type: createMaintenanceData.type,
        description: createMaintenanceData.description,
        performedBy: {
          id: "current-user",
          name: t('assets.currentUser')
        },
        cost: parseFloat(createMaintenanceData.cost) || 0,
        date: createMaintenanceData.date,
        status: "scheduled",
        notes: createMaintenanceData.notes,
        attachments: []
      };
      
      const newRecord = await productionApi.createMaintenanceRecord(maintenanceData);
      if (newRecord) {
        setMaintenanceRecords(prev => [...prev, newRecord as unknown as MaintenanceRecord]);
        setShowMaintenanceDialog(false);
        setCreateMaintenanceData({
          assetId: "",
          type: "routine",
          description: "",
          date: "",
          cost: "",
          notes: ""
        });
      }
    } catch (error) {
      // Error handled by API service
    }
  };
  
  const createAssetAssignment = async () => {
    try {
      const assignmentData = {
        assetId: createAssignmentData.assetId,
        assignedTo: {
          id: createAssignmentData.assignedTo,
          name: t('assets.selectedEmployee'),
          email: "employee@example.com",
          department: "Department"
        },
        assignedBy: {
          id: "current-user",
          name: t('assets.currentUser')
        },
        assignedDate: createAssignmentData.assignedDate,
        status: "active",
        notes: createAssignmentData.notes
      };
      
      const newAssignment = await productionApi.createAssetAssignment(assignmentData);
      if (newAssignment) {
        setAssignments(prev => [...prev, newAssignment as unknown as AssetAssignment]);
        setShowAssignmentDialog(false);
        setCreateAssignmentData({
          assetId: "",
          assignedTo: "",
          assignedDate: "",
          notes: ""
        });
      }
    } catch (error) {
      // Error handled by API service
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary-foreground";
      case "inactive":
        return "bg-muted text-muted-foreground";
      case "maintenance":
        return "bg-secondary/10 text-secondary-foreground";
      case "retired":
        return "bg-secondary/10 text-secondary-foreground";
      case "lost":
        return "bg-secondary/10 text-secondary-foreground";
      case "stolen":
        return "bg-destructive/10 text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
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

  const assetsArray = Array.isArray(assets) ? assets : [];
  const filteredAssets = assetsArray.filter((asset) => {
    const matchesSearch = asset?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset?.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || asset?.type === typeFilter;
    const matchesStatus = statusFilter === "all" || asset?.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalAssets = assetsArray.length;
  const activeAssets = assetsArray.filter(a => a?.status === "active").length;
  const totalValue = assetsArray.reduce((sum, a) => sum + (a?.currentValue || 0), 0);
  const maintenanceDue = assetsArray.filter(a => 
    a?.maintenance?.nextService && new Date(a.maintenance.nextService) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.assetManagement')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.trackAndManageAssets')}
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
            {t('dashboard.addAsset')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('assets.totalAssets')}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              {activeAssets} {t('assets.active')}, {totalAssets - activeAssets} {t('assets.inactive')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalValue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
{t('dashboard.currentMarketValue')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('assets.maintenanceDue')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceDue}</div>
            <p className="text-xs text-muted-foreground">
{t('assets.next30Days')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('assets.assignedAssets')}</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assetsArray.filter(a => a?.assignedTo).length}
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
          <CardTitle>{t('assets.title')}</CardTitle>
          <CardDescription>
            {t('assets.description')}
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
                  Status: {statusFilter === "all" ? t('dashboard.all') : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  {t('dashboard.allStatus')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                  {t('dashboard.active')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                  {t('dashboard.inactive')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("maintenance")}>
                  {t('dashboard.maintenance')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("retired")}>
                  {t('dashboard.retired')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-4">
            {filteredAssets.map((asset) => (
              <Card key={asset._id} className="hover:shadow-sm transition-shadow">
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
                        Serial: <code className="bg-muted px-2 py-1 rounded">{asset.serialNumber}</code>
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">{t('dashboard.currentValue')}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(asset.currentValue)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t('dashboard.location')}</p>
                          <p className="text-sm text-muted-foreground">
                            {asset.location.building}, {asset.location.room}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Assigned To</p>
                          <p className="text-sm text-muted-foreground">
                            {asset.assignedTo ? asset.assignedTo.name : t('assets.unassigned')}
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
                        <DropdownMenuItem className="text-destructive">
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
            {Array.isArray(maintenanceRecords) ? maintenanceRecords.slice(0, 5).map((record) => (
              <div key={record._id} className="flex items-center justify-between p-4 border rounded-[0.625rem]">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-[0.625rem]">
                    <Wrench className="h-4 w-4 text-primary" />
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
                  <Badge className={record.status === "completed" ? "bg-primary/10 text-primary-foreground" : "bg-secondary/10 text-secondary-foreground"}>
                    {record.status}
                  </Badge>
                </div>
              </div>
            )) : null}
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
                <Input 
                  id="name" 
                  placeholder={t('assets.searchAssets')} 
                  value={createAssetData.name}
                  onChange={(e) => setCreateAssetData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={createAssetData.type}
                  onChange={(e) => setCreateAssetData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="vehicle">Vehicle</option>
                  <option value="it_hardware">IT Hardware</option>
                  <option value="equipment">Equipment</option>
                  <option value="furniture">Furniture</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input 
                id="category" 
                placeholder={t('assets.filterByType')} 
                value={createAssetData.category}
                onChange={(e) => setCreateAssetData(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                placeholder="Asset description" 
                value={createAssetData.description}
                onChange={(e) => setCreateAssetData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input 
                  id="serialNumber" 
                  placeholder="Serial number" 
                  value={createAssetData.serialNumber}
                  onChange={(e) => setCreateAssetData(prev => ({ ...prev, serialNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input 
                  id="model" 
                  placeholder="Model" 
                  value={createAssetData.model}
                  onChange={(e) => setCreateAssetData(prev => ({ ...prev, model: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input 
                  id="manufacturer" 
                  placeholder="Manufacturer" 
                  value={createAssetData.manufacturer}
                  onChange={(e) => setCreateAssetData(prev => ({ ...prev, manufacturer: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="purchaseDate">{t('dashboard.purchaseDate')}</Label>
                <Input 
                  id="purchaseDate" 
                  type="date" 
                  value={createAssetData.purchaseDate}
                  onChange={(e) => setCreateAssetData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="purchasePrice">Purchase Price (EGP)</Label>
                <Input 
                  id="purchasePrice" 
                  type="number" 
                  placeholder="0" 
                  value={createAssetData.purchasePrice}
                  onChange={(e) => setCreateAssetData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="currentValue">{t('dashboard.currentValueEgp')}</Label>
                <Input 
                  id="currentValue" 
                  type="number" 
                  placeholder="0" 
                  value={createAssetData.currentValue}
                  onChange={(e) => setCreateAssetData(prev => ({ ...prev, currentValue: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="building">Building</Label>
                <Input 
                  id="building" 
                  placeholder="Building name" 
                  value={createAssetData.building}
                  onChange={(e) => setCreateAssetData(prev => ({ ...prev, building: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="floor">Floor</Label>
                <Input 
                  id="floor" 
                  placeholder="Floor" 
                  value={createAssetData.floor}
                  onChange={(e) => setCreateAssetData(prev => ({ ...prev, floor: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="room">Room</Label>
                <Input 
                  id="room" 
                  placeholder="Room number" 
                  value={createAssetData.room}
                  onChange={(e) => setCreateAssetData(prev => ({ ...prev, room: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createAsset}>
              {t('dashboard.addAsset')}
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
              <select 
                className="w-full p-2 border rounded-md"
                value={createMaintenanceData.assetId}
                onChange={(e) => setCreateMaintenanceData(prev => ({ ...prev, assetId: e.target.value }))}
              >
                <option value="">Select asset</option>
                {Array.isArray(assets) ? assets.map((asset) => (
                  <option key={asset?._id} value={asset?._id}>
                    {asset?.name}
                  </option>
                )) : null}
              </select>
            </div>
            <div>
              <Label htmlFor="maintenanceType">Maintenance Type</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={createMaintenanceData.type}
                onChange={(e) => setCreateMaintenanceData(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="routine">Routine</option>
                <option value="repair">Repair</option>
                <option value="inspection">Inspection</option>
                <option value="upgrade">Upgrade</option>
              </select>
            </div>
            <div>
              <Label htmlFor="maintenanceDescription">Description</Label>
              <Input 
                id="maintenanceDescription" 
                placeholder="Describe the maintenance work" 
                value={createMaintenanceData.description}
                onChange={(e) => setCreateMaintenanceData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maintenanceDate">Date</Label>
                <Input 
                  id="maintenanceDate" 
                  type="date" 
                  value={createMaintenanceData.date}
                  onChange={(e) => setCreateMaintenanceData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="maintenanceCost">Estimated Cost (EGP)</Label>
                <Input 
                  id="maintenanceCost" 
                  type="number" 
                  placeholder="0" 
                  value={createMaintenanceData.cost}
                  onChange={(e) => setCreateMaintenanceData(prev => ({ ...prev, cost: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="maintenanceNotes">Notes</Label>
              <Input 
                id="maintenanceNotes" 
                placeholder="Additional notes" 
                value={createMaintenanceData.notes}
                onChange={(e) => setCreateMaintenanceData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMaintenanceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createMaintenanceRecord}>
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
              <select 
                className="w-full p-2 border rounded-md"
                value={createAssignmentData.assetId}
                onChange={(e) => setCreateAssignmentData(prev => ({ ...prev, assetId: e.target.value }))}
              >
                <option value="">Select asset</option>
                {Array.isArray(assets) ? assets.filter(a => !a?.assignedTo).map((asset) => (
                  <option key={asset?._id} value={asset?._id}>
                    {asset?.name}
                  </option>
                )) : null}
              </select>
            </div>
            <div>
              <Label htmlFor="assignTo">Assign To</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={createAssignmentData.assignedTo}
                onChange={(e) => setCreateAssignmentData(prev => ({ ...prev, assignedTo: e.target.value }))}
              >
                <option value="">Select employee</option>
                <option value="1">Ahmed Hassan - Logistics</option>
                <option value="2">Fatma Ali - Engineering</option>
                <option value="3">Mohamed Ibrahim - Operations</option>
                <option value="4">Nour El-Din - Development</option>
              </select>
            </div>
            <div>
              <Label htmlFor="assignDate">Assignment Date</Label>
              <Input 
                id="assignDate" 
                type="date" 
                value={createAssignmentData.assignedDate}
                onChange={(e) => setCreateAssignmentData(prev => ({ ...prev, assignedDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="assignNotes">Notes</Label>
              <Input 
                id="assignNotes" 
                placeholder="Assignment notes" 
                value={createAssignmentData.notes}
                onChange={(e) => setCreateAssignmentData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createAssetAssignment}>
              Assign Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


