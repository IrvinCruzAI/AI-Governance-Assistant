ALTER TABLE initiatives ADD COLUMN impactScale ENUM('large', 'medium', 'small');
ALTER TABLE initiatives ADD COLUMN impactBenefitType ENUM('patient-safety', 'patient-outcomes', 'staff-efficiency', 'cost-reduction', 'experience');
ALTER TABLE initiatives ADD COLUMN impactFinancialReturn ENUM('high', 'some', 'minimal');
ALTER TABLE initiatives ADD COLUMN impactScore INT;
ALTER TABLE initiatives ADD COLUMN feasibilityComplexity ENUM('simple', 'moderate', 'complex');
ALTER TABLE initiatives ADD COLUMN feasibilityTimeline ENUM('quick', 'standard', 'long');
ALTER TABLE initiatives ADD COLUMN feasibilityDependencies ENUM('ready', 'minor', 'major');
ALTER TABLE initiatives ADD COLUMN feasibilityScore INT;
ALTER TABLE initiatives MODIFY COLUMN priorityQuadrant ENUM('quick-win', 'strategic-bet', 'nice-to-have', 'reconsider');
