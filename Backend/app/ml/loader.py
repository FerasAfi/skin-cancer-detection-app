from tensorflow.keras.models import load_model
from app.database.supa import supabase

data = (
    supabase
    .storage
    .from_("Private")
    .download("skin_cancer_model.h5")
)

with open("skin_cancer_model.h5", "wb") as f:
    f.write(data)

MODEL_PATH = 'skin_cancer_model.h5'

_model = None


def get_model():
    global _model

    if _model is None:
        _model = load_model(MODEL_PATH)

    return _model