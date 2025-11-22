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
  X
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Priority scoring algorithm
function calculatePriorityScore(initiative: any): number {
  let score = 0;
  
  // Risk level (0-40 points) - Higher risk = higher priority for governance review
  if (initiative.riskLevel === 'High') score += 40;
  else if (initiative.riskLevel === 'Medium') score += 25;
  else if (initiative.riskLevel === 'Low') score += 10;
  
  // Mission alignment (0-30 points) - Higher alignment = higher strategic value
  if (initiative.missionAlignmentRating === 'High') score += 30;
  else if (initiative.missionAlignmentRating === 'Medium') score += 20;
  else if (initiative.missionAlignmentRating === 'Low') score += 10;
  
  // Time waiting (0-20 points) - Longer wait = higher priority to avoid delays
  const daysPending = initiative.createdAt 
    ? Math.floor((Date.now() - new Date(initiative.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  if (daysPending > 7) score += 20;
  else if (daysPending > 3) score += 10;
  
  // Review status (0-10 points) - Unreviewed items get priority
  if (initiative.status === 'pending') score += 10;
  else if (initiative.status === 'under-review') score += 5;
  
  return score;
}

function getPriorityLabel(score: number): { label: string; color: string; action: string } {
  // 70-100: Immediate Action Required
  if (score >= 70) return { 
    label: 'Immediate Action', 
    color: 'bg-red-600',
    action: 'High risk + high value + waiting. Review ASAP.'
  };
  // 50-69: Review This Week
  if (score >= 50) return { 
    label: 'Review This Week', 
    color: 'bg-orange-500',
    action: 'Strong candidate. Schedule review soon.'
  };
  // 30-49: Standard Queue
  if (score >= 30) return { 
    label: 'Standard Queue', 
    color: 'bg-blue-500',
    action: 'Normal priority. Review in regular workflow.'
  };
  // 0-29: Low Urgency
  return { 
    label: 'Low Urgency', 
    color: 'bg-gray-400',
    action: 'Low risk/alignment. Review when capacity allows.'
  };
}

// Rubric explanation for admins
const PRIORITY_RUBRIC = {
  title: 'Priority Scoring Rubric',
  description: 'Initiatives are automatically scored based on four criteria to help you focus on what matters most:',
  criteria: [
    {
      name: 'Risk Level',
      weight: '40 points',
      explanation: 'Higher risk initiatives (patient safety, data privacy, clinical decisions) require more thorough governance review and get higher priority.',
      scoring: 'High Risk = 40pts | Medium Risk = 25pts | Low Risk = 10pts'
    },
    {
      name: 'Mission Alignment',
      weight: '30 points',
      explanation: 'Initiatives strongly aligned with AdventHealth\'s healing ministry and whole-person care mission have higher strategic value.',
      scoring: 'High Alignment = 30pts | Medium = 20pts | Low = 10pts'
    },
    {
      name: 'Time Waiting',
      weight: '20 points',
      explanation: 'Ideas waiting longer get higher priority to ensure timely feedback and maintain staff engagement.',
      scoring: '>7 days = 20pts | 3-7 days = 10pts | <3 days = 0pts'
    },
    {
      name: 'Review Status',
      weight: '10 points',
      explanation: 'Unreviewed submissions get slight priority boost to ensure nothing falls through the cracks.',
      scoring: 'Pending = 10pts | Under Review = 5pts | Approved/Rejected = 0pts'
    }
  ],
  priorities: [
    { range: '70-100', label: 'Immediate Action', meaning: 'High-risk, high-value initiatives that have been waiting. Review within 24-48 hours.' },
    { range: '50-69', label: 'Review This Week', meaning: 'Strong candidates that should be reviewed within 3-5 business days.' },
    { range: '30-49', label: 'Standard Queue', meaning: 'Normal priority. Review in regular workflow (5-7 business days).' },
    { range: '0-29', label: 'Low Urgency', meaning: 'Lower risk/alignment. Review when team has capacity.' }
  ]
};

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
  const [showRubric, setShowRubric] = useState(false);

  // Queries
  const { data: userInitiatives, isLoading: userLoading } = trpc.initiative.list.useQuery();
  const { data: allInitiatives, isLoading: adminLoading } = trpc.admin.getAllInitiatives.useQuery(
    { status: statusFilter === 'all' ? undefined : statusFilter as any },
    { enabled: user?.role === 'admin' }
  );
  const { data: analytics } = trpc.admin.getAnalytics.useQuery(undefined, {
    enabled: user?.role === 'admin'
  });

  // Mutations
  const updateStatusMutation = trpc.admin.updateStatus.useMutation();
  const updateRoadmapMutation = trpc.admin.updateRoadmapStatus.useMutation();
  const deleteMutation = trpc.admin.deleteInitiative.useMutation();
  const utils = trpc.useUtils();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/");
    return null;
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

  const handleEmailSubmitter = (email: string | null) => {
    if (!email) return;
    window.location.href = `mailto:${email}?subject=Regarding your AI Initiative submission`;
  };

  const openInitiativeDetail = (initiative: any) => {
    setSelectedInitiative(initiative);
    setNewStatus(initiative.status || "pending");
    setNewRoadmapStatus(initiative.roadmapStatus || "under-review");
    setAdminNotes(initiative.adminNotes || "");
  };

  // Add priority scoring to initiatives
  const initiatives = isAdmin ? allInitiatives : userInitiatives;
  const initiativesWithPriority = initiatives?.map(initiative => ({
    ...initiative,
    priorityScore: calculatePriorityScore(initiative),
    priority: getPriorityLabel(calculatePriorityScore(initiative))
  })) || [];

  // Filter initiatives
  const filteredInitiatives = initiativesWithPriority
    .filter(initiative => {
      if (statusFilter !== "all" && initiative.status !== statusFilter) return false;
      if (riskFilter !== "all" && initiative.riskLevel !== riskFilter) return false;
      if (priorityFilter !== "all" && initiative.priority.label !== priorityFilter) return false;
      return true;
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  // Calculate additional analytics
  const immediateActionCount = initiativesWithPriority.filter(i => i.priority.label === 'Immediate Action').length;
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
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="my">My Submissions</TabsTrigger>
              <TabsTrigger value="all">All Submissions</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
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

                <Card className="border-2 border-red-200 bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{immediateActionCount}</p>
                    <p className="text-sm text-gray-600">Immediate Action</p>
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

              {/* Priority Rubric Info Button */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRubric(!showRubric)}
                  className="gap-2"
                >
                  <Info className="h-4 w-4" />
                  {showRubric ? 'Hide' : 'Show'} Priority Rubric
                </Button>
              </div>

              {/* Priority Rubric Panel */}
              {showRubric && (
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      {PRIORITY_RUBRIC.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{PRIORITY_RUBRIC.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Scoring Criteria */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {PRIORITY_RUBRIC.criteria.map((criterion, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg border border-blue-200">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">{criterion.name}</h4>
                            <Badge variant="outline" className="bg-blue-100 text-blue-700">
                              {criterion.weight}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{criterion.explanation}</p>
                          <p className="text-xs text-gray-500 font-mono">{criterion.scoring}</p>
                        </div>
                      ))}
                    </div>

                    {/* Priority Levels */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Priority Levels</h4>
                      <div className="space-y-2">
                        {PRIORITY_RUBRIC.priorities.map((priority, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 flex items-start gap-3">
                            <Badge className="mt-0.5">{priority.range}</Badge>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{priority.label}</p>
                              <p className="text-xs text-gray-600">{priority.meaning}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">Priority</Label>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="Immediate Action">Immediate Action</SelectItem>
                          <SelectItem value="Review This Week">Review This Week</SelectItem>
                          <SelectItem value="Standard Queue">Standard Queue</SelectItem>
                          <SelectItem value="Low Urgency">Low Urgency</SelectItem>
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
                            <th className="px-4 py-3 text-left text-sm font-semibold">Priority</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Submitter</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Area</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Risk</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Mission</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredInitiatives.map((initiative) => (
                            <tr key={initiative.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <div className="flex flex-col gap-1">
                                  <Badge className={`${initiative.priority.color} text-white text-xs`}>
                                    {initiative.priorityScore}
                                  </Badge>
                                  <span className="text-xs text-gray-600">{initiative.priority.label}</span>
                                </div>
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
                                <Badge className={getStatusColor(initiative.status)}>
                                  {initiative.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-4">
                                <Button
                                  size="sm"
                                  onClick={() => openInitiativeDetail(initiative)}
                                  aria-label={`Review ${initiative.title || 'initiative'}`}
                                >
                                  Review
                                </Button>
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
          </Tabs>
        ) : (
          <UserSubmissionsView 
            initiatives={userInitiatives || []}
            loading={userLoading}
            onViewDetails={openInitiativeDetail}
          />
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
                  {/* Priority Score - Only for admins */}
                  {isAdmin && (
                    <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl p-6 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-100 mb-1">Priority Score</p>
                          <p className="text-5xl font-bold">{selectedInitiative.priorityScore || 0}</p>
                        </div>
                        <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                          {selectedInitiative.priority?.label || 'Low Urgency'}
                        </Badge>
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
                    <p className="text-base text-gray-700 leading-relaxed">
                      {selectedInitiative.problemStatement}
                    </p>
                  </div>

                  {/* AI Approach */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Proposed AI Solution</h3>
                    <p className="text-base text-gray-700 leading-relaxed">
                      {selectedInitiative.aiApproach}
                    </p>
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

                      {/* Admin Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                          Internal Notes
                        </Label>
                        <Textarea
                          id="notes"
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Add internal notes..."
                          rows={4}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 pt-4 border-t">
                        <Button 
                          onClick={() => {
                            handleStatusUpdate();
                            if (newRoadmapStatus !== selectedInitiative.roadmapStatus) {
                              handleRoadmapStatusUpdate();
                            }
                          }}
                          className="w-full"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Save Updates
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleEmailSubmitter(selectedInitiative.userEmail || '')}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Button>
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
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">Problem</p>
              <p className="text-sm text-gray-600 line-clamp-3">{initiative.problemStatement}</p>
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
