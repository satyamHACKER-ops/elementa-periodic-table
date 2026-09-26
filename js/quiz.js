/* =========================================================
   ELEMENTA — QUIZ ENGINE
   Generates 10,000+ randomized questions from 118 elements
   ========================================================= */

(function () {
    "use strict";

    var elements = Array.isArray(window.ELEMENTS)
        ? window.ELEMENTS.slice()
        : [];

    var questionHistory = [];
    var MAX_HISTORY = 10000;

    function randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function shuffle(array) {
        var copy = array.slice();

        for (var i = copy.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = copy[i];
            copy[i] = copy[j];
            copy[j] = temp;
        }

        return copy;
    }

    function getName(e) {
        return e.name || "Unknown";
    }

    function getSymbol(e) {
        return e.symbol || "—";
    }

    function getNumber(e) {
        return e.atomicNumber;
    }

    function getMass(e) {
        return e.mass || "—";
    }

    function getCategory(e) {
        return e.category || "—";
    }

    function getState(e) {
        return e.state || "—";
    }

    function getBlock(e) {
        return e.block || "—";
    }

    function getPeriod(e) {
        return e.period || "—";
    }

    function getGroup(e) {
        return e.group || "—";
    }

    function getElectronConfig(e) {
        return e.electronConfig || "—";
    }

    function getDiscovery(e) {
        return e.discovery || "—";
    }

    function getDescription(e) {
        return e.description || "No description available.";
    }

    function normalize(value) {
        return String(value).trim().toLowerCase();
    }

    function makeOptions(correct, getter) {
        var values = [];

        elements.forEach(function (element) {
            var value = getter(element);

            if (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
            ) {
                values.push(String(value));
            }
        });

        values = Array.from(new Set(values));

        var wrong = shuffle(
            values.filter(function (value) {
                return normalize(value) !== normalize(correct);
            })
        ).slice(0, 3);

        return shuffle([String(correct)].concat(wrong));
    }

    /*
     * Each template creates questions for many elements.
     * Different templates + random options produce 10,000+
     * possible quiz questions.
     */

    var templates = [

        function (e) {
            return {
                question: "Which element has the symbol " + getSymbol(e) + "?",
                answer: getName(e),
                options: makeOptions(getName(e), getName)
            };
        },

        function (e) {
            return {
                question: "What is the chemical symbol of " + getName(e) + "?",
                answer: getSymbol(e),
                options: makeOptions(getSymbol(e), getSymbol)
            };
        },

        function (e) {
            return {
                question: "Which element has atomic number " + getNumber(e) + "?",
                answer: getName(e),
                options: makeOptions(getName(e), getName)
            };
        },

        function (e) {
            return {
                question: "What is the atomic number of " + getName(e) + "?",
                answer: String(getNumber(e)),
                options: makeOptions(getNumber(e), getNumber)
            };
        },

        function (e) {
            return {
                question: "What category does " + getName(e) + " belong to?",
                answer: getCategory(e),
                options: makeOptions(getCategory(e), getCategory)
            };
        },

        function (e) {
            return {
                question: "Which element belongs to the " + getCategory(e) + " category?",
                answer: getName(e),
                options: makeOptions(getName(e), getName)
            };
        },

        function (e) {
            return {
                question: "What is the state of " + getName(e) + " at standard conditions?",
                answer: getState(e),
                options: makeOptions(getState(e), getState)
            };
        },

        function (e) {
            return {
                question: "Which element is in the " + getState(e) + " state?",
                answer: getName(e),
                options: makeOptions(getName(e), getName)
            };
        },

        function (e) {
            return {
                question: "What is the block of " + getName(e) + "?",
                answer: getBlock(e),
                options: makeOptions(getBlock(e), getBlock)
            };
        },

        function (e) {
            return {
                question: "Which element belongs to the " + getBlock(e) + "-block?",
                answer: getName(e),
                options: makeOptions(getName(e), getName)
            };
        },

        function (e) {
            return {
                question: "Which period contains " + getName(e) + "?",
                answer: String(getPeriod(e)),
                options: makeOptions(getPeriod(e), getPeriod)
            };
        },

        function (e) {
            return {
                question: "Which element is in period " + getPeriod(e) + "?",
                answer: getName(e),
                options: makeOptions(getName(e), getName)
            };
        },

        function (e) {
            return {
                question: "Which group contains " + getName(e) + "?",
                answer: String(getGroup(e)),
                options: makeOptions(getGroup(e), getGroup)
            };
        },

        function (e) {
            return {
                question: "Which element is in group " + getGroup(e) + "?",
                answer: getName(e),
                options: makeOptions(getName(e), getName)
            };
        },

        function (e) {
            return {
                question: "What is the approximate atomic mass of " + getName(e) + "?",
                answer: String(getMass(e)),
                options: makeOptions(getMass(e), getMass)
            };
        },

        function (e) {
            return {
                question: "Which element has an atomic mass of approximately " + getMass(e) + "?",
                answer: getName(e),
                options: makeOptions(getName(e), getName)
            };
        },

        function (e) {
            return {
                question: "What is the electron configuration of " + getName(e) + "?",
                answer: getElectronConfig(e),
                options: makeOptions(getElectronConfig(e), getElectronConfig)
            };
        },

        function (e) {
            return {
                question: "Which element has this electron configuration: " +
                    getElectronConfig(e) + "?",
                answer: getName(e),
                options: makeOptions(getName(e), getName)
            };
        },

        function (e) {
            return {
                question: "When was " + getName(e) + " discovered?",
                answer: String(getDiscovery(e)),
                options: makeOptions(getDiscovery(e), getDiscovery)
            };
        },

        function (e) {
            return {
                question: "Which element was discovered in " +
                    getDiscovery(e) + "?",
                answer: getName(e),
                options: makeOptions(getName(e), getName)
            };
        },

        function (e) {
            return {
                question: "Identify the element: " +
                    getSymbol(e) + " has atomic number " +
                    getNumber(e) + ".",
                answer: getName(e),
                options: makeOptions(getName(e), getName)
            };
        },

        function (e) {
            return {
                question: "Identify the element with symbol " +
                    getSymbol(e) +
                    " and atomic number " +
                    getNumber(e) + ".",
                answer: getName(e),
                options: makeOptions(getName(e), getName)
            };
        },

        function (e) {
            return {
                question: "Which element is represented by " +
                    getSymbol(e) + "?",
                answer: getName(e),
                options: makeOptions(getName(e), getName)
            };
        },

        function (e) {
            return {
                question: "Which symbol represents " +
                    getName(e) + "?",
                answer: getSymbol(e),
                options: makeOptions(getSymbol(e), getSymbol)
            };
        },

        function (e) {
            return {
                question: "What is the atomic number associated with symbol " +
                    getSymbol(e) + "?",
                answer: String(getNumber(e)),
                options: makeOptions(getNumber(e), getNumber)
            };
        },

        function (e) {
            return {
                question: "Which element has atomic number " +
                    getNumber(e) +
                    " and symbol " +
                    getSymbol(e) + "?",
                answer: getName(e),
                options: makeOptions(getName(e), getName)
            };
        }

    ];

    function questionKey(question) {
        return question.question + "|" + question.answer +
            "|" + question.options.join(",");
    }

    function generateQuestion() {
        if (!elements.length) {
            return null;
        }

        for (var attempt = 0; attempt < 100; attempt++) {

            var element = randomItem(elements);
            var template = randomItem(templates);

            var question = template(element);

            if (!question || !question.options || question.options.length < 4) {
                continue;
            }

            var key = questionKey(question);

            if (questionHistory.indexOf(key) === -1) {
                questionHistory.push(key);

                if (questionHistory.length > MAX_HISTORY) {
                    questionHistory.shift();
                }

                return question;
            }
        }

        return null;
    }

    /*
     * We expose the quiz engine globally.
     * The user interface will connect to this in the next step.
     */

    window.ElementaQuiz = {
        generateQuestion: generateQuestion,

        getQuestionCount: function () {
            /*
             * 25 templates × 118 elements ×
             * multiple randomized answer arrangements
             * creates far more than 10,000 possible questions.
             */
            return templates.length * elements.length * 24;
        },

        resetHistory: function () {
            questionHistory = [];
        }
    };

})();
