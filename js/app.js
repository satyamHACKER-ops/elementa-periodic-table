(function () {
    "use strict";

    /*
     * =========================================================
     * ELEMENTA — MAIN APPLICATION
     * =========================================================
     */

    var elements = Array.isArray(window.ELEMENTS)
        ? window.ELEMENTS
        : [];

    var state = {
        query: "",
        filter: "all"
    };

    /*
     * =========================================================
     * INITIALIZATION
     * =========================================================
     */

    function init() {
        if (!elements.length) {
            console.error("Elementa: No element data found.");
            updateCount(0);
            return;
        }

        initializeModules();
        setupRandomButton();
        addManifestLink();
        registerServiceWorker();

        render();
    }

    function initializeModules() {
        if (window.ElementaTheme) {
            window.ElementaTheme.init();
        }

        if (window.ElementaDetails) {
            window.ElementaDetails.init();
        }

        if (window.ElementaSearch) {
            window.ElementaSearch.init(function (query) {
                state.query = query;
                render();
            });
        }

        if (window.ElementaFilters) {
            window.ElementaFilters.init(function (filter) {
                state.filter = filter;
                render();
            });
        }
    }

    /*
     * =========================================================
     * RANDOM ELEMENT
     * =========================================================
     */

    function setupRandomButton() {
        var button = document.getElementById("randomElement");

        if (!button) {
            return;
        }

        button.addEventListener("click", openRandomElement);
    }

    function openRandomElement() {
        var matchingElements = getFilteredElements();

        if (!matchingElements.length) {
            return;
        }

        var randomIndex = Math.floor(
            Math.random() * matchingElements.length
        );

        var randomElement = matchingElements[randomIndex];

        if (window.ElementaDetails) {
            window.ElementaDetails.open(randomElement);
        }
    }

    /*
     * =========================================================
     * FILTER + SEARCH
     * =========================================================
     */

    function getFilteredElements() {
        return elements.filter(function (element) {
            return matchesFilter(element) && matchesSearch(element);
        });
    }

    function matchesFilter(element) {
        if (state.filter === "all") {
            return true;
        }

        return element.category === state.filter;
    }

    function matchesSearch(element) {
        var query = state.query.toLowerCase().trim();

        if (!query) {
            return true;
        }

        var name = String(element.name || "").toLowerCase();
        var symbol = String(element.symbol || "").toLowerCase();
        var atomicNumber = String(element.atomicNumber || "");

        return (
            name.indexOf(query) !== -1 ||
            symbol.indexOf(query) !== -1 ||
            atomicNumber.indexOf(query) !== -1
        );
    }

    /*
     * =========================================================
     * MAIN RENDER
     * =========================================================
     */

    function render() {
        var matchingElements = getFilteredElements();

        renderMainTable(matchingElements);
        renderSeries(
            "lanthanides",
            matchingElements,
            "lanthanide"
        );
        renderSeries(
            "actinides",
            matchingElements,
            "actinide"
        );

        updateCount(matchingElements.length);
    }

    /*
     * =========================================================
     * MAIN PERIODIC TABLE
     * =========================================================
     */

    function renderMainTable(matchingElements) {
        var container = document.getElementById("periodicTable");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        /*
         * Create a quick lookup for matching elements.
         */
        var matchingNumbers = {};

        matchingElements.forEach(function (element) {
            matchingNumbers[element.atomicNumber] = true;
        });

        /*
         * Main table contains normal elements.
         * Lanthanides and actinides are displayed below.
         */
        var mainElements = elements.filter(function (element) {
            return (
                element.category !== "lanthanide" &&
                element.category !== "actinide"
            );
        });

        /*
         * Render each normal element.
         */
        mainElements.forEach(function (element) {
            var isVisible =
                matchingNumbers[element.atomicNumber] === true;

            /*
             * For periods 6 and 7, group 3 is represented
             * by the f-block placeholder below.
             */
            if (
                (element.period === 6 || element.period === 7) &&
                element.group === 3
            ) {
                return;
            }

            var card = createElementCard(element);

            if (!isVisible) {
                card.classList.add("filtered-out");
            }

            card.style.gridColumn = String(element.group);
            card.style.gridRow = String(element.period);

            container.appendChild(card);
        });

        /*
         * Add f-block placeholders.
         */
        createFBlockPlaceholder(
            container,
            6,
            "57–71",
            "Lanthanides"
        );

        createFBlockPlaceholder(
            container,
            7,
            "89–103",
            "Actinides"
        );

        /*
         * Show message if nothing matches.
         */
        if (!matchingElements.length) {
            showNoResults(container);
        }
    }

    /*
     * =========================================================
     * ELEMENT CARD
     * =========================================================
     */

    function createElementCard(element) {
        var card = document.createElement("button");

        card.type = "button";
        card.className =
            "element-card category-" + element.category;

        card.setAttribute(
            "aria-label",
            element.name +
            ", atomic number " +
            element.atomicNumber
        );

        card.setAttribute(
            "title",
            element.name
        );

        var number = document.createElement("span");
        number.className = "element-number";
        number.textContent = element.atomicNumber;

        var symbol = document.createElement("strong");
        symbol.className = "element-symbol";
        symbol.textContent = element.symbol;

        var name = document.createElement("span");
        name.className = "element-name";
        name.textContent = element.name;

        var mass = document.createElement("span");
        mass.className = "element-mass";
        mass.textContent = element.mass || "—";

        card.appendChild(number);
        card.appendChild(symbol);
        card.appendChild(name);
        card.appendChild(mass);

        card.addEventListener("click", function () {
            if (window.ElementaDetails) {
                window.ElementaDetails.open(element);
            }
        });

        return card;
    }

    /*
     * =========================================================
     * F-BLOCK PLACEHOLDERS
     * =========================================================
     */

    function createFBlockPlaceholder(
        container,
        period,
        range,
        label
    ) {
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

    /*
     * =========================================================
     * LANTHANIDES / ACTINIDES
     * =========================================================
     */

    function renderSeries(
        containerId,
        matchingElements,
        category
    ) {
        var container = document.getElementById(containerId);

        if (!container) {
            return;
        }

        container.innerHTML = "";

        var matchingNumbers = {};

        matchingElements.forEach(function (element) {
            matchingNumbers[element.atomicNumber] = true;
        });

        var seriesElements = elements.filter(function (element) {
            return element.category === category;
        });

        seriesElements.forEach(function (element) {
            var card = createElementCard(element);

            if (!matchingNumbers[element.atomicNumber]) {
                card.classList.add("filtered-out");
            }

            container.appendChild(card);
        });
    }

    /*
     * =========================================================
     * NO RESULTS MESSAGE
     * =========================================================
     */

    function showNoResults(container) {
        var message = document.createElement("div");

        message.className = "no-results";

        message.innerHTML =
            "<strong>No elements found</strong>" +
            "<span>Try another search or filter.</span>";

        container.appendChild(message);
    }

    /*
     * =========================================================
     * ELEMENT COUNT
     * =========================================================
     */

    function updateCount(count) {
        var countElement =
            document.getElementById("elementCount");

        if (!countElement) {
            return;
        }

        if (count === 1) {
            countElement.textContent = "1 element";
        } else {
            countElement.textContent =
                count + " elements";
        }
    }

    /*
     * =========================================================
     * PWA MANIFEST
     * =========================================================
     */

    function addManifestLink() {
        var existing =
            document.querySelector(
                'link[rel="manifest"]'
            );

        if (existing) {
            return;
        }

        var link = document.createElement("link");

        link.rel = "manifest";
        link.href = "manifest.json";

        document.head.appendChild(link);
    }

    /*
     * =========================================================
     * SERVICE WORKER
     * =========================================================
     */

    function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) {
            return;
        }

        window.addEventListener(
            "load",
            function () {
                navigator.serviceWorker
                    .register("service-worker.js")
                    .then(function (registration) {
                        console.log(
                            "Elementa service worker registered:",
                            registration.scope
                        );
                    })
                    .catch(function (error) {
                        console.warn(
                            "Elementa service worker registration failed:",
                            error
                        );
                    });
            }
        );
    }

    /*
     * =========================================================
     * START APPLICATION
     * =========================================================
     */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

})();
