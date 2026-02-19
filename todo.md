# Travel + Leisure Co. AI Governance Platform - UX Enhancements

## Phase 1: IdeaStarters Submit Buttons
- [x] Add "Start Initiative from This Prompt" button to each prompt card
- [x] Pass selected prompt to NewInitiative page via URL params or state
- [x] Pre-fill problem statement field with the prompt context

## Phase 2: Browse Page Filtering
- [x] Add category filter dropdown (Member Experience, Operations, etc.)
- [x] Add status filter (Submitted, Evaluated, In Progress, Deployed)
- [x] Add priority quadrant filter (Quick Win, Strategic Bet, etc.)
- [x] Add search box for title/description text search
- [x] Show active filter badges with clear buttons

## Phase 3: Initiative Detail Pages
- [x] Create InitiativeDetail.tsx page component
- [x] Add route /initiative/:id to App.tsx
- [x] Display full initiative information (all governance fields)
- [x] Show RAID view (Risks, Assumptions, Issues, Dependencies)
- [x] Show evaluation notes and priority scoring
- [x] Add "Back to Browse" navigation
- [x] Make initiative titles clickable from Browse
- [x] Make initiative titles clickable from Roadmap (already implemented)

## Phase 4: Testing & Delivery
- [ ] Test IdeaStarters submit flow end-to-end
- [ ] Test Browse filtering with sample data
- [ ] Test initiative detail page navigation
- [ ] Run vitest tests
- [ ] Save final checkpoint
