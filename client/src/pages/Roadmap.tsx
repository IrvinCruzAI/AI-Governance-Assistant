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
  ThumbsUp,
} from "lucide-react";

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
  [key: string]: any;
}

function InitiativeCard({ initiative }: { initiative: Initiative }) {
  const [, setLocation] = useLocation();
  
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setLocation(`/initiative/${initiative.id}`)}
    >
      <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
        {initiative.title || "Untitled Initiative"}
      </h4>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="capitalize">{initiative.area || "N/A"}</span>
        {initiative.voteCount !== undefined && (
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" />
            <span>{initiative.voteCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Roadmap() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const { data: initiatives, isLoading } = trpc.initiative.listAll.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Initiative Roadmap</h1>
                <p className="text-sm text-gray-600">Track the progress of AI initiatives across Travel + Leisure Co.</p>
              </div>
            </div>
            {isAuthenticated && user?.role === 'admin' && (
              <Button
                onClick={() => setLocation("/admin")}
                variant="outline"
              >
                Admin Dashboard
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Roadmap Board */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {ROADMAP_STATUSES.map((status) => {
            const Icon = status.icon;
            const statusInitiatives = initiatives?.filter(
              (init: Initiative) => init.roadmapStatus === status.key
            ) || [];

            return (
              <div key={status.key} className="flex flex-col">
                {/* Column Header */}
                <div className={`rounded-t-lg border-2 ${status.color} p-4`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-5 w-5" />
                    <h3 className="font-semibold text-sm">{status.label}</h3>
                  </div>
                  <p className="text-xs opacity-80">{status.description}</p>
                  <div className="mt-2 text-xs font-medium">
                    {statusInitiatives.length} {statusInitiatives.length === 1 ? 'initiative' : 'initiatives'}
                  </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 bg-gray-100 rounded-b-lg border-x-2 border-b-2 border-gray-200 p-3 min-h-[200px] space-y-3">
                  {statusInitiatives.map((initiative: Initiative) => (
                    <InitiativeCard
                      key={initiative.id}
                      initiative={initiative}
                    />
                  ))}
                  {statusInitiatives.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-8">
                      No initiatives yet
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isAuthenticated && user?.role === 'admin' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Admin Note:</strong> To move initiatives between stages, use the Admin Dashboard → All Submissions → Review → Update Roadmap Stage dropdown.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
