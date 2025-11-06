import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useFilterStore } from '../../store/filterStore';
import { Card, CardContent } from '../ui/card';

export default function TaxonomyTreeLanding() {
  const svgRef = useRef();
  const { filteredAttacks } = useFilterStore();

  useEffect(() => {
    if (!filteredAttacks || filteredAttacks.length === 0) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    // Define which categories and items to show on landing page
    const allowedCategories = [
      'Intent Behind Malicious Attack',
      'Contexts and Motivations',
      'Attack Methodologies',
      'Prompt Examples',
      'Image-Based Attacks',
      'Datasets',
      'Motivations Driving Attacks',
      'Vulnerable Medical Application',
      'Vulnerable System Designs',
      'Attack Methodologies (Prompt I',
      'Attack Methodologies (Data/Mod',
      'Data Poisoning (Fine-tuning)',
      'Weight Manipulation',
      'Visual Perturbation (Jailbreak',
      'Visual Grounding Attack',
      'Model Stealing (ADA-STEAL)',
      'Cross-Modal Mismatch Attack'
    ];

    // Build hierarchical data structure with filtered data
    const hierarchyData = {
      name: 'Medical LLM\nAttacks',
      children: []
    };

    // Group by category and filter
    const categoryMap = {};
    filteredAttacks.forEach(attack => {
      // Check if this category or item is in the allowed list
      const isAllowedCategory = allowedCategories.some(allowed =>
        attack.category.includes(allowed) || allowed.includes(attack.category)
      );
      const isAllowedItem = allowedCategories.some(allowed =>
        attack.item.includes(allowed) || allowed.includes(attack.item)
      );

      if (isAllowedCategory || isAllowedItem) {
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
      }
    });

    hierarchyData.children = Object.values(categoryMap);

    // Set up dimensions - larger for landing page with more spacing
    const width = Math.min(1400, window.innerWidth - 100);
    const height = 800;
    const margin = { top: 60, right: 200, bottom: 60, left: 200 };

    // Create SVG with dark background
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', 'hsl(var(--card))')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create tree layout
    const treeLayout = d3.tree()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

    // Create hierarchy
    const root = d3.hierarchy(hierarchyData);
    treeLayout(root);

    // Severity colors with glow
    const severityColor = {
      critical: '#ef4444',
      high: '#f59e0b',
      medium: '#eab308',
    };

    // Add glow filter for glittering effect
    const defs = svg.append('defs');

    // Create multiple glow filters for animation
    for (let i = 0; i < 3; i++) {
      const filter = defs.append('filter')
        .attr('id', `glow-${i}`)
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');

      filter.append('feGaussianBlur')
        .attr('stdDeviation', 3 + i)
        .attr('result', 'coloredBlur');

      const feMerge = filter.append('feMerge');
      feMerge.append('feMergeNode').attr('in', 'coloredBlur');
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    }

    // Draw animated links with gradient
    const linkGroup = svg.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x))
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // Animate links
    linkGroup
      .attr('stroke-dasharray', function() { return this.getTotalLength(); })
      .attr('stroke-dashoffset', function() { return this.getTotalLength(); })
      .transition()
      .duration(2000)
      .attr('stroke-dashoffset', 0);

    // Draw nodes
    const nodes = svg.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    // Add circles with glittering animation - larger sizes for clarity
    nodes.append('circle')
      .attr('r', d => d.depth === 0 ? 14 : d.depth === 1 ? 10 : 7)
      .attr('fill', d => {
        if (d.depth === 0) return '#3b82f6'; // Root - blue
        if (d.depth === 1) return '#8b5cf6'; // Category - purple
        return severityColor[d.data.severity] || '#94a3b8'; // Attack - by severity
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .style('filter', (d, i) => `url(#glow-${i % 3})`)
      .attr('opacity', 0)
      .transition()
      .delay((d, i) => i * 20)
      .duration(800)
      .attr('opacity', 1);

    // Add continuous glittering animation with CSS
    nodes.selectAll('circle')
      .each(function(d, i) {
        const circle = d3.select(this);
        const baseRadius = d.depth === 0 ? 14 : d.depth === 1 ? 10 : 7;

        // Create pulsing animation
        function pulse() {
          circle
            .transition()
            .duration(1500 + Math.random() * 1000)
            .attr('r', baseRadius * 1.2)
            .style('opacity', 0.8)
            .transition()
            .duration(1500 + Math.random() * 1000)
            .attr('r', baseRadius)
            .style('opacity', 1)
            .on('end', pulse);
        }

        // Start pulsing after initial animation
        setTimeout(() => pulse(), 2000 + i * 20);
      });

    // Add sparkle effect
    nodes.each(function(d, i) {
      const node = d3.select(this);

      function addSparkle() {
        if (Math.random() > 0.7) { // 30% chance
          node.append('circle')
            .attr('r', 2)
            .attr('fill', '#fff')
            .attr('opacity', 0)
            .transition()
            .duration(500)
            .attr('r', 8)
            .attr('opacity', 0.8)
            .transition()
            .duration(500)
            .attr('r', 12)
            .attr('opacity', 0)
            .remove();
        }

        setTimeout(addSparkle, 2000 + Math.random() * 3000);
      }

      setTimeout(addSparkle, 3000 + i * 50);
    });

    // Add labels with fade-in - larger text for clarity
    nodes.append('text')
      .attr('dy', '0.31em')
      .attr('x', d => d.children ? -20 : 20)
      .attr('text-anchor', d => d.children ? 'end' : 'start')
      .text(d => {
        const maxLength = d.depth === 0 ? 20 : d.depth === 1 ? 40 : 35;
        const text = d.data.name;
        return text.length > maxLength
          ? text.substring(0, maxLength) + '...'
          : text;
      })
      .attr('font-size', d => d.depth === 0 ? '18px' : d.depth === 1 ? '15px' : '13px')
      .attr('font-weight', d => d.depth === 0 ? 'bold' : d.depth === 1 ? '600' : 'normal')
      .attr('fill', 'hsl(var(--foreground))')
      .style('cursor', 'pointer')
      .attr('opacity', 0)
      .transition()
      .delay((d, i) => i * 20 + 500)
      .duration(800)
      .attr('opacity', 1);

    // Add tooltips
    nodes.append('title')
      .text(d => {
        if (d.depth === 2 && d.data.data) {
          return `${d.data.name}\nSeverity: ${d.data.severity}\nSuccess Rate: ${d.data.successRate !== null ? d.data.successRate.toFixed(1) + '%' : 'N/A'}`;
        }
        return d.data.name;
      });

    // Add hover effects
    nodes.selectAll('circle')
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d => (d.depth === 0 ? 14 : d.depth === 1 ? 10 : 7) * 1.5)
          .style('filter', 'url(#glow-2)');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d => d.depth === 0 ? 14 : d.depth === 1 ? 10 : 7)
          .style('filter', (d, i) => `url(#glow-${i % 3})`);
      });

  }, [filteredAttacks]);

  if (filteredAttacks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-muted-foreground text-center">
            Loading taxonomy tree...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-2">
      <CardContent className="p-0">
        <div className="relative overflow-x-auto">
          <svg ref={svgRef} className="mx-auto"></svg>
        </div>
      </CardContent>
    </Card>
  );
}
