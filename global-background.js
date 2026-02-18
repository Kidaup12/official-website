// 3D Background with Floating Spheres (Bubbles) using Three.js

document.addEventListener('DOMContentLoaded', () => {
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.warn('Three.js is not loaded. Please include it before this script.');
        return;
    }

    // Setup Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '-1';
    renderer.domElement.style.pointerEvents = 'none';
    document.body.prepend(renderer.domElement);

    // Spheres Setup
    const spheres = [];
    const sphereCount = 60;
    // Consistent size for "almost same sizes"
    const geometry = new THREE.SphereGeometry(1, 48, 48); // Smoother

    // Soft, semi-transparent colors
    const colors = [
        0x3b82f6, // Blue
        0x8b5cf6, // Purple
        0x6366f1, // Indigo
        0xa78bfa, // Light Purple
        0x60a5fa  // Light Blue
    ];

    for (let i = 0; i < sphereCount; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const material = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: 0.4,
            shininess: 90,
            emissive: color,
            emissiveIntensity: 0.1,
            specular: 0xffffff
        });

        const sphere = new THREE.Mesh(geometry, material);

        // Random Position Grid-like but scattered
        sphere.position.x = (Math.random() - 0.5) * 60;
        sphere.position.y = (Math.random() - 0.5) * 40;
        sphere.position.z = (Math.random() - 0.5) * 20 - 10;

        // Consistent Sizes (0.8 to 1.2 scale)
        const scale = 0.8 + Math.random() * 0.4;
        sphere.scale.set(scale, scale, scale);

        // Store initial positions for wave calculation
        sphere.userData = {
            initialX: sphere.position.x,
            initialY: sphere.position.y,
            initialZ: sphere.position.z,
            phase: Math.random() * Math.PI * 2,
            speed: 0.05 + Math.random() * 0.05
        };

        scene.add(sphere);
        spheres.push(sphere);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(10, 10, 20);
    scene.add(pointLight);

    // Mouse Tracking for subtle influence
    const mouse = new THREE.Vector2();
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX - windowHalfX) * 0.002;
        mouse.y = (event.clientY - windowHalfY) * 0.002;
    });

    // Animation Loop
    let time = 0;

    const animate = () => {
        requestAnimationFrame(animate);
        time += 0.01;

        camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
        camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        spheres.forEach((sphere) => {
            // Unpack data
            const { initialX, initialY, phase } = sphere.userData;

            // Wave/Ripple Logic
            // Create a wave that moves across the X/Z plane affecting Y
            // Y position oscillates based on X position and time -> traveling wave

            // Primary vertical wave (Water surface effect)
            const waveY = Math.sin(initialX * 0.5 + time + phase) * 1.5;

            // Secondary horizonal drift (gentle)
            const waveX = Math.cos(initialY * 0.3 + time * 0.8 + phase) * 0.5;

            sphere.position.y = initialY + waveY;
            sphere.position.x = initialX + waveX;

            // Subtle rotation
            sphere.rotation.x += 0.001;
            sphere.rotation.y += 0.002;
        });

        renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
