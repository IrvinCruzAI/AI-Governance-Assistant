import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle2, Info, Target } from "lucide-react";
import CommentThread from "@/components/CommentThread";
import { useLocation, useRoute } from "wouter";

export default function InitiativeDetail() {
  const [, params] = useRoute("/initiative/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const initiativeId = params?.id ? parseInt(params.id) : null;
  
  const { data: initiative, isLoading } = trpc.initiative.getById.useQuery(
    { id: initiativeId! },
    { enabled: !!initiativeId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-800" />
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
          <div className="container flex justify-between items-center py-4">
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">{APP_TITLE}</h1>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/browse")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Browse
            </Button>
          </div>
        </header>
        <div className="container py-12 text-center">
          <p className="text-gray-600">Initiative not found</p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (quadrant: string | null) => {
    switch (quadrant) {
      case "quick-win":
        return "bg-green-100 text-green-800 border-green-200";
      case "strategic-bet":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "nice-to-have":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "reconsider":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "deployed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-purple-100 text-purple-800";
      case "under-review":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="container flex justify-between items-center py-4">
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">{APP_TITLE}</h1>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/browse")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container py-8 max-w-6xl">
        {/* Title & Status */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {initiative.title || "Untitled Initiative"}
            </h2>
            <div className="flex gap-2 flex-shrink-0">
              {initiative.status && (
                <Badge className={`${getStatusColor(initiative.status)} px-3 py-1`}>
                  {initiative.status.replace("-", " ").toUpperCase()}
                </Badge>
              )}
              {initiative.priorityQuadrant && (
                <Badge className={`${getPriorityColor(initiative.priorityQuadrant)} px-3 py-1 border`}>
                  {initiative.priorityQuadrant.replace("-", " ").toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Submitted by {initiative.userRole || "Team Member"}</span>
            {initiative.area && <span>• {initiative.area.replace("-", " ")}</span>}
            {initiative.createdAt && (
              <span>• {new Date(initiative.createdAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content - Left 2 columns */}
          <div className="md:col-span-2 space-y-6">
            {/* Problem Statement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-gray-700" />
                  Problem Statement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: initiative.problemStatement || "No problem statement provided" }}
                />
              </CardContent>
            </Card>

            {/* AI Approach */}
            {initiative.aiApproach && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-gray-700" />
                    Proposed AI Solution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: initiative.aiApproach }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Workflow Analysis */}
            {(initiative.currentWorkflow || initiative.proposedWorkflow) && (
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {initiative.currentWorkflow && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Current Workflow</h4>
                      <div 
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: initiative.currentWorkflow }}
                      />
                    </div>
                  )}
                  {initiative.proposedWorkflow && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Proposed Workflow</h4>
                      <div 
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: initiative.proposedWorkflow }}
                      />
                    </div>
                  )}
                  {initiative.bottlenecksAddressed && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Bottlenecks Addressed</h4>
                      <p className="text-gray-700">{initiative.bottlenecksAddressed}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Measurable Outcomes */}
            {(initiative.primaryMetric || initiative.quantifiedGoal) && (
              <Card>
                <CardHeader>
                  <CardTitle>Measurable Outcomes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {initiative.primaryMetric && (
                    <div>
                      <span className="font-semibold text-gray-900">Primary Metric: </span>
                      <span className="text-gray-700">{initiative.primaryMetric}</span>
                    </div>
                  )}
                  {initiative.quantifiedGoal && (
                    <div>
                      <span className="font-semibold text-gray-900">Quantified Goal: </span>
                      <span className="text-gray-700">{initiative.quantifiedGoal}</span>
                    </div>
                  )}
                  {initiative.baselineMeasurement && (
                    <div>
                      <span className="font-semibold text-gray-900">Baseline: </span>
                      <span className="text-gray-700">{initiative.baselineMeasurement}</span>
                    </div>
                  )}
                  {initiative.successCriteria && (
                    <div>
                      <span className="font-semibold text-gray-900">Success Criteria: </span>
                      <span className="text-gray-700">{initiative.successCriteria}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* RAID View */}
            {(initiative.risks || initiative.assumptions || initiative.issues || initiative.dependencies) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-gray-700" />
                    RAID Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {initiative.risks && (
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2">Risks</h4>
                      <p className="text-gray-700">{initiative.risks}</p>
                    </div>
                  )}
                  {initiative.assumptions && (
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-2">Assumptions</h4>
                      <p className="text-gray-700">{initiative.assumptions}</p>
                    </div>
                  )}
                  {initiative.issues && (
                    <div>
                      <h4 className="font-semibold text-yellow-700 mb-2">Issues</h4>
                      <p className="text-gray-700">{initiative.issues}</p>
                    </div>
                  )}
                  {initiative.dependencies && (
                    <div>
                      <h4 className="font-semibold text-purple-700 mb-2">Dependencies</h4>
                      <p className="text-gray-700">{initiative.dependencies}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Right column */}
          <div className="space-y-6">
            {/* Operational Assessment */}
            {(initiative.effortScore !== null || initiative.returnScore !== null || initiative.riskScore !== null) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Operational Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {initiative.effortScore !== null && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Effort</span>
                        <span className="font-semibold">{initiative.effortScore}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gray-800 h-2 rounded-full" 
                          style={{ width: `${(initiative.effortScore / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {initiative.returnScore !== null && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Return</span>
                        <span className="font-semibold">{initiative.returnScore}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(initiative.returnScore / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {initiative.riskScore !== null && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Risk</span>
                        <span className="font-semibold">{initiative.riskScore}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${(initiative.riskScore / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {initiative.priorityScore !== null && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{initiative.priorityScore}</div>
                        <div className="text-sm text-gray-600">Priority Score</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Revenue Impact */}
            {(initiative.affectedEmployeeCount || initiative.projectedImprovement || initiative.totalRevenueImpact) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {initiative.affectedEmployeeCount && (
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{initiative.affectedEmployeeCount.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Affected Employees</div>
                    </div>
                  )}
                  {initiative.projectedImprovement && (
                    <div>
                      <div className="text-2xl font-bold text-green-700">{initiative.projectedImprovement}%</div>
                      <div className="text-sm text-gray-600">Projected Improvement</div>
                    </div>
                  )}
                  {initiative.totalRevenueImpact && (
                    <div>
                      <div className="text-2xl font-bold text-gray-900">${initiative.totalRevenueImpact.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Revenue Impact</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Strategic Alignment */}
            {(initiative.memberExperienceImpact || initiative.brandDifferentiation || initiative.operationalExcellence) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Strategic Alignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {initiative.memberExperienceImpact && (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-sm">Member Experience</div>
                        <div className="text-xs text-gray-600">{initiative.memberExperienceImpact}</div>
                      </div>
                    </div>
                  )}
                  {initiative.brandDifferentiation && (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-sm">Brand Differentiation</div>
                        <div className="text-xs text-gray-600">{initiative.brandDifferentiation}</div>
                      </div>
                    </div>
                  )}
                  {initiative.operationalExcellence && (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-sm">Operational Excellence</div>
                        <div className="text-xs text-gray-600">{initiative.operationalExcellence}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Evaluation Notes (Admin only) */}
            {user?.role === "admin" && initiative.evaluationNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Evaluation Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{initiative.evaluationNotes}</p>
                  {initiative.evaluatedBy && (
                    <p className="text-xs text-gray-500 mt-2">
                      Evaluated by {initiative.evaluatedBy}
                      {initiative.evaluatedAt && ` on ${new Date(initiative.evaluatedAt).toLocaleDateString()}`}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Comment Thread */}
          <div className="mt-12">
            <CommentThread initiativeId={initiative.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
