// ============================================================
// 文件: js/3d-viewer.js
// 功能: 独立3D产品展示组件，不污染全局命名空间
// ============================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ============================================================
// ★★★ 配置区：在这里修改你的模型路径 ★★★
// ============================================================
const CONFIG = {
    // 替换成你的模型文件路径（支持 .glb 或 .gltf）
    modelPath: 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
    
    // 容器ID（必须和HTML中的ID一致）
    containerId: 'product-3d-viewer',
    
    // 背景颜色（十六进制）
    backgroundColor: 0xf0f0f0,
    
    // 自动旋转速度（0 = 不自动旋转）
    autoRotateSpeed: 2.0,
};

// ============================================================
// 核心逻辑（无需修改）
// ============================================================
(function init() {
    const container = document.getElementById(CONFIG.containerId);
    if (!container) {
        console.error(`❌ 找不到 ID 为 "${CONFIG.containerId}" 的容器`);
        return;
    }

    const loadingTip = document.getElementById('loadingTip');

    // --- 1. 场景 ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.backgroundColor);

    // --- 2. 相机 ---
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(2, 1.5, 4);
    camera.lookAt(0, 0, 0);

    // --- 3. 渲染器 ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // --- 4. 控制器 ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = CONFIG.autoRotateSpeed;
    controls.minDistance = 0.8;
    controls.maxDistance = 10;
    controls.target.set(0, 0, 0);
    controls.update();

    // --- 5. 光照 ---
    // 环境光
    scene.add(new THREE.AmbientLight(0x404060, 0.6));
    // 半球光
    scene.add(new THREE.HemisphereLight(0x87ceeb, 0x3a2a1a, 0.8));
    // 主光源
    const mainLight = new THREE.DirectionalLight(0xffeedd, 2.5);
    mainLight.position.set(3, 5, 4);
    mainLight.castShadow = true;
    scene.add(mainLight);
    // 背光
    const backLight = new THREE.DirectionalLight(0x4488ff, 0.8);
    backLight.position.set(-3, 1, -3);
    scene.add(backLight);
    // 补光
    const fillLight = new THREE.PointLight(0x4466ff, 0.3);
    fillLight.position.set(0, -2, 1);
    scene.add(fillLight);

    // --- 6. 加载模型 ---
    const loader = new GLTFLoader();
    loader.load(
        CONFIG.modelPath,
        (gltf) => {
            const model = gltf.scene;
            
            // 自动适配大小
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 0.01) {
                const scale = 1.5 / maxDim;
                model.scale.set(scale, scale, scale);
            }
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);

            // 阴影
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            scene.add(model);

            // 隐藏加载提示
            if (loadingTip) loadingTip.style.display = 'none';
            console.log('✅ 3D模型加载成功');
        },
        (xhr) => {
            // 更新加载进度
            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            if (loadingTip && !isNaN(percent)) {
                loadingTip.textContent = `⏳ 加载中 ${percent}%`;
            }
        },
        (error) => {
            console.error('❌ 模型加载失败:', error);
            if (loadingTip) {
                loadingTip.textContent = '⚠️ 加载失败，请检查路径';
                loadingTip.style.color = '#ff6b6b';
            }
        }
    );

    // --- 7. 窗口自适应 ---
    function onResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    window.addEventListener('resize', onResize);
    
    // 使用 ResizeObserver 监听容器变化（更精确）
    if (window.ResizeObserver) {
        new ResizeObserver(onResize).observe(container);
    }

    // --- 8. 动画循环 ---
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    console.log('🚀 3D产品视图已启动');
})();