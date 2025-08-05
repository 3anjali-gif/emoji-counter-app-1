import { 
  type User, 
  type InsertUser,
  type EmojiText,
  type InsertEmojiText
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Emoji text methods
  getEmojiText(id: string): Promise<EmojiText | undefined>;
  getEmojiTextsByUserId(userId: string): Promise<EmojiText[]>;
  createEmojiText(emojiText: InsertEmojiText): Promise<EmojiText>;
  updateEmojiText(id: string, updates: Partial<EmojiText>): Promise<EmojiText | undefined>;
  deleteEmojiText(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private emojiTexts: Map<string, EmojiText>;

  constructor() {
    this.users = new Map();
    this.emojiTexts = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email || null,
      avatar: insertUser.avatar || null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getEmojiText(id: string): Promise<EmojiText | undefined> {
    return this.emojiTexts.get(id);
  }

  async getEmojiTextsByUserId(userId: string): Promise<EmojiText[]> {
    return Array.from(this.emojiTexts.values()).filter(text => text.userId === userId);
  }

  async createEmojiText(insertEmojiText: InsertEmojiText): Promise<EmojiText> {
    const id = randomUUID();
    const emojiText: EmojiText = {
      ...insertEmojiText,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.emojiTexts.set(id, emojiText);
    return emojiText;
  }

  async updateEmojiText(id: string, updates: Partial<EmojiText>): Promise<EmojiText | undefined> {
    const emojiText = this.emojiTexts.get(id);
    if (!emojiText) return undefined;

    const updatedEmojiText = { ...emojiText, ...updates, updatedAt: new Date() };
    this.emojiTexts.set(id, updatedEmojiText);
    return updatedEmojiText;
  }

  async deleteEmojiText(id: string): Promise<boolean> {
    return this.emojiTexts.delete(id);
  }
}

export const storage = new MemStorage();
