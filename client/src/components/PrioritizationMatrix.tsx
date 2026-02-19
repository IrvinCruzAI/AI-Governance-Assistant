import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, Zap, Clock, AlertTriangle, Filter, DollarSign, Target, AlertCircle } from "lucide-react";

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
  // Quadrant filter state
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  // Zoom dialog state
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);

  // Filter evaluated initiatives with scores
  const evaluatedInitiatives = initiatives.filter(
    (i) => i.effortScore && i.returnScore
  );

  // Apply quadrant filters
  const filteredInitiatives = activeFilters.size === 0 
    ? evaluatedInitiatives
    : evaluatedInitiatives.filter(i => activeFilters.has(i.priorityQuadrant || 'unclassified'));

  // Toggle filter
  const toggleFilter = (quadrant: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(quadrant)) {
        next.delete(quadrant);
      } else {
        next.add(quadrant);
      }
      return next;
    });
  };

  // Clear all filters
  const clearFilters = () => setActiveFilters(new Set());

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
          hexColor: "#22c55e",
          icon: Zap,
          description: "Low Effort, High Return - Fast-track these",
        };
      case "strategic-bet":
        return {
          label: "Strategic Bets",
          color: "bg-blue-500",
          hexColor: "#3b82f6",
          icon: TrendingUp,
          description: "High Effort, High Return - Long-term investments",
        };
      case "nice-to-have":
        return {
          label: "Nice-to-Have",
          color: "bg-yellow-500",
          hexColor: "#eab308",
          icon: Clock,
          description: "Low Effort, Low Return - Backlog candidates",
        };
      case "reconsider":
        return {
          label: "Reconsider",
          color: "bg-red-500",
          hexColor: "#ef4444",
          icon: AlertTriangle,
          description: "High Effort, Low Return - Deprioritize",
        };
      default:
        return {
          label: "Unclassified",
          color: "bg-gray-500",
          hexColor: "#6b7280",
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
      {/* Filter Buttons */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground min-w-fit">
              <Filter className="h-4 w-4" />
              <span>Filter by Quadrant:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {["quick-win", "strategic-bet", "nice-to-have", "reconsider"].map((quadrant) => {
                const info = getQuadrantInfo(quadrant);
                const Icon = info.icon;
                const isActive = activeFilters.has(quadrant);
                return (
                  <Button
                    key={quadrant}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFilter(quadrant)}
                    className="gap-1.5 h-9"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{info.label}</span>
                    <span className="sm:hidden">{info.label.split(' ')[0]}</span>
                    <Badge variant="secondary" className="ml-0.5 h-5 px-1.5 text-xs">
                      {quadrantCounts[quadrant] || 0}
                    </Badge>
                  </Button>
                );
              })}
              {activeFilters.size > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
            Effort vs Return analysis • Size = Revenue impact • Color = Quadrant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-square bg-gradient-to-br from-background to-muted/20 rounded-lg border touch-manipulation">
            {/* Quadrant Labels */}
            <div className="absolute top-1 sm:top-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-semibold text-muted-foreground">
              High Return
            </div>
            <div className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-semibold text-muted-foreground">
              Low Return
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 left-1 sm:left-2 text-[10px] sm:text-xs font-semibold text-muted-foreground [writing-mode:vertical-lr] rotate-180">
              Low Effort
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-1 sm:right-2 text-[10px] sm:text-xs font-semibold text-muted-foreground [writing-mode:vertical-lr] rotate-180">
              High Effort
            </div>

            {/* Quadrant Dividers */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-border" />

            {/* Quadrant Background Labels */}
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 text-[10px] sm:text-sm font-semibold text-muted-foreground/60">
              <span className="hidden sm:inline">Strategic Bets</span>
              <span className="sm:hidden">Strategic</span>
            </div>
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-[10px] sm:text-sm font-semibold text-muted-foreground/60">
              <span className="hidden sm:inline">Quick Wins</span>
              <span className="sm:hidden">Quick</span>
            </div>
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-[10px] sm:text-sm font-semibold text-muted-foreground/60">
              <span className="hidden sm:inline">Nice-to-Have</span>
              <span className="sm:hidden">Nice</span>
            </div>
            <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 text-[10px] sm:text-sm font-semibold text-muted-foreground/60">
              Reconsider
            </div>

            {/* Initiative Bubbles */}
            {filteredInitiatives.map((initiative) => {
              const pos = getPosition(initiative.effortScore!, initiative.returnScore!);
              const info = getQuadrantInfo(initiative.priorityQuadrant || 'unclassified');
              
              // Bubble size based on revenue impact (min 24px for mobile touch, max 60px)
              const maxRevenue = Math.max(...evaluatedInitiatives.map((i) => i.totalRevenueImpact || 0));
              const bubbleSize = 24 + ((initiative.totalRevenueImpact || 0) / maxRevenue) * 36;
              
              // Risk color intensity - increased for better visibility
              const riskOpacity = initiative.riskScore ? 0.7 + (initiative.riskScore / 10) * 0.3 : 0.9;

              return (
                <Tooltip key={initiative.id}>
                  <TooltipTrigger asChild>
                    <button
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all hover:scale-110 active:scale-95 hover:shadow-xl cursor-pointer border-2 border-white shadow-md touch-manipulation"
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        width: `${bubbleSize}px`,
                        height: `${bubbleSize}px`,
                        backgroundColor: info.hexColor,
                        opacity: riskOpacity,
                      }}
                      onClick={() => {
                        setSelectedInitiative(initiative);
                        onInitiativeClick?.(initiative.id);
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-semibold">{initiative.title}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-white">
                        <div>
                          <span className="text-gray-300">Effort:</span> <span className="font-semibold">{initiative.effortScore}/10</span>
                        </div>
                        <div>
                          <span className="text-gray-300">Return:</span> <span className="font-semibold">{initiative.returnScore}/10</span>
                        </div>
                        <div>
                          <span className="text-gray-300">Risk:</span> <span className="font-semibold">{initiative.riskScore}/10</span>
                        </div>
                        <div>
                          <span className="text-gray-300">Revenue:</span> <span className="font-semibold">${((initiative.totalRevenueImpact || 0) / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs text-white bg-white/20 border-white/30">
                        {info.label}
                      </Badge>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-muted-foreground">
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

      {/* Zoom Dialog */}
      <Dialog open={!!selectedInitiative} onOpenChange={(open) => !open && setSelectedInitiative(null)}>
        <DialogContent className="max-w-2xl">
          {selectedInitiative && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedInitiative.title}</DialogTitle>
                <DialogDescription>
                  {getQuadrantInfo(selectedInitiative.priorityQuadrant || 'unclassified').description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Quadrant Badge */}
                <div className="flex items-center gap-2">
                  <Badge 
                    className="text-sm px-3 py-1"
                    style={{ 
                      backgroundColor: getQuadrantInfo(selectedInitiative.priorityQuadrant || 'unclassified').color.replace('bg-', '#')
                    }}
                  >
                    {getQuadrantInfo(selectedInitiative.priorityQuadrant || 'unclassified').label}
                  </Badge>
                  <Badge variant="outline">{selectedInitiative.status}</Badge>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        Effort Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{selectedInitiative.effortScore}/10</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedInitiative.effortScore! > 5 ? 'High effort required' : 'Low effort required'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Return Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{selectedInitiative.returnScore}/10</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedInitiative.returnScore! > 5 ? 'High return expected' : 'Low return expected'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Risk Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{selectedInitiative.riskScore}/10</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedInitiative.riskScore! > 5 ? 'High risk level' : 'Low risk level'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue Impact */}
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      Total Revenue Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-green-600">
                      ${((selectedInitiative.totalRevenueImpact || 0) / 1000000).toFixed(2)}M
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Estimated annual revenue impact from this initiative
                    </p>
                  </CardContent>
                </Card>

                {/* Action Button */}
                <div className="flex justify-end">
                  <Button onClick={() => setSelectedInitiative(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
