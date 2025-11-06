/**
 * Builds network graph data from attacks
 * Creates nodes for attacks, modalities, attack types, and papers
 * Creates edges to show relationships
 */

import type { Attack } from '../types/attack';
import type { GraphNode, GraphEdge, GraphData, GraphStats } from '../types/common';

interface GraphFilters {
  nodeTypes?: string[];
  severities?: string[];
  minConnections?: number;
}

interface GraphStatsResult {
  totalNodes: number;
  totalEdges: number;
  nodesByType: Record<string, number>;
  mostConnected: Array<{
    node: string;
    connections: number;
  }>;
  avgDegree: number;
}

export function buildGraphData(attacks: Attack[]): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeMap = new Map<string, boolean>(); // Track created nodes to avoid duplicates

  // Helper to create unique node ID
  const getNodeId = (type: string, label: string): string =>
    `${type}-${label.toLowerCase().replace(/\s+/g, '-')}`;

  // Helper to add node if it doesn't exist
  const addNode = (id: string, type: GraphNode['type'], label: string, data: Record<string, any> = {}) => {
    if (!nodeMap.has(id)) {
      nodes.push({
        id,
        type: 'custom' as any,
        data: { type, label, ...data },
        position: { x: 0, y: 0 }, // Will be positioned by layout algorithm
      });
      nodeMap.set(id, true);
    }
  };

  // Helper to add edge
  const addEdge = (source: string, target: string, label: string = '') => {
    edges.push({
      id: `e-${source}-${target}`,
      source,
      target,
      label,
      type: 'smoothstep',
      animated: false,
    });
  };

  // Create nodes for each attack
  attacks.forEach((attack) => {
    const attackId = getNodeId('attack', attack.item);

    addNode(attackId, 'attack', attack.item, {
      severity: attack.severity,
      successRate: attack.successRate,
      description: attack.description,
    });

    // Create nodes for modalities and connect
    if (attack.modalities && attack.modalities.length > 0) {
      attack.modalities.forEach((modality) => {
        const modalityId = getNodeId('modality', modality);
        addNode(modalityId, 'modality', modality);
        addEdge(attackId, modalityId, 'uses');
      });
    }

    // Create nodes for attack types and connect
    if (attack.attackTypes && attack.attackTypes.length > 0) {
      attack.attackTypes.forEach((attackType) => {
        const typeId = getNodeId('type', attackType);
        addNode(typeId, 'type', attackType);
        addEdge(attackId, typeId, 'implements');
      });
    }

    // Create node for paper and connect
    if (attack.reference && attack.reference.authors) {
      const paperId = getNodeId('paper', `${attack.reference.authors}-${attack.reference.year}`);
      addNode(paperId, 'paper', `${attack.reference.authors} (${attack.reference.year})`, {
        url: attack.reference.url,
      });
      addEdge(paperId, attackId, 'documents');
    }

    // Create nodes for categories
    if (attack.category) {
      const categoryId = getNodeId('category', attack.category);
      addNode(categoryId, 'category', attack.category);
      addEdge(categoryId, attackId, 'contains');
    }
  });

  return { nodes, edges };
}

/**
 * Applies force-directed layout to position nodes
 * Simple implementation - positions nodes in layers by type
 */
export function applyGraphLayout(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  const layers: Record<string, number> = {
    paper: 0,
    category: 1,
    attack: 2,
    type: 3,
    modality: 4,
  };

  // Group nodes by type
  const nodesByType: Record<string, GraphNode[]> = {};
  nodes.forEach((node) => {
    const type = node.data.type;
    if (!nodesByType[type]) nodesByType[type] = [];
    nodesByType[type].push(node);
  });

  // Position nodes in layers
  const layerSpacing = 300;
  const nodeSpacing = 150;

  Object.entries(nodesByType).forEach(([type, typeNodes]) => {
    const layer = layers[type] || 2;
    const x = layer * layerSpacing;

    typeNodes.forEach((node, index) => {
      node.position = {
        x,
        y: index * nodeSpacing + (Math.random() - 0.5) * 50, // Add slight randomness
      };
    });
  });

  return nodes;
}

/**
 * Filters graph data based on criteria
 */
export function filterGraphData({ nodes, edges }: GraphData, filters: GraphFilters = {}): GraphData {
  let filteredNodes = nodes;

  // Filter by node types
  if (filters.nodeTypes && filters.nodeTypes.length > 0) {
    filteredNodes = filteredNodes.filter((node) => filters.nodeTypes!.includes(node.data.type));
  }

  // Filter by severity (for attack nodes)
  if (filters.severities && filters.severities.length > 0) {
    filteredNodes = filteredNodes.filter((node) => {
      if (node.data.type !== 'attack') return true;
      return filters.severities!.includes(node.data.severity);
    });
  }

  // Filter by minimum connections
  if (filters.minConnections) {
    const nodeConnections = new Map<string, number>();

    edges.forEach((edge) => {
      nodeConnections.set(edge.source, (nodeConnections.get(edge.source) || 0) + 1);
      nodeConnections.set(edge.target, (nodeConnections.get(edge.target) || 0) + 1);
    });

    filteredNodes = filteredNodes.filter(
      (node) => (nodeConnections.get(node.id) || 0) >= filters.minConnections!
    );
  }

  // Get IDs of filtered nodes
  const nodeIds = new Set(filteredNodes.map((node) => node.id));

  // Filter edges to only connect filtered nodes
  const filteredEdges = edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );

  return { nodes: filteredNodes, edges: filteredEdges };
}

/**
 * Calculates graph statistics
 */
export function calculateGraphStats({ nodes, edges }: GraphData): GraphStatsResult {
  const nodesByType: Record<string, number> = {};
  nodes.forEach((node) => {
    const type = node.data.type;
    nodesByType[type] = (nodesByType[type] || 0) + 1;
  });

  // Calculate node degrees (number of connections)
  const nodeDegrees = new Map<string, number>();
  edges.forEach((edge) => {
    nodeDegrees.set(edge.source, (nodeDegrees.get(edge.source) || 0) + 1);
    nodeDegrees.set(edge.target, (nodeDegrees.get(edge.target) || 0) + 1);
  });

  // Find most connected nodes
  const mostConnected = Array.from(nodeDegrees.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nodeId, degree]) => {
      const node = nodes.find((n) => n.id === nodeId);
      return { node: node!.data.label, connections: degree };
    });

  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    nodesByType,
    mostConnected,
    avgDegree: edges.length > 0 ? (edges.length * 2) / nodes.length : 0,
  };
}
