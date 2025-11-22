import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Target, Zap, TrendingUp, AlertTriangle, XCircle } from "lucide-react";

interface PriorityRubricModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PriorityRubricModal({ open, onOpenChange }: PriorityRubricModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            Opportunity Cost Priority Framework
          </DialogTitle>
          <DialogDescription>
            Strategic decision-making framework for evaluating AI initiatives based on impact and feasibility
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Framework Overview */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">How This Framework Works</h3>
            <p className="text-gray-700 mb-4">
              Each initiative is evaluated across two dimensions: <strong>Impact</strong> (potential value to the organization) 
              and <strong>Feasibility</strong> (effort required to implement). This creates four strategic quadrants that guide 
              prioritization decisions.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-blue-900">Impact Score (0-100)</strong>
                <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                  <li>Scale: How many people helped?</li>
                  <li>Benefit Type: Patient outcomes, efficiency, cost savings</li>
                  <li>Financial Return: Direct revenue or cost reduction</li>
                </ul>
              </div>
              <div>
                <strong className="text-blue-900">Feasibility Score (0-100)</strong>
                <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                  <li>Complexity: Technical difficulty</li>
                  <li>Timeline: Time to deployment</li>
                  <li>Dependencies: Prerequisites needed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Priority Quadrants */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Priority Quadrants & Strategic Guidance</h3>
            
            {/* Quick Win */}
            <div className="border-2 border-emerald-200 bg-emerald-50 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <Zap className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-emerald-900 mb-2">Quick Win</h4>
                  <p className="text-sm text-emerald-800 mb-3">
                    <strong>High Impact + Low Effort</strong> (Score: 140-200)
                  </p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong className="text-emerald-900">Strategic Action:</strong> Execute immediately. These deliver maximum value with minimal investment.</p>
                    <p><strong className="text-emerald-900">Typical Examples:</strong> Automated reminders, simple data dashboards, workflow automation using existing tools</p>
                    <p><strong className="text-emerald-900">Resource Allocation:</strong> Prioritize over all other quadrants. Build momentum with early wins.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Bet */}
            <div className="border-2 border-purple-200 bg-purple-50 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-purple-900 mb-2">Strategic Bet</h4>
                  <p className="text-sm text-purple-800 mb-3">
                    <strong>High Impact + High Effort</strong> (Score: 100-139)
                  </p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong className="text-purple-900">Strategic Action:</strong> Plan carefully. Worth the investment but requires dedicated resources and executive sponsorship.</p>
                    <p><strong className="text-purple-900">Typical Examples:</strong> Predictive analytics platforms, clinical decision support systems, custom AI models</p>
                    <p><strong className="text-purple-900">Resource Allocation:</strong> Schedule after Quick Wins. Secure budget and cross-functional team commitment.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nice to Have */}
            <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-blue-900 mb-2">Nice to Have</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    <strong>Low Impact + Low Effort</strong> (Score: 60-99)
                  </p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong className="text-blue-900">Strategic Action:</strong> Implement when capacity allows. Good for training new team members or filling gaps.</p>
                    <p><strong className="text-blue-900">Typical Examples:</strong> Minor UI improvements, convenience features, optional reporting enhancements</p>
                    <p><strong className="text-blue-900">Resource Allocation:</strong> Backlog items. Execute during slow periods or as learning opportunities.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reconsider */}
            <div className="border-2 border-red-200 bg-red-50 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <XCircle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-red-900 mb-2">Reconsider</h4>
                  <p className="text-sm text-red-800 mb-3">
                    <strong>Low Impact + High Effort</strong> (Score: 0-59)
                  </p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong className="text-red-900">Strategic Action:</strong> Reject or fundamentally redesign. Poor return on investment.</p>
                    <p><strong className="text-red-900">Typical Examples:</strong> Over-engineered solutions, niche use cases, initiatives with unclear value proposition</p>
                    <p><strong className="text-red-900">Resource Allocation:</strong> Decline politely. Redirect submitter to higher-impact opportunities.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Not Evaluated */}
            <div className="border-2 border-gray-200 bg-gray-50 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Not Evaluated</h4>
                  <p className="text-sm text-gray-800 mb-3">
                    <strong>Pending Assessment</strong> (Score: 0)
                  </p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong className="text-gray-900">Strategic Action:</strong> Complete opportunity cost evaluation to determine priority quadrant.</p>
                    <p><strong className="text-gray-900">Next Steps:</strong> Review initiative details, assess impact and feasibility, assign to appropriate quadrant.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decision-Making Tips */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-3">Executive Decision-Making Tips</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">1.</span>
                <span><strong>Start with Quick Wins</strong> to build momentum, demonstrate value, and gain organizational buy-in before tackling Strategic Bets.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">2.</span>
                <span><strong>Balance your portfolio:</strong> Mix of Quick Wins (30-40%), Strategic Bets (40-50%), Nice to Have (10-20%), Reconsider (0%).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">3.</span>
                <span><strong>Reassess quarterly:</strong> As technology evolves, yesterday's Strategic Bet may become today's Quick Win.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">4.</span>
                <span><strong>Consider dependencies:</strong> Some Strategic Bets unlock multiple Quick Wins. Prioritize platform investments that enable future initiatives.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">5.</span>
                <span><strong>Track outcomes:</strong> Did Quick Wins deliver quickly? Did Strategic Bets achieve expected ROI? Use data to improve future scoring.</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
