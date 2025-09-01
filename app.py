from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    notes = request.form.get('notes')
    if not notes:
        return jsonify([])

    flashcards = [
        {
            "question": f"Q{i+1}: {notes[:30]}...",
            "answer": f"A{i+1}: Answer related to notes",
            "is_premium": i % 2 == 0
        }
        for i in range(5)
    ]
    return jsonify(flashcards)

if __name__ == '__main__':
    app.run(debug=True)
