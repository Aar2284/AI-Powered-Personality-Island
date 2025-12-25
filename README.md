# AI-Powered Personality Island 🏝️

**An interactive web application that visualizes your personality as a unique, procedurally generated 3D island.**

[![React Badge](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![FastAPI Badge](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Scikit-learn Badge](https://img.shields.io/badge/ML-Scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn)](https://scikit-learn.org/)

---

## 📜 Overview

This project translates a user's **Big Five personality traits** (Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism) into a unique, explorable 3D island.

The user answers a short questionnaire, and a custom-trained machine learning model in the backend analyzes their scores. This generates a unique "personality profile" which is then sent to the frontend to construct a beautiful and personalized island scene in real-time. This project serves as a demonstration of an end-to-end ML system, from data analysis and model training to deployment via a web API and consumption by a creative frontend.

## ✨ Features

- **Interactive Questionnaire:** A simple, 5-slider questionnaire to input personality scores.
- **AI-Powered Analysis:** A robust backend uses a K-Means clustering and PCA model to generate a rich personality profile.
- **Procedural 3D Generation:** A dynamic React frontend using `react-three-fiber` to render a unique island based on the AI profile.
- **Massive Uniqueness:** The three-layer generation system (cluster template + trait modifiers + PCA variation) allows for hundreds of thousands of visually distinct islands.
- **Dynamic Naming:** Each island gets a unique, evocative name generated from its personality traits (e.g., "Radiant Dreamscape of Kindred Hearts").

## 🤖 Machine Learning Model and Training

The core of this project is the ML pipeline that transforms five simple scores into a rich, structured profile for the frontend. The entire training process is documented in `notebooks/Model_training_with_graphical_representation.ipynb` and codified for production in `backend/train_full.py`.

### Dataset
- **Source:** [IPIP-FFM Dataset](https://openpsychometrics.org/_rawdata/) (International Personality Item Pool - Five-Factor Model).
- **Size:** Contains responses from over 1 million participants on 50 personality-related questions.
- **Usage:** This large-scale dataset allows the model to learn natural patterns and archetypes in human personality.

### Model Training Pipeline
The ML pipeline consists of several stages:

1.  **Data Loading and Cleaning:** The raw `data-final.csv` is loaded. Invalid entries are dropped and the data is filtered to the 50 essential question columns.
2.  **Trait Scoring:** The five personality scores (E, N, A, C, O) are calculated for each participant using the official scoring key from the IPIP-FFM codebook.
3.  **Standardization:** The five scores are processed with `StandardScaler` from Scikit-learn. This normalizes the data to have a mean of 0 and a standard deviation of 1, ensuring all traits are weighted equally in the subsequent steps.
4.  **K-Means Clustering:** A `KMeans` model is trained to group participants into distinct personality archetypes. After experimenting with different `k` values (visualized in the notebook), **k=7** was chosen as it provided a good balance of granularity and distinction between archetypes. These 7 clusters form the foundation for the island's base templates.
5.  **Principal Component Analysis (PCA):** A `PCA` model is trained to reduce the 5-dimensional personality space into just 2 dimensions (Principal Components 1 and 2). These two continuous values capture the most significant variance in the data and are used by the frontend to create subtle, unique variations for every user.
6.  **Quantile-Based Labeling:** Instead of using static thresholds, the 33rd and 67th percentiles (quantiles) for each of the five traits are calculated from the real dataset. These data-driven boundaries are used to assign descriptive, three-tier labels (e.g., "Introvert", "Ambivert", "Extrovert") to a user's score, making the output scientifically grounded.

### Model Artifacts
The training process generates several files saved in `backend/models/`, which are loaded by the FastAPI server for prediction:
- `kmeans_big5.pkl`: The trained K-Means clustering model.
- `pca_big5.pkl`: The trained PCA model.
- `scaler_big5.pkl`: The fitted StandardScaler.
- `quantiles.json`: Stores the calculated 33rd and 67th percentile values for each trait.
- `cluster_labels_dict.pkl`: A dictionary that maps the 7 cluster IDs to human-readable archetype names (e.g., "Introvert-Calm-Open-minded").

## 🚀 Getting Started

### Prerequisites
- Node.js and npm
- Python 3.9+ and pip

### 1. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows: venv\Scripts\activate
# On macOS/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload
```
The backend API will now be running at `http://127.0.0.1:8000`.

### 2. Frontend Setup
```bash
# In a new terminal, navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Run the Vite development server
npm run dev
```
The application will be running at `http://localhost:5173`.

## 🔌 API Endpoint

The project uses a single API endpoint to get the personality profile.

-   **URL:** `/predict`
-   **Method:** `POST`
-   **Request Body:**
    ```json
    {
      "E": 4.5, "N": 2.0, "A": 4.0, "C": 3.0, "O": 5.0
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
      "cluster": 1,
      "archetype_label": "Extrovert-Balanced-Open-minded",
      "trait_combo": "Extrovert Calm Creative Balanced Compassionate",
      "E_word": "Extrovert",
      "N_word": "Calm",
      "A_word": "Compassionate",
      "C_word": "Balanced",
      "O_word": "Creative",
      "PCA1": 1.28,
      "PCA2": -0.45
    }
    ```

## 🔮 Future Scope

- Enhance the 3D visualizations with more complex assets, shaders, and animations.
- Integrate more nuanced and detailed personality models beyond the Big Five.
- Add more interactive elements to the island scene, allowing users to explore their world.

## 🙏 Acknowledgments

This project's machine learning model was trained on data from the **International Personality Item Pool**.
- Johnson, J. A. (2014). Measuring the Big Five personality factors with the IPIP-FFM.
