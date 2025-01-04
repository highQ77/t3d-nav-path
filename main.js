import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { EXRLoader } from 'three/examples/jsm/Addons.js';
import { texture } from 'three/tsl';
import { Vector3 } from 'three/webgpu';
// bumpmap512x512.png

// bumpmap href
// https://opengameart.org/content/700-noise-textures

(async () => {

    await new Promise(reslove => {
        window.addEventListener('DOMContentLoaded', reslove)
    })
    document.body.style.margin = '0px'

    const gui = new GUI();

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 0.66, 10)
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = .9;
    camera.position.y = 2.38;
    camera.lookAt(new Vector3)
    // renderer
    const renderer = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: true,
        stencil: true,
        depth: true
    });
    // 顏色空間設置
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    // 預設背景顏色 透明
    renderer.setClearColor(0, 0.0)
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);
    // renderer.domElement.style.pointerEvents = 'none'

    // const controls = new OrbitControls(camera, renderer.domElement);

    const geometry = new THREE.PlaneGeometry(3, 3);
    const material = new THREE.MeshStandardMaterial({ roughness: 0.122, metalness: 0.705 });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotateX(-90 / 180 * Math.PI)
    scene.add(plane);

    // path helper
    const points = []
    for (let i = 0; i < 5; i++) {
        const controlPoint = new THREE.SphereGeometry(.05, 16, 8);
        const point = new THREE.Mesh(controlPoint, material);
        points.push(point)
        scene.add(point);
    }

    points[0].position.x = .75
    points[0].position.y = .1
    points[0].position.z = .75

    points[1].position.x = .75
    points[1].position.y = .1
    points[1].position.z = -.35

    points[2].position.x = .0
    points[2].position.y = 1
    points[2].position.z = -.95

    points[3].position.x = -.75
    points[3].position.y = .1
    points[3].position.z = -.35

    points[4].position.x = -.75
    points[4].position.y = .1
    points[4].position.z = .75

    const pointCount = 500
    const curve = new THREE.CatmullRomCurve3(points.map(i => i.position));
    const segPoints = curve.getPoints(pointCount);
    const pointsGeo = new THREE.BufferGeometry().setFromPoints(segPoints);
    const pointsMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const curveObject = new THREE.Line(pointsGeo, pointsMaterial);
    scene.add(curveObject)

    // viewer
    const ugeometry = new THREE.SphereGeometry(.1);
    const umaterial = new THREE.MeshStandardMaterial({ roughness: 0.122, metalness: 0.705, color: 0xFFFF00 });
    const umesh = new THREE.Mesh(ugeometry, umaterial);
    umesh.position.set(segPoints[0].x, segPoints[0].y, segPoints[0].z)
    scene.add(umesh);

    let power = 20
    let segPointsIndex = 0
    window.addEventListener('wheel', e => {
        segPointsIndex = ~~(segPointsIndex + e.deltaY / power)
        if (segPointsIndex < 0) segPointsIndex = 0
        if (segPointsIndex > pointCount) segPointsIndex = pointCount
    })

    //建構環境光源
    const light = new THREE.AmbientLight(0xe0edd4);
    light.intensity = 0.85
    //將光源加進場景中
    scene.add(light);

    // 主光源
    const lightD = new THREE.DirectionalLight(0xffffff, Math.PI)
    lightD.position.set(-5.9, 7.5, 7.26)
    lightD.intensity = 3.15
    scene.add(lightD)

    // 反射光源
    const lightFloor = new THREE.DirectionalLight(0xffffff, Math.PI)
    lightFloor.position.set(100, -100, -100)
    lightFloor.intensity = 1.55
    scene.add(lightFloor)

    let camFolder = gui.addFolder('Camera Settings')
    camFolder.add(camera.position, 'x', -10, 10).name('position x');
    camFolder.add(camera.position, 'y', -10, 10).name('position y');
    camFolder.add(camera.position, 'z', -10, 10).name('position z');
    // let mainLightFolder = gui.addFolder('Env Settings')
    // mainLightFolder.addColor(light, 'color').name('Ambient Color');
    // mainLightFolder.add(light, 'intensity', 0, 50).name('Ambient Intensity');
    // // mainLightFolder.addColor(lightD, 'color').name('Main Light Color');
    // mainLightFolder.add(lightD, 'intensity', 0, 50).name('Main Light Intensity');
    // mainLightFolder.add(lightFloor, 'intensity', 0, 50).name('Reflect Light Intensity');
    // mainLightFolder.addColor(scene.fog, 'color').name('Fog Color');
    // mainLightFolder.add(scene.fog, 'near', 0, 10).name('Fog Near');
    // mainLightFolder.add(scene.fog, 'far', 0, 10).name('Fog Far');
    // // mainLightFolder.add(lightFloor.position, 'x', -100, 100).name('Reflect Light x');
    // // mainLightFolder.add(lightFloor.position, 'y', -100, 100).name('Reflect Light y');
    // // mainLightFolder.add(lightFloor.position, 'z', -100, 100).name('Reflect Light z');

    // let materialFolder = gui.addFolder('Material')
    // materialFolder.addColor(material, 'color').name('Material Color');
    // materialFolder.addColor(material, 'emissive').name('Material Emissive');
    // materialFolder.add(material, 'metalness', 0, 1).name('Material Metalness');
    // materialFolder.add(material, 'roughness', 0, 1).name('Material Roughness');
    // materialFolder.add(material, 'wireframe')
    // materialFolder.add(material, 'bumpScale', 0, 100)

    function animate() {
        umesh.position.x += (segPoints[segPointsIndex].x - umesh.position.x) / 10
        umesh.position.y += (segPoints[segPointsIndex].y - umesh.position.y) / 10
        umesh.position.z += (segPoints[segPointsIndex].z - umesh.position.z) / 10
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    onWindowResize()

    document.body.style.background = `linear-gradient(rgb(11,11,11),rgb(99, 99, 99))`
})()