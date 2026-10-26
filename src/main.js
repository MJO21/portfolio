import './style.css';
import { createViewer } from './viewer.js';

// Jeder Container mit data-model bekommt seinen eigenen 3D-Viewer
document.querySelectorAll('[data-model]').forEach((el) => {
    createViewer(el, el.dataset.model);
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();