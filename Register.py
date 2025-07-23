from flask_cors import CORS
from pymongo import MongoClient
import hashlib
import re
from flask import Flask, jsonify, request, send_from_directory, render_template, Response
import os
from oldVideoprediction import classify_video
from flask import send_from_directory
import cv2
from Realtime_prediction import classify_frame


app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)


# Connect to MongoDB Atlas
client = MongoClient("mongodb+srv://shuja:satti@cluster0.snkljxc.mongodb.net/")
db = client['video-stream']
users_collection = db['users']
feedback_collection = db['feedback']
admin_collection = db['admins']

# ---------- Video Upload Setup ----------
UPLOAD_FOLDER = "samples"
THUMBNAIL_FOLDER = "samples/thumbnails"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(THUMBNAIL_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["ALLOWED_EXTENSIONS"] = {"mp4", "avi", "mov", "mkv"}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config["ALLOWED_EXTENSIONS"]

# ---------- Password Utility ----------

# Utility: Hash passwords securely
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()



# ---------------- Register Endpoint ----------------
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")

    # Basic validation
    if not email or not username or not password or not confirm_password:
        return jsonify({"error": "All fields are required"}), 400

    if password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Invalid email address"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User with this email already exists"}), 409

    # Save user to DB
    hashed_pw = hash_password(password)
    result = users_collection.insert_one({
        "email": email,
        "username": username,
        "password": hashed_pw
    })

    return jsonify({
        "message": "Registration successful",
        "user": { 
            "id": str(result.inserted_id),
            "name": username,
            "email": email }  
    }), 201

# ---------------- save feedback Endpoint ----------------

@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.get_json()
    print("Received feedback data:", data)

    user_id = data.get("userId")
    feedback_text = data.get("feedback")
    video_path = data.get("videoPath")

    if not user_id or not feedback_text:
        return jsonify({"error": "userId and feedback are required"}), 400

    feedback_collection.insert_one({
        "userId": user_id,
        "message": feedback_text,
        "video": video_path
    })

    return jsonify({"message": "Feedback submitted successfully"}), 201



# ---------------- Login Endpoint ----------------
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = users_collection.find_one({"email": email})
    if user and user["password"] == hash_password(password):
       return jsonify({
        "message": "Login successful",
        "user": {
                "id": str(user["_id"]),
                "name": user['username'],
                "email": user['email'] }  
    }), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401
    
    # ---------- Video Upload & Classification ----------

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

            # Classify video
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
    

# ---------------- classsify already uploaded video Endpoint ----------------

@app.route("/classify", methods=["POST"])
def classify_existing_video():
    data = request.get_json()
    filename = data.get("filename")

    if not filename:
        return jsonify({"error": "Missing filename"}), 400

    video_path = os.path.join("samples", filename)

    if not os.path.exists(video_path):
        return jsonify({"error": "Video not found"}), 404

    try:
        faces_pred, classification, avg_score = classify_video(video_path)

        return jsonify({
            "result": classification,
            "confidence": float(avg_score)
        })
    except Exception as e:
        return jsonify({"error": f"Error during classification: {str(e)}"}), 500
    
    
# ---------------- video fetching Endpoint ----------------

@app.route("/videos", methods=["GET"])
def latest_videos():
    folder_path = "samples"
    videos = [f for f in os.listdir(folder_path) if f.endswith((".mp4", ".mov", ".avi"))]
    
    # Sort by modification time, latest first
    videos.sort(key=lambda f: os.path.getmtime(os.path.join(folder_path, f)), reverse=True)
    
    # Only get the latest 10
    latest = videos[:4]

    video_data = [
        {
            "filename": video,
            "thumbnail": f"http://localhost:5000/samples/thumbnails/{video}.jpg"
        }
        for video in latest
    ]
    return jsonify(video_data)


# ---------- Live Video Streaming for Real-Time Detection ----------

# Initialize webcam
video_capture = cv2.VideoCapture(0)

# Store latest classification result
latest_result = {"classification": "Waiting...", "avg_score": 0.0}

def generate_frames():
    global latest_result
    
    while True:
        success, frame = video_capture.read()
        if not success:
            break

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        processed_frame, classification, confidence = classify_frame(frame_rgb)

        latest_result = {"classification": classification, "avg_score": float(confidence)}
        
        label = f"{classification} ({confidence:.2f}%)"
        cv2.putText(processed_frame, label, (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

        _, buffer = cv2.imencode('.jpg', processed_frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/get-result', methods=['GET'])
def get_result():
    return jsonify(latest_result)


# ---------- Serve Videos & Thumbnails ----------

# Serve video files
@app.route("/samples/<filename>")
def serve_video(filename):
    return send_from_directory("samples", filename)

# Serve thumbnails
@app.route("/samples/thumbnails/<filename>")
def serve_thumbnail(filename):
    return send_from_directory("samples/thumbnails", filename)

# ---------- Admin Login ----------

@app.route("/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    admin = admin_collection.find_one({"email": email})
    if admin and admin["password"] == hash_password(password):
        return jsonify({
        "id": str(admin["_id"]),
        "name": admin["name"],
        "email": admin["email"],
        "isAdmin": True
    }), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401



# ---------- Admin Register ----------

@app.route("/admin/register", methods=["POST"])
def admin_register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")

    if not email or not password or not name:
        return jsonify({"error": "All fields are required"}), 400

    if admin_collection.find_one({"email": email}):
        return jsonify({"error": "Admin already exists"}), 400

    hashed_pwd = hash_password(password)

    result = admin_collection.insert_one({
        "email": email,
        "name": name,
        "password": hashed_pwd,
        "isAdmin": True
    })

    return jsonify({"message": "Admin registered", "id": str(result.inserted_id)}), 201


# ---------- Admin Dashboard Stats ----------

@app.route("/admin/stats", methods=["GET"])
def admin_stats():
    try:
        user_count = users_collection.count_documents({})
        feedback_count = feedback_collection.count_documents({})
        
        # Count number of video files in the folder
        video_folder = "samples"
        allowed_extensions = {".mp4", ".avi", ".mov", ".mkv"}
        video_count = len([
            file for file in os.listdir(video_folder)
            if os.path.isfile(os.path.join(video_folder, file)) and os.path.splitext(file)[1].lower() in allowed_extensions
        ])

        return jsonify({
            "users": user_count,
            "feedbacks": feedback_count,
            "videos": video_count
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to fetch stats: {str(e)}"}), 500
    


# ---------- Admin Dashboard management ----------


@app.route("/admin/users", methods=["GET"])
def get_all_users():
    users = list(users_collection.find({}, {"password": 0}))
    for user in users:
        user["_id"] = str(user["_id"])
    return jsonify(users)



@app.route("/admin/feedbacks", methods=["GET"])
def get_all_feedback():
    feedbacks = list(feedback_collection.find())
    for fb in feedbacks:
        fb["_id"] = str(fb["_id"])
    return jsonify(feedbacks)


@app.route("/admin/videos", methods=["GET"])
def get_all_videos():
    folder_path = "samples"
    videos = [f for f in os.listdir(folder_path) if f.endswith((".mp4", ".mov", ".avi"))]
    return jsonify(videos)



if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)


