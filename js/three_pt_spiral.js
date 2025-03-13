function createThreePointGraph() {
    // Set up dimensions and margins
    const margin = { top: 60, right: 70, bottom: 60, left: 70 };
    const width = 900 - margin.left - margin.right;
    const height = 900 - margin.top - margin.bottom;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Data for the spiral visualization (based on NBA statistics from 2000-2023)
    const spiralData = [
        { season: 2000, totalPointsPerGame: 94.8, proportion3pt: 0.16, threePointPct: 0.35 },
        { season: 2001, totalPointsPerGame: 95.5, proportion3pt: 0.17, threePointPct: 0.35 },
        { season: 2002, totalPointsPerGame: 95.1, proportion3pt: 0.17, threePointPct: 0.35 },
        { season: 2003, totalPointsPerGame: 93.4, proportion3pt: 0.18, threePointPct: 0.34 },
        { season: 2004, totalPointsPerGame: 97.2, proportion3pt: 0.18, threePointPct: 0.35 },
        { season: 2005, totalPointsPerGame: 99.5, proportion3pt: 0.19, threePointPct: 0.36 },
        { season: 2006, totalPointsPerGame: 98.7, proportion3pt: 0.19, threePointPct: 0.36 },
        { season: 2007, totalPointsPerGame: 100.0, proportion3pt: 0.20, threePointPct: 0.36 },
        { season: 2008, totalPointsPerGame: 99.2, proportion3pt: 0.21, threePointPct: 0.36 },
        { season: 2009, totalPointsPerGame: 100.4, proportion3pt: 0.22, threePointPct: 0.36 },
        { season: 2010, totalPointsPerGame: 99.6, proportion3pt: 0.22, threePointPct: 0.36 },
        { season: 2011, totalPointsPerGame: 96.3, proportion3pt: 0.23, threePointPct: 0.35 },
        { season: 2012, totalPointsPerGame: 98.1, proportion3pt: 0.24, threePointPct: 0.36 },
        { season: 2013, totalPointsPerGame: 101.0, proportion3pt: 0.25, threePointPct: 0.36 },
        { season: 2014, totalPointsPerGame: 100.0, proportion3pt: 0.26, threePointPct: 0.35 },
        { season: 2015, totalPointsPerGame: 102.7, proportion3pt: 0.28, threePointPct: 0.35 },
        { season: 2016, totalPointsPerGame: 105.6, proportion3pt: 0.30, threePointPct: 0.36 },
        { season: 2017, totalPointsPerGame: 106.3, proportion3pt: 0.32, threePointPct: 0.36 },
        { season: 2018, totalPointsPerGame: 111.2, proportion3pt: 0.34, threePointPct: 0.36 },
        { season: 2019, totalPointsPerGame: 111.8, proportion3pt: 0.35, threePointPct: 0.36 },
        { season: 2020, totalPointsPerGame: 112.1, proportion3pt: 0.36, threePointPct: 0.37 },
        { season: 2021, totalPointsPerGame: 112.0, proportion3pt: 0.36, threePointPct: 0.36 },
        { season: 2022, totalPointsPerGame: 114.7, proportion3pt: 0.37, threePointPct: 0.36 },
        { season: 2023, totalPointsPerGame: 115.3, proportion3pt: 0.38, threePointPct: 0.37 }
    ];
    
    // Clear any existing SVG
    d3.select("#three-point-spiral").html("");
    
    // Create the SVG container
    const svg = d3.select("#three-point-spiral")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left + centerX}, ${margin.top + centerY})`);
        
    
    // Add background circles for reference
    const radiusScale = d3.scaleLinear()
        .domain([90, 120])  // Range of points per game
        .range([100, 400]);  // Visual radius range - increased for better spacing
    
    const circles = [90, 100, 110, 120];
    
    // Add subtle background
    svg.append("circle")
        .attr("r", radiusScale(120) + 20)
        .attr("fill", "#f8f9fa")
        .attr("stroke", "#eaecef")
        .attr("stroke-width", 1);
    
    // Add concentric circles with improved styling
    svg.selectAll(".reference-circle")
        .data(circles)
        .enter()
        .append("circle")
        .attr("class", "reference-circle")
        .attr("r", d => radiusScale(d))
        .attr("fill", "none")
        .attr("stroke", "#dee2e6")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3");
    
    // Add labels for the circles with improved styling
    svg.selectAll(".circle-label")
        .data(circles)
        .enter()
        .append("text")
        .attr("class", "circle-label")
        .attr("x", 0)
        .attr("y", d => -radiusScale(d) - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "#6c757d")
        .text(d => `${d} pts`);
    
    // Calculate angle for each season
    const startAngle = -Math.PI / 2;  
    const totalAngle = Math.PI * 2;   
    
    const angleScale = d3.scaleLinear()
        .domain([2000, 2023])
        .range([startAngle, startAngle + totalAngle]);
    
    const sizeScale = d3.scaleLinear()
        .domain([0.15, 0.40])  // Range of 3pt proportion
        .range([6, 22]);       // Circle radius range in pixels - slightly larger
    
        
    const colorScale = d3.scaleLinear()
        .domain([0.33, 0.38])  // Range of 3pt percentage
        .range(["#8ec3ff", "#0062cc"]);  // Light blue to better dark blue
    
    // Create a spiral line with the data points
    const lineData = spiralData.map(d => {
        const angle = angleScale(d.season);
        const radius = radiusScale(d.totalPointsPerGame);
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            season: d.season
        };
    });
    
    // Add spiral line with improved styling
    const spiralLine = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveCardinal.tension(0.7)); // Smoother curve
    
    svg.append("path")
        .datum(lineData)
        .attr("class", "spiral-line")
        .attr("fill", "none")
        .attr("stroke", "#adb5bd")
        .attr("stroke-width", 1.5)
        .attr("d", spiralLine);
    
    // Create a group for data points for better organization
    const pointsGroup = svg.append("g")
        .attr("class", "data-points");
    
    // Add data points (circles) with improved styling
    pointsGroup.selectAll(".data-point")
        .data(spiralData)
        .enter()
        .append("circle")
        .attr("class", "data-point")
        .attr("cx", (d) => {
            const angle = angleScale(d.season);
            const radius = radiusScale(d.totalPointsPerGame);
            return Math.cos(angle) * radius;
        })
        .attr("cy", (d) => {
            const angle = angleScale(d.season);
            const radius = radiusScale(d.totalPointsPerGame);
            return Math.sin(angle) * radius;
        })
        .attr("r", d => sizeScale(d.proportion3pt))
        .attr("fill", d => colorScale(d.threePointPct))
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.85)
        .style("filter", "drop-shadow(0px 1px 2px rgba(0,0,0,0.1))")
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            // Enhanced highlight on hover
            d3.select(this)
                .attr("stroke", "#212529")
                .attr("stroke-width", 2)
                .attr("opacity", 1)
                .style("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))");
            
            // Improved tooltip
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.95);
            
            tooltip.html(`
                <div style="font-weight:bold;margin-bottom:4px;font-size:14px;">Season: ${d.season}-${(d.season + 1).toString().slice(2)}</div>
                <div style="display:grid;grid-template-columns:auto auto;gap:4px;font-size:13px;">
                    <div>Points Per Game:</div>
                    <div style="text-align:right;font-weight:500;">${d.totalPointsPerGame.toFixed(1)}</div>
                    <div>3PT Points:</div>
                    <div style="text-align:right;font-weight:500;">${(d.proportion3pt * 100).toFixed(1)}%</div>
                    <div>3PT Percentage:</div>
                    <div style="text-align:right;font-weight:500;">${(d.threePointPct * 100).toFixed(1)}%</div>
                </div>
            `)
                .style("left", (event.pageX + 12) + "px")
                .style("top", (event.pageY - 12) + "px");
        })
        .on("mouseout", function() {
            // Reset on mouseout
            d3.select(this)
                .attr("stroke", "white")
                .attr("stroke-width", 1.5)
                .attr("opacity", 0.85)
                .style("filter", "drop-shadow(0px 1px 2px rgba(0,0,0,0.1))");
            
            // Hide tooltip
            tooltip.transition()
                .duration(400)
                .style("opacity", 0);
        });
    
    // Add selected season labels with improved positioning and styling
    const labelYears = [2000, 2007, 2015, 2020, 2023];
    
    svg.selectAll(".year-label")
        .data(labelYears)
        .enter()
        .append("g")
        .attr("class", "year-label")
        .attr("transform", d => {
            const angle = angleScale(d);
            const radius = radiusScale(spiralData.find(item => item.season === d).totalPointsPerGame);
            // Position just outside the point with more space
            const x = Math.cos(angle) * (radius + 30);
            const y = Math.sin(angle) * (radius + 30);
            return `translate(${x}, ${y})`;
        })
        .each(function(d) {
            const angle = angleScale(d);
            // Create background for better readability
            d3.select(this)
                .append("rect")
                .attr("x", -18)
                .attr("y", -12)
                .attr("width", 36)
                .attr("height", 22)
                .attr("rx", 4)
                .attr("fill", "white")
                .attr("fill-opacity", 0.9)
                .attr("stroke", "#dee2e6")
                .attr("stroke-width", 1);
            
            // Add year text
            d3.select(this)
                .append("text")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("font-size", "13px")
                .attr("font-weight", "bold")
                .attr("font-family", "Arial, sans-serif")
                .attr("fill", "#495057")
                .text(d);
        });
    
    // Add connecting lines from points to labels for clarity
    svg.selectAll(".connector-line")
        .data(labelYears)
        .enter()
        .append("line")
        .attr("class", "connector-line")
        .attr("x1", d => {
            const angle = angleScale(d);
            const radius = radiusScale(spiralData.find(item => item.season === d).totalPointsPerGame);
            return Math.cos(angle) * radius;
        })
        .attr("y1", d => {
            const angle = angleScale(d);
            const radius = radiusScale(spiralData.find(item => item.season === d).totalPointsPerGame);
            return Math.sin(angle) * radius;
        })
        .attr("x2", d => {
            const angle = angleScale(d);
            const radius = radiusScale(spiralData.find(item => item.season === d).totalPointsPerGame);
            // Connect to just before the label
            return Math.cos(angle) * (radius + 25);
        })
        .attr("y2", d => {
            const angle = angleScale(d);
            const radius = radiusScale(spiralData.find(item => item.season === d).totalPointsPerGame);
            return Math.sin(angle) * (radius + 25);
        })
        .attr("stroke", "#adb5bd")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,2");
    
    // Add center dot with improved styling
    svg.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 5)
        .attr("fill", "#495057")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5);
    
    // Create improved tooltip div
    const tooltip = d3.select("#three-point-spiral")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #dee2e6")
        .style("border-radius", "6px")
        .style("padding", "10px")
        .style("box-shadow", "0 2px 8px rgba(0,0,0,0.1)")
        .style("pointer-events", "none")
        .style("font-family", "Arial, sans-serif")
        .style("z-index", "100");


    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${-centerX - 250}, ${-centerY})`);
    
    // Legend background for better readability
    legend.append("rect")
        .attr("x", -15)
        .attr("y", -15)
        .attr("width", 280)
        .attr("height", 150)
        .attr("rx", 8)
        .attr("fill", "white")
        .attr("fill-opacity", 0.9)
        .attr("stroke", "#dee2e6")
        .attr("stroke-width", 1);
    
    // Legend title
    legend.append("text")
        .attr("x", 0)
        .attr("y", 5)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "#212529")
        .text("Three-Point Revolution");
    
    // Legend items with icons for better visual understanding
    const legendItems = [
        { label: "Angular position = Season year", y: 35, icon: "clock" },
        { label: "Distance from center = Points per game", y: 60, icon: "radius" },
        { label: "Circle size = % of points from 3PT", y: 85, icon: "circle" },
        { label: "Color intensity = 3PT make %", y: 110, icon: "color" }
    ];
    
    // Add legend items with icons
    legendItems.forEach(item => {
        const g = legend.append("g")
            .attr("transform", `translate(0, ${item.y})`);
        
        // Add appropriate icon based on type
        if (item.icon === "clock") {
            g.append("circle")
                .attr("cx", 0)
                .attr("cy", -4)
                .attr("r", 8)
                .attr("fill", "none")
                .attr("stroke", "#495057")
                .attr("stroke-width", 1.5);
            
            // Add clock hands
            g.append("line")
                .attr("x1", 0)
                .attr("y1", -4)
                .attr("x2", 0)
                .attr("y2", -8)
                .attr("stroke", "#495057")
                .attr("stroke-width", 1.5);
            
            g.append("line")
                .attr("x1", 0)
                .attr("y1", -4)
                .attr("x2", 4)
                .attr("y2", -4)
                .attr("stroke", "#495057")
                .attr("stroke-width", 1.5);
        } else if (item.icon === "radius") {
            g.append("circle")
                .attr("cx", 0)
                .attr("cy", -4)
                .attr("r", 2)
                .attr("fill", "#495057");
            
            g.append("line")
                .attr("x1", 0)
                .attr("y1", -4)
                .attr("x2", 8)
                .attr("y2", -4)
                .attr("stroke", "#495057")
                .attr("stroke-width", 1.5);
        } else if (item.icon === "circle") {
            g.append("circle")
                .attr("cx", 0)
                .attr("cy", -4)
                .attr("r", 8)
                .attr("fill", "#6c757d")
                .attr("opacity", 0.8);
        } else if (item.icon === "color") {
            // Color gradient
            const gradient = g.append("linearGradient")
                .attr("id", "colorGradient")
                .attr("x1", "0%")
                .attr("x2", "100%");
            
            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", colorScale.range()[0]);
            
            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", colorScale.range()[1]);
            
            g.append("rect")
                .attr("x", -8)
                .attr("y", -8)
                .attr("width", 16)
                .attr("height", 8)
                .attr("fill", "url(#colorGradient)");
        }
        
        // Add text for each item
        g.append("text")
            .attr("x", 20)
            .attr("y", 0)
            .attr("font-size", "12px")
            .attr("font-family", "Arial, sans-serif")
            .attr("fill", "#495057")
            .text(item.label);
    });
}