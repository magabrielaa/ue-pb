import * as d3 from 'd3';
/*
 * REUSABLE CHART COMPONENT
 */
export default function table() {
  // declare global variables
  // this should include hardcoded constants used across multiple inner functions
  // as well as settings variables with getter/setter functions
  var div,
    threshold = 0.8,
    attribute,
    ward1,
    ward2,
    columns,
    minPop,
    maxPop,
    maxPart;

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

    let popScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([minPop, maxPop])

    let partScale = d3.scaleSequential(d3.interpolateGreens)
      .domain([0, maxPart])
    
    let table = div.append('table')
      .attr("class", "table");

    let thead = table.append('thead');
    let	tbody = table.append('tbody');

    // append the header row
    thead.append('tr')
      .selectAll('th')
      .data([attribute, ward1, ward2]).enter() 
      .append('th')
      .text(function (d) { return d; })
      .style('border', function (_, i) { return i==1 ? "2.8px solid #7e62c4"
                                      : i==2 ? "2.8px solid #ed963c" 
                                      : "0.5px solid black"}) // trying to apply border to ward number
      .attr('rowspan', function (_, i) { return i == 0 ? 2 : 1})
      .attr('colspan', function (_, i) { return i != 0 ? 2 : 1 });

    thead.append('tr')
      .selectAll('th')
      .data(['Pop', 'Part', 'Pop', 'Part']).enter() // header_row.data().text()
      .append('th')
      .text(function (d) { return d; });

    // create a row for each object in the data
    let rows = tbody.selectAll('tr') 
      .data(data) 
      .enter()
      .append('tr');
    
    // regex for detecting whether we are looking a a population vs participation column
    const rePop = /Pop/;

    // create a cell in each row for each column
    let cells = rows.selectAll('td')
      .data(function (row) {
          return columns.map(function (column) { 
              if (column == columns[0]) { // assumes table variable is always in first position of columns array
                  return {
                      column: column, 
                      value: row[column],
                      fill: 'white',
                      textColor: 'black'
                  };
              } else {
                  let fillColor = rePop.test(column) ? popScale(row[column]) : partScale(row[column]);
                  let fillDarknessIdx = rePop.test(column) ? row[column] / (maxPop - minPop) : row[column] / (maxPart - 0);
                  return {
                      column: column, 
                      value: row[column],
                      fill: fillColor, // chooses and applies a color scale
                      textColor: fillDarknessIdx > threshold ? 'white' : 'black',
                      formatAsPercentage: column.includes('Part') // check if column name includes "Part"
                  };
              }
          });
      })
      .enter()
      .append('td')
      .text(function (d) {
        // Check if the value needs to be formatted as a percentage
        if (d.formatAsPercentage) {
          const formatter = d3.format('.0%');
          return formatter(d.value);
        } else {
          return d.value;
        }
      })
      .style('background-color', function (d) { return d.fill; }) // apply fill color
      .style('color', function (d) { return d.textColor; }); // apply text color


    // call the external-facing render function
    chart.render();
  }

  // this code will re-run each time the chart changes in response to user interactions
  chart.render = function () {
  };

  // helper functions to handle data manipulations and scaling

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

  chart.columns = function (_) {
    if (!arguments.length) return columns;
    columns = _;
    return chart;
  };

  chart.attribute = function (_) {
    if (!arguments.length) return attribute;
    attribute = _;
    return chart;
  };

  chart.ward1 = function (_) {
    if (!arguments.length) return ward1;
    ward1 = _;
    return chart;
  };

  chart.ward2 = function (_) {
    if (!arguments.length) return ward2;
    ward2 = _;
    return chart;
  };

  chart.title = function(_) {
    if (!arguments.length) return title;
    title = _;
    return chart;
};

  chart.minPop = function (_) {
    if (!arguments.length) return minPop;
    minPop = _;
    return chart;
  };

  chart.maxPop = function (_) {
    if (!arguments.length) return maxPop;
    maxPop = _;
    return chart;
  };

  chart.maxPart = function (_) {
    if (!arguments.length) return maxPart;
    maxPart = _;
    return chart;
  };

  return chart;
}