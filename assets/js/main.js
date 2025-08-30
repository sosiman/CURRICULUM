/* ============================================
   CURRICULUM 3D - JAVASCRIPT PRINCIPAL
   José Alberto Trujillo Plaza
   ============================================ */

// Variables globales
let scene, camera, renderer;
let models = {};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    initLoader();
    init3D();
    initNavigation();
    
    // Ocultar loader cuando todo esté cargado
    window.addEventListener('load', function() {
        setTimeout(function() {
            const loader = document.getElementById('loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(function() {
                    loader.style.display = 'none';
                }, 500);
            }
        }, 1500);
    });
});

// Función para el loader inicial
function initLoader() {
    console.log('🚀 Inicializando Curriculum 3D...');
}

// Navegación con scroll
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    // Scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Smooth scroll para links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Cerrar menú móvil si está abierto
                navLinks.classList.remove('active');
            }
        });
    });
}

// Inicializar Three.js
function init3D() {
    // Escena principal para el background
    const canvas = document.getElementById('canvas-3d');
    if (!canvas) return;
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x0066ff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x00d4ff, 0.5);
    pointLight.position.set(-10, -10, -5);
    scene.add(pointLight);
    
    // Crear partículas flotantes
    createParticles();
    
    // Crear geometrías flotantes
    createFloatingGeometries();
    
    // Crear grid
    createGrid();
    
    camera.position.z = 30;
    camera.position.y = 5;
    
    // Cargar modelos 3D GLB
    loadModels();
    
    animate();
}

// Crear grid
function createGrid() {
    const gridHelper = new THREE.GridHelper(100, 50, 0x0066ff, 0x004499);
    gridHelper.position.y = -10;
    scene.add(gridHelper);
}

// Crear partículas
function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i += 3) {
        // Posiciones
        posArray[i] = (Math.random() - 0.5) * 100;
        posArray[i + 1] = (Math.random() - 0.5) * 100;
        posArray[i + 2] = (Math.random() - 0.5) * 100;
        
        // Colores
        const color = new THREE.Color(`hsl(${200 + Math.random() * 40}, 100%, 50%)`);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Guardar referencia para animar
    models.particles = particlesMesh;
}

// Crear geometrías flotantes
function createFloatingGeometries() {
    const geometries = [
        new THREE.IcosahedronGeometry(2, 0),
        new THREE.OctahedronGeometry(2, 0),
        new THREE.TetrahedronGeometry(2, 0),
        new THREE.DodecahedronGeometry(2, 0),
        new THREE.TorusGeometry(2, 0.5, 8, 20),
        new THREE.BoxGeometry(2, 2, 2)
    ];
    
    const shapes = [];
    
    for(let i = 0; i < 15; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(`hsl(${200 + Math.random() * 60}, 100%, 50%)`),
            wireframe: Math.random() > 0.5,
            transparent: true,
            opacity: 0.3 + Math.random() * 0.3,
            emissive: 0x0066ff,
            emissiveIntensity: 0.2
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30
        );
        
        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        mesh.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            floatSpeed: Math.random() * 0.5 + 0.5,
            floatAmplitude: Math.random() * 2 + 1
        };
        
        shapes.push(mesh);
        scene.add(mesh);
    }
    
    models.shapes = shapes;
}

// Cargar modelos GLB
function loadModels() {
    // Modelos del hero principal
    createModelViewer('model-container-1', 'models/AZURE3D.glb');
    createModelViewer('model-container-2', 'models/cisco.glb');
    
    // Modelo ROBOT1.GLB para la sección de Experiencia
    setTimeout(() => {
        createRobotModel();
    }, 500);
    
    // Modelos de formación y animaciones
    setTimeout(() => {
        createFormacionAnimations();
    }, 1000);
    
    // Loader con animación por defecto
    createDefaultLoaderAnimation();
}

// Crear visor de modelo genérico
function createModelViewer(containerId, modelPath) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    
    // Set pixel ratio for higher resolution
    renderer.setPixelRatio(window.devicePixelRatio);

    // Tonemapping for more realistic lighting
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Luces ajustadas para evitar la sobreexposición y resaltar los colores
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Aumentar un poco la luz ambiental
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0); // Reducir la intensidad de la luz principal
    mainLight.position.set(5, 10, 7.5);
    scene.add(mainLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.5); // Reducir la luz de relleno
    backLight.position.set(-5, -10, -5);
    scene.add(backLight);
    
    // Cargar modelo
    const loader = new THREE.GLTFLoader();
    loader.load(
        modelPath,
        function(gltf) {
            const model = gltf.scene;

            // Aplicar materiales mejorados y optimizar renderizado
            model.traverse(function(child) {
                if (child.isMesh) {
                    // Volver a MeshStandardMaterial, que ofrece mejor calidad visual.
                    // Ajustar metalness y roughness para colores más vivos y definidos.
                    child.material = new THREE.MeshStandardMaterial({
                        color: child.material.color,
                        map: child.material.map,
                        metalness: 0.6, // Un toque metálico para que los colores brillen
                        roughness: 0.4, // Un poco de rugosidad para difuminar reflejos fuertes
                        side: THREE.DoubleSide // Asegurar que ambas caras se rendericen
                    });
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            // Centrar y escalar
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;
            
            model.scale.multiplyScalar(scale);
            model.position.sub(center.multiplyScalar(scale));
            scene.add(model);
            
            // Controles
            const controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.autoRotate = true;
            controls.autoRotateSpeed = 1;
            controls.enableZoom = false;
            
            camera.position.z = 5;
            
            // Animación
            function animate() {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            }
            animate();
            
            console.log(`✅ ${modelPath} cargado exitosamente`);
        },
        undefined,
        function(error) {
            console.error(`❌ Error cargando ${modelPath}:`, error);
        }
    );
}

// Función para cargar el modelo ROBOT1.GLB
function createRobotModel() {
    const container = document.getElementById('experiencia-3d-right');
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    
    // Luces mejoradas para el robot
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xe74c3c, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x9b59b6, 0.5);
    pointLight.position.set(-5, -5, 5);
    scene.add(pointLight);
    
    // Cargar ROBOT1.GLB
    const loader = new THREE.GLTFLoader();
    loader.load(
        'models/ROBOT1.glb',
        function(gltf) {
            const model = gltf.scene;
            
            // Centrar y escalar el modelo
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;
            
            model.scale.multiplyScalar(scale);
            model.position.sub(center.multiplyScalar(scale));
            scene.add(model);
            
            // Controles orbitales
            const controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.autoRotate = true;
            controls.autoRotateSpeed = 2;
            controls.enableZoom = false;
            controls.enablePan = false;
            
            camera.position.z = 5;
            
            // Animación
            function animate() {
                requestAnimationFrame(animate);
                controls.update();
                
                // Efecto de flotación
                model.rotation.y += 0.005;
                model.position.y = Math.sin(Date.now() * 0.001) * 0.1;
                
                renderer.render(scene, camera);
            }
            animate();
            
            console.log('✅ ROBOT1.GLB cargado exitosamente');
        },
        undefined,
        function(error) {
            console.error('❌ Error cargando ROBOT1.GLB:', error);
            
            // Crear fallback visual
            const fallbackEl = document.createElement('div');
            fallbackEl.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #e74c3c;
                font-size: 48px;
            `;
            fallbackEl.innerHTML = '<i class="fas fa-robot"></i>';
            container.appendChild(fallbackEl);
        }
    );
}

// ANIMACIONES PARA FORMACIÓN ACADÉMICA con modelo WALLY.GLB
function createFormacionAnimations() {
    console.log('🎨 Creando animaciones para Formación Académica con WALLY.GLB...');
    
    const formacionSection = document.getElementById('formacion');
    if (!formacionSection) return;
    
    const title = formacionSection.querySelector('.section-title');
    if (!title) return;
    
    // Verificar si ya existe
    if (formacionSection.querySelector('.modern-animations-container')) {
        console.log('⚠️ Animaciones ya creadas');
        return;
    }
    
    // Crear contenedor
    const container = document.createElement('div');
    container.className = 'modern-animations-container';
    container.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 60px;
        margin: 30px 0;
        padding: 20px 0;
        position: relative;
    `;
    
    // Contenedor izquierdo para WALLY.GLB
    const leftContainer = document.createElement('div');
    leftContainer.id = 'formacion-wally-3d';
    leftContainer.className = 'animation-left-3d';
    leftContainer.style.cssText = `
        width: 200px;
        height: 200px;
        position: relative;
        background: radial-gradient(circle, rgba(52, 152, 219, 0.15) 0%, transparent 70%);
        border-radius: 20px;
        box-shadow: 0 15px 40px rgba(52, 152, 219, 0.3);
        border: 2px solid rgba(52, 152, 219, 0.3);
        overflow: hidden;
    `;
    
    // Animación derecha - Formas geométricas
    const rightAnim = document.createElement('div');
    rightAnim.className = 'animation-right';
    rightAnim.style.cssText = `
        width: 200px;
        height: 200px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: floatRight 5s ease-in-out infinite;
    `;
    
    // Formas geométricas
    const shapes = [
        { size: 80, color: '#e74c3c', delay: 0 },
        { size: 60, color: '#9b59b6', delay: -1 },
        { size: 40, color: '#f39c12', delay: -2 }
    ];
    
    shapes.forEach((shape) => {
        const shapeEl = document.createElement('div');
        shapeEl.style.cssText = `
            position: absolute;
            width: ${shape.size}px;
            height: ${shape.size}px;
            background: ${shape.color};
            border-radius: 20% 80% 20% 80%;
            animation: morphShape 4s ease-in-out infinite;
            animation-delay: ${shape.delay}s;
        `;
        rightAnim.appendChild(shapeEl);
    });
    
    // Título con efecto
    title.style.cssText += `
        background: linear-gradient(135deg, #2c3e50, #3498db, #2980b9);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 900;
        letter-spacing: 1px;
        text-shadow: 0 0 20px rgba(52, 152, 219, 0.3);
    `;
    
    // Ensamblar
    title.parentNode.insertBefore(container, title);
    container.appendChild(leftContainer);
    container.appendChild(title);
    container.appendChild(rightAnim);
    
    // Cargar modelo WALLY.GLB
    setTimeout(() => {
        createWallyModel();
    }, 100);
    
    console.log('✨ Animaciones Formación Académica con WALLY creadas');
}

// Función para cargar el modelo WALLY.GLB
function createWallyModel() {
    const container = document.getElementById('formacion-wally-3d');
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    
    // Luces optimizadas para wally
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x3498db, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x2980b9, 0.5);
    pointLight.position.set(-5, 3, 3);
    scene.add(pointLight);
    
    // Cargar WALLY.GLB
    const loader = new THREE.GLTFLoader();
    loader.load(
        'models/wally.glb',
        function(gltf) {
            const model = gltf.scene;
            
            // Centrar y escalar el modelo
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3.5 / maxDim;
            
            model.scale.multiplyScalar(scale);
            model.position.sub(center.multiplyScalar(scale));
            scene.add(model);
            
            // Controles orbitales
            const controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.autoRotate = true;
            controls.autoRotateSpeed = 1.5;
            controls.enableZoom = false;
            controls.enablePan = false;
            
            camera.position.z = 5;
            
            // Animación
            function animate() {
                requestAnimationFrame(animate);
                controls.update();
                
                // Efecto de flotación suave
                model.rotation.y += 0.003;
                model.position.y = Math.sin(Date.now() * 0.0008) * 0.05;
                
                renderer.render(scene, camera);
            }
            animate();
            
            console.log('✅ WALLY.GLB cargado exitosamente en Formación');
        },
        undefined,
        function(error) {
            console.error('❌ Error cargando WALLY.GLB:', error);
            
            // Crear fallback visual
            const fallbackEl = document.createElement('div');
            fallbackEl.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #3498db;
                font-size: 48px;
            `;
            fallbackEl.innerHTML = '<i class="fas fa-graduation-cap"></i>';
            container.appendChild(fallbackEl);
        }
    );
}

// Crear animación por defecto para el loader
function createDefaultLoaderAnimation() {
    const container = document.getElementById('loader-3d-container');
    if (!container) return;
    
    const width = 200;
    const height = 200;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    
    // Crear grupo de geometrías animadas
    const group = new THREE.Group();
    
    // Crear múltiples formas
    const geometries = [
        new THREE.IcosahedronGeometry(1, 0),
        new THREE.OctahedronGeometry(1, 0),
        new THREE.TetrahedronGeometry(1, 0)
    ];
    
    for(let i = 0; i < 3; i++) {
        const geometry = geometries[i];
        const material = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color(`hsl(${200 + i * 40}, 100%, 50%)`),
            emissive: new THREE.Color(`hsl(${200 + i * 40}, 100%, 30%)`),
            emissiveIntensity: 0.5,
            wireframe: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            Math.cos(i * Math.PI * 2 / 3) * 2,
            0,
            Math.sin(i * Math.PI * 2 / 3) * 2
        );
        group.add(mesh);
    }
    
    scene.add(group);
    
    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x0066ff, 2);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);
    
    camera.position.z = 8;
    
    function animateLoader() {
        requestAnimationFrame(animateLoader);
        group.rotation.x += 0.02;
        group.rotation.y += 0.03;
        
        group.children.forEach((mesh, i) => {
            mesh.rotation.x += 0.01 * (i + 1);
            mesh.rotation.y += 0.02 * (i + 1);
        });
        
        renderer.render(scene, camera);
    }
    animateLoader();
}

// Animación principal
function animate() {
    requestAnimationFrame(animate);
    
    // Animar partículas
    if (models.particles) {
        models.particles.rotation.y += 0.0005;
    }
    
    // Animar formas flotantes
    if (models.shapes) {
        models.shapes.forEach((shape) => {
            shape.rotation.x += shape.userData.rotationSpeed.x;
            shape.rotation.y += shape.userData.rotationSpeed.y;
            shape.rotation.z += shape.userData.rotationSpeed.z;
            
            shape.position.y += Math.sin(Date.now() * 0.001 * shape.userData.floatSpeed) * 0.02 * shape.userData.floatAmplitude;
        });
    }
    
    // Mover cámara sutilmente
    camera.position.x = Math.sin(Date.now() * 0.0003) * 5;
    camera.position.y = 5 + Math.cos(Date.now() * 0.0004) * 2;
    camera.lookAt(0, 0, 0);
    
    renderer.render(scene, camera);
}

// Manejar resize
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

console.log('✅ JavaScript principal cargado exitosamente');
