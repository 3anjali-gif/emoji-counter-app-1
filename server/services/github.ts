interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  email: string;
}

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
}

interface GitHubFile {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  download_url?: string;
  url: string;
}

interface PullRequestData {
  title: string;
  description: string;
  branchName: string;
  fileName: string;
  fileContent: string;
  baseBranch: string;
}

class GitHubService {
  private async makeRequest(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Workik-Test-Generator',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  async exchangeCodeForToken(code: string): Promise<{ accessToken: string; user: GitHubUser }> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("GitHub OAuth credentials not configured");
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(`GitHub OAuth error: ${tokenData.error_description}`);
    }

    const accessToken = tokenData.access_token;

    // Get user information
    const user = await this.makeRequest('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`,
      },
    });

    return { accessToken, user };
  }

  async getUserRepositories(token: string): Promise<GitHubRepository[]> {
    return this.makeRequest('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        'Authorization': `token ${token}`,
      },
    });
  }

  async getRepositoryContents(
    token: string,
    repoFullName: string,
    path: string = "",
    branch: string = "main"
  ): Promise<GitHubFile[]> {
    const url = `https://api.github.com/repos/${repoFullName}/contents/${path}?ref=${branch}`;
    
    const contents = await this.makeRequest(url, {
      headers: {
        'Authorization': `token ${token}`,
      },
    });

    // Ensure we return an array
    const files = Array.isArray(contents) ? contents : [contents];
    
    return files.map((file: any) => ({
      name: file.name,
      path: file.path,
      type: file.type === 'dir' ? 'dir' : 'file',
      size: file.size,
      downloadUrl: file.download_url,
    }));
  }

  async getFileContent(
    token: string,
    repoFullName: string,
    filePath: string,
    branch: string = "main"
  ): Promise<string> {
    const url = `https://api.github.com/repos/${repoFullName}/contents/${filePath}?ref=${branch}`;
    
    const file = await this.makeRequest(url, {
      headers: {
        'Authorization': `token ${token}`,
      },
    });

    if (file.type !== 'file') {
      throw new Error('Path does not point to a file');
    }

    // Decode base64 content
    return Buffer.from(file.content, 'base64').toString('utf-8');
  }

  async createPullRequest(
    token: string,
    repoFullName: string,
    prData: PullRequestData
  ): Promise<any> {
    // First, get the reference of the base branch
    const baseRef = await this.makeRequest(
      `https://api.github.com/repos/${repoFullName}/git/refs/heads/${prData.baseBranch}`,
      {
        headers: {
          'Authorization': `token ${token}`,
        },
      }
    );

    // Create a new branch
    await this.makeRequest(
      `https://api.github.com/repos/${repoFullName}/git/refs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: `refs/heads/${prData.branchName}`,
          sha: baseRef.object.sha,
        }),
      }
    );

    // Create or update the file
    await this.makeRequest(
      `https://api.github.com/repos/${repoFullName}/contents/${prData.fileName}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add ${prData.fileName}`,
          content: Buffer.from(prData.fileContent).toString('base64'),
          branch: prData.branchName,
        }),
      }
    );

    // Create the pull request
    return this.makeRequest(
      `https://api.github.com/repos/${repoFullName}/pulls`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: prData.title,
          body: prData.description,
          head: prData.branchName,
          base: prData.baseBranch,
        }),
      }
    );
  }
}

export const githubService = new GitHubService();
