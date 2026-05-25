import tensorflow as tf
from app.database.supa import supabase

data = (
    supabase
    .storage
    .from_("Private")
    .download("skin_cancer_model.tflite")
)

with open("skin_cancer_model.tflite", "wb") as f:
    f.write(data)

MODEL_PATH = "skin_cancer_model.tflite"

_model = None


def get_model():
    global _model

    if _model is None:

        interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)

        interpreter.allocate_tensors()

        _model = interpreter

    return _model