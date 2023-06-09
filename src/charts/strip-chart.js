import * as d3 from 'd3';
/*
 * REUSABLE CHART COMPONENT
 *
 * Expects to be passed a d3 selection of a div to create a chart in.
 * Expects data formatted as follows:
 */
export default function stripChart() {
  // declare global variables
  // this should include hardcoded constants used across multiple inner functions
  // as well as settings variables with getter/setter functions
  var div,
    layout = {
      height: 1000,
      width: 900,
      margin: {top: 85, right: 50, bottom: 300, left: 90}
    },
    h = layout["height"] - layout["margin"]["top"] - layout["margin"]["bottom"],
    w = layout["width"] - layout["margin"]["left"] - layout["margin"]["right"],
    xVar,
    yVar,
    ward,
    chartWrapper,
    title;
    
  // constructor function
  // no need to change this
  let chartSelection;
  function chart(selection) {
    chartSelection = selection;
    selection.each((data, i) => init(data));
  }

  // initialize the chart
  // this is the first rendering when the component mounts
  function init(data) {
    // assign selection to global variable
    div = chartSelection;

    // D3 code to render the chart for the first time
    // this should include any legends or fiducial markings that will
    // not need to be rerended upon interactions
    // this might also include certain event listeners that need to be set up
    // from the first render

    // if we need to reshape the input data, do it here and store in a global variable

    const ward1BorderColor = '#7e62c4'; // Color for ward 1
    const ward2BorderColor = '#ffa500'; // Color for ward 2

    let svg = div
      .append('svg')
      .attr('viewBox', [-layout.margin.left, -layout.margin.top - 60, layout.width, layout.height + layout.margin.top])
      .attr('class', 'strip-svg');

    // Set border color based on the ward value
    if (ward === 'ward1') {
      svg.style('border-color', ward1BorderColor);
    } else if (ward === 'ward2') {
      svg.style('border-color', ward2BorderColor);
    }

    let xScale = d3
      .scaleBand()
      .domain(data.map((d) => d[xVar]))
      .range([120, w])
      .padding(0.1);
      
    let yScale = d3
      .scaleLinear()
      .range([h, 0])
      .domain([0, 1000000])
      .nice();
      
    // AXES
    const xAxis = (g) => g
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(xScale).tickFormat((d) => d))
      .attr('class', 'x-axis')
      .selectAll("text")
      .attr("transform", "rotate(-45)") 
      .style("text-anchor", "end");
    
    const yAxis = (g) => g
      .attr('transform', `translate(${layout["margin"]["left"]}, 0)`) // Move the y-axis to the left based on the left margin
      .call(d3.axisLeft(yScale).ticks().tickFormat(d3.format("~s")))
      .attr('class', 'y-axis');

    svg.append("g") 
      .attr("class", "y-ticks")
      .call(yAxis)
      .selectAll("text")
      .attr('text-anchor', 'end');

    svg.append("g")
        .attr("class", "x-ticks")
        .call(xAxis);
    
    // Chart title
    svg.append("text")
        .attr("x", layout.width/2 - 50)             
        .attr("y", -60)
        .attr("text-anchor", "middle")  
        .attr("class", "chart-title")
        .text(title);

    chartWrapper = svg.append("g")
        .attr("class", "canvas")
        .attr('transform', `translate(${layout["margin"]["left"]}, 0)`);       
    
    // define non-highlighted line specs
	  const normal_width = 1
	  const line_length = 26

    // fill in rect marks for each data point
    chartWrapper.selectAll("rect")
        .data(data) 
        .enter().append("rect")
        .attr("width", line_length)
        .attr("height", normal_width)
        .attr("y", function(d){
          console.log("d[yVar]", typeof(d[yVar]))
          console.log(yScale(d[yVar]))
          return yScale(d[yVar])
        })
        .attr("x", function(d) {
          return xScale(d[xVar]) - line_length / 2 - xScale.bandwidth() / 2;
        })
        
    // Y label
    svg.append("text")
      .attr("class", "y-label")
      .attr("text-anchor", "middle")
      .attr("x", -h / 2) 
      .attr("transform", "rotate(-90)")
      .style("font-size", "28px")
      .text("Allocation ($)");
    
    // X label
    svg.append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")
      .attr("x", w/2 + 8) 
      .attr("y", h + layout.margin.top + 180) 
      .style("font-size", "28px")
      .text("Ballot Options");

  
    // call the external-facing render function
    chart.render();
  }

  // this code will re-run each time the chart changes in response to user interactions
  chart.render = function () {
  };


  // getter and setter functions
  // these are external-facing
  // there should be one for each global variable that we might need to
  // get the value of or set from outside the chart component
  // think of these as controls or settings we want an interface for
  chart.setting = function (_) {
    if (!arguments.length) return setting;
    setting = _;
    return chart;
  };

  chart.xVar = function (_) {
    if (!arguments.length) return xVar;
    xVar = _;
    return chart;
  };

  chart.yVar = function (_) {
    if (!arguments.length) return yVar;
    yVar = _;
    return chart;
  };

  chart.title = function(_) {
    if (!arguments.length) return title;
    title = _;
    return chart;
};

chart.ward = function(_) {
  if (!arguments.length) return ward;
  ward = _;
  return chart;
};

  return chart;
}