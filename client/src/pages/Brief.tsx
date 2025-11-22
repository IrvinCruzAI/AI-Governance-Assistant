import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { Loader2, ArrowLeft, Download, Mail, FileText } from "lucide-react";
import { Streamdown } from "streamdown";

export default function Brief() {
  const { id } = useParams<{ id: string }>();
  const initiativeId = id ? parseInt(id) : null;
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: initiative, isLoading } = trpc.initiative.get.useQuery(
    { id: initiativeId! },
    { enabled: !!initiativeId && isAuthenticated }
  );

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

  const missionSupports = initiative.missionSupports 
    ? JSON.parse(initiative.missionSupports) 
    : [];
  const risks = initiative.risks ? JSON.parse(initiative.risks) : [];
  const assumptions = initiative.assumptions ? JSON.parse(initiative.assumptions) : [];
  const issues = initiative.issues ? JSON.parse(initiative.issues) : [];
  const dependencies = initiative.dependencies ? JSON.parse(initiative.dependencies) : [];

  const initiativeBrief = `# Initiative Brief

## ${initiative.title}

**Requestor:** ${initiative.userRole || "Not specified"}  
**Area:** ${initiative.area || "Not specified"}  
**Date:** ${new Date(initiative.createdAt).toLocaleDateString()}

---

### Problem Statement

${initiative.problemStatement || "Not provided"}

---

### Proposed AI Support

${initiative.aiApproach || "Not provided"}

**Primary Users/Affected Groups:** ${initiative.primaryUsers || "Not specified"}

---

### Mission & Ethics Summary

**Mission Alignment Rating:** ${initiative.missionAlignmentRating || "Not assessed"}

**Explanation:** ${initiative.missionAlignmentReasoning || "Not provided"}

**Mission Supports:**
${missionSupports.map((s: string) => `- ${s}`).join("\n")}

**Whole-Person Care Alignment:** ${initiative.wholPersonCareAlignment || "Not provided"}

**Ethical Concerns:** ${initiative.ethicalConcerns || "None identified"}

---

### Risk Classification

**Domain:** ${initiative.mainArea || "Not specified"}

**Impact on Patients:** ${initiative.clinicalImpact || "Not specified"}

**Data Sensitivity:** ${initiative.dataType || "Not specified"}

**Level of Automation:** ${initiative.automationLevel || "Not specified"}

**Risk Level:** ${initiative.riskLevel || "Not assessed"}

---

### Suggested Governance Path

**Path:** ${initiative.governancePath || "Not determined"} governance

**Reasoning:** ${initiative.riskReasoning || "Not provided"}

---

### RAID Highlights

#### Risks
${risks.map((r: string) => `- ${r}`).join("\n")}

#### Assumptions
${assumptions.map((a: string) => `- ${a}`).join("\n")}

#### Issues
${issues.map((i: string) => `- ${i}`).join("\n")}

#### Dependencies
${dependencies.map((d: string) => `- ${d}`).join("\n")}

---

### Suggested Next Steps

- Submit this initiative to the formal AI intake process
- Engage relevant clinical or operational leaders for input
- Confirm data sources and availability with IT and analytics teams
- Design a small, safe pilot to test value and impact
- Schedule review with the Chief AI Officer's team
`;

  const emailSummary = `**Subject:** Proposed AI Initiative – ${initiative.title}

**To:** Chief AI Officer's Team

---

**Problem and Opportunity**

${initiative.problemStatement || "Not provided"}

**Proposed AI Approach and Mission Alignment**

${initiative.aiApproach || "Not provided"}

This initiative has been assessed as **${initiative.missionAlignmentRating || "not assessed"}** mission alignment. ${initiative.missionAlignmentReasoning || ""}

**Risk Level and Governance**

The initiative has been classified as **${initiative.riskLevel || "not assessed"} risk** and is recommended for **${initiative.governancePath || "not determined"} governance**. ${initiative.riskReasoning || ""}

**Key Risks and Dependencies**

Top risks include: ${risks.slice(0, 2).join("; ")}.

Key dependencies: ${dependencies.slice(0, 2).join("; ")}.

**Request**

I'd appreciate your guidance on next steps and whether this should enter the formal AI governance process.

Best regards,  
${initiative.userRole || "Team Member"}`;

  const handleDownloadBrief = () => {
    const blob = new Blob([initiativeBrief], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${initiative.title.replace(/[^a-z0-9]/gi, "_")}_Brief.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadEmail = () => {
    const blob = new Blob([emailSummary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${initiative.title.replace(/[^a-z0-9]/gi, "_")}_Email.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="container max-w-6xl py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-blue-900">Initiative Brief</h1>
            <p className="text-gray-600">{initiative.title}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownloadBrief} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Brief
            </Button>
            <Button onClick={handleDownloadEmail} variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Download Email
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Initiative Brief
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <Streamdown>{initiativeBrief}</Streamdown>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Email Summary for Chief AI Officer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <Streamdown>{emailSummary}</Streamdown>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <p className="text-sm text-blue-900">
              <strong>Important:</strong> This is a structured starting point for review, not an approval. 
              Final decisions rest with the Chief AI Officer and formal governance committees. 
              Please review this brief carefully before sharing with leadership.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
