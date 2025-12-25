import React, { useState } from 'react';
import LandingPage from './LandingPage';
import PersonalityScene from './PersonalityScene';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './App.css';

import { getRandomQuestions } from './utils/questionBank';

// --- QUESTIONNAIRE COMPONENT ---
const Questionnaire = ({ onComplete }) => {
    // Initialize questions once on mount so they don't change on re-renders
    const [questions] = useState(() => getRandomQuestions());

    const [scores, setScores] = useState({ E: 3, N: 3, A: 3, C: 3, O: 3 });
    const [index, setIndex] = useState(0);

    const handleNext = () => {
        if (index < questions.length - 1) {
            setIndex(index + 1);
        } else {
            onComplete(scores);
        }
    };

    const handleChange = (e) => {
        setScores({ ...scores, [questions[index].id]: parseFloat(e.target.value) });
    };

    const currentQ = questions[index];

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -100, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="questionnaire-card glass-panel"
        >
            <div className="progress-container">
                <div className="progress-bar-fill" style={{ width: `${((index + 1) / questions.length) * 100}%` }}></div>
            </div>
            
            <h2 className="tech-header">{currentQ.label}</h2>
            <p className="tech-subtext">"{currentQ.text}"</p>
            
            <div className="slider-container">
                <span className="slider-label">DISAGREE</span>
                <input 
                    type="range" 
                    min="1" max="5" step="0.5"
                    value={scores[currentQ.id]}
                    onChange={handleChange}
                    className="neon-slider"
                />
                <span className="slider-label">AGREE</span>
            </div>
            
            <div className="score-display">
                SCORE: <span className="cyan-text">{scores[currentQ.id]}</span>
            </div>

            <button onClick={handleNext} className="cyber-btn">
                {index === questions.length - 1 ? "INITIALIZE ISLAND" : "NEXT PARAMETER"}
            </button>
        </motion.div>
    );
};

// --- RESULTS OVERLAY ---
const ResultsOverlay = ({ result, onRetry }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="results-overlay glass-panel"
        >
            <h3 className="result-title">{result.archetype_label}</h3>
            <div className="data-grid">
                <div className="data-item">
                    <label>CLUSTER ID</label>
                    <span className="cyan-text">{result.cluster}</span>
                </div>
                <div className="data-item">
                    <label>PCA COORDS</label>
                    <span className="cyan-text">[{result.PCA1.toFixed(2)}, {result.PCA2.toFixed(2)}]</span>
                </div>
            </div>
            <div className="traits-list">
                {result.trait_combo.split(' ').map((t, i) => (
                    <span key={i} className="trait-tag">{t}</span>
                ))}
            </div>
            <button onClick={onRetry} className="retry-btn">RECALIBRATE</button>
        </motion.div>
    );
}

// --- MAIN APP COMPONENT ---
function App() {
    const [view, setView] = useState('landing');
    const [scores, setScores] = useState(null);
    const [result, setResult] = useState(null);

    const handleStart = () => setView('questionnaire');

    const handleComplete = async (finalScores) => {
        setScores(finalScores);
        setView('loading');
        try {
            const response = await axios.post('http://127.0.0.1:8000/predict', finalScores);
            setResult(response.data);
            setTimeout(() => setView('result'), 1000); // Artificial delay for effect
        } catch (err) {
            console.error(err);
            setResult({
                cluster: 0,
                archetype_label: "OFFLINE SIMULATION",
                trait_combo: "Introvert Calm Creative Balanced Warm",
                E_word: "Introvert", N_word: "Calm", A_word: "Warm", C_word: "Balanced", O_word: "Creative",
                PCA1: 0, PCA2: 0
            });
            setTimeout(() => setView('result'), 1000);
        }
    };

    return (
        <div className="app-root">
            <AnimatePresence mode='wait'>
                {view === 'landing' && (
                    <LandingPage key="landing" onStart={handleStart} />
                )}

                {view === 'questionnaire' && (
                    <div key="quiz" className="quiz-container">
                         <Questionnaire onComplete={handleComplete} />
                    </div>
                )}
                
                {view === 'loading' && (
                     <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="loading-screen"
                     >
                        <div className="hex-loader"></div>
                        <p className="loading-text">GENERATING NEURAL TOPOLOGY...</p>
                     </motion.div>
                )}

                {view === 'result' && (
                    <motion.div key="result" className="result-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <PersonalityScene result={result} scores={scores} />
                        <ResultsOverlay result={result} onRetry={() => setView('landing')} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* GLOBAL STYLES & GLASMOPRHISM */}
            <style>{`
                /* FONTS & BASE */
                .app-root {
                    width: 100vw;
                    height: 100vh;
                    background: #050505;
                    color: #fff;
                    overflow: hidden;
                    font-family: 'Rajdhani', sans-serif;
                }
                
                .cyan-text { color: #00f3ff; text-shadow: 0 0 10px rgba(0, 243, 255, 0.5); }
                
                /* GLASS PANEL UI */
                .glass-panel {
                    background: rgba(10, 10, 10, 0.6);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-left: 3px solid #FF4500;
                    box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
                }

                /* QUIZ STYLES */
                .quiz-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    background: radial-gradient(circle at center, #1a0a00, #000);
                }
                .questionnaire-card {
                    padding: 3rem;
                    width: 550px;
                    text-align: center;
                    position: relative;
                }
                .progress-container {
                    position: absolute;
                    top: 0; left: 0;
                    height: 4px; width: 100%;
                    background: #222;
                }
                .progress-bar-fill {
                    height: 100%;
                    background: #FF4500;
                    box-shadow: 0 0 10px #FF4500;
                    transition: width 0.4s ease;
                }
                .tech-header {
                    font-family: 'Orbitron', sans-serif;
                    color: #fff;
                    font-size: 2.5rem;
                    letter-spacing: 2px;
                    margin-bottom: 0.5rem;
                    text-shadow: 0 0 10px rgba(255, 69, 0, 0.5);
                }
                .tech-subtext {
                    font-family: 'Share Tech Mono', monospace;
                    color: #00f3ff;
                    font-size: 1.1rem;
                    margin-bottom: 3rem;
                }
                
                /* SLIDER */
                .slider-container {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                .slider-label {
                    font-family: 'Share Tech Mono', monospace;
                    font-size: 0.9rem;
                    color: #888;
                }
                .neon-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 4px;
                    background: #333;
                    border-radius: 2px;
                    outline: none;
                }
                .neon-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 20px;
                    height: 20px;
                    background: #FF4500;
                    border: 2px solid #fff;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 15px #FF4500;
                    transition: transform 0.1s;
                }
                .neon-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                }
                
                .score-display {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.2rem;
                    margin-bottom: 2.5rem;
                    color: #fff;
                }

                .cyber-btn {
                    padding: 1rem 3rem;
                    background: rgba(255, 69, 0, 0.1);
                    border: 1px solid #FF4500;
                    color: #FF4500;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 700;
                    letter-spacing: 2px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .cyber-btn:hover {
                    background: #FF4500;
                    color: #000;
                    box-shadow: 0 0 20px rgba(255, 69, 0, 0.6);
                }

                /* LOADING */
                .loading-screen {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #000;
                }
                .hex-loader {
                    width: 60px;
                    height: 60px;
                    background: #FF4500;
                    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                    animation: pulse 1.5s infinite;
                    margin-bottom: 2rem;
                }
                .loading-text {
                    font-family: 'Share Tech Mono', monospace;
                    color: #00f3ff;
                    letter-spacing: 2px;
                    animation: blink 2s infinite;
                }
                @keyframes pulse { 0% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.2; transform: scale(0.8); } }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

                /* RESULT OVERLAY */
                .result-container { width: 100%; height: 100%; position: relative; }
                .results-overlay {
                    position: absolute;
                    bottom: 30px; 
                    right: 30px;
                    padding: 1.5rem;
                    min-width: 280px;
                    max-width: 350px;
                }
                .result-title {
                    font-family: 'Orbitron', sans-serif;
                    color: #FF4500;
                    font-size: 1.8rem;
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid #333;
                    padding-bottom: 0.5rem;
                }
                .data-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .data-item label {
                    display: block;
                    font-size: 0.7rem;
                    color: #888;
                    font-family: 'Share Tech Mono', monospace;
                }
                .data-item span {
                    font-family: 'Rajdhani', sans-serif;
                    font-size: 1.2rem;
                    font-weight: 600;
                }
                .trait-tag {
                    display: inline-block;
                    border: 1px solid #00f3ff;
                    color: #00f3ff;
                    padding: 0.2rem 0.8rem;
                    margin: 0.2rem;
                    font-size: 0.8rem;
                    background: rgba(0, 243, 255, 0.05);
                }
                .retry-btn {
                    margin-top: 2rem;
                    background: transparent;
                    border: 1px solid #444;
                    color: #888;
                    padding: 0.8rem 2rem;
                    font-family: 'Share Tech Mono', monospace;
                    cursor: pointer;
                    width: 100%;
                    transition: 0.3s;
                }
                .retry-btn:hover {
                    border-color: #FF4500;
                    color: #FF4500;
                    letter-spacing: 2px;
                }
            `}</style>
        </div>
    );
}

export default App;
