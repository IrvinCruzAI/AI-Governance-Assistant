# AdventHealth AI Initiative Intake & Governance Assistant

A world-class web application for submitting, evaluating, and managing AI initiative proposals at AdventHealth. Features a stunning glassmorphism design, educational landing page, structured intake form, and comprehensive admin dashboard.

## Overview

This application transforms the AI governance process into an engaging, user-friendly experience that drives innovation while ensuring patient safety, mission alignment, and ethical standards.

### Key Features

**For Team Members:**
- Educational landing page explaining AI governance
- Beautiful 4-step intake form with glassmorphism design
- AI-powered mission alignment analysis
- Automated risk classification and governance path recommendations
- Comprehensive RAID (Risks, Assumptions, Issues, Dependencies) generation
- Downloadable initiative briefs and email summaries
- Save and resume progress at any time

**For Administrators:**
- Comprehensive admin dashboard with analytics
- Review queue with filtering by status, risk level, and area
- Initiative detail view with full submission history
- Status management (Pending, Under Review, Approved, Rejected)
- Admin notes and comments
- Real-time analytics on submissions, risk levels, and approval rates

## Technology Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4 with glassmorphism design
- **Backend**: Express 4 + tRPC 11 for type-safe APIs
- **Database**: MySQL/TiDB with Drizzle ORM
- **AI Integration**: Built-in LLM service with structured JSON responses
- **Authentication**: Manus OAuth with role-based access control
- **Design**: Modern glassmorphism with AdventHealth branding (healthcare blue/teal)

## User Guide

### For Team Members

#### Accessing the Application

1. Visit the application URL
2. View the educational landing page to learn about AI governance
3. Click "Get Started" or "Sign In to Submit Your Idea"
4. Authenticate using your AdventHealth credentials

#### Submitting an Initiative

1. **Start New Initiative**: Click "Start New Initiative" from the home page
2. **Step 1 - Basic Information**: Provide initiative title, your role, and primary area
3. **Step 2 - Problem & Solution**: Describe the problem and how AI might help
4. **Step 3 - Mission & Ethics**: Select mission support areas and describe alignment
5. **Step 4 - Risk Assessment**: Answer questions about clinical impact, data, and automation
6. **Submit for Analysis**: Click to receive AI-powered analysis
7. **Review Results**: View mission alignment rating, risk level, and governance path
8. **Download Brief**: Get a complete initiative brief and email summary

#### Progress Tracking

- All initiatives are automatically saved after each step
- Return to the home page to see all your initiatives
- Click any initiative card to continue where you left off
- Completed initiatives show mission alignment and risk ratings

### For Administrators

#### Accessing the Admin Dashboard

1. Sign in with an admin account
2. Click "Admin Dashboard" from the home page
3. View analytics and review queue

#### Dashboard Features

**Analytics Cards:**
- Total Submissions: Overall count of all initiatives
- High Risk Initiatives: Number of high-risk submissions requiring full governance
- Pending Review: Initiatives awaiting admin review
- Approved: Successfully approved initiatives

**Review Queue:**
- Filter by status (Pending, Under Review, Approved, Rejected)
- Filter by risk level (Low, Medium, High)
- View submitter, area, risk level, mission alignment, and submission date
- Click "Review" to open detailed view

**Reviewing Initiatives:**
1. Click "Review" on any initiative
2. Read full initiative details including problem statement and AI approach
3. Review AI-generated mission alignment and risk classification
4. Update status (Pending, Under Review, Approved, Rejected)
5. Add admin notes explaining your decision
6. Click "Update Status" to save

## Design Philosophy

### Glassmorphism Aesthetic

The application uses modern glassmorphism design principles:
- Frosted glass effect with backdrop blur
- Subtle gradients and transparency
- Soft shadows and borders
- Smooth animations and transitions
- Responsive to all screen sizes

### AdventHealth Branding

- **Primary Colors**: Healthcare blue (#0080D6) and teal accents
- **Typography**: Inter font family for professional, readable text
- **Visual Hierarchy**: Clear distinction between sections using color and spacing
- **Accessibility**: High contrast, keyboard navigation, ARIA labels

### User Experience

- **Educational First**: Landing page explains AI governance before asking for input
- **Progressive Disclosure**: Information revealed step-by-step to avoid overwhelm
- **Instant Feedback**: Real-time validation and toast notifications
- **Transparent AI**: AI reasoning explained in plain language
- **Mobile-First**: Fully responsive design works on all devices

## AI Governance Framework

### Mission Alignment Criteria

Initiatives are evaluated against AdventHealth's core mission:
- Patient safety
- Health equity
- Reducing clinician or staff burnout
- Improving access to care
- Improving patient and family experience
- Operational efficiency
- Whole-person care (physical, emotional, spiritual, social)
- "Extending the Healing Ministry of Christ"

**Ratings:**
- **High**: Strongly aligned with multiple mission areas
- **Medium**: Aligned with some mission areas
- **Low**: Minimal or unclear mission alignment

### Risk Classification Model

Risk level is determined by analyzing:
- **Area**: Direct clinical decisions vs. back-office operations
- **Clinical Impact**: Effect on patient care and safety
- **Data Type**: No personal data vs. highly sensitive PHI
- **Automation Level**: Suggestions only vs. automated actions

**Risk Levels & Governance Paths:**
- **Low Risk → Light Governance**: Back-office, no PHI, suggestions only
- **Medium Risk → Standard Governance**: Clinical support, PHI, human review required
- **High Risk → Full Clinical Governance**: Direct clinical decisions, sensitive data, automated actions

### RAID Analysis

The AI automatically generates:
- **Risks**: Potential negative outcomes or failures
- **Assumptions**: Conditions that must be true for success
- **Issues**: Current problems that need resolution
- **Dependencies**: External factors or resources required

## Development

### Running Locally

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start development server
pnpm dev

# Run tests
pnpm test
```

### Database Schema

**users**: Authentication and user profiles with role-based access
**initiatives**: All initiative data including form responses and AI analysis
**messages**: Conversation history (legacy from chat version)

### Key Files

- `client/src/pages/Home.tsx`: Landing page with glassmorphism design
- `client/src/pages/Initiative.tsx`: 4-step intake form
- `client/src/pages/Admin.tsx`: Admin dashboard
- `client/src/pages/Brief.tsx`: Initiative brief and download page
- `server/routers.ts`: tRPC API routes
- `server/aiService.ts`: AI-powered analysis functions
- `server/db.ts`: Database helper functions
- `drizzle/schema.ts`: Database schema definitions

### AI Service Functions

**analyzeMissionAlignment()**: Evaluates initiative against AdventHealth's mission
- Input: Initiative details, mission supports, whole-person care alignment
- Output: Rating (High/Medium/Low) and reasoning

**classifyRisk()**: Determines risk level and governance path
- Input: Area, clinical impact, data type, automation level
- Output: Risk level, governance path, and reasoning

**generateRAID()**: Creates comprehensive RAID analysis
- Input: Initiative details, area, data type, ethical concerns
- Output: Arrays of risks, assumptions, issues, and dependencies

## Deployment

The application is ready for deployment through the Manus platform:

1. **Create Checkpoint**: Save the current state
2. **Click Publish**: Use the Publish button in the management UI
3. **Configure Domain**: Set up custom domain if desired
4. **Share URL**: Distribute to your AdventHealth team

### Environment Variables

All required environment variables are automatically injected by the Manus platform:
- Database connection (MySQL/TiDB)
- OAuth credentials
- LLM API access
- Session secrets

No manual configuration required.

## Admin Management

### Promoting Users to Admin

To grant admin access to a user:

1. Access the Database panel in the management UI
2. Find the user in the `users` table
3. Update their `role` field from `user` to `admin`
4. User will have admin access on next login

### Admin Capabilities

Admins can:
- View all submitted initiatives from all users
- Filter and search the review queue
- Update initiative status
- Add review notes and comments
- View analytics and submission trends
- Access the admin dashboard

## Analytics

The admin dashboard provides insights into:
- **Total Submissions**: Track overall engagement
- **Risk Distribution**: Understand the mix of low/medium/high risk initiatives
- **Status Breakdown**: Monitor pending, under review, approved, and rejected counts
- **Area Distribution**: See which departments are most active

## Best Practices

### For Team Members

- **Be Specific**: Provide detailed problem statements and AI approaches
- **Think Holistically**: Consider whole-person care and mission alignment
- **Identify Concerns**: Flag potential ethical issues early
- **Save Progress**: Use the auto-save feature to work at your own pace

### For Administrators

- **Timely Reviews**: Respond to submissions within 48 hours
- **Clear Feedback**: Provide actionable notes in your reviews
- **Consistent Standards**: Apply governance criteria uniformly
- **Track Trends**: Use analytics to identify patterns and opportunities

## Support

For questions, issues, or feature requests related to the Manus platform, visit [https://help.manus.im](https://help.manus.im).

For AdventHealth-specific questions about AI governance, contact your Chief AI Officer's team.

## License

Copyright © 2024 AdventHealth. All rights reserved.
