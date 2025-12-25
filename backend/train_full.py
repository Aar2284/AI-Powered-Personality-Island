import pandas as pd
import numpy as np
import joblib
import json
import os
from datasets import load_dataset
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans

# --- CONFIGURATION ---
MODEL_DIR = "models"  # Directory to save the final models
N_CLUSTERS = 7        # Fixed number of clusters (island types)
RANDOM_STATE = 42     # Ensures consistent results

# --- SCORING KEY (Standard IPIP-50 Key) ---
# Used to calculate E, N, A, C, O scores from the 50 raw questions.
# '+' means score is added directly; '-' means the score is reverse-coded (e.g., 5 becomes 1).
SCORING_KEY = {
    'EXT': {1: '+', 2: '-', 3: '+', 4: '-', 5: '+', 6: '-', 7: '+', 8: '-', 9: '+', 10: '-'},
    'EST': {1: '-', 2: '+', 3: '-', 4: '+', 5: '-', 6: '+', 7: '-', 8: '-', 9: '-', 10: '-'}, # N (Neuroticism)
    'AGR': {1: '-', 2: '+', 3: '-', 4: '+', 5: '-', 6: '+', 7: '-', 8: '+', 9: '+', 10: '+'},
    'CSN': {1: '+', 2: '-', 3: '+', 4: '-', 5: '+', 6: '-', 7: '+', 8: '-', 9: '+', 10: '-'},
    'OPN': {1: '+', 2: '-', 3: '+', 4: '-', 5: '+', 6: '-', 7: '+', 8: '+', 9: '+', 10: '+'}
}

def ensure_dir(directory):
    """Creates the models directory if it doesn't exist."""
    if not os.path.exists(directory):
        os.makedirs(directory)
        
def score_traits(df):
    """Calculates the Big 5 final scores (E, N, A, C, O) from raw responses."""
    scores = pd.DataFrame(index=df.index)
    trait_map = {'EXT': 'E', 'EST': 'N', 'AGR': 'A', 'CSN': 'C', 'OPN': 'O'}

    for prefix, trait_label in trait_map.items():
        trait_cols = []
        for i in range(1, 11):
            col_name = f"{prefix}{i}"
            if col_name not in df.columns: continue
            
            # Reverse coding logic: 6 - score
            if SCORING_KEY[prefix][i] == '-':
                # Create a column with the reverse-coded score
                scores[f"{col_name}_scored"] = 6 - df[col_name] 
            else:
                scores[f"{col_name}_scored"] = df[col_name]
                
            trait_cols.append(f"{col_name}_scored")
        
        # Average the 10 scored items to get the final trait score (1.0 to 5.0)
        scores[trait_label] = scores[trait_cols].mean(axis=1)
    
    return scores[['E', 'N', 'A', 'C', 'O']]

# =========================================================================
# MAIN EXECUTION FLOW: The 7-Step Pipeline
# =========================================================================

def train_model():
    ensure_dir(MODEL_DIR)
    
    # 1. DOWNLOAD & LOAD DATA
    print("STEP 1: Downloading & Loading IPIP-FFM Dataset (1M+ rows)...")
    ds = load_dataset("Tetratics/2018-11-08-OpenPsychometrics-IPIP-FFM")
    # Concatenate all splits (train, test, validation) for maximum data coverage
    df_list = [ds[split].to_pandas() for split in ds.keys()]
    raw_df = pd.concat(df_list, ignore_index=True)
    print(f"   > Raw data loaded. Total rows: {len(raw_df)}")
    
    # 2. DATA CLEANING & FILTERING
    print("STEP 2: Cleaning Data (Filtering 50 questions & removing missing values)...")
    relevant_cols = [f"{trait}{i}" for trait in ['EXT', 'EST', 'AGR', 'CSN', 'OPN'] for i in range(1, 11)]
            
    clean_df = raw_df[relevant_cols].dropna()
    clean_df = clean_df[(clean_df > 0).all(axis=1)] # Drop rows where score is 0 (missing)
    print(f"   > Clean data rows remaining: {len(clean_df)}")

    # 3. SCORING
    print("STEP 3: Calculating Final Big 5 Scores (E, N, A, C, O)...")
    final_scores = score_traits(clean_df)
    
    # --- ML Pipeline Starts Here (Image of Machine Learning pipeline showing Standardization, PCA, and Clustering) ---
    
    # 4. TRAIN SCALER (STANDARDIZATION)
    print("STEP 4: Training StandardScaler (Scaler) and saving...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(final_scores)
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler_big5.pkl"))
    
    # 5. TRAIN PCA (DIMENSIONALITY REDUCTION)
    print("STEP 5: Training PCA (5 dimensions -> 2 coordinates) and saving...")
    pca = PCA(n_components=2, random_state=RANDOM_STATE)
    pca.fit(X_scaled)
    joblib.dump(pca, os.path.join(MODEL_DIR, "pca_big5.pkl"))
    
    # 6. TRAIN CLUSTERING (ARCHETYPE DISCOVERY)
    print(f"STEP 6: Training KMeans Clustering (k={N_CLUSTERS}) and saving...")
    kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=RANDOM_STATE, n_init='auto')
    kmeans.fit(X_scaled)
    joblib.dump(kmeans, os.path.join(MODEL_DIR, "kmeans_big5.pkl"))
    
    # 7. GENERATING LABELS & QUANTILES (ARTIFACT GENERATION)
    print("STEP 7: Generating Cluster Labels and Trait Quantiles...")
    
    # A. Cluster Labels (Archetype Names)
    cluster_centers = scaler.inverse_transform(kmeans.cluster_centers_)
    labels_dict = {}
    trait_names = ['E', 'N', 'A', 'C', 'O']
    
    for i, center in enumerate(cluster_centers):
        # Decision: Label the cluster based on the trait that has the highest score average.
        highest_idx = np.argmax(center)
        trait_name = trait_names[highest_idx]
        labels_dict[i] = f"Cluster {i} ({trait_name}-Dominant Archetype)"
    
    joblib.dump(labels_dict, os.path.join(MODEL_DIR, "cluster_labels_dict.pkl"))

    # B. Quantiles (Boundaries for Trait Words: Introvert/Ambivert/Extrovert, etc.)
    quantiles_dict = {}
    for trait in trait_names:
        # 33% (low) and 67% (high) are the boundaries
        q33 = final_scores[trait].quantile(0.33)
        q67 = final_scores[trait].quantile(0.67)
        quantiles_dict[trait] = {'33': round(q33, 3), '67': round(q67, 3)}
        
    with open(os.path.join(MODEL_DIR, "quantiles.json"), 'w') as f:
        json.dump(quantiles_dict, f, indent=4)

    print("\n--- ✅ MODEL TRAINING COMPLETE ---")
    print(f"5 Artifacts saved to: {os.path.abspath(MODEL_DIR)}")
    print("You can now restart your backend server to use this new, trained model.")

if __name__ == "__main__":
    train_model()
