import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

const IDEA_PROMPTS = [
  {
    category: "Member Experience",
    icon: "🌴",
    prompts: [
      "What task do you repeat 10+ times per day that feels like it could be automated?",
      "When do you wish you had instant access to member preferences or history?",
      "What member service decision takes too long because you're waiting for information?",
      "What personalization opportunity are we missing at scale?",
    ]
  },
  {
    category: "Check-In & Reservations",
    icon: "🔑",
    prompts: [
      "What do you document that feels redundant or repetitive during check-in?",
      "When do you spend more time on paperwork than welcoming members?",
      "What information do you copy-paste between systems?",
      "What reservation conflicts take forever to resolve manually?",
    ]
  },
  {
    category: "Guest Services",
    icon: "❤️",
    prompts: [
      "When do members wait longer than necessary?",
      "What questions do members ask repeatedly that could be answered automatically?",
      "How could we better prepare members before their vacation?",
      "What communication gaps frustrate members and families?",
    ]
  },
  {
    category: "Operations",
    icon: "⚙️",
    prompts: [
      "What scheduling or staffing decision is always a headache?",
      "When do you run out of supplies or amenities unexpectedly?",
      "What process has too many manual handoffs?",
      "What reports do you wish updated automatically?",
    ]
  },
  {
    category: "Team Efficiency",
    icon: "🔥",
    prompts: [
      "What task makes your team groan when they have to do it?",
      "When do you feel like you're doing work a computer should handle?",
      "What interrupts your workflow most often?",
      "What would free up 30 minutes of your day?",
    ]
  },
];

const EXAMPLE_IDEAS = [
  {
    prompt: "What task do you repeat 10+ times per day?",
    idea: "AI-powered member preference profiler",
    description: "Automatically surface member preferences from past stays, saving 10 minutes per check-in and increasing personalization."
  },
  {
    prompt: "When do members wait longer than necessary?",
    idea: "Predictive housekeeping optimizer",
    description: "Predict room turnover times and optimize housekeeping schedules to reduce check-in delays by 30%."
  },
  {
    prompt: "What scheduling decision is always a headache?",
    idea: "Smart activity booking assistant",
    description: "Optimize resort activity schedules based on member preferences, weather, and capacity to maximize satisfaction."
  },
];

export default function IdeaStarters() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4">
      <div className="container max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl mb-4">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Need Help Getting Started?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Use these prompts to identify operational bottlenecks and AI opportunities in your daily workflow
            </p>
          </div>
        </div>

        {/* Why This Matters */}
        <Card className="mb-12 border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-gray-700" />
              Why These Questions Matter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              <strong>The best AI initiatives don't come from corporate strategy decks.</strong> They come from people on the ground who see the operational inefficiencies every single day.
            </p>
            <p>
              These prompts are designed to help you articulate what you already know: <strong>where time is wasted, where members are frustrated, and where your team is burning out on repetitive work.</strong>
            </p>
            <p className="text-lg font-semibold text-gray-900">
              You don't need to know how AI works. You just need to know what's broken.
            </p>
          </CardContent>
        </Card>

        {/* Category Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Choose a Category (or Browse All)
          </h2>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {IDEA_PROMPTS.map((category) => (
              <Card
                key={category.category}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedCategory === category.category
                    ? "border-2 border-gray-800 bg-gray-50"
                    : "border-2 border-gray-200 hover:border-gray-400"
                }`}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category.category ? null : category.category
                  )
                }
              >
                <CardHeader>
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Prompts */}
        <div className="space-y-8 mb-12">
          {IDEA_PROMPTS.filter(
            (cat) => !selectedCategory || cat.category === selectedCategory
          ).map((category) => (
            <div key={category.category}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{category.icon}</span>
                <h3 className="text-2xl font-bold text-gray-900">{category.category}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {category.prompts.map((prompt, idx) => (
                  <Card
                    key={idx}
                    className="border-l-4 border-l-gray-700 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="pt-6">
                      <p className="text-gray-700 font-medium">{prompt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Example Ideas */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            From Prompt to Initiative: Real Examples
          </h2>
          <p className="text-gray-600 mb-6">
            See how simple operational questions turn into actionable AI initiatives
          </p>
          <div className="space-y-4">
            {EXAMPLE_IDEAS.map((example, idx) => (
              <Card key={idx} className="border-2 border-gray-200">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                      Prompt
                    </Badge>
                    <p className="text-sm text-gray-600 italic flex-1">
                      "{example.prompt}"
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <ArrowRight className="h-5 w-5 text-gray-700 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">{example.idea}</h4>
                      <p className="text-gray-600">{example.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-gray-800 to-gray-700 text-white border-0">
          <CardContent className="pt-8 pb-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Turn Your Insight Into an Initiative?
            </h3>
            <p className="text-gray-100 mb-6 max-w-2xl mx-auto">
              Use these prompts to fill out the governance framework. You don't need all the answers—just a clear operational problem.
            </p>
            <Button
              size="lg"
              onClick={() => setLocation("/new-initiative")}
              className="bg-white text-gray-800 hover:bg-gray-100 shadow-xl"
            >
              Submit Your Initiative
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
