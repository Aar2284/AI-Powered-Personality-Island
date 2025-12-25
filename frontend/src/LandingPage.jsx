import React from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, Stars, Sparkles, OrbitControls, Environment } from '@react-three/drei';

// --- 3D HERO ELEMENT ---
const HeroIsland = () => {
  return (
    <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 5]} intensity={1.5} color="#FF4500" />
      <pointLight position={[-10, 5, -5]} intensity={1} color="#00f3ff" />
      <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={1} color="#FF8C00" />

      {/* Atmospheric Background */}
      <Stars radius={150} depth={50} count={7000} factor={4} saturation={0.5} fade speed={0.5} />
      <Environment preset="night" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
         <planeGeometry args={[100, 100]} />
         <meshStandardMaterial color="#050505" transparent opacity={0.8} />
      </mesh>
      
      {/* Retro Sci-Fi Grid */}
      <gridHelper args={[80, 80, 0xFF4500, 0x222222]} position={[0, -2, 0]} />
      
      {/* Floating Particles for Depth */}
      <Sparkles count={100} scale={12} size={3} speed={0.2} opacity={0.7} color="#FF8C00" />
      
      {/* Fog for Depth */}
      <fog attach="fog" args={['#050505', 5, 25]} />

      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate 
        autoRotateSpeed={0.2} 
        maxPolarAngle={Math.PI / 2 - 0.1}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  );
};

// --- LANDING PAGE COMPONENT ---
const LandingPage = ({ onStart }) => {
    return (
        <div className="landing-container">
            {/* 3D Background Layer */}
            <div className="canvas-layer">
                <HeroIsland />
            </div>

            {/* UI Content Layer */}
            <div className="content-layer">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
                    className="hero-text"
                >
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="logo-wrapper"
                    >
                        <h1 className="main-title">ISLAND.AI</h1>
                        <div className="glow-bar"></div>
                    </motion.div>

                    <motion.p
                        className="subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                    >
                        Map Your Mind. <span className="highlight">Visualize Your Soul.</span>
                    </motion.p>
                    
                    <motion.button 
                        className="start-btn"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        whileHover={{ 
                            scale: 1.05, 
                            boxShadow: "0 0 35px rgba(255, 69, 0, 0.6)",
                            letterSpacing: "4px"
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onStart}
                    >
                        <span className="btn-text">INITIALIZE SIMULATION</span>
                        <div className="btn-bg"></div>
                    </motion.button>
                </motion.div>

                {/* Decorative Elements */}
                <div className="bottom-bar">
                   <div className="status-item">
                       <div className="status-dot"></div>
                       <span>NEURAL LINK: <span className="status-active">ACTIVE</span></span>
                   </div>
                   <div className="status-item center-code">
                       <span>V.1.0.4</span>
                   </div>
                   <div className="status-item right-align">
                       <span>PSYCHOMETRICS ENGINE</span>
                   </div>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&display=swap');

                .landing-container {
                    position: relative;
                    width: 100vw;
                    height: 100vh;
                    background: #050505;
                    overflow: hidden;
                    font-family: 'Rajdhani', sans-serif;
                }
                .canvas-layer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                }
                .content-layer {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                    background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%);
                }
                .hero-text {
                    text-align: center;
                    pointer-events: auto;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                }
                .logo-wrapper {
                    position: relative;
                    margin-bottom: 0.5rem;
                }
                .main-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 8rem;
                    color: #fff;
                    letter-spacing: 12px;
                    margin: 0;
                    font-weight: 900;
                    text-shadow: 0 0 20px rgba(255, 69, 0, 0.3);
                    background: linear-gradient(180deg, #ffffff 0%, #a0a0a0 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .glow-bar {
                    width: 100%;
                    height: 2px;
                    background: #FF4500;
                    box-shadow: 0 0 15px #FF4500, 0 0 30px #FF4500;
                    margin-top: 0px;
                }
                .subtitle {
                    font-size: 1.5rem;
                    color: #aaa;
                    margin: 0;
                    letter-spacing: 6px;
                    text-transform: uppercase;
                    font-weight: 300;
                }
                .highlight {
                    color: #FF8C00;
                    font-weight: 600;
                    text-shadow: 0 0 10px rgba(255, 140, 0, 0.5);
                }
                .start-btn {
                    position: relative;
                    margin-top: 4rem;
                    padding: 1.2rem 3.5rem;
                    background: transparent;
                    border: 1px solid rgba(255, 69, 0, 0.5);
                    cursor: pointer;
                    overflow: hidden;
                    transition: all 0.4s ease;
                }
                .btn-text {
                    position: relative;
                    z-index: 2;
                    color: #FF4500;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.1rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                    transition: color 0.4s;
                }
                .btn-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 0%;
                    height: 100%;
                    background: #FF4500;
                    z-index: 1;
                    transition: width 0.4s cubic-bezier(0.19, 1, 0.22, 1);
                }
                .start-btn:hover {
                    border-color: #FF4500;
                }
                .start-btn:hover .btn-bg {
                    width: 100%;
                }
                .start-btn:hover .btn-text {
                    color: #fff;
                }
                
                .bottom-bar {
                    position: absolute;
                    bottom: 0;
                    width: 100%;
                    padding: 1.5rem 3rem;
                    display: flex;
                    justify-content: space-between;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(5px);
                    box-sizing: border-box;
                }
                .status-item {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    color: #666;
                    font-size: 0.9rem;
                    letter-spacing: 2px;
                    font-weight: 500;
                    text-transform: uppercase;
                }
                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: #2ecc71;
                    border-radius: 50%;
                    box-shadow: 0 0 8px #2ecc71;
                    animation: pulse 2s infinite;
                }
                .status-active {
                    color: #fff;
                    font-weight: 700;
                }
                
                @keyframes pulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { opacity: 0.5; }
                }

                @media (max-width: 1024px) {
                    .main-title { font-size: 6rem; }
                }
                @media (max-width: 768px) {
                    .main-title { font-size: 3.5rem; letter-spacing: 4px; }
                    .subtitle { font-size: 1rem; letter-spacing: 2px; }
                    .bottom-bar { padding: 1rem; flex-direction: column; align-items: center; gap: 0.5rem; }
                    .start-btn { padding: 1rem 2rem; margin-top: 2.5rem; }
                }
            `}</style>
        </div>
    );
};

export default LandingPage;

