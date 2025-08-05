import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Clock, Shield, TestTubeDiagonal } from "lucide-react";
import type { TestCaseGeneration, TestCaseSummary } from "@shared/schema";

interface TestCaseSummaryProps {
  generation: TestCaseGeneration;
  onGenerateCode: (summaryIndex: string) => void;
}

export function TestCaseSummary({ generation, onGenerateCode }: TestCaseSummaryProps) {
  const summaries = (generation.summaries as TestCaseSummary[]) || [];

  if (generation.status === 'generating') {
    return (
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <span>Generating Test Cases...</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            AI is analyzing your code and creating comprehensive test cases...
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (generation.status === 'failed') {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Test case generation failed
          </h3>
          <p className="text-gray-600">
            There was an error generating test cases. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!summaries.length) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No test cases generated
          </h3>
          <p className="text-gray-600">
            Try selecting different files or checking your code files.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Generated Test Cases
            </CardTitle>
            <p className="text-sm text-gray-600">
              AI analysis complete • {summaries.length} test cases suggested
            </p>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          {summaries.map((summary, index) => (
            <TestCaseCard
              key={index}
              summary={summary}
              index={index}
              onGenerateCode={onGenerateCode}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface TestCaseCardProps {
  summary: TestCaseSummary;
  index: number;
  onGenerateCode: (summaryIndex: string) => void;
}

function TestCaseCard({ summary, index, onGenerateCode }: TestCaseCardProps) {
  const getTestTypeBadge = (type: string) => {
    const variants = {
      unit: "bg-blue-100 text-blue-800",
      integration: "bg-green-100 text-green-800", 
      e2e: "bg-purple-100 text-purple-800"
    };
    
    return (
      <Badge className={variants[type as keyof typeof variants] || variants.unit}>
        {type === 'e2e' ? 'E2E Tests' : `${type.charAt(0).toUpperCase() + type.slice(1)} Tests`}
      </Badge>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-medium text-gray-900">{summary.title}</h4>
            {getTestTypeBadge(summary.testType)}
            <span className="text-xs text-gray-500">{summary.filename}</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            {summary.description}
          </p>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <TestTubeDiagonal className="h-3 w-3" />
              <span>{summary.estimatedTests} test methods</span>
            </span>
            <span className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>{summary.estimatedCoverage}% coverage</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{summary.estimatedRuntime} to run</span>
            </span>
          </div>
        </div>
        
        <Button 
          onClick={() => onGenerateCode(index.toString())}
          className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Generate Code
        </Button>
      </div>
    </div>
  );
}
