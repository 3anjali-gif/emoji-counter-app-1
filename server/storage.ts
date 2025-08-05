import { 
  type User, 
  type InsertUser,
  type Repository,
  type InsertRepository,
  type TestCaseGeneration,
  type InsertTestCaseGeneration,
  type GeneratedTestCase,
  type InsertGeneratedTestCase
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByGithubId(githubId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Repository methods
  getRepository(id: string): Promise<Repository | undefined>;
  getRepositoriesByUserId(userId: string): Promise<Repository[]>;
  getRepositoryByGithubId(githubId: string, userId: string): Promise<Repository | undefined>;
  createRepository(repository: InsertRepository): Promise<Repository>;

  // Test case generation methods
  getTestCaseGeneration(id: string): Promise<TestCaseGeneration | undefined>;
  getTestCaseGenerationsByUserId(userId: string): Promise<TestCaseGeneration[]>;
  createTestCaseGeneration(generation: InsertTestCaseGeneration): Promise<TestCaseGeneration>;
  updateTestCaseGeneration(id: string, updates: Partial<TestCaseGeneration>): Promise<TestCaseGeneration | undefined>;

  // Generated test case methods
  getGeneratedTestCase(id: string): Promise<GeneratedTestCase | undefined>;
  getGeneratedTestCasesByGenerationId(generationId: string): Promise<GeneratedTestCase[]>;
  createGeneratedTestCase(testCase: InsertGeneratedTestCase): Promise<GeneratedTestCase>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private repositories: Map<string, Repository>;
  private testCaseGenerations: Map<string, TestCaseGeneration>;
  private generatedTestCases: Map<string, GeneratedTestCase>;

  constructor() {
    this.users = new Map();
    this.repositories = new Map();
    this.testCaseGenerations = new Map();
    this.generatedTestCases = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.githubId === githubId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
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

  async getRepository(id: string): Promise<Repository | undefined> {
    return this.repositories.get(id);
  }

  async getRepositoriesByUserId(userId: string): Promise<Repository[]> {
    return Array.from(this.repositories.values()).filter(repo => repo.userId === userId);
  }

  async getRepositoryByGithubId(githubId: string, userId: string): Promise<Repository | undefined> {
    return Array.from(this.repositories.values()).find(
      repo => repo.githubId === githubId && repo.userId === userId
    );
  }

  async createRepository(insertRepository: InsertRepository): Promise<Repository> {
    const id = randomUUID();
    const repository: Repository = {
      ...insertRepository,
      id,
      createdAt: new Date()
    };
    this.repositories.set(id, repository);
    return repository;
  }

  async getTestCaseGeneration(id: string): Promise<TestCaseGeneration | undefined> {
    return this.testCaseGenerations.get(id);
  }

  async getTestCaseGenerationsByUserId(userId: string): Promise<TestCaseGeneration[]> {
    return Array.from(this.testCaseGenerations.values()).filter(gen => gen.userId === userId);
  }

  async createTestCaseGeneration(insertGeneration: InsertTestCaseGeneration): Promise<TestCaseGeneration> {
    const id = randomUUID();
    const generation: TestCaseGeneration = {
      ...insertGeneration,
      id,
      createdAt: new Date()
    };
    this.testCaseGenerations.set(id, generation);
    return generation;
  }

  async updateTestCaseGeneration(id: string, updates: Partial<TestCaseGeneration>): Promise<TestCaseGeneration | undefined> {
    const generation = this.testCaseGenerations.get(id);
    if (!generation) return undefined;

    const updatedGeneration = { ...generation, ...updates };
    this.testCaseGenerations.set(id, updatedGeneration);
    return updatedGeneration;
  }

  async getGeneratedTestCase(id: string): Promise<GeneratedTestCase | undefined> {
    return this.generatedTestCases.get(id);
  }

  async getGeneratedTestCasesByGenerationId(generationId: string): Promise<GeneratedTestCase[]> {
    return Array.from(this.generatedTestCases.values()).filter(
      testCase => testCase.generationId === generationId
    );
  }

  async createGeneratedTestCase(insertTestCase: InsertGeneratedTestCase): Promise<GeneratedTestCase> {
    const id = randomUUID();
    const testCase: GeneratedTestCase = {
      ...insertTestCase,
      id,
      createdAt: new Date()
    };
    this.generatedTestCases.set(id, testCase);
    return testCase;
  }
}

export const storage = new MemStorage();
