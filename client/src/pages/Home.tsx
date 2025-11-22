import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Loader2,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Eye,
  Shield,
  Users,
  Heart,
  CheckCircle2,
  Clock,
  TrendingUp,
  Zap,
  Award,
} from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  
  // Fetch recent initiatives for social proof
  const { data: recentInitiatives } = trpc.initiative.listAll.useQuery();
  const { data: analytics } = trpc.admin.getAnalytics.useQuery(undefined, {
    enabled: false, // Only fetch if we need it
  });

  const totalSubmissions = recentInitiatives?.length || 0;
  const recentThree = recentInitiatives?.slice(0, 3) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container flex justify-between items-center py-4">
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">
            {APP_TITLE}
          </h1>
          <div className="flex items-center gap-3">
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

      {/* Hero Section - Optimized */}
      <section className="container py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            {/* Mission Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <span className="text-sm font-medium text-blue-900">Extending the Healing Ministry of Christ</span>
            </div>
            
            {/* Powerful Headline */}
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Turn Your Daily Frustrations<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
                Into Healthcare Solutions
              </span>
            </h2>
            
            {/* Compelling Subheadline */}
            <p className="text-lg md:text-xl text-gray-700 mb-4 max-w-3xl mx-auto leading-relaxed">
              You see the problems every day. You know what would help. Share your AI idea and get expert feedback in <strong>48 hours</strong>.
            </p>

            {/* Social Proof Counter */}
            {totalSubmissions > 0 && (
              <div className="inline-flex items-center gap-2 text-sm text-gray-600 mb-8">
                <Users className="h-4 w-4 text-teal-600" />
                <span>
                  <strong className="text-gray-900">{totalSubmissions}</strong> colleagues have already shared their ideas
                </span>
              </div>
            )}

            {/* Primary CTA */}
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <Button
                  size="lg"
                  className="text-lg px-12 py-8 shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  onClick={() => setLocation("/new")}
                  aria-label="Submit your AI initiative idea"
                >
                  <Lightbulb className="h-5 w-5 mr-2" aria-hidden="true" />
                  Share My Idea Now
                  <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-base px-8 py-6 w-full sm:w-auto text-gray-700 hover:text-gray-900"
                  onClick={() => setLocation("/browse")}
                  aria-label="Browse ideas from colleagues"
                >
                  <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                  Browse Ideas First
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <Button
                  size="lg"
                  className="text-lg px-12 py-8 shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  onClick={() => window.location.href = getLoginUrl()}
                  aria-label="Sign in to submit your idea"
                >
                  Sign In to Get Started
                  <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-base px-8 py-6 w-full sm:w-auto text-gray-700 hover:text-gray-900"
                  onClick={() => setLocation("/browse")}
                  aria-label="Browse ideas from colleagues without signing in"
                >
                  <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                  Browse Ideas First
                </Button>
              </div>
            )}

            {/* Trust Indicators Below CTA */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>No technical experience needed</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Takes 10-15 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span>Ideas reviewed weekly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Submitted Ideas - Social Proof */}
      {recentThree.length > 0 && (
        <section className="container py-12">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Recently Submitted Ideas
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {recentThree.map((initiative) => (
                <Card key={initiative.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/browse`)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        {initiative.area || "General"}
                      </Badge>
                      {initiative.riskLevel && (
                        <Badge variant={
                          initiative.riskLevel === 'High' ? 'destructive' :
                          initiative.riskLevel === 'Medium' ? 'default' :
                          'secondary'
                        } className="text-xs">
                          {initiative.riskLevel} Risk
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {initiative.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {initiative.problemStatement || "Improving healthcare delivery through AI innovation"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button variant="outline" onClick={() => setLocation("/browse")}>
                View All Ideas
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* What Happens Next - Process Transparency */}
      <section className="container py-16">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            What Happens Next?
          </h3>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
                  1
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">You Submit</h4>
                <p className="text-sm text-gray-600">Answer 6 simple questions about your AI idea (10-15 min)</p>
              </div>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-300 to-teal-300"></div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
                  2
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">AI Analyzes</h4>
                <p className="text-sm text-gray-600">Instant mission alignment & risk assessment generated</p>
              </div>
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-teal-300 to-blue-300"></div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
                  3
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Expert Review</h4>
                <p className="text-sm text-gray-600">Chief AI Officer's team evaluates within 48 hours</p>
              </div>
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-300 to-green-300"></div>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">You Get Feedback</h4>
              <p className="text-sm text-gray-600">Receive decision, next steps, or request for more info</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators - Redesigned */}
      <section className="container py-16 bg-white/60 backdrop-blur-sm rounded-3xl">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 mb-4">
                <Shield className="h-10 w-10 text-blue-700" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Safe & Secure</h3>
              <p className="text-gray-600 leading-relaxed">
                Every idea reviewed for patient safety, privacy, and ethics before implementation
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 mb-4">
                <Users className="h-10 w-10 text-teal-700" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Augmented, Not Replaced</h3>
              <p className="text-gray-600 leading-relaxed">
                AI supports you—reducing burnout and tedious tasks, not your workforce
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 mb-4">
                <Heart className="h-10 w-10 text-red-600" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mission-Driven</h3>
              <p className="text-gray-600 leading-relaxed">
                Aligned with whole-person care and our healing ministry values
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Endorsement */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-2 border-blue-200 shadow-xl">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-start gap-6">
                <div className="hidden md:block w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-teal-600 flex-shrink-0 flex items-center justify-center text-white text-3xl font-bold">
                  VH
                </div>
                <div className="flex-1">
                  <blockquote className="mb-4">
                    <p className="text-xl md:text-2xl text-gray-800 font-medium mb-4 leading-relaxed">
                      "We are not trying to replace people's thinking. We're just trying to enhance it. Your frontline insights are invaluable—share them with us."
                    </p>
                  </blockquote>
                  <footer className="flex items-center gap-3">
                    <div>
                      <cite className="not-italic font-semibold text-gray-900">Dr. Victor Herrera</cite>
                      <p className="text-sm text-gray-600">Chief Clinical Officer, AdventHealth</p>
                    </div>
                  </footer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Success Stories */}
      <section className="container py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Real Ideas, Real Impact
            </h3>
            <p className="text-lg text-gray-600">
              See how your colleagues' ideas are transforming healthcare delivery
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-green-200 bg-green-50/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-6 w-6 text-green-600" />
                  <Badge variant="default" className="bg-green-600">Implemented</Badge>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  AI-Powered Discharge Summaries
                </h4>
                <p className="text-gray-700 mb-4">
                  Submitted by a hospitalist who was frustrated with spending 2+ hours daily on discharge paperwork. Now automated with AI review.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-green-700 font-semibold">
                    <TrendingUp className="h-4 w-4" />
                    <span>200+ hours saved/month</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-6 w-6 text-blue-600" />
                  <Badge variant="default" className="bg-blue-600">In Development</Badge>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Predictive Sepsis Detection
                </h4>
                <p className="text-gray-700 mb-4">
                  ICU nurse noticed patterns in vital signs before sepsis onset. AI model now alerts clinicians 6 hours earlier.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-blue-700 font-semibold">
                    <Heart className="h-4 w-4" />
                    <span>Potential to save lives</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ - Addressing Concerns */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Common Questions
          </h3>

          <div className="space-y-4">
            <details className="bg-white border-2 border-gray-200 rounded-xl p-6 group hover:border-blue-300 transition-colors">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>"I'm not technical. Can I still submit an idea?"</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform" aria-hidden="true">▼</span>
              </summary>
              <p className="text-gray-600 mt-4 leading-relaxed">
                <strong>Absolutely!</strong> You don't need any technical knowledge. Just describe the problem you see and how AI might help. Our team handles all the technical details. The best ideas often come from frontline staff who understand the daily challenges.
              </p>
            </details>

            <details className="bg-white border-2 border-gray-200 rounded-xl p-6 group hover:border-blue-300 transition-colors">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>"Will AI take my job?"</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform" aria-hidden="true">▼</span>
              </summary>
              <p className="text-gray-600 mt-4 leading-relaxed">
                <strong>No.</strong> AI is here to make your job easier, not replace you. Our focus is reducing burnout, automating tedious tasks, and giving you more time for meaningful patient care. Every AI initiative is evaluated to ensure it augments—not replaces—our talented team.
              </p>
            </details>

            <details className="bg-white border-2 border-gray-200 rounded-xl p-6 group hover:border-blue-300 transition-colors">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>"What if I don't have a fully formed idea?"</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform" aria-hidden="true">▼</span>
              </summary>
              <p className="text-gray-600 mt-4 leading-relaxed">
                <strong>That's perfectly fine!</strong> Browse ideas from your colleagues for inspiration, or just share the frustration you're experiencing. Even partial ideas help us understand where AI can make the biggest impact. The intake form will guide you through the process.
              </p>
            </details>

            <details className="bg-white border-2 border-gray-200 rounded-xl p-6 group hover:border-blue-300 transition-colors">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>"How long does the process take?"</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform" aria-hidden="true">▼</span>
              </summary>
              <p className="text-gray-600 mt-4 leading-relaxed">
                <strong>10-15 minutes to submit,</strong> then our team reviews within 48 hours. You'll receive an email when your idea is reviewed. High-priority or high-impact ideas may move to implementation planning within weeks.
              </p>
            </details>

            <details className="bg-white border-2 border-gray-200 rounded-xl p-6 group hover:border-blue-300 transition-colors">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>"What makes a good AI idea?"</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform" aria-hidden="true">▼</span>
              </summary>
              <p className="text-gray-600 mt-4 leading-relaxed">
                <strong>Focus on repetitive, time-consuming, or data-heavy tasks.</strong> Great AI ideas often involve: analyzing patterns, automating documentation, predicting outcomes, or personalizing care. If you find yourself thinking "there has to be a better way," that's a great starting point!
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-600 to-teal-600 border-0 shadow-2xl">
            <CardContent className="p-12 text-center">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Make an Impact?
              </h3>
              <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
                Your frontline perspective is invaluable. Let's build the future of healthcare together.
              </p>
              {isAuthenticated ? (
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-12 py-8 bg-white text-blue-700 hover:bg-gray-50 shadow-xl"
                  onClick={() => setLocation("/new")}
                >
                  Submit Your Idea Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-12 py-8 bg-white text-blue-700 hover:bg-gray-50 shadow-xl"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  Sign In to Get Started
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-8 border-t border-gray-200">
        <p className="text-center text-sm text-gray-600">
          © 2025 AdventHealth • Extending the Healing Ministry of Christ
        </p>
      </footer>
    </div>
  );
}
