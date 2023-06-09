import * as d3 from 'd3';

/* MAP CHART COMPONENT*/

export default function map() {
  // declare global variables
  // this should include hardcoded constants used across multiple inner functions
  // as well as settings variables with getter/setter functions
  var svg,
    div,
    layout = {
      height: 500,
      width: 800,
      margin: {top: 15, right: 30, bottom: 35, left: 40}
    },
    wardsSelected = [
      {ward: '0', color: '#7e62c4'},
      {ward: '0', color: '#ed963c'}
    ];

  // constructor function
  // no need to change this
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

    // set up scales and axes once data is ready

    svg = div.append('svg').attr('viewBox', [0, 0, layout['width'], layout['height']]);

    // Projection
    let projection = d3
      .geoMercator()
      .center([-87.723177, 41.778832])
      .translate([layout['width'] / 2, layout['height'] / 2])
      .scale(100000);

    //Define path generator
    let path = d3.geoPath().projection(projection);

    //Bind data and create one path per GeoJSON feature
    svg
      .selectAll('path')
      .data(data.features)
      .enter()
      .append('path')
      .attr('id', (d) => 'w' + d.properties.ward)
      .attr('d', (d) => path(d))
      .attr('stroke', 'dimgray')
      .attr('fill', 'white');

    projection.fitSize([layout['width'], layout['height']], data);

    // call the external-facing render function
    chart.render();
  }

  // this code will re-run each time the chart changes in response to user interactions
  chart.render = function () {
    //select ward boundary current boundary, give ids to boundaries, attr with id

    // defer rendering until elements from init created
    // var domRendered = $.Deferred();

    // wait until the DOM is ready so that elements exist
    // $.when(domRendered).done(function () {
    // D3 code to update the chart
    // may need to bind some event listeners to DOM elements here

    // First, select all paths and change fill color to white
    svg.selectAll('path').attr('fill', 'white');

    // console.log("Selected wards", wardsSelected)

    wardsSelected.forEach((w) => {
      if (w.ward != '0') {
        d3.select('#' + w.ward).attr('fill', w.color);
      }
    });
    // });

    // now allow inner html for dynamically created elements to render
    // domRendered.resolve();
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

  chart.selectedWard = function (_) {
    if (!arguments.length) return selectedWard;
    selectedWard = _;
    return chart;
  };

  chart.wardSelectionOne = function (_) {
    if (!arguments.length) return wardsSelected[0]['ward'];
    wardsSelected[0]['ward'] = _;
    return chart;
  };

  chart.wardSelectionTwo = function (_) {
    if (!arguments.length) return wardsSelected[1]['ward'];
    wardsSelected[1]['ward'] = _;
    return chart;
  };

  return chart;
}
