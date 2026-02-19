import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/AuthDialog";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  CheckCircle2,
  Palmtree,
  LayoutDashboard,
  Lightbulb,
  Lock,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: stats } = trpc.initiative.listAll.useQuery();
  const totalSubmissions = stats?.length || 0;
  
  const { data: recentIdeas } = trpc.initiative.listAll.useQuery();
  const recentThree = recentIdeas?.slice(0, 3) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex flex-col">
              <img src={APP_LOGO} alt="Travel + Leisure Co. logo" className="h-8 md:h-12" />
              <span className="text-xs text-gray-500 mt-1 hidden sm:block">
                Putting the World on Vacation
              </span>
            </div>
            <div className="h-8 md:h-12 w-px bg-gray-300 hidden sm:block" />
            <span className="text-lg md:text-2xl font-semibold text-gray-900">
              <span className="hidden sm:inline">AI Governance Platform</span>
              <span className="sm:hidden">AI Portal</span>
            </span>
          </div>
          {!isAuthenticated ? (
            <AuthDialog />
          ) : (
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                onClick={() => setLocation("/admin")}
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-900 hover:to-gray-800 text-white shadow-md hover:shadow-lg transition-all"
                aria-label={user?.role === 'admin' ? 'Go to admin dashboard' : 'View my submissions'}
              >
                <LayoutDashboard className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">{user?.role === 'admin' ? 'Dashboard' : 'My Submissions'}</span>
              </Button>
              <div className="h-6 w-px bg-gray-300 hidden md:block" />
              <span className="text-sm text-gray-600 hidden md:inline">
                Hi, <span className="font-medium text-gray-900">{user?.name?.split(' ')[0] || 'there'}</span>!
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-full mb-6 text-sm font-medium">
            <Palmtree className="h-4 w-4" />
            <span>Innovation That Enhances Every Vacation</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            You See Opportunities Every Day.
            <br />
            <span className="bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
              What If AI Could Unlock Them?
            </span>
          </h1>

          {/* Subheadline */}
          <div className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto space-y-4">
            <p>
              That manual process slowing down check-ins? The personalization you wish you could offer every member? The operational bottleneck costing time and revenue?
            </p>
            <p className="text-2xl font-bold text-gray-900">
              What if your idea could actually get built and deployed across Travel + Leisure Co.'s 270+ resorts?
            </p>
            <p>
              You don't need to be a data scientist to share it.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {!isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => window.location.href = getLoginUrl()}
                className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-900 hover:to-gray-800 text-white px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all min-h-[48px]"
                aria-label="Sign in to share your AI idea"
              >
                Share Your Idea Now
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => setLocation("/new-initiative")}
                  className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-900 hover:to-gray-800 text-white px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all min-h-[48px]"
                  aria-label="Submit a new AI initiative idea"
                >
                  <span className="hidden sm:inline">Submit Your Initiative for Review</span>
                  <span className="sm:hidden">Submit Initiative</span>
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation("/idea-starters")}
                  className="border-2 border-gray-800 text-gray-800 hover:bg-gray-50 px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold min-h-[48px]"
                  aria-label="View idea starters and examples"
                >
                  <Lightbulb className="mr-2 h-5 w-5" aria-hidden="true" />
                  <span className="hidden sm:inline">Need Inspiration?</span>
                  <span className="sm:hidden">Get Ideas</span>
                </Button>
              </>
            )}
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm md:text-base text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
              <span>No technical expertise required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
              <span>15-20 minute submission</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
              <span>Governance review within 5 days</span>
            </div>
          </div>

          {/* Social Proof */}
          {totalSubmissions > 0 && (
            <div className="mt-8 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 md:px-6 py-3 rounded-full text-sm md:text-base" role="status" aria-live="polite">
              <Users className="h-5 w-5" aria-hidden="true" />
              <span className="font-semibold">{totalSubmissions} team members</span>
              <span className="hidden sm:inline">have already submitted initiatives</span>
              <span className="sm:hidden">submitted ideas</span>
            </div>
          )}
        </div>
      </section>

      {/* Let's Be Honest Section - Addresses Concerns */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-5xl font-bold mb-8 md:mb-12 text-center">
              Let's Be Honest About AI in Hospitality
            </h2>
            <div className="space-y-6 md:space-y-8 text-base md:text-xl leading-relaxed">
              <p className="text-center text-gray-50">
                We know what you might be thinking:
              </p>
              
              <p className="text-xl md:text-3xl font-bold text-center italic px-4">
                "Is this going to eliminate jobs?"
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-10 border border-white/20">
                <p className="text-lg md:text-2xl font-bold text-white mb-4 md:mb-6">
                  Here's our commitment:
                </p>
                <p className="text-base md:text-xl text-gray-50 leading-relaxed">
                  We're not replacing people. We're empowering our teams to deliver exceptional member experiences at scale.
                </p>
              </div>
              
              <p className="text-base md:text-xl text-gray-50 leading-relaxed px-2">
                AI won't replace resort managers, guest services, or operations teams. But it can handle the repetitive workflows—the manual data entry, the scheduling conflicts, the endless searching for member preferences—so you can focus on what actually creates loyalty:
              </p>
              
              <p className="text-2xl md:text-4xl font-bold text-center px-4">
                Creating unforgettable vacation experiences.
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 md:p-8 border border-white/20 mt-8 md:mt-10">
                <p className="text-xl md:text-3xl font-bold text-center">
                  Your role isn't going away.
                  <br />
                  <span className="text-gray-100">The tedious parts of it might.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Need Your Input */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            We Need Your Operational Insights
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            The best AI solutions don't come from corporate headquarters—they come from people on the ground who see the operational bottlenecks every day. <strong className="inline-block">You know what would actually move the needle.</strong> We're not guessing. We're listening.
          </p>
        </div>
      </section>

      {/* Recently Submitted Ideas */}
      {recentThree.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Initiatives Your Colleagues Are Already Proposing
            </h2>
            <p className="text-xl text-gray-600">
              Real operational challenges from real team members
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {recentThree.map((idea) => (
              <Card key={idea.id} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-gray-100 text-gray-800 hover:bg-gray-100">
                    {idea.area?.replace("-", " ") || "general"}
                  </Badge>
                  <CardTitle className="text-lg line-clamp-2">
                    {idea.title || "Untitled Initiative"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="text-sm text-gray-600 line-clamp-3"
                    dangerouslySetInnerHTML={{ 
                      __html: idea.problemStatement || "Improving member experience through AI-powered operational excellence." 
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => setLocation("/browse")}
              className="border-gray-800 text-gray-800 hover:bg-gray-50"
            >
              See All Initiatives
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/roadmap")}
              className="border-gray-700 text-cyan-600 hover:bg-gray-50"
            >
              View Roadmap
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      )}

      {/* What Happens Next - Governance Process */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              "What's the Governance Process?"
            </h2>
            <p className="text-base md:text-xl text-gray-600 px-4">
              We use a structured framework to ensure every initiative is evaluated fairly
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border-2 border-gray-100 hover:border-teal-200 transition-colors">
              <div className="bg-gray-100 text-gray-700 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                You Submit
              </h3>
              <p className="text-gray-600">
                Fill out our governance framework: workflow analysis, measurable outcomes, operational impact, and strategic alignment.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border-2 border-gray-100 hover:border-teal-200 transition-colors">
              <div className="bg-gray-100 text-gray-700 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Governance Review
              </h3>
              <p className="text-gray-600">
                Our AI Governance team evaluates using the Operational Prioritization Matrix: Effort vs. Return vs. Risk.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border-2 border-gray-100 hover:border-teal-200 transition-colors">
              <div className="bg-gray-100 text-gray-700 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Decision & Roadmap
              </h3>
              <p className="text-gray-600">
                Quick Wins get fast-tracked. Strategic Bets get phased planning. You get transparent feedback either way.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <p className="text-lg text-gray-600 mb-4">
              <strong className="text-gray-900">Average review time:</strong> 3-5 business days
            </p>
            <p className="text-sm text-gray-500">
              All decisions are tracked and visible on the roadmap
            </p>
          </div>
        </div>
      </section>

      {/* Governance Principles */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Governance Principles
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every initiative is evaluated against these criteria to ensure operational excellence and member impact
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="border-2 border-gray-100 hover:border-gray-300 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="h-6 w-6 text-gray-800" />
              </div>
              <CardTitle className="text-lg">Workflow Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                "No workflow change = No impact." Every initiative must demonstrate measurable process improvement.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-100 hover:border-gray-300 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-3">
                <Sparkles className="h-6 w-6 text-cyan-600" />
              </div>
              <CardTitle className="text-lg">Measurable Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                One clear goal. Quantified baseline. Defined success criteria. No vague "innovation theater."
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Compliance, data privacy, and operational risks evaluated before approval. Governance first.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 hover:border-purple-300 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Lock className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Strategic Alignment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Member experience, brand differentiation, and operational excellence are our north stars.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl md:text-2xl text-gray-50 mb-8 max-w-3xl mx-auto">
            Your operational insight could become the next Quick Win deployed across 270+ resorts
          </p>
          {!isAuthenticated ? (
            <Button
              size="lg"
              onClick={() => window.location.href = getLoginUrl()}
              className="bg-white text-gray-800 hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => setLocation("/new-initiative")}
              className="bg-white text-gray-800 hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
            >
              Submit Your Initiative
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p className="mb-2">
            <strong className="text-gray-900">Travel + Leisure Co.</strong> — Putting the World on Vacation
          </p>
          <p>
            AI Governance Platform | Operational Excellence Through Responsible Innovation
          </p>
        </div>
      </footer>
    </div>
  );
}
