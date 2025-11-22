# AdventHealth AI Initiative Intake & Governance Assistant

A structured multi-step intake form that guides AdventHealth team members through submitting well-thought-out AI initiative proposals for review by the Chief AI Officer's team.

## Overview

This tool transforms rough AI ideas into comprehensive, structured proposals through a guided questionnaire format. It provides:

- **Multi-Step Intake Form**: 4-step wizard with clear progress tracking
- **Structured Questions**: Radio buttons, checkboxes, dropdowns, and text fields
- **AI-Powered Analysis**: Automated mission alignment and risk classification
- **RAID Generation**: Automatic generation of Risks, Assumptions, Issues, and Dependencies
- **Professional Briefs**: Downloadable initiative briefs and email summaries
- **Progress Saving**: Save and resume at any time

## Features

### Step 1: Basic Information
- Initiative title (required)
- Your role at AdventHealth
- Primary area (clinical care, clinical support, operations, back-office)

### Step 2: Problem & Solution
- Problem or opportunity description (required)
- How AI might help (required)
- Primary users or affected groups

### Step 3: Mission & Ethics Alignment
- Select mission support areas (patient safety, health equity, burnout reduction, etc.)
- Describe whole-person care alignment (required)
- Identify potential ethical concerns

### Step 4: Risk Classification
- Main area the AI touches (clinical decisions, support, operations, back-office)
- Clinical impact level (no direct effect, indirect, direct low/high stakes)
- Data type (no personal data, de-identified, PHI, highly sensitive)
- Automation level (suggestions only, review required, automated actions)

### Step 5: Review & Submit
- View AI-generated mission alignment rating (High/Medium/Low)
- View risk classification (Low/Medium/High) and governance path
- Download complete initiative brief
- Download email summary for Chief AI Officer

## Technology Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB with Drizzle ORM
- **AI Integration**: Built-in LLM service with structured JSON responses
- **Authentication**: Manus OAuth
- **Form Validation**: Real-time validation with toast notifications

## User Guide

### Starting a New Initiative

1. **Sign In**: Click "Sign In to Get Started" on the home page
2. **Create Initiative**: Click "Start New Initiative"
3. **Provide Context**: Enter your role and select the primary area
4. **Begin Evaluation**: Click "Begin Evaluation" to start the intake form

### Completing the Intake Form

Navigate through 4 steps using the "Next" and "Back" buttons:

1. **Basic Information**: Provide title, role, and area
2. **Problem & Solution**: Describe the problem and AI approach
3. **Mission & Ethics**: Select mission supports and describe alignment
4. **Risk Classification**: Answer questions about area, impact, data, and automation

After Step 4, click "Submit for Analysis" to:
- Automatically analyze mission alignment
- Classify risk level and recommend governance path
- Generate comprehensive RAID view
- Create downloadable brief and email summary

### Form Validation

- Required fields are marked with *
- Validation occurs when clicking "Next"
- Error messages appear as toast notifications
- Progress is automatically saved after each step

### Viewing Past Initiatives

- Return to the home page to see all your initiatives
- Click on any initiative card to view or continue
- Completed initiatives show mission alignment and risk ratings
- In-progress initiatives show current step (e.g., "Step 2 of 4")

### Downloading Briefs

1. Complete all 4 steps and submit for analysis
2. View the review page with analysis results
3. Click "View Complete Brief & Download"
4. Use "Download Brief" for markdown document
5. Use "Download Email" for email summary

## Design Philosophy

### Intake Form UX

- **Clear Progress**: Visual progress bar with step labels
- **Structured Input**: Appropriate input types for each question
- **Validation**: Real-time feedback on required fields
- **Flexibility**: Save progress and return anytime
- **Transparency**: AI reasoning explained in plain language

### AdventHealth Branding

- **Colors**: Healthcare blue (#0080D6) and teal accents
- **Typography**: Inter font family for professional, readable text
- **Layout**: Clean, spacious design with clear visual hierarchy
- **Accessibility**: High contrast, keyboard navigation, screen reader support

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
- Form data persistence
- AI-powered analysis functions
- Authentication flows

### Database Schema

**initiatives**: Stores all initiative data including form responses and AI analysis
**messages**: Stores conversation history (legacy from chat version)
**users**: Manages authentication and user profiles

### AI Service

The `aiService.ts` module provides:
- `analyzeMissionAlignment()`: Rates mission fit and provides reasoning
- `classifyRisk()`: Determines risk level and governance path
- `generateRAID()`: Creates comprehensive RAID analysis

All AI functions use structured JSON responses with strict schemas for reliability.

## Form Fields Reference

### Step 1 Fields
- `title` (text, required)
- `userRole` (text, optional)
- `area` (dropdown, optional)

### Step 2 Fields
- `problemStatement` (textarea, required)
- `aiApproach` (textarea, required)
- `primaryUsers` (text, optional)

### Step 3 Fields
- `missionSupports` (checkbox group, required - at least one)
- `wholePersonCareAlignment` (textarea, required)
- `ethicalConcerns` (textarea, optional)

### Step 4 Fields
- `mainArea` (radio group, required)
- `clinicalImpact` (radio group, required)
- `dataType` (radio group, required)
- `automationLevel` (radio group, required)

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
