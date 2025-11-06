import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useFilterStore } from '../../store/filterStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export default function TaxonomyTree() {
  const svgRef = useRef();
  const { filteredAttacks, taxonomy } = useFilterStore();

  useEffect(() => {
    if (!filteredAttacks || filteredAttacks.length === 0) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    // Build hierarchical data structure
    const hierarchyData = {
      name: 'Medical LLM Attacks',
      children: []
    };

    // Group by category
    const categoryMap = {};
    filteredAttacks.forEach(attack => {
      if (!categoryMap[attack.category]) {
        categoryMap[attack.category] = {
          name: attack.category,
          children: []
        };
      }
      categoryMap[attack.category].children.push({
        name: attack.item,
        severity: attack.severity,
        successRate: attack.successRate,
        data: attack
      });
    });

    hierarchyData.children = Object.values(categoryMap);

    // Set up dimensions
    const width = 900;
    const height = 600;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create tree layout
    const treeLayout = d3.tree()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

    // Create hierarchy
    const root = d3.hierarchy(hierarchyData);
    treeLayout(root);

    // Severity colors
    const severityColor = {
      critical: '#ef4444',
      high: '#f59e0b',
      medium: '#eab308',
    };

    // Draw links
    svg.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x))
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2);

    // Draw nodes
    const nodes = svg.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    // Add circles
    nodes.append('circle')
      .attr('r', d => d.depth === 0 ? 8 : d.depth === 1 ? 6 : 5)
      .attr('fill', d => {
        if (d.depth === 0) return '#3b82f6'; // Root
        if (d.depth === 1) return '#8b5cf6'; // Category
        return severityColor[d.data.severity] || '#94a3b8'; // Attack
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add labels
    nodes.append('text')
      .attr('dy', '0.31em')
      .attr('x', d => d.children ? -12 : 12)
      .attr('text-anchor', d => d.children ? 'end' : 'start')
      .text(d => {
        // Truncate long names
        const maxLength = d.depth === 0 ? 30 : d.depth === 1 ? 25 : 20;
        return d.data.name.length > maxLength
          ? d.data.name.substring(0, maxLength) + '...'
          : d.data.name;
      })
      .attr('font-size', d => d.depth === 0 ? '14px' : d.depth === 1 ? '12px' : '11px')
      .attr('font-weight', d => d.depth === 0 ? 'bold' : 'normal')
      .attr('fill', '#1e293b')
      .style('cursor', 'pointer');

    // Add tooltips
    nodes.append('title')
      .text(d => {
        if (d.depth === 2 && d.data.data) {
          return `${d.data.name}\nSeverity: ${d.data.severity}\nSuccess Rate: ${d.data.successRate !== null ? d.data.successRate.toFixed(1) + '%' : 'N/A'}`;
        }
        return d.data.name;
      });

  }, [filteredAttacks, taxonomy]);

  if (filteredAttacks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attack Taxonomy Tree</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No data available to display
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attack Taxonomy Tree</CardTitle>
        <p className="text-sm text-muted-foreground">
          Hierarchical view of attacks by category
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg ref={svgRef}></svg>
        </div>
      </CardContent>
    </Card>
  );
}
