import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

const IDEA_PROMPTS = [
  {
    category: "Clinical Care",
    icon: "🏥",
    prompts: [
      "What task do you repeat 10+ times per day that feels like it could be automated?",
      "When do you wish you had instant access to patient history or guidelines?",
      "What clinical decision takes too long because you're waiting for information?",
      "What safety check could AI help you never forget?",
    ]
  },
  {
    category: "Documentation",
    icon: "📝",
    prompts: [
      "What do you document that feels redundant or repetitive?",
      "When do you spend more time writing notes than with patients?",
      "What information do you copy-paste between systems?",
      "What summaries take forever to create manually?",
    ]
  },
  {
    category: "Patient Experience",
    icon: "❤️",
    prompts: [
      "When do patients wait longer than necessary?",
      "What questions do patients ask repeatedly that could be answered automatically?",
      "How could we better prepare patients before their visit?",
      "What communication gaps frustrate patients and families?",
    ]
  },
  {
    category: "Operations",
    icon: "⚙️",
    prompts: [
      "What scheduling or staffing decision is always a headache?",
      "When do you run out of supplies or equipment unexpectedly?",
      "What process has too many manual handoffs?",
      "What reports do you wish updated automatically?",
    ]
  },
  {
    category: "Team Burnout",
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
    idea: "AI-powered discharge summary generator",
    description: "Automatically create discharge summaries from EHR data, saving 15 minutes per patient."
  },
  {
    prompt: "When do patients wait longer than necessary?",
    idea: "Predictive patient flow optimizer",
    description: "Predict ED wait times and suggest optimal bed assignments to reduce delays."
  },
  {
    prompt: "What scheduling decision is always a headache?",
    idea: "Smart OR scheduling assistant",
    description: "Optimize surgical schedules based on case complexity, surgeon preferences, and resource availability."
  },
];

export default function IdeaStarters() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
              Idea Starters
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Not sure what to submit? These prompts will help you discover AI opportunities hiding in your daily work.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <Card className="mb-8 border-2 border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              How This Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">1.</span>
                <span>Pick a category that matches your daily work</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">2.</span>
                <span>Read through the thought-starter questions</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">3.</span>
                <span>When something clicks, click "Start My Idea" to submit it</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Category Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {IDEA_PROMPTS.map((category) => (
            <Card
              key={category.category}
              className={`cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
                selectedCategory === category.category
                  ? 'border-2 border-blue-500 shadow-xl'
                  : 'border-2 border-gray-200'
              }`}
              onClick={() => setSelectedCategory(
                selectedCategory === category.category ? null : category.category
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-4xl">{category.icon}</span>
                  <span className="text-xl">{category.category}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCategory === category.category ? (
                  <div className="space-y-4">
                    <p className="font-semibold text-blue-900 mb-3">
                      Ask yourself these questions:
                    </p>
                    <ul className="space-y-3">
                      {category.prompts.map((prompt, idx) => (
                        <li key={idx} className="flex gap-2 text-gray-700">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{prompt}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation("/new");
                      }}
                    >
                      Start My Idea
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Click to see thought-starter questions for {category.category.toLowerCase()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Example Ideas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Real Examples from Your Colleagues
          </h2>
          <p className="text-gray-600 text-center mb-6">
            See how others turned simple frustrations into AI initiatives
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {EXAMPLE_IDEAS.map((example, idx) => (
              <Card key={idx} className="border-2 border-green-200 bg-green-50/30">
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-green-600">Example</Badge>
                  <CardTitle className="text-lg">{example.idea}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Started with:</strong> "{example.prompt}"
                  </p>
                  <p className="text-sm text-gray-700">
                    {example.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-blue-600 to-teal-600 text-white border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Share Your Idea?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              You don't need a perfect solution—just a problem you see every day. Our team will help you shape it into an AI initiative.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setLocation("/new")}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Start My Initiative
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
