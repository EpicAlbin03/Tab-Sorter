// Global variables
let elAutoSort = document.getElementById("autoSort");
let elAutoSortSec = document.getElementById("autoSortSec");
let elAutoSortMin = document.getElementById("autoSortMin");
let elAutoSortHours = document.getElementById("autoSortHours");
let elSelectGrouping = document.getElementById("selectGrouping");
let elPreserveGroupOrder = document.getElementById("preserveGroupOrder");
var timerRef;

// Loads values from storage and assigns it to settings
chrome.storage.sync.get(["autoSort", "autoSortSec", "autoSortMin", "autoSortHours", "selectGrouping", "preserveGroupOrder"], (data) => {
  elAutoSort.checked = data.autoSort;
  elAutoSortSec.value = data.autoSortSec;
  elAutoSortMin.value = data.autoSortMin;
  elAutoSortHours.value = data.autoSortHours;
  elSelectGrouping.value = data.selectGrouping;
  elPreserveGroupOrder.checked = data.preserveGroupOrder;

  toggleInputTime();
  callFunctions();
});

// Enables save-button when any setting is changed
document.body.addEventListener("change", function () {
  document.getElementById("save").disabled = false;
});

// Save-button onclick
document.getElementById("save").onclick = function () {
  // Saves current values of settings to storage
  chrome.storage.sync.set({
    autoSort: elAutoSort.checked,
    autoSortSec: elAutoSortSec.value,
    autoSortMin: elAutoSortMin.value,
    autoSortHours: elAutoSortHours.value,
    selectGrouping: elSelectGrouping.value,
    preserveGroupOrder: elPreserveGroupOrder.checked,
  });

  // Disables save-button
  document.getElementById("save").disabled = true;

  callFunctions();
};

document.getElementById("autoSort").onclick = function () {
  toggleInputTime();
};

// Enables / disables inputTime wether or not the autoSort-checkbox is checked
function toggleInputTime() {
  if (elAutoSort.checked) {
    elAutoSortSec.disabled = false;
    elAutoSortMin.disabled = false;
    elAutoSortHours.disabled = false;
  } else {
    elAutoSortSec.disabled = true;
    elAutoSortMin.disabled = true;
    elAutoSortHours.disabled = true;
  }
}

// Calls the correct function depending on the settings
async function callFunctions() {
  let tabs = await chrome.tabs.query({ currentWindow: true });

  if (elAutoSort.checked) {
    autoSort(tabs);
  }
}

// Automatically sorts tabs by title or url after [x] amount of time (settings page needs to stay open)
function autoSort(tabs) {
  chrome.storage.sync.get(["autoSortSec", "autoSortMin", "autoSortHours"], (data) => {
    // Converts sec, min and hours to milliseconds and adds them together
    let sec = data.autoSortSec * 1000;
    let min = data.autoSortMin * 60 * 1000;
    let hours = data.autoSortHours * 60 * 60 * 1000;
    let time = sec + min + hours;

    // Resets timerRef
    clearInterval(timerRef);

    // Function that repeats itself after [x] amount of time
    timerRef = setInterval(function () {
      chrome.storage.sync.get(["autoSort", "sortOption"], (data) => {
        if (data.autoSort == true && (sec > 0 || min > 0 || hours > 0)) {
          // Checks if titleSort or urlSort is selected, then calls the function from popup.js
          if (data.sortOption == "titleSort") {
            titleSort(tabs);
          } else if (data.sortOption == "urlSort") {
            urlSort(tabs);
          }
        }
      });
    }, time);
  });
}
