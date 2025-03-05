// Paint vs. Perimeter Chart
function createPaintPerimeterChart() {
    if (nbaData.length === 0) {
        console.log("Data not yet loaded for Paint vs. Perimeter chart");
        return;
    }

    // Define the chart dimensions and margins
    const margin = { top: 40, right: 80, bottom: 60, left: 60 };
    const width = document.getElementById('paint-perimeter-chart').clientWidth - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    // Process data for the visualization
    // Group data by season
    const seasonData = groupDataBySeason(nbaData);

    // Calculate averages per season
    const seasonAverages = calculateSeasonAverages(seasonData);

    // Create SVG
    const svg = d3.select("#paint-perimeter-chart")
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
        .domain([0, d3.max(seasonAverages, d => Math.max(d.avgPaintPoints, d.avgThreePointScoring)) * 1.1])
        .range([height, 0]);

    // Define line generator for paint points
    const paintLine = d3.line()
        .x(d => xScale(d.season))
        .y(d => yScale(d.avgPaintPoints))
        .curve(d3.curveMonotoneX);

    // Define line generator for three-point scoring
    const threePointLine = d3.line()
        .x(d => xScale(d.season))
        .y(d => yScale(d.avgThreePointScoring))
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

    // Add paint points line
    svg.append("path")
        .datum(seasonAverages)
        .attr("class", "line line-paint")
        .attr("d", paintLine);

    // Add three-point scoring line
    svg.append("path")
        .datum(seasonAverages)
        .attr("class", "line line-perimeter")
        .attr("d", threePointLine);

    // Add chart title
    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Paint vs. Perimeter Scoring Over Time");

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
        .text("Points Per Game");

    // Add legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 120}, 0)`);

    // Paint points legend
    legend.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 20)
        .attr("y2", 0)
        .attr("class", "line-paint")
        .style("stroke-width", 3);

    legend.append("text")
        .attr("x", 25)
        .attr("y", 5)
        .text("Paint Points")
        .style("font-size", "12px");

    // Three-point scoring legend
    legend.append("line")
        .attr("x1", 0)
        .attr("y1", 20)
        .attr("x2", 20)
        .attr("y2", 20)
        .attr("class", "line-perimeter")
        .style("stroke-width", 3);

    legend.append("text")
        .attr("x", 25)
        .attr("y", 25)
        .text("3-Point Scoring")
        .style("font-size", "12px");
}