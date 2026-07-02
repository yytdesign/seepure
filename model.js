import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ========== 1. 初始化场景 ==========
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.FogExp2(0x1a1a2e, 0.008);

// ========== 2. 初始化相机 ==========
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3, 2, 5);
camera.lookAt(0, 0, 0);

// ========== 3. 初始化渲染器 ==========
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ========== 4. 轨道控制（支持鼠标和触摸）==========
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;      // 惯性效果
controls.dampingFactor = 0.05;
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;
controls.screenSpacePanning = true; // 平移时保持水平/垂直
controls.enableZoom = true;
controls.enablePan = true;
controls.target.set(0, 0, 0);
controls.minDistance = 1.0;
controls.maxDistance = 10.0;

// ========== 5. 添加光源系统（让材质有质感）==========

// 环境光 - 基础照明
const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
scene.add(ambientLight);

// 主光源 - 方向光（产生明暗对比）
const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
mainLight.position.set(5, 10, 7);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 1024;
mainLight.shadow.mapSize.height = 1024;
scene.add(mainLight);

// 辅助背光 - 暖色填充
const backLight = new THREE.PointLight(0xcc9966, 0.5);
backLight.position.set(-3, 1, -4);
scene.add(backLight);

// 冷色填充光 - 从底部
const fillLight = new THREE.PointLight(0x6699cc, 0.4);
fillLight.position.set(0, -2, 1);
scene.add(fillLight);

// 半球光 - 模拟天光
const hemiLight = new THREE.HemisphereLight(0x8b9dc3, 0x4a5b6e, 0.5);
scene.add(hemiLight);

// 可选：辅助网格地面（帮助定位，不需要可删除）
const gridHelper = new THREE.GridHelper(8, 20, 0x88aaff, 0x335588);
gridHelper.position.y = -1.2;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.25;
scene.add(gridHelper);

// ========== 6. 加载GLB模型 ==========
const loader = new GLTFLoader();
const loadingDiv = document.getElementById('loading');

// 【重要】修改这里：把你的模型文件名写进去
// 模型路径，根据你的实际文件位置修改
const modelPath = './models/your-model.glb';

loader.load(modelPath,
    // 加载成功回调
    (gltf) => {
        const model = gltf.scene;
        
        // 可选：自动计算并调整模型大小和位置
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // 让模型大小适合屏幕（2.5是经验值，可根据需要调整）
        const scale = 2.5 / maxDim;
        model.scale.set(scale, scale, scale);
        
        // 将模型中心移到原点
        model.position.sub(center.multiplyScalar(scale));
        
        scene.add(model);
        
        // 隐藏加载提示
        if (loadingDiv) loadingDiv.style.display = 'none';
        console.log('✅ 模型加载成功');
    },
    // 加载进度回调
    (xhr) => {
        if (loadingDiv && xhr.lengthComputable) {
            const percent = Math.floor((xhr.loaded / xhr.total) * 100);
            loadingDiv.innerHTML = `加载模型中 ${percent}% 🔄`;
        }
    },
    // 加载失败回调
    (error) => {
        console.error('❌ 模型加载失败:', error);
        if (loadingDiv) {
            loadingDiv.innerHTML = '⚠️ 模型加载失败，请检查文件路径';
            loadingDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
        }
    }
);

// ========== 7. 动画循环 ==========
function animate() {
    requestAnimationFrame(animate);
    
    // 更新轨道控制
    controls.update();
    
    // 渲染场景
    renderer.render(scene, camera);
}

animate();

// ========== 8. 窗口适配 ==========
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 控制台输出提示
console.log('🚀 3D模型查看器已启动 | 支持鼠标/触摸旋转缩放');