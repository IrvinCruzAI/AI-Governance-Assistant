# AI Governance Assistant TODO

## Phase 1: Database Schema & Planning
- [x] Design database schema for initiatives, conversations, and RAID data
- [x] Create database migrations

## Phase 2: Conversational Interface
- [x] Build multi-step conversation flow component
- [x] Implement Step 1: Welcome & Role collection
- [x] Implement Step 2: Initiative Basics (title, problem, AI approach, users)
- [x] Add conversation state management
- [x] Create progress indicator showing current step

## Phase 3: Mission & Risk Assessment
- [x] Implement Step 3: Mission & Ethics Alignment questions
- [x] Build mission alignment rating logic (High/Medium/Low)
- [x] Implement Step 4: Risk Classification questions
- [x] Build risk level calculation (Low/Medium/High)
- [x] Determine governance path (Light/Standard/Full)
- [x] Implement Step 5: RAID view generation

## Phase 4: Brief Generation & Export
- [x] Implement Step 6: Generate Initiative Brief
- [x] Generate email-style summary for Chief AI Officer
- [x] Add export to PDF functionality
- [x] Add export to Word/text functionality
- [x] Save completed initiatives to database
- [x] Create dashboard to view past initiatives

## Phase 5: Branding & Design
- [x] Apply AdventHealth color scheme (healthcare blue/teal)
- [x] Add professional typography and spacing
- [x] Ensure mobile responsiveness
- [x] Add AdventHealth logo and branding elements
- [x] Polish UI with smooth transitions and interactions

## Phase 6: Testing & Deployment
- [x] Write vitest tests for tRPC procedures
- [x] Test complete conversation flow end-to-end
- [x] Test on mobile devices
- [x] Create checkpoint for deployment
- [x] Document usage instructions

## Redesign to Intake Form Format
- [x] Replace chat interface with structured multi-step form
- [x] Add form fields for each question (radio buttons, dropdowns, checkboxes, text areas)
- [x] Create step-by-step wizard with clear navigation
- [x] Add form validation for required fields
- [x] Show progress indicator and step summary
- [x] Add review page before final submission
- [x] Update UI to feel like a professional intake questionnaire
- [x] Test complete form flow from start to submission
