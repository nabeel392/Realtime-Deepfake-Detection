#!/usr/bin/env python
# coding: utf-8

import torch
from torch.utils.model_zoo import load_url
import matplotlib.pyplot as plt
from scipy.special import expit

import sys
sys.path.append('..')

from blazeface import FaceExtractor, BlazeFace, VideoReader
from architectures import fornet,weights
from isplutils import utils

# ## Parameters
net_model = 'EfficientNetAutoAttB4'
train_db = 'DFDC'

device = torch.device('cuda:0') if torch.cuda.is_available() else torch.device('cpu')
face_policy = 'scale'
face_size = 224
frames_per_video = 32

# ## Initialization
model_url = weights.weight_url['{:s}_{:s}'.format(net_model,train_db)]
net = getattr(fornet,net_model)().eval().to(device)
net.load_state_dict(load_url(model_url, map_location=device, check_hash=True))

transf = utils.get_transformer(face_policy, face_size, net.get_normalizer(), train=False)

facedet = BlazeFace().to(device)
facedet.load_weights("blazeface/blazeface.pth")
facedet.load_anchors("blazeface/anchors.npy")
videoreader = VideoReader(verbose=False)
video_read_fn = lambda x: videoreader.read_frames(x, num_frames=frames_per_video)
face_extractor = FaceExtractor(video_read_fn=video_read_fn, facedet=facedet)

# ## Function to classify the video
def classify_video(video_path):
    # Detect faces from the video
    vid_faces = face_extractor.process_video(video_path)

    # Extract faces and apply transformations
    faces_t = torch.stack([transf(image=frame['faces'][0])['image'] for frame in vid_faces if len(frame['faces'])])

    # Predict the scores for the faces
    with torch.no_grad():
        faces_pred = net(faces_t.to(device)).cpu().numpy().flatten()

    # Calculate average score
    avg_score = expit(faces_pred.mean())

    # Classify based on the score
    if avg_score < 0.35:
        classification = "REAL"
    else:
        classification = "FAKE"

    return faces_pred, classification, avg_score

# ## Test with one video
# video_path = 'samples/exit_phone_room.mp4'  # Replace with the path to your input video
# faces_pred, classification, avg_score = classify_video(video_path)

# print(f"The video is classified as: {classification}")
# print(f"Average confidence score: {avg_score:.4f}")

# # Plot the frame predictions
# fig, ax = plt.subplots(figsize=(8, 4))
# ax.stem([f['frame_idx'] for f in face_extractor.process_video(video_path) if len(f['faces'])], 
#         expit(faces_pred))
# ax.set_title(f'Prediction for {classification} video')
# ax.set_xlabel('Frame')
# ax.set_ylabel('Score')
# ax.set_ylim([0, 1])
# ax.grid(True)

# plt.show()
