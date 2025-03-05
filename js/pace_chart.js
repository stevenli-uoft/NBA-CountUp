// Pace Chart (Average Points Per Game Over Time)
function createPaceChart() {
    if (nbaData.length === 0) {
        console.log("Data not yet loaded for Pace chart");
        return;
    }

    // Define the chart dimensions and margins
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = document.getElementById('pace-chart').clientWidth - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    // Process data for the visualization
    // Group data by season
    const seasonData = groupDataBySeason(nbaData);

    // Calculate averages per season
    const seasonAverages = calculateSeasonAverages(seasonData);

    // Create SVG
    const svg = d3.select("#pace-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Define x scale (seasons)
    const xScale = d3.scaleLinear()
        .domain(d3.extent(seasonAverages, d => d.season))
        .range([0, width]);

    // Define y scale (points)
    const yScale = d3.scaleLinear()
        .domain([60, d3.max(seasonAverages, d => d.avgTotalPoints) * 1.05])
        .range([height, 0]);

    // Define line generator
    const line = d3.line()
        .x(d => xScale(d.season))
        .y(d => yScale(d.avgTotalPoints))
        .curve(d3.curveMonotoneX);

    // Add x-axis
    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    // Add y-axis
    svg.append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(yScale));

    // Add the line
    svg.append("path")
        .datum(seasonAverages)
        .attr("class", "line line-pace")
        .attr("d", line);

    // Add data points
    svg.selectAll(".dot")
        .data(seasonAverages)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.season))
        .attr("cy", d => yScale(d.avgTotalPoints))
        .attr("r", 4)
        .style("fill", "#ED174C") // NBA red
        .style("opacity", 0.7);

    // Add chart title
    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Average Points Scored Per Game Over Time");

    // Add x-axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Season");

    // Add y-axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("Average Points Per Game");
}
