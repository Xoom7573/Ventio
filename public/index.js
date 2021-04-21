const primaryColor = "#4834d4";
const warningColor = "#f0932b";
const RPMcolor = "#2c6fdb";
const TEMPcolor = "#eb4d4b";

const themeCookieName = "theme";
const themeDark = "dark";
const themeLight = "light";

const body = document.getElementsByTagName("body")[0];

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
        lineTension: 0,
      },
      {
        fill: false,
        label: "TEMP",
        borderColor: TEMPcolor,
        data: [],
        borderWidth: 2,
        lineTension: 0,
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

async function api() {
  const res = await fetch("/api/database/find/latest/50");
  const json = await res.json();
  datavar = await json.res;
  setChart();
}

api();
