/**
 * Seed realistic AdventHealth AI initiative examples
 * Run with: node scripts/seed-examples.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import { initiatives } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const exampleInitiatives = [
  {
    userId: 1, // Owner user
    title: "AI-Powered Patient Discharge Summary Generator",
    userRole: "Hospitalist Physician",
    area: "clinical-care",
    problemStatement: "Physicians spend 45-60 minutes per patient creating discharge summaries, taking time away from patient care. The summaries often miss key details from the full hospital stay.",
    aiApproach: "Use AI to analyze the patient's full EHR record during hospitalization and generate a comprehensive discharge summary draft that physicians can review and finalize in 5-10 minutes.",
    targetUsers: "Hospitalist physicians, case managers, and discharge coordinators across all 50 AdventHealth hospitals",
    missionSupports: JSON.stringify(["Reducing clinician burnout", "Improving patient experience"]),
    wholePersonCareAlignment: "Gives physicians more time for meaningful patient interactions addressing physical, emotional, and spiritual needs before discharge",
    ethicalConcerns: "None identified - physician always reviews and approves final summary",
    clinicalImpact: "indirect",
    dataType: "phi",
    automationLevel: "human-review",
    missionAlignmentRating: "High",
    missionAlignmentReasoning: "Directly reduces physician burnout while improving discharge quality and patient experience",
    riskLevel: "Medium",
    riskReasoning: "Uses PHI and affects clinical documentation, but physician review required before finalization",
    governancePath: "Standard",
    raidData: JSON.stringify({
      risks: ["AI may miss nuanced clinical details", "Integration with Epic EHR required", "Physician trust in AI-generated content"],
      assumptions: ["EHR data is complete and accurate", "Physicians will adopt the tool", "Discharge summary format remains consistent"],
      issues: ["Current discharge summaries are inconsistent in quality", "No standardized template across facilities"],
      dependencies: ["Epic integration team", "Clinical informatics approval", "Physician training program"]
    }),
    status: "pending",
    currentStep: 6,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    userId: 1,
    title: "Predictive Scheduling for OR Block Time Optimization",
    userRole: "OR Manager",
    area: "clinical-operations",
    problemStatement: "We waste 15-20% of OR block time due to inaccurate surgery duration estimates. Surgeons either rush or leave expensive OR time unused.",
    aiApproach: "Train an AI model on historical surgery data to predict actual procedure duration based on surgeon, procedure type, patient factors, and time of day. Automatically suggest optimal OR scheduling.",
    targetUsers: "OR schedulers, surgeons, and perioperative staff across all surgical centers",
    missionSupports: JSON.stringify(["Operational efficiency", "Improving access to care"]),
    wholePersonCareAlignment: "Reduces patient wait times for surgery and minimizes last-minute schedule changes that cause patient anxiety",
    ethicalConcerns: "None - scheduling optimization doesn't affect clinical decisions",
    clinicalImpact: "none",
    dataType: "de-identified",
    automationLevel: "suggestions",
    missionAlignmentRating: "Medium",
    missionAlignmentReasoning: "Improves operational efficiency and access to care, but indirect impact on patient outcomes",
    riskLevel: "Low",
    riskReasoning: "Uses de-identified data, provides suggestions only, no direct clinical impact",
    governancePath: "Light",
    raidData: JSON.stringify({
      risks: ["Surgeon resistance to AI-suggested schedules", "Model accuracy varies by specialty"],
      assumptions: ["Historical data reflects future patterns", "Schedulers will use the recommendations"],
      issues: ["Current scheduling system is manual and time-consuming"],
      dependencies: ["Access to historical OR data", "Integration with scheduling software"]
    }),
    status: "under-review",
    currentStep: 6,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    userId: 1,
    title: "Ambient Clinical Documentation with DAX Copilot",
    userRole: "Primary Care Physician",
    area: "clinical-care",
    problemStatement: "Physicians spend 2-3 hours after clinic documenting visits in the EHR, leading to burnout and reducing time with family. Patients feel physicians focus more on computers than on them during visits.",
    aiApproach: "Deploy Microsoft DAX Copilot to listen to patient-physician conversations and automatically generate clinical notes, allowing physicians to maintain eye contact and focus fully on the patient.",
    targetUsers: "Primary care physicians, specialists, and advanced practice providers across all outpatient clinics",
    missionSupports: JSON.stringify(["Reducing clinician burnout", "Improving patient experience", "Whole-person care"]),
    wholePersonCareAlignment: "Enables physicians to be fully present with patients, addressing emotional and spiritual needs alongside physical health without distraction",
    ethicalConcerns: "Patient consent required for recording conversations; privacy concerns about AI listening to sensitive discussions",
    clinicalImpact: "indirect",
    dataType: "phi",
    automationLevel: "human-review",
    missionAlignmentRating: "High",
    missionAlignmentReasoning: "Directly addresses clinician burnout and patient experience while enabling whole-person care",
    riskLevel: "Medium",
    riskReasoning: "Handles sensitive PHI and patient conversations, but physician reviews all documentation",
    governancePath: "Standard",
    raidData: JSON.stringify({
      risks: ["Patient privacy concerns", "AI misinterpretation of medical terminology", "Physician over-reliance on AI notes"],
      assumptions: ["Patients will consent to recording", "Physicians will review and edit notes", "Microsoft maintains HIPAA compliance"],
      issues: ["Current documentation burden is unsustainable", "Patient satisfaction scores declining"],
      dependencies: ["Microsoft DAX licensing", "Epic integration", "Patient consent workflow", "Physician training"]
    }),
    status: "approved",
    adminNotes: "Approved for pilot with 10 primary care physicians. Requires patient consent process and quarterly review.",
    currentStep: 6,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    userId: 1,
    title: "AI Chatbot for Employee Benefits Questions",
    userRole: "HR Benefits Coordinator",
    area: "back-office",
    problemStatement: "HR receives 200+ repetitive questions per week about benefits enrollment, PTO policies, and insurance coverage. Staff spend hours answering the same questions instead of handling complex cases.",
    aiApproach: "Deploy an AI chatbot trained on AdventHealth HR policies, benefits documentation, and FAQs to answer employee questions 24/7 via Teams or the employee portal.",
    targetUsers: "All 80,000+ AdventHealth employees",
    missionSupports: JSON.stringify(["Operational efficiency"]),
    wholePersonCareAlignment: "Helps employees quickly resolve benefits questions, reducing stress and allowing them to focus on patient care",
    ethicalConcerns: "None - public HR policy information only",
    clinicalImpact: "none",
    dataType: "no-personal-data",
    automationLevel: "automated",
    missionAlignmentRating: "Low",
    missionAlignmentReasoning: "Improves operational efficiency but limited direct impact on patient care or mission",
    riskLevel: "Low",
    riskReasoning: "No personal data, no clinical impact, automated responses for non-sensitive information",
    governancePath: "Light",
    raidData: JSON.stringify({
      risks: ["Chatbot provides incorrect policy information", "Employees frustrated by lack of human touch"],
      assumptions: ["HR policies are well-documented", "Employees prefer self-service"],
      issues: ["Current HR response time is 24-48 hours"],
      dependencies: ["HR policy documentation", "Teams integration", "IT security approval"]
    }),
    status: "pending",
    currentStep: 6,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    userId: 1,
    title: "Sepsis Early Warning System",
    userRole: "ICU Nurse Manager",
    area: "clinical-care",
    problemStatement: "Sepsis kills 1 in 3 patients who die in hospitals. Early detection is critical, but nurses and physicians often miss subtle early warning signs until the patient deteriorates.",
    aiApproach: "Implement an AI model that continuously monitors vital signs, lab values, and clinical notes to detect early sepsis patterns and alert the care team 6-12 hours before traditional criteria are met.",
    targetUsers: "ICU nurses, hospitalists, and rapid response teams",
    missionSupports: JSON.stringify(["Patient safety", "Improving patient outcomes"]),
    wholePersonCareAlignment: "Saves lives and prevents suffering, allowing patients to recover and return to their families",
    ethicalConcerns: "Risk of alert fatigue if false positive rate is high; potential for over-treatment if AI is overly sensitive",
    clinicalImpact: "direct",
    dataType: "phi",
    automationLevel: "human-review",
    missionAlignmentRating: "High",
    missionAlignmentReasoning: "Directly improves patient safety and outcomes, core to healing ministry",
    riskLevel: "High",
    riskReasoning: "Direct clinical decision support affecting life-threatening conditions, uses PHI, requires immediate action",
    governancePath: "Full",
    raidData: JSON.stringify({
      risks: ["False positives cause alert fatigue", "False negatives miss sepsis cases", "Clinicians may over-rely on AI", "Regulatory scrutiny as potential medical device"],
      assumptions: ["EHR data is real-time and accurate", "Clinicians will respond to alerts promptly", "Model performs equally across patient populations"],
      issues: ["Current sepsis detection is reactive, not proactive", "No standardized early warning system"],
      dependencies: ["Epic integration for real-time data", "Clinical validation study", "FDA regulatory review", "Nursing workflow redesign", "24/7 rapid response team"]
    }),
    status: "pending",
    currentStep: 6,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    userId: 1,
    title: "Automated Prior Authorization for Common Procedures",
    userRole: "Revenue Cycle Manager",
    area: "back-office",
    problemStatement: "Staff spend 15-20 hours per week on prior authorizations for routine procedures like MRIs and physical therapy. Delays frustrate patients and physicians.",
    aiApproach: "Use AI to automatically complete prior authorization forms by extracting relevant clinical information from the EHR and submitting to insurance companies, with staff review only for denials.",
    targetUsers: "Prior authorization staff, schedulers, and patients awaiting approval",
    missionSupports: JSON.stringify(["Improving access to care", "Operational efficiency"]),
    wholePersonCareAlignment: "Reduces delays in care, allowing patients to receive needed treatments faster",
    ethicalConcerns: "None - administrative process only",
    clinicalImpact: "none",
    dataType: "phi",
    automationLevel: "automated",
    missionAlignmentRating: "Medium",
    missionAlignmentReasoning: "Improves access to care and efficiency, but indirect impact on patient outcomes",
    riskLevel: "Low",
    riskReasoning: "Administrative process, no clinical decisions, PHI handled securely",
    governancePath: "Light",
    raidData: JSON.stringify({
      risks: ["AI submits incomplete or incorrect information", "Insurance companies reject automated submissions"],
      assumptions: ["Insurance portals accept automated submissions", "EHR contains all required information"],
      issues: ["Current prior auth process causes 3-5 day delays"],
      dependencies: ["Integration with insurance portals", "EHR data extraction", "Compliance review"]
    }),
    status: "under-review",
    adminNotes: "Reviewing with compliance team to ensure HIPAA requirements are met for automated submissions.",
    currentStep: 6,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    userId: 1,
    title: "Virtual Nursing Assistant for Patient Education",
    userRole: "Nurse Educator",
    area: "clinical-support",
    problemStatement: "Patients forget 40-80% of what nurses teach them about post-discharge care. Readmission rates are high because patients don't understand medication instructions or warning signs.",
    aiApproach: "Create an AI-powered virtual nurse avatar that patients can access via tablet or phone to ask questions about their care plan, medications, and recovery. Available 24/7 in multiple languages.",
    targetUsers: "All hospitalized patients and their families",
    missionSupports: JSON.stringify(["Improving patient experience", "Patient safety", "Health equity"]),
    wholePersonCareAlignment: "Empowers patients with knowledge and support, addressing their concerns and fears about recovery",
    ethicalConcerns: "Must not replace human nursing care; patients may prefer human interaction for sensitive questions",
    clinicalImpact: "indirect",
    dataType: "phi",
    automationLevel: "suggestions",
    missionAlignmentRating: "High",
    missionAlignmentReasoning: "Improves patient safety, experience, and health equity through accessible education",
    riskLevel: "Medium",
    riskReasoning: "Provides patient education affecting care decisions, uses PHI, but suggestions only",
    governancePath: "Standard",
    raidData: JSON.stringify({
      risks: ["Patients may follow AI advice without consulting nurse", "Language translation errors", "Digital divide excludes some patients"],
      assumptions: ["Patients have access to devices", "Content is clinically accurate", "Patients will use the tool"],
      issues: ["Current patient education is inconsistent", "Language barriers limit understanding"],
      dependencies: ["Multilingual content development", "Clinical validation of responses", "Patient portal integration", "Accessibility compliance"]
    }),
    status: "pending",
    currentStep: 6,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    userId: 1,
    title: "AI-Assisted Radiology Report Prioritization",
    userRole: "Radiologist",
    area: "clinical-support",
    problemStatement: "Radiologists read scans in the order they arrive, but some contain critical findings (like pulmonary embolism) that need immediate attention. Delays can be life-threatening.",
    aiApproach: "Use AI to analyze incoming radiology scans and flag critical findings, automatically moving those studies to the top of the radiologist's worklist for immediate review.",
    targetUsers: "Radiologists and emergency department physicians",
    missionSupports: JSON.stringify(["Patient safety", "Improving patient outcomes"]),
    wholePersonCareAlignment: "Saves lives by ensuring critical findings are addressed immediately",
    ethicalConcerns: "Radiologist must still review all scans; AI prioritization should not delay non-critical but important findings",
    clinicalImpact: "indirect",
    dataType: "phi",
    automationLevel: "suggestions",
    missionAlignmentRating: "High",
    missionAlignmentReasoning: "Directly improves patient safety and outcomes by accelerating critical diagnoses",
    riskLevel: "Medium",
    riskReasoning: "Affects clinical workflow and timing of diagnoses, uses PHI, but radiologist makes final decisions",
    governancePath: "Standard",
    raidData: JSON.stringify({
      risks: ["AI misses critical findings", "Over-prioritization causes alert fatigue", "Non-critical cases delayed"],
      assumptions: ["AI accuracy is validated", "Radiologists trust the prioritization", "PACS integration is seamless"],
      issues: ["Current first-in-first-out approach delays critical findings"],
      dependencies: ["PACS integration", "AI model validation study", "Radiologist training", "FDA clearance if marketed as medical device"]
    }),
    status: "pending",
    currentStep: 6,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

async function seed() {
  try {
    console.log("🌱 Seeding realistic AdventHealth AI initiative examples...");
    
    // Insert all examples
    for (const initiative of exampleInitiatives) {
      await db.insert(initiatives).values(initiative);
      console.log(`✅ Created: ${initiative.title}`);
    }
    
    console.log(`\n🎉 Successfully seeded ${exampleInitiatives.length} initiative examples!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
