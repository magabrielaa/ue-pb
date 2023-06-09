import * as d3 from 'd3';
import table from '../charts/table';
import stripChart from '../charts/strip-chart';
import map from '../charts/map';
import {getState, setState} from '../state';

async function initialize() {
  let data = [];

  initialWardData((newData) => {
    data = newData;
  });
  const dropdown1 = document.querySelector('#dropdown-1');
  dropdown1.addEventListener('change', handleDropdown1);
  const dropdown2 = document.querySelector('#dropdown-2');
  dropdown2.addEventListener('change', handleDropdown2);
  stripCharts("29", "35");
}

// Initialize ward numbers
window.wardNumber1 = 'w29';
window.wardNumber2 = 'w35';

function handleDropdown1(e) {
  const wardNumber1 = e.target.value.slice(5, 7);
  window.wardNumber1 = 'w' + wardNumber1;
  updateMap();
  // Get current preselected ward in the second dropdown menu
  const event = document.getElementById("dropdown-2");
  const wardNumber2 = event.options[event.selectedIndex].value.slice(5,7);
  tabulateWards(wardNumber1, wardNumber2);
  stripCharts(wardNumber1, wardNumber2);
}

function handleDropdown2(e) {
  const wardNumber2 = e.target.value.slice(5, 7);
  window.wardNumber2 = 'w' + wardNumber2;
  updateMap();
  // Get current preselected ward in the first dropdown menu
  const event = document.getElementById("dropdown-1");
  const wardNumber1 = event.options[event.selectedIndex].value.slice(5,7);
  tabulateWards(wardNumber1, wardNumber2);
  stripCharts(wardNumber1, wardNumber2);
}

// initialize charts to wards 29 and 35
function initialWardData(cb) {
  d3.json("../../data/table_data_updated.json").then(data => {

    // const ward1Header = document.querySelector("#ward1-header")
    // ward1Header.innerText = "Ward 29";
    // const ward2Header = document.querySelector("#ward2-header")
    // ward2Header.innerText = "Ward 35";

    // Get the max population and participation values
    let minPop = 100
    let maxPop = 0
    let maxPart = 0
  
    for(var attribute in data) {
      let df = data[attribute]
      for (var val in df){
        let obj = df[val]
        for (var inner_val in obj){
          const rePop = /Pop/;
          const rePart = /Part/;
          if (rePop.test(inner_val) === true) {
            if (obj[inner_val] > maxPop) {
              maxPop = obj[inner_val]
            } else if (obj[inner_val] < minPop){
              minPop = obj[inner_val]
            }
          } else if (rePart.test(inner_val) === true){
            if (obj[inner_val] > maxPart){
              maxPart = obj[inner_val]
            }
          }
        }
      }
    }

    const col1 = "Ward 29 Pop"
    const col2 = "Ward 29 Part"
    const col3 = "Ward 35 Pop"
    const col4 = "Ward 35 Part"

    const raceData = data["race"]
    let raceCols = ["Race", col1, col2, col3, col4]

    let raceTable = table();  
      raceTable.columns(raceCols);
      raceTable.attribute("Race");
      raceTable.ward1("Ward 29");
      raceTable.ward2("Ward 35");
      raceTable.minPop(minPop);
      raceTable.maxPop(maxPop);
      raceTable.maxPart(maxPart);
    d3.select("#w2c1")
      .datum(raceData)
      .call(raceTable);

    const incomeData = data["income"]
    let incomeCols = ["Income", col1, col2, col3, col4]
  
    let incomeTable = table();  
      incomeTable.columns(incomeCols);
      incomeTable.attribute("Income");
      incomeTable.ward1("Ward 29");
      incomeTable.ward2("Ward 35");
      incomeTable.minPop(minPop);
      incomeTable.maxPop(maxPop);
      incomeTable.maxPart(maxPart);
    d3.select("#w2c2")
      .datum(incomeData)
      .call(incomeTable);

    const educData = data["educ"]
    let educCols = ["Education", col1, col2, col3, col4]
  
    let educTable = table();  
      educTable.columns(educCols);
      educTable.attribute("Education");
      educTable.ward1("Ward 29");
      educTable.ward2("Ward 35");
      educTable.minPop(minPop);
      educTable.maxPop(maxPop);
      educTable.maxPart(maxPart);
    d3.select("#w2c3")
      .datum(educData)
      .call(educTable);
  });
}

// Make map chart instance a global variable
let chiMap = map(); // this is a promise

// Wrap the required stuff in Promises
const mapRef = new Promise(function (resolve, reject) {
    resolve(chiMap);
});
const data = d3.json("../../data/ward_boundaries.geojson");

// When both of these Promises have resolved, call the chart component, etc.
Promise.all([mapRef, data])
    .then(function (values) {
        let [chiMap, data] = values; //object destructuring

        chiMap.wardSelectionOne(window.wardNumber1)
        chiMap.wardSelectionTwo(window.wardNumber2)

        d3.select("#map-container")
            .datum(data)
            .call(chiMap);
    })
    .catch(function (err) {
        console.log("error", err);
    });

function updateMap(){
        chiMap.wardSelectionOne(window.wardNumber1)
        chiMap.wardSelectionTwo(window.wardNumber2)
        chiMap.render();
}

// Table charts
function tabulateWards(ward1="29", ward2="35") {
  d3.json("../../data/table_data_updated.json").then(data => {

    const raceChart = document.getElementById('w2c1')
    const incomeChart = document.getElementById('w2c2')
    const educChart = document.getElementById('w2c3')

    // Check if HTML selections are empty
    const isRaceChartEmpty  = raceChart.innerHTML === "";
    const isIncomeChartEmpty  = incomeChart.innerHTML === "";
    const isEducChartEmpty = educChart.innerHTML === "";

    // If there is a chart already, remove it
    if (isRaceChartEmpty == false) {
      raceChart.innerHTML = ""
    }

    if (isIncomeChartEmpty == false) {
      incomeChart.innerHTML = ""
    }

    if (isEducChartEmpty == false) {
      educChart.innerHTML = ""
    }

    // Get the max population and participation values
    let minPop = 100
    let maxPop = 0
    let maxPart = 0
  
    for(var attribute in data) {
      let df = data[attribute]
      for (var val in df){
        let obj = df[val]
        for (var inner_val in obj){
          const rePop = /Pop/;
          const rePart = /Part/;
          if (rePop.test(inner_val) === true) {
            if (obj[inner_val] > maxPop) {
              maxPop = obj[inner_val]
            } else if (obj[inner_val] < minPop){
              minPop = obj[inner_val]
            }
          } else if (rePart.test(inner_val) === true){
            if (obj[inner_val] > maxPart){
              maxPart = obj[inner_val]
            }
          }
        }
      }
    }

    // Columns to filter the data by
    const col1 = "Ward " + ward1 + " Pop"
    const col2 = "Ward " + ward1 + " Part"
    const col3 = "Ward " + ward2 + " Pop"
    const col4 = "Ward " + ward2 + " Part"

    const raceData = data["race"]
    let raceCols = ["Race", col1, col2, col3, col4]

    let raceTable = table();  
      raceTable.columns(raceCols);
      raceTable.attribute("Race");
      raceTable.ward1("Ward " + ward1);
      raceTable.ward2("Ward " + ward2);
      raceTable.minPop(minPop);
      raceTable.maxPop(maxPop);
      raceTable.maxPart(maxPart);
    d3.select("#w2c1")
      .datum(raceData)
      .call(raceTable);

    const incomeData = data["income"]
    let incomeCols = ["Income", col1, col2, col3, col4]
  
    let incomeTable = table();  
      incomeTable.columns(incomeCols);
      incomeTable.attribute("Income");
      incomeTable.ward1("Ward " + ward1);
      incomeTable.ward2("Ward " + ward2);
      incomeTable.minPop(minPop);
      incomeTable.maxPop(maxPop);
      incomeTable.maxPart(maxPart);
    d3.select("#w2c2")
      .datum(incomeData)
      .call(incomeTable);

    const educData = data["educ"]
    let educCols = ["Education", col1, col2, col3, col4]
  
    let educTable = table();  
      educTable.columns(educCols);
      educTable.attribute("Education");
      educTable.ward1("Ward " + ward1);
      educTable.ward2("Ward " + ward2);
      educTable.minPop(minPop);
      educTable.maxPop(maxPop);
      educTable.maxPart(maxPart);
    d3.select("#w2c3")
      .datum(educData)
      .call(educTable);

  })
}

// Strip charts
function stripCharts(ward1, ward2) {
  d3.csv("../../data/allocation_simulation.csv").then(data => { 

    data.forEach(d => {
      d.allocation = +d.allocation;
    });

    const filteredDataW1 = data.filter(d => d.ward === ward1);
    const filteredDataW2 = data.filter(d => d.ward === ward2);

    const stripChart1 = document.getElementById('w1c1')
    const stripChart2 = document.getElementById('w1c2')

    // Check if HTML selection ais empty
    const isStripChart1  = stripChart1.innerHTML === "";
    const isStripChart2  = stripChart1.innerHTML === "";

    // If there is a chart already, remove it
    if (isStripChart1 == false) {
      stripChart1.innerHTML = ""
    }

    if (isStripChart2 == false) {
      stripChart2.innerHTML = ""
    }

    let stripChartW1 = stripChart();  
      stripChartW1.xVar("item");
      stripChartW1.yVar("allocation");
      stripChartW1.ward("ward1");
      stripChartW1.title(`Ward ${ward1} Results`);
    d3.select("#w1c1")
      .datum(filteredDataW1)
      .call(stripChartW1);

    let stripChartW2 = stripChart();  
      stripChartW2.xVar("item");
      stripChartW2.yVar("allocation");
      stripChartW2.ward("ward2");
      stripChartW2.title(`Ward ${ward2} Results`);
    d3.select("#w1c2")
      .datum(filteredDataW2)
      .call(stripChartW2);
  })}


const content =
  /* html */
  `
  <p id="language">English | Español</p>
  <h1>49th Ward Participatory Budgeting</h1>
  <h2>2022 / 2023 cycle</h2>
  <p>Voting has concluded for the 2022/2023 Participatory Budgeting cycle.</p>
  <p id="feedback-bubble">
      Explore the projects that received the most votes and the allocations proposed by the residents.
  </p>
  <p id="feedback-bubble-map">
      Here you can compare participation across Wards, relative to each
      Ward’s demographics for the 2022/2023 Participatory Bugeting cycle.
  </p>
  <br>
  <br>
  <label for="wards">Select two wards:</label>
  <select id="dropdown-1" class="dropdown" name="wards" id="ward_number" size="1">
      <option value="Ward 29" selected>Ward 29</option>
      <option value="Ward 35">Ward 35</option>
      <option value="Ward 36">Ward 36</option>
      <option value="Ward 49">Ward 49</option>
  </select>
  <select id="dropdown-2" class="dropdown" name="wards" id="ward_number" size="1">
      <option value="Ward 29">Ward 29</option>
      <option value="Ward 35" selected>Ward 35</option>
      <option value="Ward 36">Ward 36</option>
      <option value="Ward 49">Ward 49</option>
  </select>
  <div id="parent">
      <div id="map-container"></div>
      <div id="charts-container">
          <div id="ward1" class="ward-container">
              <div class="strip-chart" id="w1c1"> </div>
              <div class="strip-chart" id="w1c2"> </div>
          </div>
          <br>
          <div id="ward2" class="ward-container">
              <div class="pb-table" id="w2c1"> </div>
              <div class="pb-table" id="w2c2"> </div>
              <div class="pb-table" id="w2c3"> </div>
          </div>
      </div>
      <div id="selection"> </div>
  </div>
  <div id="map"></div>
`;

export default {content, script: initialize};
