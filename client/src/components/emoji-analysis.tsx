import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Heart, Lightbulb, RefreshCw, TrendingUp, Award, Target } from "lucide-react";
import type { EmojiStats } from "@shared/schema";

interface EmojiAnalysisProps {
  result: {
    emojiText: any;
    stats: EmojiStats;
    sentiment: {
      sentiment: 'positive' | 'negative' | 'neutral';
      score: number;
      confidence: number;
    };
    insights: string[];
  };
  onNewAnalysis: () => void;
}

export function EmojiAnalysis({ result, onNewAnalysis }: EmojiAnalysisProps) {
  const { stats, sentiment, insights } = result;

  const getSentimentColor = (sentimentType: string) => {
    switch (sentimentType) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getSentimentIcon = (sentimentType: string) => {
    switch (sentimentType) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <span>Analysis Results</span>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onNewAnalysis}>
              <RefreshCw className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalEmojis}</div>
              <div className="text-sm text-gray-600">Total Emojis</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.uniqueEmojis}</div>
              <div className="text-sm text-gray-600">Unique Emojis</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {stats.mostUsed ? `${stats.mostUsed.percentage}%` : '0%'}
              </div>
              <div className="text-sm text-gray-600">Most Used</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((stats.uniqueEmojis / Math.max(stats.totalEmojis, 1)) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Variety Score</div>
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className={`p-4 rounded-lg border ${getSentimentColor(sentiment.sentiment)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span className="font-medium">Sentiment Analysis</span>
              </div>
              <span className="text-2xl">{getSentimentIcon(sentiment.sentiment)}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="capitalize">
                {sentiment.sentiment}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Confidence</span>
                  <span>{Math.round(sentiment.confidence * 100)}%</span>
                </div>
                <Progress value={sentiment.confidence * 100} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Emojis */}
      {stats.emojiCounts.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span>Top Emojis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {stats.emojiCounts.slice(0, 10).map((emojiCount, index) => (
                <div key={emojiCount.emoji} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                      <span className="text-lg">{emojiCount.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-700">
                          #{index + 1}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {emojiCount.count} uses
                          </span>
                          <Badge variant="secondary">
                            {emojiCount.percentage}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={emojiCount.percentage} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-indigo-500" />
              <span>Insights & Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-indigo-600">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4">
        <Button 
          variant="outline" 
          onClick={onNewAnalysis}
          className="flex items-center space-x-2"
        >
          <Target className="h-4 w-4" />
          <span>Analyze New Text</span>
        </Button>
        <Button 
          variant="default"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          View History
        </Button>
      </div>
    </div>
  );
}