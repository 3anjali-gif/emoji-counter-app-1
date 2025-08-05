import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { GitHubAuth } from "@/components/github-auth";
import { FileTree } from "@/components/file-tree";
import { TestCaseSummary } from "@/components/test-case-summary";
import { GeneratedCode } from "@/components/generated-code";
import { Rocket, Bell, ChevronDown, Download } from "lucide-react";
import { SiGithub } from "react-icons/si";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [selectedRepository, setSelectedRepository] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [testFramework, setTestFramework] = useState<string>("jest");
  const [currentGeneration, setCurrentGeneration] = useState<string | null>(null);
  const [selectedTestCase, setSelectedTestCase] = useState<string | null>(null);

  // Get user ID from URL params (temporary auth solution)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    if (userId) {
      setCurrentUser(userId);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const { data: user } = useQuery({
    queryKey: ['/api/user', currentUser],
    enabled: !!currentUser,
  });

  const { data: repositories } = useQuery({
    queryKey: ['/api/user', currentUser, 'repositories'],
    enabled: !!currentUser,
  });

  const { data: generation } = useQuery({
    queryKey: ['/api/test-case-generation', currentGeneration],
    enabled: !!currentGeneration,
    refetchInterval: (data) => {
      return data?.status === 'generating' ? 2000 : false;
    },
  });

  const { data: generatedTestCases } = useQuery({
    queryKey: ['/api/test-case-generation', currentGeneration, 'generated-tests'],
    enabled: !!currentGeneration,
  });

  if (!currentUser || !user) {
    return <GitHubAuth onAuth={setCurrentUser} />;
  }

  const selectedRepo = repositories?.find((repo: any) => repo.id === selectedRepository);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Rocket className="text-white text-sm" />
                </div>
                <span className="text-xl font-bold text-gray-900">Workik AI</span>
              </div>
              <span className="text-sm text-gray-500 hidden sm:inline">Test Case Generator</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                <img 
                  src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40"} 
                  alt="User avatar" 
                  className="w-6 h-6 rounded-full" 
                />
                <span className="text-sm font-medium text-gray-700">{user.username}</span>
                <ChevronDown className="text-xs text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen bg-gray-50 pt-16">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Repository Selection */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Repository</h2>
              <SiGithub className="text-xl text-primary" />
            </div>
            
            {selectedRepo ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <SiGithub className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">{selectedRepo.fullName}</span>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Connected • {selectedRepo.private ? 'Private' : 'Public'}
                </div>
              </div>
            ) : (
              <Select value={selectedRepository || ""} onValueChange={setSelectedRepository}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a repository" />
                </SelectTrigger>
                <SelectContent>
                  {repositories?.map((repo: any) => (
                    <SelectItem key={repo.id} value={repo.id}>
                      {repo.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* File Tree */}
          {selectedRepository && (
            <FileTree
              repositoryId={selectedRepository}
              selectedFiles={selectedFiles}
              onSelectionChange={setSelectedFiles}
            />
          )}

          {/* Generate Button */}
          {selectedFiles.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <GenerateTestCasesButton
                repositoryId={selectedRepository!}
                selectedFiles={selectedFiles}
                framework={testFramework}
                userId={currentUser}
                onGenerated={setCurrentGeneration}
              />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Test Case Generation</h1>
                <p className="text-sm text-gray-600 mt-1">AI-powered test cases for your selected files</p>
              </div>
              <div className="flex items-center space-x-3">
                <Select value={testFramework} onValueChange={setTestFramework}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jest">Jest (JavaScript)</SelectItem>
                    <SelectItem value="pytest">PyTest (Python)</SelectItem>
                    <SelectItem value="junit">JUnit (Java)</SelectItem>
                    <SelectItem value="selenium">Selenium (E2E)</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export All</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {generation && (
              <>
                <TestCaseSummary
                  generation={generation}
                  onGenerateCode={setSelectedTestCase}
                />
                
                {selectedTestCase && (
                  <GeneratedCode
                    testCaseId={selectedTestCase}
                    repositoryId={selectedRepository!}
                  />
                )}
              </>
            )}
            
            {!generation && selectedFiles.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <SiGithub className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select files to generate test cases
                  </h3>
                  <p className="text-gray-600">
                    Choose a repository and select the files you want to generate test cases for.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GenerateTestCasesButton({ 
  repositoryId, 
  selectedFiles, 
  framework, 
  userId, 
  onGenerated 
}: {
  repositoryId: string;
  selectedFiles: string[];
  framework: string;
  userId: string;
  onGenerated: (generationId: string) => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-test-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          repositoryId,
          selectedFiles,
          framework,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate test cases');
      }

      const generation = await response.json();
      onGenerated(generation.id);
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerate}
      disabled={isGenerating}
      className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
    >
      <span className="fas fa-magic" />
      <span>{isGenerating ? 'Generating...' : 'Generate Test Cases'}</span>
    </Button>
  );
}
