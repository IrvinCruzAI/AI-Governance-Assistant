# AdventHealth AI Initiative Intake & Governance Assistant

A comprehensive web application that guides AdventHealth team members through evaluating AI initiatives using a structured governance framework, mission alignment assessment, and risk classification system.

## Overview

This tool helps staff and leaders at AdventHealth turn rough AI ideas into structured initiative briefs ready for review by the Chief AI Officer's team. It provides:

- **Guided Conversation Flow**: 6-step interactive process to gather initiative details
- **AI-Powered Analysis**: Automated mission alignment and risk classification using LLM
- **RAID Generation**: Automatic generation of Risks, Assumptions, Issues, and Dependencies
- **Professional Briefs**: Structured initiative briefs and email summaries for leadership
- **Progress Tracking**: Save and resume initiatives, view past submissions

## Features

### 1. Initiative Basics (Step 2)
- Collect working title, problem statement, AI approach, and primary users
- Summarize and confirm understanding before proceeding

### 2. Mission & Ethics Alignment (Step 3)
- Assess alignment with AdventHealth's mission and whole-person care values
- Identify ethical concerns and potential risks
- AI-powered rating: High, Medium, or Low alignment

### 3. Risk Classification (Step 4)
- Classify based on clinical impact, data sensitivity, and automation level
- Determine appropriate governance path: Light, Standard, or Full
- AI-powered risk assessment with clear reasoning

### 4. RAID View Generation (Step 5)
- Automatically generate comprehensive RAID analysis
- Identify key risks, assumptions, issues, and dependencies
- Allow user review and refinement

### 5. Final Outputs (Step 6)
- **Initiative Brief**: Comprehensive markdown document with all details
- **Email Summary**: Concise summary for Chief AI Officer's team
- **Export Options**: Download as markdown or text files

## Technology Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB with Drizzle ORM
- **AI Integration**: Built-in LLM service with structured JSON responses
- **Authentication**: Manus OAuth

## User Guide

### Starting a New Initiative

1. **Sign In**: Click "Sign In to Get Started" on the home page
2. **Create Initiative**: Click "Start New Initiative"
3. **Provide Context**: Enter your role and select the primary area
4. **Begin Evaluation**: Click "Begin Evaluation" to start the guided conversation

### Completing the Evaluation

The assistant will guide you through 6 steps:

1. **Welcome & Role**: Confirm your role and area
2. **Initiative Basics**: Provide title, problem, AI approach, and users
3. **Mission Alignment**: Assess mission fit and ethical considerations
4. **Risk Classification**: Answer questions about clinical impact, data, and automation
5. **RAID Review**: Review and refine the generated RAID analysis
6. **Final Brief**: Download your completed initiative brief and email summary

### Viewing Past Initiatives

- Return to the home page to see all your initiatives
- Click on any initiative card to view or continue
- Completed initiatives are marked with a green "Completed" badge
- In-progress initiatives show current step progress

### Downloading Briefs

1. Complete the evaluation (reach Step 6)
2. Click "View Final Brief" button
3. Use "Download Brief" for the full markdown document
4. Use "Download Email" for the email summary

## Design Philosophy

### AdventHealth Branding

- **Colors**: Healthcare blue (#0080D6) and teal accents
- **Typography**: Inter font family for professional, readable text
- **Layout**: Clean, spacious design with clear visual hierarchy
- **Accessibility**: High contrast, keyboard navigation, screen reader support

### User Experience

- **Conversational**: Natural, supportive dialogue throughout
- **Progressive**: Step-by-step guidance with clear progress indicators
- **Forgiving**: Save progress automatically, resume anytime
- **Transparent**: AI reasoning is always explained in plain language

## AI Governance Framework

### Mission Alignment Criteria

- Patient safety
- Health equity
- Reducing clinician or staff burnout
- Improving access to care
- Improving patient and family experience
- Operational efficiency
- Whole-person care (physical, emotional, spiritual, social)
- "Extending the Healing Ministry of Christ"

### Risk Classification Model

**Low Risk** → Light Governance
- Back-office applications
- No PHI or de-identified data only
- Suggestions only, human decision-making

**Medium Risk** → Standard Governance
- Clinical support or operations
- Protected health information (PHI)
- Human review required for all actions

**High Risk** → Full Clinical Governance
- Direct clinical decisions
- Highly sensitive data
- Automated actions affecting patient care

## Development

### Running Tests

```bash
pnpm test
```

All tRPC procedures have comprehensive vitest coverage including:
- Initiative creation and updates
- Message management
- AI-powered analysis functions
- Authentication flows

### Database Schema

**initiatives**: Stores all initiative data including assessments and RAID
**messages**: Stores conversation history for each initiative
**users**: Manages authentication and user profiles

### AI Service

The `aiService.ts` module provides:
- `analyzeMissionAlignment()`: Rates mission fit and provides reasoning
- `classifyRisk()`: Determines risk level and governance path
- `generateRAID()`: Creates comprehensive RAID analysis
- `generateNextQuestion()`: Powers conversational flow

All AI functions use structured JSON responses with strict schemas for reliability.

## Deployment

The application is ready for deployment through the Manus platform:

1. Create a checkpoint using the "Save Checkpoint" feature
2. Click "Publish" in the management UI
3. Configure custom domain if desired
4. Share the URL with your team

## Support

For questions, issues, or feature requests related to the Manus platform, visit [https://help.manus.im](https://help.manus.im).

For AdventHealth-specific questions about AI governance, contact your Chief AI Officer's team.

## License

Copyright © 2024 AdventHealth. All rights reserved.
