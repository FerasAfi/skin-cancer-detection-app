import cv2
import numpy as np


IMG_SIZE = (200, 150)


def preprocess_image(image_bytes):
    img = cv2.imdecode(
        np.frombuffer(image_bytes, np.uint8),
        cv2.IMREAD_COLOR
    )

    img = cv2.resize(img, (IMG_SIZE[0], IMG_SIZE[1]))
    img = img.astype("float32") / 255.0
    img = np.expand_dims(img, axis=0)

    return img