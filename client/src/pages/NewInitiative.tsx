import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Loader2, Mail, Building2, AlertCircle } from "lucide-react";
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
  const { isAuthenticated, user } = useAuth();
  const [userEmail, setUserEmail] = useState(user?.email || "");
  const [userRole, setUserRole] = useState("");
  const [area, setArea] = useState("");
  const [department, setDepartment] = useState("");
  const [urgency, setUrgency] = useState("");

  const createMutation = trpc.initiative.create.useMutation({
    onSuccess: (data) => {
      setLocation(`/initiative/${data.initiativeId}`);
    },
  });

  const handleStart = () => {
    if (!userEmail) {
      alert("Please provide your email address so we can contact you about your idea.");
      return;
    }
    
    createMutation.mutate({
      userRole: userRole || "",
      area: area || "",
      userEmail: userEmail,
      department: department || "",
      urgency: urgency || "",
    });
  };

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-xl">
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
          <CardTitle className="text-3xl text-gray-900">
            Share Your AI Idea
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Before we begin, tell us a bit about yourself so we can follow up on your idea.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email - Required */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Your Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.name@adventhealth.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
            <p className="text-sm text-gray-500">
              We'll use this to send you updates on your idea's status
            </p>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Your Role</Label>
            <Input
              id="role"
              placeholder="e.g., Clinical Director, Nurse Practitioner, IT Manager"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              What is your current role at AdventHealth?
            </p>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Department/Facility
            </Label>
            <Input
              id="department"
              placeholder="e.g., Emergency Department - Orlando Campus"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Which department or facility do you work in?
            </p>
          </div>

          {/* Primary Area */}
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

          {/* Urgency */}
          <div className="space-y-2">
            <Label htmlFor="urgency" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              How urgent is this problem?
            </Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger id="urgency">
                <SelectValue placeholder="Select urgency level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical - Immediate safety or compliance issue</SelectItem>
                <SelectItem value="high">High - Significantly impacts daily operations</SelectItem>
                <SelectItem value="medium">Medium - Important but not blocking work</SelectItem>
                <SelectItem value="low">Low - Nice to have, long-term improvement</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              This helps us prioritize which ideas to review first
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-semibold mb-2">
              What to expect:
            </p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
              <li>4-step guided form (10-15 minutes)</li>
              <li>Questions about your AI idea, mission alignment, and risks</li>
              <li>Automated generation of a structured brief and RAID view</li>
              <li>Expert review within 48 hours</li>
              <li>Email notification when your idea is reviewed</li>
            </ul>
          </div>

          <Button
            onClick={handleStart}
            disabled={createMutation.isPending || !userEmail}
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
