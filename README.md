# Gene Visualizations

A web application for visualizing and analyzing RNA-seq gene expression data, developed for Dr. Miller's lab at the University of Kentucky.

## 🌐 Live Site

- **Production**: [https://gene-viz-frontend.netlify.app/](https://gene-viz-frontend.netlify.app/)

## 📋 Overview

This application provides interactive visualizations and analysis tools for RNA-seq differential gene expression data, including:

- **Volcano Plots**: Interactive scatter plots showing log2 fold change vs statistical significance
- **Pathway Enrichment Analysis**: KEGG, Reactome, and WikiPathways enrichment results
- **Protein-Protein Interaction Networks**: STRING database integration for network visualization
- **Bar Charts**: Pathway enrichment visualization with statistical metrics
- **Multiple Dataset Comparisons**: Support for various experimental comparisons

## 🛠️ Tech Stack

### Frontend
- **React 18** with **Vite**
- **React Router** for navigation
- **Plotly.js** for interactive charts
- **Cytoscape.js** for network visualizations
- **Highcharts** for additional charting
- **Framer Motion** for animations



## 📁 Project Structure

```
GeneVisualizations/
├── dv-site/                 # Frontend React application
│   ├── src/
│   │   ├── barCharts/       # Bar chart components and data
│   │   ├── graphs/          # Volcano plot components and data
│   │   ├── services/        # API service modules
│   │   ├── visualizeComponents/  # Main visualization components
│   │   └── ...
│   └── backend/            # NestJS backend API
│       ├── src/
│       │   ├── modules/    # Feature modules (datasets, string, enrichment)
│       │   └── config/     # Configuration files
│       └── database/       # Database schemas and migrations
└── README.md
```

## 🔧 Features

- **Interactive Data Visualization**: Explore gene expression data through multiple visualization types
- **Pathway Analysis**: Enrichment analysis across multiple pathway databases
- **Network Analysis**: Protein-protein interaction networks via STRING database
- **Dataset Management**: Support for multiple RNA-seq comparison datasets
- **RESTful API**: Well-documented backend API with Swagger documentation
