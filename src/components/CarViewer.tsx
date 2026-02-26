"use client";
import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

interface Props {
  bodyColor: string;
  accentColor: string;
  wheelIndex: number;
  finish: "matte" | "gloss" | "metallic";
  onReady?: () => void;
}

const FINISH_PROPS = {
  matte:    { roughness: 0.9, metalness: 0.0 },
  gloss:    { roughness: 0.05, metalness: 0.1 },
  metallic: { roughness: 0.2, metalness: 1.0 },
};

export default function CarViewer({ bodyColor, accentColor, wheelIndex, finish, onReady }: Props) {
  const mountRef    = useRef<HTMLDivElement>(null);
  const sceneRef    = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bodyPartsRef = useRef<THREE.Mesh[]>([]);
  const wheelGroupsRef = useRef<THREE.Group[][]>([]);
  const frameRef    = useRef<number>(0);
  const angleRef    = useRef(0);
  const isDragging  = useRef(false);
  const lastX       = useRef(0);

//Car Geometry
  const buildCar = useCallback((scene: THREE.Scene) => {
    const carGroup = new THREE.Group();
    const bodyMeshes: THREE.Mesh[] = [];

    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(bodyColor),
      roughness: FINISH_PROPS[finish].roughness,
      metalness: FINISH_PROPS[finish].metalness,
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x88BBDD,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.45,
    });

    const darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const lightMat = new THREE.MeshStandardMaterial({ color: 0xFFFFCC, roughness: 0.2, emissive: 0xFFFFAA, emissiveIntensity: 0.3 });
    const accentMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(accentColor), roughness: 0.3, metalness: 0.8 });

    const lowerBody = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.55, 1.8),
      bodyMat
    );
    lowerBody.position.set(0, 0.28, 0);
    lowerBody.castShadow = true;
    carGroup.add(lowerBody);
    bodyMeshes.push(lowerBody);

    [-0.92, 0.92].forEach((z) => {
      const skirt = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.12, 0.08), accentMat);
      skirt.position.set(0, 0.05, z);
      carGroup.add(skirt);
    });

    const cabinShape = new THREE.Shape();
    cabinShape.moveTo(-1.1, 0);
    cabinShape.lineTo(-1.4, 0.55);
    cabinShape.lineTo(-0.9, 0.95);
    cabinShape.lineTo(0.7, 0.95);
    cabinShape.lineTo(1.2, 0.55);
    cabinShape.lineTo(1.1, 0);
    cabinShape.lineTo(-1.1, 0);

    const extrudeSettings = { depth: 1.55, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3 };
    const cabinGeo = new THREE.ExtrudeGeometry(cabinShape, extrudeSettings);
    cabinGeo.center();
    const cabin = new THREE.Mesh(cabinGeo, bodyMat);
    cabin.position.set(-0.05, 0.83, 0);
    cabin.castShadow = true;
    carGroup.add(cabin);
    bodyMeshes.push(cabin);

    // Windshield front
    const windshieldF = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.65), glassMat);
    windshieldF.position.set(-0.62, 1.05, 0);
    windshieldF.rotation.set(0, 0, Math.PI / 5.5);
    windshieldF.rotation.y = 0;
    carGroup.add(windshieldF);

    //Windshield rear
    const windshieldR = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.6), glassMat);
    windshieldR.position.set(0.65, 1.05, 0);
    windshieldR.rotation.set(0, 0, -Math.PI / 6);
    carGroup.add(windshieldR);

    //Hood
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.07, 1.75), bodyMat);
    hood.position.set(-1.55, 0.6, 0);
    hood.rotation.z = 0.08;
    carGroup.add(hood);
    bodyMeshes.push(hood);

    //Trunk
    const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.07, 1.75), bodyMat);
    trunk.position.set(1.4, 0.65, 0);
    trunk.rotation.z = -0.05;
    carGroup.add(trunk);
    bodyMeshes.push(trunk);

    //Front bumper
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.32, 1.8), bodyMat);
    frontBumper.position.set(-2.02, 0.2, 0);
    carGroup.add(frontBumper);
    bodyMeshes.push(frontBumper);

    //Rear bumper
    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.32, 1.8), bodyMat);
    rearBumper.position.set(2.02, 0.2, 0);
    carGroup.add(rearBumper);
    bodyMeshes.push(rearBumper);

    // Headlights
    [[-0.5, 0.12], [0.5, 0.12]].forEach(([z]) => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.38), lightMat);
      hl.position.set(-2.05, 0.38, z as number);
      carGroup.add(hl);
    });

    //Taillights 
    [[-0.5], [0.5]].forEach(([z]) => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.38),
        new THREE.MeshStandardMaterial({ color: 0xFF2200, emissive: 0xFF0000, emissiveIntensity: 0.4, roughness: 0.3 })
      );
      tl.position.set(2.05, 0.38, z as number);
      carGroup.add(tl);
    });

    // Exhaust pipes 
    [-0.35, 0.35].forEach((z) => {
      const exhaust = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.05, 0.15, 8),
        new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.9, roughness: 0.2 })
      );
      exhaust.rotation.z = Math.PI / 2;
      exhaust.position.set(2.1, 0.1, z);
      carGroup.add(exhaust);
    });

    //Side mirrors
    [-0.95, 0.95].forEach((z) => {
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.06), bodyMat);
      mirror.position.set(-0.8, 0.72, z * 1.02);
      carGroup.add(mirror);
      bodyMeshes.push(mirror);
    });

    // Door lines (accent strips) 
    [-0.3, 0.3].forEach((z) => {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.015, 0.015), accentMat);
      strip.position.set(0, 0.42, z);
      carGroup.add(strip);
    });

    // WHEELS 
    const wheelPositions = [
      [-1.3, -0.85], [-1.3, 0.85],
      [ 1.3, -0.85], [ 1.3, 0.85],
    ];

    const allWheelGroups: THREE.Group[][] = [[], [], []]; 

    wheelPositions.forEach(([x, z]) => {
      
      const tyre = new THREE.Mesh(
        new THREE.TorusGeometry(0.35, 0.14, 14, 32),
        new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.9 })
      );
      tyre.rotation.y = 0;
      tyre.position.set(x, 0, z);
      carGroup.add(tyre);

      // Style: Standard — flat hub
      const stdGroup = new THREE.Group();
      const stdHub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16),
        new THREE.MeshStandardMaterial({ color: 0xAAAAAA, metalness: 0.7, roughness: 0.3 })
      );
      stdHub.rotation.x = Math.PI / 2;
      stdGroup.add(stdHub);
      for (let s = 0; s < 5; s++) {
        const angle = (s / 5) * Math.PI * 2;
        const spoke = new THREE.Mesh(
          new THREE.BoxGeometry(0.045, 0.32, 0.04),
          new THREE.MeshStandardMaterial({ color: 0xBBBBBB, metalness: 0.6 })
        );
        spoke.rotation.z = angle;
        spoke.rotation.x = Math.PI / 2;
        stdGroup.add(spoke);
      }
      stdGroup.position.set(x, 0, z + (z > 0 ? 0.16 : -0.16));
      allWheelGroups[0].push(stdGroup);
      carGroup.add(stdGroup);

      // Style 1: Sport 
      const sportGroup = new THREE.Group();
      for (let s = 0; s < 10; s++) {
        const angle = (s / 10) * Math.PI * 2;
        const spoke = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.3, 0.055),
          new THREE.MeshStandardMaterial({ color: new THREE.Color(accentColor), metalness: 0.8, roughness: 0.2 })
        );
        spoke.rotation.z = angle;
        spoke.rotation.x = Math.PI / 2;
        sportGroup.add(spoke);
      }
      const sportCenter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 0.07, 16),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 1 })
      );
      sportCenter.rotation.x = Math.PI / 2;
      sportGroup.add(sportCenter);
      sportGroup.position.set(x, 0, z + (z > 0 ? 0.16 : -0.16));
      sportGroup.visible = false;
      allWheelGroups[1].push(sportGroup);
      carGroup.add(sportGroup);

      // Style 2: Premium 
      const premGroup = new THREE.Group();
      for (let s = 0; s < 18; s++) {
        const angle = (s / 18) * Math.PI * 2;
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.025, 0.28, 0.07),
          new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 1.0, roughness: 0.1 })
        );
        blade.rotation.z = angle + 0.3;
        blade.rotation.x = Math.PI / 2;
        premGroup.add(blade);
      }
      const premRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.018, 8, 32),
        new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 1, roughness: 0.1 })
      );
      premRing.rotation.y = Math.PI / 2;
      premGroup.add(premRing);
      premGroup.position.set(x, 0, z + (z > 0 ? 0.16 : -0.16));
      premGroup.visible = false;
      allWheelGroups[2].push(premGroup);
      carGroup.add(premGroup);
    });

    wheelGroupsRef.current = allWheelGroups;
    bodyPartsRef.current = bodyMeshes;

    
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 5),
      new THREE.ShadowMaterial({ opacity: 0.35 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.38;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const ringGeo = new THREE.RingGeometry(2.2, 2.6, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(bodyColor),
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.37;
    ring.name = "groundRing";
    scene.add(ring);

    scene.add(carGroup);
    return carGroup;
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 1.8, 7);
    camera.lookAt(0, 0.3, 0);

    scene.fog = new THREE.FogExp2(0x0A0A0F, 0.055);

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff5e0, 3.5);
    keyLight.position.set(-4, 6, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.setScalar(2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xffffff, 4, 18);
    rimLight.position.set(5, 3, -4);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x4488ff, 1.5, 20);
    fillLight.position.set(-5, 1, 4);
    scene.add(fillLight);

    const groundLight = new THREE.PointLight(0xffffff, 0.8, 8);
    groundLight.position.set(0, -0.2, 0);
    scene.add(groundLight);

    buildCar(scene);

    const onMouseDown = (e: MouseEvent) => { isDragging.current = true;  lastX.current = e.clientX; };
    const onMouseUp   = ()              => { isDragging.current = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastX.current;
      angleRef.current -= dx * 0.008;
      lastX.current = e.clientX;
    };
    const onTouchStart = (e: TouchEvent) => { isDragging.current = true;  lastX.current = e.touches[0].clientX; };
    const onTouchEnd   = ()               => { isDragging.current = false; };
    const onTouchMove  = (e: TouchEvent)  => {
      if (!isDragging.current) return;
      const dx = e.touches[0].clientX - lastX.current;
      angleRef.current -= dx * 0.008;
      lastX.current = e.touches[0].clientX;
    };

    renderer.domElement.addEventListener("mousedown",  onMouseDown);
    renderer.domElement.addEventListener("mouseup",    onMouseUp);
    renderer.domElement.addEventListener("mousemove",  onMouseMove);
    renderer.domElement.addEventListener("touchstart", onTouchStart);
    renderer.domElement.addEventListener("touchend",   onTouchEnd);
    renderer.domElement.addEventListener("touchmove",  onTouchMove);

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      if (!isDragging.current) angleRef.current += 0.004;
      const r = 7;
      camera.position.x = Math.sin(angleRef.current) * r;
      camera.position.z = Math.cos(angleRef.current) * r;
      camera.position.y = 1.8;
      camera.lookAt(0, 0.3, 0);
      renderer.render(scene, camera);
    };
    tick();

    onReady?.();

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.domElement.removeEventListener("mousedown",  onMouseDown);
      renderer.domElement.removeEventListener("mouseup",    onMouseUp);
      renderer.domElement.removeEventListener("mousemove",  onMouseMove);
      renderer.domElement.removeEventListener("touchstart", onTouchStart);
      renderer.domElement.removeEventListener("touchend",   onTouchEnd);
      renderer.domElement.removeEventListener("touchmove",  onTouchMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  // Reaction
  useEffect(() => {
    bodyPartsRef.current.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.set(new THREE.Color(bodyColor));
      mat.roughness = FINISH_PROPS[finish].roughness;
      mat.metalness = FINISH_PROPS[finish].metalness;
      mat.needsUpdate = true;
    });

    const ring = sceneRef.current?.getObjectByName("groundRing") as THREE.Mesh;
    if (ring) (ring.material as THREE.MeshBasicMaterial).color.set(bodyColor);

  }, [bodyColor, finish]);

  useEffect(() => {
    wheelGroupsRef.current.forEach((set, i) => {
      set.forEach((group) => { group.visible = i === wheelIndex; });
    });
  }, [wheelIndex]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      style={{ background: "radial-gradient(ellipse at center, #1a1a2e 0%, #0A0A0F 70%)" }}
    />
  );
}