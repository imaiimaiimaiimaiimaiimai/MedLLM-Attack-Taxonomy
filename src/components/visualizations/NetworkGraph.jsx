import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Layers, Filter } from 'lucide-react';
import { useFilterStore } from '../../store/filterStore';
import { buildGraphData, applyGraphLayout, filterGraphData, calculateGraphStats } from '../../utils/graphUtils';

// Custom node component
function CustomNode({ data }) {
  const nodeColors = {
    attack: 'bg-red-100 border-red-400 text-red-900 dark:bg-red-900/30 dark:border-red-600 dark:text-red-100',
    modality: 'bg-blue-100 border-blue-400 text-blue-900 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-100',
    type: 'bg-purple-100 border-purple-400 text-purple-900 dark:bg-purple-900/30 dark:border-purple-600 dark:text-purple-100',
    paper: 'bg-green-100 border-green-400 text-green-900 dark:bg-green-900/30 dark:border-green-600 dark:text-green-100',
    category: 'bg-orange-100 border-orange-400 text-orange-900 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-100',
  };

  const severityColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  };

  return (
    <div className={`px-3 py-2 rounded-lg border-2 shadow-md ${nodeColors[data.type]} min-w-[120px] max-w-[200px]`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold uppercase mb-1 opacity-70">
            {data.type}
          </div>
          <div className="text-sm font-medium truncate" title={data.label}>
            {data.label}
          </div>
          {data.severity && (
            <div className={`mt-1 h-1 rounded ${severityColors[data.severity]}`} />
          )}
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

export default function NetworkGraph() {
  const { filteredAttacks } = useFilterStore();
  const [selectedNodeTypes, setSelectedNodeTypes] = useState(['attack', 'modality', 'type', 'paper', 'category']);
  const [showStats, setShowStats] = useState(true);

  // Build initial graph data
  const rawGraphData = useMemo(() => {
    return buildGraphData(filteredAttacks);
  }, [filteredAttacks]);

  // Apply filters
  const graphData = useMemo(() => {
    return filterGraphData(rawGraphData, {
      nodeTypes: selectedNodeTypes,
    });
  }, [rawGraphData, selectedNodeTypes]);

  // Apply layout
  const layoutedNodes = useMemo(() => {
    return applyGraphLayout([...graphData.nodes], graphData.edges);
  }, [graphData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphData.edges);

  // Calculate stats
  const stats = useMemo(() => {
    return calculateGraphStats(graphData);
  }, [graphData]);

  // Toggle node type visibility
  const toggleNodeType = (type) => {
    setSelectedNodeTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Node type options
  const nodeTypeOptions = [
    { type: 'attack', label: 'Attacks', color: 'bg-red-500' },
    { type: 'modality', label: 'Modalities', color: 'bg-blue-500' },
    { type: 'type', label: 'Attack Types', color: 'bg-purple-500' },
    { type: 'paper', label: 'Papers', color: 'bg-green-500' },
    { type: 'category', label: 'Categories', color: 'bg-orange-500' },
  ];

  if (filteredAttacks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            No attacks to visualize. Try adjusting your filters.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Network Graph Controls
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStats(!showStats)}
            >
              {showStats ? 'Hide' : 'Show'} Stats
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Node Type Filters */}
            <div>
              <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Show Node Types
              </div>
              <div className="flex flex-wrap gap-2">
                {nodeTypeOptions.map(({ type, label, color }) => (
                  <Button
                    key={type}
                    variant={selectedNodeTypes.includes(type) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleNodeType(type)}
                    className="gap-2"
                  >
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    {label}
                    {stats.nodesByType[type] && (
                      <Badge variant="secondary" className="ml-1">
                        {stats.nodesByType[type]}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Stats */}
            {showStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <div className="text-xs text-muted-foreground">Total Nodes</div>
                  <div className="text-2xl font-bold">{stats.totalNodes}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total Edges</div>
                  <div className="text-2xl font-bold">{stats.totalEdges}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Avg Connections</div>
                  <div className="text-2xl font-bold">{stats.avgDegree.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Node Types</div>
                  <div className="text-2xl font-bold">{Object.keys(stats.nodesByType).length}</div>
                </div>
              </div>
            )}

            {/* Most Connected */}
            {showStats && stats.mostConnected.length > 0 && (
              <div className="pt-4 border-t">
                <div className="text-sm font-semibold mb-2">Most Connected Nodes</div>
                <div className="space-y-1">
                  {stats.mostConnected.map(({ node, connections }, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="truncate flex-1">{node}</span>
                      <Badge variant="outline">{connections} connections</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Graph */}
      <Card>
        <CardContent className="p-0">
          <div style={{ height: '600px', width: '100%' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
            >
              <Background />
              <Controls />
              <MiniMap
                nodeStrokeWidth={3}
                zoomable
                pannable
              />
              <Panel position="top-right" className="bg-background/80 backdrop-blur-sm p-3 rounded-lg border shadow-sm">
                <div className="text-xs space-y-1">
                  <div className="font-semibold">Controls:</div>
                  <div>• Drag to pan</div>
                  <div>• Scroll to zoom</div>
                  <div>• Drag nodes to reposition</div>
                  <div>• Click node to focus</div>
                </div>
              </Panel>
            </ReactFlow>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
