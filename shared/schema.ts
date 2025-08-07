import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emojiTexts = pgTable("emoji_texts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  emojiCounts: jsonb("emoji_counts").notNull(), // object with emoji as key and count as value
  totalEmojis: integer("total_emojis").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertEmojiTextSchema = createInsertSchema(emojiTexts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  emojiCounts: z.record(z.number()).optional(),
  totalEmojis: z.number().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEmojiText = z.infer<typeof insertEmojiTextSchema>;
export type EmojiText = typeof emojiTexts.$inferSelect;

// Additional types for emoji counting
export type EmojiCount = {
  emoji: string;
  count: number;
  percentage: number;
};

export type EmojiStats = {
  totalEmojis: number;
  uniqueEmojis: number;
  mostUsed: EmojiCount | null;
  emojiCounts: EmojiCount[];
};
