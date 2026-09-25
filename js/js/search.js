(function () {
    "use strict";

    function init(onSearch) {
        var input = document.getElementById("searchInput");
        var clearButton = document.getElementById("clearSearch");

        if (!input) {
            return;
        }

        input.addEventListener("input", function () {
            var query = input.value.trim();

            updateClearButton(input, clearButton);

            if (typeof onSearch === "function") {
                onSearch(query);
            }
        });

        if (clearButton) {
            clearButton.addEventListener("click", function () {
                input.value = "";
                input.focus();

                updateClearButton(input, clearButton);

                if (typeof onSearch === "function") {
                    onSearch("");
                }
            });
        }

        updateClearButton(input, clearButton);
    }

    function updateClearButton(input, clearButton) {
        if (!clearButton) {
            return;
        }

        if (input.value.trim() !== "") {
            clearButton.classList.add("visible");
        } else {
            clearButton.classList.remove("visible");
        }
    }

    window.ElementaSearch = {
        init: init
    };
})();
