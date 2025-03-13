// Pace Chart (Average Points Per Game Over Time)
function createPaceChart(filteredData) {
    // If filtered data is provided, use it; otherwise use all data
    const dataToUse = filteredData || nbaData;
    // NBA color theme constants
    const nbaBlue = "#006BB6";
    const nbaRed = "#E71836";
    const nbaDarkBlue = "#17408B";
    const nbaLightBlue = "#8ec3ff";

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
    const seasonData = groupDataBySeason(dataToUse);

    // Calculate averages per season
    const seasonAverages = calculateSeasonAverages(seasonData);

    // Clear existing SVG if any
    d3.select("#pace-chart").html("");

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
        .domain([80, d3.max(seasonAverages, d => d.avgTotalPoints) * 1.05])
        .range([height, 0]);

    // Add x-axis with rotated text labels
    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)")
        .style("font-size", "11px");

    // Add y-axis with improved styling
    svg.append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(yScale))
        .style("font-size", "12px");

    // Define line generator
    const line = d3.line()
        .x(d => xScale(d.season))
        .y(d => yScale(d.avgTotalPoints))
        .curve(d3.curveMonotoneX);

    // Create tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)")
        .style("pointer-events", "none")
        .style("font-size", "12px");

    // Calculate gradient for area fill - make it more prominent
    svg.append("linearGradient")
        .attr("id", "pace-area-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", yScale(80))
        .attr("x2", 0).attr("y2", yScale(240))
        .selectAll("stop")
        .data([
            {offset: "0%", color: "rgba(231, 24, 54, 0.05)"},
            {offset: "100%", color: "rgba(231, 24, 54, 0.3)"}
        ])
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    // Add area under the line for visual emphasis - extend to bottom
    svg.append("path")
        .datum(seasonAverages)
        .attr("fill", "url(#pace-area-gradient)")
        .attr("d", d3.area()
            .x(d => xScale(d.season))
            .y0(height)
            .y1(d => yScale(d.avgTotalPoints))
            .curve(d3.curveMonotoneX)
        );

    // Add the line with enhanced styling
    svg.append("path")
        .datum(seasonAverages)
        .attr("class", "line line-pace")
        .attr("d", line)
        .attr("stroke", nbaRed)
        .attr("stroke-width", 3)
        .attr("fill", "none");

    // Add data points with tooltips (smaller size)
    svg.selectAll(".dot")
        .data(seasonAverages)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.season))
        .attr("cy", d => yScale(d.avgTotalPoints))
        .attr("r", 3)  // Smaller radius
        .style("fill", nbaRed)
        .style("opacity", 0.9)
        .style("stroke", "white")
        .style("stroke-width", 0.5)  // Thinner stroke
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("r", 7)
                .style("opacity", 1);

            tooltip.transition()
                .duration(200)
                .style("opacity", 1);

            tooltip.html(`
                <strong>Season: ${d.season}</strong><br/>
                <strong>Points Per Game: ${d.avgTotalPoints.toFixed(1)}</strong><br/>
                <span>Games: ${d.gameCount}</span>
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("r", 5)
                .style("opacity", 0.9);

            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Title removed as requested

    // Add x-axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .style("fill", "#555")
        .text("Season");

    // Add y-axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .style("fill", "#555")
        .text("Average Points Per Game");

    // Add brush component for time selection with improved styling
    const brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("end", brushed);

    const brushGroup = svg.append("g")
        .attr("class", "brush")
        .call(brush);

    // Style the brush overlay
    brushGroup.select(".overlay")
        .style("cursor", "crosshair");

    // Style the brush selection
    brushGroup.selectAll(".selection")
        .style("fill", "rgba(100, 100, 100, 0.3)")
        .style("stroke", "#666")
        .style("stroke-width", 1);

    // Brush handler function
    function brushed(event) {
        if (!event.selection) return;

        // Convert pixel coordinates to years
        const years = event.selection.map(xScale.invert);
        const startYear = Math.round(years[0]);
        const endYear = Math.round(years[1]);

        // Dispatch the brush event with the selected years
        brushDispatcher.call("brushed", this, {
            selection: [startYear, endYear]
        });
    }

    // Add only Hand-checking Rules and Curry MVP annotations
    const annotations = [
        { year: 2014, text: "Curry MVP Era Begins", y: 40 },
        { year: 2004, text: "Hand-checking Rules", y: 60 }
    ];

    const annotationGroup = svg.append("g")
        .attr("class", "annotations");

    annotations.forEach(anno => {
        // Add vertical line
        annotationGroup.append("line")
            .attr("x1", xScale(anno.year))
            .attr("x2", xScale(anno.year))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "#999")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3");

        // Add text label
        annotationGroup.append("text")
            .attr("x", xScale(anno.year))
            .attr("y", height - 100)
            .attr("text-anchor", "end")
            .attr("transform", `rotate(-90, ${xScale(anno.year)}, ${height - 100})`)
            .attr("font-size", "10px")
            .attr("fill", "#666")
            .text(anno.text);
    });
}