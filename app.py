from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from oldVideoprediction import classify_video  # Import your prediction function

app = Flask(__name__)
# Allow cross-origin requests from your frontend
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# Path to save uploaded videos
UPLOAD_FOLDER = "samples"  # Make sure this folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["ALLOWED_EXTENSIONS"] = {"mp4", "avi", "mov", "mkv"}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config["ALLOWED_EXTENSIONS"]

@app.route("/upload", methods=["POST"])
def upload_file():
    if "video" not in request.files:
        return jsonify({"error": "No file part"}), 400
    video_file = request.files["video"]

    if video_file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if video_file and allowed_file(video_file.filename):
        try:
            video_path = os.path.join(app.config["UPLOAD_FOLDER"], video_file.filename)
            video_file.save(video_path)

            # Fix the unpacking here to match the number of values returned by classify_video
            faces_pred, classification, avg_score = classify_video(video_path)

            return jsonify({
                "result": classification,
                "confidence": float(avg_score),
                "video_path": video_file.filename
            })
        except Exception as e:
            return jsonify({"error": f"Error during file processing: {str(e)}"}), 500
    else:
        return jsonify({"error": "Invalid file type"}), 400

@app.route("/samples/<filename>")
def serve_video(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
