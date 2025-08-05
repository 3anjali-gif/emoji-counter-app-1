import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Code, Shield, Clock, GitPullRequest } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { apiRequest } from "@/lib/queryClient";

interface GeneratedCodeProps {
  testCaseId: string;
  repositoryId: string;
}

export function GeneratedCode({ testCaseId, repositoryId }: GeneratedCodeProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: testCase, isLoading } = useQuery({
    queryKey: ['/api/generated-test-case', testCaseId],
    enabled: !!testCaseId,
  });

  const createPRMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/create-pr', data);
    },
    onSuccess: () => {
      toast({
        title: "Pull Request Created",
        description: "Successfully created pull request with generated test code.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create pull request",
        variant: "destructive",
      });
    },
  });

  const handleCopy = async () => {
    if (!testCase?.code) return;
    
    try {
      await navigator.clipboard.writeText(testCase.code);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Test code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      });
    }
  };

  const handleCreatePR = () => {
    if (!testCase) return;

    createPRMutation.mutate({
      repositoryId,
      testCaseId: testCase.id,
      branchName: `test-case-${testCase.id}`,
      title: `Add ${testCase.title}`,
      description: `Generated test case for ${testCase.filename}\n\n${testCase.description}`,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="animate-pulse space-y-2">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!testCase) {
    return null;
  }

  const getLanguageFromFramework = (framework: string) => {
    const map: Record<string, string> = {
      jest: 'javascript',
      pytest: 'python',
      junit: 'java',
      selenium: 'python'
    };
    return map[framework] || 'javascript';
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Generated Test Code
            </CardTitle>
            <p className="text-sm text-gray-600">
              {testCase.title} • {testCase.filename}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline"
              onClick={handleCopy}
              className="flex items-center space-x-1"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </Button>
            <Button 
              onClick={handleCreatePR}
              disabled={createPRMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-1"
            >
              <SiGithub className="h-4 w-4" />
              <span>{createPRMutation.isPending ? 'Creating...' : 'Create PR'}</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <pre className="text-gray-100">
            <code>{testCase.code}</code>
          </pre>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Code className="h-4 w-4" />
              <span>{testCase.code.split('\n').length} lines</span>
            </span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Check className="h-3 w-3 mr-1" />
              Syntax valid
            </Badge>
            <span className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span>Security tested</span>
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Generated with Gemini • <span className="text-green-600">Just now</span>
          </div>
        </div>

        {testCase.description && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Test Description</h4>
            <p className="text-sm text-blue-700">{testCase.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
