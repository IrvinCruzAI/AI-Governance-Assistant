/**
 * Seed 6 practical, executable AdventHealth AI initiative examples
 * Run with: tsx scripts/seed-examples.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import { initiatives } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const practicalIdeas = [
  {
    userId: 1,
    userRole: "Scheduling Coordinator",
    userEmail: "sarah.johnson@adventhealth.com",
    area: "clinical-operations",
    title: "Automated Patient Appointment Reminders & Scheduling Optimization",
    problemStatement: "No-show rates average 15-20% across our facilities, costing thousands in lost revenue and disrupting care continuity. Manual reminder calls are time-consuming and inconsistent. Patients also struggle to find available appointments that fit their schedules.",
    aiApproach: "Implement an AI-powered appointment reminder system that sends personalized SMS/email reminders at optimal times based on patient behavior patterns, predicts no-show likelihood, suggests optimal rescheduling times, and analyzes scheduling patterns to recommend better appointment slot allocation.",
    primaryUsers: "Scheduling coordinators, front desk staff, patients",
    patientImpact: "yes",
    patientImpactDetails: "Patients receive timely reminders and can easily reschedule, improving access to care",
    clinicalDecisions: "no",
    dataTypes: "Appointment history, patient contact information, no-show patterns",
    ethicsAlignment: "Improves access to care and reduces waste, aligning with stewardship and whole-person care values",
    missionAlignmentRating: "High",
    missionAlignmentReasoning: "Directly improves patient access and care continuity while reducing administrative burden",
    riskLevel: "Low",
    riskFactors: "Minimal risk - primarily administrative automation with patient consent for communications",
    governancePath: "Light",
    risks: "Patient privacy concerns if reminders contain PHI; potential for reminder fatigue",
    assumptions: "Patients have valid contact information; patients prefer automated reminders over manual calls",
    issues: "Integration with existing scheduling system required; need patient consent management",
    dependencies: "EHR/scheduling system API access; SMS/email service provider",
    briefGenerated: true,
    briefContent: `# AI Initiative Brief: Automated Patient Appointment Reminders

## Executive Summary
Implement AI-powered appointment reminder and scheduling optimization system to reduce 15-20% no-show rates and improve patient access.

## Problem & Opportunity
Manual reminder calls consume significant staff time while no-shows disrupt care and cost revenue.

## Proposed Solution
AI system for personalized reminders, no-show prediction, and scheduling optimization.

## Expected Impact
- 30-40% reduction in no-show rates
- 10+ hours saved per week per facility
- Improved appointment utilization and revenue

## Implementation
**Complexity:** Low (vendor solutions available)  
**Timeline:** 3-6 months  
**Resources:** Scheduling system integration, vendor partnership

## Risk Assessment
**Level:** Low  
**Governance:** Light touch review

## Next Steps
1. Evaluate vendor solutions
2. Pilot at 1-2 facilities
3. Measure no-show rate improvement
4. Scale system-wide`,
    status: "pending",
    adminNotes: null,
    department: "Patient Access",
    urgency: "medium",
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    userId: 2,
    userRole: "Hospitalist",
    userEmail: "dr.michael.chen@adventhealth.com",
    area: "clinical-care",
    title: "AI-Assisted Clinical Documentation for Discharge Summaries",
    problemStatement: "Hospitalists spend 15-20 minutes per discharge summary, often staying late to complete documentation. This leads to burnout and delays in patient discharge. Summaries are sometimes incomplete or lack important details for follow-up providers.",
    aiApproach: "Deploy AI scribe technology that listens to physician-patient conversations during discharge planning, auto-generates draft discharge summaries with key elements (diagnosis, treatment, medications, follow-up), pulls relevant data from EHR automatically, and allows physician to review/edit/approve in 2-3 minutes.",
    primaryUsers: "Hospitalists, physician assistants, nurse practitioners",
    patientImpact: "yes",
    patientImpactDetails: "Faster discharge process, more complete handoff to follow-up providers",
    clinicalDecisions: "no",
    dataTypes: "Patient conversations, EHR data (diagnosis, medications, vitals), discharge instructions",
    ethicsAlignment: "Reduces physician burnout while improving documentation quality, supporting whole-person care",
    missionAlignmentRating: "High",
    missionAlignmentReasoning: "Enables physicians to spend more time with patients by reducing documentation burden",
    riskLevel: "Medium",
    riskFactors: "Involves clinical documentation; requires physician review; potential for transcription errors",
    governancePath: "Standard",
    risks: "Transcription errors could lead to incorrect documentation; privacy concerns with voice recording",
    assumptions: "Physicians will adopt new workflow; AI transcription accuracy is sufficient; EHR integration is feasible",
    issues: "Physician training required; workflow redesign needed; EHR vendor cooperation",
    dependencies: "EHR API access; AI scribe vendor; physician buy-in and training",
    briefGenerated: true,
    briefContent: `# AI Initiative Brief: AI-Assisted Discharge Documentation

## Executive Summary
Deploy AI scribe technology to reduce discharge summary documentation time from 15 minutes to 3 minutes.

## Problem & Opportunity
Physician burnout from documentation burden; delayed discharges; incomplete summaries.

## Proposed Solution
AI scribe listens to discharge conversations, auto-generates draft summaries, physician reviews/approves.

## Expected Impact
- Reduce documentation time by 80%
- Save 200+ physician hours per month system-wide
- Improve discharge summary completeness
- Reduce physician burnout

## Implementation
**Complexity:** Medium (EHR integration, training)  
**Timeline:** 6-9 months  
**Resources:** AI scribe vendor, EHR integration, physician champions

## Risk Assessment
**Level:** Medium (clinical documentation)  
**Governance:** Standard review with clinical oversight

## Next Steps
1. Pilot with 5-10 hospitalists
2. Measure documentation time and quality
3. Gather physician feedback
4. Refine workflow and scale`,
    status: "under-review",
    adminNotes: "High priority - aligns with physician wellness initiative",
    department: "Hospital Medicine",
    urgency: "high",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-18"),
  },
  {
    userId: 3,
    userRole: "ED Nurse Manager",
    userEmail: "jennifer.martinez@adventhealth.com",
    area: "clinical-operations",
    title: "Predictive Staffing Model for Emergency Departments",
    problemStatement: "ED patient volumes fluctuate unpredictably, leading to either overstaffing (wasted resources) or understaffing (long wait times, poor patient experience). Current staffing models rely on historical averages and don't account for real-time factors like weather, local events, or flu season.",
    aiApproach: "Build a predictive analytics model that forecasts ED patient volume 24-72 hours in advance, considers weather, day of week, local events, seasonal trends, and historical patterns, recommends optimal staffing levels by hour, and sends alerts when predicted volume exceeds current staffing capacity.",
    primaryUsers: "ED nurse managers, staffing coordinators, hospital operations leaders",
    patientImpact: "yes",
    patientImpactDetails: "Reduced wait times, better nurse-to-patient ratios, improved care quality",
    clinicalDecisions: "no",
    dataTypes: "Historical ED visit data, weather data, local event calendars, seasonal trends",
    ethicsAlignment: "Optimizes resource allocation to improve patient care and reduce staff burnout",
    missionAlignmentRating: "High",
    missionAlignmentReasoning: "Improves patient experience and staff well-being through better resource planning",
    riskLevel: "Low",
    riskFactors: "Operational decision support; no direct patient care impact; predictions are recommendations",
    governancePath: "Light",
    risks: "Inaccurate predictions could lead to poor staffing decisions; over-reliance on model",
    assumptions: "Historical patterns are predictive of future volumes; external data sources are reliable",
    issues: "Data integration from multiple sources; model training and validation; change management",
    dependencies: "ED visit data access; weather API; local event data; staffing system integration",
    briefGenerated: true,
    briefContent: `# AI Initiative Brief: Predictive ED Staffing

## Executive Summary
AI-powered predictive model to forecast ED patient volume and optimize staffing 24-72 hours in advance.

## Problem & Opportunity
Unpredictable ED volumes lead to overstaffing or understaffing, impacting costs and patient experience.

## Proposed Solution
Predictive analytics considering weather, events, seasonality, and historical patterns.

## Expected Impact
- 20-30% reduction in wait times
- 10-15% optimization in staffing costs
- Improved patient satisfaction
- Reduced staff overtime and burnout

## Implementation
**Complexity:** Medium (data integration, model training)  
**Timeline:** 6-9 months  
**Resources:** Data science team, ED leadership, staffing coordinators

## Risk Assessment
**Level:** Low (operational support)  
**Governance:** Light touch review

## Next Steps
1. Collect and integrate data sources
2. Build and validate predictive model
3. Pilot at 1-2 EDs
4. Measure impact on wait times and staffing costs`,
    status: "pending",
    adminNotes: null,
    department: "Emergency Medicine",
    urgency: "high",
    createdAt: new Date("2025-01-12"),
    updatedAt: new Date("2025-01-12"),
  },
  {
    userId: 4,
    userRole: "Prior Authorization Specialist",
    userEmail: "amanda.rodriguez@adventhealth.com",
    area: "back-office",
    title: "Automated Prior Authorization Assistant",
    problemStatement: "Prior authorization requests take 20-30 minutes each to complete manually. Staff spend hours on hold with insurance companies, gathering documentation, and filling out redundant forms. Delays in authorization lead to delayed care and patient frustration.",
    aiApproach: "Implement an AI assistant that auto-fills prior authorization forms using data from EHR, predicts which procedures/medications will require prior auth, tracks authorization status and sends automated follow-ups, and identifies patterns in denials to suggest alternative approaches.",
    primaryUsers: "Prior authorization specialists, case managers, physicians",
    patientImpact: "yes",
    patientImpactDetails: "Faster authorization turnaround means quicker access to needed care and medications",
    clinicalDecisions: "no",
    dataTypes: "EHR data (diagnoses, procedures, medications), insurance policies, authorization history",
    ethicsAlignment: "Improves patient access to care by reducing administrative delays",
    missionAlignmentRating: "High",
    missionAlignmentReasoning: "Removes barriers to care access, aligning with healing ministry values",
    riskLevel: "Low",
    riskFactors: "Administrative automation; physician retains final decision-making",
    governancePath: "Light",
    risks: "Incorrect form completion could delay authorization; payer system integration challenges",
    assumptions: "Payers will accept automated submissions; EHR data is accurate and complete",
    issues: "Integration with multiple payer systems; workflow redesign; staff training",
    dependencies: "EHR API access; payer portal integrations; authorization tracking system",
    briefGenerated: true,
    briefContent: `# AI Initiative Brief: Automated Prior Authorization

## Executive Summary
AI assistant to automate prior authorization form completion and tracking, reducing processing time from 30 minutes to 5 minutes.

## Problem & Opportunity
Manual prior auth process delays care, frustrates patients, and consumes significant staff time.

## Proposed Solution
AI auto-fills forms from EHR, predicts auth requirements, tracks status, identifies denial patterns.

## Expected Impact
- Reduce time per prior auth by 80%
- Process 3-4x more authorizations per staff member
- Reduce turnaround from 3-5 days to 24-48 hours
- Improve patient satisfaction and care access

## Implementation
**Complexity:** Medium (payer integration, workflow redesign)  
**Timeline:** 6-12 months  
**Resources:** Revenue cycle team, payer partnerships, EHR integration

## Risk Assessment
**Level:** Low (administrative automation)  
**Governance:** Light touch review

## Next Steps
1. Map current prior auth workflow
2. Identify key payer integration opportunities
3. Pilot with high-volume procedures
4. Measure time savings and approval rates`,
    status: "pending",
    adminNotes: null,
    department: "Revenue Cycle",
    urgency: "high",
    createdAt: new Date("2025-01-14"),
    updatedAt: new Date("2025-01-14"),
  },
  {
    userId: 5,
    userRole: "Bedside Nurse",
    userEmail: "emily.thompson@adventhealth.com",
    area: "clinical-care",
    title: "Fall Risk Prediction & Alert System for Inpatient Units",
    problemStatement: "Patient falls are a leading cause of hospital-acquired injuries, resulting in longer stays, increased costs, and poor outcomes. Current fall risk assessments are manual, subjective, and often outdated. High-risk patients aren't always identified in time.",
    aiApproach: "Deploy a real-time fall risk prediction system that continuously analyzes patient data (vitals, medications, mobility, cognition, age), predicts fall risk score in real-time and updates as conditions change, alerts nurses when a patient's risk level increases, and suggests specific interventions (bed alarm, hourly rounding, mobility assistance).",
    primaryUsers: "Bedside nurses, charge nurses, patient safety coordinators",
    patientImpact: "yes",
    patientImpactDetails: "Prevents falls and serious injuries, improving patient safety and outcomes",
    clinicalDecisions: "no",
    dataTypes: "Patient vitals, medications, mobility assessments, cognitive status, age, prior fall history",
    ethicsAlignment: "Directly protects patient safety and prevents harm, core to healing ministry",
    missionAlignmentRating: "High",
    missionAlignmentReasoning: "Prevents patient harm and improves safety outcomes",
    riskLevel: "Medium",
    riskFactors: "Clinical decision support; alerts must be accurate to avoid alarm fatigue; nurse judgment still required",
    governancePath: "Standard",
    risks: "False positives could cause alarm fatigue; false negatives could miss high-risk patients; over-reliance on AI",
    assumptions: "EHR data is accurate and up-to-date; nurses will respond to alerts; interventions are effective",
    issues: "EHR integration; nurse workflow integration; alert threshold tuning; training",
    dependencies: "EHR API access; nurse call system integration; patient safety team buy-in",
    briefGenerated: true,
    briefContent: `# AI Initiative Brief: Fall Risk Prediction System

## Executive Summary
Real-time AI system to predict patient fall risk and alert nurses, preventing hospital-acquired injuries.

## Problem & Opportunity
Patient falls cause injuries, longer stays, and poor outcomes. Manual assessments are outdated and subjective.

## Proposed Solution
AI continuously analyzes patient data, predicts fall risk in real-time, alerts nurses, suggests interventions.

## Expected Impact
- Reduce inpatient falls by 25-35%
- Prevent serious injuries and associated costs
- Improve patient safety metrics and HCAHPS scores
- Reduce nurse liability and stress

## Implementation
**Complexity:** Medium (EHR integration, workflow training)  
**Timeline:** 6-9 months  
**Resources:** Patient safety team, nursing leadership, EHR integration

## Risk Assessment
**Level:** Medium (clinical decision support)  
**Governance:** Standard review with clinical oversight

## Next Steps
1. Pilot on 1-2 medical-surgical units
2. Tune alert thresholds to minimize false positives
3. Train nurses on responding to alerts
4. Measure fall rate reduction`,
    status: "pending",
    adminNotes: null,
    department: "Nursing / Patient Safety",
    urgency: "high",
    createdAt: new Date("2025-01-16"),
    updatedAt: new Date("2025-01-16"),
  },
  {
    userId: 6,
    userRole: "Pharmacist",
    userEmail: "david.kim@adventhealth.com",
    area: "clinical-support",
    title: "Pharmacy Inventory Optimization & Expiration Tracking",
    problemStatement: "Medication waste due to expiration costs tens of thousands annually. Manual inventory tracking is time-consuming and error-prone. Pharmacies often run out of critical medications while overstocking others. Staff spend hours counting and reordering.",
    aiApproach: "Implement an AI-powered inventory management system that predicts medication usage patterns based on historical data and patient census, automatically generates reorder recommendations, tracks expiration dates and alerts staff 30/60/90 days in advance, suggests redistribution of near-expiry medications to high-use units, and optimizes par levels to minimize waste while preventing stockouts.",
    primaryUsers: "Pharmacists, pharmacy technicians, supply chain coordinators",
    patientImpact: "yes",
    patientImpactDetails: "Ensures critical medications are always available when needed",
    clinicalDecisions: "no",
    dataTypes: "Medication usage history, patient census, expiration dates, inventory levels, reorder lead times",
    ethicsAlignment: "Reduces waste and ensures medication availability, supporting stewardship and patient care",
    missionAlignmentRating: "Medium",
    missionAlignmentReasoning: "Improves operational efficiency and resource stewardship",
    riskLevel: "Low",
    riskFactors: "Operational support; pharmacist retains final ordering decisions; low patient risk",
    governancePath: "Light",
    risks: "Inaccurate predictions could lead to stockouts or overstocking; system dependency",
    assumptions: "Historical usage patterns are predictive; census data is accurate; vendor lead times are consistent",
    issues: "Integration with pharmacy system; vendor partnerships; staff training",
    dependencies: "Pharmacy system API; supply chain system integration; vendor catalogs",
    briefGenerated: true,
    briefContent: `# AI Initiative Brief: Pharmacy Inventory Optimization

## Executive Summary
AI-powered inventory management to reduce medication waste and prevent stockouts.

## Problem & Opportunity
Medication expiration waste costs tens of thousands annually. Manual tracking is time-consuming and error-prone.

## Proposed Solution
AI predicts usage, automates reordering, tracks expirations, suggests redistribution, optimizes par levels.

## Expected Impact
- Reduce medication waste by 40-50%
- Save $50K-$100K annually per facility
- Reduce stockouts by 80%
- Free up 10+ pharmacy staff hours per week

## Implementation
**Complexity:** Low (vendor solutions available)  
**Timeline:** 3-6 months  
**Resources:** Pharmacy leadership, supply chain, vendor partnership

## Risk Assessment
**Level:** Low (operational support)  
**Governance:** Light touch review

## Next Steps
1. Evaluate vendor solutions
2. Pilot at 1-2 pharmacies
3. Measure waste reduction and cost savings
4. Scale system-wide`,
    status: "pending",
    adminNotes: null,
    department: "Pharmacy",
    urgency: "medium",
    createdAt: new Date("2025-01-17"),
    updatedAt: new Date("2025-01-17"),
  },
];

async function seed() {
  console.log("Clearing existing initiatives...");
  await db.delete(initiatives);

  console.log("Seeding 6 practical AI initiative examples...");
  for (const idea of practicalIdeas) {
    await db.insert(initiatives).values(idea);
  }

  console.log(`✅ Successfully seeded ${practicalIdeas.length} practical AI initiatives`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
