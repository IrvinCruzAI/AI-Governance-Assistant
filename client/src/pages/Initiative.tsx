import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const MISSION_OPTIONS = [
  "Patient safety",
  "Health equity",
  "Reducing clinician or staff burnout",
  "Improving access to care",
  "Improving patient and family experience",
  "Operational efficiency only",
];

const AREA_OPTIONS = [
  { value: "direct-clinical", label: "Direct clinical decisions (diagnosis, treatment, triage, medication)" },
  { value: "clinical-support", label: "Clinical support (documentation, coding, summarization)" },
  { value: "clinical-operations", label: "Clinical operations (patient flow, staffing, bed management)" },
  { value: "back-office", label: "Back-office (finance, HR, supply chain, revenue cycle)" },
  { value: "other", label: "Other" },
];

const CLINICAL_IMPACT_OPTIONS = [
  { value: "no-direct", label: "No direct effect on clinical decisions or patient safety" },
  { value: "indirect", label: "Indirect effect on patient care" },
  { value: "direct-low", label: "Direct impact on lower-stakes clinical decisions" },
  { value: "direct-high", label: "Direct impact on higher-stakes clinical decisions" },
];

const DATA_TYPE_OPTIONS = [
  { value: "no-personal", label: "No personal data" },
  { value: "deidentified", label: "De-identified or aggregate data only" },
  { value: "phi", label: "Patient records and protected health information (PHI)" },
  { value: "sensitive", label: "Highly sensitive data (mental health, behavioral, genetic)" },
];

const AUTOMATION_OPTIONS = [
  { value: "suggestions", label: "Suggestions only; humans choose all actions" },
  { value: "review-required", label: "Humans must review and approve every suggestion" },
  { value: "automated", label: "System may take some actions automatically (routing, priority, scheduling)" },
];

export default function Initiative() {
  const { id } = useParams<{ id: string }>();
  const initiativeId = id ? parseInt(id) : null;
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    title: "",
    userRole: "",
    area: "",
    
    // Step 2: Problem & Solution
    problemStatement: "",
    aiApproach: "",
    primaryUsers: "",
    
    // Step 3: Mission & Ethics
    missionSupports: [] as string[],
    wholePersonCareAlignment: "",
    ethicalConcerns: "",
    
    // Step 4: Risk Classification
    mainArea: "",
    clinicalImpact: "",
    dataType: "",
    automationLevel: "",
  });

  const { data: initiative, isLoading } = trpc.initiative.get.useQuery(
    { id: initiativeId! },
    { enabled: !!initiativeId && isAuthenticated }
  );

  const updateMutation = trpc.initiative.update.useMutation();
  const analyzeMissionMutation = trpc.initiative.analyzeMission.useMutation();
  const classifyRiskMutation = trpc.initiative.classifyRisk.useMutation();
  const generateRAIDMutation = trpc.initiative.generateRAID.useMutation();

  // Load existing data
  useEffect(() => {
    if (initiative) {
      setFormData({
        title: initiative.title || "",
        userRole: initiative.userRole || "",
        area: initiative.area || "",
        problemStatement: initiative.problemStatement || "",
        aiApproach: initiative.aiApproach || "",
        primaryUsers: initiative.primaryUsers || "",
        missionSupports: initiative.missionSupports ? JSON.parse(initiative.missionSupports) : [],
        wholePersonCareAlignment: initiative.wholPersonCareAlignment || "",
        ethicalConcerns: initiative.ethicalConcerns || "",
        mainArea: initiative.mainArea || "",
        clinicalImpact: initiative.clinicalImpact || "",
        dataType: initiative.dataType || "",
        automationLevel: initiative.automationLevel || "",
      });
      setCurrentStep(initiative.currentStep || 1);
    }
  }, [initiative]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMissionToggle = (option: string) => {
    setFormData(prev => ({
      ...prev,
      missionSupports: prev.missionSupports.includes(option)
        ? prev.missionSupports.filter(o => o !== option)
        : [...prev.missionSupports, option]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          toast.error("Please provide a title for your initiative");
          return false;
        }
        return true;
      case 2:
        if (!formData.problemStatement.trim()) {
          toast.error("Please describe the problem or opportunity");
          return false;
        }
        if (!formData.aiApproach.trim()) {
          toast.error("Please describe how AI might help");
          return false;
        }
        return true;
      case 3:
        if (formData.missionSupports.length === 0) {
          toast.error("Please select at least one mission support area");
          return false;
        }
        if (!formData.wholePersonCareAlignment.trim()) {
          toast.error("Please describe how this supports whole-person care");
          return false;
        }
        return true;
      case 4:
        if (!formData.mainArea) {
          toast.error("Please select the main area this initiative touches");
          return false;
        }
        if (!formData.clinicalImpact) {
          toast.error("Please select the clinical impact level");
          return false;
        }
        if (!formData.dataType) {
          toast.error("Please select the data type");
          return false;
        }
        if (!formData.automationLevel) {
          toast.error("Please select the automation level");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const saveProgress = async () => {
    if (!initiativeId) return;
    
    await updateMutation.mutateAsync({
      id: initiativeId,
      data: {
        title: formData.title,
        userRole: formData.userRole,
        area: formData.area,
        problemStatement: formData.problemStatement,
        aiApproach: formData.aiApproach,
        primaryUsers: formData.primaryUsers,
        missionSupports: JSON.stringify(formData.missionSupports),
        wholPersonCareAlignment: formData.wholePersonCareAlignment,
        ethicalConcerns: formData.ethicalConcerns,
        mainArea: formData.mainArea,
        clinicalImpact: formData.clinicalImpact,
        dataType: formData.dataType,
        automationLevel: formData.automationLevel,
        currentStep,
      },
    });
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;
    
    await saveProgress();
    
    if (currentStep === 4) {
      // Final step - run AI analysis
      toast.info("Analyzing your initiative...");
      
      try {
        const [missionAnalysis, riskAnalysis, raidData] = await Promise.all([
          analyzeMissionMutation.mutateAsync({
            title: formData.title,
            problemStatement: formData.problemStatement,
            aiApproach: formData.aiApproach,
            primaryUsers: formData.primaryUsers,
            missionSupports: formData.missionSupports,
            wholePersonCareAlignment: formData.wholePersonCareAlignment,
            ethicalConcerns: formData.ethicalConcerns,
          }),
          classifyRiskMutation.mutateAsync({
            title: formData.title,
            problemStatement: formData.problemStatement,
            aiApproach: formData.aiApproach,
            mainArea: formData.mainArea,
            clinicalImpact: formData.clinicalImpact,
            dataType: formData.dataType,
            automationLevel: formData.automationLevel,
          }),
          generateRAIDMutation.mutateAsync({
            title: formData.title,
            problemStatement: formData.problemStatement,
            aiApproach: formData.aiApproach,
            primaryUsers: formData.primaryUsers,
            mainArea: formData.mainArea,
            dataType: formData.dataType,
            ethicalConcerns: formData.ethicalConcerns,
          }),
        ]);

        await updateMutation.mutateAsync({
          id: initiativeId!,
          data: {
            missionAlignmentRating: missionAnalysis.rating,
            missionAlignmentReasoning: missionAnalysis.reasoning,
            riskLevel: riskAnalysis.riskLevel,
            governancePath: riskAnalysis.governancePath,
            riskReasoning: riskAnalysis.reasoning,
            risks: JSON.stringify(raidData.risks),
            assumptions: JSON.stringify(raidData.assumptions),
            issues: JSON.stringify(raidData.issues),
            dependencies: JSON.stringify(raidData.dependencies),
            completed: true,
            currentStep: 5,
          },
        });

        toast.success("Analysis complete!");
        setCurrentStep(5);
      } catch (error) {
        toast.error("Failed to analyze initiative. Please try again.");
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Initiative not found</p>
            <Button onClick={() => setLocation("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSteps = 5;
  const isComplete = currentStep === 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-blue-900">AI Initiative Intake Form</h1>
            <p className="text-sm text-gray-600">
              {isComplete ? "Review & Submit" : `Step ${currentStep} of ${totalSteps - 1}`}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-xs text-gray-600">
            <span>Basic Info</span>
            <span>Problem & Solution</span>
            <span>Mission & Ethics</span>
            <span>Risk Assessment</span>
            <span>Review</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Problem & Solution"}
              {currentStep === 3 && "Mission & Ethics Alignment"}
              {currentStep === 4 && "Risk Classification"}
              {currentStep === 5 && "Review & Submit"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about your initiative and your role"}
              {currentStep === 2 && "Describe the problem and how AI can help"}
              {currentStep === 3 && "Assess alignment with AdventHealth's mission"}
              {currentStep === 4 && "Help us understand the risk profile"}
              {currentStep === 5 && "Review your submission before sending"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Initiative Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., AI-Powered Diagnostic Assistant"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userRole">Your Role</Label>
                  <Input
                    id="userRole"
                    placeholder="e.g., Clinical Director, IT Manager"
                    value={formData.userRole}
                    onChange={(e) => handleInputChange("userRole", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Primary Area</Label>
                  <Select value={formData.area} onValueChange={(value) => handleInputChange("area", value)}>
                    <SelectTrigger id="area">
                      <SelectValue placeholder="Select an area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clinical-care">Clinical Care</SelectItem>
                      <SelectItem value="clinical-support">Clinical Support</SelectItem>
                      <SelectItem value="clinical-operations">Clinical Operations</SelectItem>
                      <SelectItem value="back-office">Back Office</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Step 2: Problem & Solution */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="problem">Problem or Opportunity *</Label>
                  <Textarea
                    id="problem"
                    placeholder="In 3-5 sentences, describe the current pain or gap. Focus on the problem, not the AI solution yet."
                    value={formData.problemStatement}
                    onChange={(e) => handleInputChange("problemStatement", e.target.value)}
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiApproach">How AI Might Help *</Label>
                  <Textarea
                    id="aiApproach"
                    placeholder="Describe in plain language how you think AI could address this problem. It's okay if this is rough."
                    value={formData.aiApproach}
                    onChange={(e) => handleInputChange("aiApproach", e.target.value)}
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="users">Primary Users or Affected Groups</Label>
                  <Input
                    id="users"
                    placeholder="e.g., physicians, nurses, patients, finance staff"
                    value={formData.primaryUsers}
                    onChange={(e) => handleInputChange("primaryUsers", e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Step 3: Mission & Ethics */}
            {currentStep === 3 && (
              <>
                <div className="space-y-3">
                  <Label>Which of these does this idea most directly support? * (Select all that apply)</Label>
                  {MISSION_OPTIONS.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={formData.missionSupports.includes(option)}
                        onCheckedChange={() => handleMissionToggle(option)}
                      />
                      <label htmlFor={option} className="text-sm cursor-pointer">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wholePerson">Whole-Person Care Alignment *</Label>
                  <Textarea
                    id="wholePerson"
                    placeholder="In 2-4 sentences, describe how this idea supports whole-person care (physical, emotional, spiritual, social) or the organization's healing mission."
                    value={formData.wholePersonCareAlignment}
                    onChange={(e) => handleInputChange("wholePersonCareAlignment", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ethical">Potential Ethical Concerns</Label>
                  <Textarea
                    id="ethical"
                    placeholder="Do you see any potential ethical concerns? (e.g., unfair treatment of groups, over-reliance on automation, privacy concerns). If none, you can leave this blank."
                    value={formData.ethicalConcerns}
                    onChange={(e) => handleInputChange("ethicalConcerns", e.target.value)}
                    rows={4}
                  />
                </div>
              </>
            )}

            {/* Step 4: Risk Classification */}
            {currentStep === 4 && (
              <>
                <div className="space-y-3">
                  <Label>Which best describes the main area this AI idea touches? *</Label>
                  <RadioGroup value={formData.mainArea} onValueChange={(value) => handleInputChange("mainArea", value)}>
                    {AREA_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <label htmlFor={option.value} className="text-sm cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Does this idea directly affect clinical decisions or patient safety? *</Label>
                  <RadioGroup value={formData.clinicalImpact} onValueChange={(value) => handleInputChange("clinicalImpact", value)}>
                    {CLINICAL_IMPACT_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <label htmlFor={option.value} className="text-sm cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>What kind of data would this likely use? *</Label>
                  <RadioGroup value={formData.dataType} onValueChange={(value) => handleInputChange("dataType", value)}>
                    {DATA_TYPE_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <label htmlFor={option.value} className="text-sm cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>How would the AI be used? *</Label>
                  <RadioGroup value={formData.automationLevel} onValueChange={(value) => handleInputChange("automationLevel", value)}>
                    {AUTOMATION_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <label htmlFor={option.value} className="text-sm cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && initiative && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Initiative Submitted Successfully!</p>
                    <p className="text-sm text-green-800 mt-1">
                      Your AI initiative has been analyzed and is ready for review by the Chief AI Officer's team.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Mission Alignment</p>
                    <p className="text-2xl font-bold text-blue-600">{initiative.missionAlignmentRating}</p>
                    <p className="text-sm text-blue-800 mt-2">{initiative.missionAlignmentReasoning}</p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm font-semibold text-orange-900 mb-1">Risk Level</p>
                    <p className="text-2xl font-bold text-orange-600">{initiative.riskLevel}</p>
                    <p className="text-sm text-orange-800 mt-2">
                      Recommended: <strong>{initiative.governancePath}</strong> governance
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setLocation(`/brief/${initiativeId}`)}
                  className="w-full"
                  size="lg"
                >
                  View Complete Brief & Download
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {!isComplete && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={updateMutation.isPending || analyzeMissionMutation.isPending}
            >
              {currentStep === 4 ? (
                analyzeMissionMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Submit for Analysis
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
