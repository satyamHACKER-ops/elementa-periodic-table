(function () {
    "use strict";

    var currentElement = null;

    function init() {
        var overlay = document.getElementById("detailsOverlay");
        var closeButton = document.getElementById("closeDetails");

        if (closeButton) {
            closeButton.addEventListener("click", close);
        }

        if (overlay) {
            overlay.addEventListener("click", function (event) {
                if (event.target === overlay) {
                    close();
                }
            });
        }

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                close();
            }
        });
    }

    function open(element) {
        if (!element) {
            return;
        }

        currentElement = element;

        setText(
            "detailCategory",
            formatCategory(element.category)
        );

        setText("detailSymbol", element.symbol);

        setText(
            "detailAtomicNumber",
            "Atomic number " + element.atomicNumber
        );

        setText("detailName", element.name);
        setText("detailDescription", element.description);
        setText("detailMass", element.mass);
        setText("detailState", element.state);
        setText(
            "detailElectronConfig",
            element.electronConfig
        );
        setText("detailDiscovery", element.discovery);
        setText("detailPeriod", element.period);

        setText(
            "detailGroup",
            element.group === null ? "—" : element.group
        );

        var category = document.getElementById("detailCategory");

        if (category) {
            category.className =
                "detail-category category-" + element.category;
        }

        var overlay = document.getElementById("detailsOverlay");

        if (overlay) {
            overlay.classList.remove("hidden");
            document.body.classList.add("details-open");
        }
    }

    function close() {
        var overlay = document.getElementById("detailsOverlay");

        if (overlay) {
            overlay.classList.add("hidden");
            document.body.classList.remove("details-open");
        }

        currentElement = null;
    }

    function setText(id, value) {
        var element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    function formatCategory(category) {
        if (!category) {
            return "ELEMENT";
        }

        return category
            .split("-")
            .map(function (word) {
                return (
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
                );
            })
            .join(" ");
    }

    window.ElementaDetails = {
        init: init,
        open: open,
        close: close
    };
})();
