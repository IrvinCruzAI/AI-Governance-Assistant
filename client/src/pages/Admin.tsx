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
  Shield
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    setLocation("/");
    return null;
  }

  const filteredInitiatives = initiatives?.filter(initiative => {
    if (statusFilter !== "all" && initiative.status !== statusFilter) return false;
    if (riskFilter !== "all" && initiative.riskLevel !== riskFilter) return false;
    return true;
  }) || [];

  const handleStatusUpdate = () => {
    if (!selectedInitiative || !newStatus) return;
    
    updateStatusMutation.mutate({
      id: selectedInitiative.id,
      status: newStatus as any,
      adminNotes: adminNotes || undefined,
    });
  };

  const openReviewDialog = (initiative: any) => {
    setSelectedInitiative(initiative);
    setNewStatus(initiative.status || "pending");
    setAdminNotes(initiative.adminNotes || "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100">
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

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalSubmissions}</p>
              <p className="text-sm text-gray-600">Total Submissions</p>
            </div>

            <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics.byRiskLevel.High}</p>
              <p className="text-sm text-gray-600">High Risk Initiatives</p>
            </div>

            <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics.byStatus.pending}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>

            <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics.byStatus.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
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

            <div className="flex-1 min-w-[200px]">
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

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {filteredInitiatives.length} of {initiatives?.length || 0} initiatives
              </div>
            </div>
          </div>
        </div>

        {/* Initiatives Table */}
        <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            {initiativesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredInitiatives.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-teal-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Submitter</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Area</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Risk</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Mission</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Submitted</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInitiatives.map((initiative) => (
                    <tr key={initiative.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 line-clamp-2">
                          {initiative.title || "Untitled"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        User #{initiative.userId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {initiative.area || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {initiative.riskLevel ? (
                          <Badge variant={
                            initiative.riskLevel === 'High' ? 'destructive' :
                            initiative.riskLevel === 'Medium' ? 'default' :
                            'secondary'
                          }>
                            {initiative.riskLevel}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {initiative.missionAlignmentRating ? (
                          <Badge variant={
                            initiative.missionAlignmentRating === 'High' ? 'default' :
                            initiative.missionAlignmentRating === 'Medium' ? 'secondary' :
                            'outline'
                          }>
                            {initiative.missionAlignmentRating}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          initiative.status === 'approved' ? 'default' :
                          initiative.status === 'rejected' ? 'destructive' :
                          initiative.status === 'under-review' ? 'secondary' :
                          'outline'
                        }>
                          {initiative.status || 'pending'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(initiative.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReviewDialog(initiative)}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No initiatives found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedInitiative} onOpenChange={(open) => !open && setSelectedInitiative(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Review Initiative</DialogTitle>
            <DialogDescription>
              Update status and add notes for this submission
            </DialogDescription>
          </DialogHeader>

          {selectedInitiative && (
            <div className="space-y-6">
              {/* Initiative Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Title</h3>
                  <p className="text-gray-700">{selectedInitiative.title}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Risk Level</h3>
                    <Badge variant={
                      selectedInitiative.riskLevel === 'High' ? 'destructive' :
                      selectedInitiative.riskLevel === 'Medium' ? 'default' :
                      'secondary'
                    }>
                      {selectedInitiative.riskLevel || "Not assessed"}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Mission Alignment</h3>
                    <Badge variant="default">
                      {selectedInitiative.missionAlignmentRating || "Not assessed"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Problem Statement</h3>
                  <p className="text-gray-700 text-sm">{selectedInitiative.problemStatement || "—"}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">AI Approach</h3>
                  <p className="text-gray-700 text-sm">{selectedInitiative.aiApproach || "—"}</p>
                </div>

                {selectedInitiative.governancePath && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Recommended Governance</h3>
                    <p className="text-gray-700">{selectedInitiative.governancePath} Governance</p>
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div className="border-t pt-6 space-y-4">
                <div>
                  <Label htmlFor="status" className="font-semibold">Update Status</Label>
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
                  <Label htmlFor="notes" className="font-semibold">Admin Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes about your review decision..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedInitiative(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Status"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
