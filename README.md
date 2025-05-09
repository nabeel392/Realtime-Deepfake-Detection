# Realtime Deepfake Detection

## Overview
Realtime Deepfake Detection is a web-based system designed to detect deepfake videos in both **pre-recorded** and **real-time** formats. The project uses **React** for the frontend and **Python (Flask)** for the backend, with deepfake detection powered by **FaceForensics++** and **XceptionNet**.

## Features
- **Pre-recorded Video Detection**: Upload a video file and analyze whether it is deepfake.
- **Real-time Detection**: Stream live video and detect deepfake manipulation in real-time.
- **Interactive UI**: Built using React and Tailwind CSS for a professional design.
- **Deepfake Classification**: Provides confidence scores for detections.

## Tech Stack
### **Frontend**
- React (Vite)
- Tailwind CSS
- Axios (for API calls)
- React Router DOM

### **Backend**
- Python (Flask)
- OpenCV
- TensorFlow / PyTorch (for deepfake model)
- FaceForensics++ Dataset

## Installation
### **1. Clone the Repository**
```sh
git clone https://github.com/nabeeltariq392/DeepFake-Detection.git
cd Deepfake-Detection
```

### **2. Install Frontend Dependencies**
```sh
cd frontend_folder
npm install
```

### **3. Install Backend Dependencies**
```sh
python -m venv venv
source venv/bin/activate  # For Mac/Linux
venv\Scripts\activate    # For Windows
pip install -r requirements.txt
```

## Usage
### **1. Start the Backend**
```sh
python Register.py
```
By default, the backend runs on **http://localhost:5000**.

### **2. Start the Frontend**
```sh
cd frontend_folder
npm run dev
```
By default, the frontend runs on **http://localhost:3000**.

## How It Works
1. **Pre-recorded Detection:** Users upload a video, and the backend processes it using a trained deepfake detection model.
2. **Real-time Detection:** The frontend requests a live video feed, which the backend processes and returns classification results.
3. **Results Display:** The system shows classification results along with confidence scores.




