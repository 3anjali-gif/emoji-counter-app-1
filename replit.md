# Test Case Generator Application

## Overview

This is a full-stack web application that helps developers generate AI-powered test cases for their GitHub repositories. The application integrates with GitHub for repository access, uses Google's Gemini AI to analyze code and generate comprehensive test cases, and supports multiple testing frameworks including Jest, PyTest, JUnit, and Selenium. Users can browse their repositories, select specific files for analysis, generate test case summaries, and create actual test code that can be directly integrated into their projects via pull requests.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints with JSON responses
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Logging**: Custom request logging middleware for API endpoints

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle migrations with shared schema definitions
- **Connection**: Neon Database serverless PostgreSQL connection
- **Storage Strategy**: In-memory storage implementation with interface for easy database switching

### Authentication and Authorization
- **OAuth Provider**: GitHub OAuth 2.0 integration for user authentication
- **Session Management**: Server-side session handling with user tokens
- **Access Control**: Repository access based on GitHub permissions
- **Token Storage**: Secure storage of GitHub access tokens for API calls

### AI Integration Architecture
- **AI Service**: Google Gemini AI (gemini-2.5-flash model) for code analysis and test generation
- **Processing Pipeline**: Multi-stage process from file analysis to test case summary generation to actual code generation
- **Content Analysis**: File content parsing and context building for AI prompts
- **Response Handling**: Structured JSON responses with validation and error handling

### Code Generation Workflow
1. **File Selection**: Users select specific files from their GitHub repositories
2. **Framework Selection**: Choice of testing framework (Jest, PyTest, JUnit, Selenium)
3. **AI Analysis**: Gemini AI analyzes code structure, functionality, and generates test case summaries
4. **Code Generation**: Detailed test code generation based on approved summaries
5. **Integration**: Pull request creation for seamless code integration

### External Service Integration
- **GitHub API**: Repository browsing, file access, and pull request creation
- **AI Processing**: Asynchronous test case generation with status tracking
- **File Management**: Dynamic file tree navigation and content retrieval

### Development Tooling
- **Build System**: Vite for fast development and optimized production builds
- **Type Safety**: Comprehensive TypeScript configuration with strict settings
- **Code Quality**: ESLint and Prettier integration for consistent code formatting
- **Development Server**: Hot module replacement and error overlay for enhanced development experience

## External Dependencies

### Third-party Services
- **GitHub API**: Repository access, user authentication, file management, and pull request creation
- **Google Gemini AI**: Code analysis and test case generation using the gemini-2.5-flash model
- **Neon Database**: Serverless PostgreSQL hosting for production data storage

### Key Libraries and Frameworks
- **Frontend**: React, TanStack Query, Wouter, React Hook Form, Zod validation
- **UI Components**: Radix UI primitives, Shadcn/ui component library, Tailwind CSS
- **Backend**: Express.js, Drizzle ORM, Google GenAI SDK
- **Database**: PostgreSQL with Drizzle migrations and type-safe operations
- **Development**: Vite, TypeScript, ESBuild for production bundling

### Authentication Dependencies
- **GitHub OAuth**: Client ID and secret configuration for OAuth flow
- **Session Management**: Secure token storage and user session handling

### AI Service Dependencies
- **Google AI API**: API key configuration for Gemini AI access
- **Content Processing**: File parsing and context building for AI analysis