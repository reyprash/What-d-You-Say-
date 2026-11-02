# What'd Ya Say?

## Project Goal

What'd Ya Say? is a trivia game in which players get to test their knowledge on determining the real meaning of the phrases used in different languages. Players are shown literal translations of the phrase along with choices and are able to learn new phrases through a fun game experience.

## MVP Scope (Version 1.0)

The initial version will include:

1. **Language Selection:** Allow users to choose a language, such as Spanish, French, or German.
2. **Multiple-Choice Questions:** Display unusual phrases and their literal translations with four possible answers.
3. **Answer Validation:** Check whether the user's selected answer is correct.
4. **Scoring System:** Award points for correct answers.
5. **Explanations:** Provide the actual meaning and context behind each phrase.
6. **Final Results:** Display the user's total score after completing the questions.

Questions will be stored in a JSON file containing phrases, translations, answer choices, correct answers, and explanations.

## Future Plans (Version 2.0+)

1. **User Accounts and Profiles:** Allow users to create accounts and save their progress.
2. **Global Leaderboard:** Let players compare scores and compete with others.
3. **Daily Challenges:** Introduce a new set of questions every day.
4. **Streak Tracking:** Track consecutive days of gameplay to encourage regular participation.
5. **Expanded Language Collection:** Add more languages, dialects, slang, and culturally specific expressions.
6. **AI-Generated Questions:** Explore using an AI API to dynamically generate questions and explanations.

## Tech Stack

**Frontend:**
- HTML5 – Website structure.
- CSS3 – Styling and layout.
- JavaScript – Game interactions and score updates.
- Fetch API – Communication with the backend.

**Backend:**
- Python 3 – Application logic and answer validation.
- Flask – Backend framework and API endpoints.

**Data Storage:**
- JSON – Stores questions, translations, answers, and explanations.

**Development Tools:**
- VS Code – Code editor.
- Git and GitHub – Version control and repository hosting.
- Postman – Testing API endpoints.
