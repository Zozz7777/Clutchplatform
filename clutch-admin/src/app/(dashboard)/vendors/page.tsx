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
  const { t, language } = useLanguage();
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

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case "active":
        return t('vendorManagement.active');
      case "inactive":
        return t('vendorManagement.inactive');
      case "suspended":
        return t('vendorManagement.suspended');
      case "pending_approval":
        return t('vendorManagement.pendingApproval');
      case "blacklisted":
        return t('vendorManagement.blacklisted');
      default:
        return status;
    }
  };

  const getTypeTranslation = (type: string) => {
    switch (type) {
      case "supplier":
        return t('vendorManagement.supplier');
      case "service_provider":
        return t('vendorManagement.serviceProvider');
      case "contractor":
        return t('vendorManagement.contractor');
      case "consultant":
        return t('vendorManagement.consultant');
      case "other":
        return t('vendorManagement.other');
      default:
        return type;
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
          i < Math.floor(rating) ? "text-warning fill-current" : "text-gray-300"
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
            <div className="text-2xl font-bold">{formatCurrency(totalContractValue, "EGP", language === 'ar' ? 'ar-EG' : 'en-US')}</div>
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
                  {t('vendorManagement.allTypes')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("supplier")}>
                  {t('vendorManagement.supplier')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("service_provider")}>
                  {t('vendorManagement.serviceProvider')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("contractor")}>
                  {t('vendorManagement.contractor')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("consultant")}>
                  {t('vendorManagement.consultant')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  {t('vendorManagement.statusFilter')}: {statusFilter === "all" ? t('vendorManagement.all') : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  {t('vendorManagement.allStatus')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                  {t('vendorManagement.active')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                  {t('vendorManagement.inactive')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("suspended")}>
                  {t('vendorManagement.suspended')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending_approval")}>
                  {t('vendorManagement.pendingApproval')}
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
                          {getStatusTranslation(vendor.status)}
                        </Badge>
                        <Badge variant="outline">
                          {getTypeTranslation(vendor.type)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{vendor.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">{t('vendorManagement.rating')}</p>
                          <div className="flex items-center space-x-1">
                            {renderStars(vendor.rating.overall)}
                            <span className="text-sm text-muted-foreground">
                              ({vendor.rating.totalReviews})
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t('vendorManagement.activeContracts')}</p>
                          <p className="text-sm text-muted-foreground">
                            {vendor.contracts.active} / {vendor.contracts.total}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t('vendorManagement.totalValue')}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(vendor.contracts.totalValue, "EGP", language === 'ar' ? 'ar-EG' : 'en-US')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t('vendorManagement.onTimeDelivery')}</p>
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
                          {t('vendorManagement.viewDetails')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('vendorManagement.editVendor')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          {t('vendorManagement.viewContracts')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {t('vendorManagement.communicationHistory')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          {t('vendorManagement.performanceAnalytics')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Award className="mr-2 h-4 w-4" />
                          {t('vendorManagement.rateVendor')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('vendorManagement.deleteVendor')}
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
          <CardTitle>{t('vendorManagement.recentContracts')}</CardTitle>
          <CardDescription>
            {t('vendorManagement.recentContractsDescription')}
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
                  <p className="font-medium">{formatCurrency(contract.value, "EGP", language === 'ar' ? 'ar-EG' : 'en-US')}</p>
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
            <DialogTitle>{t('vendorManagement.addNewVendor')}</DialogTitle>
            <DialogDescription>
              {t('vendorManagement.addNewVendorDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vendorName">{t('vendorManagement.vendorName')}</Label>
                <Input 
                  id="vendorName" 
                  placeholder={t('vendorManagement.placeholders.enterVendorName')} 
                  value={createVendorData.name}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="vendorType">{t('vendorManagement.type')}</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={createVendorData.type}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="supplier">{t('vendorManagement.supplier')}</option>
                  <option value="service_provider">{t('vendorManagement.serviceProvider')}</option>
                  <option value="contractor">{t('vendorManagement.contractor')}</option>
                  <option value="consultant">{t('vendorManagement.consultant')}</option>
                  <option value="other">{t('vendorManagement.other')}</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="vendorCategory">{t('vendorManagement.category')}</Label>
              <Input 
                id="vendorCategory" 
                placeholder={t('vendorManagement.placeholders.vendorCategory')} 
                value={createVendorData.category}
                onChange={(e) => setCreateVendorData(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="vendorDescription">{t('vendorManagement.description')}</Label>
              <Input 
                id="vendorDescription" 
                placeholder={t('vendorManagement.placeholders.vendorDescription')} 
                value={createVendorData.description}
                onChange={(e) => setCreateVendorData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">{t('vendorManagement.primaryContactName')}</Label>
                <Input 
                  id="contactName" 
                  placeholder={t('vendorManagement.placeholders.contactName')} 
                  value={createVendorData.primaryContactName}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, primaryContactName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">{t('vendorManagement.email')}</Label>
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
                <Label htmlFor="contactPhone">{t('vendorManagement.phone')}</Label>
                <Input 
                  id="contactPhone" 
                  placeholder="+20 10 1234 5678" 
                  value={createVendorData.primaryContactPhone}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, primaryContactPhone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="contactTitle">{t('vendorManagement.title')}</Label>
                <Input 
                  id="contactTitle" 
                  placeholder={t('vendorManagement.placeholders.jobTitle')} 
                  value={createVendorData.primaryContactTitle}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, primaryContactTitle: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="street">{t('vendorManagement.street')}</Label>
                <Input 
                  id="street" 
                  placeholder={t('vendorManagement.placeholders.streetAddress')} 
                  value={createVendorData.street}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, street: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="city">{t('vendorManagement.city')}</Label>
                <Input 
                  id="city" 
                  placeholder={t('vendorManagement.placeholders.city')} 
                  value={createVendorData.city}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="state">{t('vendorManagement.state')}</Label>
                <Input 
                  id="state" 
                  placeholder={t('vendorManagement.placeholders.state')} 
                  value={createVendorData.state}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="country">{t('vendorManagement.country')}</Label>
                <Input 
                  id="country" 
                  placeholder={t('vendorManagement.placeholders.country')} 
                  value={createVendorData.country}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="zipCode">{t('vendorManagement.zipCode')}</Label>
                <Input 
                  id="zipCode" 
                  placeholder={t('vendorManagement.placeholders.zipCode')} 
                  value={createVendorData.zipCode}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, zipCode: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="website">{t('vendorManagement.website')}</Label>
                <Input 
                  id="website" 
                  placeholder={t('vendorManagement.placeholders.website')} 
                  value={createVendorData.website}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="registrationNumber">{t('vendorManagement.registrationNumber')}</Label>
                <Input 
                  id="registrationNumber" 
                  placeholder={t('vendorManagement.placeholders.registrationNumber')} 
                  value={createVendorData.registrationNumber}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="taxId">{t('vendorManagement.taxId')}</Label>
                <Input 
                  id="taxId" 
                  placeholder={t('vendorManagement.placeholders.taxId')} 
                  value={createVendorData.taxId}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, taxId: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="establishedYear">{t('vendorManagement.establishedYear')}</Label>
                <Input 
                  id="establishedYear" 
                  type="number" 
                  placeholder={t('vendorManagement.placeholders.establishedYear')} 
                  value={createVendorData.establishedYear}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, establishedYear: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeCount">{t('vendorManagement.employeeCount')}</Label>
                <Input 
                  id="employeeCount" 
                  type="number" 
                  placeholder={t('vendorManagement.placeholders.employeeCount')} 
                  value={createVendorData.employeeCount}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, employeeCount: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="annualRevenue">{t('vendorManagement.annualRevenue')}</Label>
                <Input 
                  id="annualRevenue" 
                  type="number" 
                  placeholder={t('vendorManagement.placeholders.annualRevenue')} 
                  value={createVendorData.annualRevenue}
                  onChange={(e) => setCreateVendorData(prev => ({ ...prev, annualRevenue: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">{t('vendorManagement.notes')}</Label>
              <Input 
                id="notes" 
                placeholder={t('vendorManagement.placeholders.additionalNotes')} 
                value={createVendorData.notes}
                onChange={(e) => setCreateVendorData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {t('vendorManagement.cancel')}
            </Button>
            <Button onClick={createVendor}>
              {t('vendorManagement.addVendor')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Contract Dialog */}
      <Dialog open={showContractDialog} onOpenChange={setShowContractDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('vendorManagement.createNewContract')}</DialogTitle>
            <DialogDescription>
              {t('vendorManagement.createNewContractDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="contractVendor">{t('vendorManagement.vendorName')}</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={createContractData.vendorId}
                onChange={(e) => setCreateContractData(prev => ({ ...prev, vendorId: e.target.value }))}
              >
                <option value="">{t('vendorManagement.placeholders.selectVendor')}</option>
                {vendors.map((vendor) => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="contractTitle">{t('vendorManagement.contractTitle')}</Label>
              <Input 
                id="contractTitle" 
                placeholder={t('vendorManagement.placeholders.enterContractTitle')} 
                value={createContractData.title}
                onChange={(e) => setCreateContractData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="contractDescription">{t('vendorManagement.contractDescription')}</Label>
              <Input 
                id="contractDescription" 
                placeholder={t('vendorManagement.placeholders.contractDescription')} 
                value={createContractData.description}
                onChange={(e) => setCreateContractData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contractType">{t('vendorManagement.contractType')}</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={createContractData.type}
                  onChange={(e) => setCreateContractData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="service">{t('vendorManagement.service')}</option>
                  <option value="supply">{t('vendorManagement.supply')}</option>
                  <option value="consulting">{t('vendorManagement.consulting')}</option>
                  <option value="maintenance">{t('vendorManagement.maintenance')}</option>
                  <option value="other">{t('vendorManagement.other')}</option>
                </select>
              </div>
              <div>
                <Label htmlFor="contractValue">{t('vendorManagement.totalValue')} (EGP)</Label>
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
                <Label htmlFor="contractStart">{t('vendorManagement.startDate')}</Label>
                <Input 
                  id="contractStart" 
                  type="date" 
                  value={createContractData.startDate}
                  onChange={(e) => setCreateContractData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="contractEnd">{t('vendorManagement.endDate')}</Label>
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
                <Label htmlFor="paymentTerms">{t('vendorManagement.paymentTerms')}</Label>
                <Input 
                  id="paymentTerms" 
                  placeholder={t('vendorManagement.placeholders.paymentTerms')} 
                  value={createContractData.paymentTerms}
                  onChange={(e) => setCreateContractData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="deliveryTerms">{t('vendorManagement.deliveryTerms')}</Label>
                <Input 
                  id="deliveryTerms" 
                  placeholder={t('vendorManagement.placeholders.deliveryTerms')} 
                  value={createContractData.deliveryTerms}
                  onChange={(e) => setCreateContractData(prev => ({ ...prev, deliveryTerms: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warranty">{t('vendorManagement.warranty')}</Label>
                <Input 
                  id="warranty" 
                  placeholder={t('vendorManagement.placeholders.warrantyTerms')} 
                  value={createContractData.warranty}
                  onChange={(e) => setCreateContractData(prev => ({ ...prev, warranty: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="termination">{t('vendorManagement.termination')}</Label>
                <Input 
                  id="termination" 
                  placeholder={t('vendorManagement.placeholders.terminationTerms')} 
                  value={createContractData.termination}
                  onChange={(e) => setCreateContractData(prev => ({ ...prev, termination: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContractDialog(false)}>
              {t('vendorManagement.cancel')}
            </Button>
            <Button onClick={createContract}>
              {t('vendorManagement.createContract')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Communication Dialog */}
      <Dialog open={showCommunicationDialog} onOpenChange={setShowCommunicationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('vendorManagement.logCommunicationTitle')}</DialogTitle>
            <DialogDescription>
              {t('vendorManagement.logCommunicationDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="commVendor">{t('vendorManagement.vendorName')}</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={createCommunicationData.vendorId}
                onChange={(e) => setCreateCommunicationData(prev => ({ ...prev, vendorId: e.target.value }))}
              >
                <option value="">{t('vendorManagement.placeholders.selectVendor')}</option>
                {vendors.map((vendor) => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="commType">{t('vendorManagement.communicationType')}</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={createCommunicationData.type}
                onChange={(e) => setCreateCommunicationData(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="email">{t('vendorManagement.email')}</option>
                <option value="phone">{t('vendorManagement.phone')}</option>
                <option value="meeting">{t('vendorManagement.meeting')}</option>
                <option value="document">{t('vendorManagement.document')}</option>
                <option value="other">{t('vendorManagement.other')}</option>
              </select>
            </div>
            <div>
              <Label htmlFor="commSubject">{t('vendorManagement.subject')}</Label>
              <Input 
                id="commSubject" 
                placeholder={t('vendorManagement.placeholders.communicationSubject')} 
                value={createCommunicationData.subject}
                onChange={(e) => setCreateCommunicationData(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="commContent">{t('vendorManagement.content')}</Label>
              <Input 
                id="commContent" 
                placeholder={t('vendorManagement.placeholders.communicationDetails')} 
                value={createCommunicationData.content}
                onChange={(e) => setCreateCommunicationData(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="commDate">{t('vendorManagement.date')}</Label>
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
              {t('vendorManagement.cancel')}
            </Button>
            <Button onClick={createCommunication}>
              {t('vendorManagement.logCommunicationButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



