// const library = 'https://cdn.jsdelivr.net/npm/chart.js'

const datum = new Date();
let datavar = [];

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

fetch("/api/database/find/latest/30")
  .then((response) => response.json())
  .then((data) => {
    datavar = data.res;
    let labels = [];
    let rpmDATA = [];
    let tempDATA = [];
    for (let i = 0; i < datavar.length; i++) {
      labels.push(datavar[i].time);
      rpmDATA.push(datavar[i].data.rpm);
      tempDATA.push(datavar[i].data.temp);
    }
    operators.labels = labels;
    operators.data[0].data = rpmDATA;
    operators.data[1].data = tempDATA;
  });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

sleep(1000);

let myChart = document.getElementById("myMultiChart").getContext("2d");
let massPopChart = new Chart(myChart, operators);
