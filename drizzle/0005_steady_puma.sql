ALTER TABLE `initiatives` ADD `scaleOfImpact` enum('High','Medium','Low');--> statement-breakpoint
ALTER TABLE `initiatives` ADD `financialImpact` enum('High','Medium','Low');--> statement-breakpoint
ALTER TABLE `initiatives` ADD `riskMitigationValue` enum('High','Medium','Low');--> statement-breakpoint
ALTER TABLE `initiatives` ADD `returnPotentialScore` int;--> statement-breakpoint
ALTER TABLE `initiatives` ADD `technicalComplexity` enum('High','Medium','Low');--> statement-breakpoint
ALTER TABLE `initiatives` ADD `dataRequirements` enum('High','Medium','Low');--> statement-breakpoint
ALTER TABLE `initiatives` ADD `integrationNeeds` enum('High','Medium','Low');--> statement-breakpoint
ALTER TABLE `initiatives` ADD `timelineToDeployment` enum('High','Medium','Low');--> statement-breakpoint
ALTER TABLE `initiatives` ADD `implementationEffortScore` int;--> statement-breakpoint
ALTER TABLE `initiatives` ADD `priorityScore` int;--> statement-breakpoint
ALTER TABLE `initiatives` ADD `priorityQuadrant` enum('quick-win','strategic-investment','low-priority','reconsider');