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
  Heart,
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <img src={APP_LOGO} alt="AdventHealth" className="h-12" />
              <span className="text-xs text-gray-500 mt-1">
                Extending the Healing Ministry of Christ
              </span>
            </div>
            <div className="h-12 w-px bg-gray-300" />
            <span className="text-2xl font-semibold text-gray-900">
              AI Initiative Portal
            </span>
          </div>
          {!isAuthenticated ? (
            <AuthDialog />
          ) : (
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setLocation("/admin")}
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                {user?.role === 'admin' ? 'Dashboard' : 'My Submissions'}
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <span className="text-sm text-gray-600">
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
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-6 text-sm font-medium">
            <Heart className="h-4 w-4" />
            <span>A Safe Space for Your Ideas</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            You See Problems Every Day.
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              What If AI Could Help?
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            That frustrating task you repeat 20 times a day? The information you wish was
            at your fingertips? The process that takes forever? <strong>What if your idea could actually get built and deployed across AdventHealth?</strong> You don't need to be
            technical to share it.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {!isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => window.location.href = getLoginUrl()}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
              >
                Share Your Idea Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => setLocation("/new-initiative")}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
                >
                  Submit Your Idea for Consideration
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation("/idea-starters")}
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold"
                >
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Not Sure What to Share?
                </Button>
              </>
            )}
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>No technical knowledge needed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Takes 10-15 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Ideas reviewed weekly</span>
            </div>
          </div>

          {/* Social Proof */}
          {totalSubmissions > 0 && (
            <div className="mt-8 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-6 py-3 rounded-full">
              <Users className="h-5 w-5" />
              <span className="font-semibold">{totalSubmissions} colleagues</span>
              <span>have already shared their ideas</span>
            </div>
          )}
        </div>
      </section>

      {/* Let's Be Honest Section - Addresses Fear */}
      <section className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Let's Be Honest About AI
            </h2>
            <div className="text-lg md:text-xl leading-relaxed space-y-4">
              <p>
                We know what you might be thinking: <em>"Is this how they replace me?"</em>
              </p>
              <p className="font-semibold text-blue-100">
                Here's the truth: We're not trying to replace anyone. We're trying to give you your time back.
              </p>
              <p>
                AI won't replace nurses, doctors, or staff. But it can handle the repetitive stuff—the charting, the scheduling headaches, 
                the endless searching for information—so you can focus on what actually matters: <strong>caring for people</strong>.
              </p>
              <p className="text-xl font-bold mt-6">
                Your job isn't going away. The boring parts of it might.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Submitted Ideas */}
      {recentThree.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ideas Your Colleagues Are Already Sharing
            </h2>
            <p className="text-xl text-gray-600">
              Real problems from real people—just like you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {recentThree.map((idea) => (
              <Card key={idea.id} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
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
                      __html: idea.problemStatement || "Improving healthcare delivery through AI innovation." 
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
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              See All Ideas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/roadmap")}
              className="border-teal-600 text-teal-600 hover:bg-teal-50"
            >
              View Roadmap
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      )}

      {/* What Happens Next - Humanized */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              "Okay, But What Actually Happens?"
            </h2>
            <p className="text-xl text-gray-600">
              We get it—you want to know where your idea goes. Here's the honest process:
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">You Share</h3>
              <p className="text-gray-600">
                Answer a few simple questions about the problem you see. Takes 10-15 minutes, tops.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">We Analyze</h3>
              <p className="text-gray-600">
                Our AI team reviews it within 48 hours. We look at mission fit, risk, and feasibility.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Leadership Reviews</h3>
              <p className="text-gray-600">
                The Chief AI Officer and team evaluate it. High-priority ideas move fast.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-bold text-lg mb-2">You Hear Back</h3>
              <p className="text-gray-600">
                We email you with next steps—whether it's moving forward, needs more info, or future consideration. <strong>Approved ideas may receive resources and support for pilot implementation.</strong>
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-gray-700 font-semibold">
              Average response time: <span className="text-blue-600">3-5 business days</span>
            </p>
          </div>
        </div>
      </section>

      {/* Why This Matters - Mission Connection */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-2 border-blue-200">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Safe & Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Every idea is reviewed for patient safety, privacy, and ethics before moving forward. Your concerns matter.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-teal-200">
              <CardHeader>
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle>You're the Expert</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  AI supports you—reducing burnout and tedious tasks—so you can focus on what you do best: healing.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-red-200">
              <CardHeader>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle>Mission-Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Aligned with whole-person care and our healing ministry values. AI that serves people, not profits.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Leadership Endorsement */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto border-2 border-blue-200 shadow-xl">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                  AH
                </div>
                <div>
                  <p className="text-lg md:text-xl text-gray-700 italic mb-4 leading-relaxed">
                    "We're not trying to replace people's thinking. We're just trying to enhance it. 
                    Your frontline insights are invaluable—share them with us."
                  </p>
                  <p className="font-bold text-gray-900">Dr. Victor Herrera</p>
                  <p className="text-gray-600">Chief Clinical Officer, AdventHealth</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Real Ideas, Real Impact */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Real Ideas, Real Impact
          </h2>
          <p className="text-xl text-gray-600">
            See how colleagues' ideas are transforming healthcare delivery
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border-2 border-green-200 bg-green-50/30">
            <CardHeader>
              <Badge className="w-fit mb-2 bg-green-600">Implemented</Badge>
              <CardTitle className="text-xl">AI-Powered Discharge Summaries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Submitted by a hospitalist who was frustrated with spending 15+ minutes per discharge summary. 
                Now automated with AI review.
              </p>
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <TrendingUp className="h-5 w-5" />
                <span>200+ hours saved/month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-blue-50/30">
            <CardHeader>
              <Badge className="w-fit mb-2 bg-blue-600">In Development</Badge>
              <CardTitle className="text-xl">Predictive Sepsis Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                ICU nurse noticed patterns in vital signs before sepsis onset. AI now flags high-risk patients 6-8 hours earlier.
              </p>
              <div className="flex items-center gap-2 text-blue-700 font-semibold">
                <Shield className="h-5 w-5" />
                <span>Potential to save lives</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Common Questions - More Human */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Questions We Hear a Lot
            </h2>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">"I'm not technical. Can I still submit an idea?"</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    <strong>Absolutely.</strong> In fact, we prefer it. You don't need to know how AI works—you just need to know what frustrates you. 
                    We have technical people to figure out the "how." We need YOU to tell us the "what."
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">"Will AI take my job?"</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    <strong>No.</strong> AI can't hold a patient's hand, have a difficult conversation with a family, or make the kind of judgment calls you make every day. 
                    What it CAN do is handle the repetitive, time-consuming tasks that keep you from doing those things. Think of it as getting an assistant, not a replacement.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">"What if I don't have a fully formed idea?"</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    <strong>Even better.</strong> Most great ideas start as "I wish this was easier" or "Why do we still do it this way?" 
                    You don't need a solution—just a problem you see. We'll help you shape it from there.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">"How long does the process take?"</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    <strong>It depends on the idea.</strong> Simple, low-risk ideas might move in weeks. Complex ones (like anything touching clinical decisions) take longer because we're extra careful. 
                    But you'll hear back from us within 3-5 business days either way.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">"What makes a good idea?"</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    <strong>A problem you see repeatedly.</strong> If it frustrates you, it probably frustrates others too. 
                    The best ideas are things that happen 10+ times a day, waste time, or create unnecessary risk. Start there.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Sparkles className="h-16 w-16 mx-auto mb-6 text-yellow-300" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Your Idea Could Change Everything
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              The best innovations come from people doing the work every day. 
              That's you. Let's build the future of healthcare together.
            </p>
            {!isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => window.location.href = getLoginUrl()}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-xl"
              >
                Submit Your Idea Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => setLocation("/new-initiative")}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-xl"
              >
                Submit Your Idea Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600 max-w-3xl mx-auto">
            Ideas submitted are reviewed by AdventHealth's Chief AI Officer team. Selected initiatives may be developed for pilot testing and potential system-wide deployment.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2025 AdventHealth • Extending the Healing Ministry of Christ
          </p>
        </div>
      </footer>
    </div>
  );
}
