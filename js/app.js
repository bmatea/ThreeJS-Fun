import * as THREE from 'three';
import { MeshPhysicalMaterial, SphereBufferGeometry, SpotLightHelper, TextureLoader } from 'three';
let OrbitControls = require("three-orbit-controls")(THREE);
import texture from '../assets/stone.jpg';
import tetraTexture from '../assets/metal.jpg';
import px from '../assets/cubemap/px.png';
import nx from '../assets/cubemap/nx.png';
import py from '../assets/cubemap/py.png';
import ny from '../assets/cubemap/ny.png';
import pz from '../assets/cubemap/pz.png';
import nz from '../assets/cubemap/nz.png';

export default class LandingPage {
    constructor(options) {
        this.container = options.container;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(80, window.innerWidth/window.innerHeight, 0.001, 1000);
        this.camera.position.set(0,2,11);
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        
        this.time = 0;
        this.particles = [];

        window.addEventListener('resize', this.onResize.bind(this));

        this.addObjects();
        this.render();
    }

    addObjects() {
        this.addFloor();
        this.addLight();
        this.addEnvMap();
        this.addTetrahedron();
        this.addParticles();
    }

    addFloor() {
        this.floorGeo = new THREE.PlaneBufferGeometry(100, 100);
        this.floorGeo.rotateX(-Math.PI*75/180);

        this.textureLoader = new THREE.TextureLoader();
        this.texture = this.textureLoader.load(texture);
        this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
        this.texture.repeat.set(12, 12);
        this.floorMaterial = new THREE.MeshPhysicalMaterial({ map: this.texture, bumpMap: this.texture });
        this.floorMesh = new THREE.Mesh(this.floorGeo, this.floorMaterial);
        this.floorMesh.position.set(0,0,0);
        this.floorMesh.receiveShadow = true;
        
        this.scene.add(this.floorMesh);
    }

    addLight() {
        const light = new THREE.PointLight( 0xffffff, 1, 100 );
        light.position.set(5, 10, 5);
        light.castShadow = true;
        this.scene.add(light);

        this.spotLight = new THREE.SpotLight(0xffffff, .8, 40, 90, 5);
        this.spotLight.position.set(0, 5, 2);
        console.log(this.spotLight);
        this.scene.add(this.spotLight);
    }

    addEnvMap() {
        this.cubemap = new THREE.CubeTextureLoader().load([px, nx, py, ny, pz, nz], undefined, undefined, err=> console.log(err));
        //this.scene.background = this.cubemap;
    }

    addTetrahedron() {
        this.tetraGeo = new THREE.TetrahedronBufferGeometry();
        let tetraTex = this.textureLoader.load(tetraTexture);
        this.tetraMaterial = new THREE.MeshPhysicalMaterial({envMap: this.cubemap, map: tetraTex, metalness: 0.9, roughness: 0  });
        this.tetraMesh = new THREE.Mesh(this.tetraGeo, this.tetraMaterial);
        this.tetraMesh.castShadow = true;
        
        this.tetraMesh.position.set(0, 4, 0);
        this.tetraGeo.scale(3,3,3);
        
        this.scene.add(this.tetraMesh);
    }
    
    rotateTetrahedron() {
        this.tetraMesh.rotation.x += 0.001;
        this.tetraMesh.rotation.y += 0.002;
        this.tetraMesh.rotation.z += 0.002;
    }
    
    addParticles() {
        let particleGeo = new SphereBufferGeometry(0.2, 10, 10);
        let particleMaterial = new MeshPhysicalMaterial({envMap: this.cubemap,  metalness: 0.9, roughness: 0.0});
        for (let i=0; i<100; i++) {
            let mesh = new THREE.Mesh(particleGeo, particleMaterial);
            mesh.position.set(Math.random()*100.0 - 50.0, Math.random()*3 + 3.0, Math.random()*80 - 70.0);
            let distanceFromTetra = mesh.position.distanceTo(this.tetraMesh.position);
            mesh.distance = distanceFromTetra;
            mesh.orbitAngle1 = Math.random()*Math.PI*2;
            mesh.orbitAngle2 = Math.random()*Math.PI*2;
            this.particles.push(mesh);
            this.scene.add(mesh);
        }
    }

    orbitParticles() {
        for(let i=0; i<this.particles.length; i++){
            let p = this.particles[i];
            p.rotation.y += 0.01;

            if (i % 2 == 0) {
                p.orbitAngle1 += 0.005;
                p.orbitAngle2 += 0.005;
            } else {
                p.orbitAngle1-= 0.005;
                p.orbitAngle2 -= 0.005;
            }
            
            p.position.x = p.distance*Math.cos(p.orbitAngle1);
            p.position.z = p.distance*Math.sin(p.orbitAngle2);
        }
    }

    onResize() {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.time += 0.01;
        this.rotateTetrahedron();
        this.orbitParticles();
        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
}

new LandingPage({
    container: document.getElementById("container")
});