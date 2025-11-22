import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, AlertTriangle, XCircle } from "lucide-react";

interface Initiative {
  id: number;
  title: string;
  priorityScore: number;
  priority: {
    label: string;
    color: string;
    quadrant: string;
  };
  impactScore?: number | null;
  effortScore?: number | null;
}

interface PriorityMatrixProps {
  initiatives: Initiative[];
  onInitiativeClick: (initiative: Initiative) => void;
  onQuadrantClick?: (quadrant: string) => void;
}

export function PriorityMatrix({ initiatives, onInitiativeClick, onQuadrantClick }: PriorityMatrixProps) {
  // Calculate impact and effort scores for positioning
  const getPosition = (initiative: Initiative) => {
    // Impact score (0-100) determines Y position (higher = better)
    // Effort score (0-100) determines X position (lower = better, so we invert)
    const impactScore = initiative.impactScore || 50;
    const effortScore = initiative.effortScore || 50;
    
    return {
      x: 100 - effortScore, // Invert so low effort is on right
      y: impactScore
    };
  };

  // Group initiatives by quadrant
  const quickWins = initiatives.filter(i => i.priority.quadrant === 'quick-win');
  const strategicBets = initiatives.filter(i => i.priority.quadrant === 'strategic-bet');
  const niceToHave = initiatives.filter(i => i.priority.quadrant === 'nice-to-have');
  const reconsider = initiatives.filter(i => i.priority.quadrant === 'reconsider');
  const notEvaluated = initiatives.filter(i => i.priority.quadrant === 'not-evaluated');

  return (
    <Card className="border-2 border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Portfolio Overview: Impact vs. Effort Matrix</CardTitle>
        <p className="text-sm text-gray-600">Visual distribution of initiatives across priority quadrants</p>
      </CardHeader>
      <CardContent>
        {/* Matrix Grid */}
        <div className="relative w-full aspect-square max-w-3xl mx-auto bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
          {/* Quadrant Backgrounds */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            {/* Bottom Left: Reconsider (Low Impact, High Effort) */}
            <div 
              className="bg-red-50 border-r border-t border-gray-300 cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => onQuadrantClick?.('reconsider')}
            >
              <div className="p-3">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="h-4 w-4" />
                  <span className="text-xs font-semibold">Reconsider</span>
                </div>
                <p className="text-xs text-red-600 mt-1">{reconsider.length} initiatives</p>
              </div>
            </div>

            {/* Bottom Right: Nice to Have (Low Impact, Low Effort) */}
            <div 
              className="bg-yellow-50 border-t border-gray-300 cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={() => onQuadrantClick?.('nice-to-have')}
            >
              <div className="p-3">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-semibold">Nice to Have</span>
                </div>
                <p className="text-xs text-yellow-600 mt-1">{niceToHave.length} initiatives</p>
              </div>
            </div>

            {/* Top Left: Strategic Bet (High Impact, High Effort) */}
            <div 
              className="bg-purple-50 border-r border-gray-300 cursor-pointer hover:bg-purple-100 transition-colors"
              onClick={() => onQuadrantClick?.('strategic-bet')}
            >
              <div className="p-3">
                <div className="flex items-center gap-2 text-purple-700">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-semibold">Strategic Bet</span>
                </div>
                <p className="text-xs text-purple-600 mt-1">{strategicBets.length} initiatives</p>
              </div>
            </div>

            {/* Top Right: Quick Win (High Impact, Low Effort) */}
            <div 
              className="bg-emerald-50 cursor-pointer hover:bg-emerald-100 transition-colors"
              onClick={() => onQuadrantClick?.('quick-win')}
            >
              <div className="p-3">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs font-semibold">Quick Win</span>
                </div>
                <p className="text-xs text-emerald-600 mt-1">{quickWins.length} initiatives</p>
              </div>
            </div>
          </div>

          {/* Axis Labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-2 pointer-events-none">
            <div className="bg-white px-3 py-1 rounded shadow-sm border border-gray-300">
              <p className="text-xs font-semibold text-gray-700">Low Effort → High Effort</p>
            </div>
          </div>
          <div className="absolute top-0 bottom-0 left-0 flex items-center pl-2 pointer-events-none">
            <div className="bg-white px-2 py-3 rounded shadow-sm border border-gray-300 -rotate-90 origin-center">
              <p className="text-xs font-semibold text-gray-700 whitespace-nowrap">Low Impact → High Impact</p>
            </div>
          </div>

          {/* Plot Initiatives as Dots */}
          {initiatives
            .filter(i => i.priority.quadrant !== 'not-evaluated')
            .map(initiative => {
              const pos = getPosition(initiative);
              return (
                <div
                  key={initiative.id}
                  className="absolute w-3 h-3 rounded-full cursor-pointer hover:scale-150 transition-transform shadow-md"
                  style={{
                    left: `${pos.x}%`,
                    bottom: `${pos.y}%`,
                    transform: 'translate(-50%, 50%)',
                    backgroundColor: 
                      initiative.priority.quadrant === 'quick-win' ? '#10b981' :
                      initiative.priority.quadrant === 'strategic-bet' ? '#8b5cf6' :
                      initiative.priority.quadrant === 'nice-to-have' ? '#eab308' :
                      '#ef4444'
                  }}
                  onClick={() => onInitiativeClick(initiative)}
                  title={initiative.title}
                />
              );
            })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-700">{quickWins.length}</div>
            <div className="text-xs text-emerald-600">Quick Wins</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-700">{strategicBets.length}</div>
            <div className="text-xs text-purple-600">Strategic Bets</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{niceToHave.length}</div>
            <div className="text-xs text-yellow-600">Nice to Have</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-700">{reconsider.length}</div>
            <div className="text-xs text-red-600">Reconsider</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-700">{notEvaluated.length}</div>
            <div className="text-xs text-gray-600">Not Evaluated</div>
          </div>
        </div>

        {/* Strategic Guidance */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong className="text-blue-900">Recommended Strategy:</strong> Execute Quick Wins first to build momentum, 
            then invest in Strategic Bets. Schedule Nice to Have items during low-capacity periods. 
            Politely decline or redesign Reconsider items.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
