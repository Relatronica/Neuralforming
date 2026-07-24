import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════
   Helper: crea mesh solido + overlay EdgesGeometry
   Dà l'effetto "wireframe blueprint" sci-fi
   ═══════════════════════════════════════════════════════════ */
function createBodyPart(
  geometry: THREE.BufferGeometry,
  bodyMat: THREE.Material,
  edgeMat: THREE.LineBasicMaterial,
  edgeThreshold = 20
): THREE.Group {
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(geometry, bodyMat);
  group.add(mesh);

  const edgesGeo = new THREE.EdgesGeometry(geometry, edgeThreshold);
  const edgeLines = new THREE.LineSegments(edgesGeo, edgeMat);
  group.add(edgeLines);

  return group;
}

export function Robot3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Scene Setup ──
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.2, 7.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'mediump',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // ── Lighting ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 8, 4);
    scene.add(mainLight);

    const cyanLight = new THREE.PointLight(0x00f2fe, 3, 12);
    cyanLight.position.set(2, 3, 4);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 2.5, 12);
    purpleLight.position.set(-3, -1, 3);
    scene.add(purpleLight);

    const amberLight = new THREE.PointLight(0xfbbf24, 1.2, 8);
    amberLight.position.set(0, -3, 2);
    scene.add(amberLight);

    // Rim light for silhouette effect
    const rimLight = new THREE.SpotLight(0x4488cc, 1.0);
    rimLight.position.set(-2, 3, -4);
    rimLight.angle = 0.5;
    rimLight.penumbra = 0.8;
    scene.add(rimLight);

    // Chest glow point light
    const chestLight = new THREE.PointLight(0x00f2fe, 0.6, 3.5);
    chestLight.position.set(0, 0.6, 0.5);
    scene.add(chestLight);

    // ── Shared Materials ──
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.93,
      roughness: 0.12,
      transparent: true,
      opacity: 0.9,
    });

    const edgeMat = new THREE.LineBasicMaterial({
      color: 0xd1d5db,
      transparent: true,
      opacity: 0.45,
    });

    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      emissive: 0x6b7280,
      emissiveIntensity: 0.2,
      metalness: 0.85,
      roughness: 0.25,
    });

    const visorMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.95,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x1f293d,
      emissive: 0x9ca3af,
      emissiveIntensity: 0.25,
      metalness: 0.8,
      roughness: 0.3,
    });

    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: false,
    });

    // ── Outer Cyber Shell (wireframe overlay on head) ──
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0xe5e7eb,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });

    // ═══════════════════════════════════════════════════
    // ROBOT ASSEMBLY
    // ═══════════════════════════════════════════════════
    const robotGroup = new THREE.Group();
    robotGroup.position.set(1.95, -0.8, 0);
    scene.add(robotGroup);

    // ── HEAD GROUP (animated: mouse tracking) ──
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.6, 0);
    robotGroup.add(headGroup);

    // Main head
    const headGeo = new THREE.BoxGeometry(0.6, 0.65, 0.55, 2, 2, 2);
    const headPart = createBodyPart(headGeo, bodyMat, edgeMat);
    headGroup.add(headPart);

    // Head top plate
    const headTopGeo = new THREE.BoxGeometry(0.48, 0.07, 0.42);
    const headTopPart = createBodyPart(headTopGeo, bodyMat, edgeMat);
    headTopPart.position.set(0, 0.36, 0);
    headGroup.add(headTopPart);

    // Head chin
    const headChinGeo = new THREE.BoxGeometry(0.38, 0.06, 0.35);
    const headChinPart = createBodyPart(headChinGeo, bodyMat, edgeMat);
    headChinPart.position.set(0, -0.35, 0.03);
    headGroup.add(headChinPart);

    // Cyber shell overlay on head
    const shellGeo = new THREE.IcosahedronGeometry(0.5, 1);
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    headGroup.add(shellMesh);

    // Visor frame
    const visorFrameGeo = new THREE.BoxGeometry(0.54, 0.14, 0.02);
    const visorFramePart = createBodyPart(visorFrameGeo, bodyMat, edgeMat);
    visorFramePart.position.set(0, 0.02, 0.27);
    headGroup.add(visorFramePart);

    // Glowing visor
    const visorGeo = new THREE.PlaneGeometry(0.52, 0.12);
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.02, 0.285);
    headGroup.add(visorMesh);

    // Eye line inside visor
    const eyeGeo = new THREE.BoxGeometry(0.46, 0.03, 0.01);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
    eyeMesh.position.set(0, 0.02, 0.29);
    headGroup.add(eyeMesh);

    // Antenna
    const antennaGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.22, 6);
    const antennaPart = createBodyPart(antennaGeo, bodyMat, edgeMat);
    antennaPart.position.set(0.13, 0.5, 0);
    headGroup.add(antennaPart);

    const antennaTipGeo = new THREE.SphereGeometry(0.028, 8, 8);
    const antennaTip = new THREE.Mesh(antennaTipGeo, accentMat);
    antennaTip.position.set(0.13, 0.62, 0);
    headGroup.add(antennaTip);

    // Ear discs
    const earGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.035, 12);
    const leftEar = new THREE.Mesh(earGeo, accentMat);
    leftEar.position.set(-0.32, 0.0, 0.02);
    leftEar.rotation.z = Math.PI / 2;
    headGroup.add(leftEar);

    const rightEar = leftEar.clone();
    rightEar.position.x = 0.32;
    headGroup.add(rightEar);

    // ── TORSO GROUP (animated: breathing) ──
    const torsoGroup = new THREE.Group();
    robotGroup.add(torsoGroup);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.09, 0.12, 0.2, 8);
    const neckPart = createBodyPart(neckGeo, bodyMat, edgeMat);
    neckPart.position.set(0, 1.2, 0);
    torsoGroup.add(neckPart);

    // Neck ring
    const neckRingGeo = new THREE.TorusGeometry(0.13, 0.016, 8, 16);
    const neckRing = new THREE.Mesh(neckRingGeo, accentMat);
    neckRing.position.set(0, 1.14, 0);
    neckRing.rotation.x = Math.PI / 2;
    torsoGroup.add(neckRing);

    // Main torso
    const torsoGeo = new THREE.BoxGeometry(0.95, 1.2, 0.48, 2, 3, 2);
    const torsoPart = createBodyPart(torsoGeo, bodyMat, edgeMat);
    torsoPart.position.set(0, 0.5, 0);
    torsoGroup.add(torsoPart);

    // Torso detail lines (horizontal panels)
    const detailGeo = new THREE.BoxGeometry(0.78, 0.04, 0.5);
    const detail1 = createBodyPart(detailGeo, bodyMat, edgeMat);
    detail1.position.set(0, 0.82, 0);
    torsoGroup.add(detail1);

    const detail2 = createBodyPart(detailGeo.clone(), bodyMat, edgeMat);
    detail2.position.set(0, 0.3, 0);
    torsoGroup.add(detail2);

    // Chest Core Crystal (Neural Heart) – spinning octahedron
    const coreGeo = new THREE.OctahedronGeometry(0.14, 0);
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 0.6, 0.26);
    torsoGroup.add(coreMesh);

    // Chest ring around core
    const chestRingGeo = new THREE.RingGeometry(0.16, 0.2, 16);
    const chestRingMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const chestRingMesh = new THREE.Mesh(chestRingGeo, chestRingMat);
    chestRingMesh.position.set(0, 0.6, 0.25);
    torsoGroup.add(chestRingMesh);

    // ── LEFT ARM (animated: swing) ──
    const lArmGroup = new THREE.Group();
    lArmGroup.position.set(0.6, 1.0, 0);
    torsoGroup.add(lArmGroup);

    // Shoulder
    const shoulderGeo = new THREE.SphereGeometry(0.13, 12, 12);
    const lShoulder = new THREE.Mesh(shoulderGeo, jointMat);
    lArmGroup.add(lShoulder);

    // Shoulder pad
    const shoulderPadGeo = new THREE.BoxGeometry(0.2, 0.13, 0.18);
    const lShoulderPad = createBodyPart(shoulderPadGeo, bodyMat, edgeMat);
    lShoulderPad.position.set(0.04, 0.04, 0);
    lArmGroup.add(lShoulderPad);

    // Upper arm
    const upperArmGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.52, 8);
    const lUpperArm = createBodyPart(upperArmGeo, bodyMat, edgeMat);
    lUpperArm.position.set(0, -0.35, 0);
    lArmGroup.add(lUpperArm);

    // Elbow
    const elbowGeo = new THREE.SphereGeometry(0.085, 10, 10);
    const lElbow = new THREE.Mesh(elbowGeo, jointMat);
    lElbow.position.set(0, -0.66, 0);
    lArmGroup.add(lElbow);

    // Lower arm
    const lowerArmGeo = new THREE.CylinderGeometry(0.058, 0.068, 0.48, 8);
    const lLowerArm = createBodyPart(lowerArmGeo, bodyMat, edgeMat);
    lLowerArm.position.set(0, -0.94, 0);
    lArmGroup.add(lLowerArm);

    // Hand
    const handGeo = new THREE.BoxGeometry(0.11, 0.15, 0.08);
    const lHand = createBodyPart(handGeo, bodyMat, edgeMat);
    lHand.position.set(0, -1.22, 0);
    lArmGroup.add(lHand);

    // ── RIGHT ARM (mirrored) ──
    const rArmGroup = new THREE.Group();
    rArmGroup.position.set(-0.6, 1.0, 0);
    torsoGroup.add(rArmGroup);

    const rShoulder = new THREE.Mesh(shoulderGeo, jointMat);
    rArmGroup.add(rShoulder);

    const rShoulderPad = createBodyPart(shoulderPadGeo.clone(), bodyMat, edgeMat);
    rShoulderPad.position.set(-0.04, 0.04, 0);
    rArmGroup.add(rShoulderPad);

    const rUpperArm = createBodyPart(upperArmGeo.clone(), bodyMat, edgeMat);
    rUpperArm.position.set(0, -0.35, 0);
    rArmGroup.add(rUpperArm);

    const rElbow = new THREE.Mesh(elbowGeo, jointMat);
    rElbow.position.set(0, -0.66, 0);
    rArmGroup.add(rElbow);

    const rLowerArm = createBodyPart(lowerArmGeo.clone(), bodyMat, edgeMat);
    rLowerArm.position.set(0, -0.94, 0);
    rArmGroup.add(rLowerArm);

    const rHand = createBodyPart(handGeo.clone(), bodyMat, edgeMat);
    rHand.position.set(0, -1.22, 0);
    rArmGroup.add(rHand);

    // ── PELVIS ──
    const pelvisGeo = new THREE.BoxGeometry(0.7, 0.26, 0.4, 2, 2, 2);
    const pelvisPart = createBodyPart(pelvisGeo, bodyMat, edgeMat);
    pelvisPart.position.set(0, -0.12, 0);
    torsoGroup.add(pelvisPart);

    // ── LEFT LEG ──
    const lLegGroup = new THREE.Group();
    lLegGroup.position.set(0.22, -0.35, 0);
    torsoGroup.add(lLegGroup);

    const hipGeo = new THREE.SphereGeometry(0.1, 10, 10);
    const lHip = new THREE.Mesh(hipGeo, jointMat);
    lLegGroup.add(lHip);

    const upperLegGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.62, 8);
    const lUpperLeg = createBodyPart(upperLegGeo, bodyMat, edgeMat);
    lUpperLeg.position.set(0, -0.38, 0);
    lLegGroup.add(lUpperLeg);

    const kneeGeo = new THREE.SphereGeometry(0.095, 10, 10);
    const lKnee = new THREE.Mesh(kneeGeo, jointMat);
    lKnee.position.set(0, -0.72, 0);
    lLegGroup.add(lKnee);

    const lowerLegGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.62, 8);
    const lLowerLeg = createBodyPart(lowerLegGeo, bodyMat, edgeMat);
    lLowerLeg.position.set(0, -1.08, 0);
    lLegGroup.add(lLowerLeg);

    const footGeo = new THREE.BoxGeometry(0.15, 0.09, 0.28);
    const lFoot = createBodyPart(footGeo, bodyMat, edgeMat);
    lFoot.position.set(0, -1.43, 0.04);
    lLegGroup.add(lFoot);

    // ── RIGHT LEG (mirrored) ──
    const rLegGroup = new THREE.Group();
    rLegGroup.position.set(-0.22, -0.35, 0);
    torsoGroup.add(rLegGroup);

    const rHip = new THREE.Mesh(hipGeo, jointMat);
    rLegGroup.add(rHip);

    const rUpperLeg = createBodyPart(upperLegGeo.clone(), bodyMat, edgeMat);
    rUpperLeg.position.set(0, -0.38, 0);
    rLegGroup.add(rUpperLeg);

    const rKnee = new THREE.Mesh(kneeGeo, jointMat);
    rKnee.position.set(0, -0.72, 0);
    rLegGroup.add(rKnee);

    const rLowerLeg = createBodyPart(lowerLegGeo.clone(), bodyMat, edgeMat);
    rLowerLeg.position.set(0, -1.08, 0);
    rLegGroup.add(rLowerLeg);

    const rFoot = createBodyPart(footGeo.clone(), bodyMat, edgeMat);
    rFoot.position.set(0, -1.43, 0.04);
    rLegGroup.add(rFoot);

    // ── Orbital Neural Particle Cloud ──
    const particleCount = 160;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00f2fe);
    const color2 = new THREE.Color(0x8b5cf6);
    const color3 = new THREE.Color(0xfbbf24);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.0 + Math.random() * 1.8;

      particlePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePos[i * 3 + 2] = r * Math.cos(phi);

      const mixedColor =
        Math.random() > 0.5
          ? color1
          : Math.random() > 0.5
            ? color2
            : color3;
      particleColors[i * 3] = mixedColor.r;
      particleColors[i * 3 + 1] = mixedColor.g;
      particleColors[i * 3 + 2] = mixedColor.b;
    }

    particleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePos, 3)
    );
    particleGeo.setAttribute(
      'color',
      new THREE.BufferAttribute(particleColors, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    robotGroup.add(particleCloud);

    // ═══════════════════════════════════════════════════
    // INTERACTION & ANIMATION
    // ═══════════════════════════════════════════════════
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX =
        ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.targetY =
        -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Skip GPU render if canvas is scrolled out of view
      if (!isVisible) return;

      const t = clock.getElapsedTime();

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // ── Head tracks mouse ──
      headGroup.rotation.y = mouse.x * 0.5;
      headGroup.rotation.x = -mouse.y * 0.3;

      // ── Breathing (torso group Y oscillation) ──
      torsoGroup.position.y = Math.sin(t * 2.0) * 0.02;

      // ── Floating bobbing (whole robot) ──
      robotGroup.position.y = Math.sin(t * 1.2) * 0.1;
      robotGroup.rotation.y =
        Math.sin(t * 0.4) * 0.08 + mouse.x * 0.15;

      // ── Arm animation (Dynamic idle floating swing with elbow bend) ──
      const armSwing = Math.sin(t * 1.5) * 0.12;
      const armWave = Math.cos(t * 1.2) * 0.08;

      lArmGroup.rotation.x = armSwing;
      lArmGroup.rotation.z = 0.15 + armWave * 0.5;

      rArmGroup.rotation.x = -armSwing;
      rArmGroup.rotation.z = -0.15 - armWave * 0.5;

      // ── Leg animation (Subtle floating balance swing) ──
      const legSwing = Math.sin(t * 1.5 + Math.PI / 4) * 0.08;
      lLegGroup.rotation.x = legSwing;
      lLegGroup.rotation.z = 0.05 + Math.sin(t * 0.8) * 0.02;

      rLegGroup.rotation.x = -legSwing;
      rLegGroup.rotation.z = -0.05 - Math.sin(t * 0.8) * 0.02;

      // ── Core Crystal spin & pulse ──
      coreMesh.rotation.y = t * 2;
      coreMesh.rotation.x = t * 1.5;
      const scalePulse = 1 + Math.sin(t * 4) * 0.15;
      coreMesh.scale.set(scalePulse, scalePulse, scalePulse);

      // ── Visor brightness pulse ──
      const visorPulse = 0.7 + Math.sin(t * 3.0) * 0.3;
      visorMat.opacity = visorPulse;
      eyeMat.opacity = visorPulse;

      // ── Chest light pulse ──
      chestLight.intensity = 0.5 + Math.sin(t * 2.0) * 0.3;

      // ── Particle cloud rotation ──
      particleCloud.rotation.y = t * 0.1;
      particleCloud.rotation.x = t * 0.06;

      renderer.render(scene, camera);
    };

    animate();

    // ── Resize Handler ──
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // ── Cleanup ──
    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative flex items-center justify-center pointer-events-auto"
    />
  );
}
