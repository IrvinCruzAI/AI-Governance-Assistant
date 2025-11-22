import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_TITLE, getLoginUrl } from "@/const";
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
} from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading" />
      </div>
    );
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

      {/* Hero Section - Bold & Centered */}
      <section className="container py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-8">
            <Sparkles className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <span className="text-sm font-medium text-blue-900">Extending the Healing Ministry of Christ</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Share Your AI Idea
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            You see the problems. You know the solutions. Help us build smarter, safer, more compassionate care at AdventHealth.
          </p>

          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                onClick={() => setLocation("/new")}
                aria-label="Submit your AI initiative idea"
              >
                <Lightbulb className="h-5 w-5 mr-2" aria-hidden="true" />
                Submit Your Idea
                <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-7 w-full sm:w-auto"
                onClick={() => setLocation("/browse")}
                aria-label="Browse ideas from colleagues"
              >
                <Eye className="h-5 w-5 mr-2" aria-hidden="true" />
                Browse Ideas
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                onClick={() => window.location.href = getLoginUrl()}
                aria-label="Sign in to submit your idea"
              >
                Sign In to Submit
                <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-7 w-full sm:w-auto"
                onClick={() => setLocation("/browse")}
                aria-label="Browse ideas from colleagues without signing in"
              >
                <Eye className="h-5 w-5 mr-2" aria-hidden="true" />
                Browse Ideas
              </Button>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-6">
            No technical experience needed • 10-15 minutes • Your idea matters
          </p>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="container py-16 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                <Shield className="h-8 w-8 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Safe & Secure</h3>
              <p className="text-gray-600">
                Every idea reviewed for patient safety, privacy, and ethics
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 mb-4">
                <Users className="h-8 w-8 text-teal-600" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Augmented, Not Replaced</h3>
              <p className="text-gray-600">
                AI supports you—reducing burnout, not your workforce
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
                <Heart className="h-8 w-8 text-red-500" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mission-Driven</h3>
              <p className="text-gray-600">
                Aligned with whole-person care and our healing ministry
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto">
          <blockquote className="bg-gray-50 border-l-4 border-blue-600 rounded-r-xl p-8">
            <p className="text-xl md:text-2xl text-gray-800 font-medium mb-4">
              "We are not trying to replace people's thinking. We're just trying to enhance it."
            </p>
            <footer className="text-gray-600">
              <cite className="not-italic">— Dr. Victor Herrera, Chief Clinical Officer</cite>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* How It Works - Simplified */}
      <section className="container py-16 bg-gray-50 -mx-4 px-4 md:mx-0 md:px-0 md:rounded-2xl">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Simple Process
          </h3>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Submit</h4>
              <p className="text-sm text-gray-600">Answer a few simple questions</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI Analyzes</h4>
              <p className="text-sm text-gray-600">Instant mission & risk assessment</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Expert Review</h4>
              <p className="text-sm text-gray-600">Chief AI Officer's team evaluates</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Get Feedback</h4>
              <p className="text-sm text-gray-600">Hear back on next steps</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Addressing Concerns */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Common Questions
          </h3>

          <div className="space-y-6">
            <details className="bg-white border border-gray-200 rounded-lg p-6 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>"I'm not technical. Can I still submit an idea?"</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform" aria-hidden="true">▼</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Absolutely! You don't need any technical knowledge. Just describe the problem you see and how AI might help. We'll handle the technical details.
              </p>
            </details>

            <details className="bg-white border border-gray-200 rounded-lg p-6 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>"Will AI take my job?"</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform" aria-hidden="true">▼</span>
              </summary>
              <p className="text-gray-600 mt-4">
                No. AI is here to make your job easier, not replace you. Our focus is reducing burnout, automating tedious tasks, and giving you more time for meaningful patient care.
              </p>
            </details>

            <details className="bg-white border border-gray-200 rounded-lg p-6 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>"What if I don't have a fully formed idea?"</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform" aria-hidden="true">▼</span>
              </summary>
              <p className="text-gray-600 mt-4">
                That's perfectly fine! Browse ideas from your colleagues for inspiration, or just share the frustration you're experiencing. Even partial ideas help us understand where AI can make the biggest impact.
              </p>
            </details>

            <details className="bg-white border border-gray-200 rounded-lg p-6 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>"How long does the process take?"</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform" aria-hidden="true">▼</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Submitting your idea takes about 10-15 minutes. The review process typically takes 1-2 weeks, and we'll notify you of the decision and next steps.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Make an Impact?
          </h3>
          <p className="text-xl mb-8 opacity-95">
            Your frontline perspective is invaluable. Let's build the future of healthcare together.
          </p>
          {isAuthenticated ? (
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-10 py-7"
              onClick={() => setLocation("/new")}
              aria-label="Submit your AI initiative idea"
            >
              <Lightbulb className="h-5 w-5 mr-2" aria-hidden="true" />
              Submit Your Idea Now
              <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-10 py-7"
              onClick={() => window.location.href = getLoginUrl()}
              aria-label="Sign in to submit your idea"
            >
              Sign In to Get Started
              <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="container text-center text-gray-600">
          <p className="text-sm">
            © 2025 AdventHealth • Extending the Healing Ministry of Christ
          </p>
        </div>
      </footer>
    </div>
  );
}
