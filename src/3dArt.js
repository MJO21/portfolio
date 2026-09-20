import './style.css'

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const container = document.querySelector('#drone-container');
const scene = new THREE.Scene();

// Kamera-Verhältnis an das Browserfenster anpassen
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    alpha: true, // WICHTIG: Erlaubt Transparenz im Hintergrund des Renderers
});

let drone;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.5); // Etwas heller gemacht
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// KEIN GridHelper mehr, damit es nahtlos wirkt!

const loader = new GLTFLoader();

loader.load('/Drone.glb', function (gltf) {
    drone = gltf.scene;
    drone.scale.set(2, 2, 2);
    console.log('Drohne erfolgreich geladen:', gltf);

    scene.add(drone);
}, undefined, function (error) {
    console.error('Fehler beim Laden:', error);
});

// Automatische Anpassung bei Größenänderung des Fensters
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);

    if(drone){
        // Drehung um alle Achsen (X, Y und Z) für einen organischen Look
        drone.rotation.x += 0.005;
        drone.rotation.y += 0.01;
        drone.rotation.z += 0.002;
    }

    renderer.render(scene, camera);
}

animate();