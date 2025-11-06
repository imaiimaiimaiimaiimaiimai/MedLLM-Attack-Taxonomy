/**
 * Common types used across the application
 */

export interface SelectOption {
  label: string;
  value: string;
}

export type ViewMode = 'grid' | 'list';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

// Graph types
export interface GraphNode {
  id: string;
  type: 'attack' | 'modality' | 'type' | 'paper' | 'category';
  data: {
    label: string;
    type: string;
    severity?: string;
    successRate?: number;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  avgConnections: number;
  mostConnectedNodes: Array<{
    id: string;
    label: string;
    connections: number;
  }>;
}

// Export types
export type ExportFormat = 'csv' | 'markdown' | 'json';

// Keyboard shortcut types
export interface KeyboardShortcutHandlers {
  onFocusSearch?: () => void;
  onClearFilters?: () => void;
  onShowHelp?: () => void;
}
