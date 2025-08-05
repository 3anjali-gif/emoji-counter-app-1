import { GoogleGenAI } from "@google/genai";
import type { TestCaseSummary } from "@shared/schema";

interface FileContent {
  path: string;
  content: string;
}

// the newest Gemini model is "gemini-2.5-flash" or "gemini-2.5-pro" - do not change this unless explicitly requested by the user
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

class AIService {
  async generateTestCaseSummaries(
    fileContents: FileContent[],
    framework: string
  ): Promise<TestCaseSummary[]> {
    try {
      const filesContext = fileContents
        .map(file => `File: ${file.path}\n\`\`\`\n${file.content}\n\`\`\``)
        .join('\n\n');

      const systemPrompt = `You are an expert software testing engineer specializing in ${framework} test case generation. 
Analyze the provided code files and generate comprehensive test case summaries.

For each logical group of functionality that should be tested together, create a test case summary with:
1. A descriptive title
2. Detailed description of what will be tested
3. Test type (unit, integration, or e2e)
4. Suggested filename for the test file
5. Estimated number of test methods
6. Estimated test coverage percentage (realistic estimate)
7. Estimated runtime (e.g., "~2 min", "~30 sec")

Consider:
- Edge cases and error handling
- Input validation
- Business logic correctness
- Integration points between modules
- Performance considerations where relevant
- Security aspects if applicable

Return a JSON array of test case summaries. Each summary should follow this structure:
{
  "title": "descriptive title",
  "description": "detailed description of test scope and coverage",
  "testType": "unit|integration|e2e",
  "filename": "suggested test filename with proper extension",
  "estimatedTests": number,
  "estimatedCoverage": number,
  "estimatedRuntime": "time estimate string"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                testType: { type: "string", enum: ["unit", "integration", "e2e"] },
                filename: { type: "string" },
                estimatedTests: { type: "number" },
                estimatedCoverage: { type: "number" },
                estimatedRuntime: { type: "string" }
              },
              required: ["title", "description", "testType", "filename", "estimatedTests", "estimatedCoverage", "estimatedRuntime"]
            }
          }
        },
        contents: `Analyze these code files and generate test case summaries for ${framework} framework:\n\n${filesContext}`,
      });

      const rawJson = response.text;
      if (!rawJson) {
        throw new Error("Empty response from AI model");
      }

      const summaries: TestCaseSummary[] = JSON.parse(rawJson);
      
      // Validate and sanitize the response
      return summaries.map(summary => ({
        title: summary.title || "Untitled Test Case",
        description: summary.description || "Test case description",
        testType: ["unit", "integration", "e2e"].includes(summary.testType) 
          ? summary.testType as "unit" | "integration" | "e2e"
          : "unit",
        filename: summary.filename || "test.js",
        estimatedTests: Math.max(1, Math.min(50, summary.estimatedTests || 5)),
        estimatedCoverage: Math.max(0, Math.min(100, summary.estimatedCoverage || 80)),
        estimatedRuntime: summary.estimatedRuntime || "~2 min"
      }));

    } catch (error) {
      console.error("Error generating test case summaries:", error);
      throw new Error(`Failed to generate test case summaries: ${error}`);
    }
  }

  async generateTestCode(
    fileContents: FileContent[],
    summary: TestCaseSummary,
    framework: string
  ): Promise<string> {
    try {
      const filesContext = fileContents
        .map(file => `File: ${file.path}\n\`\`\`\n${file.content}\n\`\`\``)
        .join('\n\n');

      const frameworkInstructions = this.getFrameworkInstructions(framework);

      const systemPrompt = `You are an expert software testing engineer specializing in ${framework} test framework.
Generate comprehensive, production-ready test code based on the provided test case summary and source code files.

${frameworkInstructions}

Requirements:
1. Write complete, runnable test code
2. Include proper imports and setup/teardown
3. Cover the exact scenarios described in the test summary
4. Include edge cases, error handling, and input validation tests
5. Use proper assertions and test structure
6. Add descriptive test names and comments
7. Follow best practices for ${framework} testing
8. Include mocking where appropriate for external dependencies
9. Ensure tests are independent and can run in any order
10. Add proper error messages for failed assertions

Return only the complete test code, properly formatted and ready to use.`;

      const prompt = `Generate ${framework} test code for:

Test Summary:
- Title: ${summary.title}
- Description: ${summary.description}
- Test Type: ${summary.testType}
- Filename: ${summary.filename}
- Estimated Tests: ${summary.estimatedTests}

Source Code Files:
${filesContext}

Generate comprehensive test code that covers all the functionality described in the summary.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt,
        },
        contents: prompt,
      });

      const generatedCode = response.text;
      if (!generatedCode) {
        throw new Error("Empty response from AI model");
      }

      return generatedCode.trim();

    } catch (error) {
      console.error("Error generating test code:", error);
      throw new Error(`Failed to generate test code: ${error}`);
    }
  }

  private getFrameworkInstructions(framework: string): string {
    const instructions = {
      jest: `Use Jest testing framework with the following patterns:
- Import syntax: const { functionName } = require('./module') or import { functionName } from './module'
- Describe blocks for grouping related tests
- test() or it() functions for individual test cases
- expect() assertions with appropriate matchers (.toBe(), .toEqual(), .toThrow(), etc.)
- beforeEach()/afterEach() for setup/cleanup
- Mock functions with jest.fn() and jest.mock()
- Async testing with async/await or return promises`,

      pytest: `Use PyTest testing framework with the following patterns:
- Function names starting with test_
- Use assert statements for assertions
- Use pytest.fixture for setup/teardown
- Use pytest.parametrize for data-driven tests
- Use pytest.raises for exception testing
- Import modules using standard Python import syntax
- Use mock.patch for mocking external dependencies`,

      junit: `Use JUnit 5 testing framework with the following patterns:
- Use @Test annotation for test methods
- Use @BeforeEach and @AfterEach for setup/cleanup
- Use Assertions class for assertions (assertEquals, assertTrue, assertThrows, etc.)
- Use @ParameterizedTest for data-driven tests
- Use @Mock and @MockBean for mocking
- Follow proper Java package structure and imports`,

      selenium: `Use Selenium WebDriver with PyTest for E2E testing:
- Import WebDriver and necessary Selenium modules
- Use Page Object Model pattern where appropriate
- Include proper WebDriver setup and teardown
- Use explicit waits (WebDriverWait) instead of implicit waits
- Include assertions for UI elements and behaviors
- Test both positive and negative user scenarios
- Include proper error handling for element not found cases`
    };

    return instructions[framework as keyof typeof instructions] || instructions.jest;
  }
}

export const aiService = new AIService();
