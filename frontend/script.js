
const API_BASE_URL = "http://127.0.0.1:5000/api";

let questions = [];
let currentQuestionIndex = 0;
let selectedLanguage = null;
let answered = false;


// Get HTML elements
const languageScreen = document.getElementById("language-screen");
const gameScreen = document.getElementById("game-screen");
const languageOptions = document.getElementById("language-options");

const languageName = document.getElementById("language-name");
const questionNumber = document.getElementById("question-number");
const idiom = document.getElementById("idiom");
const literalTranslation = document.getElementById("literal-translation");
const answerOptions = document.getElementById("answer-options");
const feedback = document.getElementById("feedback");
const nextButton = document.getElementById("next-button");


// Load available languages when the page opens
async function loadLanguages() {
    try {
        const response = await fetch(`${API_BASE_URL}/languages`);

        if (!response.ok) {
            throw new Error("Could not load languages");
        }

        const languages = await response.json();

        languageOptions.innerHTML = "";

        languages.forEach(language => {
            const button = document.createElement("button");

            button.textContent = language.name;
            button.className = "language-button";

            button.addEventListener("click", function () {
                startGame(language);
            });

            languageOptions.appendChild(button);
        });

    } catch (error) {
        languageOptions.textContent =
            "Unable to load languages. Make sure the Flask server is running.";
    }
}


// Start a game in the selected language
async function startGame(language) {
    try {
        selectedLanguage = language;

        const response = await fetch(
            `${API_BASE_URL}/questions/${language.code}`
        );

        if (!response.ok) {
            throw new Error("Could not load questions");
        }

        questions = await response.json();
        currentQuestionIndex = 0;

        if (questions.length === 0) {
            throw new Error("No questions available");
        }

        languageScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");

        renderQuestion();

    } catch (error) {
        alert("Unable to load questions. Please try again.");
    }
}


// Display the current question
function renderQuestion() {
    const question = questions[currentQuestionIndex];

    answered = false;

    languageName.textContent = selectedLanguage.name;

    questionNumber.textContent =
        `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    idiom.textContent = question.phrase;

    literalTranslation.textContent =
        `"${question.literal_translation}"`;

    answerOptions.innerHTML = "";
    feedback.textContent = "";

    nextButton.classList.add("hidden");
    nextButton.textContent = "Next Question";

    question.choices.forEach(choice => {
        const button = document.createElement("button");

        button.textContent = choice.text;
        button.className = "answer-button";

        button.addEventListener("click", function () {
            submitAnswer(question.id, choice.id, button);
        });

        answerOptions.appendChild(button);
    });
}


// Submit an answer to the Flask API
async function submitAnswer(questionId, selectedOptionId, selectedButton) {
    if (answered) {
        return;
    }

    answered = true;

    const buttons = answerOptions.querySelectorAll("button");

    buttons.forEach(button => {
        button.disabled = true;
    });

    try {
        const response = await fetch(`${API_BASE_URL}/answer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question_id: questionId,
                selected_option_id: selectedOptionId
            })
        });

        if (!response.ok) {
            throw new Error("Could not submit answer");
        }

        const result = await response.json();

        if (result.correct) {
            selectedButton.classList.add("correct");
            feedback.textContent = "Correct! " + result.explanation;
        } else {
            selectedButton.classList.add("incorrect");

            // Highlight the correct answer
            buttons.forEach(button => {
                const question = questions[currentQuestionIndex];

                const correctChoice = question.choices.find(
                    choice => choice.id === result.correct_option_id
                );

                if (correctChoice &&
                    button.textContent === correctChoice.text) {
                    button.classList.add("correct");
                }
            });

            feedback.textContent =
                "Incorrect. " + result.explanation;
        }

        if (currentQuestionIndex === questions.length - 1) {
            nextButton.textContent = "Choose Another Language";
        }

        nextButton.classList.remove("hidden");

    } catch (error) {
        answered = false;

        buttons.forEach(button => {
            button.disabled = false;
        });

        feedback.textContent =
            "Unable to submit your answer. Please try again.";
    }
}


// Move to the next question
nextButton.addEventListener("click", function () {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        // Return to language selection
        gameScreen.classList.add("hidden");
        languageScreen.classList.remove("hidden");

        questions = [];
        currentQuestionIndex = 0;
        selectedLanguage = null;
    }
});


// Load languages when the page opens
loadLanguages();
