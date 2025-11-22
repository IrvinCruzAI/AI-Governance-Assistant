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
  X,
  Wrench,
  Settings,
  Zap
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PriorityRubricModal } from "@/components/PriorityRubricModal";

// Opportunity Cost Priority Scoring
function calculatePriorityScore(initiative: any): number {
  // If backend has pre-calculated scores, use them
  if (initiative.impactScore !== undefined && initiative.feasibilityScore !== undefined) {
    return (initiative.impactScore || 0) + (initiative.feasibilityScore || 0);
  }
  
  // Otherwise calculate from raw field values (for real-time preview)
  if (!initiative.impactScale && !initiative.feasibilityComplexity) {
    return 0; // Not evaluated
  }
  
  // Calculate Impact Score (0-100)
  let impactScore = 0;
  
  // Scale contribution (0-40 points)
  const scalePoints: Record<string, number> = {
    'large': 40,
    'medium': 25,
    'small': 10
  };
  impactScore += scalePoints[initiative.impactScale] || 0;
  
  // Benefit Type contribution (0-30 points)
  const benefitPoints: Record<string, number> = {
    'patient-safety': 30,
    'patient-outcomes': 25,
    'efficiency': 20,
    'cost-savings': 20,
    'patient-experience': 15
  };
  impactScore += benefitPoints[initiative.impactBenefitType] || 0;
  
  // Financial Return contribution (0-30 points)
  const financialPoints: Record<string, number> = {
    'high': 30,
    'some': 20,
    'minimal': 10
  };
  impactScore += financialPoints[initiative.impactFinancialReturn] || 0;
  
  // Calculate Feasibility Score (0-100, inverted so lower effort = higher score)
  let feasibilityScore = 100;
  
  // Complexity penalty (0-40 points deducted)
  const complexityPenalty: Record<string, number> = {
    'simple': 0,
    'moderate': 20,
    'complex': 40
  };
  feasibilityScore -= complexityPenalty[initiative.feasibilityComplexity] || 0;
  
  // Timeline penalty (0-30 points deducted)
  const timelinePenalty: Record<string, number> = {
    'quick': 0,
    'standard': 15,
    'long': 30
  };
  feasibilityScore -= timelinePenalty[initiative.feasibilityTimeline] || 0;
  
  // Dependencies penalty (0-30 points deducted)
  const dependenciesPenalty: Record<string, number> = {
    'ready': 0,
    'minor': 15,
    'major': 30
  };
  feasibilityScore -= dependenciesPenalty[initiative.feasibilityDependencies] || 0;
  
  return impactScore + feasibilityScore;
}

function getPriorityLabel(initiative: any): { label: string; color: string; action: string; quadrant: string } {
  // Use priorityQuadrant from database if available
  let quadrant = initiative.priorityQuadrant;
  
  // If no quadrant from database, calculate from raw field values (for real-time preview)
  if (!quadrant && initiative.impactScale && initiative.feasibilityComplexity) {
    // Calculate impact level (high if scale is large OR benefit is safety/outcomes)
    const highImpact = initiative.impactScale === 'large' || 
                       initiative.impactBenefitType === 'patient-safety' ||
                       initiative.impactBenefitType === 'patient-outcomes';
    
    // Calculate effort level (high if complex OR long timeline OR major dependencies)
    const highEffort = initiative.feasibilityComplexity === 'complex' ||
                      initiative.feasibilityTimeline === 'long' ||
                      initiative.feasibilityDependencies === 'major';
    
    // Determine quadrant based on impact/effort matrix
    if (highImpact && !highEffort) quadrant = 'quick-win';
    else if (highImpact && highEffort) quadrant = 'strategic-bet';
    else if (!highImpact && !highEffort) quadrant = 'nice-to-have';
    else if (!highImpact && highEffort) quadrant = 'reconsider';
  }
  
  quadrant = quadrant || 'not-evaluated';
  
  if (quadrant === 'quick-win') return { 
    label: 'Quick Win', 
    color: 'bg-green-600',
    action: 'High impact + Easy to do → Start now. Delivers value fast with minimal risk.',
    quadrant: 'quick-win'
  };
  
  if (quadrant === 'strategic-bet') return { 
    label: 'Strategic Bet', 
    color: 'bg-blue-600',
    action: 'High impact + Hard to do → Worth the investment. Plan carefully, big payoff.',
    quadrant: 'strategic-bet'
  };
  
  if (quadrant === 'nice-to-have') return { 
    label: 'Nice to Have', 
    color: 'bg-yellow-500',
    action: 'Low impact + Easy → Do when capacity allows. Fill-in work between big projects.',
    quadrant: 'nice-to-have'
  };
  
  if (quadrant === 'reconsider') return { 
    label: 'Reconsider', 
    color: 'bg-gray-500',
    action: 'Low impact + Hard → Probably not worth it. Focus resources elsewhere.',
    quadrant: 'reconsider'
  };
  
  // Default for initiatives without evaluation
  return { 
    label: 'Not Evaluated', 
    color: 'bg-gray-400',
    action: 'Complete opportunity cost evaluation to prioritize this initiative.',
    quadrant: 'not-evaluated'
  };
}

// Opportunity Cost Rubric for admins
const PRIORITY_RUBRIC = {
  title: 'Opportunity Cost Framework',
  description: 'Initiatives are prioritized based on potential return vs. implementation effort to help you invest resources strategically:',
  impactCriteria: [
    {
      name: 'Scale',
      explanation: 'How many people will this help? Larger impact = higher return.',
      scoring: 'Large (1000+ patients/100+ staff) | Medium (100-1000/10-100) | Small (<100)'
    },
    {
      name: 'Benefit Type',
      explanation: 'What does this improve? Patient safety gets highest priority.',
      scoring: 'Patient Safety > Patient Outcomes > Staff Efficiency > Cost Reduction > Experience'
    },
    {
      name: 'Financial Return',
      explanation: 'Does this save money or generate revenue?',
      scoring: 'High (Clear savings/revenue) | Some (Indirect) | Minimal (Quality focus)'
    }
  ],
  feasibilityCriteria: [
    {
      name: 'Complexity',
      explanation: 'How hard is this to build? Simpler = faster ROI.',
      scoring: 'Simple (Existing tools) | Moderate (Some custom work) | Complex (Custom AI/ML)'
    },
    {
      name: 'Timeline',
      explanation: 'How long until it\'s working? Faster = lower opportunity cost.',
      scoring: 'Quick (3-6 months) | Standard (6-12 months) | Long (12+ months)'
    },
    {
      name: 'Dependencies',
      explanation: 'What do we need first? Fewer blockers = easier to start.',
      scoring: 'Ready (No blockers) | Minor (Approval/prep) | Major (Infrastructure/budget)'
    }
  ],
  quadrants: [
    { label: 'Quick Win', meaning: 'High impact + Easy to do → Start now. These deliver value fast with minimal risk.' },
    { label: 'Strategic Bet', meaning: 'High impact + Hard to do → Worth the investment. Plan carefully, big payoff.' },
    { label: 'Nice to Have', meaning: 'Low impact + Easy → Do when capacity allows. Fill-in work between big projects.' },
    { label: 'Reconsider', meaning: 'Low impact + Hard → Probably not worth it. Focus resources elsewhere.' }
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
  const [showRubricModal, setShowRubricModal] = useState(false);
  
  // Priority evaluation state
  const [impactScale, setImpactScale] = useState<string>("");
  const [impactBenefitType, setImpactBenefitType] = useState<string>("");
  const [impactFinancialReturn, setImpactFinancialReturn] = useState<string>("");
  const [feasibilityComplexity, setFeasibilityComplexity] = useState<string>("");
  const [feasibilityTimeline, setFeasibilityTimeline] = useState<string>("");
  const [feasibilityDependencies, setFeasibilityDependencies] = useState<string>("");

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
  const updatePriorityMutation = trpc.admin.updatePriorityEvaluation.useMutation();
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
    
    // Initialize evaluation state from existing data (no defaults for unevaluated initiatives)
    setImpactScale(initiative.impactScale || "");
    setImpactBenefitType(initiative.impactBenefitType || "");
    setImpactFinancialReturn(initiative.impactFinancialReturn || "");
    setFeasibilityComplexity(initiative.feasibilityComplexity || "");
    setFeasibilityTimeline(initiative.feasibilityTimeline || "");
    setFeasibilityDependencies(initiative.feasibilityDependencies || "");
  };

  // Add priority scoring to initiatives
  const initiatives = isAdmin ? allInitiatives : userInitiatives;
  const initiativesWithPriority = initiatives?.map(initiative => ({
    ...initiative,
    priorityScore: calculatePriorityScore(initiative),
    priority: getPriorityLabel(initiative)
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

              {/* Priority Rubric Info Button */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRubricModal(true)}
                  className="gap-2"
                >
                  <Info className="h-4 w-4" />
                  Show Priority Rubric
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
                  <CardContent className="space-y-6">
                    {/* Impact Criteria */}
                    <div>
                      <h4 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Impact & Value Assessment
                      </h4>
                      <div className="space-y-3">
                        {PRIORITY_RUBRIC.impactCriteria.map((criterion: any, idx: number) => (
                          <div key={idx} className="bg-teal-50 p-3 rounded-lg border border-teal-200">
                            <h5 className="font-semibold text-gray-900 text-sm">{criterion.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">{criterion.explanation}</p>
                            <p className="text-xs text-gray-500 font-mono mt-2">{criterion.scoring}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Feasibility Criteria */}
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Feasibility Assessment
                      </h4>
                      <div className="space-y-3">
                        {PRIORITY_RUBRIC.feasibilityCriteria.map((criterion: any, idx: number) => (
                          <div key={idx} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <h5 className="font-semibold text-gray-900 text-sm">{criterion.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">{criterion.explanation}</p>
                            <p className="text-xs text-gray-500 font-mono mt-2">{criterion.scoring}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Priority Quadrants */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Priority Quadrants</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {PRIORITY_RUBRIC.quadrants.map((quadrant: any, idx: number) => (
                          <div key={idx} className="bg-white p-4 rounded-lg border-2 border-gray-300">
                            <p className="font-semibold text-sm text-gray-900 mb-1">{quadrant.label}</p>
                            <p className="text-xs text-gray-600">{quadrant.meaning}</p>
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
                            <tr key={initiative.id} className={`hover:bg-gray-50 ${initiative.priorityScore === 0 ? 'bg-gray-100/50 border-l-4 border-l-gray-400' : ''}`}>
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

                      {/* Opportunity Cost Evaluation */}
                      <div className="p-4 bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg border-2 border-teal-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              <Target className="h-4 w-4 text-teal-600" />
                              Priority Evaluation
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">Assess impact and feasibility to prioritize this initiative</p>
                          </div>
                          {/* Real-time Score Preview */}
                          {(() => {
                            const previewInitiative = {
                              impactScale,
                              impactBenefitType,
                              impactFinancialReturn,
                              feasibilityComplexity,
                              feasibilityTimeline,
                              feasibilityDependencies
                            };
                            const previewScore = calculatePriorityScore(previewInitiative);
                            const previewPriority = getPriorityLabel(previewInitiative);
                            return (
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">{previewScore}</div>
                                <div className={`text-xs font-semibold px-2 py-1 rounded ${previewPriority.color}`}>
                                  {previewPriority.label}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        
                        {/* Impact Assessment */}
                        <div className="space-y-3 mb-4 pb-4 border-b border-teal-200">
                          <p className="text-xs font-semibold text-teal-900">IMPACT & VALUE</p>
                          
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-700">Scale (How many people helped?)</Label>
                            <Select value={impactScale} onValueChange={setImpactScale}>
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Select scale..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="large">Large (1000+ patients or 100+ staff)</SelectItem>
                                <SelectItem value="medium">Medium (100-1000 patients or 10-100 staff)</SelectItem>
                                <SelectItem value="small">Small (Under 100 people)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-700">Benefit Type</Label>
                            <Select value={impactBenefitType} onValueChange={setImpactBenefitType}>
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Select benefit type..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="patient-safety">Patient Safety (highest priority)</SelectItem>
                                <SelectItem value="patient-outcomes">Patient Outcomes</SelectItem>
                                <SelectItem value="staff-efficiency">Staff Efficiency</SelectItem>
                                <SelectItem value="cost-reduction">Cost Reduction</SelectItem>
                                <SelectItem value="experience">Experience Improvement</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-700">Financial Return</Label>
                            <Select value={impactFinancialReturn} onValueChange={setImpactFinancialReturn}>
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Select financial return..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High (Clear cost savings/revenue)</SelectItem>
                                <SelectItem value="some">Some (Indirect savings)</SelectItem>
                                <SelectItem value="minimal">Minimal (Quality/experience focus)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Feasibility Assessment */}
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-blue-900">FEASIBILITY</p>
                          
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-700">Complexity (How hard to build?)</Label>
                            <Select value={feasibilityComplexity} onValueChange={setFeasibilityComplexity}>
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Select complexity..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="simple">Simple (Existing tools, basic automation)</SelectItem>
                                <SelectItem value="moderate">Moderate (Some custom work)</SelectItem>
                                <SelectItem value="complex">Complex (Custom AI/ML, major dev)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-700">Timeline (How long until working?)</Label>
                            <Select value={feasibilityTimeline} onValueChange={setFeasibilityTimeline}>
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Select timeline..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="quick">Quick (3-6 months)</SelectItem>
                                <SelectItem value="standard">Standard (6-12 months)</SelectItem>
                                <SelectItem value="long">Long (12+ months)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-700">Dependencies (What's needed first?)</Label>
                            <Select value={feasibilityDependencies} onValueChange={setFeasibilityDependencies}>
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Select dependencies..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ready">Ready Now (No blockers)</SelectItem>
                                <SelectItem value="minor">Minor (Approval or small prep)</SelectItem>
                                <SelectItem value="major">Major (Infrastructure/budget/other projects)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Admin Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                          Internal Notes & Tags
                        </Label>
                        <Textarea
                          id="notes"
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Add notes or tags (e.g., 'Strategic Priority', 'Regulatory', 'High Change Impact')..."
                          rows={3}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 pt-4 border-t">
                        <Button 
                          onClick={async () => {
                            try {
                              // Save priority evaluation
                              await updatePriorityMutation.mutateAsync({
                                id: selectedInitiative.id,
                                impactScale: impactScale as any,
                                impactBenefitType: impactBenefitType as any,
                                impactFinancialReturn: impactFinancialReturn as any,
                                feasibilityComplexity: feasibilityComplexity as any,
                                feasibilityTimeline: feasibilityTimeline as any,
                                feasibilityDependencies: feasibilityDependencies as any,
                              });
                              
                              // Save status
                              await handleStatusUpdate();
                              
                              // Save roadmap if changed
                              if (newRoadmapStatus !== selectedInitiative.roadmapStatus) {
                                await handleRoadmapStatusUpdate();
                              }
                              
                              toast.success("All updates saved successfully");
                            } catch (error) {
                              toast.error("Failed to save some updates");
                            }
                          }}
                          className="w-full"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Save All Updates
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

      {/* Priority Rubric Modal */}
      <PriorityRubricModal 
        open={showRubricModal} 
        onOpenChange={setShowRubricModal} 
      />
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
