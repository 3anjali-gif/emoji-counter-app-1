export interface GitHubRepository {
  id: string;
  name: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
}

export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  downloadUrl?: string;
}

export interface GitHubUser {
  id: string;
  username: string;
  avatar: string;
  email: string;
}

// Client-side GitHub utilities
export class GitHubClient {
  static getAuthUrl(): string {
    return '/api/auth/github';
  }

  static async getUserRepositories(userId: string): Promise<GitHubRepository[]> {
    const response = await fetch(`/api/user/${userId}/repositories`);
    if (!response.ok) {
      throw new Error('Failed to fetch repositories');
    }
    return response.json();
  }

  static async getRepositoryFiles(
    repositoryId: string, 
    path: string = ''
  ): Promise<GitHubFile[]> {
    const searchParams = new URLSearchParams();
    if (path) {
      searchParams.set('path', path);
    }
    
    const response = await fetch(
      `/api/repository/${repositoryId}/files?${searchParams.toString()}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }
    
    return response.json();
  }

  static async getFileContent(
    repositoryId: string, 
    filePath: string
  ): Promise<string> {
    const response = await fetch(
      `/api/repository/${repositoryId}/file-content?path=${encodeURIComponent(filePath)}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch file content');
    }
    
    const data = await response.json();
    return data.content;
  }

  static isCodeFile(fileName: string): boolean {
    const codeExtensions = [
      'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'php',
      'rb', 'swift', 'kt', 'cs', 'scala', 'clj', 'dart', 'lua', 'perl',
      'sh', 'bash', 'zsh', 'fish', 'ps1', 'r', 'jl', 'nim', 'zig'
    ];
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    return codeExtensions.includes(extension || '');
  }

  static getFileIcon(fileName: string, isDirectory: boolean): string {
    if (isDirectory) {
      return '📁';
    }

    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      js: '📄',
      jsx: '⚛️',
      ts: '🔷',
      tsx: '⚛️',
      py: '🐍',
      java: '☕',
      cpp: '🔧',
      c: '🔧',
      go: '🐹',
      rs: '🦀',
      php: '🐘',
      rb: '💎',
      swift: '🍎',
      kt: '🎯',
      cs: '🔷',
      html: '🌐',
      css: '🎨',
      json: '📋',
      md: '📝',
      txt: '📄',
      yml: '⚙️',
      yaml: '⚙️',
      xml: '📄',
      sql: '🗃️',
    };

    return iconMap[extension || ''] || '📄';
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
