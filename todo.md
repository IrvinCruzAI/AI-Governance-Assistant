# AI Governance Assistant - Evaluation System Improvements

## Phase 1: Remove Opportunity Score Card
- [x] Remove the "Opportunity Score: 90" card from initiative detail modal
- [x] Keep only the opportunity label badge (Quick Win, Strategic Bet, etc.)

## Phase 2: Add Evaluation Audit Trail
- [x] Add evaluatedBy and evaluatedAt columns to database schema
- [x] Update backend mutation to save admin name and timestamp
- [x] Display "Evaluated by [Name] on [Date]" in modal
- [x] Add evaluation status indicators in table (checkmark for evaluated, clock for pending)

## Phase 3: Add Validation & Workflow Improvements
- [x] Require both Impact AND Effort to be filled before saving
- [x] Show validation error if either field is empty
- [x] Add "Save & Next" button for batch evaluation workflow
- [x] Add "Save & Close" button to save and close modal

## Phase 4: Database Cleanup
- [x] Remove old 6-field opportunity cost columns from database
- [x] Remove old calculatePriority function from backend
- [x] Remove old scoring functions from frontend
- [x] Remove old PRIORITY_RUBRIC documentation

## Phase 5: Test & Checkpoint
- [x] Test complete evaluation workflow
- [x] Verify audit trail displays correctly
- [x] Verify evaluation status indicators work
- [x] Verify Save & Next workflow opens next unevaluated initiative
- [x] Verify opportunity classification badge displays correctly
- [x] Create final checkpoint

## UI Simplification
- [x] Remove redundant "Evaluated" column from admin table
- [x] Remove redundant "Status" column from admin table (Opportunity column already shows evaluation status)

## Delete Functionality
- [x] Add delete button to Actions column in admin table
- [x] Add confirmation dialog before deleting
- [x] Test delete functionality end-to-end
