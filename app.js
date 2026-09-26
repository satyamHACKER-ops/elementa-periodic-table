(function () {
  "use strict";

  var elements = Array.isArray(window.ELEMENTS) ? window.ELEMENTS.slice() : [];
  var state = { query: "", filter: "all" };

  function $(id) { return document.getElementById(id); }

  function init() {
    setupTheme();
    setupSearch();
    setupFilters();
    setupRandom();
    setupDetails();
    validateData();

    if (!elements.length) {
      updateCount(0);
      showError("Element data could not be loaded.");
      return;
    }

    render();
    registerServiceWorker();
  }

  function validateData() {
    var seen = {};
    var valid = [];
    elements.forEach(function (e) {
      if (!e || !Number.isInteger(Number(e.atomicNumber))) return;
      var n = Number(e.atomicNumber);
      if (n < 1 || n > 118 || seen[n]) return;
      seen[n] = true;
      e.atomicNumber = n;
      /* Standard-state information for the superheavy elements is not experimentally established. */
      if (n >= 113 && n <= 118) e.state = "Unknown";
      valid.push(e);
    });
    elements = valid.sort(function (a, b) { return a.atomicNumber - b.atomicNumber; });
  }

  function setupTheme() {
    var button = $("themeToggle");
    if (!button) return;

    var saved = null;
    try { saved = localStorage.getItem("elementa-theme"); } catch (e) {}

    applyTheme(saved === "light" ? "light" : "dark");

    button.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var next = current === "light" ? "dark" : "light";
      applyTheme(next);
      try { localStorage.setItem("elementa-theme", next); } catch (e) {}
    });
  }

  function applyTheme(theme) {
    var button = $("themeToggle");
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      if (button) {
        button.textContent = "🌙";
        button.setAttribute("aria-label", "Switch to dark theme");
        button.title = "Switch to dark theme";
      }
    } else {
      document.documentElement.removeAttribute("data-theme");
      if (button) {
        button.textContent = "☀️";
        button.setAttribute("aria-label", "Switch to light theme");
        button.title = "Switch to light theme";
      }
    }
  }

  function setupSearch() {
    var input = $("searchInput");
    var clear = $("clearSearch");
    if (!input) return;

    input.addEventListener("input", function () {
      state.query = input.value.trim().toLowerCase();
      if (clear) clear.classList.toggle("visible", !!state.query);
      render();
    });

    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        state.query = "";
        clear.classList.remove("visible");
        input.focus();
        render();
      });
    }
  }

  function setupFilters() {
    document.querySelectorAll(".filter-button").forEach(function (button) {
      button.addEventListener("click", function () {
        document.querySelectorAll(".filter-button").forEach(function (b) {
          b.classList.remove("active");
        });
        button.classList.add("active");
        state.filter = button.getAttribute("data-filter") || "all";
        render();
      });
    });
  }

  function setupRandom() {
    var button = $("randomElement");
    if (!button) return;
    button.addEventListener("click", function () {
      var list = getFilteredElements();
      if (!list.length) return;
      openDetails(list[Math.floor(Math.random() * list.length)]);
    });
  }

  function setupDetails() {
    var overlay = $("detailsOverlay");
    var close = $("closeDetails");

    if (close) close.addEventListener("click", closeDetails);
    if (overlay) {
      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) closeDetails();
      });
    }
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeDetails();
    });
  }

  function getFilteredElements() {
    return elements.filter(function (e) {
      if (state.filter !== "all" && e.category !== state.filter) return false;
      if (!state.query) return true;

      var name = String(e.name || "").toLowerCase();
      var symbol = String(e.symbol || "").toLowerCase();
      var number = String(e.atomicNumber);

      return name.indexOf(state.query) !== -1 ||
             symbol.indexOf(state.query) !== -1 ||
             number === state.query;
    });
  }

  function render() {
    var matching = getFilteredElements();
    renderMainTable(matching);
    renderSeries("lanthanides", matching, "lanthanide");
    renderSeries("actinides", matching, "actinide");
    updateCount(matching.length);
  }

  function renderMainTable(matching) {
    var container = $("periodicTable");
    if (!container) return;

    container.innerHTML = "";
    var visible = {};
    matching.forEach(function (e) { visible[e.atomicNumber] = true; });

    elements.forEach(function (e) {
      if (e.category === "lanthanide" || e.category === "actinide") return;
      if ((e.period === 6 || e.period === 7) && e.group === 3) return;

      var card = createElementCard(e);
      if (!visible[e.atomicNumber]) card.classList.add("filtered-out");
      card.style.gridColumn = String(e.group || 1);
      card.style.gridRow = String(e.period || 1);
      container.appendChild(card);
    });

    createPlaceholder(container, 6, "57–71", "Lanthanides");
    createPlaceholder(container, 7, "89–103", "Actinides");

    if (!matching.length) {
      var message = document.createElement("div");
      message.className = "no-results";
      message.textContent = "No elements found. Try another search or filter.";
      container.appendChild(message);
    }
  }

  function renderSeries(id, matching, category) {
    var container = $(id);
    if (!container) return;

    container.innerHTML = "";
    var visible = {};
    matching.forEach(function (e) { visible[e.atomicNumber] = true; });

    elements.forEach(function (e) {
      if (e.category !== category) return;
      var card = createElementCard(e);
      if (!visible[e.atomicNumber]) card.classList.add("filtered-out");
      container.appendChild(card);
    });
  }

  function createElementCard(e) {
    var card = document.createElement("button");
    card.type = "button";
    card.className = "element-card category-" + (e.category || "unknown");
    card.setAttribute("aria-label", (e.name || "Element") + ", atomic number " + e.atomicNumber);
    card.title = e.name || "";

    var number = document.createElement("span");
    number.className = "element-number";
    number.textContent = e.atomicNumber;

    var symbol = document.createElement("strong");
    symbol.className = "element-symbol";
    symbol.textContent = e.symbol || "";

    var name = document.createElement("span");
    name.className = "element-name";
    name.textContent = e.name || "";

    card.appendChild(number);
    card.appendChild(symbol);
    card.appendChild(name);
    card.addEventListener("click", function () { openDetails(e); });

    return card;
  }

  function createPlaceholder(container, period, range, label) {
    var placeholder = document.createElement("div");
    placeholder.className = "element-card placeholder-card";
    placeholder.style.gridColumn = "3";
    placeholder.style.gridRow = String(period);

    var rangeText = document.createElement("strong");
    rangeText.textContent = range;
    var arrow = document.createElement("span");
    arrow.textContent = "↘";
    var labelText = document.createElement("span");
    labelText.textContent = label;

    placeholder.appendChild(rangeText);
    placeholder.appendChild(arrow);
    placeholder.appendChild(labelText);
    container.appendChild(placeholder);
  }

  function openDetails(e) {
    var overlay = $("detailsOverlay");
    if (!overlay || !e) return;

    setText("detailCategory", formatCategory(e.category));
    setText("detailSymbol", e.symbol || "—");
    setText("detailAtomicNumber", "Atomic number " + e.atomicNumber);
    setText("detailName", e.name || "Unknown element");
    setText("detailDescription", e.description || "No description available.");
    setText("detailMass", e.mass || "—");
    setText("detailState", e.state || "—");
    setText("detailElectronConfig", e.electronConfig || "—");
    setText("detailDiscovery", e.discovery || "—");
    setText("detailPeriod", e.period || "—");
    setText("detailGroup", e.group == null ? "—" : e.group);

    var category = $("detailCategory");
    if (category) category.className = "detail-category category-" + (e.category || "unknown");

    overlay.classList.remove("hidden");
    document.body.classList.add("details-open");
  }

  function closeDetails() {
    var overlay = $("detailsOverlay");
    if (!overlay) return;
    overlay.classList.add("hidden");
    document.body.classList.remove("details-open");
  }

  function formatCategory(value) {
    return String(value || "element")
      .split("-")
      .map(function (word) { return word.charAt(0).toUpperCase() + word.slice(1); })
      .join(" ");
  }

  function setText(id, value) {
    var node = $(id);
    if (node) node.textContent = value;
  }

  function updateCount(count) {
    var node = $("elementCount");
    if (node) node.textContent = count === 1 ? "1 element" : count + " elements";
  }

  function showError(message) {
    var container = $("periodicTable");
    if (!container) return;
    container.innerHTML = "";
    var error = document.createElement("div");
    error.className = "no-results";
    error.textContent = message;
    container.appendChild(error);
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("./service-worker.js").catch(function () {
      /* The app remains fully usable without offline caching. */
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
