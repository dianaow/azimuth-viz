// @ts-nocheck
import * as d3 from 'd3';

export default function SteamGraph({
  data, // Array of objects with datetime and categories
  id,
  width = 800,
  height = 400,
  margin = { top: 20, right: 20, bottom: 30, left: 50 },
  colorScheme = d3.schemeDark2 // Color scheme for categories
}) {
  // Ensure dates are parsed to Date objects if necessary
  data.forEach(d => {
    d.date = new Date(d.date);
  });

  data.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Define the x-axis scale (time scale)
  const x = d3.scaleTime()
    //.domain(d3.extent(data, d => d.date)) // Extent of the datetime values
    .domain([new Date(2024, 1, 1), new Date(2024, 10, 31)])
    .range([margin.left, width - margin.right]);

  // Define the y-axis scale (linear scale for stacking)
  const stack = d3.stack()
    .keys(Object.keys(data[0]).filter(k => k !== 'date')) // Stack by artist names
    .offset(d3.stackOffsetSilhouette); // Steamgraph requires wiggle offset

  const series = stack(data); // Generate the stack data

  const y = d3.scaleLinear()
    //.domain([d3.min(series, layer => d3.min(layer, d => d[0])),d3.max(series, layer => d3.max(layer, d => d[1]))])
    .domain([-40, 40])
    .range([height - margin.bottom, margin.top]);

  // Define the color scale based on artist names
  const color = d3.scaleOrdinal()
    .domain(series.map(s => s.key)) // Categories (artist names)
    .range(colorScheme);

  // Create the area generator function
  const area = d3.area()
    .x(d => x(d.data.date))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]))
    .curve(d3.curveBasis);

  // Select the SVG element and set its width/height
  const svg = d3.select(id).append("svg")
    .attr("width", width)
    .attr("height", height);

  // JOIN pattern for paths (steamgraph layers)
  const paths = svg.selectAll("path")
    .data(series, d => d.key); // Use key for JOIN

  // Enter + Update
  paths.enter().append("path")
    .merge(paths) // Merge enter and update selections
    .attr("fill", d => color(d.key))
    .attr("d", area);

  // Remove old paths
  paths.exit().remove();

  // Add x-axis
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  // Add y-axis
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
}
