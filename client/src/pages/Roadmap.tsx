import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Loader2,
  ArrowLeft,
  Search,
  Code,
  Rocket,
  CheckCircle2,
  Pause,
  XCircle,
  FileText,
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import { toast } from "sonner";

const ROADMAP_STATUSES = [
  {
    key: "under-review",
    label: "Under Review",
    icon: Search,
    color: "bg-gray-100 text-gray-700 border-gray-300",
    description: "Initial review by AI Governance team"
  },
  {
    key: "research",
    label: "Research",
    icon: FileText,
    color: "bg-blue-100 text-blue-700 border-blue-300",
    description: "Feasibility analysis and planning"
  },
  {
    key: "development",
    label: "Development",
    icon: Code,
    color: "bg-purple-100 text-purple-700 border-purple-300",
    description: "Active development in progress"
  },
  {
    key: "pilot",
    label: "Pilot",
    icon: Rocket,
    color: "bg-orange-100 text-orange-700 border-orange-300",
    description: "Testing with select users"
  },
  {
    key: "deployed",
    label: "Deployed",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700 border-green-300",
    description: "Live and available to all users"
  },
  {
    key: "on-hold",
    label: "On Hold",
    icon: Pause,
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    description: "Temporarily paused"
  },
  {
    key: "rejected",
    label: "Not Pursuing",
    icon: XCircle,
    color: "bg-red-100 text-red-700 border-red-300",
    description: "Not moving forward at this time"
  },
] as const;

type RoadmapStatus = typeof ROADMAP_STATUSES[number]['key'];

interface Initiative {
  id: number;
  title: string | null;
  userRole?: string | null;
  area?: string | null;
  voteCount?: number;
  riskLevel?: string | null;
  roadmapStatus?: RoadmapStatus | null;
  [key: string]: any; // Allow additional properties
}

function InitiativeCard({ initiative, isDragging = false }: { initiative: Initiative; isDragging?: boolean }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
        {initiative.title || "Untitled Initiative"}
      </h4>
      <p className="text-xs text-gray-600 mb-2">
        {initiative.userRole || "Team Member"}
      </p>
      {initiative.area && (
        <div className="text-xs text-gray-500">
          {initiative.area}
        </div>
      )}
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          👍 {initiative.voteCount || 0}
        </span>
        {initiative.riskLevel && (
          <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">
            {initiative.riskLevel} Risk
          </span>
        )}
      </div>
    </div>
  );
}

export default function Roadmap() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [activeId, setActiveId] = useState<number | null>(null);

  const isAdmin = user?.role === 'admin';

  // Fetch all initiatives with votes
  const { data: allInitiatives, isLoading } = trpc.initiative.listAllWithVotes.useQuery();
  const utils = trpc.useUtils();

  // Update roadmap status mutation
  const updateRoadmapStatus = trpc.initiative.updateRoadmapStatus.useMutation({
    onSuccess: () => {
      utils.initiative.listAllWithVotes.invalidate();
      toast.success("Initiative moved successfully");
    },
    onError: (error) => {
      toast.error(`Failed to move initiative: ${error.message}`);
    },
  });

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  );

  // Group initiatives by roadmap status
  const initiativesByStatus = ROADMAP_STATUSES.map(status => {
    const initiatives = allInitiatives?.filter(
      (initiative: Initiative) => initiative.roadmapStatus === status.key
    ) || [];
    
    return {
      ...status,
      initiatives,
      count: initiatives.length,
    };
  });

  // Find the active initiative being dragged
  const activeInitiative = activeId
    ? allInitiatives?.find((init: Initiative) => init.id === activeId)
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as number);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const initiativeId = active.id as number;
    const newStatus = over.id as RoadmapStatus;

    // Find current initiative
    const initiative = allInitiatives?.find((init: Initiative) => init.id === initiativeId);

    if (initiative && initiative.roadmapStatus !== newStatus) {
      // Optimistic update
      utils.initiative.listAllWithVotes.setData(undefined, (old: any) => {
        if (!old) return old;
        return old.map((init: any) =>
          init.id === initiativeId ? { ...init, roadmapStatus: newStatus } : init
        );
      });

      // Update on server
      updateRoadmapStatus.mutate({
        id: initiativeId,
        roadmapStatus: newStatus,
      });
    }

    setActiveId(null);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="container flex justify-between items-center py-4">
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">
            {APP_TITLE}
          </h1>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              aria-label="Go back to home page"
            >
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Back
            </Button>
            {isAuthenticated && user?.role === 'admin' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/admin")}
                aria-label="Go to admin dashboard"
              >
                Admin
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Page Header */}
      <section className="container py-12 md:py-16">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI Initiative Roadmap
          </h2>
          <p className="text-xl text-gray-600">
            Track the progress of AI initiatives from idea to deployment. See what's being researched, developed, and deployed across AdventHealth.
          </p>
          {isAdmin && (
            <p className="text-sm text-blue-600 mt-2 font-medium">
              💡 Admin Mode: Drag and drop cards to change their status
            </p>
          )}
        </div>

        {/* Roadmap Columns */}
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading roadmap" />
            </div>
          ) : (
            <DndContext
              sensors={isAdmin ? sensors : []}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {initiativesByStatus.map((status) => {
                  const Icon = status.icon;
                  
                  return (
                    <div key={status.key} className="flex flex-col">
                      {/* Status Header */}
                      <div className={`rounded-t-lg border p-4 ${status.color}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                          <h3 className="font-semibold">{status.label}</h3>
                        </div>
                        <p className="text-xs opacity-90 mb-2">{status.description}</p>
                        <div className="text-sm font-bold">
                          {status.count} {status.count === 1 ? "initiative" : "initiatives"}
                        </div>
                      </div>

                      {/* Droppable Area */}
                      <DroppableColumn
                        id={status.key}
                        initiatives={status.initiatives}
                        isAdmin={isAdmin}
                        activeId={activeId}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Drag Overlay */}
              <DragOverlay>
                {activeInitiative ? (
                  <InitiativeCard initiative={activeInitiative} />
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        {/* Legend */}
        <div className="max-w-6xl mx-auto mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">How the Roadmap Works</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="mb-2">
                <strong>Under Review:</strong> Your idea has been submitted and is being evaluated by the AI Governance team.
              </p>
              <p className="mb-2">
                <strong>Research:</strong> The team is conducting feasibility analysis, gathering requirements, and planning implementation.
              </p>
              <p className="mb-2">
                <strong>Development:</strong> Active development is underway. Engineers and data scientists are building the solution.
              </p>
            </div>
            <div>
              <p className="mb-2">
                <strong>Pilot:</strong> The initiative is being tested with a select group of users to validate effectiveness and gather feedback.
              </p>
              <p className="mb-2">
                <strong>Deployed:</strong> The solution is live and available to all intended users across AdventHealth.
              </p>
              <p className="mb-2">
                <strong>On Hold / Not Pursuing:</strong> The initiative has been paused or will not move forward at this time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8 mt-16">
        <div className="container text-center text-gray-600">
          <p className="text-sm">
            © 2025 AdventHealth • Extending the Healing Ministry of Christ
          </p>
        </div>
      </footer>
    </div>
  );
}

// Droppable Column Component
function DroppableColumn({
  id,
  initiatives,
  isAdmin,
  activeId,
}: {
  id: string;
  initiatives: Initiative[];
  isAdmin: boolean;
  activeId: number | null;
}) {
  const { setNodeRef, isOver } = isAdmin
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      require('@dnd-kit/core').useDroppable({ id })
    : { setNodeRef: undefined, isOver: false };

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 border border-t-0 rounded-b-lg p-4 bg-gray-50 space-y-3 min-h-[200px] transition-colors ${
        isOver ? 'bg-blue-50 border-blue-300' : ''
      }`}
    >
      {initiatives.length > 0 ? (
        initiatives.map((initiative: Initiative) => (
          <DraggableCard
            key={initiative.id}
            initiative={initiative}
            isAdmin={isAdmin}
            isDragging={activeId === initiative.id}
          />
        ))
      ) : (
        <div className="text-center py-8 text-gray-400 text-sm">
          No initiatives in this stage
        </div>
      )}
    </div>
  );
}

// Draggable Card Component
function DraggableCard({
  initiative,
  isAdmin,
  isDragging,
}: {
  initiative: Initiative;
  isAdmin: boolean;
  isDragging: boolean;
}) {
  if (!isAdmin) {
    return <InitiativeCard initiative={initiative} />;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { attributes, listeners, setNodeRef, transform } = require('@dnd-kit/core').useDraggable({
    id: initiative.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        cursor: 'grab',
      }
    : { cursor: 'grab' };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <InitiativeCard initiative={initiative} isDragging={isDragging} />
    </div>
  );
}
