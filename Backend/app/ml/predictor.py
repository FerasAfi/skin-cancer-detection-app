import numpy as np
from app.ml.loader import get_model
from app.ml.labels import CLASS_NAMES


def predict(image_tensor):

    model = get_model()

    input_details = model.get_input_details()
    output_details = model.get_output_details()

    model.set_tensor(
        input_details[0]['index'],
        image_tensor.astype(np.float32)
    )

    model.invoke()

    prob = model.get_tensor(
        output_details[0]['index']
    )[0]

    pred_idx = int(np.argmax(prob))

    confidence = float(prob[pred_idx])

    label = CLASS_NAMES[pred_idx]

    return {
        "label": label,
        "class_id": pred_idx,
        "confidence": confidence
    }