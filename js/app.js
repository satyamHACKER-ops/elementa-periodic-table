(function () {
    "use strict";

    var elements = Array.isArray(window.ELEMENTS)
        ? window.ELEMENTS
        : [];

    var state = {
        query: "",
        filter: "all"
    };

    function init() {
        if (!elements.length) {
            console.error("Elementa: element data not found.");
            updateCount(0);
            return;
        }

        setupTheme();
        setupSearch();
        setupFilters();
        setupRandom();
        setupDetails();

        render();
    }

    /* =========================
       THEME
    ========================= */

    function setupTheme() {
        var button = document.getElementById("themeToggle");

        if (!button) {
            return;
        }

        var savedTheme = localStorage.getItem("elementa-theme");

        if (savedTheme === "light") {
            document.documentElement.setAttribute(
                "data-theme",
                "light"
            );
            button.textContent = "🌙";
        } else {
            button.textContent = "☀️";
        }

        button.addEventListener("click", function () {
            var current =
                document.documentElement.getAttribute("data-theme");

            if (current === "light") {
                document.documentElement.removeAttribute(
                    "data-theme"
                );

                localStorage.setItem(
                    "elementa-theme",
                    "dark"
                );

                button.textContent = "☀️";
            } else {
                document.documentElement.setAttribute(
                    "data-theme",
                    "light"
                );

                localStorage.setItem(
                    "elementa-theme",
                    "light"
                );

                button.textContent = "🌙";
            }
        });
    }

    /* =========================
       SEARCH
    ========================= */

    function setupSearch() {
        var input =
            document.getElementById("searchInput");

        var clear =
            document.getElementById("clearSearch");

        if (!input) {
            return;
        }

        input.addEventListener("input", function () {
            state.query = input.value.trim();

            if (clear) {
                clear.classList.toggle(
                    "visible",
                    state.query.length > 0
                );
            }

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

    /* =========================
       FILTERS
    ========================= */

    function setupFilters() {
        var buttons =
            document.querySelectorAll(
                ".filter-button"
            );

        buttons.forEach(function (button) {
            button.addEventListener(
                "click",
                function () {
                    buttons.forEach(function (item) {
                        item.classList.remove("active");
                    });

                    button.classList.add("active");

                    state.filter =
                        button.getAttribute("data-filter") ||
                        "all";

                    render();
                }
            );
        });
    }

    /* =========================
       RANDOM ELEMENT
    ========================= */

    function setupRandom() {
        var button =
            document.getElementById("randomElement");

        if (!button) {
            return;
        }

        button.addEventListener("click", function () {
            var available =
                getFilteredElements();

            if (!available.length) {
                return;
            }

            var randomIndex =
                Math.floor(
                    Math.random() * available.length
                );

            openDetails(
                available[randomIndex]
            );
        });
    }

    /* =========================
       FILTER + SEARCH
    ========================= */

    function getFilteredElements() {
        return elements.filter(function (element) {

            if (
                state.filter !== "all" &&
                element.category !== state.filter
            ) {
                return false;
            }

            var query =
                state.query.toLowerCase();

            if (!query) {
                return true;
            }

            var name =
                String(element.name || "")
                    .toLowerCase();

            var symbol =
                String(element.symbol || "")
                    .toLowerCase();

            var number =
                String(element.atomicNumber || "");

            return (
                name.indexOf(query) !== -1 ||
                symbol.indexOf(query) !== -1 ||
                number === query
            );
        });
    }

    /* =========================
       RENDER
    ========================= */

    function render() {
        var matching =
            getFilteredElements();

        renderMainTable(matching);

        renderSeries(
            "lanthanides",
            matching,
            "lanthanide"
        );

        renderSeries(
            "actinides",
            matching,
            "actinide"
        );

        updateCount(matching.length);
    }

    /* =========================
       MAIN PERIODIC TABLE
    ========================= */

    function renderMainTable(matching) {
        var container =
            document.getElementById(
                "periodicTable"
            );

        if (!container) {
            return;
        }

        container.innerHTML = "";

        var visible = {};

        matching.forEach(function (element) {
            visible[element.atomicNumber] = true;
        });

        elements.forEach(function (element) {

            if (
                element.category === "lanthanide" ||
                element.category === "actinide"
            ) {
                return;
            }

            /*
             * The real periodic table places
             * lanthanides/actinides after group 2.
             *
             * We use an empty placeholder in group 3
             * for periods 6 and 7.
             */

            if (
                (element.period === 6 ||
                    element.period === 7) &&
                element.group === 3
            ) {
                return;
            }

            var card =
                createElementCard(element);

            if (!visible[element.atomicNumber]) {
                card.classList.add(
                    "filtered-out"
                );
            }

            card.style.gridColumn =
                String(element.group);

            card.style.gridRow =
                String(element.period);

            container.appendChild(card);
        });

        createPlaceholder(
            container,
            6,
            "57–71",
            "Lanthanides"
        );

        createPlaceholder(
            container,
            7,
            "89–103",
            "Actinides"
        );

        if (!matching.length) {
            var message =
                document.createElement("div");

            message.className =
                "no-results";

            message.textContent =
                "No elements found. Try another search or filter.";

            container.appendChild(message);
        }
    }

    /* =========================
       ELEMENT CARD
    ========================= */

    function createElementCard(element) {
        var card =
            document.createElement("button");

        card.type = "button";

        card.className =
            "element-card category-" +
            element.category;

        card.setAttribute(
            "aria-label",
            element.name +
            ", atomic number " +
            element.atomicNumber
        );

        card.title = element.name;

        var number =
            document.createElement("span");

        number.className =
            "element-number";

        number.textContent =
            element.atomicNumber;

        var symbol =
            document.createElement("strong");

        symbol.className =
            "element-symbol";

        symbol.textContent =
            element.symbol;

        var name =
            document.createElement("span");

        name.className =
            "element-name";

        name.textContent =
            element.name;

        card.appendChild(number);
        card.appendChild(symbol);
        card.appendChild(name);

        card.addEventListener(
            "click",
            function () {
                openDetails(element);
            }
        );

        return card;
    }

    /* =========================
       F-BLOCK PLACEHOLDERS
    ========================= */

    function createPlaceholder(
        container,
        period,
        range,
        label
    ) {
        var placeholder =
            document.createElement("div");

        placeholder.className =
            "element-card placeholder-card";

        placeholder.style.gridColumn = "3";

        placeholder.style.gridRow =
            String(period);

        var rangeText =
            document.createElement("strong");

        rangeText.textContent = range;

        var arrow =
            document.createElement("span");

        arrow.textContent = "↘";

        var labelText =
            document.createElement("span");

        labelText.textContent = label;

        placeholder.appendChild(rangeText);
        placeholder.appendChild(arrow);
        placeholder.appendChild(labelText);

        container.appendChild(placeholder);
    }

    /* =========================
       LANTHANIDES / ACTINIDES
    ========================= */

    function renderSeries(
        containerId,
        matching,
        category
    ) {
        var container =
            document.getElementById(containerId);

        if (!container) {
            return;
        }

        container.innerHTML = "";

        var visible = {};

        matching.forEach(function (element) {
            visible[element.atomicNumber] = true;
        });

        elements.forEach(function (element) {
            if (element.category !== category) {
                return;
            }

            var card =
                createElementCard(element);

            if (!visible[element.atomicNumber]) {
                card.classList.add(
                    "filtered-out"
                );
            }

            container.appendChild(card);
        });
    }

    /* =========================
       DETAILS
    ========================= */

    function setupDetails() {
        var overlay =
            document.getElementById(
                "detailsOverlay"
            );

        var close =
            document.getElementById(
                "closeDetails"
            );

        if (close) {
            close.addEventListener(
                "click",
                closeDetails
            );
        }

        if (overlay) {
            overlay.addEventListener(
                "click",
                function (event) {
                    if (
                        event.target === overlay
                    ) {
                        closeDetails();
                    }
                }
            );
        }

        document.addEventListener(
            "keydown",
            function (event) {
                if (event.key === "Escape") {
                    closeDetails();
                }
            }
        );
    }

    function openDetails(element) {
        var overlay =
            document.getElementById(
                "detailsOverlay"
            );

        if (!overlay) {
            return;
        }

        setText(
            "detailCategory",
            element.category
        );

        setText(
            "detailSymbol",
            element.symbol
        );

        setText(
            "detailAtomicNumber",
            "Atomic number " +
                element.atomicNumber
        );

        setText(
            "detailName",
            element.name
        );

        setText(
            "detailDescription",
            element.description ||
                "No description available."
        );

        setText(
            "detailMass",
            element.mass || "—"
        );

        setText(
            "detailState",
            element.state || "—"
        );

        setText(
            "detailElectronConfig",
            element.electronConfig || "—"
        );

        setText(
            "detailDiscovery",
            element.discovery || "—"
        );

        setText(
            "detailPeriod",
            element.period || "—"
        );

        setText(
            "detailGroup",
            element.group || "—"
        );

        overlay.classList.remove("hidden");

        document.body.classList.add(
            "details-open"
        );
    }

    function closeDetails() {
        var overlay =
            document.getElementById(
                "detailsOverlay"
            );

        if (!overlay) {
            return;
        }

        overlay.classList.add("hidden");

        document.body.classList.remove(
            "details-open"
        );
    }

    function setText(id, value) {
        var element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    /* =========================
       COUNT
    ========================= */

    function updateCount(count) {
        var element =
            document.getElementById(
                "elementCount"
            );

        if (!element) {
            return;
        }

        element.textContent =
            count === 1
                ? "1 element"
                : count + " elements";
    }

    /* =========================
       SERVICE WORKER
    ========================= */

    function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) {
            return;
        }

        window.addEventListener("load", function () {
            navigator.serviceWorker
                .register("./service-worker.js")
                .then(function (registration) {
                    console.log(
                        "Elementa: Service Worker registered.",
                        registration.scope
                    );
                })
                .catch(function (error) {
                    console.error(
                        "Elementa: Service Worker registration failed.",
                        error
                    );
                });
        });
    }

    /* =========================
       START
    ========================= */

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

    registerServiceWorker();

})();
