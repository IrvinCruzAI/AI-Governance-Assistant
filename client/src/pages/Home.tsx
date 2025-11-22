import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { 
  Loader2, 
  Plus, 
  Sparkles, 
  Shield, 
  Users, 
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Brain,
  Heart,
  Target,
  BarChart3,
  FileText,
  Clock
} from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-teal-500 to-blue-700 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10">
          {/* Hero Section */}
          <div className="container max-w-7xl py-16 md:py-24">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-6">
                <Sparkles className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">AI Innovation at AdventHealth</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Transform Your
                <br />
                <span className="bg-gradient-to-r from-teal-200 to-blue-200 bg-clip-text text-transparent">
                  AI Ideas Into Reality
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                Submit your AI initiative through our guided intake process. Get instant analysis, 
                risk assessment, and governance recommendations—all in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-white/90 text-lg px-8 py-6 rounded-xl shadow-2xl"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-md text-lg px-8 py-6 rounded-xl"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
                <Brain className="h-8 w-8 text-teal-200 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">AI-Powered</div>
                <div className="text-white/80">Instant Analysis</div>
              </div>
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
                <Shield className="h-8 w-8 text-teal-200 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">3-Tier</div>
                <div className="text-white/80">Governance Framework</div>
              </div>
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
                <Users className="h-8 w-8 text-teal-200 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">Whole-Team</div>
                <div className="text-white/80">Collaboration</div>
              </div>
            </div>
          </div>

          {/* What is AI Governance Section */}
          <div className="bg-white/5 backdrop-blur-sm border-y border-white/10 py-16">
            <div className="container max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  What is AI Governance?
                </h2>
                <p className="text-xl text-white/80 max-w-3xl mx-auto">
                  A structured framework to ensure AI initiatives align with our mission, 
                  protect patient safety, and meet ethical standards.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8">
                  <Heart className="h-12 w-12 text-teal-200 mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-3">Mission Alignment</h3>
                  <p className="text-white/80 leading-relaxed">
                    Every AI idea is evaluated against AdventHealth's core mission: 
                    patient safety, health equity, whole-person care, and extending the healing ministry of Christ.
                  </p>
                </div>

                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8">
                  <Shield className="h-12 w-12 text-teal-200 mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-3">Risk Classification</h3>
                  <p className="text-white/80 leading-relaxed">
                    We assess clinical impact, data sensitivity, and automation level to determine 
                    the right governance path: Light, Standard, or Full Clinical review.
                  </p>
                </div>

                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8">
                  <Target className="h-12 w-12 text-teal-200 mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-3">RAID Analysis</h3>
                  <p className="text-white/80 leading-relaxed">
                    Automatically identify Risks, Assumptions, Issues, and Dependencies 
                    to help leadership make informed decisions about your initiative.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div id="how-it-works" className="container max-w-6xl py-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                How It Works
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Four simple steps to submit your AI initiative for review
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  1
                </div>
                <FileText className="h-10 w-10 text-teal-200 mb-4 mt-4" />
                <h3 className="text-xl font-bold text-white mb-2">Basic Info</h3>
                <p className="text-white/80 text-sm">
                  Provide your initiative title, role, and the area it impacts
                </p>
              </div>

              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  2
                </div>
                <Brain className="h-10 w-10 text-teal-200 mb-4 mt-4" />
                <h3 className="text-xl font-bold text-white mb-2">Problem & Solution</h3>
                <p className="text-white/80 text-sm">
                  Describe the problem and how AI can help address it
                </p>
              </div>

              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  3
                </div>
                <Heart className="h-10 w-10 text-teal-200 mb-4 mt-4" />
                <h3 className="text-xl font-bold text-white mb-2">Mission & Ethics</h3>
                <p className="text-white/80 text-sm">
                  Assess alignment with our mission and identify ethical concerns
                </p>
              </div>

              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  4
                </div>
                <BarChart3 className="h-10 w-10 text-teal-200 mb-4 mt-4" />
                <h3 className="text-xl font-bold text-white mb-2">Risk Assessment</h3>
                <p className="text-white/80 text-sm">
                  Answer questions about clinical impact, data, and automation
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="backdrop-blur-md bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-white/20 rounded-2xl p-8 inline-block">
                <CheckCircle2 className="h-12 w-12 text-teal-200 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Instant Results</h3>
                <p className="text-white/90 max-w-md">
                  Receive AI-powered mission alignment rating, risk classification, 
                  and a complete initiative brief ready for leadership review
                </p>
              </div>
            </div>
          </div>

          {/* Why Submit Section */}
          <div className="bg-white/5 backdrop-blur-sm border-y border-white/10 py-16">
            <div className="container max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Why Submit Your Idea?
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-teal-400/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-teal-200" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Drive Innovation</h3>
                    <p className="text-white/80">
                      Be part of AdventHealth's AI transformation and shape the future of healthcare
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-teal-400/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-teal-200" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Get Expert Guidance</h3>
                    <p className="text-white/80">
                      Receive structured feedback from the Chief AI Officer's team
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-teal-400/20 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-teal-200" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Ensure Safety & Ethics</h3>
                    <p className="text-white/80">
                      Your idea will be evaluated for patient safety and ethical considerations
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-teal-400/20 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-teal-200" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Fast Track Approval</h3>
                    <p className="text-white/80">
                      Structured submissions move through governance faster than informal requests
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="container max-w-4xl py-16 text-center">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-12">
              <Sparkles className="h-16 w-16 text-teal-200 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Sign in to submit your AI initiative and join the future of healthcare innovation at AdventHealth
              </p>
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-white/90 text-lg px-10 py-6 rounded-xl shadow-2xl"
                onClick={() => window.location.href = getLoginUrl()}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Sign In to Submit Your Idea
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated User View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100">
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
              {APP_TITLE}
            </h1>
            <p className="text-gray-600">Welcome back, {user?.name || user?.email}</p>
          </div>
          <div className="flex gap-3">
            {user?.role === 'admin' && (
              <Button
                variant="outline"
                onClick={() => setLocation("/admin")}
                className="backdrop-blur-md bg-white/50 border-blue-200"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Button>
            )}
            <Button variant="ghost" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* New Initiative Card */}
        <div
          onClick={() => setLocation("/new")}
          className="mb-8 cursor-pointer group"
        >
          <div className="backdrop-blur-md bg-gradient-to-r from-blue-500/10 to-teal-500/10 border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center transition-all hover:border-blue-400 hover:shadow-xl hover:scale-[1.02]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Start New Initiative</h3>
            <p className="text-gray-600">Begin evaluating a new AI idea</p>
          </div>
        </div>

        {/* Initiatives List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Initiatives</h2>
          
          {initiativesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : initiatives && initiatives.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {initiatives.map((initiative) => (
                <div
                  key={initiative.id}
                  onClick={() => setLocation(initiative.completed ? `/brief/${initiative.id}` : `/initiative/${initiative.id}`)}
                  className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] hover:border-blue-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                    {initiative.completed ? (
                      <Badge className="bg-green-500">Completed</Badge>
                    ) : (
                      <Badge variant="secondary">In Progress</Badge>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {initiative.title || "Untitled Initiative"}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Step:</span>
                      <span className="font-medium">{initiative.currentStep || 1} of 6</span>
                    </div>
                    {initiative.area && (
                      <div className="flex justify-between">
                        <span>Area:</span>
                        <span className="font-medium">{initiative.area}</span>
                      </div>
                    )}
                    {initiative.completed && initiative.riskLevel && (
                      <div className="flex justify-between">
                        <span>Risk:</span>
                        <Badge variant={
                          initiative.riskLevel === 'High' ? 'destructive' :
                          initiative.riskLevel === 'Medium' ? 'default' :
                          'secondary'
                        } className="text-xs">
                          {initiative.riskLevel}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="backdrop-blur-md bg-white/50 border border-gray-200 rounded-2xl p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No initiatives yet</p>
              <p className="text-sm text-gray-500">
                Click "Start New Initiative" to begin evaluating your first AI idea
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
