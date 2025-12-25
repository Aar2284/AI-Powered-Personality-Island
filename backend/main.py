import joblib
import json
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
import os
from fastapi.middleware.cors import CORSMiddleware

# --- 1. MODEL LOADING ---
# Define the path where the artifacts are stored (as per documentation)
MODEL_DIR = "models" 

try:
    # Load all ML artifacts using joblib for .pkl files
    SCALER = joblib.load(os.path.join(MODEL_DIR, "scaler_big5.pkl")) # Standard Scaler 
    PCA_MODEL = joblib.load(os.path.join(MODEL_DIR, "pca_big5.pkl")) # PCA Model 
    KMEANS = joblib.load(os.path.join(MODEL_DIR, "kmeans_big5.pkl")) # K-Means Cluster Model 
    
    # Load human-readable labels from dict and json
    with open(os.path.join(MODEL_DIR, "cluster_labels_dict.pkl"), 'rb') as f:
        CLUSTER_LABELS = joblib.load(f) # Human-friendly cluster names 

    with open(os.path.join(MODEL_DIR, "quantiles.json"), 'r') as f:
        QUANTILES = json.load(f) # Data-driven boundaries for trait words 
    
    print("--- Successfully loaded all ML models and artifacts. ---")

except FileNotFoundError as e:
    print(f"ERROR: Could not find ML model file: {e}. Ensure all files are in the '{MODEL_DIR}' directory.")
    # Fail fast so we don't start the server with broken state
    raise e
    
# --- 2. INPUT AND OUTPUT DEFINITION (Pydantic Models) ---
# Input must accept E, N, A, C, O scores as numbers 
class BigFiveInput(BaseModel):
    E: float
    N: float
    A: float
    C: float
    O: float

# Output structure definition [cite: 95]
class PersonalityOutput(BaseModel):
    cluster: int                        # Cluster ID (0-6) [cite: 96]
    archetype_label: str                # Human-friendly label [cite: 97]
    trait_combo: str                    # Full trait sentence [cite: 98, 80]
    E_word: str                         # E trait word (e.g., "Extrovert") [cite: 103]
    N_word: str                         # N trait word (e.g., "Calm") [cite: 104]
    A_word: str                         # A trait word (e.g., "Compassionate") [cite: 105]
    C_word: str                         # C trait word (e.g., "Balanced") [cite: 106]
    O_word: str                         # O trait word (e.g., "Creative") [cite: 107]
    PCA1: float                         # First PCA coordinate [cite: 108]
    PCA2: float                         # Second PCA coordinate [cite: 109]


# --- HELPER FUNCTION: Trait Word Assignment ---
# Uses the quantiles to assign low/mid/high labels (trait words) [cite: 41]
def get_trait_word(trait, score):
    # Mapping based on Big Five (using documentation examples)
    MAPPING = {
        'E': {0: 'Introvert', 1: 'Ambivert', 2: 'Extrovert'},
        'N': {0: 'Sensitive', 1: 'Balanced', 2: 'Calm'}, # Note N is reversed vs standard model phrasing
        'A': {0: 'Reserved', 1: 'Warm', 2: 'Compassionate'},
        'C': {0: 'Relaxed', 1: 'Balanced', 2: 'Organized'},
        'O': {0: 'Traditional', 1: 'Open-minded', 2: 'Creative'}
    }
    
    # Quantiles define the 33% (low) and 67% (mid) boundaries [cite: 41]
    q33 = QUANTILES[trait]['33']
    q67 = QUANTILES[trait]['67']

    if score <= q33:
        level = 0  # Low (33%)
    elif score <= q67:
        level = 1  # Mid (33%-67%)
    else:
        level = 2  # High (67%+)
        
    return MAPPING[trait][level]


# --- 3. FASTAPI ENDPOINT ---
app = FastAPI(
    title="AI-Powered Personality Island Backend",
    description="Exposes the trained ML model for personality prediction."
)

# --- ADD THIS BLOCK ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (simplest for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
# ----------------------

@app.post("/predict", response_model=PersonalityOutput) # Defines the /predict endpoint [cite: 72]
def predict(input_data: BigFiveInput):
    # Prepare input data as a numpy array for scikit-learn
    # Order must match training: E, N, A, C, O
    raw_scores = np.array([[
        input_data.E, 
        input_data.N, 
        input_data.A, 
        input_data.C, 
        input_data.O
    ]])

    # 1. Scaling (Standardize Data) [cite: 30, 75]
    scaled_data = SCALER.transform(raw_scores)

    # 2. PCA (Dimensionality Reduction) [cite: 32, 76]
    pca_result = PCA_MODEL.transform(scaled_data)[0] # Get PCA1 and PCA2

    # 3. Clustering (Find Archetype) [cite: 34, 77]
    cluster_id = int(KMEANS.predict(scaled_data)[0])
    archetype_label = CLUSTER_LABELS[cluster_id] # Archetype label [cite: 78]

    # 4. Trait Words (Data-driven labels) [cite: 40, 79]
    E_word = get_trait_word('E', input_data.E)
    N_word = get_trait_word('N', input_data.N)
    A_word = get_trait_word('A', input_data.A)
    C_word = get_trait_word('C', input_data.C)
    O_word = get_trait_word('O', input_data.O)
    
    # 5. Full Trait Combo Sentence [cite: 80]
    trait_combo = f"{E_word} {N_word} {O_word} {C_word} {A_word}"
    
    # Return the full JSON output to the frontend [cite: 81]
    return PersonalityOutput(
        cluster=cluster_id,
        archetype_label=archetype_label,
        trait_combo=trait_combo,
        E_word=E_word,
        N_word=N_word,
        A_word=A_word,
        C_word=C_word,
        O_word=O_word,
        PCA1=float(pca_result[0]),
        PCA2=float(pca_result[1])
    )