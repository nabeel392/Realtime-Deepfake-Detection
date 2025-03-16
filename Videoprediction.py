#!/usr/bin/env python
# coding: utf-8

import torch
from torch.utils.model_zoo import load_url
from PIL import Image
import matplotlib.pyplot as plt
import numpy as np
from scipy.special import expit
import sys
sys.path.append('..')

# Import necessary libraries for face detection and extraction
from blazeface import FaceExtractor, BlazeFace
from architectures import fornet, weights
from isplutils import utils
from torchvision.transforms import ToTensor

# Parameters for the network and face detection
net_model = 'EfficientNetAutoAttB4'  # Select the model type
train_db = 'DFDC'  # Dataset for training
device = torch.device('cuda:0') if torch.cuda.is_available() else torch.device('cpu')
face_policy = 'scale'
face_size = 224
frames_per_video = 32  # Number of frames to extract for video prediction

# Initialize model and face extractor
model_url = weights.weight_url['{:s}_{:s}'.format(net_model, train_db)]
net = getattr(fornet, net_model)().eval().to(device)
net.load_state_dict(load_url(model_url, map_location=device, check_hash=True))

transf = utils.get_transformer(face_policy, face_size, net.get_normalizer(), train=False)

facedet = BlazeFace().to(device)
facedet.load_weights("blazeface/blazeface.pth")
facedet.load_anchors("blazeface/anchors.npy")
face_extractor = FaceExtractor(facedet=facedet)

# Function to extract faces from the video and apply image prediction
def predict_video(video_path):
    import cv2  # OpenCV for video handling
    
    # Read video frames
    cap = cv2.VideoCapture(video_path)
    frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
    cap.release()

    # Initialize lists for real and fake face predictions
    faces_real_pred = []
    faces_fake_pred = []
    
    for frame in frames:
        # Convert frame to PIL image
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame_pil = Image.fromarray(frame)
        
        # Extract faces from the frame using BlazeFace
        faces = face_extractor.process_image(img=frame_pil)
        
        if len(faces['faces']) > 0:

            face = faces['faces'][0]  # Take the face with highest confidence score
            
            # Transform the face to the format required by the model
            face_t = transf(image=face)['image']

            face_t = torch.unsqueeze(face_t, 0).to(device)
            
            # Predict using the image model (real or fake)
            with torch.no_grad():
                pred = torch.sigmoid(net(face_t)).cpu().numpy().flatten()
                
            # For single output prediction, pred[0] represents the "fake" score
            # 1 - pred[0] gives us the "real" score
            fake_score = pred[0]  # Fake score
            real_score = 1 - fake_score  # Real score
            
            # Store the predictions for real and fake
            faces_real_pred.append(real_score)
            faces_fake_pred.append(fake_score)
    
    # Aggregate results by averaging scores
    avg_real_score = np.mean(faces_real_pred)  # Average score for real faces
    avg_fake_score = np.mean(faces_fake_pred)  # Average score for fake faces
    
    # Print the results and predict overall video result
    print(f'Average score for REAL: {avg_real_score:.4f}')
    print(f'Average score for FAKE: {avg_fake_score:.4f}')
    
    # Decide if the video is real or fake based on the aggregated scores
    if avg_real_score > avg_fake_score:
        result = "REAL"
        confidence = avg_real_score
    else:
        result = "FAKE"
        confidence = avg_fake_score
    
    # Print overall prediction
    print(f'Video is predicted to be: {result} with confidence: {confidence:.4f}')
    return result, confidence

# Test the function with a video
video_path = 'samples/hugging.mp4'  # Replace with the path to your video
predict_video(video_path)
