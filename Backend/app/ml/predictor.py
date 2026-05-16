import numpy as np
from app.ml.loader import get_model
from app.ml.labels import CLASS_NAMES


def predict(image_tensor):

    model = get_model()

    prob = model.predict(image_tensor, verbose=0)[0]

    pred_idx = int(np.argmax(prob))

    confidence = float(prob[pred_idx])

    label = CLASS_NAMES[pred_idx]

    return {
        "label": label,
        "class_id": pred_idx,
        "confidence": confidence
    }