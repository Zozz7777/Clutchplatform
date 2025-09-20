"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Mail,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  ExternalLink,
  Copy,
  Send,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

interface PendingEmail {
  _id: string;
  type: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  invitationLink: string;
  employeeData: {
    name: string;
    role: string;
    department: string;
  };
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
  attempts: number;
  lastAttempt?: string;
  sentAt?: string;
  sentBy?: string;
}

export default function PendingEmailsPage() {
  const { t } = useTranslations();
  const { user, hasPermission } = useAuth();
  const [pendingEmails, setPendingEmails] = useState<PendingEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<PendingEmail | null>(null);

  useEffect(() => {
    const loadPendingEmails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("clutch-admin-token");
        
        const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/pending-emails", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setPendingEmails(data.data?.pendingEmails || []);
        } else {
          console.error('Failed to load pending emails');
          toast.error('Failed to load pending emails');
        }
      } catch (error) {
        console.error('Error loading pending emails:', error);
        toast.error('Failed to load pending emails');
      } finally {
        setLoading(false);
      }
    };

    if (user && hasPermission('manage_employees')) {
      loadPendingEmails();
    }
  }, [user, hasPermission]);

  const filteredEmails = pendingEmails.filter((email) => {
    const matchesSearch = 
      email.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.employeeData.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || email.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewEmail = (email: PendingEmail) => {
    setSelectedEmail(email);
    setShowEmailDialog(true);
  };

  const handleMarkAsSent = async (emailId: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      const response = await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/pending-emails/${emailId}/mark-sent`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success('Email marked as sent');
        // Reload emails
        window.location.reload();
      } else {
        toast.error('Failed to mark email as sent');
      }
    } catch (error) {
      console.error('Error marking email as sent:', error);
      toast.error('Failed to mark email as sent');
    }
  };

  const handleCopyInvitationLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Invitation link copied to clipboard');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'sent':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!hasPermission('manage_employees')) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">You don't have permission to view pending emails.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pending Emails</h1>
          <p className="text-muted-foreground">
            Manage employee invitation emails that couldn't be sent automatically
          </p>
        </div>
      </div>

      {/* Email Service Status Alert */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="font-semibold text-yellow-800">Email Service Status</h4>
              <p className="text-sm text-yellow-700">
                Email service is running in mock mode. Configure EMAIL_USER and EMAIL_PASSWORD in your backend .env file to enable real email sending.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Pending Emails Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Emails ({filteredEmails.length})</CardTitle>
          <CardDescription>
            Employee invitation emails that need to be sent manually
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading pending emails...</p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Emails</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "No emails match your current filters." 
                  : "All emails have been processed successfully."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmails.map((email) => (
                  <TableRow key={email._id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{email.employeeData.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {email.employeeData.role} • {email.employeeData.department}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{email.to}</TableCell>
                    <TableCell className="max-w-xs truncate">{email.subject}</TableCell>
                    <TableCell>{getStatusBadge(email.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(email.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEmail(email)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        {email.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsSent(email._id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mark Sent
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Email Details Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
            <DialogDescription>
              Employee invitation email that needs to be sent manually
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">To:</label>
                  <p className="text-sm text-muted-foreground">{selectedEmail.to}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Subject:</label>
                  <p className="text-sm text-muted-foreground">{selectedEmail.subject}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Employee Details:</label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p><strong>Name:</strong> {selectedEmail.employeeData.name}</p>
                  <p><strong>Role:</strong> {selectedEmail.employeeData.role}</p>
                  <p><strong>Department:</strong> {selectedEmail.employeeData.department}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Invitation Link:</label>
                <div className="mt-1 flex items-center space-x-2">
                  <Input
                    value={selectedEmail.invitationLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyInvitationLink(selectedEmail.invitationLink)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedEmail.invitationLink, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Email Content:</label>
                <div className="mt-1 p-3 bg-muted rounded-md max-h-60 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: selectedEmail.html }} />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Close
            </Button>
            {selectedEmail?.status === 'pending' && (
              <Button onClick={() => {
                handleMarkAsSent(selectedEmail._id);
                setShowEmailDialog(false);
              }}>
                <Send className="w-3 h-3 mr-1" />
                Mark as Sent
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
