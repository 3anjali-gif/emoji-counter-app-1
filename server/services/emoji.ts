import type { EmojiStats, EmojiCount } from "@shared/schema";

interface FileContent {
  path: string;
  content: string;
}

class EmojiService {
  // Comprehensive emoji regex that matches various emoji formats
  private emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}]|[\u{2194}-\u{2199}]|[\u{21A9}-\u{21AA}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{25FD}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2705}]|[\u{270A}-\u{270B}]|[\u{2728}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2795}-\u{2797}]|[\u{27B0}]|[\u{27BF}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]/gu;

  /**
   * Extract and count emojis from text
   */
  extractEmojis(text: string): Record<string, number> {
    const matches = text.match(this.emojiRegex) || [];
    const emojiCounts: Record<string, number> = {};

    matches.forEach(emoji => {
      emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
    });

    return emojiCounts;
  }

  /**
   * Generate emoji statistics from raw emoji counts
   */
  generateStats(emojiCounts: Record<string, number>): EmojiStats {
    const entries = Object.entries(emojiCounts);
    const totalEmojis = entries.reduce((sum, [, count]) => sum + count, 0);
    const uniqueEmojis = entries.length;

    // Convert to EmojiCount array with percentages
    const emojiCountsArray: EmojiCount[] = entries
      .map(([emoji, count]) => ({
        emoji,
        count,
        percentage: totalEmojis > 0 ? Math.round((count / totalEmojis) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    const mostUsed = emojiCountsArray.length > 0 ? emojiCountsArray[0] : null;

    return {
      totalEmojis,
      uniqueEmojis,
      mostUsed,
      emojiCounts: emojiCountsArray
    };
  }

  /**
   * Get popular emojis for suggestions
   */
  getPopularEmojis(): string[] {
    return [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
      '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
      '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
      '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
      '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
      '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
      '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
      '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏',
      '🙌', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶',
      '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️',
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
      '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐'
    ];
  }

  /**
   * Get emoji categories for filtering
   */
  getEmojiCategories(): Record<string, string[]> {
    return {
      'Smileys & People': [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
        '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'
      ],
      'Hearts & Love': [
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
        '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'
      ],
      'Hand Gestures': [
        '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
        '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌'
      ],
      'Animals & Nature': [
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
        '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒'
      ],
      'Food & Drink': [
        '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒',
        '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬'
      ],
      'Activities & Sports': [
        '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
        '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳'
      ],
      'Travel & Places': [
        '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
        '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼'
      ],
      'Objects & Symbols': [
        '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️',
        '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥'
      ]
    };
  }

  /**
   * Clean and format text for analysis
   */
  cleanText(text: string): string {
    // Remove excessive whitespace but preserve line breaks
    return text.replace(/[ \t]+/g, ' ').trim();
  }

  /**
   * Get sentiment analysis based on emoji usage
   */
  analyzeSentiment(emojiCounts: Record<string, number>): {
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
  } {
    const positiveEmojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '🤩', '🥳', '😎', '👍', '👌', '✌️', '🤞', '🤟', '🤘', '👏', '🙌', '🤝', '🙏', '❤️', '🧡', '💛', '💚', '💙', '💜', '💕', '💞', '💓', '💗', '💖', '💘', '💝'];
    const negativeEmojis = ['😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😱', '😨', '😰', '😥', '😓', '💔', '👎', '🖕'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    let totalCount = 0;

    Object.entries(emojiCounts).forEach(([emoji, count]) => {
      totalCount += count;
      if (positiveEmojis.includes(emoji)) {
        positiveCount += count;
      } else if (negativeEmojis.includes(emoji)) {
        negativeCount += count;
      }
    });

    if (totalCount === 0) {
      return { sentiment: 'neutral', score: 0, confidence: 0 };
    }

    const positiveRatio = positiveCount / totalCount;
    const negativeRatio = negativeCount / totalCount;
    const neutralRatio = 1 - positiveRatio - negativeRatio;

    let sentiment: 'positive' | 'negative' | 'neutral';
    let score: number;
    let confidence: number;

    if (positiveRatio > negativeRatio && positiveRatio > 0.3) {
      sentiment = 'positive';
      score = positiveRatio;
      confidence = Math.min(0.95, positiveRatio * 2);
    } else if (negativeRatio > positiveRatio && negativeRatio > 0.3) {
      sentiment = 'negative';
      score = -negativeRatio;
      confidence = Math.min(0.95, negativeRatio * 2);
    } else {
      sentiment = 'neutral';
      score = 0;
      confidence = Math.max(0.1, neutralRatio);
    }

    return { sentiment, score, confidence };
  }

  /**
   * Generate emoji usage insights
   */
  generateInsights(stats: EmojiStats): string[] {
    const insights: string[] = [];

    if (stats.totalEmojis === 0) {
      insights.push("No emojis found in the text. Consider adding some emojis to make your message more expressive! 😊");
      return insights;
    }

    if (stats.totalEmojis === 1) {
      insights.push("You used 1 emoji. Adding more emojis can make your text more engaging!");
    } else if (stats.totalEmojis < 5) {
      insights.push(`You used ${stats.totalEmojis} emojis. That's a nice balance for keeping text expressive but readable.`);
    } else if (stats.totalEmojis < 20) {
      insights.push(`You used ${stats.totalEmojis} emojis. Your text is quite expressive!`);
    } else {
      insights.push(`Wow! You used ${stats.totalEmojis} emojis. Your text is super expressive! 🎉`);
    }

    if (stats.uniqueEmojis === 1) {
      insights.push(`You only used one type of emoji (${stats.mostUsed?.emoji}). Try mixing different emojis for more variety!`);
    } else if (stats.uniqueEmojis < stats.totalEmojis / 3) {
      insights.push(`You used ${stats.uniqueEmojis} different emojis. You tend to repeat your favorite emojis!`);
    } else {
      insights.push(`You used ${stats.uniqueEmojis} different emojis. Great variety in your emoji usage!`);
    }

    if (stats.mostUsed && stats.mostUsed.percentage > 50) {
      insights.push(`${stats.mostUsed.emoji} is clearly your favorite emoji, making up ${stats.mostUsed.percentage}% of all emojis used!`);
    } else if (stats.mostUsed && stats.mostUsed.percentage > 30) {
      insights.push(`${stats.mostUsed.emoji} is your most used emoji at ${stats.mostUsed.percentage}% of total usage.`);
    }

    // Add category insights
    const categories = this.getEmojiCategories();
    const categoryUsage: Record<string, number> = {};
    
    stats.emojiCounts.forEach(({ emoji, count }) => {
      Object.entries(categories).forEach(([category, emojis]) => {
        if (emojis.includes(emoji)) {
          categoryUsage[category] = (categoryUsage[category] || 0) + count;
        }
      });
    });

    const topCategory = Object.entries(categoryUsage)
      .sort(([,a], [,b]) => b - a)[0];

    if (topCategory) {
      insights.push(`You prefer "${topCategory[0]}" emojis the most!`);
    }

    return insights;
  }
}

export const emojiService = new EmojiService();