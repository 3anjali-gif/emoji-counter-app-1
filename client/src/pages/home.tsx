import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SimpleAuth } from "@/components/simple-auth";
import { EmojiAnalysis } from "@/components/emoji-analysis";
import { EmojiHistory } from "@/components/emoji-history";
import { EmojiPicker } from "@/components/emoji-picker";
import { Smile, BarChart3, History, Sparkles, TrendingUp } from "lucide-react";
import type { User, EmojiText, EmojiStats } from "@shared/schema";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'analyze' | 'history'>('analyze');
  const [textInput, setTextInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user ID from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    if (userId) {
      // Fetch user data
      fetch(`/api/user/${userId}`)
        .then(res => res.json())
        .then(userData => {
          setCurrentUser(userData);
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(console.error);
    }
  }, []);

  const { data: emojiTexts } = useQuery({
    queryKey: ['/api/user', currentUser?.id, 'emoji-texts'],
    enabled: !!currentUser?.id,
  });

  const { data: popularEmojis } = useQuery({
    queryKey: ['/api/popular-emojis'],
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: { userId: string; title: string; content: string }) => {
      return apiRequest('POST', '/api/analyze-emoji', data);
    },
    onSuccess: (result) => {
      setAnalysisResult(result);
      queryClient.invalidateQueries({ queryKey: ['/api/user', currentUser?.id, 'emoji-texts'] });
      toast({
        title: "Analysis Complete!",
        description: `Found ${result.stats.totalEmojis} emojis in your text`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze your text",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!currentUser) return;
    if (!textInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    analyzeMutation.mutate({
      userId: currentUser.id,
      title: titleInput.trim() || `Analysis ${new Date().toLocaleDateString()}`,
      content: textInput,
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    setTextInput(prev => prev + emoji);
  };

  if (!currentUser) {
    return <SimpleAuth onAuth={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Smile className="text-white text-sm" />
                </div>
                <span className="text-xl font-bold text-gray-900">EmojiCounter</span>
              </div>
              <span className="text-sm text-gray-500 hidden sm:inline">Analyze your emoji usage</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant={activeTab === 'analyze' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setActiveTab('analyze')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyze
              </Button>
              <Button 
                variant={activeTab === 'history' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setActiveTab('history')}
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{currentUser.username[0].toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{currentUser.username}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'analyze' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    <span>Enter Your Text</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Input
                    placeholder="Give your analysis a title (optional)"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="text-base"
                  />
                  <Textarea
                    placeholder="Type or paste your text here... Add some emojis! 😊🎉✨"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="min-h-[200px] text-base resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {textInput.length} characters • {textInput.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]/gu)?.length || 0} emojis detected
                    </div>
                    <Button 
                      onClick={handleAnalyze}
                      disabled={analyzeMutation.isPending || !textInput.trim()}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {analyzeMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Analyze Emojis
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              {analysisResult && (
                <EmojiAnalysis 
                  result={analysisResult}
                  onNewAnalysis={() => {
                    setTextInput('');
                    setTitleInput('');
                    setAnalysisResult(null);
                  }}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <EmojiPicker 
                popularEmojis={popularEmojis || []}
                onEmojiSelect={handleEmojiSelect}
              />
              
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                  <CardTitle className="text-lg">Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                      <Badge variant="outline" className="mt-0.5">💡</Badge>
                      <span>Paste text from social media, messages, or documents</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Badge variant="outline" className="mt-0.5">📊</Badge>
                      <span>Get detailed statistics about your emoji usage</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Badge variant="outline" className="mt-0.5">❤️</Badge>
                      <span>Discover your emotional sentiment patterns</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Badge variant="outline" className="mt-0.5">📈</Badge>
                      <span>Track your emoji history over time</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <EmojiHistory 
            emojiTexts={emojiTexts || []} 
            currentUser={currentUser}
            onAnalysisSelect={setAnalysisResult}
          />
        )}
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
