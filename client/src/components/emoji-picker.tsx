import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Smile, Heart, ThumbsUp, Cat, Apple } from "lucide-react";

interface EmojiPickerProps {
  popularEmojis: string[];
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({ popularEmojis, onEmojiSelect }: EmojiPickerProps) {
  const categories = {
    popular: {
      title: "Popular",
      icon: <ThumbsUp className="h-4 w-4" />,
      emojis: popularEmojis.slice(0, 30)
    },
    smileys: {
      title: "Smileys", 
      icon: <Smile className="h-4 w-4" />,
      emojis: [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
        '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
        '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩'
      ]
    },
    hearts: {
      title: "Hearts",
      icon: <Heart className="h-4 w-4" />,
      emojis: [
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
        '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌'
      ]
    },
    animals: {
      title: "Animals",
      icon: <Cat className="h-4 w-4" />,
      emojis: [
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
        '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒'
      ]
    },
    food: {
      title: "Food",
      icon: <Apple className="h-4 w-4" />,
      emojis: [
        '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒',
        '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬'
      ]
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
        <CardTitle className="flex items-center space-x-2">
          <Smile className="h-5 w-5 text-yellow-500" />
          <span>Emoji Picker</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="popular" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            {Object.entries(categories).map(([key, category]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {category.icon}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(categories).map(([key, category]) => (
            <TabsContent key={key} value={key}>
              <ScrollArea className="h-48">
                <div className="grid grid-cols-6 gap-2 p-2">
                  {category.emojis.map((emoji, index) => (
                    <Button
                      key={`${emoji}-${index}`}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-100 hover:scale-110 transition-all"
                      onClick={() => onEmojiSelect(emoji)}
                    >
                      <span className="text-lg">{emoji}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Click any emoji to add it to your text
          </p>
        </div>
      </CardContent>
    </Card>
  );
}