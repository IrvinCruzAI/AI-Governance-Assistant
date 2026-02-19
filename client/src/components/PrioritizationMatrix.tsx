import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, Zap, Clock, AlertTriangle } from "lucide-react";

interface Initiative {
  id: number;
  title: string;
  effortScore: number | null;
  returnScore: number | null;
  riskScore: number | null;
  priorityQuadrant: string | null;
  status: string | null;
  totalRevenueImpact: number | null;
}

interface PrioritizationMatrixProps {
  initiatives: Initiative[];
  onInitiativeClick?: (id: number) => void;
}

export function PrioritizationMatrix({ initiatives, onInitiativeClick }: PrioritizationMatrixProps) {
  // Filter evaluated initiatives with scores
  const evaluatedInitiatives = initiatives.filter(
    (i) => i.effortScore && i.returnScore && i.status === "evaluated"
  );

  // Calculate quadrant boundaries (using 5 as midpoint for 1-10 scale)
  const effortMidpoint = 5;
  const returnMidpoint = 5;

  // Position initiative on the matrix (0-100 scale for positioning)
  const getPosition = (effort: number, returnVal: number) => ({
    x: (effort / 10) * 100, // 0-100% from left
    y: 100 - (returnVal / 10) * 100, // 0-100% from top (inverted because high return should be at top)
  });

  // Get quadrant info
  const getQuadrantInfo = (quadrant: string) => {
    switch (quadrant) {
      case "quick-win":
        return {
          label: "Quick Wins",
          color: "bg-green-500",
          icon: Zap,
          description: "Low Effort, High Return - Fast-track these",
        };
      case "strategic-bet":
        return {
          label: "Strategic Bets",
          color: "bg-blue-500",
          icon: TrendingUp,
          description: "High Effort, High Return - Long-term investments",
        };
      case "nice-to-have":
        return {
          label: "Nice-to-Have",
          color: "bg-yellow-500",
          icon: Clock,
          description: "Low Effort, Low Return - Backlog candidates",
        };
      case "reconsider":
        return {
          label: "Reconsider",
          color: "bg-red-500",
          icon: AlertTriangle,
          description: "High Effort, Low Return - Deprioritize",
        };
      default:
        return {
          label: "Unclassified",
          color: "bg-gray-500",
          icon: AlertTriangle,
          description: "Not yet evaluated",
        };
    }
  };

  // Group by quadrant for summary
  const quadrantCounts = evaluatedInitiatives.reduce((acc, init) => {
    const quadrant = init.priorityQuadrant || 'unclassified';
    acc[quadrant] = (acc[quadrant] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["quick-win", "strategic-bet", "nice-to-have", "reconsider"].map((quadrant) => {
          const info = getQuadrantInfo(quadrant);
          const Icon = info.icon;
          const count = quadrantCounts[quadrant] || 0;
          return (
            <Card key={quadrant} className="border-l-4" style={{ borderLeftColor: info.color.replace("bg-", "#") }}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <CardTitle className="text-sm font-medium">{info.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Matrix Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Operational Prioritization Matrix</CardTitle>
          <CardDescription>
            Effort vs Return analysis - Bubble size represents revenue impact, color indicates risk level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-square bg-gradient-to-br from-background to-muted/20 rounded-lg border">
            {/* Quadrant Labels */}
            <div className="absolute top-2 left-2 text-xs font-semibold text-muted-foreground">
              High Return
            </div>
            <div className="absolute bottom-2 left-2 text-xs font-semibold text-muted-foreground">
              Low Return
            </div>
            <div className="absolute bottom-2 left-2 text-xs font-semibold text-muted-foreground">
              Low Effort
            </div>
            <div className="absolute bottom-2 right-2 text-xs font-semibold text-muted-foreground">
              High Effort
            </div>

            {/* Quadrant Dividers */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-border" />

            {/* Quadrant Background Labels */}
            <div className="absolute top-4 left-4 text-sm font-medium text-muted-foreground/40">
              Strategic Bets
            </div>
            <div className="absolute top-4 right-4 text-sm font-medium text-muted-foreground/40">
              Quick Wins
            </div>
            <div className="absolute bottom-4 left-4 text-sm font-medium text-muted-foreground/40">
              Reconsider
            </div>
            <div className="absolute bottom-4 right-4 text-sm font-medium text-muted-foreground/40">
              Nice-to-Have
            </div>

            {/* Initiative Bubbles */}
            {evaluatedInitiatives.map((initiative) => {
              const pos = getPosition(initiative.effortScore!, initiative.returnScore!);
              const info = getQuadrantInfo(initiative.priorityQuadrant || 'unclassified');
              
              // Bubble size based on revenue impact (min 20px, max 60px)
              const maxRevenue = Math.max(...evaluatedInitiatives.map((i) => i.totalRevenueImpact || 0));
              const bubbleSize = 20 + ((initiative.totalRevenueImpact || 0) / maxRevenue) * 40;
              
              // Risk color intensity
              const riskOpacity = initiative.riskScore ? 0.4 + (initiative.riskScore / 10) * 0.6 : 0.7;

              return (
                <Tooltip key={initiative.id}>
                  <TooltipTrigger asChild>
                    <button
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all hover:scale-110 hover:shadow-lg cursor-pointer border-2 border-background"
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        width: `${bubbleSize}px`,
                        height: `${bubbleSize}px`,
                        backgroundColor: info.color.replace("bg-", "#"),
                        opacity: riskOpacity,
                      }}
                      onClick={() => onInitiativeClick?.(initiative.id)}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-semibold">{initiative.title}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Effort:</span> {initiative.effortScore}/10
                        </div>
                        <div>
                          <span className="text-muted-foreground">Return:</span> {initiative.returnScore}/10
                        </div>
                        <div>
                          <span className="text-muted-foreground">Risk:</span> {initiative.riskScore}/10
                        </div>
                        <div>
                          <span className="text-muted-foreground">Revenue:</span> $
                          {((initiative.totalRevenueImpact || 0) / 1000000).toFixed(1)}M
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {info.label}
                      </Badge>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span>Quick Win</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span>Strategic Bet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span>Nice-to-Have</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span>Reconsider</span>
            </div>
            <div className="ml-4">
              <span className="font-medium">Bubble size</span> = Revenue Impact
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
