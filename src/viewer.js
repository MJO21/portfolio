import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Zeigt ein GLB-Modell in einem Container an.
 * Jeder Viewer hat seine eigene Szene, seinen eigenen Renderer und sein eigenes Canvas.
 */
export function createViewer(container, url) {
    const canvas = container.querySelector('canvas');
    const status = container.querySelector('.viewer-status');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.position.set(5, 5, 5);
    scene.add(sun);

    const controls = new OrbitControls(camera, canvas);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2;
    controls.enableDamping = true;
    controls.enableZoom = false;   // Mausrad scrollt weiter die Seite
    controls.enablePan = false;

    // Größe folgt dem Container, nicht dem Fenster
    function resize() {
        const { clientWidth: w, clientHeight: h } = container;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(container);
    resize();

    new GLTFLoader().load(
        url,
        (gltf) => {
            const model = gltf.scene;

            // Modell zentrieren und Kamera automatisch passend setzen
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);

            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const fov = THREE.MathUtils.degToRad(camera.fov / 2);
            const dist = (maxDim / (2 * Math.tan(fov))) * 1.6;

            camera.position.set(dist * 0.6, dist * 0.4, dist);
            camera.near = dist / 100;
            camera.far = dist * 100;
            camera.updateProjectionMatrix();
            controls.update();

            scene.add(model);
            status?.remove();
        },
        undefined,
        (error) => {
            console.error(`Fehler beim Laden von ${url}:`, error);
            if (status) status.textContent = 'Model could not be loaded.';
        }
    );

    // Nur rendern, solange der Viewer sichtbar ist (spart Akku/GPU)
    let visible = true;
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
    }).observe(container);

    renderer.setAnimationLoop(() => {
        if (!visible) return;
        controls.update();
        renderer.render(scene, camera);
    });
}