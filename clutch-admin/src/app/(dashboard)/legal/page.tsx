"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/hooks/use-translations";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { 
  Scale, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Download,
  Eye,
  Edit,
  Send,
  X,
  Gavel,
  Shield,
  FileCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Contract {
  _id: string;
  contractNumber: string;
  title: string;
  type: "service" | "partnership" | "employment" | "vendor" | "customer";
  status: "draft" | "pending" | "active" | "expired" | "terminated" | "renewed";
  partyName: string;
  partyEmail: string;
  startDate: string;
  endDate: string;
  value: number;
  currency: string;
  renewalDate?: string;
  autoRenewal: boolean;
  terms: string;
  createdAt: string;
  lastModified: string;
  signedBy: string[];
  attachments: string[];
}

interface Dispute {
  _id: string;
  disputeNumber: string;
  title: string;
  type: "contract_breach" | "payment_dispute" | "service_issue" | "intellectual_property" | "other";
  status: "open" | "investigating" | "negotiating" | "resolved" | "closed" | "escalated";
  priority: "low" | "medium" | "high" | "critical";
  partyName: string;
  partyEmail: string;
  description: string;
  amount: number;
  currency: string;
  assignedTo: string;
  assignedLawyer: string;
  createdAt: string;
  lastActivity: string;
  dueDate: string;
  resolution?: string;
  documents: string[];
  notes: string;
}

interface LegalStats {
  activeContracts: number;
  expiringContracts: number;
  openDisputes: number;
  resolvedDisputes: number;
  totalContractValue: number;
  averageResolutionTime: number;
}

export default function LegalPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState<LegalStats | null>(null);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [filteredDisputes, setFilteredDisputes] = useState<Dispute[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"contracts" | "disputes">("contracts");
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();
  const { t } = useTranslations();

  useEffect(() => {
    const loadLegalData = async () => {
      try {
        const token = localStorage.getItem("clutch-admin-token");
        
        // Load contracts
        const contractsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/legal/contracts", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (contractsResponse.ok) {
          const contractsData = await contractsResponse.json();
          setContracts(contractsData.data || contractsData);
        }

        // Load disputes
        const disputesResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/legal/disputes", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (disputesResponse.ok) {
          const disputesData = await disputesResponse.json();
          setDisputes(disputesData.data || disputesData);
        }

        // Load legal stats
        const statsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/legal/stats", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data || statsData);
        } else {
          // Calculate stats from loaded data
          const activeContracts = contracts.filter(c => c.status === "active").length;
          const expiringContracts = contracts.filter(c => 
            c.status === "active" && 
            new Date(c.endDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          ).length;
          const openDisputes = disputes.filter(d => 
            d.status === "open" || d.status === "investigating" || d.status === "negotiating"
          ).length;
          const resolvedDisputes = disputes.filter(d => d.status === "resolved").length;
          const totalContractValue = contracts
            .filter(c => c.status === "active")
            .reduce((sum, c) => sum + c.value, 0);

          setStats({
            activeContracts,
            expiringContracts,
            openDisputes,
            resolvedDisputes,
            totalContractValue,
            averageResolutionTime: 15, // days
          });
        }
      } catch (error) {
        console.error("Failed to load legal data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLegalData();
  }, []);

  useEffect(() => {
    let filteredConts = contracts;
    let filteredDisp = disputes;

    // Search filter
    if (searchQuery) {
      filteredConts = filteredConts.filter(contract =>
        contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.partyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      filteredDisp = filteredDisp.filter(dispute =>
        dispute.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.disputeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.partyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filteredConts = filteredConts.filter(contract => contract.status === statusFilter);
      filteredDisp = filteredDisp.filter(dispute => dispute.status === statusFilter);
    }

    setFilteredContracts(filteredConts);
    setFilteredDisputes(filteredDisp);
  }, [contracts, disputes, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "resolved":
        return "success";
      case "draft":
      case "pending":
      case "open":
      case "investigating":
        return "warning";
      case "expired":
      case "terminated":
      case "closed":
        return "destructive";
      case "renewed":
      case "negotiating":
        return "info";
      case "escalated":
        return "destructive";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "service":
        return <FileText className="h-4 w-4" />;
      case "partnership":
        return <Shield className="h-4 w-4" />;
      case "employment":
        return <User className="h-4 w-4" />;
      case "vendor":
        return <FileCheck className="h-4 w-4" />;
      case "customer":
        return <User className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleContractAction = async (contractId: string, action: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      switch (action) {
        case "activate":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/legal/contracts/${contractId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "active" }),
          });
          break;
        case "terminate":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/legal/contracts/${contractId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "terminated" }),
          });
          break;
        case "renew":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/legal/contracts/${contractId}/renew`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          break;
      }
      
      // Reload contracts
      const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/legal/contracts", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setContracts(data.data || data);
      }
    } catch (error) {
      console.error(`Failed to ${action} contract:`, error);
    }
  };

  const handleDisputeAction = async (disputeId: string, action: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      switch (action) {
        case "assign":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/legal/disputes/${disputeId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "investigating" }),
          });
          break;
        case "resolve":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/legal/disputes/${disputeId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "resolved" }),
          });
          break;
        case "escalate":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/legal/disputes/${disputeId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "escalated" }),
          });
          break;
        case "close":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/legal/disputes/${disputeId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "closed" }),
          });
          break;
      }
      
      // Reload disputes
      const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/legal/disputes", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDisputes(data.data || data);
      }
    } catch (error) {
      console.error(`Failed to ${action} dispute:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading legal data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('legal.title')}</h1>
          <p className="text-muted-foreground">
            {t('legal.description')}
          </p>
        </div>
        {hasPermission("manage_legal") && (
          <div className="flex space-x-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Contract
            </Button>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Dispute
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.activeContracts : contracts.filter(c => c.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats ? stats.expiringContracts : contracts.filter(c => 
                c.status === "active" && 
                new Date(c.endDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              ).length} expiring soon
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.openDisputes : disputes.filter(d => 
                d.status === "open" || d.status === "investigating" || d.status === "negotiating"
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {disputes.filter(d => d.priority === "critical").length} critical
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contract Value</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats ? stats.totalContractValue.toLocaleString() : 
                contracts.filter(c => c.status === "active").reduce((sum, c) => sum + c.value, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Active contracts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.averageResolutionTime : 15} days
            </div>
            <p className="text-xs text-muted-foreground">
              Average dispute resolution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-[0.625rem] w-fit">
        <Button
          variant={activeTab === "contracts" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("contracts")}
        >
          <FileText className="mr-2 h-4 w-4" />
          Contracts
        </Button>
        <Button
          variant={activeTab === "disputes" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("disputes")}
        >
          <Gavel className="mr-2 h-4 w-4" />
          Disputes
        </Button>
      </div>

      {/* Contracts Tab */}
      {activeTab === "contracts" && (
        <Card>
          <CardHeader>
            <CardTitle>Contract Management</CardTitle>
            <CardDescription>
              Monitor and manage legal contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search contracts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
                <option value="renewed">Renewed</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredContracts.map((contract) => (
                <div key={contract._id} className="flex items-center justify-between p-4 border rounded-[0.625rem] hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(contract.type)}
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{contract.title}</p>
                      <p className="text-sm text-muted-foreground">{contract.partyName}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getStatusColor(contract.status) as "default" | "secondary" | "destructive" | "outline"}>
                          {contract.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          #{contract.contractNumber}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ${contract.value.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {contract.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Start: {formatDate(contract.startDate)}</p>
                      <p>End: {formatDate(contract.endDate)}</p>
                      <p>Modified: {formatRelativeTime(contract.lastModified)}</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Contract
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Contract
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {contract.status === "draft" && (
                          <DropdownMenuItem 
                            onClick={() => handleContractAction(contract._id, "activate")}
                            className="text-success"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate Contract
                          </DropdownMenuItem>
                        )}
                        {contract.status === "active" && (
                          <DropdownMenuItem 
                            onClick={() => handleContractAction(contract._id, "renew")}
                            className="text-primary"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Renew Contract
                          </DropdownMenuItem>
                        )}
                        {contract.status === "active" && (
                          <DropdownMenuItem 
                            onClick={() => handleContractAction(contract._id, "terminate")}
                            className="text-destructive"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Terminate Contract
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {filteredContracts.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No contracts found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Disputes Tab */}
      {activeTab === "disputes" && (
        <Card>
          <CardHeader>
            <CardTitle>Dispute Management</CardTitle>
            <CardDescription>
              Track and resolve legal disputes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search disputes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="negotiating">Negotiating</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredDisputes.map((dispute) => (
                <div key={dispute._id} className="flex items-center justify-between p-4 border rounded-[0.625rem] hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Gavel className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{dispute.title}</p>
                      <p className="text-sm text-muted-foreground">{dispute.partyName}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getStatusColor(dispute.status) as "default" | "secondary" | "destructive" | "outline"}>
                          {dispute.status}
                        </Badge>
                        <Badge variant={getPriorityColor(dispute.priority) as "default" | "secondary" | "destructive" | "outline"}>
                          {dispute.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          #{dispute.disputeNumber}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ${dispute.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Created: {formatDate(dispute.createdAt)}</p>
                      <p>Due: {formatDate(dispute.dueDate)}</p>
                      <p>Last activity: {formatRelativeTime(dispute.lastActivity)}</p>
                      {dispute.assignedLawyer && (
                        <p>Lawyer: {dispute.assignedLawyer}</p>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download Documents
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Add Notes
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDisputeAction(dispute._id, "assign")}
                          className="text-primary"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Assign to Lawyer
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDisputeAction(dispute._id, "resolve")}
                          className="text-success"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDisputeAction(dispute._id, "escalate")}
                          className="text-destructive"
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Escalate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDisputeAction(dispute._id, "close")}
                          className="text-muted-foreground"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Close Dispute
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {filteredDisputes.length === 0 && (
              <div className="text-center py-8">
                <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No disputes found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
