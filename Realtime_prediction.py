import torch
import cv2
import numpy as np
from scipy.special import expit
from blazeface import BlazeFace
from architectures import fornet, weights
from isplutils import utils
import mediapipe as mp

# ## Parameters
net_model = 'EfficientNetAutoAttB4'
train_db = 'DFDC'

device = torch.device('cuda:0') if torch.cuda.is_available() else torch.device('cpu')
face_policy = 'scale'
face_size = 224

# ## Initialization
model_url = weights.weight_url['{:s}_{:s}'.format(net_model, train_db)]
net = getattr(fornet, net_model)().eval().to(device)
net.load_state_dict(torch.hub.load_state_dict_from_url(model_url, map_location=device, check_hash=True))

transf = utils.get_transformer(face_policy, face_size, net.get_normalizer(), train=False)

facedet = BlazeFace().to(device)
facedet.load_weights("blazeface/blazeface.pth")
facedet.load_anchors("blazeface/anchors.npy")

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(max_num_faces=1, refine_landmarks=True, min_detection_confidence=0.5, min_tracking_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils
drawing_spec = mp_drawing.DrawingSpec(thickness=1, circle_radius=1)

# ## Function to classify a single frame
def align_face(frame_rgb, landmarks):
    h, w, _ = frame_rgb.shape
    x1, y1 = np.min(landmarks[:, :2], axis=0).astype(int)
    x2, y2 = np.max(landmarks[:, :2], axis=0).astype(int)
    x1, y1, x2, y2 = max(0, x1), max(0, y1), min(w, x2), min(h, y2)
    return frame_rgb[y1:y2, x1:x2]

def classify_frame(frame_rgb):

    # Resize frame to 128x128 for BlazeFace
    resized_frame = cv2.resize(frame_rgb, (128, 128))

    # Convert to PyTorch tensor
    img_tensor = torch.tensor(resized_frame).permute(2, 0, 1).unsqueeze(0).float()

    # Detect faces using BlazeFace
    detections = facedet.predict_on_image(resized_frame)
    if detections.shape[0] == 0:
        return frame_rgb, "No Face Detected", 0.0  # No face found

    # Convert detection tensor to NumPy array
    detections = detections.cpu().numpy()  # Ensure it's a NumPy array

    # Get image dimensions
    h, w, _ = frame_rgb.shape

    # Extract first face bounding box and scale coordinates to original frame size
    x1, y1, x2, y2 = (detections[0, :4] * np.array([w / 128, h / 128, w / 128, h / 128])).astype(int)

    # Ensure bounding box is within valid range
    x1, y1, x2, y2 = max(0, x1), max(0, y1), min(w, x2), min(h, y2)

    # Extract and preprocess face
    face = frame_rgb[y1:y2, x1:x2]
    if face.size == 0:
        return frame_rgb, "No Face Detected", 0.0

    face_t = transf(image=face)['image'].unsqueeze(0).to(device)

    # Predict using model
    with torch.no_grad():
        face_pred = net(face_t).cpu().numpy().flatten()

    # Compute classification
    avg_score = expit(face_pred.mean())
    classification = "REAL" if avg_score < 0.7 else "FAKE"

    return frame_rgb, classification, avg_score