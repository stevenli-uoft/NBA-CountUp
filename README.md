# NBA-CountUp: Evolution of Basketball Visualization

# CSC316H1

An interactive data visualization project exploring the transformation of NBA basketball over the decades, from defensive-focused games to the three-point revolution.

## Project Overview

This visualization project consists of multiple interactive charts that demonstrate the evolution of basketball playing styles, scoring patterns, and game pace in the NBA.

### Features

- **Three-Point Evolution Spiral**: Visualizes the increase in three-point shooting over time
- **Quarter Score Analysis**: Shows scoring patterns across different quarters
- **Paint vs Perimeter Scoring**: Compares inside and outside scoring trends
- **Game Pace Visualization**: Tracks changes in game tempo over seasons

## Live Demo

- **Project Website**: https://stevenli-uoft.github.io/NBA-CountUp/
- **Demo Video**: [video link](https://utoronto-my.sharepoint.com/:v:/g/personal/stevency_li_mail_utoronto_ca/EUjCQarYxsFEoSY7zAZjulwBE-O3VEpcFYc6Y52r28B2bg?e=CwY8Yq)

## Technical Implementation

### Built With
- HTML5
- CSS3
- JavaScript
- D3.js (v7) for data visualization

### Project Structure
```
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Custom styling
├── js/
│   ├── main.js           # Core initialization and shared functionality
│   ├── three_pt_spiral.js    # Three-point visualization
│   ├── Quarter_Score.js      # Quarter scoring analysis
│   ├── paint_perimeter_chart.js  # Paint vs perimeter visualization
│   └── pace_chart.js     # Game pace visualization
├── data/
│   └── nba_evolution_data.csv    # Dataset
└── images/
    └── curry2.png        # Project assets
```

### Interactive Features
- Time-based filtering using brush interactions
- Synchronized updates across all visualizations
- Responsive design for various screen sizes
- Interactive tooltips for detailed information

## Authors
- Mohamed Abdullah
- Steven Li

## Course Information
CSC316 Final Project - 2025
