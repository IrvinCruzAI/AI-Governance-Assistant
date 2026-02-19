import { invokeLLM } from "./_core/llm";

const SYSTEM_PROMPT = `You are the Travel + Leisure Co. AI Initiative Intake & Governance Assistant.

Your purpose is to help team members and leaders at Travel + Leisure Co. turn rough AI ideas into structured initiative briefs.

You assess strategic alignment using Travel + Leisure Co.'s values:
- "Putting the World on Vacation"
- Member experience excellence (personalization, convenience, memorable moments)
- Operational efficiency, brand differentiation, revenue growth

You classify risk based on:
- Member impact (direct member-facing vs internal operations)
- Data sensitivity (PII, payment data, de-identified, none)
- Automation level (recommendations only, human review required, automated actions)
- Domain (member experience, resort operations, guest services, back-office)

You are calm, structured, supportive, and use plain executive-friendly language.`;

export async function analyzeMissionAlignment(data: {
  title: string;
  problemStatement: string;
  aiApproach: string;
  primaryUsers: string;
  missionSupports: string[];
  wholePersonCareAlignment: string;
  ethicalConcerns: string;
}): Promise<{
  rating: "High" | "Medium" | "Low";
  reasoning: string;
}> {
  const prompt = `Analyze this AI initiative for strategic alignment with Travel + Leisure Co.'s mission:

**Initiative:** ${data.title}
**Problem:** ${data.problemStatement}
**AI Approach:** ${data.aiApproach}
**Primary Users:** ${data.primaryUsers}
**Strategic Supports:** ${data.missionSupports.join(", ")}
**Member Experience Alignment:** ${data.wholePersonCareAlignment}
**Ethical Concerns:** ${data.ethicalConcerns || "None mentioned"}

Provide a strategic alignment rating (High, Medium, or Low) and explain your reasoning in 2-3 sentences using Travel + Leisure Co.'s mission and member experience language.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "mission_alignment",
        strict: true,
        schema: {
          type: "object",
          properties: {
            rating: {
              type: "string",
              enum: ["High", "Medium", "Low"],
              description: "Strategic alignment rating",
            },
            reasoning: {
              type: "string",
              description: "2-3 sentence explanation using mission language",
            },
          },
          required: ["rating", "reasoning"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  const result = JSON.parse(typeof content === 'string' ? content : "{}");
  return result;
}

export async function classifyRisk(data: {
  title: string;
  problemStatement: string;
  aiApproach: string;
  mainArea: string;
  clinicalImpact: string;
  dataType: string;
  automationLevel: string;
}): Promise<{
  riskLevel: "Low" | "Medium" | "High";
  governancePath: "Light" | "Standard" | "Full";
  reasoning: string;
}> {
  const prompt = `Classify the risk level and governance path for this AI initiative:

**Initiative:** ${data.title}
**Problem:** ${data.problemStatement}
**AI Approach:** ${data.aiApproach}
**Main Area:** ${data.mainArea}
**Member Impact:** ${data.clinicalImpact}
**Data Type:** ${data.dataType}
**Automation Level:** ${data.automationLevel}

Based on hospitality-aware risk classification:
- **Low Risk:** Back-office, no PII, recommendations only → Light governance
- **Medium Risk:** Guest services/operations, PII, human review required → Standard governance
- **High Risk:** Direct member-facing, sensitive data, automated actions → Full governance

Provide the risk level, governance path, and reasoning in 2-3 sentences.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "risk_classification",
        strict: true,
        schema: {
          type: "object",
          properties: {
            riskLevel: {
              type: "string",
              enum: ["Low", "Medium", "High"],
              description: "Risk level",
            },
            governancePath: {
              type: "string",
              enum: ["Light", "Standard", "Full"],
              description: "Suggested governance path",
            },
            reasoning: {
              type: "string",
              description: "2-3 sentence explanation",
            },
          },
          required: ["riskLevel", "governancePath", "reasoning"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  const result = JSON.parse(typeof content === 'string' ? content : "{}");
  return result;
}

export async function generateRAID(data: {
  title: string;
  problemStatement: string;
  aiApproach: string;
  primaryUsers: string;
  mainArea: string;
  dataType: string;
  ethicalConcerns: string;
}): Promise<{
  risks: string[];
  assumptions: string[];
  issues: string[];
  dependencies: string[];
}> {
  const prompt = `Generate a RAID view (Risks, Assumptions, Issues, Dependencies) for this AI initiative:

**Initiative:** ${data.title}
**Problem:** ${data.problemStatement}
**AI Approach:** ${data.aiApproach}
**Primary Users:** ${data.primaryUsers}
**Main Area:** ${data.mainArea}
**Data Type:** ${data.dataType}
**Ethical Concerns:** ${data.ethicalConcerns || "None mentioned"}

Provide:
- **Risks:** 2-4 bullet points (data quality, adoption, workflow disruption, member privacy, vendor dependency)
- **Assumptions:** 2-4 bullet points (data availability, stakeholder time, leadership support)
- **Issues:** 1-3 bullet points (current blockers or problems)
- **Dependencies:** 2-4 bullet points (system integration, committee approvals, budget, training, vendor timelines)`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "raid_view",
        strict: true,
        schema: {
          type: "object",
          properties: {
            risks: {
              type: "array",
              items: { type: "string" },
              description: "2-4 risk items",
            },
            assumptions: {
              type: "array",
              items: { type: "string" },
              description: "2-4 assumption items",
            },
            issues: {
              type: "array",
              items: { type: "string" },
              description: "1-3 issue items",
            },
            dependencies: {
              type: "array",
              items: { type: "string" },
              description: "2-4 dependency items",
            },
          },
          required: ["risks", "assumptions", "issues", "dependencies"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  const result = JSON.parse(typeof content === 'string' ? content : "{}");
  return result;
}

export async function generateNextQuestion(
  currentStep: number,
  conversationHistory: Array<{ role: "assistant" | "user"; content: string }>,
  initiativeData: any
): Promise<string> {
  const prompt = `You are guiding a user through step ${currentStep} of the AI initiative intake process.

Conversation so far:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join("\n\n")}

Current initiative data:
${JSON.stringify(initiativeData, null, 2)}

Based on the conversation and the step flow, generate the next appropriate question or response. Be conversational, supportive, and clear. Follow the 6-step process:

Step 1: Welcome & Role
Step 2: Initiative Basics (title, problem, AI approach, users)
Step 3: Strategic & Member Experience Alignment
Step 4: Risk Classification
Step 5: RAID View
Step 6: Final Outputs

Provide only the next message to send to the user.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content;
  return typeof content === 'string' ? content : "Thank you for your response.";
}
