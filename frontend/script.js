
const API_BASE_URL = "http://127.0.0.1:5000/api";

// Screen elements
const menuScreen = document.getElementById("menu-screen");
const languageScreen = document.getElementById("language-screen");
const difficultyScreen = document.getElementById("difficulty-screen");
const gameScreen = document.getElementById("game-screen");

// Menu elements
const regularGameButton = document.getElementById("regular-game-button");
const dailyChallengeButton = document.getElementById("daily-challenge-button");

// Language and difficulty elements
const languageOptions = document.getElementById("language-options");
const selectedLanguageName = document.getElementById("selected-language-name");
const languageBackButton = document.getElementById("language-back-button");
const difficultyBackButton = document.getElementById("difficulty-back-button");

// Game elements
const languageName = document.getElementById("language-name");
const difficultyName = document.getElementById("difficulty-name");
const questionNumber = document.getElementById("question-number");
const scoreDisplay = document.getElementById("score-display");
const idiom = document.getElementById("idiom");
const literalTranslation = document.getElementById("literal-translation");
const answerOptions = document.getElementById("answer-options");
const feedback = document.getElementById("feedback");
const nextButton = document.getElementById("next-button");

// Results elements
const questionContent = document.getElementById("question-content");
const finalResults = document.getElementById("final-results");
const finalScore = document.getElementById("final-score");
const finalPercentage = document.getElementById("final-percentage");

// Game state
let languages = [];
let selectedLanguage = null;
let selectedDifficulty = null;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let answered = false;
let gameMode = "regular";
let gameFinished = false;


// Show one screen and hide the others
function showScreen(screen) {
    menuScreen.classList.add("hidden");
    languageScreen.classList.add("hidden");
    difficultyScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");

    screen.classList.remove("hidden");
}


// Load available languages from the API
async function loadLanguages() {
    try {
        const response = await fetch(`${API_BASE_URL}/languages`);

        if (!response.ok) {
            throw new Error("Could not load languages.");
        }

        languages = await response.json();
    } catch (error) {
        alert("Could not connect to the server. Make sure Flask is running.");
    }
}


// Display the language selection screen
function showLanguages() {
    languageOptions.innerHTML = "";

    for (const language of languages) {
        const button = document.createElement("button");

        button.textContent = language.name;
        button.classList.add("language-button");

        button.addEventListener("click", function () {
            selectedLanguage = language;
            selectedLanguageName.textContent = language.name;
            showScreen(difficultyScreen);
        });

        languageOptions.appendChild(button);
    }

    showScreen(languageScreen);
}


// Start a regular game
async function startRegularGame() {
    if (!selectedLanguage || !selectedDifficulty) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/questions/${selectedLanguage.code}?difficulty=${selectedDifficulty}`
        );

        if (!response.ok) {
            throw new Error("Could not load questions.");
        }

        const loadedQuestions = await response.json();

        if (loadedQuestions.length !== 3) {
            throw new Error("The game needs exactly 3 questions.");
        }

        startGame(loadedQuestions, "regular");
    } catch (error) {
        alert("Could not load the questions. Make sure Flask is running.");
    }
}


// Start the daily challenge
async function startDailyChallenge() {
    try {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        const today = `${year}-${month}-${day}`;

        const response = await fetch(
            `${API_BASE_URL}/daily?date=${today}`
        );

        if (!response.ok) {
            throw new Error("Could not load the daily challenge.");
        }

        const data = await response.json();

        if (data.questions.length !== 10) {
            throw new Error("The daily challenge needs 10 questions.");
        }

        startGame(data.questions, "daily");
    } catch (error) {
        alert("Could not load the daily challenge. Make sure Flask is running.");
    }
}


// Initialize a new game
function startGame(loadedQuestions, mode) {
    questions = loadedQuestions;
    gameMode = mode;
    currentQuestionIndex = 0;
    score = 0;
    answered = false;
    gameFinished = false;

    showScreen(gameScreen);

    finalResults.classList.add("hidden");
    questionContent.classList.remove("hidden");
    nextButton.classList.add("hidden");

    renderQuestion();
}


// Display the current question
function renderQuestion() {
    const question = questions[currentQuestionIndex];

    answered = false;

    if (gameMode === "daily") {
        languageName.textContent = question.language_name;
        difficultyName.textContent =
            question.difficulty.charAt(0).toUpperCase() +
            question.difficulty.slice(1);
    } else {
        languageName.textContent = selectedLanguage.name;
        difficultyName.textContent =
            selectedDifficulty.charAt(0).toUpperCase() +
            selectedDifficulty.slice(1);
    }

    questionNumber.textContent =
        `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    scoreDisplay.textContent = `Score: ${score}`;

    idiom.textContent = question.phrase;
    literalTranslation.textContent =
        `Literal translation: ${question.literal_translation}`;

    answerOptions.innerHTML = "";
    feedback.innerHTML = "";
    nextButton.classList.add("hidden");

    for (const option of question.choices) {
        const button = document.createElement("button");

        button.textContent = option.text;
        button.classList.add("answer-button");

        button.addEventListener("click", function () {
            submitAnswer(option.id, button);
        });

        answerOptions.appendChild(button);
    }
}


// Check the selected answer
async function submitAnswer(selectedOptionId, selectedButton) {
    if (answered) {
        return;
    }

    answered = true;

    const question = questions[currentQuestionIndex];

    try {
        const response = await fetch(`${API_BASE_URL}/answer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question_id: question.id,
                selected_option_id: selectedOptionId
            })
        });

        if (!response.ok) {
            throw new Error("Could not check the answer.");
        }

        const result = await response.json();

        const buttons = answerOptions.querySelectorAll("button");

        for (const button of buttons) {
            button.disabled = true;

            const option = question.choices.find(
                choice => choice.text === button.textContent
            );

            if (option.id === result.correct_option_id) {
                button.classList.add("correct");
            }
        }

        if (result.correct) {
            score++;
            feedback.innerHTML = "<p>Correct!</p>";
        } else {
            selectedButton.classList.add("incorrect");
            feedback.innerHTML = "<p>Incorrect!</p>";
        }

        const explanation = document.createElement("p");
        explanation.textContent = result.explanation;
        feedback.appendChild(explanation);

        scoreDisplay.textContent = `Score: ${score}`;

        if (currentQuestionIndex === questions.length - 1) {
            nextButton.textContent = "See Results";
        } else {
            nextButton.textContent = "Next Question";
        }

        nextButton.classList.remove("hidden");
    } catch (error) {
        answered = false;
        alert("Could not check your answer. Please try again.");
    }
}


// Display the final results
function showResults() {
    gameFinished = true;

    questionContent.classList.add("hidden");
    finalResults.classList.remove("hidden");

    finalScore.textContent = `Your score: ${score} / ${questions.length}`;

    const percentage = Math.round((score / questions.length) * 100);

    finalPercentage.textContent = `Accuracy: ${percentage}%`;

    nextButton.textContent = "Back to Menu";
    nextButton.classList.remove("hidden");
}


// Return to the main menu
function returnToMenu() {
    selectedLanguage = null;
    selectedDifficulty = null;
    questions = [];
    currentQuestionIndex = 0;
    score = 0;
    answered = false;
    gameFinished = false;

    showScreen(menuScreen);
}


// Handle the Next Question button
function handleNextButton() {
    if (gameFinished) {
        returnToMenu();
        return;
    }

    if (currentQuestionIndex === questions.length - 1) {
        showResults();
        return;
    }

    currentQuestionIndex++;
    renderQuestion();
}


// Event listeners

regularGameButton.addEventListener("click", function () {
    if (languages.length === 0) {
        alert("Languages are still loading. Please try again.");
        return;
    }

    showLanguages();
});

dailyChallengeButton.addEventListener("click", startDailyChallenge);

languageBackButton.addEventListener("click", function () {
    showScreen(menuScreen);
});

difficultyBackButton.addEventListener("click", function () {
    showScreen(languageScreen);
});

const difficultyButtons = document.querySelectorAll(".difficulty-button");

for (const button of difficultyButtons) {
    button.addEventListener("click", function () {
        selectedDifficulty = button.dataset.difficulty;
        startRegularGame();
    });
}

nextButton.addEventListener("click", handleNextButton);


// Load languages when the page opens
loadLanguages();
