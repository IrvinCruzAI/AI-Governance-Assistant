import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { 
  Loader2, 
  ArrowLeft, 
  FileText, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  BarChart3,
  Shield,
  Mail,
  Trash2,
  Star,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Priority scoring algorithm
function calculatePriorityScore(initiative: any): number {
  let score = 0;
  
  // Risk level (0-40 points)
  if (initiative.riskLevel === 'High') score += 40;
  else if (initiative.riskLevel === 'Medium') score += 25;
  else if (initiative.riskLevel === 'Low') score += 10;
  
  // Mission alignment (0-30 points)
  if (initiative.missionAlignmentRating === 'High') score += 30;
  else if (initiative.missionAlignmentRating === 'Medium') score += 20;
  else if (initiative.missionAlignmentRating === 'Low') score += 10;
  
  // Urgency from metadata (0-20 points) - would need to add this field
  // For now, use days pending as proxy
  const daysPending = initiative.createdAt 
    ? Math.floor((Date.now() - new Date(initiative.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  if (daysPending > 7) score += 20;
  else if (daysPending > 3) score += 10;
  
  // Status (0-10 points) - pending gets higher priority
  if (initiative.status === 'pending') score += 10;
  else if (initiative.status === 'under-review') score += 5;
  
  return score;
}

function getPriorityLabel(score: number): { label: string; color: string } {
  if (score >= 70) return { label: 'Critical', color: 'bg-red-600' };
  if (score >= 50) return { label: 'High', color: 'bg-orange-500' };
  if (score >= 30) return { label: 'Medium', color: 'bg-yellow-500' };
  return { label: 'Low', color: 'bg-gray-400' };
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  // Redirect non-admin users
  if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
    setLocation('/');
    return null;
  }
  
  const [selectedInitiative, setSelectedInitiative] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [newStatus, setNewStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");

  const utils = trpc.useUtils();
  const { data: initiatives, isLoading: initiativesLoading } = trpc.admin.getAllInitiatives.useQuery(
    {},
    { enabled: isAuthenticated && user?.role === 'admin' }
  );

  const { data: analytics } = trpc.admin.getAnalytics.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === 'admin' }
  );

  const updateStatusMutation = trpc.admin.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated successfully");
      utils.admin.getAllInitiatives.invalidate();
      utils.admin.getAnalytics.invalidate();
      setSelectedInitiative(null);
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const deleteInitiativeMutation = trpc.admin.deleteInitiative.useMutation({
    onSuccess: () => {
      toast.success("Initiative deleted successfully");
      utils.admin.getAllInitiatives.invalidate();
      utils.admin.getAnalytics.invalidate();
      setSelectedInitiative(null);
    },
    onError: () => {
      toast.error("Failed to delete initiative");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    setLocation("/");
    return null;
  }

  // Add priority scores to initiatives
  const initiativesWithPriority = initiatives?.map(initiative => ({
    ...initiative,
    priorityScore: calculatePriorityScore(initiative),
    priority: getPriorityLabel(calculatePriorityScore(initiative))
  })) || [];

  // Filter and sort
  const filteredInitiatives = initiativesWithPriority
    .filter(initiative => {
      if (statusFilter !== "all" && initiative.status !== statusFilter) return false;
      if (riskFilter !== "all" && initiative.riskLevel !== riskFilter) return false;
      if (priorityFilter !== "all" && initiative.priority.label !== priorityFilter) return false;
      return true;
    })
    .sort((a, b) => b.priorityScore - a.priorityScore); // Sort by priority score descending

  const handleStatusUpdate = () => {
    if (!selectedInitiative || !newStatus) return;
    
    updateStatusMutation.mutate({
      id: selectedInitiative.id,
      status: newStatus as any,
      adminNotes: adminNotes || undefined,
    });
  };

  const handleDelete = () => {
    if (!selectedInitiative) return;
    if (!confirm(`Are you sure you want to delete "${selectedInitiative.title}"? This cannot be undone.`)) return;
    
    deleteInitiativeMutation.mutate({ id: selectedInitiative.id });
  };

  const handleEmailSubmitter = (initiative: any) => {
    const subject = encodeURIComponent(`Re: Your AI Initiative - ${initiative.title}`);
    const body = encodeURIComponent(`Hi,\n\nThank you for submitting your AI initiative idea: "${initiative.title}".\n\nI have a few questions:\n\n\n\nBest regards,\nAdventHealth AI Team`);
    window.location.href = `mailto:${initiative.userEmail}?subject=${subject}&body=${body}`;
  };

  const openReviewDialog = (initiative: any) => {
    setSelectedInitiative(initiative);
    setNewStatus(initiative.status || "pending");
    setAdminNotes(initiative.adminNotes || "");
  };

  // Calculate additional analytics
  const criticalCount = initiativesWithPriority.filter(i => i.priority.label === 'Critical').length;
  const avgDaysPending = initiatives?.length 
    ? Math.round(initiatives.reduce((acc, i) => {
        const days = i.createdAt ? Math.floor((Date.now() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
        return acc + days;
      }, 0) / initiatives.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Review and manage AI initiative submissions</p>
          </div>
          <Button variant="outline" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Enhanced Analytics Cards */}
        {analytics && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
            <Card className="border-2 border-blue-200 bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalSubmissions}</p>
                <p className="text-sm text-gray-600">Total Submissions</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200 bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{criticalCount}</p>
                <p className="text-sm text-gray-600">Critical Priority</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{analytics.byStatus.pending}</p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{analytics.byStatus.approved}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="h-8 w-8 text-gray-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{avgDaysPending}</p>
                <p className="text-sm text-gray-600">Avg Days Pending</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Filters */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[180px]">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[180px]">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Risk Level</Label>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[180px]">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Priority</Label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Showing <strong>{filteredInitiatives.length}</strong> of {initiatives?.length || 0} initiatives
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Initiatives Table with Priority */}
        <Card className="shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            {initiativesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredInitiatives.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Priority</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Title</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Submitter</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Area</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Risk</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Mission</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredInitiatives.map((initiative) => (
                    <tr key={initiative.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${initiative.priority.color}`}></div>
                          <span className="text-sm font-semibold">{initiative.priorityScore}</span>
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {initiative.priority.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900 line-clamp-2 max-w-xs">
                          {initiative.title || "Untitled"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {initiative.userEmail || `User #${initiative.userId}`}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className="text-xs">
                          {initiative.area || "N/A"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        {initiative.riskLevel && (
                          <Badge variant={
                            initiative.riskLevel === 'High' ? 'destructive' :
                            initiative.riskLevel === 'Medium' ? 'default' :
                            'secondary'
                          } className="text-xs">
                            {initiative.riskLevel}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {initiative.missionAlignmentRating && (
                          <Badge variant={
                            initiative.missionAlignmentRating === 'High' ? 'default' :
                            initiative.missionAlignmentRating === 'Medium' ? 'secondary' :
                            'outline'
                          } className="text-xs">
                            {initiative.missionAlignmentRating}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={
                          initiative.status === 'approved' ? 'default' :
                          initiative.status === 'rejected' ? 'destructive' :
                          initiative.status === 'under-review' ? 'secondary' :
                          'outline'
                        } className="text-xs">
                          {initiative.status || 'pending'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReviewDialog(initiative)}
                          >
                            Review
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No initiatives found matching your filters.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedInitiative} onOpenChange={() => setSelectedInitiative(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedInitiative?.title || "Untitled Initiative"}</DialogTitle>
            <DialogDescription>
              Review and update the status of this AI initiative
            </DialogDescription>
          </DialogHeader>

          {selectedInitiative && (
            <div className="space-y-6">
              {/* Priority Score */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Priority Score</p>
                    <p className="text-3xl font-bold text-gray-900">{selectedInitiative.priorityScore}</p>
                  </div>
                  <Badge className={`${selectedInitiative.priority.color} text-white text-lg px-4 py-2`}>
                    {selectedInitiative.priority.label} Priority
                  </Badge>
                </div>
              </div>

              {/* Submitter Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Submitter Email</Label>
                  <p className="text-gray-900">{selectedInitiative.userEmail || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Role</Label>
                  <p className="text-gray-900">{selectedInitiative.userRole || "Not provided"}</p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Risk Level</Label>
                  <Badge variant={
                    selectedInitiative.riskLevel === 'High' ? 'destructive' :
                    selectedInitiative.riskLevel === 'Medium' ? 'default' :
                    'secondary'
                  }>
                    {selectedInitiative.riskLevel || "Not assessed"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Mission Alignment</Label>
                  <Badge variant="default">
                    {selectedInitiative.missionAlignmentRating || "Not assessed"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Governance Path</Label>
                  <Badge variant="outline">
                    {selectedInitiative.governancePath || "Not determined"}
                  </Badge>
                </div>
              </div>

              {/* Problem Statement */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">Problem Statement</Label>
                <p className="text-gray-900 mt-1">{selectedInitiative.problemStatement || "Not provided"}</p>
              </div>

              {/* AI Approach */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">AI Approach</Label>
                <p className="text-gray-900 mt-1">{selectedInitiative.aiApproach || "Not provided"}</p>
              </div>

              {/* Status Update */}
              <div className="space-y-4 border-t pt-4">
                <div>
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-700">Update Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger id="status" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under-review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">Admin Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add internal notes about this initiative..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 border-t pt-4">
                <Button
                  onClick={handleStatusUpdate}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1"
                >
                  {updateStatusMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleEmailSubmitter(selectedInitiative)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Submitter
                </Button>

                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteInitiativeMutation.isPending}
                >
                  {deleteInitiativeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
