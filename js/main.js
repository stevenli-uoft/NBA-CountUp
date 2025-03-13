// Global variables
let nbaData = [];
let selectedTimeRange = null; // To store the brush selection range

// Event dispatcher for brush events
const brushDispatcher = d3.dispatch("brushed");

const NBA_COLORS = {
    blue: "#006BB6",
    red: "#E71836",
    darkBlue: "#17408B",
    lightBlue: "#8ec3ff",
    accent: "#C9082A"
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Add loading indicators
    document.querySelectorAll('.visualization').forEach(viz => {
        viz.innerHTML = '<div class="loading">Loading data...</div>';
    });

    // Load the data
    loadData();

    // Add smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add responsive behavior
    window.addEventListener('resize', function() {
        if (nbaData.length > 0) {
            // Debounce resize events
            clearTimeout(window.resizeTimer);
            window.resizeTimer = setTimeout(function() {
                initializeVisualizations();
            }, 250);
        }
    });
});

// Load the NBA data
function loadData() {
    d3.csv("data/nba_evolution_data.csv")
        .then(data => {
            console.log("Data loaded successfully");

            // Process and store the data
            nbaData = processData(data);

            // Remove loading indicators
            document.querySelectorAll('.loading').forEach(loader => {
                loader.remove();
            });

            // Initialize visualizations
            initializeVisualizations();
        })
        .catch(error => {
            console.error("Error loading the data:", error);
            document.querySelectorAll('.visualization').forEach(viz => {
                viz.innerHTML = '<div class="error">Error loading data. Please try again later.</div>';
            });
        });
}

// Process the raw data
function processData(rawData) {
    // Convert string values to numbers for relevant fields
    return rawData.map(d => {
        return {
            game_id: +d.game_id,
            season: +d.season,
            game_date: new Date(d.game_date),
            team_id_home: +d.team_id_home,
            team_id_away: +d.team_id_away,
            pts_home: +d.pts_home,
            pts_away: +d.pts_away,
            fg_pct_home: +d.fg_pct_home,
            fg_pct_away: +d.fg_pct_away,
            fg3m_home: +d.fg3m_home,
            fg3a_home: +d.fg3a_home,
            fg3_pct_home: +d.fg3_pct_home,
            fg3m_away: +d.fg3m_away,
            fg3a_away: +d.fg3a_away,
            fg3_pct_away: +d.fg3_pct_away,
            wl_home: d.wl_home,
            wl_away: d.wl_away,
            season_type: d.season_type,
            pts_qtr1_home: +d.pts_qtr1_home,
            pts_qtr2_home: +d.pts_qtr2_home,
            pts_qtr3_home: +d.pts_qtr3_home,
            pts_qtr4_home: +d.pts_qtr4_home,
            pts_qtr1_away: +d.pts_qtr1_away,
            pts_qtr2_away: +d.pts_qtr2_away,
            pts_qtr3_away: +d.pts_qtr3_away,
            pts_qtr4_away: +d.pts_qtr4_away,
            pts_paint_home: +d.pts_paint_home,
            pts_paint_away: +d.pts_paint_away,
            pts_fb_home: +d.pts_fb_home,
            pts_fb_away: +d.pts_fb_away,
            lead_changes: +d.lead_changes,
            times_tied: +d.times_tied,
            team_name_home: d.team_name_home,
            team_name_away: d.team_name_away
        };
    });
}

// Initialize all visualizations
function initializeVisualizations() {
    createThreePointGraph();
    createQuarterScoreViz();
    createPaintPerimeterChart();
    createPaceChart();

    // Listen for brush events and update all visualizations
    brushDispatcher.on("brushed", function(event) {
        selectedTimeRange = event.selection;
        // Redraw visualizations with the filtered timeframe
        if (selectedTimeRange) {
            updateVisualizations(selectedTimeRange);
        }
    });
}

// Function to update all visualizations with a time filter
function updateVisualizations(timeRange) {
    const [startYear, endYear] = timeRange;

    // Filter data for the selected time range
    const filteredData = nbaData.filter(d => {
        return d.season >= startYear && d.season <= endYear;
    });

    // Only redraw if we have data
    if (filteredData.length > 0) {
        // Don't recreate the pace chart (that's where the brush is)
        // Don't update three-point spiral (it doesn't support filtering)
        // Only update the other visualizations
        createQuarterScoreViz(filteredData);
        createPaintPerimeterChart(filteredData);
    }
}

// Function to group data by season
function groupDataBySeason(data) {
    const seasonGroups = d3.group(data, d => d.season);
    const seasonData = Array.from(seasonGroups, ([season, games]) => {
        return {
            season: season,
            games: games
        };
    });

    return seasonData.sort((a, b) => a.season - b.season);
}

// Function for further data processing
// Such as calculating average points per game for a season
function calculateSeasonAverages(seasonData) {
    return seasonData.map(seasonGroup => {
        const games = seasonGroup.games;
        const gameCount = games.length;

        // Calculate averages
        // Total points (for pace chart)
        const avgPtsHome = d3.mean(games, d => d.pts_home);
        const avgPtsAway = d3.mean(games, d => d.pts_away);
        const avgTotalPoints = avgPtsHome + avgPtsAway;

        // Paint points (for paint vs perimeter chart)
        const avgPaintHome = d3.mean(games, d => d.pts_paint_home || 0);
        const avgPaintAway = d3.mean(games, d => d.pts_paint_away || 0);
        const avgPaintPoints = avgPaintHome + avgPaintAway;

        // 3-point scoring (for paint vs perimeter chart)
        const avgFg3mHome = d3.mean(games, d => d.fg3m_home || 0);
        const avgFg3mAway = d3.mean(games, d => d.fg3m_away || 0);
        const avgThreePointScoring = (3 * avgFg3mHome) + (3 * avgFg3mAway);

        return {
            season: seasonGroup.season,
            avgTotalPoints: avgTotalPoints || 0, // Handle null values
            avgPaintPoints: avgPaintPoints || 0, // Handle null values
            avgThreePointScoring: avgThreePointScoring || 0, // Handle null values
            gameCount: gameCount
        };
    });
}