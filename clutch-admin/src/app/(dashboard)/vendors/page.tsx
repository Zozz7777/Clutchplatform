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
  Building2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Settings,
  User,
  Award,
  Handshake,
  Package,
  Wrench,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { productionApi } from "@/lib/production-api";
import { useLanguage } from "@/contexts/language-context";

interface Vendor {
  _id: string;
  name: string;
  type: "supplier" | "service_provider" | "contractor" | "consultant" | "other";
  category: string;
  description: string;
  contact: {
    primary: {
      name: string;
      email: string;
      phone: string;
      title: string;
    };
    secondary?: {
      name: string;
      email: string;
      phone: string;
      title: string;
    };
  };
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  business: {
    registrationNumber: string;
    taxId: string;
    website: string;
    establishedYear: number;
    employeeCount: number;
    annualRevenue: number;
  };
  status: "active" | "inactive" | "suspended" | "pending_approval" | "blacklisted";
  rating: {
    overall: number;
    quality: number;
    delivery: number;
    communication: number;
    pricing: number;
    totalReviews: number;
  };
  contracts: {
    total: number;
    active: number;
    totalValue: number;
    averageValue: number;
  };
  performance: {
    onTimeDelivery: number;
    qualityScore: number;
    responseTime: number; // hours
    lastInteraction: string;
  };
  certifications: {
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    status: "valid" | "expired" | "pending";
  }[];
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Contract {
  _id: string;
  vendorId: string;
  vendorName: string;
  title: string;
  description: string;
  type: "service" | "supply" | "consulting" | "maintenance" | "other";
  status: "draft" | "active" | "expired" | "terminated" | "renewed";
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  renewalDate?: string;
  terms: {
    paymentTerms: string;
    deliveryTerms: string;
    warranty: string;
    termination: string;
  };
  deliverables: {
    description: string;
    dueDate: string;
    status: "pending" | "in_progress" | "completed" | "overdue";
  }[];
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Communication {
  _id: string;
  vendorId: string;
  vendorName: string;
  type: "email" | "phone" | "meeting" | "document" | "other";
  subject: string;
  content: string;
  direction: "inbound" | "outbound";
  participants: {
    id: string;
    name: string;
    email: string;
  }[];
  attachments: {
    name: string;
    url: string;
    type: string;
  }[];
  date: string;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function VendorManagementPage() {
  const { t } = useLanguage();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  
  // Form data states
  const [createVendorData, setCreateVendorData] = useState({
    name: "",
    type: "supplier",
    category: "",
    description: "",
    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
    primaryContactTitle: "",
    street: "",
    city: "",
    state: "",
    country: "Egypt",
    zipCode: "",
    registrationNumber: "",
    taxId: "",
    website: "",
    establishedYear: "",
    employeeCount: "",
    annualRevenue: "",
    notes: ""
  });
  
  const [createContractData, setCreateContractData] = useState({
    vendorId: "",
    title: "",
    description: "",
    type: "service",
    value: "",
    currency: "EGP",
    startDate: "",
    endDate: "",
    paymentTerms: "",
    deliveryTerms: "",
    warranty: "",
    termination: ""
  });
  
  const [createCommunicationData, setCreateCommunicationData] = useState({
    vendorId: "",
    type: "email",
    subject: "",
    content: "",
    direction: "outbound",
    date: ""
  });


  useEffect(() => {
    loadVendors();
    loadContracts();
    loadCommunications();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await productionApi.getVendors();
      setVendors(data || []);
    } catch (error) {
      // Error handled by API service
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const loadContracts = async () => {
    try {
      const data = await productionApi.getVendorContracts();
      setContracts(data || []);
    } catch (error) {
      // Error handled by API service
      setContracts([]);
    }
  };

  const loadCommunications = async () => {
    try {
      const data = await productionApi.getVendorCommunications();
      setCommunications(data || []);
    } catch (error) {
      // Error handled by API service
      setCommunications([]);
    }
  };
  
  const createVendor = async () => {
    try {
      const vendorData = {
        name: createVendorData.name,
        type: createVendorData.type,
        category: createVendorData.category,
        description: createVendorData.description,
        contact: {
          primary: {
            name: createVendorData.primaryContactName,
            email: createVendorData.primaryContactEmail,
            phone: createVendorData.primaryContactPhone,
            title: createVendorData.primaryContactTitle
          }
        },
        address: {
          street: createVendorData.street,
          city: createVendorData.city,
          state: createVendorData.state,
          country: createVendorData.country,
          zipCode: createVendorData.zipCode
        },
        business: {
          registrationNumber: createVendorData.registrationNumber,
          taxId: createVendorData.taxId,
          website: createVendorData.website,
          establishedYear: parseInt(createVendorData.establishedYear) || 0,
          employeeCount: parseInt(createVendorData.employeeCount) || 0,
          annualRevenue: parseFloat(createVendorData.annualRevenue) || 0
        },
        status: "pending_approval",
        rating: {
          overall: 0,
          quality: 0,
          delivery: 0,
          communication: 0,
          pricing: 0,
          totalReviews: 0
        },
        contracts: {
          total: 0,
          active: 0,
          totalValue: 0,
          averageValue: 0
        },
        performance: {
          onTimeDelivery: 0,
          qualityScore: 0,
          responseTime: 0,
          lastInteraction: new Date().toISOString()
        },
        certifications: [],
        tags: [],
        notes: createVendorData.notes
      };
      
      const newVendor = await productionApi.createVendor(vendorData);
      if (newVendor) {
        setVendors(prev => [...prev, newVendor]);
        setShowCreateDialog(false);
        setCreateVendorData({
          name: "",
          type: "supplier",
          category: "",
          description: "",
          primaryContactName: "",
          primaryContactEmail: "",
          primaryContactPhone: "",
          primaryContactTitle: "",
          street: "",
          city: "",
          state: "",
          country: "Egypt",
          zipCode: "",
          registrationNumber: "",
          taxId: "",
          website: "",
          establishedYear: "",
          employeeCount: "",
          annualRevenue: "",
          notes: ""
        });
      }
    } catch (error) {
      // Error handled by API service
    }
  };
  
  const createContract = async () => {
    try {
      const contractData = {
        vendorId: createContractData.vendorId,
        title: createContractData.title,
        description: createContractData.description,
        type: createContractData.type,
        status: "draft",
        value: parseFloat(createContractData.value) || 0,
        currency: createContractData.currency,
        startDate: createContractData.startDate,
        endDate: createContractData.endDate,
        terms: {
          paymentTerms: createContractData.paymentTerms,
          deliveryTerms: createContractData.deliveryTerms,
          warranty: createContractData.warranty,
          termination: createContractData.termination
        },
        deliverables: [],
        createdBy: {
          id: "current-user",
          name: "Current User"
        }
      };
      
      const newContract = await productionApi.createVendorContract(contractData);
      if (newContract) {
        setContracts(prev => [...prev, newContract]);
        setShowContractDialog(false);
        setCreateContractData({
          vendorId: "",
          title: "",
          description: "",
          type: "service",
          value: "",
          currency: "EGP",
          startDate: "",
          endDate: "",
          paymentTerms: "",
          deliveryTerms: "",
          warranty: "",
          termination: ""
        });
      }
    } catch (error) {
      // Error handled by API service
    }
  };
  
  const createCommunication = async () => {
    try {
      const communicationData = {
        vendorId: createCommunicationData.vendorId,
        type: createCommunicationData.type,
        subject: createCommunicationData.subject,
        content: createCommunicationData.content,
        direction: createCommunicationData.direction,
        participants: [],
        attachments: [],
        date: createCommunicationData.date,
        createdBy: {
          id: "current-user",
          name: "Current User"
        }
      };
      
      const newCommunication = await productionApi.createVendorCommunication(communicationData);
      if (newCommunication) {
        setCommunications(prev => [...prev, newCommunication]);
        setShowCommunicationDialog(false);
        setCreateCommunicationData({
          vendorId: "",
          type: "email",
          subject: "",
          content: "",
          direction: "outbound",
          date: ""
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
      case "suspended":
        return "bg-secondary/10 text-secondary-foreground";
      case "pending_approval":
        return "bg-secondary/10 text-secondary-foreground";
      case "blacklisted":
        return "bg-destructive/10 text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "supplier":
        return <Package className="h-4 w-4" />;
      case "service_provider":
        return <Settings className="h-4 w-4" />;
      case "contractor":
        return <Wrench className="h-4 w-4" />;
      case "consultant":
        return <User className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contact.primary.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || vendor.type === typeFilter;
    const matchesStatus = statusFilter === "all" || vendor.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.status === "active").length;
  const totalContractValue = vendors.reduce((sum, v) => sum + v.contracts.totalValue, 0);
  const averageRating = vendors.reduce((sum, v) => sum + v.rating.overall, 0) / vendors.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t('vendorManagement.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('vendorManagement.title')}</h1>
          <p className="text-muted-foreground">
            {t('vendorManagement.description')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowCommunicationDialog(true)} variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            {t('vendorManagement.logCommunication')}
          </Button>
          <Button onClick={() => setShowContractDialog(true)} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            {t('vendorManagement.newContract')}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('vendorManagement.addVendor')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('vendorManagement.totalVendors')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendors}</div>
            <p className="text-xs text-muted-foreground">
              {activeVendors} {t('vendorManagement.active')}, {totalVendors - activeVendors} {t('vendorManagement.inactive')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('vendorManagement.totalContractValue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalContractValue)}</div>
            <p className="text-xs text-muted-foreground">
              {t('vendorManagement.acrossAllContracts')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('vendorManagement.averageRating')}</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {t('vendorManagement.outOf5Stars')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('vendorManagement.activeContracts')}</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendors.reduce((sum, v) => sum + v.contracts.active, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('vendorManagement.currentlyActive')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vendors */}
      <Card>
        <CardHeader>
          <CardTitle>{t('vendors')}</CardTitle>
          <CardDescription>
            {t('vendorManagement.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('vendorManagement.searchPlaceholder')}
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
                  {t('vendorManagement.typeFilter')}: {typeFilter === "all" ? t('vendorManagement.all') : typeFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("supplier")}>
                  Supplier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("service_provider")}>
                  Service Provider
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("contractor")}>
                  Contractor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("consultant")}>
                  Consultant
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
                <DropdownMenuItem onClick={() => setStatusFilter("suspended")}>
                  Suspended
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending_approval")}>
                  Pending Approval
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-4">
            {filteredVendors.map((vendor) => (
              <Card key={vendor._id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getTypeIcon(vendor.type)}
                        <h3 className="text-lg font-semibold">{vendor.name}</h3>
                        <Badge className={getStatusColor(vendor.status)}>
                          {vendor.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline">
                          {vendor.type.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{vendor.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Rating</p>
                          <div className="flex items-center space-x-1">
                            {renderStars(vendor.rating.overall)}
                            <span className="text-sm text-muted-foreground">
                              ({vendor.rating.totalReviews})
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Active Contracts</p>
                          <p className="text-sm text-muted-foreground">
                            {vendor.contracts.active} / {vendor.contracts.total}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Value</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(vendor.contracts.totalValue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">On-Time Delivery</p>
                          <p className="text-sm text-muted-foreground">
                            {vendor.performance.onTimeDelivery}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{vendor.contact.primary.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{vendor.contact.primary.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{vendor.address.city}, {vendor.address.country}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Est. {vendor.business.establishedYear}</span>
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
                        <DropdownMenuItem onClick={() => setSelectedVendor(vendor)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Vendor
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          View Contracts
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Communication History
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Performance Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Award className="mr-2 h-4 w-4" />
                          Rate Vendor
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Vendor
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

      {/* Recent Contracts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Contracts</CardTitle>
          <CardDescription>
            Latest contract activities and status updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contracts.slice(0, 5).map((contract) => (
              <div key={contract._id} className="flex items-center justify-between p-4 border rounded-[0.625rem]">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-[0.625rem]">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{contract.title}</p>
                    <p className="text-sm text-muted-foreground">{contract.vendorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {contract.type} • {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(contract.value)}</p>
                  <Badge className={contract.status === "active" ? "bg-primary/10 text-primary-foreground" : "bg-muted text-muted-foreground"}>
                    {contract.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Vendor Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
            <DialogDescription>
              Register a new vendor in the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vendorName">Vendor Name</Label>
                <Input 
                  id="vendorName" 
                  placeholder="Enter vendor name" 
                  value={createVendorData.name}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="vendorType">Type</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={createVendorData.type}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="supplier">Supplier</option>
                  <option value="service_provider">Service Provider</option>
                  <option value="contractor">Contractor</option>
                  <option value="consultant">Consultant</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="vendorCategory">Category</Label>
              <Input 
                id="vendorCategory" 
                placeholder="Vendor category" 
                value={createVendorData.category}
                onChange={(e) => setCreateVendorData(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="vendorDescription">Description</Label>
              <Input 
                id="vendorDescription" 
                placeholder="Vendor description" 
                value={createVendorData.description}
                onChange={(e) => setCreateVendorData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Primary Contact Name</Label>
                <Input 
                  id="contactName" 
                  placeholder="Contact name" 
                  value={createVendorData.primaryContactName}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, primaryContactName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Email</Label>
                <Input 
                  id="contactEmail" 
                  type="email" 
                  placeholder="contact@vendor.com" 
                  value={createVendorData.primaryContactEmail}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, primaryContactEmail: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPhone">Phone</Label>
                <Input 
                  id="contactPhone" 
                  placeholder="+20 10 1234 5678" 
                  value={createVendorData.primaryContactPhone}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, primaryContactPhone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="contactTitle">Title</Label>
                <Input 
                  id="contactTitle" 
                  placeholder="Job title" 
                  value={createVendorData.primaryContactTitle}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, primaryContactTitle: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="street">Street</Label>
                <Input 
                  id="street" 
                  placeholder="Street address" 
                  value={createVendorData.street}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, street: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  placeholder="City" 
                  value={createVendorData.city}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input 
                  id="state" 
                  placeholder="State" 
                  value={createVendorData.state}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  placeholder="Country" 
                  value={createVendorData.country}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input 
                  id="zipCode" 
                  placeholder="Zip code" 
                  value={createVendorData.zipCode}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, zipCode: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  placeholder="https://vendor.com" 
                  value={createVendorData.website}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input 
                  id="registrationNumber" 
                  placeholder="Registration number" 
                  value={createVendorData.registrationNumber}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="taxId">Tax ID</Label>
                <Input 
                  id="taxId" 
                  placeholder="Tax identification number" 
                  value={createVendorData.taxId}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, taxId: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="establishedYear">Established Year</Label>
                <Input 
                  id="establishedYear" 
                  type="number" 
                  placeholder="2020" 
                  value={createVendorData.establishedYear}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, establishedYear: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeCount">Employee Count</Label>
                <Input 
                  id="employeeCount" 
                  type="number" 
                  placeholder="50" 
                  value={createVendorData.employeeCount}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, employeeCount: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="annualRevenue">Annual Revenue (EGP)</Label>
                <Input 
                  id="annualRevenue" 
                  type="number" 
                  placeholder="1000000" 
                  value={createVendorData.annualRevenue}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, annualRevenue: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input 
                id="notes" 
                placeholder="Additional notes" 
                value={createVendorData.notes}
                onChange={(e) => setCreateVendorData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createVendor}>
              Add Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Contract Dialog */}
      <Dialog open={showContractDialog} onOpenChange={setShowContractDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Contract</DialogTitle>
            <DialogDescription>
              Create a new contract with a vendor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="contractVendor">Vendor</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={createContractData.vendorId}
                onChange={(e) => setCreateContractData(prev => ({ ...prev, vendorId: e.target.value }))}
              >
                <option value="">Select vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="contractTitle">Contract Title</Label>
              <Input 
                id="contractTitle" 
                placeholder="Enter contract title" 
                value={createContractData.title}
                onChange={(e) => setCreateContractData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="contractDescription">Description</Label>
              <Input 
                id="contractDescription" 
                placeholder="Contract description" 
                value={createContractData.description}
                onChange={(e) => setCreateContractData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contractType">Type</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={createContractData.type}
                  onChange={(e) => setCreateContractData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="service">Service</option>
                  <option value="supply">Supply</option>
                  <option value="consulting">Consulting</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="contractValue">Value (EGP)</Label>
                <Input 
                  id="contractValue" 
                  type="number" 
                  placeholder="0" 
                  value={createContractData.value}
                  onChange={(e) => setCreateContractData(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contractStart">Start Date</Label>
                <Input 
                  id="contractStart" 
                  type="date" 
                  value={createContractData.startDate}
                  onChange={(e) => setCreateContractData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="contractEnd">End Date</Label>
                <Input 
                  id="contractEnd" 
                  type="date" 
                  value={createContractData.endDate}
                  onChange={(e) => setCreateContractData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input 
                  id="paymentTerms" 
                  placeholder="Payment terms" 
                  value={createContractData.paymentTerms}
                  onChange={(e) => setCreateContractData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="deliveryTerms">Delivery Terms</Label>
                <Input 
                  id="deliveryTerms" 
                  placeholder="Delivery terms" 
                  value={createContractData.deliveryTerms}
                  onChange={(e) => setCreateContractData(prev => ({ ...prev, deliveryTerms: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warranty">Warranty</Label>
                <Input 
                  id="warranty" 
                  placeholder="Warranty terms" 
                  value={createContractData.warranty}
                  onChange={(e) => setCreateContractData(prev => ({ ...prev, warranty: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="termination">Termination</Label>
                <Input 
                  id="termination" 
                  placeholder="Termination terms" 
                  value={createContractData.termination}
                  onChange={(e) => setCreateContractData(prev => ({ ...prev, termination: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContractDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createContract}>
              Create Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Communication Dialog */}
      <Dialog open={showCommunicationDialog} onOpenChange={setShowCommunicationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Communication</DialogTitle>
            <DialogDescription>
              Record communication with a vendor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="commVendor">Vendor</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={createCommunicationData.vendorId}
                onChange={(e) => setCreateCommunicationData(prev => ({ ...prev, vendorId: e.target.value }))}
              >
                <option value="">Select vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="commType">Type</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={createCommunicationData.type}
                onChange={(e) => setCreateCommunicationData(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="meeting">Meeting</option>
                <option value="document">Document</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="commSubject">Subject</Label>
              <Input 
                id="commSubject" 
                placeholder="Communication subject" 
                value={createCommunicationData.subject}
                onChange={(e) => setCreateCommunicationData(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="commContent">Content</Label>
              <Input 
                id="commContent" 
                placeholder="Communication details" 
                value={createCommunicationData.content}
                onChange={(e) => setCreateCommunicationData(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="commDate">Date</Label>
              <Input 
                id="commDate" 
                type="datetime-local" 
                value={createCommunicationData.date}
                onChange={(e) => setCreateCommunicationData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommunicationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createCommunication}>
              Log Communication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



