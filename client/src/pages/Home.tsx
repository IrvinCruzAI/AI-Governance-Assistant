import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, FileText } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: initiatives, isLoading: initiativesLoading } = trpc.initiative.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (loading || initiativesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-900">
              {APP_TITLE}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Turn your AI ideas into structured initiative briefs for the Chief AI Officer's team
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
              <p className="font-semibold mb-2">What this tool does:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Clarify your AI idea and approach</li>
                <li>Assess mission and ethics alignment</li>
                <li>Classify risk and suggest governance path</li>
                <li>Generate a structured brief and RAID view</li>
              </ul>
            </div>
            <Button 
              onClick={() => window.location.href = getLoginUrl()}
              className="w-full"
              size="lg"
            >
              Sign In to Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="container max-w-6xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">{APP_TITLE}</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-blue-300 bg-blue-50/50"
            onClick={() => setLocation("/new")}
          >
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg text-blue-900 mb-2">
                Start New Initiative
              </h3>
              <p className="text-sm text-gray-600">
                Begin evaluating a new AI idea
              </p>
            </CardContent>
          </Card>

          {initiatives?.map((initiative) => (
            <Card 
              key={initiative.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setLocation(`/initiative/${initiative.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-start gap-2">
                  <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{initiative.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Step:</span>
                    <span className="font-medium">{initiative.currentStep} of 6</span>
                  </div>
                  {initiative.area && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-medium">{initiative.area}</span>
                    </div>
                  )}
                  {initiative.completed && (
                    <div className="mt-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium text-center">
                      Completed
                    </div>
                  )}
                  {!initiative.completed && (
                    <div className="mt-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium text-center">
                      In Progress
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {initiatives && initiatives.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No initiatives yet
              </h3>
              <p className="text-gray-600 mb-4">
                Click "Start New Initiative" to begin evaluating your first AI idea
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
