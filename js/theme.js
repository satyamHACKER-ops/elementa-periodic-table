(function () {
    "use strict";

    var STORAGE_KEY = "elementa-theme";

    function getSavedTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            return null;
        }
    }

    function saveTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (error) {
            // Ignore storage errors
        }
    }

    function applyTheme(theme) {
        var root = document.documentElement;
        var button = document.getElementById("themeToggle");

        if (theme === "light") {
            root.setAttribute("data-theme", "light");

            if (button) {
                button.textContent = "🌙";
                button.setAttribute(
                    "aria-label",
                    "Switch to dark theme"
                );
                button.setAttribute(
                    "title",
                    "Switch to dark theme"
                );
            }
        } else {
            root.removeAttribute("data-theme");

            if (button) {
                button.textContent = "☀️";
                button.setAttribute(
                    "aria-label",
                    "Switch to light theme"
                );
                button.setAttribute(
                    "title",
                    "Switch to light theme"
                );
            }
        }
    }

    function getInitialTheme() {
        var savedTheme = getSavedTheme();

        if (savedTheme === "light" || savedTheme === "dark") {
            return savedTheme;
        }

        try {
            if (
                window.matchMedia &&
                window.matchMedia(
                    "(prefers-color-scheme: light)"
                ).matches
            ) {
                return "light";
            }
        } catch (error) {
            // Use dark theme as fallback
        }

        return "dark";
    }

    function toggleTheme() {
        var currentTheme =
            document.documentElement.getAttribute("data-theme");

        var newTheme =
            currentTheme === "light" ? "dark" : "light";

        applyTheme(newTheme);
        saveTheme(newTheme);
    }

    function init() {
        var button = document.getElementById("themeToggle");

        applyTheme(getInitialTheme());

        if (button) {
            button.addEventListener("click", toggleTheme);
        }
    }

    window.ElementaTheme = {
        init: init,
        toggle: toggleTheme,
        apply: applyTheme
    };
})();
