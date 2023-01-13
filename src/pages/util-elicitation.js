import * as d3 from 'd3';
import {getState, setState} from '../state';

async function init() {
  // data file setup // THIS IS A PLACEHOLDER
  const keys = ["Street Resurfacing", "Bike Lanes", "School Improvments", "Picnic Tables", "Street Lights", "Food Pantry", "Street Murals", "Curb Cuts"],
    values = ["Street resurfacing is determined by a percentage of the budget. 100% of the budget allows for 16 streets to be resurfaced, while 50% covers resurfacing for 9 streets.",
    "The bike lanes would run with traffic on Maplewood from Montrose to Wilson; with traffic on Campbell from Wilson to Montrose. They would connect with the future Leland Greenway on Campbell. The bike lanes would not impact parking.",
    "A nature play space at Bateman would be a dream come true for the school, parents, and students. Bateman’s community is working collaboratively to design natural play and learning areas for the children. These funds would help make this proposal feasible and allow them to give their students a new and educational play area.",
    "This proposal includes new pool tables with umbrellas as well as picnic tables outside of the California Park pool area, and ADA accessible picnic tables near the softball field to create pleasant gathering spots for all.",
    "This project focuses on improving safety at W. Belmont Ave and N. Narragansett Ave. Turn signals and refreshed crosswalks would dramatically improve the busy intersection!",
    "During the pandemic, neighbors came together to create a food pantry out of a plastic shed at the Drake Garden. This proposal is would fund the creation of permanent structure which will hold food pantry items, serve as a shed for neighbors and volunteers to store tools & supplies, and a fold-out stand to hold small event sales.",
    "In partnership with the Green Star Movement, this mural would go along the South-west side of the school by the main entrance on Lincoln Avenue.",
    "Install curb cuts and crosswalk at 7557 N. Paulina to allow people with strollers or mobility impairments to access the north end of the train station."

  ];

  //dummy data
  let data = keys.map((keys, index) => {
    return {
      Thing: keys,
      Description: values[index],
      elicit: 0
    };
  });
  console.log(data);

  // create instance of chart component
  let pbUtilBars = pbUtilityBars(data);

  // set up chart component, and call
  pbUtilBars.dragMode('allocate'); // initialize in rank mode ////CHANGE THIS TO RANK!!!!!!!!!!!
  d3.select('#utility-elicitation').datum(data).call(pbUtilBars);

  //Temporary switch and different drag
  // make this a callback for toggle input
  document.querySelector('#rank').addEventListener('click', switchDragMode);
  document.querySelector('#allocate').addEventListener('click', switchDragMode);
  // this IS WHERE I AM TESTING THE INSTRUCTION CHANGE

  document.querySelector('#next').addEventListener('click', nextInstructionText);
  //


  function switchDragMode(e) {
    // select the input switch and get current value (that was just clicked)
    let mode = e.value; // this should come from input
    // set dragMode for chart component
    pbUtilBars.dragMode(mode);
  }

//Testing location for the instruction shift on click MAY NEED TO MOVE THIS TO CHART RENDER
let textCount = 0,
  text = "This is the begining message of chart instructions that should change over time";

function increastTextCount(count) {
  return count++
}

function nextInstructionText(textCount) { 
  textCount = textCount++
  // next instructionText for chart component

  pbUtilBars.instructionText(textCount);
};

function switchInstText(num) {
  if (num == 1) {
    text = "This is the First test (RANK)"
  } else if (num == 2) {
    text = "This is the Second Test (ALLOCATE)"  
  };
}


//


  //updating budget remaining at the top
  // do we need a way of triggering this inside of our chart component? maybe it should be a helper funciton inside the component
  function updateBudget() {
    let budget = pbUtilBars.budget();
    d3.select('#budget')
      .text('Budget Remaining: $' + budget)
      .style('font-size', '1.5em');
  }
}

/*
 * REUSABLE CHART COMPONENT
 *
 * Expects to be passed a d3 selection of a div to create a chart in.
 * Expects data formatted as follows:
 *  ...
 *  ...
 *  ...
 */
function pbUtilityBars(data) {
  // declare global variables
  // this should include hardcoded constants used across multiple inner functions
  // as well as settings variables with getter/setter functions
  var div,
    svg,
    chartWrapper,
    instructionBox,
    xAxis,
    // useData,
    xScale,
    yScale,
    band,
    refEdge = 'center',
    xDomain,
    drag = d3.drag(),
    posObj = {left: {}, right: {}, center: {}},
    dragMode = 'allocate', //FOR NOW
    tooltip,
    xVal,
    yVal,
    textCount = 0,
    instructionText = "default";
  // bars;

  const svgWidth = 860,
    svgHeight = 460,
    margin = {top: 30, right: 30, bottom: 30, left: 60},
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom;

  // constructor function
  // no need to change this
  let chartSelection;
  function chart(selection) {
    chartSelection = selection;
    selection.each((el, i) => init(el));
  }

  // initialize the chart
  // this is the first rendering when the component mounts
  function init(selection, that) {
    // assign selection and data to global variable
    div = chartSelection;
    let useData = data;

    // D3 code to render the chart for the first time
    // this should include any legends or fiducial markings that will
    // not need to be rerended upon interactions
    // this might also include certain event listeners that need to be set up
    // from the first render
    // Chart & svg setup
    svg = div.append('svg').attr('width', svgWidth).attr('height', svgHeight);
    chartWrapper = svg
      .append('g')
      .attr('id', 'elicitData') 
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .call(drag);
     instructionBox = svg
      .append('g')
      .attr('id', 'instruction-box')
      .attr('transform', `translate(${svgWidth-300}, ${margin.top})`)


    // tooltip/warning init //////IS THIS BEING OUND TO THE RIGHT SPOT 
    tooltip = d3.select('#utility-elicitation').append('div').attr('class', 'tooltip').style('opacity', 0);

    // if we need to reshape the input data, do it here and store in a global variable
    setXDomain();
    console.log(xDomain);

    // set up scales and axes once data is ready
    updateScaleX();
    // yScale fixed
    yScale = d3
      .scaleLinear()
      //.domain([-0.2, 10]) //Change to max dollar amount for PB
      .domain([-20000, 1000000])
      .range([height, 0]);

    // Append G Element
    // USE BANDWIDTH WIDTH

  

    // render bars and axes for first time  ////////////G element stuff here /////////////////////////////
    let bars = chartWrapper
      .selectAll('rect')
      .data(data)

      .join('rect')
      .attr('x', (d) => xScale(d.Thing))
      .attr('y', (d) => yScale(d.elicit))
      .attr('height', (d) => yScale(-20000) - yScale(d.elicit))
      .attr('width', xScale.bandwidth());
  
    xAxis = svg
      .append('g')
      .attr("class", "xAxis")
      .attr('transform', `translate(${margin.left}, ${height + margin.top})`)
      .call(d3.axisBottom(xScale));

    svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`).call(d3.axisLeft(yScale));

    bars
      .attr('fill', 'steelblue')
      .on('mouseover', onMouse) //This might be the issue with grabbbing cursor style
      .on('mouseout', offMouse);


    // let instructions = instructionBox
    //   .attr('id', 'instructionBox')
      // .selectAll('rect')
      // .data(data)
      // .join('rect')
      // .attr('height', svgHeight/3)
      // .width('width', svgWidth/4)


//Trying to work on xAxis mouseover ////////////////////////////////
    xAxis.selectAll('xAxis.tick')
      .data(data)
      .append("text")
      .on('mouseover', popUpDesc());
      
      function popUpDesc(event, d) {
        d3.select(this)
        console.log(d3.select(xAxis.tick))
        // d3.select(this).attr('stroke', 'black')
        // .data(data)
        // .text((d) => d.Description)
        // console.log("is this working") //NOPE
      }
    
      
      

    //Establishing current position for the posObj (requires domain and scales)
    currentPos(); // does this need to be in chart.render?

    // call the external-facing render function
    chart.render();
  }

  // this code will re-run each time the chart changes in response to user interactions
  chart.render = function () {
    // defer rendering until elements from init created
    // var domRendered = $.Deferred();

    // wait until the DOM is ready so that elements exist
    // $.when(domRendered).done(function () {
    // D3 code to update the chart
    // here you want the code that will update the chart during drag events

    //update xScale
    // updateScaleX()
    xAxis.transition(50).call(d3.axisBottom(xScale));

    d3.select('#elicitData')
      .selectAll('rect')
      //.transition() //What type of transition do we want here?????
      .attr('x', (d) => xScale(d.Thing)) 
      .attr('y', (d) => yScale(d.elicit))
      .attr('height', (d) => yScale(-20000) - yScale(d.elicit))
      .attr('width', xScale.bandwidth());

    // Updates budget Remaining
    console.log(getRemaining())
    d3.select('#budget')
      .data(getRemaining())
      .join('text')
      .text((d) => `Budget Remaining: $${d}`)
      .style('font-size', '1.5em');

    // console.log(nextInstructionText())
    // d3.select('#instruction-box')
    //   .data(nextInstructionText())//Needs to be updating for # of next clicks can create helper functions for that
    //   .join('text')
    //   .text("Instructions:" + d) //For now...
    //   .style('font-size', '1em');


    // may need to bind some event listeners to DOM elements here
    setDragEvents();
    // });

    // now allow inner html for dynamically created elements to render
    // domRendered.resolve();
  };

  // helper functions to handle data manipulations and scaling
  function setXDomain() {
    xDomain = data.map((d) => d.Thing);
  }

  function updateScaleX() {
    xScale = d3.scaleBand().domain(xDomain).range([0, width]).padding(0.2);
  }

  function currentPos() {
    // iterate through xDomain computing bin midpoints
    for (let i = 0; i < xDomain.length; i++) {
      let item = xDomain[i],
        leftEdge = xScale(item),
        rightEdge = leftEdge + xScale.bandwidth(),
        midpoint = (leftEdge + rightEdge) / 2.0;

      posObj['left'][item] = leftEdge;
      posObj['right'][item] = rightEdge;
      posObj['center'][item] = midpoint;
    }
  }

  function overwritePos(item, pos) {
    // overwrite all reference points for the bar we are dragging
    // effectively giving it a point location in the chartWrapper
    // rather than reference points for left, right, and center
    posObj['left'][item] = pos;
    posObj['right'][item] = pos;
    posObj['center'][item] = pos;
  }

  function setDragEvents() {
    if (dragMode == 'allocate') {
      drag.on('start', dragStart)
        .on('drag', dragging)
        .on('end', dragEnd);

    } else if (dragMode == 'rank') {
      drag.on('start', rankStart)
        .on('drag', dragRank)
        .on('end', rankEnd);
    }
  }

  // Drag Functionality // adapted from https://observablehq.com/@d3/circle-dragging-i and https://observablehq.com/@duitel/you-draw-it-bar-chart
  function clamp(a, b, c) {
    return Math.max(a, Math.min(b, c));
  } //This clamp function is used to find the elicited value and assure it is in between bounds

  //MAY WANT TO MOVE:::::
  //THIS IS FOR THE INSTRUCTION BOX

  function nextInstructionText() {
    textCount++ ; 
    let text = "This is the begining message of chart instructions that should change over time"
    
    // set instructionText for chart component
    if (textCount == 1) {
      text = "This is the First test"
    } else if (textCount == 2) {
      text = "This is the Second Test"
    };
   console.log(text)
   return text
  };



  // //Helpers for Budget remaining/ Halting
  function sum(array) {
    const arr = array;
    const total = array.reduce((a, b) => a + b, 0);
    return total;
  }

  function elicitArray() {
    //grabs the elicit array value
    var arr = [];
    for (let i in [0, 1, 2, 3]) {
      arr.push(data[i].elicit);
    }
    return arr;
  }

  function getRemaining() {
    let remain = [yScale.domain()[1] - sum(elicitArray())];
    return remain;
  }

  function dragStart(event, d) {
    /////CHANGE MOUSE CURSOR in these functions
  }
  //want grabbing
  function dragging(event, d) {
    //constants needed to solve for scaled Y value
    let mousePos = d3.pointer(event, this),
      xBand = clamp(0, data.length, Math.floor(mousePos[0] / xScale.step()));
      xVal = data[xBand].Thing, //Finds Name of the band
      yVal = clamp(0, yScale.domain()[1], Math.floor(yScale.invert(mousePos[1]))); //Finds scaled Y value
    console.log(event, d) 
    //Halting Funciton and Checks
    if (getRemaining() > 0 || (getRemaining() <= 0 && yVal < data[xBand].elicit)) {
      data.find((d) => d.Thing == xVal).elicit = yVal;

      drag.on('drag', dragging);
      tooltip.transition()
        .duration(100)
          .style('opacity', 0);
    } else if (getRemaining() <= 0) {
      tooltip.transition()
        .duration(100)
          .style('opacity', 0.9);
      
      tooltip
        .html('You have run out of money') //position of warning tooltip, can/will move
        .data(data)
        //.attr('transform', `translate(${length/2}, ${margin.top})`);
        // .style("left", event.pageX + "px")
        // .style("top", event.pageY + "px")
        .style('left', width / 2 + 'px')
        .style('top', svgHeight + 10 + 'px');
    } //maybe need an else here
    /*
        use a transition
    */
    chart.render();
  }

  function dragEnd(event, d) {
    //Nothing yet, just here as a placeholder
  }

  // //Ranking drag functions:
  // function rankStart(event, d) {
  //   let xPos = d3.pointer(event, this)[0];
  //   band = Math.floor(xPos / xScale.step()); //MAYBE CLAMP FOR THE EDGES
  //   overwritePos(xDomain[band], xPos);

  //   console.log('start', posObj);
  //   console.log(xDomain);
  // }
  // function dragRank(event, d) {
  //   let xPos = d3.pointer(event, this)[0],
  //     posDiff = xPos - posObj[refEdge][xDomain[band]];
  //   refEdge =
  //     posDiff > 0.1 // the reference edge is the point on the
  //       ? 'left' // bar we need to make it past before reordering
  //       : posDiff < -0.1
  //       ? 'right'
  //       : refEdge;
  //   // console.log(refEdge);
  //   overwritePos(xDomain[band], xPos);
  //   xDomain.sort((a, b) => posObj[refEdge][a] - posObj[refEdge][b]);
  //   xScale.domain(xDomain);
  //   //console.log(xDomain)
  //   chart.render();
  // }
  // function rankEnd(event, d) {
  //   refEdge = 'center';
  //   currentPos();

  //   console.log(xScale.domain());
  //   console.log('end', posObj);
  //   chart.render();
  // }

  function onMouse(event, d) {
    d3.select(this).attr('stroke', 'black').attr('cursor', 'grab');
  }
  function offMouse(event, d) {
    d3.select(this).attr('stroke', null);
  }
  function grabbing(event, d) {
    d3.select(this).attr('cursor', 'grabbing');
  }

  // getter and setter functions
  // these are external-facing
  // there should be one for each global variable that we might need to
  // get the value of or set from outside the chart component
  // think of these as controls or settings we want an interface for
  chart.dragMode = function (_) {
    if (!arguments.length) return dragMode;
    dragMode = _;

    return chart;
  };

  chart.budget = function (_) {
    if (!arguments.length) return yScale.domain()[1];
    yScale.domain()[1] = _; // this might not work; might need a helper function to set yScale domain
    return chart;
  };


  chart.instructionText = function (_) {
    if (!arguments.length) return instructionText;
    text = _;



    return chart;
  };

  function switchInstText(num) {
    if (num == 1) {
      text = "This is the First test (RANK)"
    } else if (num == 2) {
      text = "This is the Second Test (ALLOCATE)"  
    };
  }


  return chart;
}
const content =
  /* html */
  `
<div>
    <p id="language">English | Español</p>
    <h1>49th Ward Participatory Budgeting</h1>
    <h2>2022 / 2023 cycle</h2>
    <h3>How were the project proposals selected?</h3>
    <p>
        All listed projects were suggested and vetted by 49th Ward residents. From August to September 2022, 
        community representatives met regularly in committees to determine which project proposals to place on this 
        year’s ballot.
    </p>
    <p class="italic">
        <span id="note">Note:</span> Participation in the 49th Ward participatory budgeting process as a community 
        representative and/or as an attendee  at a neighborhood assembly was entirely voluntary and open to all 49th 
        Ward residents, regardless of citizenship or voter registration.
    </p>

    <p id="budget" style="font-size: 1.5em;">Budget Remaining: $1000000</p>
  
    </div> <div id = "utility-elicitation"> </div>
    

    <!-- may need to bind the switchDragMode event listener here -->
    <p id="chart-option">
        <button name = "mode"  id="rank" class="mode" value = "rank">Rank</button>
        <span id ="separator">|</span> 
        <button name = "mode" id="allocate" class="mode" value = "allocate">Allocate</button>
    </p>
    
    <input class="button" id = "next" type="submit" value="Next" />
    <input class="button" type="submit" value="Submit" />

    <p>Thank you for choosing 4 projects to receive menu money in our Ward!</p>
    <p>
        For transparency purposes, we are running a <span class="bold">short survey</span>. Your information will be 
        anonymized andcannot be traced back to you. Answers will allow us to better understand participation and
        representation in this Participatory Budgeting cycle.
    </p>

    <p>
        All questions are optional. Information will be aggregated and publicly displayed here after voting
        ends on November 30, 2022.
    </p>
    <input class="button" type="submit" value="Continue" />
    <!-- The survey goes here -->
    <input class="button" type="submit" value="Submit" />
    <p>Not every ward votes on the same issues, so we clustered them in the categories below for comparability.</p>
    <p class="feedback-bubble">
        Here’s how your personal budget allocation compares to other Ward residents
    </p>

    <p class="center">Thank you for your inputs!</p>
    <p>
        Please check back on <span class="bold">December 5, 2022</span> to see the Ward’s voting results. If
        you registered your email address, you will receive updates and the final results.
    </p>
</div>
`;

export default {content, script: init};
