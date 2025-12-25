import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Stars, Cloud, Sparkles, Environment, ContactShadows, Sky } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { generateIslandName } from './utils/islandNameGenerator';

// --- ASSET CONFIG ---
const CLUSTER_CONFIG = {
  0: { ground: "#2E2E3A", grass: "#4A4E69", features: "crystal", building: "tower", mood: "mystic" },
  1: { ground: "#E9C46A", grass: "#F4A261", features: "totem", building: "hut", mood: "sunset" },
  2: { ground: "#264653", grass: "#2A9D8F", features: "lantern", building: "cabin", mood: "forest" },
  3: { ground: "#606C38", grass: "#DDA15E", features: "monolith", building: "house", mood: "neutral" },
  4: { ground: "#1D3557", grass: "#A8DADC", features: "spike", building: "fort", mood: "cold" },
  5: { ground: "#F4ACB7", grass: "#FFCAD4", features: "orb", building: "temple", mood: "dream" },
  6: { ground: "#3D0000", grass: "#9D0208", features: "vent", building: "modern", mood: "volcano" }
};

// --- PROCEDURAL ANIMALS & CHARACTERS ---

// 1. SIMPLE BIRD (V-Shape animation)
function Bird({ position }) {
  const birdRef = useRef();
  const [speed] = useState(0.5 + Math.random() * 0.5);
  const [offset] = useState(Math.random() * 100);

  useFrame(({ clock }) => {
     if(birdRef.current) {
        const t = clock.getElapsedTime() * speed + offset;
        // Float around in a circle
        birdRef.current.position.x = Math.sin(t) * 2;
        birdRef.current.position.z = Math.cos(t) * 2;
        birdRef.current.position.y = position[1] + Math.sin(t * 3) * 0.2;
        birdRef.current.rotation.y = t + Math.PI / 2;
     }
  });

  return (
    <group ref={birdRef} position={position}>
       {/* Left Wing */}
       <mesh position={[0.1, 0, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.2, 0.02, 0.05]} />
          <meshStandardMaterial color="#FFF" />
       </mesh>
       {/* Right Wing */}
       <mesh position={[-0.1, 0, 0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.2, 0.02, 0.05]} />
          <meshStandardMaterial color="#FFF" />
       </mesh>
    </group>
  )
}

// 2. LOW POLY PERSON
function Person({ position, color }) {
    const group = useRef();
    const [walkSpeed] = useState(0.5 + Math.random() * 0.5);
    
    useFrame(({ clock }) => {
        if (group.current) {
            const t = clock.getElapsedTime() * walkSpeed;
            // Bobbing motion
            group.current.position.y = position[1] + Math.abs(Math.sin(t * 5)) * 0.05;
        }
    });

    return (
        <group ref={group} position={position} scale={0.4}>
            {/* Body */}
            <mesh position={[0, 0.4, 0]}>
                <capsuleGeometry args={[0.15, 0.6, 4, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.85, 0]}>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshStandardMaterial color="#FFD700" />
            </mesh>
        </group>
    )
}

// 3. LOW POLY ANIMAL (Quadruped)
function Animal({ position }) {
    const group = useRef();
    // Simple Dog/Deer shape
    return (
        <group ref={group} position={position} scale={0.3}>
             {/* Body */}
             <mesh position={[0, 0.3, 0]}>
                 <boxGeometry args={[0.4, 0.25, 0.6]} />
                 <meshStandardMaterial color="#8B4513" />
             </mesh>
             {/* Head */}
             <mesh position={[0, 0.55, 0.35]}>
                 <boxGeometry args={[0.2, 0.2, 0.25]} />
                 <meshStandardMaterial color="#5D4037" />
             </mesh>
             {/* Legs */}
             <mesh position={[0.15, 0.1, 0.2]}>
                 <boxGeometry args={[0.08, 0.3, 0.08]} />
                 <meshStandardMaterial color="#3E2723" />
             </mesh>
             <mesh position={[-0.15, 0.1, 0.2]}>
                 <boxGeometry args={[0.08, 0.3, 0.08]} />
                 <meshStandardMaterial color="#3E2723" />
             </mesh>
             <mesh position={[0.15, 0.1, -0.2]}>
                 <boxGeometry args={[0.08, 0.3, 0.08]} />
                 <meshStandardMaterial color="#3E2723" />
             </mesh>
             <mesh position={[-0.15, 0.1, -0.2]}>
                 <boxGeometry args={[0.08, 0.3, 0.08]} />
                 <meshStandardMaterial color="#3E2723" />
             </mesh>
        </group>
    )
}

// --- BIOME FEATURES (Replacing Trees) ---
function BiomeFeature({ position, type, color, scale = 1 }) {
  const group = useRef();
  
  // 1. MYSTIC CRYSTALS
  if (type === 'crystal') {
    return (
      <group position={position} scale={scale}>
         <mesh position={[0, 0.5, 0]}>
            <octahedronGeometry args={[0.4, 0]} />
            <meshStandardMaterial color="#E0AAFF" emissive="#7B2CBF" emissiveIntensity={2} toneMapped={false} />
         </mesh>
         <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.1, 0.2, 0.4, 6]} />
            <meshStandardMaterial color="#240046" />
         </mesh>
         <pointLight position={[0, 0.5, 0]} distance={2} intensity={2} color="#E0AAFF" />
      </group>
    );
  }

  // 2. SUNSET TOTEMS
  if (type === 'totem') {
    return (
      <group position={position} scale={scale}>
        <mesh position={[0, 0.4, 0]}>
           <boxGeometry args={[0.25, 0.8, 0.25]} />
           <meshStandardMaterial color="#E76F51" />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
           <boxGeometry args={[0.35, 0.2, 0.35]} />
           <meshStandardMaterial color="#F4A261" />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
           <sphereGeometry args={[0.15, 8, 8]} />
           <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
      </group>
    );
  }

  // 3. FOREST LANTERNS (Willow replacement)
  if (type === 'lantern') {
      return (
          <group position={position} scale={scale}>
              {/* Pole */}
              <mesh position={[0, 0.6, 0]}>
                  <cylinderGeometry args={[0.03, 0.03, 1.2]} />
                  <meshStandardMaterial color="#2F3E46" />
              </mesh>
              {/* Lantern */}
              <mesh position={[0.15, 1.1, 0]}>
                  <dodecahedronGeometry args={[0.15]} />
                  <meshStandardMaterial color="#84DCC6" emissive="#84DCC6" emissiveIntensity={2} />
              </mesh>
          </group>
      )
  }

  // 4. LOGIC MONOLITHS (Neutral)
  if (type === 'monolith') {
      return (
          <mesh position={position} scale={scale} castShadow>
              <boxGeometry args={[0.3, 1.2, 0.1]} />
              <meshStandardMaterial color="#333" roughness={0.2} metalness={0.8} />
              <mesh position={[0, 0.3, 0.06]}>
                   <planeGeometry args={[0.2, 0.8]} />
                   <meshBasicMaterial color="#00FF00" transparent opacity={0.3} />
              </mesh>
          </mesh>
      )
  }

  // 5. ICE SPIKES (Cold)
  if (type === 'spike') {
      return (
          <group position={position} scale={scale}>
              <mesh position={[0, 0.6, 0]}>
                  <coneGeometry args={[0.2, 1.5, 4]} />
                  <meshPhysicalMaterial 
                    color="#A8DADC" 
                    transmission={0.8} 
                    opacity={0.8} 
                    roughness={0.1} 
                    ior={1.5} 
                    thickness={0.5} 
                  />
              </mesh>
          </group>
      )
  }

  // 6. DREAM ORBS (Sakura replacement)
  if (type === 'orb') {
      return (
          <group position={position} scale={scale}>
               <Float speed={2} rotationIntensity={0} floatIntensity={2}>
                   <mesh position={[0, 1, 0]}>
                       <sphereGeometry args={[0.3, 16, 16]} />
                       <meshStandardMaterial color="#FFC8DD" emissive="#FFAFCC" emissiveIntensity={1} />
                   </mesh>
               </Float>
               <mesh position={[0, 0.1, 0]}>
                   <ringGeometry args={[0.1, 0.2, 16]} />
                   <meshBasicMaterial color="#FFAFCC" transparent opacity={0.5} side={THREE.DoubleSide} />
               </mesh>
          </group>
      )
  }

  // 7. MAGMA VENTS (Volcano)
  if (type === 'vent') {
      return (
          <group position={position} scale={scale}>
              <mesh position={[0, 0.2, 0]}>
                  <coneGeometry args={[0.4, 0.4, 6, 1, true]} />
                  <meshStandardMaterial color="#540b0e" />
              </mesh>
              <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
                  <circleGeometry args={[0.2]} />
                  <meshBasicMaterial color="#ff0000" />
              </mesh>
              <Sparkles count={10} scale={0.5} position={[0, 0.5, 0]} color="#FF4500" speed={2} />
          </group>
      )
  }

  // Fallback
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.2, 1, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// --- UTILITY MESHES ---
function Rock({ position, scale = 1, color }) {
  const rotation = useMemo(() => [Math.random()*Math.PI, Math.random()*Math.PI, 0], []);
  return (
    <mesh position={position} rotation={rotation} scale={scale} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.1, 0]} />
      <meshStandardMaterial color={color} roughness={0.9} flatShading />
    </mesh>
  );
}

function Mountain({ position, color, scale }) {
    return (
        <mesh position={position} scale={scale}>
            <coneGeometry args={[0.8, 2, 4]} />
            <meshStandardMaterial color={color} flatShading roughness={1} />
        </mesh>
    )
}

// --- MAIN ISLAND COMPONENT ---
function Building({ type, position }) {
  if (type === 'tower') {
    return (
      <group position={position}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
          <meshStandardMaterial color="#333" flatShading />
        </mesh>
        <mesh position={[0, 1.3, 0]}>
          <coneGeometry args={[0.25, 0.4, 6]} />
          <meshStandardMaterial color="#FF4500" emissive="#FF4500" emissiveIntensity={2} />
        </mesh>
        <pointLight position={[0, 1.2, 0]} intensity={2} color="#FF4500" distance={3} />
      </group>
    );
  }
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.4]} />
        <meshStandardMaterial color="#C19A6B" />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <coneGeometry args={[0.35, 0.3, 4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}

function Island({ result, scores }) {
  const islandRef = useRef();
  const cluster = result ? result.cluster : 3;
  const config = CLUSTER_CONFIG[cluster] || CLUSTER_CONFIG[3];
  
  // Scale up significantly
  const scaleValue = 1.0 + (scores.E * 0.2); 
  
  // Population
  const featureCount = Math.floor(scores.O * 4) + 12; // More features for larger area
  const rockCount = Math.floor(scores.C * 3) + 8;
  const pca1 = result ? result.PCA1 : 0;
  
  const personCount = scores.E > 2 ? Math.floor(scores.E * 2) : 2;
  const animalCount = scores.A > 2 ? Math.floor(scores.A * 2) : 2;
  
  const features = useMemo(() => {
    return new Array(featureCount).fill(0).map((_, i) => {
      // Scatter over much wider area (radius up to 3.0)
      const angle = (i / featureCount) * Math.PI * 2 + pca1 + (Math.random());
      const r = 1.0 + Math.random() * 2.2; 
      return {
        pos: [Math.cos(angle) * r, 0.5, Math.sin(angle) * r],
        scale: 0.8 + Math.random() * 0.7,
        type: config.features
      };
    });
  }, [featureCount, pca1, config]);

  const rocks = useMemo(() => {
    return new Array(rockCount).fill(0).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.8 + Math.random() * 2.4;
      return {
        pos: [Math.cos(angle) * r, 0.55, Math.sin(angle) * r],
        scale: 0.8 + Math.random() * 1.5,
      };
    });
  }, [rockCount, config]);


  // MOUNTAIN GENERATION (Always present now, multiple peaks)
  const mountainCount = Math.max(1, Math.floor(scores.N / 1.5));
  const mountains = useMemo(() => {
      return new Array(mountainCount).fill(0).map((_, i) => {
          const angle = (i / mountainCount) * Math.PI * 2 + Math.PI;
          return {
              pos: [Math.cos(angle) * 1.8, 0.8, Math.sin(angle) * 1.8], // Push mountains further out
              scale: 1.2 + Math.random() * 1.0, // Bigger mountains
              color: config.ground
          }
      })
  }, [mountainCount, config]);

  useFrame(() => {
     if(islandRef.current) islandRef.current.rotation.y += 0.0015; // Slower rotation for larger mass
  });

  return (
    <group ref={islandRef} scale={scaleValue}>
      {/* Bigger Base - Radius expanded to 3.5 */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.5, 2.0, 1.5, 9]} /> 
        <meshStandardMaterial color={config.ground} flatShading roughness={0.8} />
      </mesh>

      <mesh position={[0, 0.76, 0]} receiveShadow>
         <cylinderGeometry args={[3.4, 3.0, 0.2, 9]} />
         <meshStandardMaterial color={config.grass} flatShading />
      </mesh>

      <Building type={config.building} position={[0, 0.85, 0]} />

      {/* RENDER BIOME FEATURES (Replaces Trees) */}
      {features.map((t, i) => (
        <BiomeFeature key={`feat-${i}`} position={t.pos} type={t.type} color={config.grass} scale={t.scale} />
      ))}

      {/* RENDER ROCKS */}
      {rocks.map((r, i) => (
        <Rock key={`rock-${i}`} position={r.pos} scale={r.scale} color={config.ground} />
      ))}

      {/* RENDER MOUNTAINS */}
      {mountains.map((m, i) => (
         <Mountain key={`mtn-${i}`} position={m.pos} color={m.color} scale={m.scale} />
      ))}

      {/* RENDER PEOPLE */}
      {Array.from({ length: personCount }).map((_, i) => (
          <Person key={`person-${i}`} position={[Math.random()*1.5 - 0.75, 0.9, Math.random()*1.5 - 0.75]} color="#FF4500" />
      ))}

      {/* RENDER ANIMALS */}
      {Array.from({ length: animalCount }).map((_, i) => (
          <Animal key={`animal-${i}`} position={[Math.random()*2 - 1, 0.9, Math.random()*2 - 1]} />
      ))}

      {/* RENDER BIRDS */}
      <Bird position={[0, 3.5, 0]} />
      <Bird position={[1.5, 3.8, 1.5]} />

      {(config.mood === 'mystic' || config.mood === 'dream') && (
         <Sparkles count={50} scale={5} size={4} speed={0.4} opacity={0.6} color="#FFF" position={[0, 2, 0]} />
      )}
    </group>
  );
}

export default function PersonalityScene({ result, scores }) {
    const safeScores = scores || { E: 3, N: 3, A: 3, C: 3, O: 3 };
    const pcaX = result ? result.PCA1 : 0;
    const pcaZ = result ? result.PCA2 : 0;
    // Center the island so it's always visible
    const position = [0, 0, 0]; 
    
    const islandName = useMemo(() => {
        if (!result) return "Uncharted Island";
        return generateIslandName(result.E_word, result.O_word, result.N_word, result.A_word);
    }, [result]);

    return (
        <Canvas camera={{ position: [0, 8, 16], fov: 45 }} shadows dpr={[1, 2]}>
            {/* LIGHTING - Softened for floating look */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow shadow-mapSize={[1024, 1024]} color="#FF8C00" />
            
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade />
            
            <EffectComposer>
                <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={1.5} />
                <Noise opacity={0.05} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>

            <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} />

            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <group position={position}>
                    <Island result={result} scores={safeScores} />
                    
                    {result && (
                        <group position={[0, 5, 0]}>
                            <Text fontSize={0.4} color="#FFD700" anchorX="center" anchorY="middle">
                                {islandName}
                            </Text>
                            <Text position={[0, -0.4, 0]} fontSize={0.2} color="#00f3ff" anchorX="center">
                                {result.archetype_label}
                            </Text>
                        </group>
                    )}
                </group>
            </Float>

            {/* FLOATING ISLAND - No Floor/Grid */}
        </Canvas>
    )
}
