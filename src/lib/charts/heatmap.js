// @ts-nocheck
import * as d3 from 'd3';

export default function ScatterPlot({
  data,
  width,
  height,
  containerSelector,
  id,
  xAttr,      // Attribute for x-axis
  yAttr,      // Attribute for y-axis
  sizeAttr,  // Attribute for node size
  colorAttr, // Attribute for node color
  size, // Object of keys and values for radius scale
  colors,  // Object of keys and values for color scale
  xAxisLabel,
  yAxisLabel
}) {
  const margin = { top: 20, right: 20, bottom: 20, left: 100 };

  const container = d3.select(containerSelector);

  let svg = container.select('svg');
  if (!svg.empty()) {
    svg.remove();
  }

  svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const xScale = d3.scaleTime()
    //.domain(d3.extent(data, d => d.date)) // Extent of the datetime values
    .domain([new Date(2024, 6, 1), new Date(2024, 9, 1)])
    .range([margin.left, width - margin.right]);

  const yValues= [...new Set(data.map((d) => d[yAttr]))].reverse();

  const yScale = d3.scaleBand()
    .domain(yValues)
    .range([height - margin.bottom, margin.top])
    .padding(0.15);

  const colorScale = d3.scaleLinear()
    .domain([1, 6])
    .range(['#fce7f3', '#db2777'])

  // Add X Axis
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale)
      .ticks(5)
      .tickSize(0)
      .tickPadding(5)
      .tickFormat( d3.timeFormat("%b"))
    )
    .call(g => g.select(".domain").remove())
    .style("font-size", "10px")

  // Add Y Axis
  svg.append("g")
  .attr("transform", `translate(${margin.left},0)`)
  .call(d3.axisLeft(yScale).tickSize(0).tickPadding(10))
  .call(g => g.select(".domain").remove())
  .style("font-size", "10px")

  updateLayout(data);

  function updateLayout(data) {
    svg.selectAll(".node-group")
      .data(data, d => d[id])
      .join(
        enter => {
          const groupEnter = enter.append("g")
            .attr("class", "node-group")
            .attr("transform", d => `translate(${xScale(d[xAttr])}, ${yScale(d[yAttr])})`)
            .style('cursor', 'pointer');

          groupEnter.append("rect")
            .attr('id', d => 'rect-' + d[id])
            .attr("width", '2.5px')
            .attr("height", yScale.bandwidth())
            .attr("fill", d => d[colorAttr] === 0 ? "none" : colorScale(d[colorAttr]))
            .attr("stroke", "none");

          return groupEnter;
        },
        update => {
          update
            .transition().duration(300)
            .attr("transform", d => `translate(${xScale(d[xAttr])}, ${yScale(d[yAttr])})`)

          update.select("rect")
            .attr("id", d => 'rect-' + d[id])
            .attr("height", yScale.bandwidth())
            .attr("fill", d => d[colorAttr] === 0 ? "none" : olorScale(d[colorAttr]))

          return update;
        },
        exit => {
          exit.remove();
        }
      );
  }

  const eventSubscriptions = {
    nodeClick: null
  };

  // Function to reapply event listeners to nodes
  const reapplyEventListeners = () => {
    if (eventSubscriptions.nodeClick) {
      d3.selectAll('.node-group').on('click', function (event, d) {
        eventSubscriptions.nodeClick({
          clickedNodeData: d,
        });
      });
    }
  };

  return {
    update: (data) => {

      updateLayout(data)

      // Reapply event listeners after layout update
      reapplyEventListeners();
    },
    on: (eventName, callback) => {
      if (eventName === 'nodeClick') {
        eventSubscriptions.nodeClick = callback;
        // Apply the event listener to the current nodes
        reapplyEventListeners();
      }
    }
  };
};