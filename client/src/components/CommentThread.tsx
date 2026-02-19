import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageSquare, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

interface CommentThreadProps {
  initiativeId: number;
}

export default function CommentThread({ initiativeId }: CommentThreadProps) {
  const { user, isAuthenticated } = useAuth();
  const [newComment, setNewComment] = useState("");
  const utils = trpc.useUtils();

  // Fetch comments
  const { data: comments, isLoading } = trpc.comments.list.useQuery({ initiativeId });

  // Create comment mutation
  const createMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      setNewComment("");
      utils.comments.list.invalidate({ initiativeId });
      toast.success("Comment posted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to post comment");
    },
  });

  // Delete comment mutation
  const deleteMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate({ initiativeId });
      toast.success("Comment deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    createMutation.mutate({
      initiativeId,
      content: newComment.trim(),
    });
  };

  const handleDelete = (commentId: number) => {
    if (confirm("Delete this comment?")) {
      deleteMutation.mutate({ id: commentId });
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-[#2F5A4A]" />
        <h2 className="text-2xl font-black uppercase tracking-wide text-gray-900">
          Discussion
        </h2>
        <span className="text-sm text-gray-600">
          ({comments?.length || 0} {comments?.length === 1 ? "comment" : "comments"})
        </span>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <Card className="p-6 bg-white border-[#2F5A4A]/20 rounded-sm shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts, ask questions, or provide feedback..."
              className="min-h-[100px] resize-none border-gray-300 focus:border-[#2F5A4A] focus:ring-[#2F5A4A] rounded-sm"
              maxLength={5000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {newComment.length}/5000 characters
              </span>
              <Button
                type="submit"
                disabled={!newComment.trim() || createMutation.isPending}
                className="bg-[#2F5A4A] hover:bg-[#2F5A4A]/90 text-white rounded-sm uppercase tracking-wide font-bold"
              >
                <Send className="h-4 w-4 mr-2" />
                Post Comment
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-6 bg-white border-[#2F5A4A]/20 rounded-sm shadow-sm text-center">
          <p className="text-gray-600 mb-4">Sign in to join the discussion</p>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="bg-[#2F5A4A] hover:bg-[#2F5A4A]/90 text-white rounded-sm uppercase tracking-wide font-bold"
          >
            Sign In
          </Button>
        </Card>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading comments...</div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card
              key={comment.id}
              className="p-6 bg-white border-[#2F5A4A]/20 rounded-sm shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold uppercase text-white ${
                      comment.userRole === "admin"
                        ? "bg-[#2F5A4A]"
                        : "bg-gray-600"
                    }`}
                  >
                    {comment.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        {comment.userName}
                      </span>
                      {comment.userRole === "admin" && (
                        <span className="px-2 py-0.5 bg-[#2F5A4A] text-white text-xs font-bold uppercase tracking-wide rounded-sm">
                          Team
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Delete button (only for comment owner) */}
                {user && user.id === comment.userId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(comment.id)}
                    disabled={deleteMutation.isPending}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Comment Content */}
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {comment.content}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 bg-white border-[#2F5A4A]/20 rounded-sm shadow-sm text-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No comments yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Be the first to start the discussion
          </p>
        </Card>
      )}
    </div>
  );
}
