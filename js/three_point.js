function createThreePointGraph() {
    // Set up dimensions
    const margin = { top: 60, right: 30, bottom: 60, left: 60 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Clear any existing SVG
    d3.select('#three-point-spiral').selectAll('svg').remove();

    // Create SVG container
    const svg = d3.select('#three-point-spiral')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Process data
    const seasonData = processThreePointAttempts(nbaData);

    // Create scales
    const xScale = d3.scaleBand()
        .domain(seasonData.map(d => d.season))
        .range([0, width])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(seasonData, d => d.attempts) * 1.1])
        .range([height, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale)
        .tickValues(xScale.domain().filter(d => d % 2 === 0)); // Show every other year

    const yAxis = d3.axisLeft(yScale)
        .ticks(10)
        .tickFormat(d3.format(',.0f'));

    // Add X axis
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

    // Add Y axis
    svg.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);

    // Add bars
    const bars = svg.selectAll('.bar')
        .data(seasonData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.season))
        .attr('width', xScale.bandwidth())
        .attr('y', d => yScale(0))
        .attr('height', 0)
        .attr('fill', '#2ecc71')
        .attr('opacity', 0.8);

    // Add animation
    bars.transition()
        .duration(1000)
        .attr('y', d => yScale(d.attempts))
        .attr('height', d => height - yScale(d.attempts));

    // Add value labels on top of bars
    svg.selectAll('.label')
        .data(seasonData)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => xScale(d.season) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.attempts) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('opacity', 0)
        .text(d => d3.format(',.0f')(d.attempts))
        .transition()
        .duration(1000)
        .style('opacity', 1);

    // Add title
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .text('Three-Point Attempts per Season (2000-Present)');

    // Add X axis label
    svg.append('text')
        .attr('class', 'x-label')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .text('Season');

    // Add Y axis label
    svg.append('text')
        .attr('class', 'y-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 20)
        .attr('text-anchor', 'middle')
        .text('Number of Three-Point Attempts');
}

// Helper function to process data
function processThreePointAttempts(data) {
    // Group data by season
    const seasonGroups = d3.group(data, d => d.season);
    
    // Calculate total three-point attempts for each season
    return Array.from(seasonGroups, ([season, games]) => {
        const totalAttempts = d3.sum(games, d => d.fg3a_home + d.fg3a_away);
        return {
            season: season,
            attempts: totalAttempts
        };
    }).sort((a, b) => a.season - b.season);
}
