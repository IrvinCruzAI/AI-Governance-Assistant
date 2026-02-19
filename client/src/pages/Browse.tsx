import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  Loader2,
  Search,
  FileText,
  ArrowLeft,
  Lightbulb,
  Filter,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";

export default function Browse() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const { data: allInitiatives, isLoading } = trpc.initiative.listAllWithVotes.useQuery();
  const voteMutation = trpc.initiative.vote.useMutation();
  const unvoteMutation = trpc.initiative.unvote.useMutation();
  const utils = trpc.useUtils();

  // Filter initiatives based on search and filters
  const filteredInitiatives = allInitiatives?.filter((initiative: any) => {
    const matchesSearch =
      !searchQuery ||
      initiative.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      initiative.problemStatement?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesArea = areaFilter === "all" || initiative.area === areaFilter;
    const matchesRisk = riskFilter === "all" || initiative.riskLevel === riskFilter;

    return matchesSearch && matchesArea && matchesRisk;
  });

  const handleVote = async (initiativeId: number, hasVoted: boolean) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      if (hasVoted) {
        await unvoteMutation.mutateAsync({ initiativeId });
        toast.success("Vote removed");
      } else {
        await voteMutation.mutateAsync({ initiativeId });
        toast.success("Vote added!");
      }
      // Refresh the list to show updated vote counts
      utils.initiative.listAllWithVotes.invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to vote");
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getAreaLabel = (area: string) => {
    const labels: Record<string, string> = {
      "member-experience": "Member Experience",
      "operations": "Operations",
      "guest-services": "Guest Services",
      "technology": "Technology",
    };
    return labels[area] || area;
  };

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
              variant="outline"
              size="sm"
              onClick={() => setLocation("/roadmap")}
              aria-label="View AI Initiative Roadmap"
              className="border-teal-600 text-teal-600 hover:bg-teal-50"
            >
              View Roadmap
            </Button>
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
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Browse Ideas from Your Colleagues
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Get inspired by real AI initiatives submitted by Travel + Leisure Co. team members. Vote for ideas you'd like to see implemented!
          </p>

          {!isAuthenticated && (
            <Button
              size="lg"
              onClick={() => window.location.href = getLoginUrl()}
              aria-label="Sign in to submit your own idea"
            >
              <Lightbulb className="h-5 w-5 mr-2" aria-hidden="true" />
              Sign In to Submit Your Idea
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-gray-600" aria-hidden="true" />
              <h3 className="font-semibold text-gray-900">Search & Filter</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-3">
                <label htmlFor="search" className="sr-only">
                  Search initiatives
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by title or problem..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    aria-label="Search initiatives by title or problem"
                  />
                </div>
              </div>

              {/* Area Filter */}
              <div>
                <label htmlFor="area-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Area
                </label>
                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger id="area-filter" aria-label="Filter by area">
                    <SelectValue placeholder="All Areas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    <SelectItem value="member-experience">Member Experience</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="guest-services">Guest Services</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Risk Filter */}
              <div>
                <label htmlFor="risk-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Level
                </label>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger id="risk-filter" aria-label="Filter by risk level">
                    <SelectValue placeholder="All Risk Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              <div className="flex items-end">
                <p className="text-sm text-gray-600">
                  {filteredInitiatives ? (
                    <span>
                      <strong>{filteredInitiatives.length}</strong> {filteredInitiatives.length === 1 ? "initiative" : "initiatives"} found
                    </span>
                  ) : (
                    <span>Loading...</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Initiatives Grid */}
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading initiatives" />
            </div>
          ) : filteredInitiatives && filteredInitiatives.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInitiatives.map((initiative: any) => {
                // Check if current user has voted (simple check based on vote count change)
                const voteCount = initiative.voteCount || 0;
                
                return (
                  <article
                    key={initiative.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {initiative.title || "Untitled Initiative"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {initiative.userRole || "Team Member"}
                        </p>
                      </div>
                    </div>

                    {initiative.problemStatement && (
                      <div className="text-sm text-gray-700 mb-4 line-clamp-3">
                        <strong>Problem:</strong>{' '}
                        <span dangerouslySetInnerHTML={{ __html: initiative.problemStatement }} />
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      {initiative.area && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Area:</span>
                          <span className="font-medium text-gray-900">{getAreaLabel(initiative.area)}</span>
                        </div>
                      )}

                      {initiative.riskLevel && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Risk:</span>
                          <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getRiskColor(initiative.riskLevel)}`}>
                            {initiative.riskLevel}
                          </span>
                        </div>
                      )}

                      {initiative.missionAlignmentRating && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Mission Alignment:</span>
                          <span className="font-semibold text-blue-700">{initiative.missionAlignmentRating}</span>
                        </div>
                      )}

                      {initiative.governancePath && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Governance:</span>
                          <span className="font-medium text-gray-900">{initiative.governancePath}</span>
                        </div>
                      )}
                    </div>

                    {/* Voting Button */}
                    <div className="pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleVote(initiative.id, false)}
                        disabled={!isAuthenticated || voteMutation.isPending || unvoteMutation.isPending}
                        aria-label={`Vote for ${initiative.title}`}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" aria-hidden="true" />
                        {voteCount} {voteCount === 1 ? "Vote" : "Votes"}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No initiatives found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || areaFilter !== "all" || riskFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Be the first to submit an idea!"}
              </p>
              {isAuthenticated && (
                <Button onClick={() => setLocation("/new")} aria-label="Submit your first idea">
                  <Lightbulb className="h-4 w-4 mr-2" aria-hidden="true" />
                  Submit Your Idea
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8 mt-16">
        <div className="container text-center text-gray-600">
          <p className="text-sm">
            © 2026 Travel + Leisure Co. • Putting the World on Vacation
          </p>
        </div>
      </footer>
    </div>
  );
}
