const primaryColor = "#4834d4";
const warningColor = "#f0932b";
const RPMcolor = "#2c6fdb";
const TEMPcolor = "#eb4d4b";

const themeCookieName = "theme";
const themeDark = "dark";
const themeLight = "light";

var socket = io("http://localhost:5000");
const body = document.getElementsByTagName("body")[0];

var amountDataFetchDOM = document.getElementById("dataFetchNumber");
var amountDataFetch = 10;

var range = document.querySelector(".range");
var bubble = document.querySelector(".bubble");

var autoRefreshButtonDOM = document.getElementById("autoRefreshBtn");
var autoRefreshBtnState = autoRefreshButtonDOM.checked;

var motorBtnDOM = document.getElementById("motorOnOffBtn");
var newMotorState = motorBtnDOM.checked;

var State = {
  motor: false,
  autoRefresh: false,
  iTemp: "0",
  fetchAmount: "0",
};

function setCurrentState() {
  newMotorState = State.motor;
  motorBtnDOM.checked = State.motor;

  autoRefreshBtnState = State.autoRefresh;
  autoRefreshButtonDOM.checked = State.autoRefresh;

  amountDataFetch = State.fetchAmount;
  amountDataFetchDOM.value = State.fetchAmount;

  instelbareTemp = State.iTemp;
  range.value = State.iTemp;
  setBubble(range, bubble);
}

socket.on("StateToClient", state => {
  console.log(state);
  State = state;
  setCurrentState();
});

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

loadTheme();

function loadTheme() {
  var theme = getCookie(themeCookieName);
  body.classList.add(theme === "" ? themeLight : theme);
}

function switchTheme() {
  if (body.classList.contains(themeLight)) {
    body.classList.remove(themeLight);
    body.classList.add(themeDark);
    setCookie(themeCookieName, themeDark);
  } else {
    body.classList.remove(themeDark);
    body.classList.add(themeLight);
    setCookie(themeCookieName, themeLight);
  }
}

function collapseSidebar() {
  body.classList.toggle("sidebar-expand");
}

window.onclick = function (event) {
  openCloseDropdown(event);
};

function closeAllDropdown() {
  var dropdowns = document.getElementsByClassName("dropdown-expand");
  for (var i = 0; i < dropdowns.length; i++) {
    dropdowns[i].classList.remove("dropdown-expand");
  }
}

function openCloseDropdown(event) {
  if (!event.target.matches(".dropdown-toggle")) {
    //
    // Close dropdown when click out of dropdown menu
    //
    closeAllDropdown();
  } else {
    var toggle = event.target.dataset.toggle;
    var content = document.getElementById(toggle);
    if (content.classList.contains("dropdown-expand")) {
      closeAllDropdown();
    } else {
      closeAllDropdown();
      content.classList.add("dropdown-expand");
    }
  }
}
// CONTROLS
// SLIDER

var instelbareTemp = range.value;

range.addEventListener("input", () => {
  setBubble(range, bubble);
  instelbareTemp = range.value;
  State.iTemp = instelbareTemp;
  socket.emit("StateToServer", State);
});

// setting bubble on DOM load
setBubble(range, bubble);

function setBubble(range, bubble) {
  const val = range.value;

  const min = range.min || 0;
  const max = range.max || 100;

  //const offset = Number(((val - min) * 100) / (max - min));
  const offset = Number(((val - min) * 100) / (max - min));

  bubble.textContent = val;

  // yes, 14px is a magic number
  bubble.style.left = `calc(${offset}% - 14px)`;
}

/* amount of data that has to be fetched! */
amountDataFetchDOM.addEventListener("input", () => {
  amountDataFetch = amountDataFetchDOM.value;
  State.fetchAmount = amountDataFetch;
  socket.emit("StateToServer", State);
});

/* CHART */

var ctx = document.getElementById("myChart");
ctx.height = 500;
ctx.width = 500;
var data = {};

let datavar = [];

let LABELS = [];
let rpmDATA = [];
let tempDATA = [];

const operators = {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        fill: false,
        label: "RPM",
        borderColor: RPMcolor,
        data: [],
        borderWidth: 2,
        lineTension: 0.3,
      },
      {
        fill: false,
        label: "TEMP",
        borderColor: TEMPcolor,
        data: [],
        borderWidth: 2,
        lineTension: 0.3,
      },
    ],
  },
  options: {
    maintainAspectRatio: false,
    bezierCurve: false,
  },
};

var Chart = new Chart(ctx, operators);

function setChart() {
  LABELS = [];
  rpmDATA = [];
  tempDATA = [];

  for (let i = 0; i < datavar.length; i++) {
    LABELS.push(datavar[i].time);
    rpmDATA.push(datavar[i].data.rpm);
    tempDATA.push(datavar[i].data.temp);
  }

  operators.data.labels = LABELS;
  operators.data.datasets[0].data = rpmDATA;
  operators.data.datasets[1].data = tempDATA;
  Chart.update();
}

async function apiReqChartData() {
  const res = await fetch(`/api/database/find/latest/${amountDataFetch}`);
  const json = await res.json();
  datavar = await json.res;
  setChart();
}

const gaugeElement = document.querySelector(".gauge");
const gaugeElement2 = document.querySelector(".gauge2");

function setGaugeValue(gauge, value, min, max, unit, i) {
  if (value < min || value > max) {
    return;
  }
  gauge.querySelector(`.gauge__fill${i}`).style.transform = `rotate(${
    value / (2 * max)
  }turn)`;
  gauge.querySelector(`.gauge__cover${i}`).textContent = `${
    value + " " + unit
  }`;
  if (unit === "°C") {
    if (value > 30) {
      gauge.querySelector(`.gauge__fill${i}`).style.backgroundColor = "#f12b28";
    } else {
      gauge.querySelector(`.gauge__fill${i}`).style.backgroundColor = "blue";
    }
  }
}

async function apiReqGauge() {
  const res = await fetch("/api/currentState");
  const json = await res.json();
  setGaugeValue(
    gaugeElement,
    json.res.state.temp == undefined ? 0 : json.res.state.temp,
    0,
    100,
    "°C",
    ""
  );
  setGaugeValue(
    gaugeElement2,
    json.res.state.rpm == undefined ? 0 : json.res.state.rpm,
    0,
    3000,
    "RPM",
    "2"
  );
}
/* Motor On-Off Handler */
motorBtnDOM.addEventListener("click", async () => {
  newMotorState = motorBtnDOM.checked;
  State.motor = newMotorState;
  socket.emit("StateToServer", State);
});

/* Auto refresh handler */
autoRefreshButtonDOM.addEventListener("click", () => {
  autoRefreshBtnState = autoRefreshButtonDOM.checked;
  State.autoRefresh = autoRefreshBtnState;
  socket.emit("StateToServer", State);
});

apiReqChartData();
apiReqGauge();

setInterval(() => {
  if (autoRefreshBtnState === true) {
    apiReqChartData();
    apiReqGauge();
  }
}, 1000);
