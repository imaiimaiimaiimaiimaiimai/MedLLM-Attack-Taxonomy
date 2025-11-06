import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useFilterStore } from '../../store/filterStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export default function AttackHeatmap() {
  const svgRef = useRef();
  const { filteredAttacks } = useFilterStore();

  useEffect(() => {
    if (!filteredAttacks || filteredAttacks.length === 0) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    // Get top modalities and attack types
    const modalityCounts = {};
    const attackTypeCounts = {};

    filteredAttacks.forEach(attack => {
      attack.modalities?.forEach(mod => {
        modalityCounts[mod] = (modalityCounts[mod] || 0) + 1;
      });
      attack.attackTypes?.forEach(type => {
        attackTypeCounts[type] = (attackTypeCounts[type] || 0) + 1;
      });
    });

    // Get top 8 of each
    const topModalities = Object.entries(modalityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name]) => name);

    const topAttackTypes = Object.entries(attackTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name]) => name);

    if (topModalities.length === 0 || topAttackTypes.length === 0) return;

    // Build heatmap data matrix
    const matrix = [];
    topModalities.forEach(modality => {
      topAttackTypes.forEach(attackType => {
        const count = filteredAttacks.filter(attack =>
          attack.modalities?.includes(modality) && attack.attackTypes?.includes(attackType)
        ).length;

        matrix.push({
          modality,
          attackType,
          count
        });
      });
    });

    // Dimensions
    const margin = { top: 100, right: 40, bottom: 40, left: 150 };
    const cellWidth = 60;
    const cellHeight = 40;
    const width = topAttackTypes.length * cellWidth + margin.left + margin.right;
    const height = topModalities.length * cellHeight + margin.top + margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Color scale
    const maxCount = d3.max(matrix, d => d.count) || 1;
    const colorScale = d3.scaleSequential()
      .domain([0, maxCount])
      .interpolator(d3.interpolateBlues);

    // X scale (attack types)
    const xScale = d3.scaleBand()
      .domain(topAttackTypes)
      .range([0, topAttackTypes.length * cellWidth])
      .padding(0.05);

    // Y scale (modalities)
    const yScale = d3.scaleBand()
      .domain(topModalities)
      .range([0, topModalities.length * cellHeight])
      .padding(0.05);

    // Draw cells
    svg.selectAll('.cell')
      .data(matrix)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(d.attackType))
      .attr('y', d => yScale(d.modality))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => d.count === 0 ? '#f1f5f9' : colorScale(d.count))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .append('title')
      .text(d => `${d.modality} × ${d.attackType}\nCount: ${d.count}`);

    // Add count labels
    svg.selectAll('.label')
      .data(matrix)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.attackType) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.modality) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', d => d.count > maxCount / 2 ? '#fff' : '#1e293b')
      .text(d => d.count > 0 ? d.count : '');

    // X axis (attack types)
    svg.append('g')
      .selectAll('text')
      .data(topAttackTypes)
      .enter()
      .append('text')
      .attr('x', d => xScale(d) + xScale.bandwidth() / 2)
      .attr('y', -10)
      .attr('text-anchor', 'end')
      .attr('transform', d => `rotate(-45, ${xScale(d) + xScale.bandwidth() / 2}, -10)`)
      .attr('font-size', '11px')
      .attr('fill', '#1e293b')
      .text(d => d.length > 15 ? d.substring(0, 15) + '...' : d);

    // Y axis (modalities)
    svg.append('g')
      .selectAll('text')
      .data(topModalities)
      .enter()
      .append('text')
      .attr('x', -10)
      .attr('y', d => yScale(d) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#1e293b')
      .text(d => d);

    // Add axis labels
    svg.append('text')
      .attr('x', (topAttackTypes.length * cellWidth) / 2)
      .attr('y', -60)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1e293b')
      .text('Attack Type');

    svg.append('text')
      .attr('x', -(topModalities.length * cellHeight) / 2)
      .attr('y', -130)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1e293b')
      .attr('transform', `rotate(-90, ${-(topModalities.length * cellHeight) / 2}, -130)`)
      .text('Modality');

  }, [filteredAttacks]);

  if (filteredAttacks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attack Heatmap</CardTitle>
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
        <CardTitle>Attack Heatmap: Modality × Attack Type</CardTitle>
        <p className="text-sm text-muted-foreground">
          Shows the frequency of attack types across different modalities
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
