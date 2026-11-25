import json
import os

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Find the questions.json file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUESTIONS_FILE = os.path.join(BASE_DIR, "data", "questions.json")


# Load the question database
def load_questions():
    with open(QUESTIONS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


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


# Get questions for a selected language
@app.route("/api/questions/<language_code>", methods=["GET"])
def get_questions(language_code):
    data = load_questions()

    for language in data["languages"]:
        if language["code"] == language_code:
            questions = []

            for question in language["questions"]:
                questions.append({
                    "id": question["id"],
                    "phrase": question["phrase"],
                    "literal_translation": question["literal_translation"],
                    "choices": question["choices"]
                })

            return jsonify(questions)

    return jsonify({"error": "Language not found"}), 404


# Check a submitted answer
@app.route("/api/answer", methods=["POST"])
def check_answer():
    submitted_data = request.get_json()

    if not submitted_data:
        return jsonify({"error": "Request body is required"}), 400

    question_id = submitted_data.get("question_id")
    selected_option_id = submitted_data.get("selected_option_id")

    if not question_id or not selected_option_id:
        return jsonify({"error": "Question ID and selected option are required"}), 400

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