import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewInitiative() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [userRole, setUserRole] = useState("");
  const [area, setArea] = useState("");

  const createMutation = trpc.initiative.create.useMutation({
    onSuccess: (data) => {
      setLocation(`/initiative/${data.initiativeId}`);
    },
  });

  const handleStart = () => {
    createMutation.mutate({
      userRole: userRole || "",
      area: area || "",
    });
  };

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <CardTitle className="text-2xl text-blue-900">
            Share Your AI Idea
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Before we begin, tell us a bit about yourself and the area you're working in.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="role">Your Role</Label>
            <Input
              id="role"
              placeholder="e.g., Clinical Director, IT Manager, Operations Lead"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              What is your current role at AdventHealth?
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Primary Area</Label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger id="area">
                <SelectValue placeholder="Select an area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clinical-care">Clinical Care</SelectItem>
                <SelectItem value="clinical-support">Clinical Support</SelectItem>
                <SelectItem value="clinical-operations">Clinical Operations</SelectItem>
                <SelectItem value="back-office">Back Office</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Which area does this AI initiative primarily relate to?
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-semibold mb-2">
              What to expect:
            </p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
              <li>6-step guided conversation (10-15 minutes)</li>
              <li>Questions about your AI idea, mission alignment, and risks</li>
              <li>Automated generation of a structured brief and RAID view</li>
              <li>Ready-to-share summary for the Chief AI Officer's team</li>
            </ul>
          </div>

          <Button
            onClick={handleStart}
            disabled={createMutation.isPending}
            className="w-full"
            size="lg"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
