import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { githubService } from "./services/github";
import { aiService } from "./services/ai";
import { insertUserSchema, insertRepositorySchema, insertTestCaseGenerationSchema, insertGeneratedTestCaseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // GitHub OAuth routes
  app.get("/api/auth/github", (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: "GitHub client ID not configured" });
    }

    const scope = "repo,user:email";
    const redirectUri = process.env.GITHUB_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/github/callback`;
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.redirect(authUrl);
  });

  app.get("/api/auth/github/callback", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code || typeof code !== "string") {
        return res.status(400).json({ error: "Authorization code required" });
      }

      const { accessToken, user: githubUser } = await githubService.exchangeCodeForToken(code);
      
      let user = await storage.getUserByGithubId(githubUser.id.toString());
      
      if (!user) {
        user = await storage.createUser({
          username: githubUser.login,
          githubId: githubUser.id.toString(),
          githubToken: accessToken,
          avatar: githubUser.avatar_url,
          email: githubUser.email,
        });
      } else {
        user = await storage.updateUser(user.id, {
          githubToken: accessToken,
          avatar: githubUser.avatar_url,
          email: githubUser.email,
        });
      }

      // In a real app, you'd set up session management here
      res.redirect(`/?user=${user!.id}`);
    } catch (error) {
      console.error("GitHub auth error:", error);
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
      
      // Don't send the GitHub token to the client
      const { githubToken, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Repository routes
  app.get("/api/user/:userId/repositories", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user || !user.githubToken) {
        return res.status(401).json({ error: "User not authenticated with GitHub" });
      }

      const repos = await githubService.getUserRepositories(user.githubToken);
      
      // Store repositories in our database
      for (const repo of repos) {
        const existingRepo = await storage.getRepositoryByGithubId(repo.id.toString(), user.id);
        if (!existingRepo) {
          await storage.createRepository({
            userId: user.id,
            githubId: repo.id.toString(),
            name: repo.name,
            fullName: repo.full_name,
            private: repo.private,
            defaultBranch: repo.default_branch,
          });
        }
      }

      const userRepos = await storage.getRepositoriesByUserId(user.id);
      res.json(userRepos);
    } catch (error) {
      console.error("Repository fetch error:", error);
      res.status(500).json({ error: "Failed to fetch repositories" });
    }
  });

  app.get("/api/repository/:repoId/files", async (req, res) => {
    try {
      const { path = "" } = req.query;
      const repository = await storage.getRepository(req.params.repoId);
      
      if (!repository) {
        return res.status(404).json({ error: "Repository not found" });
      }

      const user = await storage.getUser(repository.userId);
      if (!user || !user.githubToken) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const files = await githubService.getRepositoryContents(
        user.githubToken,
        repository.fullName,
        typeof path === "string" ? path : "",
        repository.defaultBranch || "main"
      );

      res.json(files);
    } catch (error) {
      console.error("File fetch error:", error);
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  app.get("/api/repository/:repoId/file-content", async (req, res) => {
    try {
      const { path } = req.query;
      if (!path || typeof path !== "string") {
        return res.status(400).json({ error: "File path required" });
      }

      const repository = await storage.getRepository(req.params.repoId);
      if (!repository) {
        return res.status(404).json({ error: "Repository not found" });
      }

      const user = await storage.getUser(repository.userId);
      if (!user || !user.githubToken) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const content = await githubService.getFileContent(
        user.githubToken,
        repository.fullName,
        path,
        repository.defaultBranch || "main"
      );

      res.json({ content });
    } catch (error) {
      console.error("File content fetch error:", error);
      res.status(500).json({ error: "Failed to fetch file content" });
    }
  });

  // Test case generation routes
  app.post("/api/generate-test-cases", async (req, res) => {
    try {
      const validatedData = insertTestCaseGenerationSchema.parse(req.body);
      
      const generation = await storage.createTestCaseGeneration({
        ...validatedData,
        status: "generating"
      });

      // Start async generation process
      generateTestCasesAsync(generation.id);

      res.json(generation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Test case generation error:", error);
      res.status(500).json({ error: "Failed to start test case generation" });
    }
  });

  app.get("/api/test-case-generation/:id", async (req, res) => {
    try {
      const generation = await storage.getTestCaseGeneration(req.params.id);
      if (!generation) {
        return res.status(404).json({ error: "Generation not found" });
      }
      res.json(generation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch generation" });
    }
  });

  app.post("/api/generate-test-code", async (req, res) => {
    try {
      const validatedData = insertGeneratedTestCaseSchema.parse(req.body);
      
      const generation = await storage.getTestCaseGeneration(validatedData.generationId);
      if (!generation) {
        return res.status(404).json({ error: "Generation not found" });
      }

      const repository = await storage.getRepository(generation.repositoryId);
      if (!repository) {
        return res.status(404).json({ error: "Repository not found" });
      }

      const user = await storage.getUser(generation.userId);
      if (!user || !user.githubToken) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Get file contents for context
      const fileContents = await Promise.all(
        (generation.selectedFiles as string[]).map(async (filePath) => {
          try {
            const content = await githubService.getFileContent(
              user.githubToken!,
              repository.fullName,
              filePath,
              repository.defaultBranch || "main"
            );
            return { path: filePath, content };
          } catch (error) {
            console.error(`Failed to fetch content for ${filePath}:`, error);
            return { path: filePath, content: "" };
          }
        })
      );

      const summaries = generation.summaries as any[];
      const summary = summaries[parseInt(validatedData.summaryIndex)];

      const generatedCode = await aiService.generateTestCode(
        fileContents,
        summary,
        generation.framework
      );

      const testCase = await storage.createGeneratedTestCase({
        ...validatedData,
        code: generatedCode,
      });

      res.json(testCase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Test code generation error:", error);
      res.status(500).json({ error: "Failed to generate test code" });
    }
  });

  app.get("/api/test-case-generation/:generationId/generated-tests", async (req, res) => {
    try {
      const testCases = await storage.getGeneratedTestCasesByGenerationId(req.params.generationId);
      res.json(testCases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch generated test cases" });
    }
  });

  // GitHub PR creation route (bonus feature)
  app.post("/api/create-pr", async (req, res) => {
    try {
      const { repositoryId, testCaseId, branchName, title, description } = req.body;

      const repository = await storage.getRepository(repositoryId);
      if (!repository) {
        return res.status(404).json({ error: "Repository not found" });
      }

      const user = await storage.getUser(repository.userId);
      if (!user || !user.githubToken) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const testCase = await storage.getGeneratedTestCase(testCaseId);
      if (!testCase) {
        return res.status(404).json({ error: "Test case not found" });
      }

      const pr = await githubService.createPullRequest(
        user.githubToken,
        repository.fullName,
        {
          title: title || `Add ${testCase.title}`,
          description: description || `Generated test case: ${testCase.description}`,
          branchName: branchName || `test-case-${testCase.id}`,
          fileName: testCase.filename,
          fileContent: testCase.code,
          baseBranch: repository.defaultBranch || "main"
        }
      );

      res.json(pr);
    } catch (error) {
      console.error("PR creation error:", error);
      res.status(500).json({ error: "Failed to create pull request" });
    }
  });

  // Async function to generate test case summaries
  async function generateTestCasesAsync(generationId: string) {
    try {
      const generation = await storage.getTestCaseGeneration(generationId);
      if (!generation) return;

      const repository = await storage.getRepository(generation.repositoryId);
      if (!repository) return;

      const user = await storage.getUser(generation.userId);
      if (!user || !user.githubToken) return;

      // Get file contents
      const fileContents = await Promise.all(
        (generation.selectedFiles as string[]).map(async (filePath) => {
          try {
            const content = await githubService.getFileContent(
              user.githubToken!,
              repository.fullName,
              filePath,
              repository.defaultBranch || "main"
            );
            return { path: filePath, content };
          } catch (error) {
            console.error(`Failed to fetch content for ${filePath}:`, error);
            return { path: filePath, content: "" };
          }
        })
      );

      // Generate test case summaries using AI
      const summaries = await aiService.generateTestCaseSummaries(
        fileContents,
        generation.framework
      );

      // Update generation with summaries
      await storage.updateTestCaseGeneration(generationId, {
        summaries: summaries,
        status: "completed"
      });
    } catch (error) {
      console.error("Async test case generation error:", error);
      await storage.updateTestCaseGeneration(generationId, {
        status: "failed"
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
