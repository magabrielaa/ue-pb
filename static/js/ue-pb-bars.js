/*
 * REUSABLE CHART COMPONENT
 * 
 * Expects to be passed a d3 selection of a div to create a chart in.
 * Expects data formatted as follows:
 *  ...
 *  ...
 *  ...
 */
function pbUtilityBars() {
    // declare global variables
    // this should include hardcoded constants used across multiple inner functions
    // as well as settings variables with getter/setter functions
    var div,
        svg,
        chartWrapper,
        xAxis,
        // useData,
        xScale,
        yScale,
        band,
        refEdge = "center",
        xDomain, 
        drag = d3.drag(),
        posObj = {"left": {}, "right": {}, "center": {}}, 
        dragMode, //FOR NOW
        tooltip;//,
        // bars;

    const svgWidth = 860,
        svgHeight = 460,
        margin = { top: 30, right: 30, bottom: 30, left: 30 },
        width = svgWidth - margin.left - margin.right,
        height = svgHeight - margin.top - margin.bottom;


    // constructor function 
    // no need to change this
    function chart(selection) {
        this.selection = selection
        var that = this;
        selection.each(function(data, i) {
            init(data, that);
        })
    }
    
    // initialize the chart
    // this is the first rendering when the component mounts
    function init(data, that) {
        // assign selection and data to global variable
        div = that.selection;
        useData = data;

        

        // D3 code to render the chart for the first time
        // this should include any legends or fiducial markings that will 
        // not need to be rerended upon interactions
        // this might also include certain event listeners that need to be set up
        // from the first render
        // Chart & svg setup
        svg = div.append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);
        chartWrapper = svg.append("g") 
            .attr("id" , "elicitData") // binds #elicitData to the bars
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .call(drag);

        //tooltip/warning init
        tooltip = d3.select("body").append("div") 
            .attr("class", "tooltip")
            .style("opacity", 0);

        // if we need to reshape the input data, do it here and store in a global variable
        setXDomain();
        console.log(xDomain)
        
        // set up scales and axes once data is ready 
        updateScaleX();
        // yScale fixed
        yScale = d3.scaleLinear() 
            .domain([-0.2,10]) //Change to max dollar amount for PB
            .range([height,0]); 

        // render bars and axes for first time
        let bars = chartWrapper.selectAll("rect")
            .data(data) 
            .join("rect")
            .attr("x", (d) => xScale(d.Thing))
            .attr("y", (d) => yScale(d.elicit)) 
            .attr("height", (d) => yScale(-0.2) - yScale(d.elicit))
            .attr("width", xScale.bandwidth());
        bars.attr("fill", "steelblue")
            .on("mouseover", onMouse) //This might be the issue with grabbbing cursor style
            .on("mouseout", offMouse);
        xAxis = svg.append('g')
            .attr("transform", `translate(${margin.left}, ${height + margin.top})`)
            .call(d3.axisBottom(xScale));
        svg.append('g')
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .call(d3.axisLeft(yScale));

        //Establishing current position for the posObj (requires domain and scales)
        currentPos(); 

        // call the external-facing render function
        chart.render();
    }
    
    // this code will re-run each time the chart changes in response to user interactions
    chart.render = function() { 
        // defer rendering until elements from init created
        var domRendered = $.Deferred();

        // wait until the DOM is ready so that elements exist
        $.when(domRendered).done(function () {
            // D3 code to update the chart
            // here you want the code that will update the chart during drag events

            //update xScale
            // updateScaleX()
            xAxis.transition(50)
                .call(d3.axisBottom(xScale))

            d3.select("#elicitData")
                .selectAll("rect")
                //.data(data)
                //.join("rect") //Allows for replacement/real time changes
                .transition() //Different transitions for drag events?
                .attr("x", (d) => xScale(d.Thing)) // doesnt this need to be updating?
                .attr("y", (d) => yScale(d.elicit))
                .attr("height", (d) => yScale(-0.2) - yScale(d.elicit)) 
                .attr("width", xScale.bandwidth());

             // Updates budget Remaining
            d3.select("#budget")
                .data(getRemaining())
                .join("text")
                .text((d) => `Budget Remaining: $` + d )
                .style("font-size", "1.5em") 


            
            // may need to bind some event listeners to DOM elements here
            setDragEvents();
            
        });

        // now allow inner html for dynamically created elements to render 
        domRendered.resolve();
    }


    // helper functions to handle data manipulations and scaling
    function setXDomain() {
        xDomain = data.map((d) => d.Thing) 
    }

    function updateScaleX() {
        xScale = d3.scaleBand()
            .domain(xDomain) 
            .range([0,width])
            .padding(0.2);
    }

    function currentPos() {
        // iterate through xDomain computing bin midpoints
        for (let i = 0; i < xDomain.length; i++) {
            let item = xDomain[i],
                leftEdge = xScale(item),
                rightEdge = leftEdge + xScale.bandwidth(),
                midpoint = (leftEdge + rightEdge) / 2.0;
            
            posObj["left"][item] = leftEdge;
            posObj["right"][item] = rightEdge;
            posObj["center"][item] = midpoint;
        }
    };

    function overwritePos(item, pos) {
        // overwrite all reference points for the bar we are dragging
        // effectively giving it a point location in the chartWrapper
        // rather than reference points for left, right, and center
        posObj["left"][item] = pos;  
        posObj["right"][item] = pos; 
        posObj["center"][item] = pos;
    }
    
    function setDragEvents() {
        if (dragMode == "allocate") {
            drag.on("start", dragStart)
                .on("drag", dragging)
                .on("end", dragEnd)
        } else if (dragMode == "rank") {
            drag.on("start", rankStart)
                .on("drag", dragRank)
                .on("end", rankEnd);
        }
    }
    
    // Drag Functionality // adapted from https://observablehq.com/@d3/circle-dragging-i and https://observablehq.com/@duitel/you-draw-it-bar-chart
    function clamp(a,b,c) { return Math.max(a, (Math.min(b, c))) }; //This clamp function is used to find the elicited value and assure it is in between bounds

    // //Helpers for Budget remaining/ Halting
    function sum(array) {
        const arr = array
        const total = array.reduce( (a, b) => a + b, 0 );
        return total
    };

    function elicitArray() { //grabs the elicit array value
        var arr = []
        for (let i in [0,1,2,3]) { 
            arr.push(data[i].elicit)
        }
        return arr
    }

    function getRemaining() {
        let remain = [yScale.domain()[1] - sum(elicitArray())]
        return remain
    }

    function dragStart(event, d) {  
        /////CHANGE MOUSE CURSOR in these functions
        
    };
    //want grabbing 
    function dragging(event, d) { 
       
        //constants needed to solve for scaled Y value
        let mousePos = d3.pointer(event, this), 
            xBand = clamp(0, data.length, Math.floor(mousePos[0]/xScale.step()))
            xVal = xDomain[xBand]
            yVal = clamp(0, yScale.domain()[1], Math.floor(yScale.invert(mousePos[1]))); //Finds scaled Y value 
            
        
        //Halting Funciton and Checks
        if (getRemaining() > 0 || (getRemaining() <=0 && yVal < data[xBand].elicit)) {

            data.find((d) => d.Thing == xVal).elicit = yVal;

            drag.on("drag", dragging)
            tooltip.transition()
                .duration(100)
                .style("opacity",0)
        } else if (getRemaining() <=0) {

            tooltip.transition()
                .duration(100)
                .style("opacity",0.9);

            tooltip.html("You have run out of money") //position of warning tooltip, can/will move
                .data(data)
                .style("left", width/2 +"px")
                .style("top",  svgHeight+10 +"px"); 

        }; //maybe need an else here

        chart.render()
    };

    function dragEnd(event, d) { //Nothing yet, just here as a placeholder
        
    };
    
    //Ranking drag functions:
    function rankStart(event, d) {
        let xPos = (d3.pointer(event, this)[0]);
        band = Math.floor(xPos/xScale.step()); //MAYBE CLAMP FOR THE EDGES clamp(0, data.length, _____)
        overwritePos(xDomain[band], xPos);

        console.log("start", posObj)
        console.log(xDomain)
    };
    function dragRank(event, d) {
        let xPos = (d3.pointer(event, this)[0]),
            posDiff = xPos - posObj[refEdge][xDomain[band]];
        refEdge = posDiff > 0.1      // the reference edge is the point on the
                    ? "left"         // bar we need to make it past before reordering
                    : posDiff < -0.1
                        ? "right"
                        : refEdge;
        // console.log(refEdge);
        overwritePos(xDomain[band], xPos);
        xDomain.sort((a, b) => posObj[refEdge][a] - posObj[refEdge][b]); 
        xScale.domain(xDomain); 
        //console.log(xDomain)
        chart.render();
    };
    function rankEnd(event, d) {
        
        refEdge = "center";
        currentPos();

        console.log(xScale.domain())
        console.log("end", posObj)
        chart.render();
        
    };




    function onMouse(event, d) {
        d3.select(this).attr("stroke", "black")
        .attr("cursor", "grab")
    }
    function offMouse(event, d) {
        d3.select(this).attr("stroke", null)
    }
    function grabbing(event, d) {
        d3.select(this).attr("cursor", "grabbing")
        
    };
    
    // getter and setter functions
    // these are external-facing
    // there should be one for each global variable that we might need to
    // get the value of or set from outside the chart component
    // think of these as controls or settings we want an interface for
    chart.dragMode = function(_) {
        if (!arguments.length) return dragMode;
        dragMode = _;
        
        return chart;
    };

    chart.budget = function(_) {
        if (!arguments.length) return yScale.domain()[1];
        yScale.domain()[1] = _; // this might not work; might need a helper function to set yScale domain
        return chart;
    };

    

    return chart;
}