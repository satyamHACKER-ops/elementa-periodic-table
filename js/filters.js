(function () {
    "use strict";

    function init(onFilter) {
        var buttons = document.querySelectorAll(".filter-button");

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var filter = button.getAttribute("data-filter");

                buttons.forEach(function (item) {
                    item.classList.remove("active");
                });

                button.classList.add("active");

                if (typeof onFilter === "function") {
                    onFilter(filter);
                }
            });
        });
    }

    window.ElementaFilters = {
        init: init
    };
})();
