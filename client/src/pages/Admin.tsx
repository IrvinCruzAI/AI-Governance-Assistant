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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { getLoginUrl } from "@/const";
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
  Calendar,
  Info,
  Target,
  X,
  Wrench,
  Settings,
  Zap,
  ThumbsUp
} from "lucide-react";
import { toast } from "sonner";
import { PriorityRubricModal } from "@/components/PriorityRubricModal";
import { SettingsView } from "@/components/SettingsView";
import { BrowseView } from "@/components/BrowseView";

// Get priority label from database priorityQuadrant field
function getPriorityLabel(priorityQuadrant?: string | null): { label: string; color: string } {
  if (!priorityQuadrant) return { label: "Not Evaluated", color: "bg-gray-100 text-gray-600" };
  
  switch (priorityQuadrant) {
    case 'quick-win':
      return { label: "Quick Win", color: "bg-green-100 text-green-800" };
    case 'strategic-bet':
      return { label: "Strategic Bet", color: "bg-purple-100 text-purple-800" };
    case 'reconsider':
      return { label: "Reconsider", color: "bg-red-100 text-red-800" };
    case 'nice-to-have':
      return { label: "Nice to Have", color: "bg-yellow-100 text-yellow-800" };
    default:
      return { label: "Not Evaluated", color: "bg-gray-100 text-gray-600" };
  }
}

// Old complex scoring functions removed - now using simplified 3-field system

// Old PRIORITY_RUBRIC removed - simplified to human-driven 3-field evaluation

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const [selectedInitiative, setSelectedInitiative] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [newStatus, setNewStatus] = useState<string>("");
  const [newRoadmapStatus, setNewRoadmapStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");

  
  // Simplified priority evaluation state (3 fields)
  const [impact, setImpact] = useState<string>(""); // high, medium, low
  const [effort, setEffort] = useState<string>(""); // high, medium, low
  const [evaluationNotes, setEvaluationNotes] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  
  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [initiativeToDelete, setInitiativeToDelete] = useState<any>(null);

  // Queries
  const { data: userInitiatives, isLoading: userLoading } = trpc.initiative.list.useQuery();
  const { data: allInitiatives, isLoading: adminLoading } = trpc.admin.getAllInitiatives.useQuery(
    { status: statusFilter === 'all' ? undefined : statusFilter as any },
    { enabled: user?.role === 'admin' }
  );
  const { data: browseInitiatives, isLoading: browseLoading } = trpc.initiative.listAllWithVotes.useQuery(
    undefined,
    { enabled: user?.role !== 'admin' }
  );
  const { data: analytics } = trpc.admin.getAnalytics.useQuery(undefined, {
    enabled: user?.role === 'admin'
  });

  // Mutations
  const updateStatusMutation = trpc.admin.updateStatus.useMutation();
  const updateRoadmapMutation = trpc.admin.updateRoadmapStatus.useMutation();
  const updatePriorityMutation = trpc.admin.updatePriorityEvaluation.useMutation();
  const deleteMutation = trpc.admin.deleteInitiative.useMutation();
  const utils = trpc.useUtils();

  // Redirect to login if not authenticated (must be before any conditional returns)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.info("Please sign in to access your dashboard");
      setLocation("/");
    }
  }, [loading, isAuthenticated, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  const handleStatusUpdate = async () => {
    if (!selectedInitiative || !newStatus) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: selectedInitiative.id,
        status: newStatus as any,
        adminNotes: adminNotes || undefined,
      });
      toast.success("Status updated successfully");
      utils.admin.getAllInitiatives.invalidate();
      setSelectedInitiative(null);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleRoadmapStatusUpdate = async () => {
    if (!selectedInitiative || !newRoadmapStatus) return;

    try {
      await updateRoadmapMutation.mutateAsync({
        id: selectedInitiative.id,
        roadmapStatus: newRoadmapStatus as any,
      });
      toast.success("Roadmap status updated successfully");
      utils.admin.getAllInitiatives.invalidate();
      setSelectedInitiative(null);
    } catch (error) {
      toast.error("Failed to update roadmap status");
    }
  };

  const handleDelete = async () => {
    if (!selectedInitiative) return;
    
    if (!confirm("Are you sure you want to delete this initiative? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: selectedInitiative.id });
      toast.success("Initiative deleted successfully");
      utils.admin.getAllInitiatives.invalidate();
      setSelectedInitiative(null);
    } catch (error) {
      toast.error("Failed to delete initiative");
    }
  };



  const openInitiativeDetail = (initiative: any) => {
    setSelectedInitiative(initiative);
    setNewStatus(initiative.status || "pending");
    setNewRoadmapStatus(initiative.roadmapStatus || "under-review");
    setAdminNotes(initiative.adminNotes || "");
    
    // Initialize simplified evaluation state
    setImpact(initiative.impact || "");
    setEffort(initiative.effort || "");
    setEvaluationNotes(initiative.evaluationNotes || "");
    setTags(initiative.tags ? JSON.parse(initiative.tags) : []);
  };

  // Add priority scoring to initiatives
  const initiatives = isAdmin ? allInitiatives : userInitiatives;
  const initiativesWithPriority = initiatives?.map(initiative => ({
    ...initiative,
    priority: getPriorityLabel(initiative.priorityQuadrant)
  })) || [];

  // Filter initiatives
  const filteredInitiatives = initiativesWithPriority
    .filter(initiative => {
      if (statusFilter !== "all" && initiative.status !== statusFilter) return false;
      if (riskFilter !== "all" && initiative.riskLevel !== riskFilter) return false;
      if (priorityFilter !== "all" && initiative.priority.label !== priorityFilter) return false;
      return true;
    })
    .sort((a, b) => {
      // Sort by impact/effort (Quick Win > Strategic Bet > Nice to Have > Reconsider > Not Evaluated)
      const order = { 'Quick Win': 4, 'Strategic Bet': 3, 'Nice to Have': 2, 'Reconsider': 1, 'Not Evaluated': 0 };
      return (order[b.priority.label as keyof typeof order] || 0) - (order[a.priority.label as keyof typeof order] || 0);
    });

  // Calculate additional analytics
  const quickWinCount = initiativesWithPriority.filter(i => i.priority.label === 'Quick Win').length;
  const strategicBetCount = initiativesWithPriority.filter(i => i.priority.label === 'Strategic Bet').length;
  const niceToHaveCount = initiativesWithPriority.filter(i => i.priority.label === 'Nice to Have').length;
  const reconsiderCount = initiativesWithPriority.filter(i => i.priority.label === 'Reconsider').length;
  const avgDaysPending = initiatives?.length 
    ? Math.round(initiatives.reduce((acc, i) => {
        const days = i.createdAt ? Math.floor((Date.now() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
        return acc + days;
      }, 0) / initiatives.length)
    : 0;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High": return "bg-red-100 text-red-700 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-100 text-gray-700";
    switch (status) {
      case "approved": return "bg-green-100 text-green-700";
      case "under-review": return "bg-blue-100 text-blue-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getRoadmapStatusColor = (status: string) => {
    switch (status) {
      case "deployed": return "bg-green-100 text-green-700";
      case "pilot": return "bg-orange-100 text-orange-700";
      case "development": return "bg-purple-100 text-purple-700";
      case "research": return "bg-blue-100 text-blue-700";
      case "on-hold": return "bg-yellow-100 text-yellow-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatRoadmapStatus = (status: string) => {
    const labels: Record<string, string> = {
      "under-review": "Under Review",
      "research": "Research",
      "development": "Development",
      "pilot": "Pilot",
      "deployed": "Deployed",
      "on-hold": "On Hold",
      "rejected": "Not Pursuing"
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
              {isAdmin ? 'Admin Dashboard' : 'My Submissions'}
            </h1>
            <p className="text-gray-600">
              {isAdmin 
                ? 'Review and manage AI initiative submissions' 
                : 'Track your AI initiative ideas and their progress'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            aria-label="Go back to home page"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {isAdmin ? (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="my">My Submissions</TabsTrigger>
              <TabsTrigger value="all">All Submissions</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* My Submissions Tab */}
            <TabsContent value="my" className="space-y-6">
              <UserSubmissionsView 
                initiatives={userInitiatives || []}
                loading={userLoading}
                onViewDetails={openInitiativeDetail}
              />
            </TabsContent>

            {/* All Submissions Tab (Admin Only) */}
            <TabsContent value="all" className="space-y-6">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="border-2 border-blue-200 bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{analytics?.totalSubmissions || 0}</p>
                    <p className="text-sm text-gray-600">Total Submissions</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-emerald-200 bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Zap className="h-8 w-8 text-emerald-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{quickWinCount}</p>
                    <p className="text-sm text-gray-600">Quick Wins</p>
                    <p className="text-xs text-gray-500 mt-1">High Impact, Low Effort</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{analytics?.byStatus?.pending || 0}</p>
                    <p className="text-sm text-gray-600">Pending Review</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{analytics?.byStatus?.approved || 0}</p>
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






              {/* Filters */}
              <Card className="border-2 border-gray-200 bg-white shadow-lg">
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
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">Opportunity</Label>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Opportunities</SelectItem>
                          <SelectItem value="Quick Win">Quick Win (High Impact, Low Effort)</SelectItem>
                          <SelectItem value="Strategic Bet">Strategic Bet (High Impact, High Effort)</SelectItem>
                          <SelectItem value="Nice to Have">Nice to Have (Low Impact, Low Effort)</SelectItem>
                          <SelectItem value="Reconsider">Reconsider (Low Impact, High Effort)</SelectItem>
                          <SelectItem value="Not Evaluated">Not Evaluated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setStatusFilter("all");
                          setRiskFilter("all");
                          setPriorityFilter("all");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Initiatives Table */}
              <Card className="border-2 border-gray-200 bg-white shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Showing {filteredInitiatives.length} of {initiativesWithPriority.length} initiatives</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {adminLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : filteredInitiatives.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No initiatives found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-blue-600 text-white">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Opportunity</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Submitter</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Area</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Risk</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Mission</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredInitiatives.map((initiative) => (
                            <tr key={initiative.id} className={`hover:bg-gray-50 ${!initiative.impact || !initiative.effort ? 'bg-gray-100/50 border-l-4 border-l-gray-400' : ''}`}>
                              <td className="px-4 py-4">
                                <Badge className={`${initiative.priority.color} text-xs`}>
                                  {initiative.priority.label}
                                </Badge>
                              </td>
                              <td className="px-4 py-4">
                                <p className="font-medium text-gray-900 line-clamp-2">{initiative.title || 'Untitled Initiative'}</p>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-600">{initiative.userEmail || ''}</td>
                              <td className="px-4 py-4 text-sm text-gray-600">{initiative.area}</td>
                              <td className="px-4 py-4">
                                {initiative.riskLevel && (
                                  <Badge variant="outline" className={getRiskColor(initiative.riskLevel)}>
                                    {initiative.riskLevel}
                                  </Badge>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                {initiative.missionAlignmentRating && (
                                  <Badge variant="outline" className="bg-teal-100 text-teal-700">
                                    {initiative.missionAlignmentRating}
                                  </Badge>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => openInitiativeDetail(initiative)}
                                    aria-label={`Review ${initiative.title || 'initiative'}`}
                                  >
                                    Review
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInitiativeToDelete(initiative);
                                      setDeleteConfirmOpen(true);
                                    }}
                                    aria-label={`Delete ${initiative.title || 'initiative'}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Roadmap Tab (Admin Only) */}
            <TabsContent value="roadmap" className="space-y-6">
              <RoadmapManagementView 
                initiatives={initiativesWithPriority}
                onViewDetails={openInitiativeDetail}
              />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <SettingsView user={user!} />
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="my" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="my">My Submissions</TabsTrigger>
              <TabsTrigger value="browse">Browse Ideas</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* My Submissions Tab */}
            <TabsContent value="my" className="space-y-6">
              <UserSubmissionsView 
                initiatives={userInitiatives || []}
                loading={userLoading}
                onViewDetails={openInitiativeDetail}
              />
            </TabsContent>

            {/* Browse Ideas Tab */}
            <TabsContent value="browse" className="space-y-6">
              <BrowseView 
                initiatives={browseInitiatives || []}
                loading={browseLoading}
                onViewDetails={openInitiativeDetail}
              />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <SettingsView user={user!} />
            </TabsContent>
          </Tabs>
        )}

        {/* Initiative Detail Dialog */}
        {/* Full-Screen Modal */}
        {selectedInitiative && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-[1400px] h-[90vh] flex flex-col">
              {/* Fixed Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b bg-gradient-to-r from-blue-50 to-white">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedInitiative.title || 'Untitled Initiative'}
                  </h2>
                  <p className="text-sm text-gray-600">Review and manage this AI initiative submission</p>
                </div>
                <button
                  onClick={() => setSelectedInitiative(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              {/* Body: Content + Actions */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Column - Initiative Content (65%) */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
                  {/* Opportunity Classification - Only for admins */}
                  {isAdmin && selectedInitiative.impact && selectedInitiative.effort && (
                    <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl p-6 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-100 mb-1">Opportunity Classification</p>
                          <Badge className="bg-white text-blue-600 border-white/30 text-2xl px-6 py-3 font-bold">
                            {getPriorityLabel(selectedInitiative.priorityQuadrant).label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Metadata Section */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Initiative Details</h3>
                    <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-600">Submitter</Label>
                      <p className="text-base text-gray-900">{selectedInitiative.userEmail || selectedInitiative.email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-600">Role</Label>
                      <p className="text-base text-gray-900">{selectedInitiative.userRole}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-600">Area</Label>
                      <p className="text-base text-gray-900">{selectedInitiative.area}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-600">Governance Path</Label>
                      {selectedInitiative.governancePath && (
                        <Badge variant="outline" className="text-sm">
                          {selectedInitiative.governancePath}
                        </Badge>
                      )}
                    </div>
                    </div>

                    {/* Risk & Mission Badges */}
                    <div className="flex gap-6 items-center flex-wrap mt-6 pt-6 border-t border-gray-200">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-600">Risk Level</Label>
                      {selectedInitiative.riskLevel && (
                        <Badge variant="outline" className={`${getRiskColor(selectedInitiative.riskLevel)} text-sm px-3 py-1`}>
                          {selectedInitiative.riskLevel}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-600">Mission Alignment</Label>
                      {selectedInitiative.missionAlignmentRating && (
                        <Badge variant="outline" className="bg-teal-100 text-teal-700 text-sm px-3 py-1">
                          {selectedInitiative.missionAlignmentRating}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-600">Community Votes</Label>
                      <p className="text-lg font-semibold text-gray-900">👍 {selectedInitiative.voteCount || 0}</p>
                    </div>
                    </div>
                  </div>

                  {/* Problem Statement */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Problem Statement</h3>
                    <div 
                      className="text-base text-gray-700 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedInitiative.problemStatement || '' }}
                    />
                  </div>

                  {/* AI Approach */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Proposed AI Solution</h3>
                    <div 
                      className="text-base text-gray-700 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedInitiative.aiApproach || 'No proposed solution provided.' }}
                    />
                  </div>
                </div>

                {/* Right Column - Action Panel (35%) */}
                <div className="w-[450px] border-l border-gray-200 bg-gray-50 px-6 py-6 overflow-y-auto">
                  {isAdmin ? (
                    // Admin Actions
                    <div className="space-y-6 sticky top-0">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
                      </div>

                      {/* Current Status Overview */}
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h4 className="font-semibold text-gray-700 mb-3 text-sm">Current Status</h4>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-gray-600">Review Status</Label>
                            <div className="mt-1">
                              <Badge variant="outline" className={`${getStatusColor(selectedInitiative.status)}`}>
                                {selectedInitiative.status || 'pending'}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Roadmap Stage</Label>
                            <div className="mt-1">
                              <Badge variant="outline" className="bg-purple-100 text-purple-700">
                                {selectedInitiative.roadmapStatus || 'under-review'}
                              </Badge>
                            </div>
                          </div>
                          {/* Audit Trail */}
                          {selectedInitiative.evaluatedBy && selectedInitiative.evaluatedAt && (
                            <div className="pt-3 border-t border-blue-200">
                              <Label className="text-xs text-gray-600">Evaluation History</Label>
                              <p className="text-xs text-gray-700 mt-1">
                                Evaluated by <span className="font-semibold">{selectedInitiative.evaluatedBy}</span>
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(selectedInitiative.evaluatedAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Update Review Status */}
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-semibold text-gray-700">
                          Update Review Status
                        </Label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger id="status">
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

                      {/* Update Roadmap Status */}
                      <div className="space-y-2">
                        <Label htmlFor="roadmap-status" className="text-sm font-semibold text-gray-700">
                          Update Roadmap Stage
                        </Label>
                        <Select value={newRoadmapStatus} onValueChange={setNewRoadmapStatus}>
                          <SelectTrigger id="roadmap-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under-review">Under Review</SelectItem>
                            <SelectItem value="research">Research</SelectItem>
                            <SelectItem value="development">Development</SelectItem>
                            <SelectItem value="pilot">Pilot</SelectItem>
                            <SelectItem value="deployed">Deployed</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                            <SelectItem value="rejected">Not Pursuing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Opportunity Cost Evaluation */}
                      {/* Simplified 3-Field Evaluation */}
                      <div className="p-4 bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg border-2 border-teal-200 space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Target className="h-4 w-4 text-teal-600" />
                            Opportunity Evaluation
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">Assess impact and effort to prioritize</p>
                        </div>

                        {/* Impact */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-semibold text-gray-700">Impact (Value to Organization)</Label>
                          <Select value={impact} onValueChange={setImpact}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select impact..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High - Major benefit, affects many people</SelectItem>
                              <SelectItem value="medium">Medium - Moderate benefit</SelectItem>
                              <SelectItem value="low">Low - Minor benefit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Effort */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-semibold text-gray-700">Effort (Complexity & Resources)</Label>
                          <Select value={effort} onValueChange={setEffort}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select effort..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low - Quick to implement, few resources</SelectItem>
                              <SelectItem value="medium">Medium - Moderate time and resources</SelectItem>
                              <SelectItem value="high">High - Complex, requires significant investment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Notes */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-semibold text-gray-700">Evaluation Notes</Label>
                          <Textarea
                            value={evaluationNotes}
                            onChange={(e) => setEvaluationNotes(e.target.value)}
                            placeholder="Add notes about this evaluation..."
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 pt-4 border-t">
                        {/* Save & Next - for batch evaluation */}
                        <Button 
                          onClick={async () => {
                            try {
                              // Validate: Require both Impact AND Effort if evaluating
                              if ((impact || effort) && (!impact || !effort)) {
                                toast.error("Both Impact and Effort are required for evaluation");
                                return;
                              }
                              
                              // Save simplified priority evaluation (3 fields)
                              if (impact && effort) {
                                await updatePriorityMutation.mutateAsync({
                                  id: selectedInitiative.id,
                                  impact: impact as 'high' | 'medium' | 'low',
                                  effort: effort as 'high' | 'medium' | 'low',
                                  evaluationNotes: evaluationNotes || undefined,
                                  tags: tags.length > 0 ? tags : undefined,
                                });
                              }
                              
                              // Save status
                              await handleStatusUpdate();
                              
                              // Save roadmap if changed
                              if (newRoadmapStatus !== selectedInitiative.roadmapStatus) {
                                await handleRoadmapStatusUpdate();
                              }
                              
                              // Find next unevaluated initiative
                              const nextUnevaluated = filteredInitiatives.find(
                                (init) => init.id !== selectedInitiative.id && (!init.impact || !init.effort)
                              );
                              
                              if (nextUnevaluated) {
                                toast.success("Saved! Opening next initiative...");
                                openInitiativeDetail(nextUnevaluated);
                              } else {
                                toast.success("All updates saved! No more unevaluated initiatives.");
                                setSelectedInitiative(null);
                              }
                            } catch (error) {
                              toast.error("Failed to save some updates");
                            }
                          }}
                          className="w-full bg-teal-600 hover:bg-teal-700"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Save & Next
                        </Button>
                        
                        {/* Regular Save */}
                        <Button 
                          onClick={async () => {
                            try {
                              // Validate: Require both Impact AND Effort if evaluating
                              if ((impact || effort) && (!impact || !effort)) {
                                toast.error("Both Impact and Effort are required for evaluation");
                                return;
                              }
                              
                              // Save simplified priority evaluation (3 fields)
                              if (impact && effort) {
                                await updatePriorityMutation.mutateAsync({
                                  id: selectedInitiative.id,
                                  impact: impact as 'high' | 'medium' | 'low',
                                  effort: effort as 'high' | 'medium' | 'low',
                                  evaluationNotes: evaluationNotes || undefined,
                                  tags: tags.length > 0 ? tags : undefined,
                                });
                              }
                              
                              // Save status
                              await handleStatusUpdate();
                              
                              // Save roadmap if changed
                              if (newRoadmapStatus !== selectedInitiative.roadmapStatus) {
                                await handleRoadmapStatusUpdate();
                              }
                              
                              toast.success("All updates saved successfully");
                              setSelectedInitiative(null);
                            } catch (error) {
                              toast.error("Failed to save some updates");
                            }
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Save & Close
                        </Button>
                        <div className="grid grid-cols-2 gap-2">

                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Regular User - Status Tracking
                    <div className="space-y-6 sticky top-0">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Status</h3>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">Review Status</Label>
                          <div className="mt-2">
                            <Badge variant="outline" className={`${getStatusColor(selectedInitiative.status)} text-base px-3 py-1`}>
                              {selectedInitiative.status || 'pending'}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">Roadmap Stage</Label>
                          <div className="mt-2">
                            <Badge variant="outline" className="bg-purple-100 text-purple-700 text-base px-3 py-1">
                              {selectedInitiative.roadmapStatus || 'under-review'}
                            </Badge>
                          </div>
                        </div>
                        {selectedInitiative.adminNotes && (
                          <div>
                            <Label className="text-sm font-semibold text-gray-700">Feedback from Team</Label>
                            <p className="mt-2 text-sm text-gray-700 bg-white p-3 rounded border">
                              {selectedInitiative.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
                        <Label className="text-sm font-semibold text-gray-700">Community Support</Label>
                        <p className="text-3xl font-bold text-gray-900 mt-2">👍 {selectedInitiative.voteCount || 0}</p>
                        <p className="text-xs text-gray-600 mt-1">colleagues voted for this idea</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Initiative</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{initiativeToDelete?.title || 'this initiative'}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setInitiativeToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!initiativeToDelete) return;
                try {
                  await deleteMutation.mutateAsync({ id: initiativeToDelete.id });
                  toast.success("Initiative deleted successfully");
                  utils.admin.getAllInitiatives.invalidate();
                  setDeleteConfirmOpen(false);
                  setInitiativeToDelete(null);
                } catch (error) {
                  toast.error("Failed to delete initiative");
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// User Submissions Component
function UserSubmissionsView({ 
  initiatives, 
  loading,
  onViewDetails 
}: { 
  initiatives: any[]; 
  loading: boolean;
  onViewDetails: (initiative: any) => void;
}) {
  const getRoadmapStatusColor = (status: string) => {
    switch (status) {
      case "deployed": return "bg-green-100 text-green-700";
      case "pilot": return "bg-orange-100 text-orange-700";
      case "development": return "bg-purple-100 text-purple-700";
      case "research": return "bg-blue-100 text-blue-700";
      case "on-hold": return "bg-yellow-100 text-yellow-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatRoadmapStatus = (status: string) => {
    const labels: Record<string, string> = {
      "under-review": "Under Review",
      "research": "Research",
      "development": "Development",
      "pilot": "Pilot",
      "deployed": "Deployed",
      "on-hold": "On Hold",
      "rejected": "Not Pursuing"
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (initiatives.length === 0) {
    return (
      <Card className="border-2 border-gray-200 bg-white shadow-lg">
        <CardContent className="p-12">
          <div className="text-center text-gray-500">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No submissions yet</h3>
            <p className="mb-6">You haven't submitted any AI initiative ideas yet.</p>
            <Button onClick={() => window.location.href = '/new'}>
              Submit Your First Idea
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {initiatives.map((initiative) => (
        <Card key={initiative.id} className="border-2 border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{initiative.title || 'Untitled Initiative'}</CardTitle>
            <div className="flex gap-2 flex-wrap mt-2">
              <Badge className={getRoadmapStatusColor(initiative.roadmapStatus || 'under-review')}>
                {formatRoadmapStatus(initiative.roadmapStatus || 'under-review')}
              </Badge>
              {initiative.riskLevel && (
                <Badge variant="outline">
                  {initiative.riskLevel} Risk
                </Badge>
              )}
              {initiative.voteCount !== undefined && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  {initiative.voteCount} {initiative.voteCount === 1 ? 'vote' : 'votes'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">Problem</p>
              <div 
                className="text-sm text-gray-600 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: initiative.problemStatement || '' }}
              />
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-xs text-gray-500">
                Submitted {new Date(initiative.createdAt).toLocaleDateString()}
              </div>
              <Button size="sm" onClick={() => onViewDetails(initiative)}>
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Roadmap Management Component
function RoadmapManagementView({
  initiatives,
  onViewDetails
}: {
  initiatives: any[];
  onViewDetails: (initiative: any) => void;
}) {
  const roadmapStages = [
    { key: 'under-review', label: 'Under Review', color: 'bg-gray-100' },
    { key: 'research', label: 'Research', color: 'bg-blue-100' },
    { key: 'development', label: 'Development', color: 'bg-purple-100' },
    { key: 'pilot', label: 'Pilot', color: 'bg-orange-100' },
    { key: 'deployed', label: 'Deployed', color: 'bg-green-100' },
    { key: 'on-hold', label: 'On Hold', color: 'bg-yellow-100' },
    { key: 'rejected', label: 'Not Pursuing', color: 'bg-red-100' }
  ];

  const initiativesByStage = roadmapStages.map(stage => ({
    ...stage,
    initiatives: initiatives.filter(i => (i.roadmapStatus || 'under-review') === stage.key)
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {initiativesByStage.map(stage => (
          <Card key={stage.key} className={`border-2 ${stage.color}`}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">{stage.label}</CardTitle>
              <p className="text-xs text-gray-600">{stage.initiatives.length} initiatives</p>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {stage.initiatives.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No initiatives in this stage</p>
              ) : (
                stage.initiatives.map(initiative => (
                  <div 
                    key={initiative.id}
                    className="p-3 bg-white rounded border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onViewDetails(initiative)}
                  >
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                      {initiative.title || 'Untitled Initiative'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{initiative.area}</span>
                      {initiative.riskLevel && (
                        <Badge variant="outline" className="text-xs">
                          {initiative.riskLevel}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
