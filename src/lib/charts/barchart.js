// @ts-nocheck
import * as d3 from 'd3';

export default function BarChart({
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
  const margin = { top: 10, right: 10, bottom: 10, left: 38 };

  const container = d3.select(containerSelector)

  let svg = container.select('svg');
  if (!svg.empty()) {
    svg.remove();
  }

  svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Dynamically create scales based on provided attributes
  //const xDomain = d3.extent(data, d => d[xAttr]);
  //const yDomain = d3.extent(data, d => d[yAttr]);

  const xScale = d3.scaleLinear()
    //.domain(xDomain)
    .domain([0,50])
    .range([margin.left, width - margin.right]);

  const yValues= [...new Set(data.map((d) => d[yAttr]))];
 
  const yScale = d3.scaleBand()
    .domain(yValues)
    .range([height - margin.bottom, margin.top])
    .padding(0.2);

  // const colorScale = d3.scaleOrdinal()
  //   .domain(Object.values(colors))
  //   .range(Object.keys(colors))

  // Add X Axis
  // svg.append("g")
  //   .attr("transform", `translate(0,${height - margin.bottom})`)
  //   .call(d3.axisBottom(xScale).ticks(10).tickSize(5).tickPadding(10))
  //   .call(g => g.select(".domain").remove())
  //   .style("font-size", "12px")
  //   .append("text")
  //   .attr("x", width / 2)
  //   .attr("y", margin.bottom - 30)
  //   .style("text-anchor", "middle")
  //   .style("font-weight", "bold")
  //   .style("fill", "black")
  //   .text(xAxisLabel);

  // Add Y Axis
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale).ticks(5).tickSize(0).tickPadding(10))
    .call(g => g.select(".domain").remove())
    .style("font-size", "10px")
    // .append("text")
    // .attr("transform", "rotate(-90)")
    // .attr("x", -height / 2)
    // .attr("y", -margin.left + 30)
    // .style("text-anchor", "middle")
    // .style("font-weight", "bold")
    // .style("fill", "black")
    // .text(yAxisLabel);

  updateLayout(data);

  function updateLayout(data) {
    svg.selectAll(".node-group")
      .data(data, d => d[id])
      .join(
        enter => {
          const groupEnter = enter.append("g")
            .attr("class", "node-group")
            .attr("transform", d => `translate(${xScale(0)}, ${yScale(d[yAttr])})`)
            .style('cursor', 'pointer');

          groupEnter.append("rect")
            .attr('id', d => 'bar-' + d[id])
            .attr('x', 0)
            .attr("width", d => xScale(d[xAttr]))
            .attr("height", yScale.bandwidth())
            //.attr("fill", d => colorScale(d[colorAttr]))
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("fill", "#2563eb")
            .attr("stroke", "none");

          groupEnter.append("text")
            .attr('x', d => xScale(d[xAttr]) + 3)
            .attr('y', yScale.bandwidth()/2)
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "start")
            .style('fill', 'white')
            .style("font-size", "12px")
            .text(d => d[xAttr] + "%");

          return groupEnter;
        },
        update => {
          update
            .transition().duration(300)
            .attr("transform", d => `translate(${xScale(0)}, ${yScale(d[yAttr])})`)

          update.select("bar")
            .attr("id", d => 'bar-' + d[id])
            .attr("width", d => xScale(d[xAttr]))
            .attr("height", yScale.bandwidth())

          update.select("text")
            .attr('x', d => xScale(d[xAttr]))
            .attr('y', yScale.bandwidth()/2)
            .text(d => d[xAttr] + "%");

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