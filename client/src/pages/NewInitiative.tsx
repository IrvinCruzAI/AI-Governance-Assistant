import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_TITLE } from "@/const";
import { RichTextEditor } from "@/components/RichTextEditor";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, ArrowLeft, ArrowRight, Loader2, Target, TrendingUp, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// Helper function to strip HTML tags and check if content is empty
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export default function NewInitiative() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Step 1: Initiative Basics
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userEmail, setUserEmail] = useState(user?.email || "");
  const [problemStatement, setProblemStatement] = useState("");
  const [aiApproach, setAiApproach] = useState("");

  // Step 2: Impact & Outcomes
  const [currentWorkflow, setCurrentWorkflow] = useState("");
  const [proposedWorkflow, setProposedWorkflow] = useState("");
  const [bottlenecksAddressed, setBottlenecksAddressed] = useState("");
  const [primaryMetric, setPrimaryMetric] = useState("");
  const [quantifiedGoal, setQuantifiedGoal] = useState("");
  const [effortScore, setEffortScore] = useState([5]);
  const [returnScore, setReturnScore] = useState([5]);
  const [riskScore, setRiskScore] = useState([5]);

  // Step 3: Strategic Alignment
  const [affectedEmployeeCount, setAffectedEmployeeCount] = useState("");
  const [projectedImprovement, setProjectedImprovement] = useState("");
  const [totalRevenueImpact, setTotalRevenueImpact] = useState("");
  const [memberExperienceImpact, setMemberExperienceImpact] = useState("");
  const [brandDifferentiation, setBrandDifferentiation] = useState("");
  const [operationalExcellence, setOperationalExcellence] = useState("");

  // Read URL parameters for prompt pre-fill
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prompt = params.get('prompt');
    const category = params.get('category');
    
    if (prompt) {
      setProblemStatement(`<p><strong>Inspired by:</strong> ${prompt}</p><p><br></p><p>Describe the specific operational challenge or opportunity this addresses:</p>`);
    }
    
    if (category) {
      const categoryToArea: Record<string, string> = {
        'Member Experience': 'member-experience',
        'Check-In & Reservations': 'reservations',
        'Guest Services': 'guest-services',
        'Operations': 'resort-operations',
        'Team Efficiency': 'operations'
      };
      setArea(categoryToArea[category] || '');
    }
  }, []);

  // Update email when user loads
  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, [user]);

  const createMutation = trpc.initiative.create.useMutation({
    onSuccess: async () => {
      setSubmitted(true);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit initiative");
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/");
      toast.info("Please sign in to submit an initiative");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!title.trim()) {
        toast.error("Please provide a title for your initiative");
        return false;
      }
      if (!stripHtml(problemStatement).trim()) {
        toast.error("Please describe the problem you're trying to solve");
        return false;
      }
      if (!area) {
        toast.error("Please select an area");
        return false;
      }
      if (!userRole.trim()) {
        toast.error("Please provide your role");
        return false;
      }
      if (!userEmail.trim()) {
        toast.error("Please provide your email");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(1)) return;

    createMutation.mutate({
      title,
      submitterEmail: userEmail,
      submitterRole: userRole,
      area,
      problemStatement,
      proposedSolution: aiApproach || undefined,
      // Step 2: Impact & Outcomes
      currentWorkflow: currentWorkflow || undefined,
      proposedWorkflow: proposedWorkflow || undefined,
      bottlenecksAddressed: bottlenecksAddressed || undefined,
      primaryMetric: (primaryMetric as 'time_savings' | 'cost_reduction' | 'risk_mitigation' | 'revenue_increase' | undefined) || undefined,
      quantifiedGoal: quantifiedGoal || undefined,
      effortScore: effortScore[0],
      returnScore: returnScore[0],
      riskScore: riskScore[0],
      // Step 3: Strategic Alignment
      affectedEmployeeCount: affectedEmployeeCount ? parseInt(affectedEmployeeCount) : undefined,
      projectedImprovement: projectedImprovement ? parseFloat(projectedImprovement) : undefined,
      totalRevenueImpact: totalRevenueImpact ? parseFloat(totalRevenueImpact) : undefined,
      memberExperienceImpact: (memberExperienceImpact as 'low' | 'medium' | 'high' | undefined) || undefined,
      brandDifferentiation: (brandDifferentiation as 'low' | 'medium' | 'high' | undefined) || undefined,
      operationalExcellence: (operationalExcellence as 'low' | 'medium' | 'high' | undefined) || undefined,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-800" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
          <div className="container flex justify-between items-center py-4">
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">{APP_TITLE}</h1>
          </div>
        </header>
        <div className="container max-w-2xl py-16">
          <Card className="text-center">
            <CardContent className="pt-12 pb-12">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Initiative Submitted Successfully!
              </h2>
              <p className="text-gray-600 mb-8">
                Your AI initiative has been submitted to the governance team for review.
                You'll receive updates on its progress through the platform.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setLocation("/browse")} variant="outline">
                  Browse Other Ideas
                </Button>
                <Button onClick={() => setLocation("/")} className="bg-gray-900 hover:bg-gray-800">
                  Return Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Initiative Basics", icon: Target },
    { number: 2, title: "Impact & Outcomes", icon: TrendingUp },
    { number: 3, title: "Strategic Alignment", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="container flex justify-between items-center py-4">
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">{APP_TITLE}</h1>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200">
        <div className="container max-w-4xl py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isActive
                          ? "bg-gray-900 border-gray-900 text-white"
                          : isCompleted
                          ? "bg-green-600 border-green-600 text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div
                        className={`text-xs sm:text-sm font-medium ${
                          isActive || isCompleted ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        <span className="hidden sm:inline">{step.title}</span>
                        <span className="sm:hidden">Step {step.number}</span>
                      </div>
                      <div className="text-xs text-gray-500 hidden sm:block">Step {step.number} of 3</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-4 ${
                        isCompleted ? "bg-green-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

         {/* Form */}
      <div className="container max-w-3xl py-4 px-4 sm:py-8">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Initiative Basics */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Initiative Basics
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Start by describing what you want to build and the problem it solves.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Initiative Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., AI-Powered Mobile Check-In System"
                    className="mt-2"
                    required
                  />
                </div>

                {/* Area */}
                <div>
                  <Label htmlFor="area">Business Area *</Label>
                  <Select value={area} onValueChange={setArea} required>
                    <SelectTrigger id="area" className="mt-2">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member-experience">Member Experience</SelectItem>
                      <SelectItem value="reservations">Check-In & Reservations</SelectItem>
                      <SelectItem value="guest-services">Guest Services</SelectItem>
                      <SelectItem value="resort-operations">Resort Operations</SelectItem>
                      <SelectItem value="revenue-management">Revenue Management</SelectItem>
                      <SelectItem value="loyalty-programs">Loyalty Programs</SelectItem>
                      <SelectItem value="operations">Operations & Efficiency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Role */}
                <div>
                  <Label htmlFor="role">Your Role *</Label>
                  <Input
                    id="role"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    placeholder="e.g., Resort Manager, Guest Services Director, Operations Analyst"
                    className="mt-2"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Your Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="your.email@travelandleisure.com"
                    className="mt-2"
                    required
                  />
                </div>

                {/* Problem Statement */}
                <div>
                  <Label htmlFor="problem">Problem Statement *</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    What operational challenge or opportunity does this address?
                  </p>
                  <RichTextEditor
                    value={problemStatement}
                    onChange={setProblemStatement}
                    placeholder="Describe the current challenge, inefficiency, or opportunity. Be specific about the impact on operations, members, or revenue."
                  />
                </div>

                {/* AI Approach */}
                <div>
                  <Label htmlFor="approach">Proposed AI Solution (Optional)</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    How would AI help solve this problem?
                  </p>
                  <RichTextEditor
                    value={aiApproach}
                    onChange={setAiApproach}
                    placeholder="Describe how AI technology could address this challenge. Include specific capabilities (e.g., natural language processing, predictive analytics, computer vision)."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Impact & Outcomes */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Impact & Outcomes
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Define how this initiative will improve operations and how you'll measure success.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Workflow Analysis */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Workflow Analysis</h3>
                  
                  <div>
                    <Label htmlFor="current-workflow">Current Workflow (Optional)</Label>
                    <Textarea
                      id="current-workflow"
                      value={currentWorkflow}
                      onChange={(e) => setCurrentWorkflow(e.target.value)}
                      placeholder="Describe the current process step-by-step"
                      className="mt-2 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="proposed-workflow">Proposed Workflow (Optional)</Label>
                    <Textarea
                      id="proposed-workflow"
                      value={proposedWorkflow}
                      onChange={(e) => setProposedWorkflow(e.target.value)}
                      placeholder="Describe how the process would work with AI"
                      className="mt-2 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bottlenecks">Bottlenecks Addressed (Optional)</Label>
                    <Textarea
                      id="bottlenecks"
                      value={bottlenecksAddressed}
                      onChange={(e) => setBottlenecksAddressed(e.target.value)}
                      placeholder="What specific bottlenecks or pain points will this eliminate?"
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Measurable Outcomes */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900">Measurable Outcomes</h3>
                  
                  <div>
                    <Label htmlFor="metric">Primary Metric (Optional)</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      What type of improvement are you measuring?
                    </p>
                    <Select value={primaryMetric} onValueChange={setPrimaryMetric}>
                      <SelectTrigger id="metric" className="mt-2">
                        <SelectValue placeholder="Select metric type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time_savings">Time Savings - Faster processes</SelectItem>
                        <SelectItem value="cost_reduction">Cost Reduction - Lower operational costs</SelectItem>
                        <SelectItem value="revenue_increase">Revenue Increase - Higher bookings or upsells</SelectItem>
                        <SelectItem value="risk_mitigation">Risk Mitigation - Reduced errors or compliance issues</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="goal">Quantified Goal (Optional)</Label>
                    <Input
                      id="goal"
                      value={quantifiedGoal}
                      onChange={(e) => setQuantifiedGoal(e.target.value)}
                      placeholder="e.g., Reduce check-in time from 15 minutes to 3 minutes"
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Operational Assessment */}
                <div className="space-y-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900">Operational Assessment</h3>
                  
                  <div>
                    <Label>Effort Score (1 = Low, 10 = High)</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      How much time, resources, and complexity is required?
                    </p>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={effortScore}
                        onValueChange={setEffortScore}
                        min={1}
                        max={10}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-2xl font-bold text-gray-900 w-12 text-center">
                        {effortScore[0]}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label>Return Score (1 = Low, 10 = High)</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      What's the expected operational and financial return?
                    </p>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={returnScore}
                        onValueChange={setReturnScore}
                        min={1}
                        max={10}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-2xl font-bold text-green-700 w-12 text-center">
                        {returnScore[0]}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label>Risk Score (1 = Low, 10 = High)</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      What's the risk of failure, technical challenges, or member impact?
                    </p>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={riskScore}
                        onValueChange={setRiskScore}
                        min={1}
                        max={10}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-2xl font-bold text-red-700 w-12 text-center">
                        {riskScore[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Strategic Alignment */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Strategic Alignment
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Connect this initiative to Travel + Leisure Co.'s strategic priorities.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Revenue Impact */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Revenue Impact</h3>
                  
                  <div>
                    <Label htmlFor="employees">Affected Employee Count (Optional)</Label>
                    <Input
                      id="employees"
                      type="number"
                      value={affectedEmployeeCount}
                      onChange={(e) => setAffectedEmployeeCount(e.target.value)}
                      placeholder="e.g., 500"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="improvement">Projected Efficiency Improvement % (Optional)</Label>
                    <Input
                      id="improvement"
                      type="number"
                      value={projectedImprovement}
                      onChange={(e) => setProjectedImprovement(e.target.value)}
                      placeholder="e.g., 25"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="revenue">Total Revenue Impact (Optional)</Label>
                    <Input
                      id="revenue"
                      type="number"
                      value={totalRevenueImpact}
                      onChange={(e) => setTotalRevenueImpact(e.target.value)}
                      placeholder="e.g., 500000"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Annual revenue impact in USD</p>
                  </div>
                </div>

                {/* Strategic Alignment */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900">Strategic Alignment</h3>
                  
                  <div>
                    <Label htmlFor="member-experience">Member Experience Impact (Optional)</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      How much does this enhance the vacation experience for our members?
                    </p>
                    <Select value={memberExperienceImpact} onValueChange={setMemberExperienceImpact}>
                      <SelectTrigger id="member-experience" className="mt-2">
                        <SelectValue placeholder="Select impact level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Minor convenience improvement</SelectItem>
                        <SelectItem value="medium">Medium - Noticeable experience enhancement</SelectItem>
                        <SelectItem value="high">High - Transformative member experience</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="brand">Brand Differentiation (Optional)</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      How much does this differentiate Travel + Leisure Co. in the market?
                    </p>
                    <Select value={brandDifferentiation} onValueChange={setBrandDifferentiation}>
                      <SelectTrigger id="brand" className="mt-2">
                        <SelectValue placeholder="Select differentiation level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Industry standard feature</SelectItem>
                        <SelectItem value="medium">Medium - Competitive advantage</SelectItem>
                        <SelectItem value="high">High - Market-leading innovation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="operations">Operational Excellence (Optional)</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      How much does this improve operational efficiency or quality?
                    </p>
                    <Select value={operationalExcellence} onValueChange={setOperationalExcellence}>
                      <SelectTrigger id="operations" className="mt-2">
                        <SelectValue placeholder="Select excellence level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Minor process improvement</SelectItem>
                        <SelectItem value="medium">Medium - Significant efficiency gain</SelectItem>
                        <SelectItem value="high">High - Operational transformation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button type="button" onClick={handleNext} className="bg-gray-900 hover:bg-gray-800">
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-gray-900 hover:bg-gray-800"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Initiative
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
