import * as THREE from "three";

export class ThreeTest
{
    constructor(inContainer)
    {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(inContainer.offsetWidth, inContainer.offsetHeight);
        inContainer.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(45, inContainer.offsetWidth / inContainer.offsetHeight, 1, 4000);
        this.camera.position.set(0,0,3.333);

        const geometry = new THREE.PlaneGeometry(1,1);

        const imgLoader = new THREE.TextureLoader();
        const imgTexture = imgLoader.load('https://sdg.mesonet.org/people/brad/images/radialTest2.png');
        imgTexture.colorSpace = THREE.SRGBColorSpace;

        const imgMaterial = new THREE.MeshBasicMaterial({/*color: 0xff0000*/ map: imgTexture});
        const mesh = new THREE.Mesh( geometry, imgMaterial);
        this.scene.add(mesh);
    }

    draw ()
    {
        this.renderer.render(this.scene, this.camera);
        this.renderer.render(this.scene, this.camera);
    }
}