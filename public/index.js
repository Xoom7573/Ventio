// chartjs library => 'https://cdn.jsdelivr.net/npm/chart.js'
const myChart = document.getElementById("myMultiChart").getContext("2d");
const datum = new Date();
let datavar = [];

let LABELS = [];
let rpmDATA = [];
let tempDATA = [];

let operators = {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "RPM",
        data: [],
        borderColor: ["#2E84D5"],
        tension: 0.1,
      },
      {
        label: "temperature",
        data: [],
        borderColor: ["#D3193E"],
        tension: 0.1,
      },
    ],
  },
  options: {
    responsive: true,
  },
};

function setChart() {
  for (let i = 0; i < datavar.length; i++) {
    LABELS.push(datavar[i].time);
    rpmDATA.push(datavar[i].data.rpm);
    tempDATA.push(datavar[i].data.temp);
  }

  operators.data.labels = LABELS;
  operators.data.datasets[0].data = rpmDATA;
  operators.data.datasets[1].data = tempDATA;
  massPopChart.update();
}

async function api() {
  const res = await fetch("/api/database/find/latest/5");
  const json = await res.json();
  datavar = await json.res;
  setChart();
}

api();

let massPopChart = new Chart(myChart, operators);
