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
  ThumbsUp,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { PrioritizationMatrix } from "@/components/PrioritizationMatrix";
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

  const handleExportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      
      // Prepare data for export
      const exportData = filteredInitiatives.map(initiative => ({
        'Title': initiative.title || 'Untitled',
        'Submitter': initiative.userEmail || 'Unknown',
        'Role': initiative.userRole || '',
        'Department/Area': initiative.area || '',
        'Status': initiative.status || 'pending',
        'Roadmap Stage': initiative.roadmapStatus || 'under-review',
        'Priority': initiative.priority.label,
        'Impact': initiative.impact || 'Not Evaluated',
        'Effort': initiative.effort || 'Not Evaluated',
        'Risk Level': initiative.riskLevel || 'Not Assessed',
        'Mission Alignment': initiative.missionAlignmentRating || 'Not Assessed',
        'Votes': 0, // Vote count not available in admin view
        'Submitted': new Date(initiative.createdAt).toLocaleDateString(),
        'Problem Statement': initiative.problemStatement?.replace(/<[^>]*>/g, '') || '',
        'Proposed Solution': initiative.aiApproach?.replace(/<[^>]*>/g, '') || ''
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 30 }, // Title
        { wch: 25 }, // Submitter
        { wch: 20 }, // Role
        { wch: 20 }, // Department
        { wch: 15 }, // Status
        { wch: 15 }, // Roadmap
        { wch: 15 }, // Priority
        { wch: 12 }, // Impact
        { wch: 12 }, // Effort
        { wch: 12 }, // Risk
        { wch: 12 }, // Mission
        { wch: 8 },  // Votes
        { wch: 12 }, // Submitted
        { wch: 50 }, // Problem
        { wch: 50 }  // Solution
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'AI Initiatives');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `TravelLeisure_AI_Initiatives_${timestamp}.xlsx`;

      // Download
      XLSX.writeFile(wb, filename);
      
      toast.success(`Exported ${filteredInitiatives.length} initiatives to Excel`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export to Excel');
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
            <TabsList className="grid !w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 !bg-transparent !p-0">
              <TabsTrigger value="my">My Submissions</TabsTrigger>
              <TabsTrigger value="all">All Submissions</TabsTrigger>
              <TabsTrigger value="matrix">Priority Matrix</TabsTrigger>
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

            {/* Priority Matrix Tab */}
            <TabsContent value="matrix" className="space-y-6">
              <PrioritizationMatrix 
                initiatives={initiatives || []} 
                onInitiativeClick={(id) => {
                  const initiative = initiatives?.find(i => i.id === id);
                  if (initiative) openInitiativeDetail(initiative);
                }}
              />
            </TabsContent>

            {/* All Submissions Tab (Admin Only) */}
            <TabsContent value="all" className="space-y-6">
              {/* Executive Summary Dashboard */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-teal-50 shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Executive Summary</CardTitle>
                  <p className="text-sm text-gray-600">Key metrics and strategic insights</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Engagement Metrics */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Engagement</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <span className="text-sm text-gray-600">Total Submissions</span>
                          </div>
                          <span className="text-2xl font-bold text-gray-900">{analytics?.totalSubmissions || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-purple-600" />
                            <span className="text-sm text-gray-600">Evaluated</span>
                          </div>
                          <span className="text-2xl font-bold text-gray-900">{initiativesWithPriority.filter(i => i.impact && i.effort).length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Priority Distribution */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Priority Distribution</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-emerald-600" />
                            <span className="text-sm text-gray-600">Quick Wins</span>
                          </div>
                          <span className="text-2xl font-bold text-emerald-600">{quickWinCount}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-purple-600" />
                            <span className="text-sm text-gray-600">Strategic Bets</span>
                          </div>
                          <span className="text-2xl font-bold text-purple-600">{strategicBetCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Review Status */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Review Status</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-600" />
                            <span className="text-sm text-gray-600">Pending Review</span>
                          </div>
                          <span className="text-2xl font-bold text-orange-600">{analytics?.byStatus?.pending || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-gray-600">Approved</span>
                          </div>
                          <span className="text-2xl font-bold text-green-600">{analytics?.byStatus?.approved || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600 mb-1">Approval Rate</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {analytics?.totalSubmissions ? Math.round((analytics.byStatus?.approved || 0) / analytics.totalSubmissions * 100) : 0}%
                        </p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
                        <p className="text-2xl font-bold text-teal-600">{avgDaysPending} days</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600 mb-1">High Impact Ideas</p>
                        <p className="text-2xl font-bold text-purple-600">{quickWinCount + strategicBetCount}</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600 mb-1">In Development</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          {initiativesWithPriority.filter(i => ['development', 'pilot', 'deployed'].includes(i.roadmapStatus || '')).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Old Analytics Cards - Removed */}
              <div className="hidden grid-cols-1 md:grid-cols-5 gap-4">
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






              {/* Export Button */}
              <div className="flex justify-end mb-4">
                <Button
                  onClick={handleExportToExcel}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
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

                    </div>

                    {/* AI Assessment Section */}
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">AI Assessment</h4>
                      </div>
                      
                      {/* Mission Alignment Card */}
                      {selectedInitiative.missionAlignmentRating && (
                        <div className="p-4 bg-gradient-to-br from-teal-50 to-green-50 rounded-lg border-2 border-teal-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Mission Alignment</Label>
                              <Badge className="mt-1 bg-teal-600 text-white">
                                {selectedInitiative.missionAlignmentRating}
                              </Badge>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-teal-600" />
                          </div>
                          {selectedInitiative.missionAlignmentReasoning && (
                            <p className="text-sm text-gray-700 leading-relaxed mt-3">
                              {selectedInitiative.missionAlignmentReasoning}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Risk Level Card */}
                      {selectedInitiative.riskLevel && (
                        <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Risk Level</Label>
                              <Badge className={`mt-1 ${getRiskColor(selectedInitiative.riskLevel)}`}>
                                {selectedInitiative.riskLevel}
                              </Badge>
                            </div>
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                          </div>

                          {selectedInitiative.riskReasoning && (
                            <p className="text-sm text-gray-700 leading-relaxed mt-3">
                              {selectedInitiative.riskReasoning}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Community Votes */}
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <ThumbsUp className="h-4 w-4 text-blue-600" />
                        <Label className="text-sm text-gray-600">Community Votes:</Label>
                        <span className="text-lg font-semibold text-gray-900">{selectedInitiative.voteCount || 0}</span>
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

                      {/* Prioritization Matrix */}
                      <div className="p-5 bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 rounded-xl border-2 border-purple-200 space-y-4 shadow-sm">
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Target className="h-5 w-5 text-purple-600" />
                            Prioritization Matrix
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">Evaluate impact and effort to determine priority</p>
                        </div>

                        {/* Impact */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">Impact (Value to Organization)</Label>
                          <Select value={impact} onValueChange={setImpact}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select impact..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">🔥 High - Transformative, affects many</SelectItem>
                              <SelectItem value="medium">⭐ Medium - Significant benefit</SelectItem>
                              <SelectItem value="low">💡 Low - Minor improvement</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Effort */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">Effort (Time & Resources)</Label>
                          <Select value={effort} onValueChange={setEffort}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select effort..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">⚡ Low - Weeks, minimal resources</SelectItem>
                              <SelectItem value="medium">🔧 Medium - Months, moderate investment</SelectItem>
                              <SelectItem value="high">🏗️ High - 6+ months, major investment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Priority Recommendation */}
                        {impact && effort && (
                          <div className={`p-4 rounded-lg border-2 ${
                            impact === 'high' && (effort === 'low' || effort === 'medium') ? 'bg-green-100 border-green-400' :
                            impact === 'high' && effort === 'high' ? 'bg-purple-100 border-purple-400' :
                            (impact === 'medium' || impact === 'low') && effort === 'low' ? 'bg-yellow-100 border-yellow-400' :
                            'bg-red-100 border-red-400'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              <Label className="text-xs font-semibold uppercase tracking-wide">Priority Recommendation</Label>
                            </div>
                            <p className="text-sm font-bold mt-2">
                              {impact === 'high' && (effort === 'low' || effort === 'medium') && '🎯 Quick Win - Prioritize Now!'}
                              {impact === 'high' && effort === 'high' && '🚀 Strategic Bet - Plan Carefully'}
                              {(impact === 'medium' || impact === 'low') && effort === 'low' && '💡 Nice to Have - Fill-in Work'}
                              {((impact === 'medium' || impact === 'low') && (effort === 'medium' || effort === 'high')) && '⚠️ Reconsider - Low ROI'}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">
                              {impact === 'high' && (effort === 'low' || effort === 'medium') && 'High return on investment. Execute immediately.'}
                              {impact === 'high' && effort === 'high' && 'Major initiative requiring substantial resources. Worth the investment—plan carefully.'}
                              {(impact === 'medium' || impact === 'low') && effort === 'low' && 'Low-hanging fruit. Good for filling capacity gaps when available.'}
                              {((impact === 'medium' || impact === 'low') && (effort === 'medium' || effort === 'high')) && 'Limited value for the effort required. Strongly reconsider or deprioritize.'}
                            </p>
                          </div>
                        )}

                        {/* Notes */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">Evaluation Notes</Label>
                          <Textarea
                            value={evaluationNotes}
                            onChange={(e) => setEvaluationNotes(e.target.value)}
                            placeholder="Add notes about this evaluation..."
                            rows={3}
                            className="bg-white"
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
