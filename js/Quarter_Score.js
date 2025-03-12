function createQuarterScoreViz() {
    // Set up dimensions
    const width = 800;
    const height = 800;
    const margin = 50;
    const innerRadius = 100;
    const outerRadius = Math.min(width, height) / 2 - margin;

    // Clear previous visualization if any
    d3.select('#quarter-circle').html('');

    // Create container for dropdown
    const container = d3.select('#quarter-circle')
        .style('position', 'relative')
        .style('width', width + 'px')
        .style('height', height + 'px')
        .style('margin', '0 auto');

    // Create dropdown
    const dropdown = container.append('select')
        .attr('class', 'score-filter')
        .style('position', 'absolute')
        .style('top', '10px')
        .style('left', '10px');

    dropdown.selectAll('option')
        .data(['All Points', '3PT Points', 'Paint Points'])
        .enter()
        .append('option')
        .text(d => d)
        .attr('value', d => d);

    // Create SVG
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${width/2},${height/2})`);

    // Create tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', '1px solid #ddd')
        .style('padding', '10px')
        .style('border-radius', '5px')
        .style('pointer-events', 'none');

    function updateVisualization(selectedType) {
        // Process data based on selection
        function processData(data, type) {
            const seasons = d3.group(data, d => d.season);
            const quarterData = [];

            seasons.forEach((games, season) => {
                [1, 2, 3, 4].forEach(quarter => {
                    let quarterPoints = 0;
                    let totalPoints = 0;

                    games.forEach(game => {
                        if (type === '3PT Points') {
                            totalHomePoints =  game.pts_qtr1_home + game.pts_qtr2_home + game.pts_qtr3_home + game.pts_qtr4_home;
                            q1Proportion = game[`pts_qtr${quarter}_home`] / (totalHomePoints);
                            

                            quarterPoints = (game.fg3m_home) * q1Proportion;
                            totalPoints = (game.fg3m_home + game.fg3m_away) * 3;
                        } else if (type === 'Paint Points') {
                            const totalHomePoints = game.pts_qtr1_home + game.pts_qtr2_home + game.pts_qtr3_home + game.pts_qtr4_home;
                            const q1Proportion = game[`pts_qtr${quarter}_home`] / totalHomePoints;
    
                            quarterPoints = game.pts_paint_home * q1Proportion;
                            totalPoints = game.pts_paint_home + game.pts_paint_away;
                        } else {
                            quarterPoints = game[`pts_qtr${quarter}_home`] + game[`pts_qtr${quarter}_away`];
                            totalPoints = game.pts_home + game.pts_away;
                        }
                    });

                    quarterData.push({
                        season: season,
                        quarter: quarter,
                        percentage: quarterPoints / totalPoints || 0
                    });
                });
            });

            return quarterData;
        }

        const data = processData(nbaData, selectedType);
        
        if (data.length === 0) {
            svg.append('text')
                .attr('x', 0)
                .attr('y', 0)
                .attr('text-anchor', 'middle')
                .text('No data available for this selection');
            return;
        }

        // Create scales
        const angleScale = d3.scaleLinear()
            .domain([0, 4])
            .range([0, 2 * Math.PI]);

        const radiusScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.season))
            .range([innerRadius, outerRadius]);

        const colorScale = d3.scaleSequential(d3.interpolateGreens)
            .domain([0, 0.4]);

        // Create arc generator
        const arc = d3.arc()
            .innerRadius(d => radiusScale(d.season))
            .outerRadius(d => radiusScale(d.season + 1))
            .startAngle(d => angleScale(d.quarter - 1))
            .endAngle(d => angleScale(d.quarter));

        // Clear previous paths
        svg.selectAll('.quarter-arc').remove();
        svg.selectAll('.quarter-label').remove();
        svg.selectAll('.season-circle').remove();
        
        // Add season circles for reference
        const seasons = [...new Set(data.map(d => d.season))].sort();
        svg.selectAll('.season-circle')
            .data(seasons)
            .enter()
            .append('circle')
            .attr('class', 'season-circle')
            .attr('r', d => radiusScale(d))
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 0.5)
            .attr('stroke-dasharray', '2,2');
            
        // Add season labels
        svg.selectAll('.season-label')
            .data(seasons.filter((_, i) => i % 5 === 0)) // Show every 5th season to avoid overcrowding
            .enter()
            .append('text')
            .attr('class', 'season-label')
            .attr('x', 0)
            .attr('y', d => -radiusScale(d) - 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .text(d => d);

        // Add quarter arcs
        svg.selectAll('.quarter-arc')
            .data(data)
            .enter()
            .append('path')
            .attr('class', 'quarter-arc')
            .attr('d', arc)
            .style('fill', d => colorScale(d.percentage))
            .style('stroke', '#fff')
            .style('stroke-width', 0.5)
            .on('mouseover', function(event, d) {
                d3.select(this).style('opacity', 0.8);
                tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);
                tooltip.html(`Season: ${d.season}<br/>Quarter: ${d.quarter}<br/>Percentage: ${(d.percentage * 100).toFixed(1)}%`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this).style('opacity', 1);
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });

        // Add quarter labels
        const quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
        const labelRadius = outerRadius + 20;

        svg.selectAll('.quarter-label')
            .data(quarterLabels)
            .enter()
            .append('text')
            .attr('class', 'quarter-label')
            .attr('x', (d, i) => labelRadius * Math.cos(angleScale(i + 0.5) - Math.PI/2))
            .attr('y', (d, i) => labelRadius * Math.sin(angleScale(i + 0.5) - Math.PI/2))
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .text(d => d);
            
        // Add a legend
        const legendData = [0.1, 0.2, 0.3, 0.4];
        const legendWidth = 20;
        const legendHeight = 20;
        
        const legend = svg.append('g')
            .attr('transform', `translate(${-width/2 + 50}, ${-height/2 + 50})`);
            
        legend.selectAll('.legend-item')
            .data(legendData)
            .enter()
            .append('rect')
            .attr('class', 'legend-item')
            .attr('x', 0)
            .attr('y', (d, i) => i * (legendHeight + 5))
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .attr('fill', d => colorScale(d));
            
        legend.selectAll('.legend-text')
            .data(legendData)
            .enter()
            .append('text')
            .attr('class', 'legend-text')
            .attr('x', legendWidth + 5)
            .attr('y', (d, i) => i * (legendHeight + 5) + legendHeight/2)
            .attr('alignment-baseline', 'middle')
            .attr('font-size', '10px')
            .text(d => `${(d * 100).toFixed(0)}%`);
    }

    // Initial visualization
    updateVisualization('All Points');

    // Update on dropdown change
    dropdown.on('change', function() {
        updateVisualization(this.value);
    });
}