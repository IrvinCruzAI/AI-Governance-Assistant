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
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F5A4A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <header className="border-b border-gray-300 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex flex-col">
              <img src={APP_LOGO} alt="Travel + Leisure Co. logo" className="h-8 md:h-12" />
              <span className="text-xs text-gray-600 mt-1 hidden sm:block">
                Putting the World on Vacation
              </span>
            </div>
            <div className="h-8 md:h-12 w-px bg-gray-300 hidden sm:block" />
            <span className="text-lg md:text-2xl font-semibold text-gray-900 tracking-wide">
              <span className="hidden sm:inline">AI GOVERNANCE PORTAL</span>
              <span className="sm:hidden">AI PORTAL</span>
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Button
                onClick={() => setLocation("/browse")}
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-[#2F5A4A] hover:bg-[#F5F1E8] uppercase text-xs tracking-wider font-medium"
              >
                Browse Ideas
              </Button>
              <Button
                onClick={() => setLocation("/roadmap")}
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-[#2F5A4A] hover:bg-[#F5F1E8] uppercase text-xs tracking-wider font-medium"
              >
                Roadmap
              </Button>
            </nav>
            
            {!isAuthenticated ? (
              <AuthDialog />
            ) : (
              <>
                <div className="h-6 w-px bg-gray-300 hidden md:block" />
                <Button
                  onClick={() => setLocation("/admin")}
                  variant="outline"
                  size="sm"
                  className="border-2 border-[#2F5A4A] text-[#2F5A4A] hover:bg-[#2F5A4A] hover:text-white transition-all uppercase text-xs tracking-wider font-medium"
                  aria-label={user?.role === 'admin' ? 'Go to admin dashboard' : 'View my submissions'}
                >
                  <LayoutDashboard className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{user?.role === 'admin' ? 'Dashboard' : 'My Submissions'}</span>
                </Button>
                <div className="h-6 w-px bg-gray-300 hidden md:block" />
                <span className="text-sm text-gray-600 hidden md:inline">
                  Hi, <span className="font-medium text-gray-900">{user?.name?.split(' ')[0] || 'there'}</span>!
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-28">
        <div className="max-w-5xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#2F5A4A]/20 text-gray-800 px-5 py-2.5 rounded-sm mb-8 text-sm font-medium tracking-wide">
            <Palmtree className="h-4 w-4 text-[#2F5A4A]" />
            <span className="uppercase text-xs">For Travel + Leisure Co. Team Members</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-7xl font-black text-gray-900 mb-8 leading-tight tracking-tight uppercase">
            You See Opportunities
            <br />
            Every Day.
            <br />
            <span className="text-[#2F5A4A]">
              What If AI Could
              <br />
              Unlock Them?
            </span>
          </h1>

          {/* Subheadline */}
          <div className="text-lg md:text-xl text-gray-700 mb-10 max-w-4xl mx-auto space-y-6 leading-relaxed">
            <p>
              That manual process slowing down check-ins? The personalization you wish you could offer? The operational bottleneck costing time and revenue?
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">
              What if your idea could actually get built and deployed across Travel + Leisure Co.'s 270+ resorts?
            </p>
            <p className="text-base md:text-lg">
              You don't need to be a data scientist to share it.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            {!isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => window.location.href = getLoginUrl()}
                variant="outline"
                className="border-2 border-[#2F5A4A] text-[#2F5A4A] hover:bg-[#2F5A4A] hover:text-white px-8 py-6 text-base font-semibold uppercase tracking-wider transition-all min-h-[56px]"
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
                  variant="outline"
                  className="border-2 border-[#2F5A4A] text-[#2F5A4A] hover:bg-[#2F5A4A] hover:text-white px-8 py-6 text-base font-semibold uppercase tracking-wider transition-all min-h-[56px]"
                  aria-label="Submit a new AI initiative idea"
                >
                  <span className="hidden sm:inline">Submit Your Initiative</span>
                  <span className="sm:hidden">Submit Initiative</span>
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation("/idea-starters")}
                  className="border-2 border-gray-400 text-gray-700 hover:bg-gray-100 px-8 py-6 text-base font-semibold uppercase tracking-wider min-h-[56px]"
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
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm text-gray-700 mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#2F5A4A]" aria-hidden="true" />
              <span>No technical expertise required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#2F5A4A]" aria-hidden="true" />
              <span>15-20 minute submission</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#2F5A4A]" aria-hidden="true" />
              <span>Governance review within 5 days</span>
            </div>
          </div>

          {/* Social Proof */}
          {totalSubmissions > 0 && (
            <div className="inline-flex items-center gap-3 bg-white border border-[#2F5A4A]/20 px-6 py-3 rounded-sm text-base" role="status" aria-live="polite">
              <Users className="h-5 w-5 text-[#2F5A4A]" aria-hidden="true" />
              <span className="font-semibold text-gray-900">{totalSubmissions} team members</span>
              <span className="hidden sm:inline text-gray-700">have already submitted initiatives</span>
              <span className="sm:hidden text-gray-700">submitted ideas</span>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section - Travel + Leisure Style */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-[#2F5A4A] text-white p-10 text-center rounded-sm">
              <div className="text-5xl md:text-6xl font-bold mb-3">270+</div>
              <div className="h-px w-12 bg-white/40 mx-auto mb-3"></div>
              <div className="text-sm uppercase tracking-wider">Resorts Impacted Worldwide</div>
            </div>
            <div className="bg-[#2F5A4A] text-white p-10 text-center rounded-sm">
              <div className="text-5xl md:text-6xl font-bold mb-3">{totalSubmissions}</div>
              <div className="h-px w-12 bg-white/40 mx-auto mb-3"></div>
              <div className="text-sm uppercase tracking-wider">Ideas Submitted</div>
            </div>
            <div className="bg-[#2F5A4A] text-white p-10 text-center rounded-sm">
              <div className="text-5xl md:text-6xl font-bold mb-3">3-5</div>
              <div className="h-px w-12 bg-white/40 mx-auto mb-3"></div>
              <div className="text-sm uppercase tracking-wider">Days to Review</div>
            </div>
          </div>
        </div>
      </section>

      {/* Let's Be Honest Section */}
      <section className="bg-[#3D6B5A] text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-10 text-center uppercase tracking-tight">
              Let's Be Honest About
              <br />
              AI in Hospitality
            </h2>
            <div className="space-y-8 text-lg md:text-xl leading-relaxed">
              <p className="text-center text-white/90">
                We know what you might be thinking:
              </p>
              
              <p className="text-2xl md:text-4xl font-bold text-center italic">
                "Is this going to eliminate jobs?"
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-sm p-8 md:p-12 border border-white/20">
                <p className="text-xl md:text-2xl font-bold text-white mb-6">
                  Here's our commitment:
                </p>
                <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                  We're not replacing people. We're empowering our teams to deliver exceptional member experiences at scale.
                </p>
              </div>
              
              <p className="text-base md:text-lg text-white/90 leading-relaxed">
                AI won't replace resort managers, guest services, or operations teams. But it can handle the repetitive workflows—the manual data entry, the scheduling conflicts, the endless searching for member preferences—so you can focus on what actually creates loyalty:
              </p>
              
              <p className="text-3xl md:text-4xl font-black text-center uppercase tracking-tight">
                Creating Unforgettable
                <br />
                Vacation Experiences.
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-sm p-8 md:p-10 border border-white/20 mt-10">
                <p className="text-2xl md:text-3xl font-bold text-center">
                  Your role isn't going away.
                  <br />
                  <span className="text-white/80">The tedious parts of it might.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Need Your Input */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 uppercase tracking-tight">
            We Need Your
            <br />
            Operational Insights
          </h2>
          <div className="space-y-4">
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
              The best AI solutions don't come from corporate headquarters—they come from people on the ground who see the operational bottlenecks every day.
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">
              You know what would actually move the needle.
            </p>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
              We're not guessing. We're listening.
            </p>
          </div>
        </div>
      </section>

      {/* Recently Submitted Ideas */}
      {recentThree.length > 0 && (
        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">
                Initiatives Your Colleagues
                <br />
                Are Already Proposing
              </h2>
              <p className="text-lg md:text-xl text-gray-700">
                Real operational challenges from real team members
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10 max-w-6xl mx-auto">
              {recentThree.map((idea) => (
                <Card key={idea.id} className="border-2 border-gray-200 hover:border-[#2F5A4A] transition-colors bg-[#F5F1E8] rounded-sm">
                  <CardHeader>
                    <Badge className="w-fit mb-3 bg-[#2F5A4A] text-white hover:bg-[#2F5A4A] uppercase text-xs tracking-wider">
                      {idea.area?.replace("-", " ") || "general"}
                    </Badge>
                    <CardTitle className="text-lg font-bold line-clamp-2">
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

            <div className="text-center flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => setLocation("/browse")}
                className="border-2 border-[#2F5A4A] text-[#2F5A4A] hover:bg-[#2F5A4A] hover:text-white uppercase text-sm tracking-wider font-medium"
              >
                See All Initiatives
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/roadmap")}
                className="border-2 border-gray-400 text-gray-700 hover:bg-gray-100 uppercase text-sm tracking-wider font-medium"
              >
                View Roadmap
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* What Happens Next - Governance Process */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 uppercase tracking-tight">
              "What's the
              <br />
              Governance Process?"
            </h2>
            <p className="text-lg md:text-xl text-gray-700">
              We use a structured framework to ensure every initiative is evaluated fairly
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="bg-white rounded-sm p-8 border-2 border-gray-200 hover:border-[#2F5A4A] transition-colors">
              <div className="bg-[#2F5A4A] text-white w-16 h-16 rounded-sm flex items-center justify-center text-3xl font-black mb-6">
                1
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wide">
                You Submit
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Fill out our governance framework: workflow analysis, measurable outcomes, operational impact, and strategic alignment.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-sm p-8 border-2 border-gray-200 hover:border-[#2F5A4A] transition-colors">
              <div className="bg-[#2F5A4A] text-white w-16 h-16 rounded-sm flex items-center justify-center text-3xl font-black mb-6">
                2
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wide">
                Governance Review
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Our AI Governance team evaluates using the Operational Prioritization Matrix: Effort vs. Return vs. Risk.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-sm p-8 border-2 border-gray-200 hover:border-[#2F5A4A] transition-colors">
              <div className="bg-[#2F5A4A] text-white w-16 h-16 rounded-sm flex items-center justify-center text-3xl font-black mb-6">
                3
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wide">
                Decision & Roadmap
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Quick Wins get fast-tracked. Strategic Bets get phased planning. You get transparent feedback either way.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-gray-700 mb-2">
              <strong className="text-gray-900 font-bold">Average review time:</strong> 3-5 business days
            </p>
            <p className="text-sm text-gray-600">
              All decisions are tracked and visible on the roadmap
            </p>
          </div>
        </div>
      </section>

      {/* Governance Principles */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">
              Our Governance Principles
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
              Every initiative is evaluated against these criteria to ensure operational excellence and member impact
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border-2 border-gray-200 hover:border-[#2F5A4A] transition-colors bg-[#F5F1E8] rounded-sm">
              <CardHeader>
                <div className="w-14 h-14 bg-[#2F5A4A] rounded-sm flex items-center justify-center mb-4">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-lg font-black uppercase tracking-wide">Workflow Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">
                  "No workflow change = No impact." Every initiative must demonstrate measurable process improvement.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-[#2F5A4A] transition-colors bg-[#F5F1E8] rounded-sm">
              <CardHeader>
                <div className="w-14 h-14 bg-[#2F5A4A] rounded-sm flex items-center justify-center mb-4">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-lg font-black uppercase tracking-wide">Measurable Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">
                  One clear goal. Quantified baseline. Defined success criteria. No vague "innovation theater."
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-[#2F5A4A] transition-colors bg-[#F5F1E8] rounded-sm">
              <CardHeader>
                <div className="w-14 h-14 bg-[#2F5A4A] rounded-sm flex items-center justify-center mb-4">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-lg font-black uppercase tracking-wide">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Compliance, data privacy, and operational risks evaluated before approval. Governance first.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-[#2F5A4A] transition-colors bg-[#F5F1E8] rounded-sm">
              <CardHeader>
                <div className="w-14 h-14 bg-[#2F5A4A] rounded-sm flex items-center justify-center mb-4">
                  <Lock className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-lg font-black uppercase tracking-wide">Strategic Alignment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Member experience, brand differentiation, and operational excellence are our north stars.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#2F5A4A] text-white py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tight">
            Ready to Make
            <br />
            an Impact?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Your operational insight could become the next Quick Win deployed across 270+ resorts
          </p>
          {!isAuthenticated ? (
            <Button
              size="lg"
              onClick={() => window.location.href = getLoginUrl()}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-[#2F5A4A] px-10 py-7 text-lg font-bold uppercase tracking-wider transition-all"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => setLocation("/new-initiative")}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-[#2F5A4A] px-10 py-7 text-lg font-bold uppercase tracking-wider transition-all"
            >
              Submit Your Initiative
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-300 bg-white py-10">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p className="mb-2">
            <strong className="text-gray-900 font-bold">Travel + Leisure Co.</strong> — Putting the World on Vacation
          </p>
          <p className="text-xs uppercase tracking-wider">
            AI Governance Portal | Operational Excellence Through Responsible Innovation
          </p>
        </div>
      </footer>
    </div>
  );
}
