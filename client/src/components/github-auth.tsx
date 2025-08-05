import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiGithub } from "react-icons/si";
import { Rocket } from "lucide-react";

interface GitHubAuthProps {
  onAuth: (userId: string) => void;
}

export function GitHubAuth({ onAuth }: GitHubAuthProps) {
  const handleGitHubAuth = () => {
    window.location.href = '/api/auth/github';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <Rocket className="text-white text-lg" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Workik AI</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-700">Test Case Generator</h1>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Workik AI</CardTitle>
            <CardDescription>
              Connect your GitHub account to start generating AI-powered test cases for your repositories.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">What you can do:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Browse and select files from your GitHub repositories</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Generate comprehensive test cases using AI</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Support for multiple testing frameworks (Jest, PyTest, JUnit, Selenium)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Create pull requests with generated test code</span>
                </li>
              </ul>
            </div>

            <Button 
              onClick={handleGitHubAuth}
              className="w-full bg-github hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <SiGithub className="h-5 w-5" />
              <span>Connect with GitHub</span>
            </Button>

            <p className="text-xs text-gray-500 text-center">
              We only request access to your public and private repositories to analyze code and generate test cases. 
              We never store your code permanently.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
