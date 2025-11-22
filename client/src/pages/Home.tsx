import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Loader2,
  Sparkles,
  Heart,
  Shield,
  Users,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  FileText,
  TrendingUp,
  Clock,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, loading, isAuthenticated, logout } = useAuth();

  const { data: initiatives, isLoading: initiativesLoading } = trpc.initiative.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/70 border-b border-gray-200 sticky top-0 z-50">
        <div className="container flex justify-between items-center py-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              {APP_TITLE}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Button variant="outline" size="sm" onClick={() => setLocation("/admin")}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => window.location.href = getLoginUrl()}>
                Sign In to Submit Your Idea
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 backdrop-blur-md bg-white/60 border border-blue-200 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Extending the Healing Ministry of Christ with AI</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            You Have Ideas.<br />
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              We Want to Hear Them.
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
            At AdventHealth, we believe the best AI ideas come from the people closest to patients and operations—<strong>that's you</strong>. Whether you're a nurse, physician, scheduler, or support staff, your daily challenges hold the key to smarter, safer, more compassionate care.
          </p>

          <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl p-8 mb-8">
            <p className="text-lg text-gray-800 leading-relaxed">
              <strong className="text-blue-600">"We are not trying to replace people's thinking. We're just trying to enhance it."</strong>
              <br />
              <span className="text-gray-600">— Dr. Victor Herrera, Chief Clinical Officer</span>
            </p>
          </div>

          {isAuthenticated ? (
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              onClick={() => setLocation("/new")}
            >
              <Lightbulb className="h-5 w-5 mr-2" />
              Start New Initiative
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Sign In to Submit Your Idea
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          )}
        </div>
      </section>

      {/* Why Your Idea Matters */}
      <section className="container py-16">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Your Idea Matters
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl p-6">
              <Heart className="h-12 w-12 text-red-500 mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">You See What We Miss</h4>
              <p className="text-gray-700">
                You know the daily frustrations, inefficiencies, and opportunities. Your frontline perspective is invaluable for identifying where AI can truly help.
              </p>
            </div>

            <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl p-6">
              <Shield className="h-12 w-12 text-blue-600 mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Safety First, Always</h4>
              <p className="text-gray-700">
                Every idea goes through rigorous review for patient safety, privacy, and ethics. We go slow to go fast—ensuring AI enhances care responsibly.
              </p>
            </div>

            <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl p-6">
              <Users className="h-12 w-12 text-teal-600 mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Augmented, Not Replaced</h4>
              <p className="text-gray-700">
                AI is here to make your job easier, not to take it. We're focused on reducing burnout, automating tedious tasks, and giving you more time for what matters most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Addressing Concerns */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto backdrop-blur-md bg-gradient-to-r from-blue-500/10 to-teal-500/10 border border-blue-200 rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
            "But I'm Not Technical..." — You Don't Need to Be!
          </h3>
          
          <div className="space-y-4 text-lg text-gray-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <p><strong>No coding required.</strong> Just describe the problem you see and how AI might help—we'll handle the technical details.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <p><strong>Your job is safe.</strong> AI is a tool to support you, not replace you. Our mission is to reduce your workload, not your workforce.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <p><strong>Every idea is valued.</strong> Even if your idea isn't implemented, it helps us understand where AI can make the biggest impact.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <p><strong>We'll guide you.</strong> Our intake form walks you through everything step-by-step. You'll answer simple questions—no jargon, no complexity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Idea Sparks - Real Examples */}
      <section className="container py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Need Inspiration? Here Are Real Ideas from Your Colleagues
            </h3>
            <p className="text-xl text-gray-700">
              These are actual AI initiatives submitted by AdventHealth team members—just like you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Example 1 */}
            <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">AI-Powered Discharge Summary Generator</h4>
                  <p className="text-sm text-gray-600">From a Hospitalist Physician</p>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                <strong>The Problem:</strong> "I spend 45-60 minutes per patient creating discharge summaries, taking time away from patient care."
              </p>
              <p className="text-gray-700">
                <strong>The Idea:</strong> "Use AI to analyze the patient's EHR and generate a draft summary I can review in 5-10 minutes."
              </p>
            </div>

            {/* Example 2 */}
            <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <Clock className="h-6 w-6 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Predictive OR Scheduling</h4>
                  <p className="text-sm text-gray-600">From an OR Manager</p>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                <strong>The Problem:</strong> "We waste 15-20% of OR time due to inaccurate surgery duration estimates."
              </p>
              <p className="text-gray-700">
                <strong>The Idea:</strong> "Train AI on historical data to predict actual procedure duration and optimize scheduling."
              </p>
            </div>

            {/* Example 3 */}
            <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <Heart className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Sepsis Early Warning System</h4>
                  <p className="text-sm text-gray-600">From an ICU Nurse Manager</p>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                <strong>The Problem:</strong> "We often miss subtle early warning signs of sepsis until the patient deteriorates."
              </p>
              <p className="text-gray-700">
                <strong>The Idea:</strong> "Use AI to monitor vitals and labs continuously and alert us 6-12 hours earlier."
              </p>
            </div>

            {/* Example 4 */}
            <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <Users className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Virtual Nursing Assistant for Patient Education</h4>
                  <p className="text-sm text-gray-600">From a Nurse Educator</p>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                <strong>The Problem:</strong> "Patients forget 40-80% of what we teach them about post-discharge care."
              </p>
              <p className="text-gray-700">
                <strong>The Idea:</strong> "Create an AI virtual nurse patients can ask questions 24/7 in multiple languages."
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-lg text-gray-700 mb-4">
              <strong>See? Your idea doesn't have to be perfect.</strong> Just share what frustrates you or what could be better.
            </p>
            {isAuthenticated ? (
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/new")}
              >
                I Have an Idea Like This
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Sign In to Share Your Idea
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            How the Process Works
          </h3>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-xl p-6 flex-1">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Submit Your Idea</h4>
                <p className="text-gray-700">
                  Answer a few simple questions about the problem you see and how AI might help. Takes about 10-15 minutes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-xl p-6 flex-1">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">AI Analyzes Your Idea</h4>
                <p className="text-gray-700">
                  Our system automatically evaluates mission alignment, risk level, and governance requirements—giving you instant feedback.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                3
              </div>
              <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-xl p-6 flex-1">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Expert Review</h4>
                <p className="text-gray-700">
                  The Chief AI Officer's team reviews your submission, considering safety, feasibility, and strategic fit.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                4
              </div>
              <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-xl p-6 flex-1">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">You Hear Back</h4>
                <p className="text-gray-700">
                  We'll let you know the decision and next steps. If approved, you may be invited to help pilot the solution!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Initiatives (if logged in) */}
      {isAuthenticated && initiatives && initiatives.length > 0 && (
        <section className="container py-16">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Your Initiatives</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initiatives.map((initiative: any) => (
                <button
                  key={initiative.id}
                  onClick={() => setLocation(`/initiative/${initiative.id}`)}
                  className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl p-6 text-left hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      In Progress
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {initiative.title || "Untitled Initiative"}
                  </h4>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Step: {initiative.currentStep} of 6</p>
                    <p>Area: {initiative.area || "—"}</p>
                  </div>

                  {initiative.missionAlignmentRating && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Mission:</span>
                        <span className="font-semibold text-blue-700">{initiative.missionAlignmentRating}</span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto backdrop-blur-md bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Your Idea Could Change Everything
          </h3>
          <p className="text-xl mb-8 opacity-90">
            The best innovations come from people who see problems every day. That's you. Let's build the future of healthcare together.
          </p>
          {isAuthenticated ? (
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6"
              onClick={() => setLocation("/new")}
            >
              <Lightbulb className="h-5 w-5 mr-2" />
              Submit Your AI Initiative Idea
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Sign In to Get Started
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="backdrop-blur-md bg-white/70 border-t border-gray-200 py-8">
        <div className="container text-center text-gray-600">
          <p className="mb-2">
            <strong>Questions?</strong> Contact the Chief AI Officer's team for guidance.
          </p>
          <p className="text-sm">
            © 2025 AdventHealth. Extending the Healing Ministry of Christ.
          </p>
        </div>
      </footer>
    </div>
  );
}
