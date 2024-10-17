// @ts-nocheck
import * as d3 from 'd3';

export default function PieChart({
  data,
  width,
  height,
  containerSelector,
  id,
  yValues,
  xAttr,      // Attribute for x-axis
  yAttr,      // Attribute for y-axis
  sizeAttr,  // Attribute for node size
  colorAttr, // Attribute for node color
  size, // Object of keys and values for radius scale
  colors,  // Object of keys and values for color scale
  xAxisLabel,
  yAxisLabel,
  radius
}) {
  const margin = { top: 100, right: 100, bottom: 70, left: 70 };

  const container = d3.select(containerSelector);

  let svg = container.select('svg');
  if (!svg.empty()) {
    svg.remove();
  }

  svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Compute the position of each group on the pie:
  const pie = d3.pie().value(function(d) {return d.value; })
  const data_ready = pie(data)

  // shape helper to build arcs:
  const arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius)

  const colorScale = d3.scaleOrdinal()
    .domain(Object.values(colors))
    .range(Object.keys(colors))

  updateLayout(data_ready);
  
  function updateLayout(data) {
    svg.selectAll(".node-group")
      .data(data, d => d[id])
      .join(
        enter => {
          const groupEnter = enter.append("g")
            .attr("class", "node-group")
            .attr("transform", d => `translate(${width/2}, ${height/2})`)
            .style('cursor', 'pointer');

          groupEnter.append("path")
            .attr('id', d => 'slice-' + d.data.key)
            .attr('d', arcGenerator)
            .attr("fill", d => colorScale(d.data.key))
            .attr('fill-opacity', 0.7)
            .attr("stroke", d => colorScale(d.data.key))
            .attr("stroke-width", "1px");

          groupEnter.append("text")
            .attr('class', 'label')
            .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "middle")
            .style("font-size", "15px")
            .style("fill", "#fff")
            .text(d => d.data.key.split('population_')[1]);

          groupEnter.append("text")
            .attr('class', 'perc')
            .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "middle")
            .attr("dy", "16px")
            .style("font-size", "18px")
            .style("fill", "#fff")
            .text(d => d.data.value + "%");

          return groupEnter;
        },
        update => {
          update
            .transition().duration(300)
            .attr("transform", d => `translate(${width/2}, ${height/2})`)

          update.select("path")
            .attr('id', d => 'slice-' + d.data.key)
            .attr('d', arcGenerator)
            .attr("fill", d => colorScale(d.data.key))
            .attr("stroke", d => colorScale(d.data.key))

          update.select("text.label")
            .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
            .text(d => d.data.key.split('population_')[1]);

          update.select("text.perc")
            .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
            .text(d => d.data.value + "%");

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