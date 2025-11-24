from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import json

app = FastAPI(title="Personality Island API")

# Load ML model files
scaler = joblib.load("models/scaler_big5.pkl")
pca = joblib.load("models/pca_big5.pkl")
kmeans_final = joblib.load("models/kmeans_big5.pkl")
cluster_labels = joblib.load("models/cluster_labels_dict.pkl")

# Load real quantiles computed from the training dataset
with open("models/quantiles.json", "r") as f:
    quantiles = json.load(f)


def trait_word(value, trait_name, low_word, mid_word, high_word):
    low_t = quantiles[trait_name]["low"]
    high_t = quantiles[trait_name]["high"]
    if value <= low_t:
        return low_word
    elif value >= high_t:
        return high_word
    else:
        return mid_word


class TraitsInput(BaseModel):
    E: float
    N: float
    A: float
    C: float
    O: float


@app.get("/")
def root():
    return {"status": "ok", "message": "Personality Island API running"}


@app.post("/predict")
def predict_traits(input_data: TraitsInput):
    E, N, A, C, O = input_data.E, input_data.N, input_data.A, input_data.C, input_data.O

    x = np.array([[E, N, A, C, O]])

    x_scaled = scaler.transform(x)
    x_pca = pca.transform(x_scaled)
    pca1, pca2 = float(x_pca[0, 0]), float(x_pca[0, 1])

    cluster = int(kmeans_final.predict(x)[0])
    archetype = cluster_labels[cluster]

    E_word = trait_word(E, "E", "Introvert", "Ambivert", "Extrovert")
    N_word = trait_word(N, "N", "Calm", "Balanced", "Sensitive")
    A_word = trait_word(A, "A", "Reserved", "Warm", "Compassionate")
    C_word = trait_word(C, "C", "Relaxed", "Balanced", "Organized")
    O_word = trait_word(O, "O", "Traditional", "Open-minded", "Creative")

    combo = f"{E_word} · {N_word} · {O_word} · {C_word} · {A_word}"

    return {
        "cluster": cluster,
        "archetype_label": archetype,
        "trait_combo": combo,
        "E": E, "N": N, "A": A, "C": C, "O": O,
        "E_word": E_word,
        "N_word": N_word,
        "A_word": A_word,
        "C_word": C_word,
        "O_word": O_word,
        "PCA1": pca1,
        "PCA2": pca2,
    }
