// Paint vs. Perimeter Chart
function createPaintPerimeterChart(filteredData) {
    // If filtered data is provided, use it; otherwise use all data
    const dataToUse = filteredData || nbaData;
    // NBA color theme constants
    const nbaBlue = "#006BB6";
    const nbaRed = "#E71836";
    const nbaDarkBlue = "#17408B";
    const nbaLightBlue = "#8ec3ff";

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
    const seasonData = groupDataBySeason(dataToUse);

    // Calculate averages per season
    const seasonAverages = calculateSeasonAverages(seasonData);

    // Clear existing SVG if any
    d3.select("#paint-perimeter-chart").html("");

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

    // Add paint points line with animation
    const paintPath = svg.append("path")
        .datum(seasonAverages)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", nbaRed)
        .attr("stroke-width", 3)
        .attr("d", paintLine);

    // Add three-point scoring line with animation
    const threePointPath = svg.append("path")
        .datum(seasonAverages)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", nbaBlue)
        .attr("stroke-width", 3)
        .attr("d", threePointLine);

    // Add data points for paint scoring with tooltips (smaller size)
    svg.selectAll(".paint-point")
        .data(seasonAverages)
        .enter()
        .append("circle")
        .attr("class", "paint-point")
        .attr("cx", d => xScale(d.season))
        .attr("cy", d => yScale(d.avgPaintPoints))
        .attr("r", 3)  // Smaller radius
        .attr("fill", nbaRed)
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)  // Thinner stroke
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("r", 6)
                .attr("stroke-width", 2);

            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);

            tooltip.html(`
                <strong>Season: ${d.season}</strong><br/>
                <strong>Paint Points: ${d.avgPaintPoints.toFixed(1)}</strong><br/>
                <span>Games: ${d.gameCount}</span>
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("r", 4)
                .attr("stroke-width", 1);

            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add data points for three-point scoring with tooltips (smaller size)
    svg.selectAll(".three-point")
        .data(seasonAverages)
        .enter()
        .append("circle")
        .attr("class", "three-point")
        .attr("cx", d => xScale(d.season))
        .attr("cy", d => yScale(d.avgThreePointScoring))
        .attr("r", 3)
        .attr("fill", nbaBlue)
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("r", 6)
                .attr("stroke-width", 2);

            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);

            tooltip.html(`
                <strong>Season: ${d.season}</strong><br/>
                <strong>3PT Scoring: ${d.avgThreePointScoring.toFixed(1)}</strong><br/>
                <span>Games: ${d.gameCount}</span>
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("r", 4)
                .attr("stroke-width", 1);

            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

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
        .text("Points Per Game");

    // Move legend to the top
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width/2 - 100}, -30)`);

    // Legend background - now horizontal
    legend.append("rect")
        .attr("x", -10)
        .attr("y", -10)
        .attr("width", 220)
        .attr("height", 30)
        .attr("fill", "white")
        .attr("stroke", "#eee")
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("opacity", 0.9);

    // Paint points legend
    legend.append("line")
        .attr("x1", 0)
        .attr("y1", 5)
        .attr("x2", 15)
        .attr("y2", 5)
        .attr("stroke", nbaRed)
        .style("stroke-width", 2);

    legend.append("circle")
        .attr("cx", 7.5)
        .attr("cy", 5)
        .attr("r", 3)
        .attr("fill", nbaRed)
        .attr("stroke", "white")
        .attr("stroke-width", 0.5);

    legend.append("text")
        .attr("x", 20)
        .attr("y", 9)
        .text("Paint Points")
        .style("font-size", "11px")
        .style("fill", "#333");

    // Three-point scoring legend - positioned to the right
    legend.append("line")
        .attr("x1", 110)
        .attr("y1", 5)
        .attr("x2", 125)
        .attr("y2", 5)
        .attr("stroke", nbaBlue)
        .style("stroke-width", 2);

    legend.append("circle")
        .attr("cx", 117.5)
        .attr("cy", 5)
        .attr("r", 3)
        .attr("fill", nbaBlue)
        .attr("stroke", "white")
        .attr("stroke-width", 0.5);

    legend.append("text")
        .attr("x", 130)
        .attr("y", 9)
        .text("3-Point Scoring")
        .style("font-size", "11px")
        .style("fill", "#333");

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