import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronRight, Folder, File, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GitHubFile } from "@shared/schema";

interface FileTreeProps {
  repositoryId: string;
  selectedFiles: string[];
  onSelectionChange: (files: string[]) => void;
}

export function FileTree({ repositoryId, selectedFiles, onSelectionChange }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const { data: files, isLoading } = useQuery({
    queryKey: ['/api/repository', repositoryId, 'files'],
    enabled: !!repositoryId,
  });

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const toggleFileSelection = (filePath: string) => {
    const newSelection = selectedFiles.includes(filePath)
      ? selectedFiles.filter(f => f !== filePath)
      : [...selectedFiles, filePath];
    onSelectionChange(newSelection);
  };

  const getFileIcon = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) {
      return <Folder className="text-blue-500 text-sm" />;
    }

    const ext = fileName.split('.').pop()?.toLowerCase();
    const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'php'];
    
    if (codeExtensions.includes(ext || '')) {
      return <Code className="text-green-500 text-sm" />;
    }
    
    return <File className="text-gray-400 text-sm" />;
  };

  const isCodeFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'php'];
    return codeExtensions.includes(ext || '');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}b`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}kb`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}mb`;
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Files</h3>
          <span className="text-xs text-gray-500">{selectedFiles.length} selected</span>
        </div>
        
        <div className="space-y-1">
          {files?.map((file: GitHubFile) => (
            <FileTreeItem
              key={file.path}
              file={file}
              repositoryId={repositoryId}
              selectedFiles={selectedFiles}
              expandedFolders={expandedFolders}
              onToggleFolder={toggleFolder}
              onToggleSelection={toggleFileSelection}
              getFileIcon={getFileIcon}
              isCodeFile={isCodeFile}
              formatFileSize={formatFileSize}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface FileTreeItemProps {
  file: GitHubFile;
  repositoryId: string;
  selectedFiles: string[];
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onToggleSelection: (path: string) => void;
  getFileIcon: (name: string, isDir: boolean) => React.ReactNode;
  isCodeFile: (name: string) => boolean;
  formatFileSize: (bytes?: number) => string;
  level?: number;
}

function FileTreeItem({ 
  file, 
  repositoryId, 
  selectedFiles, 
  expandedFolders, 
  onToggleFolder, 
  onToggleSelection,
  getFileIcon,
  isCodeFile,
  formatFileSize,
  level = 0
}: FileTreeItemProps) {
  const { data: subFiles } = useQuery({
    queryKey: ['/api/repository', repositoryId, 'files', { path: file.path }],
    enabled: file.type === 'dir' && expandedFolders.has(file.path),
  });

  const isExpanded = expandedFolders.has(file.path);
  const isSelected = selectedFiles.includes(file.path);
  const isFile = file.type === 'file';
  const showCheckbox = isFile && isCodeFile(file.name);

  const handleClick = () => {
    if (file.type === 'dir') {
      onToggleFolder(file.path);
    } else if (showCheckbox) {
      onToggleSelection(file.path);
    }
  };

  return (
    <div>
      <div 
        className={cn(
          "flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer",
          isSelected && "border-l-2 border-primary bg-blue-50"
        )}
        style={{ paddingLeft: `${(level * 24) + 8}px` }}
        onClick={handleClick}
      >
        {file.type === 'dir' && (
          isExpanded ? 
            <ChevronDown className="text-xs text-gray-400 w-4 h-4" /> : 
            <ChevronRight className="text-xs text-gray-400 w-4 h-4" />
        )}
        
        {showCheckbox && (
          <Checkbox 
            checked={isSelected}
            onChange={() => onToggleSelection(file.path)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        
        {getFileIcon(file.name, file.type === 'dir')}
        
        <span className="text-sm text-gray-700 flex-1">{file.name}</span>
        
        {isFile && file.size && (
          <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
        )}
      </div>

      {file.type === 'dir' && isExpanded && subFiles && (
        <div>
          {subFiles.map((subFile: GitHubFile) => (
            <FileTreeItem
              key={subFile.path}
              file={subFile}
              repositoryId={repositoryId}
              selectedFiles={selectedFiles}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              onToggleSelection={onToggleSelection}
              getFileIcon={getFileIcon}
              isCodeFile={isCodeFile}
              formatFileSize={formatFileSize}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
