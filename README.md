# USA vs Spain Quality of Life Comparison

Comparing a variety of data points to identify how each county compares on a scale for quality of life


## Project Architecture

### API Data Processing
```
lib
├── cpi.ts
└── (d) sources
    ├── es.ts
    └── us.ts
```
lib/sources/**es.ts** - Pulls and parses table of monthly index values from INE API

lib.sources/**us.ts** - Pulls and parses table of monthly index values from BLS API

lib/**cpi.ts** - Defines several data points and helper functions, using API data to calculate inflation and build charts


### API Routes

If you need to expose API endpoints for outside users to consume, you can use API routes like app/api/es-cpi/route.ts. For this project, we don't need that.


### UI Components
```
app/ui
├── CPITable.tsx
└── InflationChart.tsx
```
app/ui/**InflationChart.tsx** - Uses ChartPoint from *lib/cpi.ts* to plot CPI data in line charts using recharts library

app/ui/**CPITable.tsx** - Parses InflationRow from *lib/cpi.ts* into tabular display of index, MoM, and YoY

### Page(s) and Styles
```
app
├── favicon.ico
├── globals.css
├── layout.tsx
├── page.tsx
└── (d) ui
```
app/**page.tsx** - 

app/**layout.tsx** - 

app/**globals.css** - 