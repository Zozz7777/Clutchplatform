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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { hybridApi } from "@/lib/hybrid-api";

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

  // Mock data for development
  const mockVendors: Vendor[] = [
    {
      _id: "1",
      name: "Tech Solutions Egypt",
      type: "service_provider",
      category: "IT Services",
      description: "Leading IT services provider specializing in software development and system integration",
      contact: {
        primary: {
          name: "Ahmed Hassan",
          email: "ahmed@techsolutions.eg",
          phone: "+20 10 1234 5678",
          title: "Business Development Manager",
        },
        secondary: {
          name: "Fatma Ali",
          email: "fatma@techsolutions.eg",
          phone: "+20 10 8765 4321",
          title: "Project Manager",
        },
      },
      address: {
        street: "123 Nile Street",
        city: "Cairo",
        state: "Cairo",
        country: "Egypt",
        zipCode: "11511",
        coordinates: {
          lat: 30.0444,
          lng: 31.2357,
        },
      },
      business: {
        registrationNumber: "12345-2020",
        taxId: "TAX-EG-123456789",
        website: "https://techsolutions.eg",
        establishedYear: 2020,
        employeeCount: 150,
        annualRevenue: 50000000,
      },
      status: "active",
      rating: {
        overall: 4.5,
        quality: 4.7,
        delivery: 4.3,
        communication: 4.6,
        pricing: 4.2,
        totalReviews: 24,
      },
      contracts: {
        total: 8,
        active: 3,
        totalValue: 2500000,
        averageValue: 312500,
      },
      performance: {
        onTimeDelivery: 92,
        qualityScore: 4.7,
        responseTime: 2.5,
        lastInteraction: "2024-03-15T10:30:00Z",
      },
      certifications: [
        {
          name: "ISO 9001:2015",
          issuer: "Bureau Veritas",
          issueDate: "2023-01-15",
          expiryDate: "2026-01-15",
          status: "valid",
        },
        {
          name: "ISO 27001:2013",
          issuer: "SGS",
          issueDate: "2023-06-01",
          expiryDate: "2026-06-01",
          status: "valid",
        },
      ],
      tags: ["IT", "software", "development", "integration"],
      notes: "Reliable partner for complex software projects. Excellent technical expertise.",
      createdAt: "2023-01-10T10:00:00Z",
      updatedAt: "2024-03-15T14:30:00Z",
    },
    {
      _id: "2",
      name: "Office Supplies Plus",
      type: "supplier",
      category: "Office Supplies",
      description: "Comprehensive office supplies and equipment supplier",
      contact: {
        primary: {
          name: "Mohamed Ibrahim",
          email: "mohamed@officesupplies.eg",
          phone: "+20 11 2345 6789",
          title: "Sales Manager",
        },
      },
      address: {
        street: "456 Tahrir Square",
        city: "Cairo",
        state: "Cairo",
        country: "Egypt",
        zipCode: "11512",
      },
      business: {
        registrationNumber: "67890-2018",
        taxId: "TAX-EG-987654321",
        website: "https://officesupplies.eg",
        establishedYear: 2018,
        employeeCount: 45,
        annualRevenue: 15000000,
      },
      status: "active",
      rating: {
        overall: 4.2,
        quality: 4.1,
        delivery: 4.4,
        communication: 4.0,
        pricing: 4.3,
        totalReviews: 18,
      },
      contracts: {
        total: 12,
        active: 5,
        totalValue: 800000,
        averageValue: 66667,
      },
      performance: {
        onTimeDelivery: 88,
        qualityScore: 4.1,
        responseTime: 4.0,
        lastInteraction: "2024-03-12T15:45:00Z",
      },
      certifications: [
        {
          name: "ISO 9001:2015",
          issuer: "TÜV NORD",
          issueDate: "2022-03-01",
          expiryDate: "2025-03-01",
          status: "valid",
        },
      ],
      tags: ["office", "supplies", "equipment", "stationery"],
      notes: "Good pricing and reliable delivery. Quality could be improved.",
      createdAt: "2023-02-15T09:00:00Z",
      updatedAt: "2024-03-12T15:45:00Z",
    },
    {
      _id: "3",
      name: "Fleet Maintenance Co.",
      type: "service_provider",
      category: "Vehicle Maintenance",
      description: "Professional vehicle maintenance and repair services",
      contact: {
        primary: {
          name: "Nour El-Din",
          email: "nour@fleetmaintenance.eg",
          phone: "+20 12 3456 7890",
          title: "Operations Manager",
        },
      },
      address: {
        street: "789 Industrial Zone",
        city: "Alexandria",
        state: "Alexandria",
        country: "Egypt",
        zipCode: "21500",
      },
      business: {
        registrationNumber: "11111-2019",
        taxId: "TAX-EG-111222333",
        website: "https://fleetmaintenance.eg",
        establishedYear: 2019,
        employeeCount: 80,
        annualRevenue: 25000000,
      },
      status: "active",
      rating: {
        overall: 4.8,
        quality: 4.9,
        delivery: 4.7,
        communication: 4.8,
        pricing: 4.6,
        totalReviews: 32,
      },
      contracts: {
        total: 6,
        active: 4,
        totalValue: 1800000,
        averageValue: 300000,
      },
      performance: {
        onTimeDelivery: 96,
        qualityScore: 4.9,
        responseTime: 1.5,
        lastInteraction: "2024-03-14T11:20:00Z",
      },
      certifications: [
        {
          name: "ISO 9001:2015",
          issuer: "DNV GL",
          issueDate: "2023-02-01",
          expiryDate: "2026-02-01",
          status: "valid",
        },
        {
          name: "Automotive Service Excellence",
          issuer: "ASE",
          issueDate: "2023-05-15",
          expiryDate: "2025-05-15",
          status: "valid",
        },
      ],
      tags: ["vehicle", "maintenance", "repair", "fleet"],
      notes: "Excellent service quality and reliability. Highly recommended for fleet maintenance.",
      createdAt: "2023-03-01T08:00:00Z",
      updatedAt: "2024-03-14T11:20:00Z",
    },
  ];

  const mockContracts: Contract[] = [
    {
      _id: "1",
      vendorId: "1",
      vendorName: "Tech Solutions Egypt",
      title: "Mobile App Development",
      description: "Development of Clutch mobile application",
      type: "service",
      status: "active",
      value: 800000,
      currency: "EGP",
      startDate: "2024-01-01",
      endDate: "2024-06-30",
      terms: {
        paymentTerms: "50% upfront, 50% on completion",
        deliveryTerms: "Weekly progress reports",
        warranty: "6 months post-delivery support",
        termination: "30 days notice required",
      },
      deliverables: [
        {
          description: "UI/UX Design",
          dueDate: "2024-02-15",
          status: "completed",
        },
        {
          description: "Frontend Development",
          dueDate: "2024-04-15",
          status: "in_progress",
        },
        {
          description: "Backend Integration",
          dueDate: "2024-05-30",
          status: "pending",
        },
      ],
      createdBy: {
        id: "1",
        name: "Ahmed Hassan",
      },
      createdAt: "2023-12-15T10:00:00Z",
      updatedAt: "2024-03-15T14:30:00Z",
    },
  ];

  const mockCommunications: Communication[] = [
    {
      _id: "1",
      vendorId: "1",
      vendorName: "Tech Solutions Egypt",
      type: "email",
      subject: "Project Status Update",
      content: "Weekly progress report for mobile app development project",
      direction: "inbound",
      participants: [
        {
          id: "1",
          name: "Ahmed Hassan",
          email: "ahmed@techsolutions.eg",
        },
        {
          id: "2",
          name: "Fatma Ali",
          email: "fatma@yourclutch.com",
        },
      ],
      attachments: [
        {
          name: "progress_report.pdf",
          url: "/attachments/progress_report.pdf",
          type: "pdf",
        },
      ],
      date: "2024-03-15T10:30:00Z",
      createdBy: {
        id: "1",
        name: "Ahmed Hassan",
      },
      createdAt: "2024-03-15T10:30:00Z",
    },
  ];

  useEffect(() => {
    loadVendors();
    loadContracts();
    loadCommunications();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await hybridApi.getVendors();
      setVendors(data || mockVendors);
    } catch (error) {
      console.error("Error loading vendors:", error);
      setVendors(mockVendors);
    } finally {
      setLoading(false);
    }
  };

  const loadContracts = async () => {
    try {
      const data = await hybridApi.getVendorContracts();
      setContracts(data || mockContracts);
    } catch (error) {
      console.error("Error loading contracts:", error);
      setContracts(mockContracts);
    }
  };

  const loadCommunications = async () => {
    try {
      const data = await hybridApi.getVendorCommunications();
      setCommunications(data || mockCommunications);
    } catch (error) {
      console.error("Error loading communications:", error);
      setCommunications(mockCommunications);
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
          <p className="mt-2 text-muted-foreground">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Management</h1>
          <p className="text-muted-foreground">
            Manage vendor relationships, contracts, and performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowCommunicationDialog(true)} variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Log Communication
          </Button>
          <Button onClick={() => setShowContractDialog(true)} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            New Contract
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendors}</div>
            <p className="text-xs text-muted-foreground">
              {activeVendors} active, {totalVendors - activeVendors} inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contract Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalContractValue)}</div>
            <p className="text-xs text-muted-foreground">
              Across all contracts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 5.0 stars
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendors.reduce((sum, v) => sum + v.contracts.active, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vendors */}
      <Card>
        <CardHeader>
          <CardTitle>Vendors</CardTitle>
          <CardDescription>
            Manage vendor relationships and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
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
              <Card key={vendor._id} className="hover:shadow-md transition-shadow">
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
              <div key={contract._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
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
                <Input id="vendorName" placeholder="Enter vendor name" />
              </div>
              <div>
                <Label htmlFor="vendorType">Type</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="supplier">Supplier</option>
                  <option value="service_provider">Service Provider</option>
                  <option value="contractor">Contractor</option>
                  <option value="consultant">Consultant</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="vendorDescription">Description</Label>
              <Input id="vendorDescription" placeholder="Vendor description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Primary Contact Name</Label>
                <Input id="contactName" placeholder="Contact name" />
              </div>
              <div>
                <Label htmlFor="contactEmail">Email</Label>
                <Input id="contactEmail" type="email" placeholder="contact@vendor.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPhone">Phone</Label>
                <Input id="contactPhone" placeholder="+20 10 1234 5678" />
              </div>
              <div>
                <Label htmlFor="contactTitle">Title</Label>
                <Input id="contactTitle" placeholder="Job title" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="City" />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" placeholder="Country" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://vendor.com" />
              </div>
              <div>
                <Label htmlFor="taxId">Tax ID</Label>
                <Input id="taxId" placeholder="Tax identification number" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateDialog(false)}>
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
              <select className="w-full p-2 border rounded-md">
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
              <Input id="contractTitle" placeholder="Enter contract title" />
            </div>
            <div>
              <Label htmlFor="contractDescription">Description</Label>
              <Input id="contractDescription" placeholder="Contract description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contractType">Type</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="service">Service</option>
                  <option value="supply">Supply</option>
                  <option value="consulting">Consulting</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="contractValue">Value (EGP)</Label>
                <Input id="contractValue" type="number" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contractStart">Start Date</Label>
                <Input id="contractStart" type="date" />
              </div>
              <div>
                <Label htmlFor="contractEnd">End Date</Label>
                <Input id="contractEnd" type="date" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContractDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowContractDialog(false)}>
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
              <select className="w-full p-2 border rounded-md">
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
              <select className="w-full p-2 border rounded-md">
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="meeting">Meeting</option>
                <option value="document">Document</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="commSubject">Subject</Label>
              <Input id="commSubject" placeholder="Communication subject" />
            </div>
            <div>
              <Label htmlFor="commContent">Content</Label>
              <Input id="commContent" placeholder="Communication details" />
            </div>
            <div>
              <Label htmlFor="commDate">Date</Label>
              <Input id="commDate" type="datetime-local" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommunicationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCommunicationDialog(false)}>
              Log Communication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
