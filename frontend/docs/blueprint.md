# **App Name**: FleetView

## Core Features:

- Firestore Real-time Connection: Establish and maintain a real-time connection to Firebase Firestore, listening for updates in the '/fleet/current', '/demand/forecast', and '/metrics/kpis' collections.
- Map Visualization: Render a Mapbox GL map with a dark theme, displaying fleet zones as circular nodes and individual trips as animated arrows, reflecting real-time locations.
- Wait Time Distribution Chart: Generate a real-time histogram of wait times using Recharts, styled with a dark theme, providing insights into service efficiency.
- Trips by Fuel Type Chart: Display a stacked bar chart illustrating the distribution of trips by fuel type (EV vs. ICE) using Recharts in a dark theme, providing insight into fleet energy usage.
- Utilization Over Time Chart: Render a real-time line chart tracking fleet utilization over time, implemented using Recharts and styled with a dark theme, showing trends in resource use.
- Demand Forecast with Uncertainty: Display a demand forecast area chart with uncertainty bands (P50, P90 ranges) using Recharts, adopting a dark theme for enhanced visibility.
- KPI Sidebar: Create a sidebar displaying live KPIs (Requests served, Avg Wait, P90 Wait, EV vs ICE trips, Utilization), ensuring real-time data updates for immediate insights.
- Fleet Table: Render a sortable and filterable table showing the whole fleet, vehicle details, vehicle ID, type, SOC, and status (free/busy/charging) so operators have a birds eye view.

## Style Guidelines:

- Background color: Deep charcoal gray (#121212) for a modern, sophisticated dark theme.
- Primary color: Electric purple (#BE75F7) for interactive elements and key data points. Purple creates a techy but calm look. 
- Accent color: Cyan (#7EE5E5) for secondary interactive elements. It gives more highlights and brings out information in an immersive, clean and readable way.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and 'Inter' (sans-serif) for body text, ensure legibility.
- Use simple, geometric icons with a thin stroke weight, colored in electric purple (#BE75F7) for active states and white (#FFFFFF) for inactive states.
- Employ a modular grid layout with adequate spacing to prevent overcrowding. The map should take center-stage, flanked by the KPIs sidebar and fleet table.
- Use subtle animations for transitions and updates (e.g., data refresh, map movements). Loading states should employ a smooth, continuous animation to indicate activity. CSS transitions on data table edits.