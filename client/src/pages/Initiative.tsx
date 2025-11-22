import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { Loader2, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Streamdown } from "streamdown";

type Message = {
  role: "assistant" | "user";
  content: string;
};

const MISSION_OPTIONS = [
  "Patient safety",
  "Health equity",
  "Reducing clinician or staff burnout",
  "Improving access to care",
  "Improving patient and family experience",
  "Operational efficiency only",
];

export default function Initiative() {
  const { id } = useParams<{ id: string }>();
  const initiativeId = id ? parseInt(id) : null;
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [subStep, setSubStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [selectedMissionSupports, setSelectedMissionSupports] = useState<string[]>([]);
  const [selectedRadio, setSelectedRadio] = useState("");

  const { data: initiative, isLoading } = trpc.initiative.get.useQuery(
    { id: initiativeId! },
    { enabled: !!initiativeId && isAuthenticated }
  );

  const { data: savedMessages } = trpc.initiative.getMessages.useQuery(
    { initiativeId: initiativeId! },
    { enabled: !!initiativeId && isAuthenticated }
  );

  const updateMutation = trpc.initiative.update.useMutation();
  const addMessageMutation = trpc.initiative.addMessage.useMutation();
  const analyzeMissionMutation = trpc.initiative.analyzeMission.useMutation();
  const classifyRiskMutation = trpc.initiative.classifyRisk.useMutation();
  const generateRAIDMutation = trpc.initiative.generateRAID.useMutation();

  useEffect(() => {
    if (savedMessages && savedMessages.length > 0) {
      setMessages(savedMessages.map(m => ({ role: m.role, content: m.content })));
      if (initiative) {
        setCurrentStep(initiative.currentStep || 1);
      }
    } else if (initiative && messages.length === 0) {
      const welcomeMessage: Message = {
        role: "assistant",
        content: `Hi, I'm the **AI Initiative Intake & Governance Assistant**.

I'll help you turn your AI idea into a clear, structured brief that you can share with the Chief AI Officer's team. We'll look at mission alignment, risk, governance, and next steps.

**What is the working title of this AI idea or project?**`,
      };
      setMessages([welcomeMessage]);
      addMessageMutation.mutate({
        initiativeId: initiativeId!,
        role: "assistant",
        content: welcomeMessage.content,
        step: 1,
      });
    }
  }, [savedMessages, initiative]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addAssistantMessage = async (content: string, step: number) => {
    const msg: Message = { role: "assistant", content };
    setMessages(prev => [...prev, msg]);
    await addMessageMutation.mutateAsync({
      initiativeId: initiativeId!,
      role: "assistant",
      content,
      step,
    });
  };

  const handleSendMessage = async () => {
    if ((!userInput.trim() && selectedMissionSupports.length === 0 && !selectedRadio) || !initiativeId || isProcessing) return;

    const messageContent = userInput || selectedMissionSupports.join(", ") || selectedRadio;
    const userMessage: Message = {
      role: "user",
      content: messageContent,
    };

    setMessages(prev => [...prev, userMessage]);
    const inputValue = userInput;
    setUserInput("");
    setSelectedMissionSupports([]);
    setSelectedRadio("");
    setIsProcessing(true);

    await addMessageMutation.mutateAsync({
      initiativeId,
      role: "user",
      content: messageContent,
      step: currentStep,
    });

    try {
      // Step 2: Initiative Basics
      if (currentStep === 2) {
        if (subStep === 1) {
          // Title
          await updateMutation.mutateAsync({
            id: initiativeId,
            data: { title: inputValue },
          });
          await addAssistantMessage(
            "Great. **In 3–5 sentences, describe the problem or opportunity you want to address.** Focus on the current pain or gap, not the AI solution yet.",
            2
          );
          setSubStep(2);
        } else if (subStep === 2) {
          // Problem statement
          await updateMutation.mutateAsync({
            id: initiativeId,
            data: { problemStatement: inputValue },
          });
          await addAssistantMessage(
            "Thank you. **Now describe how you think AI might help, in plain language.** It's okay if this is rough.",
            2
          );
          setSubStep(3);
        } else if (subStep === 3) {
          // AI approach
          await updateMutation.mutateAsync({
            id: initiativeId,
            data: { aiApproach: inputValue },
          });
          await addAssistantMessage(
            "Perfect. **Who would primarily use or be affected by this?** For example: physicians, nurses, schedulers, patients, finance staff, IT staff.",
            2
          );
          setSubStep(4);
        } else if (subStep === 4) {
          // Primary users + summary
          await updateMutation.mutateAsync({
            id: initiativeId,
            data: { primaryUsers: inputValue, currentStep: 3 },
          });
          
          const updatedInitiative = await utils.initiative.get.fetch({ id: initiativeId });
          const summary = `Let me summarize what I've heard so far:

- **Problem:** ${updatedInitiative?.problemStatement || ""}
- **Proposed AI role:** ${updatedInitiative?.aiApproach || ""}
- **Main users/impacted groups:** ${inputValue}

**Is this a fair summary of your idea so far?** (Please respond with "Yes" to continue, or provide any clarifications)`;
          
          await addAssistantMessage(summary, 2);
          setSubStep(5);
        } else if (subStep === 5) {
          // Confirmation - move to Step 3
          setCurrentStep(3);
          setSubStep(1);
          await updateMutation.mutateAsync({
            id: initiativeId,
            data: { currentStep: 3 },
          });
          
          const missionQuestion = `Great! Now let's assess mission and ethics alignment.

**Which of these does this idea most directly support?** (Select all that apply)

${MISSION_OPTIONS.map((opt, i) => `${i + 1}. ${opt}`).join("\n")}

Please respond with the numbers of your selections (e.g., "1, 3, 5") or type the options.`;
          
          await addAssistantMessage(missionQuestion, 3);
        }
      }
      // Step 3: Mission & Ethics
      else if (currentStep === 3) {
        if (subStep === 1) {
          // Mission supports
          const supports = messageContent.split(",").map(s => s.trim());
          await updateMutation.mutateAsync({
            id: initiativeId,
            data: { missionSupports: JSON.stringify(supports) },
          });
          await addAssistantMessage(
            "**In 2–4 sentences, how does this idea support whole-person care or the organization's healing mission?**",
            3
          );
          setSubStep(2);
        } else if (subStep === 2) {
          // Whole-person care alignment
          await updateMutation.mutateAsync({
            id: initiativeId,
            data: { wholPersonCareAlignment: inputValue },
          });
          await addAssistantMessage(
            `**Do you see any potential ethical concerns or risks?** For example:
- Unfair treatment of certain groups
- Over-reliance on automation
- Privacy or confidentiality concerns
- Anything that feels misaligned with our values

(If none, you can say "None")`,
            3
          );
          setSubStep(3);
        } else if (subStep === 3) {
          // Ethical concerns - now analyze
          await updateMutation.mutateAsync({
            id: initiativeId,
            data: { ethicalConcerns: inputValue },
          });
          
          await addAssistantMessage(
            "Thank you. Let me analyze the mission alignment of this initiative...",
            3
          );
          
          const updatedInitiative = await utils.initiative.get.fetch({ id: initiativeId });
          
          // Call AI analysis
          const missionAnalysis = await analyzeMissionMutation.mutateAsync({
            title: updatedInitiative?.title || "",
            problemStatement: updatedInitiative?.problemStatement || "",
            aiApproach: updatedInitiative?.aiApproach || "",
            primaryUsers: updatedInitiative?.primaryUsers || "",
            missionSupports: JSON.parse(updatedInitiative?.missionSupports || "[]"),
            wholePersonCareAlignment: updatedInitiative?.wholPersonCareAlignment || "",
            ethicalConcerns: inputValue,
          });
          
          await updateMutation.mutateAsync({
            id: initiativeId,
            data: {
              missionAlignmentRating: missionAnalysis.rating,
              missionAlignmentReasoning: missionAnalysis.reasoning,
              currentStep: 4,
            },
          });
          
          const analysisMessage = `**Mission Alignment Assessment:**

**Rating:** ${missionAnalysis.rating}

**Reasoning:** ${missionAnalysis.reasoning}

**Does this feel accurate?** (Yes/No or provide clarifications)`;
          
          await addAssistantMessage(analysisMessage, 3);
          setSubStep(4);
        } else if (subStep === 4) {
          // Confirmation - move to Step 4
          setCurrentStep(4);
          setSubStep(1);
          await updateMutation.mutateAsync({
            id: initiativeId,
            data: { currentStep: 4 },
          });
          
          const riskQuestion = `Excellent. Now let's classify the risk level.

**Which best describes the main area this AI idea touches?**

1. Direct clinical decisions (diagnosis, treatment, triage, medication changes)
2. Clinical support (documentation, coding, summarization, ambient tools)
3. Clinical operations (patient flow, staffing, bed management, command center)
4. Back-office (finance, HR, supply chain, revenue cycle)
5. Other

Please respond with the number or description.`;
          
          await addAssistantMessage(riskQuestion, 4);
        }
      }
      // Step 4: Risk Classification
      else if (currentStep === 4) {
        if (subStep === 1) {
          // Main area
          await updateMutation.mutateAsync({
            id: initiativeId,
            data: { mainArea: inputValue },
          });
          
          const clinicalImpactQuestion = `**Does this idea directly affect clinical decisions or patient safety?**

1. No direct effect
2. Indirect effect
3. Direct, lower-stakes decisions
4. Direct, higher-stakes decisions

Please respond with the number or description.`;
          
          await addAssistantMessage(clinicalImpactQuestion, 4);
          setSubStep(2);
        } else if (subStep === 2) {
          // Clinical impact
          await updateMutation.mutateAsync({
            id: initiativeId,
            data: { clinicalImpact: inputValue },
          });
          
          const dataTypeQuestion = `**What kind of data would this likely use?**

1. No personal data
2. De-identified or aggregate data
3. Patient records and protected health information
4. Highly sensitive data (mental health, behavioral, or genetic data)

Please respond with the number or description.`;
          
          await addAssistantMessage(dataTypeQuestion, 4);
          setSubStep(3);
        } else if (subStep === 3) {
          // Data type
          await updateMutation.mutateAsync({
            id: initiativeId,
            data: { dataType: inputValue },
          });
          
          const automationQuestion = `**How would the AI be used?**

1. Suggestions only; humans choose actions
2. Humans must review and approve every suggestion
3. The system may take some actions automatically (routing, priority, scheduling)

Please respond with the number or description.`;
          
          await addAssistantMessage(automationQuestion, 4);
          setSubStep(4);
        } else if (subStep === 4) {
          // Automation level - now classify risk
          await updateMutation.mutateAsync({
            id: initiativeId,
            data: { automationLevel: inputValue },
          });
          
          await addAssistantMessage(
            "Thank you. Let me classify the risk level and suggest a governance path...",
            4
          );
          
          const updatedInitiative = await utils.initiative.get.fetch({ id: initiativeId });
          
          // Call AI risk classification
          const riskAnalysis = await classifyRiskMutation.mutateAsync({
            title: updatedInitiative?.title || "",
            problemStatement: updatedInitiative?.problemStatement || "",
            aiApproach: updatedInitiative?.aiApproach || "",
            mainArea: updatedInitiative?.mainArea || "",
            clinicalImpact: updatedInitiative?.clinicalImpact || "",
            dataType: updatedInitiative?.dataType || "",
            automationLevel: inputValue,
          });
          
          await updateMutation.mutateAsync({
            id: initiativeId,
            data: {
              riskLevel: riskAnalysis.riskLevel,
              governancePath: riskAnalysis.governancePath,
              riskReasoning: riskAnalysis.reasoning,
              currentStep: 5,
            },
          });
          
          const riskMessage = `**Risk Classification:**

**Risk Level:** ${riskAnalysis.riskLevel}

**Suggested Governance Path:** ${riskAnalysis.governancePath} governance

**Reasoning:** ${riskAnalysis.reasoning}

Now I'll generate a RAID view (Risks, Assumptions, Issues, Dependencies) for this initiative...`;
          
          await addAssistantMessage(riskMessage, 4);
          
          // Auto-generate RAID
          const raidData = await generateRAIDMutation.mutateAsync({
            title: updatedInitiative?.title || "",
            problemStatement: updatedInitiative?.problemStatement || "",
            aiApproach: updatedInitiative?.aiApproach || "",
            primaryUsers: updatedInitiative?.primaryUsers || "",
            mainArea: updatedInitiative?.mainArea || "",
            dataType: updatedInitiative?.dataType || "",
            ethicalConcerns: updatedInitiative?.ethicalConcerns || "",
          });
          
          await updateMutation.mutateAsync({
            id: initiativeId,
            data: {
              risks: JSON.stringify(raidData.risks),
              assumptions: JSON.stringify(raidData.assumptions),
              issues: JSON.stringify(raidData.issues),
              dependencies: JSON.stringify(raidData.dependencies),
              currentStep: 5,
            },
          });
          
          const raidMessage = `**RAID View:**

**Risks:**
${raidData.risks.map((r: string, i: number) => `${i + 1}. ${r}`).join("\n")}

**Assumptions:**
${raidData.assumptions.map((a: string, i: number) => `${i + 1}. ${a}`).join("\n")}

**Issues:**
${raidData.issues.map((iss: string, i: number) => `${i + 1}. ${iss}`).join("\n")}

**Dependencies:**
${raidData.dependencies.map((d: string, i: number) => `${i + 1}. ${d}`).join("\n")}

**What would you add, change, or correct in these lists before sharing with leadership?** (Or say "Looks good" to proceed)`;
          
          await addAssistantMessage(raidMessage, 5);
          setCurrentStep(5);
          setSubStep(1);
        }
      }
      // Step 5: RAID confirmation
      else if (currentStep === 5) {
        // User feedback on RAID - move to final outputs
        setCurrentStep(6);
        await updateMutation.mutateAsync({
          id: initiativeId,
          data: { currentStep: 6, completed: true },
        });
        
        const finalMessage = `Perfect! Your initiative evaluation is complete.

I've generated a comprehensive brief and email summary that you can review and download.

**Click the "View Final Brief" button below to see your complete initiative documentation.**`;
        
        await addAssistantMessage(finalMessage, 6);
        setSubStep(1);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      await addAssistantMessage(
        "I apologize, but I encountered an error processing your response. Please try again or contact support if the issue persists.",
        currentStep
      );
    }

    setIsProcessing(false);
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

  const isCompleted = currentStep === 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="container max-w-5xl py-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-blue-900">{initiative.title}</h1>
            <p className="text-sm text-gray-600">
              {isCompleted ? (
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed
                </span>
              ) : (
                `Step ${currentStep} of 6`
              )}
            </p>
          </div>
          {isCompleted && (
            <Button onClick={() => setLocation(`/brief/${initiativeId}`)}>
              View Final Brief
            </Button>
          )}
        </div>

        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <Streamdown>{message.content}</Streamdown>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {!isCompleted && (
              <div className="flex gap-2">
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your response..."
                  className="flex-1 min-h-[60px]"
                  disabled={isProcessing}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isProcessing}
                  size="lg"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
