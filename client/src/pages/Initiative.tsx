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
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
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
    title: "",
    userRole: "",
    area: "",
    problemStatement: "",
    aiApproach: "",
    primaryUsers: "",
    missionSupports: [] as string[],
    wholePersonCareAlignment: "",
    ethicalConcerns: "",
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100">
        <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl p-8 text-center">
          <p className="text-gray-600 mb-4">Initiative not found</p>
          <Button onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const totalSteps = 5;
  const isComplete = currentStep === 5;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-teal-500 to-blue-700 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container max-w-4xl py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">AI Initiative Intake Form</h1>
            <p className="text-sm text-white/80">
              {isComplete ? "Review & Submit" : `Step ${currentStep} of ${totalSteps - 1}`}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6">
          <div className="flex justify-between mb-3 text-xs font-medium text-white">
            <span className={currentStep >= 1 ? "opacity-100" : "opacity-50"}>Basic Info</span>
            <span className={currentStep >= 2 ? "opacity-100" : "opacity-50"}>Problem & Solution</span>
            <span className={currentStep >= 3 ? "opacity-100" : "opacity-50"}>Mission & Ethics</span>
            <span className={currentStep >= 4 ? "opacity-100" : "opacity-50"}>Risk Assessment</span>
            <span className={currentStep >= 5 ? "opacity-100" : "opacity-50"}>Review</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-blue-400 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="backdrop-blur-md bg-white/90 border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6">
            <h2 className="text-2xl font-bold text-white mb-1">
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Problem & Solution"}
              {currentStep === 3 && "Mission & Ethics Alignment"}
              {currentStep === 4 && "Risk Classification"}
              {currentStep === 5 && "Review & Submit"}
            </h2>
            <p className="text-white/90 text-sm">
              {currentStep === 1 && "Tell us about your initiative and your role"}
              {currentStep === 2 && "Describe the problem and how AI can help"}
              {currentStep === 3 && "Assess alignment with Travel + Leisure Co.'s mission"}
              {currentStep === 4 && "Help us understand the risk profile"}
              {currentStep === 5 && "Review your submission before sending"}
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700 font-semibold">Initiative Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., AI-Powered Diagnostic Assistant"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userRole" className="text-gray-700 font-semibold">Your Role</Label>
                  <Input
                    id="userRole"
                    placeholder="e.g., Clinical Director, IT Manager"
                    value={formData.userRole}
                    onChange={(e) => handleInputChange("userRole", e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area" className="text-gray-700 font-semibold">Primary Area</Label>
                  <Select value={formData.area} onValueChange={(value) => handleInputChange("area", value)}>
                    <SelectTrigger id="area" className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                  <Label htmlFor="problem" className="text-gray-700 font-semibold">Problem or Opportunity *</Label>
                  <Textarea
                    id="problem"
                    placeholder="In 3-5 sentences, describe the current pain or gap. Focus on the problem, not the AI solution yet."
                    value={formData.problemStatement}
                    onChange={(e) => handleInputChange("problemStatement", e.target.value)}
                    rows={5}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiApproach" className="text-gray-700 font-semibold">How AI Might Help *</Label>
                  <Textarea
                    id="aiApproach"
                    placeholder="Describe in plain language how you think AI could address this problem. It's okay if this is rough."
                    value={formData.aiApproach}
                    onChange={(e) => handleInputChange("aiApproach", e.target.value)}
                    rows={5}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="users" className="text-gray-700 font-semibold">Primary Users or Affected Groups</Label>
                  <Input
                    id="users"
                    placeholder="e.g., physicians, nurses, patients, finance staff"
                    value={formData.primaryUsers}
                    onChange={(e) => handleInputChange("primaryUsers", e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {/* Step 3: Mission & Ethics */}
            {currentStep === 3 && (
              <>
                <div className="space-y-3">
                  <Label className="text-gray-700 font-semibold">Which of these does this idea most directly support? * (Select all that apply)</Label>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                    {MISSION_OPTIONS.map((option) => (
                      <div key={option} className="flex items-center space-x-3">
                        <Checkbox
                          id={option}
                          checked={formData.missionSupports.includes(option)}
                          onCheckedChange={() => handleMissionToggle(option)}
                        />
                        <label htmlFor={option} className="text-sm cursor-pointer text-gray-700">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wholePerson" className="text-gray-700 font-semibold">Whole-Person Care Alignment *</Label>
                  <Textarea
                    id="wholePerson"
                    placeholder="In 2-4 sentences, describe how this idea supports whole-person care (physical, emotional, spiritual, social) or the organization's healing mission."
                    value={formData.wholePersonCareAlignment}
                    onChange={(e) => handleInputChange("wholePersonCareAlignment", e.target.value)}
                    rows={4}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ethical" className="text-gray-700 font-semibold">Potential Ethical Concerns</Label>
                  <Textarea
                    id="ethical"
                    placeholder="Do you see any potential ethical concerns? (e.g., unfair treatment of groups, over-reliance on automation, privacy concerns). If none, you can leave this blank."
                    value={formData.ethicalConcerns}
                    onChange={(e) => handleInputChange("ethicalConcerns", e.target.value)}
                    rows={4}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {/* Step 4: Risk Classification */}
            {currentStep === 4 && (
              <>
                <div className="space-y-3">
                  <Label className="text-gray-700 font-semibold">Which best describes the main area this AI idea touches? *</Label>
                  <RadioGroup value={formData.mainArea} onValueChange={(value) => handleInputChange("mainArea", value)} className="space-y-3">
                    {AREA_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <label htmlFor={option.value} className="text-sm cursor-pointer text-gray-700">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-700 font-semibold">Does this idea directly affect clinical decisions or patient safety? *</Label>
                  <RadioGroup value={formData.clinicalImpact} onValueChange={(value) => handleInputChange("clinicalImpact", value)} className="space-y-3">
                    {CLINICAL_IMPACT_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <label htmlFor={option.value} className="text-sm cursor-pointer text-gray-700">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-700 font-semibold">What kind of data would this likely use? *</Label>
                  <RadioGroup value={formData.dataType} onValueChange={(value) => handleInputChange("dataType", value)} className="space-y-3">
                    {DATA_TYPE_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <label htmlFor={option.value} className="text-sm cursor-pointer text-gray-700">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-700 font-semibold">How would the AI be used? *</Label>
                  <RadioGroup value={formData.automationLevel} onValueChange={(value) => handleInputChange("automationLevel", value)} className="space-y-3">
                    {AUTOMATION_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <label htmlFor={option.value} className="text-sm cursor-pointer text-gray-700">
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
                <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 rounded-2xl p-6 flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-green-900 text-lg mb-1">Initiative Submitted Successfully!</p>
                    <p className="text-sm text-green-800">
                      Your AI initiative has been analyzed and is ready for review by the Chief AI Officer's team.
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="backdrop-blur-md bg-gradient-to-br from-blue-500/10 to-teal-500/10 border-2 border-blue-200 rounded-2xl p-6">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Mission Alignment</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-3">
                      {initiative.missionAlignmentRating}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">{initiative.missionAlignmentReasoning}</p>
                  </div>

                  <div className="backdrop-blur-md bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-200 rounded-2xl p-6">
                    <p className="text-sm font-semibold text-orange-900 mb-2">Risk Level</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
                      {initiative.riskLevel}
                    </p>
                    <p className="text-sm text-gray-700">
                      Recommended: <strong>{initiative.governancePath}</strong> governance
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setLocation(`/brief/${initiativeId}`)}
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-lg py-6 rounded-xl shadow-lg"
                  size="lg"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  View Complete Brief & Download
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        {!isComplete && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="backdrop-blur-md bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={updateMutation.isPending || analyzeMissionMutation.isPending}
              className="bg-white text-blue-600 hover:bg-white/90 shadow-lg"
            >
              {currentStep === 4 ? (
                analyzeMissionMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Submit for Analysis
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
