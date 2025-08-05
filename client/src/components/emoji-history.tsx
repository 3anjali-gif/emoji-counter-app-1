import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { History, Trash2, Eye, Calendar, BarChart3, Sparkles } from "lucide-react";
import type { EmojiText, User } from "@shared/schema";

interface EmojiHistoryProps {
  emojiTexts: EmojiText[];
  currentUser: User;
  onAnalysisSelect: (analysis: any) => void;
}

export function EmojiHistory({ emojiTexts, currentUser, onAnalysisSelect }: EmojiHistoryProps) {
  const [viewingId, setViewingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/emoji-text/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', currentUser.id, 'emoji-texts'] });
      toast({
        title: "Deleted",
        description: "Analysis deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete analysis",
        variant: "destructive",
      });
    },
  });

  const viewMutation = useMutation({
    mutationFn: async (id: string) => {
      const emojiText = await apiRequest('GET', `/api/emoji-text/${id}`) as unknown as EmojiText;
      
      // Generate fresh analysis for viewing
      const stats = {
        totalEmojis: emojiText.totalEmojis,
        uniqueEmojis: Object.keys(emojiText.emojiCounts as Record<string, number>).length,
        mostUsed: Object.entries(emojiText.emojiCounts as Record<string, number>)
          .map(([emoji, count]: [string, number]) => ({
            emoji,
            count,
            percentage: Math.round((count / emojiText.totalEmojis) * 100)
          }))
          .sort((a, b) => b.count - a.count)[0] || null,
        emojiCounts: Object.entries(emojiText.emojiCounts as Record<string, number>)
          .map(([emoji, count]: [string, number]) => ({
            emoji,
            count,
            percentage: Math.round((count / emojiText.totalEmojis) * 100)
          }))
          .sort((a, b) => b.count - a.count)
      };

      // Simple sentiment analysis for viewing
      const sentiment = {
        sentiment: 'neutral' as const,
        score: 0,
        confidence: 0.5
      };

      const insights = [`This analysis contains ${stats.totalEmojis} emojis with ${stats.uniqueEmojis} unique varieties.`];

      return {
        emojiText,
        stats,
        sentiment,
        insights
      };
    },
    onSuccess: (result) => {
      onAnalysisSelect(result);
      setViewingId(result.emojiText.id);
    },
    onError: (error: any) => {
      toast({
        title: "View Failed",
        description: error.message || "Failed to load analysis",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this analysis?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTopEmojis = (emojiCounts: Record<string, number> | any) => {
    if (!emojiCounts || typeof emojiCounts !== 'object') return [];
    return Object.entries(emojiCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([emoji]) => emoji);
  };

  if (!emojiTexts || emojiTexts.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No analyses yet
          </h3>
          <p className="text-gray-600">
            Start by analyzing your first text to see your emoji patterns and history.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5 text-purple-500" />
            <span>Your Analysis History</span>
            <Badge variant="secondary">{emojiTexts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="max-h-96">
            <div className="space-y-4">
              {emojiTexts.map((emojiText) => (
                <div 
                  key={emojiText.id} 
                  className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                    viewingId === emojiText.id 
                      ? 'border-blue-200 bg-blue-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {emojiText.title}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(emojiText.createdAt?.toString() || '')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="h-3 w-3" />
                          <span>{emojiText.totalEmojis} emojis</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewMutation.mutate(emojiText.id)}
                        disabled={viewMutation.isPending}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(emojiText.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Preview of content */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {emojiText.content.length > 100 
                        ? `${emojiText.content.substring(0, 100)}...` 
                        : emojiText.content
                      }
                    </p>
                  </div>

                  {/* Top emojis preview */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Top emojis:</span>
                    <div className="flex space-x-1">
                      {getTopEmojis(emojiText.emojiCounts).map((emoji, index) => (
                        <span key={index} className="text-lg">{emoji}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {emojiTexts.reduce((sum, text) => sum + text.totalEmojis, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Emojis Analyzed</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {emojiTexts.length}
            </div>
            <div className="text-sm text-gray-600">Analyses Created</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {Math.round(emojiTexts.reduce((sum, text) => sum + text.totalEmojis, 0) / Math.max(emojiTexts.length, 1))}
            </div>
            <div className="text-sm text-gray-600">Avg Emojis per Text</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}