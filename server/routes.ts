import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emojiService } from "./services/emoji";
import { insertUserSchema, insertEmojiTextSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple auth route - create/get user
  app.post("/api/auth/simple", async (req, res) => {
    try {
      const { username } = req.body;
      if (!username || username.trim() === '') {
        return res.status(400).json({ error: "Username is required" });
      }

      // For simplicity, we'll create a simple check mechanism
      // In a real app, you'd have a proper user lookup system
      let user: any = null;

      if (!user) {
        user = await storage.createUser({
          username: username.trim(),
          email: null,
          avatar: null
        });
      }

      res.json({ user });
    } catch (error) {
      console.error("Simple auth error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Emoji text routes
  app.get("/api/user/:userId/emoji-texts", async (req, res) => {
    try {
      const emojiTexts = await storage.getEmojiTextsByUserId(req.params.userId);
      res.json(emojiTexts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch emoji texts" });
    }
  });

  app.get("/api/emoji-text/:id", async (req, res) => {
    try {
      const emojiText = await storage.getEmojiText(req.params.id);
      if (!emojiText) {
        return res.status(404).json({ error: "Emoji text not found" });
      }
      res.json(emojiText);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch emoji text" });
    }
  });

  app.post("/api/analyze-emoji", async (req, res) => {
    try {
      const validatedData = insertEmojiTextSchema.parse(req.body);
      
      // Clean and process the text
      const cleanedContent = emojiService.cleanText(validatedData.content);
      
      // Extract emojis and generate counts
      const emojiCounts = emojiService.extractEmojis(cleanedContent);
      const totalEmojis = Object.values(emojiCounts).reduce((sum, count) => sum + count, 0);
      
      // Generate statistics
      const stats = emojiService.generateStats(emojiCounts);
      
      // Create emoji text record
      const emojiText = await storage.createEmojiText({
        ...validatedData,
        content: cleanedContent,
        emojiCounts: emojiCounts,
        totalEmojis: totalEmojis
      });

      // Add additional analysis data
      const sentiment = emojiService.analyzeSentiment(emojiCounts);
      const insights = emojiService.generateInsights(stats);

      res.json({
        emojiText,
        stats,
        sentiment,
        insights
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Emoji analysis error:", error);
      res.status(500).json({ error: "Failed to analyze emoji text" });
    }
  });

  app.put("/api/emoji-text/:id", async (req, res) => {
    try {
      const { title, content } = req.body;
      
      if (!title && !content) {
        return res.status(400).json({ error: "Title or content is required" });
      }

      let updates: Partial<any> = {};
      
      if (title) updates.title = title;
      
      if (content) {
        const cleanedContent = emojiService.cleanText(content);
        const emojiCounts = emojiService.extractEmojis(cleanedContent);
        const totalEmojis = Object.values(emojiCounts).reduce((sum, count) => sum + count, 0);
        
        updates.content = cleanedContent;
        updates.emojiCounts = emojiCounts;
        updates.totalEmojis = totalEmojis;
      }

      const updatedEmojiText = await storage.updateEmojiText(req.params.id, updates);
      
      if (!updatedEmojiText) {
        return res.status(404).json({ error: "Emoji text not found" });
      }

      // If content was updated, return new analysis
      if (content) {
        const stats = emojiService.generateStats(updatedEmojiText.emojiCounts as Record<string, number>);
        const sentiment = emojiService.analyzeSentiment(updatedEmojiText.emojiCounts as Record<string, number>);
        const insights = emojiService.generateInsights(stats);

        res.json({
          emojiText: updatedEmojiText,
          stats,
          sentiment,
          insights
        });
      } else {
        res.json({ emojiText: updatedEmojiText });
      }
    } catch (error) {
      console.error("Update emoji text error:", error);
      res.status(500).json({ error: "Failed to update emoji text" });
    }
  });

  app.delete("/api/emoji-text/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEmojiText(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Emoji text not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete emoji text" });
    }
  });

  // Utility routes
  app.get("/api/popular-emojis", (req, res) => {
    try {
      const popularEmojis = emojiService.getPopularEmojis();
      res.json(popularEmojis);
    } catch (error) {
      res.status(500).json({ error: "Failed to get popular emojis" });
    }
  });

  app.get("/api/emoji-categories", (req, res) => {
    try {
      const categories = emojiService.getEmojiCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to get emoji categories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
