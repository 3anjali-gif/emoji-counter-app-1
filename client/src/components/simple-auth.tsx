import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Smile, Sparkles, BarChart3, TrendingUp } from "lucide-react";
import type { User } from "@shared/schema";

interface SimpleAuthProps {
  onAuth: (user: User) => void;
}

export function SimpleAuth({ onAuth }: SimpleAuthProps) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const { user } = await response.json();
      onAuth(user);
      
      toast({
        title: "Welcome!",
        description: `Signed in as ${user.username}`,
      });
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAuth();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Smile className="text-white text-xl" />
            </div>
            <span className="text-3xl font-bold text-gray-900">EmojiCounter</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-700">Analyze Your Emoji Usage</h1>
          <p className="text-gray-500 mt-2">Discover patterns in your emoji expressions</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-2xl text-gray-900">Get Started</CardTitle>
            <CardDescription className="text-gray-600">
              Enter your name to start analyzing emoji patterns in your text
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {/* Features Preview */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-700">Detailed Stats</div>
                <div className="text-xs text-gray-500">Count & analyze</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-700">Sentiment</div>
                <div className="text-xs text-gray-500">Emotion insights</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Sparkles className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-700">Categories</div>
                <div className="text-xs text-gray-500">Usage patterns</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Smile className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-700">History</div>
                <div className="text-xs text-gray-500">Track over time</div>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-lg py-3 text-center"
                disabled={isLoading}
              />

              <Button 
                onClick={handleAuth}
                disabled={isLoading || !username.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Getting Started...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Start Analyzing
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                No registration required • Your data stays private • Free to use
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sample Text Preview */}
        <div className="mt-8 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Try with sample text:</h3>
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
            "Had such an amazing day today! 😊🌟 Started with a great breakfast 🥐☕ 
            then met friends for lunch 🍕👥 Feeling so grateful and happy! 💕✨ 
            Can't wait for tomorrow's adventures! 🚀🎉"
          </div>
          <div className="mt-2 text-xs text-gray-500">
            This text contains 11 emojis across 6 different categories
          </div>
        </div>
      </div>
    </div>
  );
}