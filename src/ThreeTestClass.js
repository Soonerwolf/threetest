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

        let geometry = new THREE.PlaneGeometry(1,1);
        var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color: 0xff0000}));
        this.scene.add(mesh);
    }

    draw ()
    {
        this.renderer.render(this.scene, this.camera);
    }
}