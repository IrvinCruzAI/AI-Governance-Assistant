import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Loader2, Search, ThumbsUp, Filter, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface Initiative {
  id: number;
  title: string | null;
  problemStatement: string | null;
  area: string | null;
  riskLevel: string | null;
  voteCount: number;
  hasVoted: boolean;
}

interface BrowseViewProps {
  initiatives: Initiative[];
  loading: boolean;
  onViewDetails: (initiative: Initiative) => void;
}

export function BrowseView({ initiatives, loading, onViewDetails }: BrowseViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const voteMutation = trpc.initiative.vote.useMutation();
  const unvoteMutation = trpc.initiative.unvote.useMutation();
  const utils = trpc.useUtils();

  // Filter initiatives
  const filteredInitiatives = initiatives?.filter((initiative) => {
    const matchesSearch =
      !searchQuery ||
      initiative.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      initiative.problemStatement?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesArea = areaFilter === "all" || initiative.area === areaFilter;
    const matchesRisk = riskFilter === "all" || initiative.riskLevel === riskFilter;

    return matchesSearch && matchesArea && matchesRisk;
  });

  const handleVote = async (initiativeId: number, hasVoted: boolean) => {
    try {
      if (hasVoted) {
        await unvoteMutation.mutateAsync({ initiativeId });
        toast.success("Vote removed");
      } else {
        await voteMutation.mutateAsync({ initiativeId });
        toast.success("Vote added!");
      }
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
      "clinical-care": "Clinical Care",
      "clinical-support": "Clinical Support",
      "clinical-operations": "Clinical Operations",
      "back-office": "Back Office",
    };
    return labels[area] || area;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
          <Lightbulb className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Ideas</h2>
          <p className="text-gray-600">Browse and vote on AI initiatives from your colleagues</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={areaFilter} onValueChange={setAreaFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Areas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            <SelectItem value="clinical-care">Clinical Care</SelectItem>
            <SelectItem value="clinical-support">Clinical Support</SelectItem>
            <SelectItem value="clinical-operations">Clinical Operations</SelectItem>
            <SelectItem value="back-office">Back Office</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Risk Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="Low">Low Risk</SelectItem>
            <SelectItem value="Medium">Medium Risk</SelectItem>
            <SelectItem value="High">High Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredInitiatives?.length || 0} {filteredInitiatives?.length === 1 ? "idea" : "ideas"} found
      </div>

      {/* Initiatives Grid */}
      {filteredInitiatives && filteredInitiatives.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredInitiatives.map((initiative) => (
            <div
              key={initiative.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
            >
              {/* Header with Area and Risk */}
              <div className="flex items-start justify-between mb-4">
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  {getAreaLabel(initiative.area || "")}
                </span>
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getRiskColor(initiative.riskLevel || "")}`}>
                  {initiative.riskLevel || "Unknown"} Risk
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                {initiative.title || "Untitled Initiative"}
              </h3>

              {/* Problem Statement */}
              <div
                className="text-gray-600 text-sm mb-4 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: initiative.problemStatement || "No description provided" }}
              />

              {/* Footer with Vote and View Details */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Button
                  variant={initiative.hasVoted ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleVote(initiative.id, initiative.hasVoted)}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{initiative.voteCount}</span>
                  <span className="hidden sm:inline">{initiative.hasVoted ? "Voted" : "Vote"}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(initiative)}
                >
                  View Details →
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No ideas match your search</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
