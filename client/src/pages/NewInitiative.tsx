import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLoginUrl } from "@/const";
import { RichTextEditor } from "@/components/RichTextEditor";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Lightbulb, Loader2, Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// Helper function to strip HTML tags and check if content is empty
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export default function NewInitiative() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [aiApproach, setAiApproach] = useState("");
  const [area, setArea] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userEmail, setUserEmail] = useState(user?.email || "");

  // Update email when user loads
  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, [user]);

  const createMutation = trpc.initiative.create.useMutation({
    onSuccess: async (data) => {
      // Update the initiative with complete information
      // Initiative created successfully with all data
      setSubmitted(true);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit initiative");
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/");
      toast.info("Please sign in to submit an initiative");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      toast.error("Please provide a title for your initiative");
      return;
    }
    // Check if problemStatement has actual content (not just HTML tags)
    if (!stripHtml(problemStatement).trim()) {
      toast.error("Please describe the problem you're trying to solve");
      return;
    }
    if (!area) {
      toast.error("Please select which area this initiative belongs to");
      return;
    }
    if (!userRole.trim()) {
      toast.error("Please provide your role");
      return;
    }
    if (!userEmail.trim()) {
      toast.error("Please provide your email");
      return;
    }

    // Create initiative with complete data
    createMutation.mutate({
      title: title.trim(),
      submitterRole: userRole.trim(),
      area,
      submitterEmail: userEmail.trim(),
      problemStatement: problemStatement.trim(),
      proposedSolution: aiApproach.trim() || undefined,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container max-w-3xl py-12">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-8"
          >
            ← Back to Home
          </Button>

          <Card className="p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-4">
              Your Idea Has Been Submitted!
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Thank you for sharing your initiative with us. Your submission has
              been received and will be reviewed by our AI governance team.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-lg mb-3">What Happens Next?</h3>
              <ol className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-semibold text-primary">1.</span>
                  <span>
                    <strong>Initial Review (24-48 hours):</strong> Our AI team
                    will review your submission for completeness and mission
                    alignment.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-primary">2.</span>
                  <span>
                    <strong>Leadership Evaluation (3-5 business days):</strong>{" "}
                    The Chief AI Officer and governance team will assess
                    feasibility, impact, and priority.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-primary">3.</span>
                  <span>
                    <strong>You'll Hear From Us:</strong> We'll email you with
                    next steps—whether it's moving forward, needs more
                    information, or future consideration.
                  </span>
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => setLocation("/")} size="lg">
                Return to Home
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setTitle("");
                  setProblemStatement("");
                  setAiApproach("");
                  setArea("");
                  setUserRole("");
                }}
                size="lg"
              >
                Submit Another Idea
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container max-w-4xl py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-8"
        >
          ← Back to Home
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Submit Your AI Initiative</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Share your idea to improve member experiences and operational excellence at Travel + Leisure Co.
            Takes just 15-20 minutes.
          </p>
        </div>

        <Card className="p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* About You Section */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    1
                  </span>
                  About You
                </h2>
                <p className="text-muted-foreground">
                  Help us understand your perspective
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={user?.name || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    From your account
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                    placeholder="your.email@travelandleisure.com"
                  />
                  <p className="text-sm text-muted-foreground">
                    We'll use this to contact you
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">
                    Your Role <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="role"
                    placeholder="e.g., Resort Manager, Guest Services Director, Operations Analyst"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Your job title or position
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">
                    Department/Area <span className="text-destructive">*</span>
                  </Label>
                  <Select value={area} onValueChange={setArea} required>
                    <SelectTrigger id="area">
                      <SelectValue placeholder="Select your area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member-experience">
                        Member Experience
                      </SelectItem>
                      <SelectItem value="operations">
                        Operations
                      </SelectItem>
                      <SelectItem value="guest-services">
                        Guest Services
                      </SelectItem>
                      <SelectItem value="back-office">
                        Back Office / Administrative
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Where do you work?
                  </p>
                </div>
              </div>
            </div>

            {/* Your Idea Section */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    2
                  </span>
                  Your Idea
                </h2>
                <p className="text-muted-foreground">
                  Tell us about the problem and your proposed solution
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">
                  Initiative Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Automated Guest Communication System"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={200}
                />
                <p className="text-sm text-muted-foreground">
                  A clear, descriptive name for your initiative
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem">
                  What Problem Are You Trying to Solve?{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <RichTextEditor
                  value={problemStatement}
                  onChange={setProblemStatement}
                  placeholder="Describe the current challenge or frustration. What's not working? Why does it matter? Be specific about the impact."
                />
                <p className="text-sm text-muted-foreground">
                  Example: "Check-in wait times average 15-20 minutes during peak seasons,
                  frustrating members and creating operational bottlenecks."
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution">
                  How Could AI Help?{" "}
                  <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <RichTextEditor
                  value={aiApproach}
                  onChange={setAiApproach}
                  placeholder="If you have ideas about how AI could address this problem, share them here. Don't worry if you're not sure—we can help figure that out!"
                />
                <p className="text-sm text-muted-foreground">
                  Example: "AI could send automated reminders via text/email 48
                  hours and 24 hours before appointments, with easy
                  rescheduling options."
                </p>
              </div>
            </div>

            {/* Submit Section */}
            <div className="border-t pt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex items-start gap-3">
                  <Rocket className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Ready to submit?</p>
                    <p className="text-sm text-muted-foreground">
                      Your idea will be reviewed within 3-5 business days
                    </p>
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={createMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Initiative"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Help Section */}
        <Card className="mt-8 p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-3">Need Help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Not sure what to share? Think about:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Tasks you repeat 10+ times per day</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Information that's hard to find when you need it</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Processes that create unnecessary delays or errors</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Administrative work that takes you away from members</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
