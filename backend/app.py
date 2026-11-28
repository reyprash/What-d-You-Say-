
import json
import os
import random

from datetime import date
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Find the questions.json file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUESTIONS_FILE = os.path.join(BASE_DIR, "data", "questions.json")

VALID_DIFFICULTIES = ["easy", "medium", "hard"]


# Load the question database
def load_questions():
    with open(QUESTIONS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


# Format a question without revealing its answer
def format_question(question):
    return {
        "id": question["id"],
        "difficulty": question["difficulty"],
        "phrase": question["phrase"],
        "literal_translation": question["literal_translation"],
        "choices": question["choices"]
    }


# Get all available languages
@app.route("/api/languages", methods=["GET"])
def get_languages():
    data = load_questions()

    languages = []

    for language in data["languages"]:
        languages.append({
            "code": language["code"],
            "name": language["name"]
        })

    return jsonify(languages)


# Get questions for a selected language and difficulty
@app.route("/api/questions/<language_code>", methods=["GET"])
def get_questions(language_code):
    data = load_questions()

    difficulty = request.args.get("difficulty")

    if difficulty and difficulty not in VALID_DIFFICULTIES:
        return jsonify({"error": "Invalid difficulty"}), 400

    for language in data["languages"]:
        if language["code"] == language_code:
            questions = []

            for question in language["questions"]:
                if difficulty is None or question["difficulty"] == difficulty:
                    questions.append(format_question(question))

            return jsonify(questions)

    return jsonify({"error": "Language not found"}), 404


# Generate a daily challenge with 10 mixed-language questions
@app.route("/api/daily", methods=["GET"])
def get_daily_challenge():
    data = load_questions()

    challenge_date = request.args.get("date", date.today().isoformat())

    try:
        date.fromisoformat(challenge_date)
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    all_questions = []

    for language in data["languages"]:
        for question in language["questions"]:
            daily_question = format_question(question)

            daily_question["language_code"] = language["code"]
            daily_question["language_name"] = language["name"]

            all_questions.append(daily_question)

    # Use the date as a seed so the challenge stays the same that day
    generator = random.Random(challenge_date)

    daily_questions = generator.sample(all_questions, 10)

    return jsonify({
        "date": challenge_date,
        "questions": daily_questions
    })


# Check a submitted answer
@app.route("/api/answer", methods=["POST"])
def check_answer():
    submitted_data = request.get_json()

    if not submitted_data:
        return jsonify({"error": "Request body is required"}), 400

    question_id = submitted_data.get("question_id")
    selected_option_id = submitted_data.get("selected_option_id")

    if not question_id or not selected_option_id:
        return jsonify({
            "error": "Question ID and selected option are required"
        }), 400

    data = load_questions()

    for language in data["languages"]:
        for question in language["questions"]:
            if question["id"] == question_id:
                is_correct = (
                    selected_option_id == question["correct_option_id"]
                )

                return jsonify({
                    "correct": is_correct,
                    "correct_option_id": question["correct_option_id"],
                    "explanation": question["explanation"]
                })

    return jsonify({"error": "Question not found"}), 404


if __name__ == "__main__":
    app.run(debug=True)
