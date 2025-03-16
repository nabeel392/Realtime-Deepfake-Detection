import cv2
import numpy as np
import requests
from flask import Flask, Response, render_template, jsonify
from flask_cors import CORS 

from Realtime_prediction import classify_frame  # Import classification function

app = Flask(__name__)
CORS(app)

# Initialize webcam
video_capture = cv2.VideoCapture(0)  # 0 for default webcam

# Store latest classification result
latest_result = {"classification": "Waiting...", "avg_score": 0.0}

def generate_frames():
    global latest_result
    
    while True:
        success, frame = video_capture.read()
        if not success:
            break

        # Convert frame to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Send frame to prediction model
        processed_frame, classification, confidence = classify_frame(frame_rgb)

        # Update classification result
        latest_result = {"classification": classification, "avg_score": float(confidence)}

        # Overlay classification result on frame
        label = f"{classification} ({confidence:.2f}%)"
        cv2.putText(processed_frame, label, (10, 50), cv2.FONT_HERSHEY_SIMPLEX,
                    1, (0, 255, 0), 2, cv2.LINE_AA)

        # Encode frame for streaming
        _, buffer = cv2.imencode('.jpg', processed_frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/get-result', methods=['GET'])
def get_result():
    """Send the latest deepfake detection result to React frontend."""
    return jsonify(latest_result)

if __name__ == '__main__':
    app.run(debug=True)
