import * as d3 from 'd3';
import barChart from '../charts/bar-chart';
import map from '../charts/map';
import {getState, setState, switchPage} from '../state';



async function initialize() {
  //This makes the pages traversable
  document.querySelector('#next').addEventListener('click', switchPage);


  //This is how you access the elicited data (can change the varible name)
  //Currently it is just in the same data object as it is collected in. 
  //The important values here are elicited.Thing (the project) 
  // and elicited.elicit, The values that were actually elicited
  let elicited = await getState("data")



  let data = [];

  initialWardData((newData) => {
    data = newData;
  });
  // TODO dropdown 1 / dropdown 2 are not defined.
  // const dropdown1 = document.querySelector('#dropdown-1');
  // dropdown1.addEventListener('change', handleDropdown1);
  // const dropdown2 = document.querySelector('#dropdown-2');
  // dropdown2.addEventListener('change', handleDropdown2);

  makeMap();
}

// initialize ward numbers
window.wardNumber1 = 'w29';
window.wardNumber2 = 'w35';

function handleDropdown1(e) {
  const wardNumber = e.target.value.slice(5, 7);
  window.wardNumber1 = 'w' + wardNumber;
  showWard1Data(wardNumber);
  updateMap();
}

function handleDropdown2(e) {
  const wardNumber = e.target.value.slice(5, 7);
  window.wardNumber2 = 'w' + wardNumber;
  console.log(window.wardNumber2);
  showWard2Data(wardNumber);
  updateMap();
}

// initialize charts to wards 29 and 35
function initialWardData(cb) {
  d3.json('../../data/wards_data.json').then((data) => {
    const ward1Data = data['ward_29'];
    const ward2Data = data['ward_35'];
    let yMax = 0;

    for (var ward in data) {
      data[ward].forEach((e) => {
        if (e.count > yMax) {
          yMax = e.count;
        }
      });
    }

    cb(ward1Data);

    let raceChart1 = barChart();
    raceChart1.xVar('race');
    raceChart1.yVar('count');
    raceChart1.barClass('bar-chart-1');
    raceChart1.svgClass('race-chart-1');
    raceChart1.yMax(yMax);
    d3.select('#w1c1').datum(ward1Data).call(raceChart1);

    let raceChart2 = barChart();
    raceChart2.xVar('race');
    raceChart2.yVar('count');
    raceChart2.barClass('bar-chart-2');
    raceChart2.svgClass('race-chart-2');
    raceChart2.yMax(yMax);
    d3.select('#w2c1').datum(ward2Data).call(raceChart2);

    let incomeChart1 = barChart();
    incomeChart1.xVar('income');
    incomeChart1.yVar('count');
    incomeChart1.barClass('bar-chart-1');
    incomeChart1.svgClass('income-chart-1');
    incomeChart1.yMax(yMax);
    d3.select('#w1c2').datum(ward1Data).call(incomeChart1);

    let incomeChart2 = barChart();
    incomeChart2.xVar('income');
    incomeChart2.yVar('count');
    incomeChart2.barClass('bar-chart-2');
    incomeChart2.svgClass('income-chart-2');
    incomeChart2.yMax(yMax);
    d3.select('#w2c2').datum(ward2Data).call(incomeChart2);
  });
}

function showWard1Data(wardNumber) {
  d3.json('../../data/wards_data.json').then((data) => {
    let yMax = 0;
    for (var ward in data) {
      df = data[ward];
      df.forEach((e) => {
        if (e.count > yMax) {
          yMax = e.count;
        }
      });
    }

    for (var ward in data) {
      if (ward.slice(5, 7) == wardNumber) {
        isRaceChartEmpty = document.querySelectorAll('.race-chart-1');
        isIncomeChartEmpty = document.querySelectorAll('.income-chart-1');

        if (isRaceChartEmpty.length != 0) {
          isRaceChartEmpty.forEach(function (i) {
            i.remove();
          });
        }

        if (isIncomeChartEmpty.length != 0) {
          isIncomeChartEmpty.forEach(function (i) {
            i.remove();
          });
        }

        const filteredData = data[ward];
        // console.log("filtered", filteredData)

        let raceChart = barChart();
        raceChart.xVar('race');
        raceChart.yVar('count');
        raceChart.barClass('bar-chart-1');
        raceChart.svgClass('race-chart-1');
        raceChart.yMax(yMax);

        d3.select('#w1c1').datum(filteredData).call(raceChart);

        let incomeChart = barChart();
        incomeChart.xVar('income');
        incomeChart.yVar('count');
        incomeChart.barClass('bar-chart-1');
        incomeChart.svgClass('income-chart-1');
        incomeChart.yMax(yMax);
        d3.select('#w1c2').datum(filteredData).call(incomeChart);
      }
    }
  });
}

function showWard2Data(wardNumber) {
  d3.json('../../data/wards_data.json').then((data) => {
    let yMax = 0;
    for (var ward in data) {
      df = data[ward];
      df.forEach((e) => {
        if (e.count > yMax) {
          yMax = e.count;
        }
      });
    }

    for (var ward in data) {
      if (ward.slice(5, 7) == wardNumber) {
        const isRaceChartEmpty = document.querySelectorAll('.race-chart-2');
        const isIncomeChartEmpty = document.querySelectorAll('.income-chart-2');

        if (isRaceChartEmpty.length != 0) {
          isRaceChartEmpty.forEach(function (i) {
            i.remove();
          });
        }

        if (isIncomeChartEmpty.length != 0) {
          isIncomeChartEmpty.forEach(function (i) {
            i.remove();
          });
        }

        const filteredData = data[ward];

        let raceChart = barChart();
        raceChart.xVar('race');
        raceChart.yVar('count');
        raceChart.barClass('bar-chart-2');
        raceChart.svgClass('race-chart-2');
        raceChart.yMax(yMax);
        d3.select('#w2c1').datum(filteredData).call(raceChart);

        let incomeChart = barChart();
        incomeChart.xVar('income');
        incomeChart.yVar('count');
        incomeChart.barClass('bar-chart-2');
        incomeChart.svgClass('income-chart-2');
        incomeChart.yMax(yMax);
        d3.select('#w2c2').datum(filteredData).call(incomeChart);
      }
    }
  });
}

function makeMap() {
  // make map chart instance a global variable
  let chiMap = map(); // this is a promise

  // wrap the required stuff in Promises
  const mapRef = new Promise(function (resolve, reject) {
    resolve(chiMap);
  });
  const data = d3.json('../../data/ward_boundaries.geojson');

  // When both of these Promises have resolved, call the chart component, etc.
  Promise.all([mapRef, data])
    .then(function (values) {
      let [chiMap, data] = values; //object destructuring

      chiMap.wardSelectionOne(window.wardNumber1);
      chiMap.wardSelectionTwo(window.wardNumber2);

      d3.select('#map-container').datum(data).call(chiMap);
    })
    .catch(function (err) {
      console.log('error', err);
    });
}

function updateMap() {
  chiMap.wardSelectionOne(window.wardNumber1);
  chiMap.wardSelectionTwo(window.wardNumber2);
  chiMap.render();
}

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
        Ward’s demographics for the 2022/2023 Participatory Bugeting.
    </p>
    <!-- <label for="wards">Select two wards:</label>
    <select name="wards" id="ward_number" size="1" multiple>
        <option value="Ward 29">Ward 29</option>
        <option value="Ward 35">Ward 35</option>
        <option value="Ward 36">Ward 36</option>
        <option value="Ward 49">Ward 49</option>
    </select> -->
    <fieldset id="checkbox">
        <legend>Select a ward to compare with:</legend>
    
        <div>
          <input class = "t" type="checkbox" id="ward29" name="ward" value="29">
          <label for="">Ward 29</label>
        </div>
    
        <div>
          <input class = "t" type="checkbox" id="ward35" name="ward" value="35">
          <label for="ward35">Ward 35</label>
        </div>

        <div>
            <input class = "t" type="checkbox" id="ward36" name="ward" value="36">
            <label for="ward36">Ward 36</label>
          </div>

          <div>
            <input class = "t" type="checkbox" id="ward49" name="ward" value="49" checked>
            <label for="ward49">Ward 49</label>
          </div>
    </fieldset>
    <div id="parent">
        <div id="map-container"></div>
        <div id="charts-container">
            <div id="ward1" class="ward-container"></div>
            <div id="ward2" class="ward-container"></div>
        </div>
    </div>
    <div id="map"></div>

    <input class="button" id = "next"  type="submit" value="Next" />
`;

export default {content, script: initialize};
