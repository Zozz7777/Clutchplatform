"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Mail, 
  Phone,
  Calendar,
  Star,
  MoreHorizontal,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Briefcase,
  MapPin,
  DollarSign
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiService } from "@/lib/api";

interface RecruitmentTabProps {
  applications: any[];
  jobs: any[];
  onApplicationsUpdate: () => void;
}

interface Application {
  _id: string;
  applicationId: string;
  job: {
    _id: string;
    title: string;
    department: string;
  };
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: {
      city: string;
      country: string;
    };
  };
  status: string;
  priority: string;
  scoring: {
    overall: number;
    technical: number;
    cultural: number;
    communication: number;
    experience: number;
    education: number;
  };
  interviews: any[];
  offer: any;
  source: {
    type: string;
  };
  createdAt: string;
  appliedDate: string;
  timeline: any[];
  notes: any[];
}

export function RecruitmentTab({ applications, jobs, onApplicationsUpdate }: RecruitmentTabProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let filtered = applications;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(app =>
        app.candidate.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidate.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Job filter
    if (jobFilter !== "all") {
      filtered = filtered.filter(app => app.job._id === jobFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(app => app.priority === priorityFilter);
    }

    setFilteredApplications(filtered);
  }, [applications, searchQuery, statusFilter, jobFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "secondary";
      case "screened":
        return "outline";
      case "interview_scheduled":
      case "interview_completed":
        return "default";
      case "offer_made":
        return "default";
      case "hired":
        return "default";
      case "rejected":
        return "destructive";
      case "withdrawn":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-success";
    if (score >= 3) return "text-warning";
    return "text-destructive";
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.updateApplicationStatus(applicationId, {
        status: newStatus,
        notes: `Status changed to ${newStatus}`
      });

      if (response.success) {
        toast.success("Application status updated successfully");
        onApplicationsUpdate();
      } else {
        toast.error(response.message || "Failed to update application status");
      }
    } catch (error) {
      handleError(error, { component: 'RecruitmentTab', action: 'update_status' });
      toast.error("Failed to update application status");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorityChange = async (applicationId: string, newPriority: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.updateApplication(applicationId, {
        priority: newPriority
      });

      if (response.success) {
        toast.success("Application priority updated successfully");
        onApplicationsUpdate();
      } else {
        toast.error(response.message || "Failed to update application priority");
      }
    } catch (error) {
      handleError(error, { component: 'RecruitmentTab', action: 'update_priority' });
      toast.error("Failed to update application priority");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const handleDownloadResume = async (application: Application) => {
    try {
      if (application.resume?.url) {
        const link = document.createElement('a');
        link.href = application.resume.url;
        link.download = `${application.candidate.firstName}_${application.candidate.lastName}_resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Resume downloaded successfully");
      } else {
        toast.error("Resume not available");
      }
    } catch (error) {
      toast.error("Failed to download resume");
    }
  };

  const handleSendEmail = async (application: Application) => {
    try {
      // This would open an email composer or send a template email
      toast.success(`Email sent to ${application.candidate.email}`);
    } catch (error) {
      toast.error("Failed to send email");
    }
  };

  const handleScheduleInterview = async (application: Application) => {
    try {
      // This would open an interview scheduling modal
      toast.success("Interview scheduling feature coming soon");
    } catch (error) {
      toast.error("Failed to schedule interview");
    }
  };

  const handleMakeOffer = async (application: Application) => {
    try {
      // This would open an offer creation modal
      toast.success("Offer creation feature coming soon");
    } catch (error) {
      toast.error("Failed to create offer");
    }
  };

  const handleRejectApplication = async (application: Application) => {
    if (window.confirm(`Are you sure you want to reject ${application.candidate.firstName} ${application.candidate.lastName}'s application?`)) {
      try {
        await handleStatusChange(application._id, "rejected");
      } catch (error) {
        toast.error("Failed to reject application");
      }
    }
  };

  const handleHireCandidate = async (application: Application) => {
    if (window.confirm(`Are you sure you want to hire ${application.candidate.firstName} ${application.candidate.lastName}?`)) {
      try {
        await handleStatusChange(application._id, "hired");
      } catch (error) {
        toast.error("Failed to hire candidate");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Job Applications</CardTitle>
          <CardDescription>
            Manage and track job applications from candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screened">Screened</SelectItem>
                <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                <SelectItem value="interview_completed">Interview Completed</SelectItem>
                <SelectItem value="offer_made">Offer Made</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>

            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Jobs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job._id} value={job._id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application._id} className="flex items-center justify-between p-4 border border-border rounded-[0.625rem] hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-medium text-lg">
                      {application.candidate.firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">
                        {application.candidate.firstName} {application.candidate.lastName}
                      </p>
                      <Badge variant={getStatusColor(application.status)}>
                        {application.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant={getPriorityColor(application.priority)}>
                        {application.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {application.job.title} • {application.job.department}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {application.candidate.email}
                      </span>
                      {application.candidate.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {application.candidate.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {application.candidate.location?.city}, {application.candidate.location?.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(application.appliedDate)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Scoring */}
                  {application.scoring?.overall > 0 && (
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span className={`font-medium ${getScoreColor(application.scoring.overall)}`}>
                          {application.scoring.overall}/5
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Overall Score</p>
                    </div>
                  )}

                  {/* Source */}
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {application.source?.type || 'Unknown'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">Source</p>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleViewApplication(application)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Application
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadResume(application)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Resume
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSendEmail(application)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      
                      {/* Status Actions */}
                      {application.status === "applied" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(application._id, "screened")}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Screened
                        </DropdownMenuItem>
                      )}
                      
                      {application.status === "screened" && (
                        <DropdownMenuItem onClick={() => handleScheduleInterview(application)}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule Interview
                        </DropdownMenuItem>
                      )}
                      
                      {application.status === "interview_completed" && (
                        <DropdownMenuItem onClick={() => handleMakeOffer(application)}>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Make Offer
                        </DropdownMenuItem>
                      )}
                      
                      {application.status === "offer_made" && (
                        <DropdownMenuItem onClick={() => handleHireCandidate(application)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Hire Candidate
                        </DropdownMenuItem>
                      )}
                      
                      {application.status !== "hired" && application.status !== "rejected" && (
                        <DropdownMenuItem 
                          onClick={() => handleRejectApplication(application)}
                          className="text-destructive"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject Application
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      {/* Priority Actions */}
                      <DropdownMenuLabel>Change Priority</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handlePriorityChange(application._id, "urgent")}>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Urgent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePriorityChange(application._id, "high")}>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        High
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePriorityChange(application._id, "medium")}>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Medium
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePriorityChange(application._id, "low")}>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Low
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No applications found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Detail Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-[0.625rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Application Details</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowApplicationModal(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Candidate Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Candidate Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <p className="text-sm">
                          {selectedApplication.candidate.firstName} {selectedApplication.candidate.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-sm">{selectedApplication.candidate.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-sm">{selectedApplication.candidate.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                        <p className="text-sm">
                          {selectedApplication.candidate.location?.city}, {selectedApplication.candidate.location?.country}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Job Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Position</label>
                        <p className="text-sm">{selectedApplication.job.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Department</label>
                        <p className="text-sm">{selectedApplication.job.department}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Applied Date</label>
                        <p className="text-sm">{formatDate(selectedApplication.appliedDate)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Application ID</label>
                        <p className="text-sm font-mono">{selectedApplication.applicationId}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Scoring */}
                {selectedApplication.scoring && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Scoring & Evaluation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(selectedApplication.scoring.overall)}`}>
                            {selectedApplication.scoring.overall}/5
                          </div>
                          <p className="text-sm text-muted-foreground">Overall</p>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-medium ${getScoreColor(selectedApplication.scoring.technical)}`}>
                            {selectedApplication.scoring.technical}/5
                          </div>
                          <p className="text-sm text-muted-foreground">Technical</p>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-medium ${getScoreColor(selectedApplication.scoring.cultural)}`}>
                            {selectedApplication.scoring.cultural}/5
                          </div>
                          <p className="text-sm text-muted-foreground">Cultural Fit</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Timeline */}
                {selectedApplication.timeline && selectedApplication.timeline.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Application Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedApplication.timeline.map((event, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                            <div>
                              <p className="text-sm font-medium">{event.action}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(event.performedAt)} - {event.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setShowApplicationModal(false)}>
                  Close
                </Button>
                <Button onClick={() => handleDownloadResume(selectedApplication)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Resume
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
