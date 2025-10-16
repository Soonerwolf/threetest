import * as THREE from "three";
import { vertexSource, fragmentSource } from "./radialShaders";

export class ThreeTest
{
    constructor(inContainer)
    {
        this.texture = null;
        this.geometry = null;
        this.material = null;
        this.mesh = null;
        
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(inContainer.devicePixelRatio);
        this.renderer.setSize(inContainer.offsetWidth, inContainer.offsetHeight);
        
        inContainer.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(45, inContainer.offsetWidth / inContainer.offsetHeight, 1, 4000);
        this.camera.position.set(0,0,3.333);

        this.needsRedraw = true;
    }

    reset ()
    {
        if (this.mesh) this.mesh.dispose();
        if (this.material) this.material.dispose();
        if (this.texture) this.texture.dispose();
        if (this.geometry) this.geometry.dispose();
    }


    setDataSource(inUrl)
    {
        console.log('setDataSource');
        this.reset();

        this.dataUrl = inUrl;
        let loadCallback = function(inTexture) {
            this.texture = inTexture;
            this.geometry = this.createRadialGeometry (360, 1.3);

            // const wireframe = new THREE.WireframeGeometry(geometry);
            // const lines = new THREE.LineSegments(wireframe);

            this.material = new THREE.ShaderMaterial(
                {
                    vertexShader: vertexSource,
                    fragmentShader: fragmentSource,
                    uniforms: {
                        //u_color: { value: new THREE.Color(0xFF0000)}
                        uRadius: {value: 1.3},
                        uTexture: { value: this.texture }
                    }
                }
            );

            this.mesh = new THREE.Mesh( this.geometry, this.material);
            this.scene.add(this.mesh);

            this.needsRedraw = true;
            this.draw();
        }.bind(this);

        const imgLoader = new THREE.TextureLoader();
        this.texture = imgLoader.load(
            this.dataUrl,
            loadCallback,
            undefined,
            function (err) {console.log(err)}
        );
       
        //const geometry = this.createPlaneGeometry(2,1.3);
        
        console.log('setDataSource EXIT');
    }


    createPlaneGeometry(inWidth, inHeight)
    {
        const halfWidth = inWidth / 2.0;
        const halfHeight = inHeight / 2.0;

        const points = [
            -halfWidth, -halfHeight, 0,
            halfWidth, -halfHeight, 0,
            halfWidth, halfHeight, 0,
            -halfWidth, halfHeight, 0
        ];
        const indices = [
            0,1,2,
            2,3,0
        ];
        // const normals = [
        //     0,0,1,
        //     0,0,1,
        //     0,0,1,
        //     0,0,1
        // ];
        const uvs = [
            0,1,
            1,1,
            1,0,
            0,0
        ]
        // const geometry = new THREE.PlaneGeometry(1,1);
        const geometry = new THREE.BufferGeometry();
        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        // geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        return geometry;
    }

    createRadialGeometry(inNumRadials, inRange)
    {
        const deg2rad = Math.PI / 180.0;
        const radius = inRange;
        
        let radialValue = 0; // set to starting radial value?
        let radianValue = deg2rad * (radialValue - 270.0);
        
        let vertLeftY = radius * Math.sin(radianValue);
        let vertLeftX = radius * Math.cos(radianValue);

        let vertPoints = [];
        
        let i = 0;
        while (i < inNumRadials)
        {
            vertPoints.push(0.0);
            vertPoints.push(0.0);
            vertPoints.push(0.0);

            vertPoints.push(vertLeftX);
            vertPoints.push(vertLeftY);
            vertPoints.push(0.0);
        
            // Calculate the right side vertex coords
            radialValue += 1.0;
            radianValue = deg2rad * (radialValue -270.0);

            let vertRightY = radius * Math.sin(radianValue);
            let vertRightX = radius * Math.cos(radianValue);

            vertPoints.push(vertRightX);
            vertPoints.push(vertRightY);
            vertPoints.push(0.0);

            vertLeftX = vertRightX;
            vertLeftY = vertRightY;
        
            i++;
        }

        let vertSize = 3;
        let outGeometry = new THREE.BufferGeometry();
        //outGeometry.setIndex(indices);
        
        const posAttribute = new THREE.Float32BufferAttribute(vertPoints, vertSize);
        outGeometry.setAttribute('position', posAttribute);
        
        return outGeometry;
    }


    createThreeBasicMaterial ()
    {
        const colorMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
        return colorMaterial;
    }


    createThreeShader ()
    {
        const imgLoader = new THREE.TextureLoader();
        let assignFunc = function(inTexture) {this.texture = inTexture;}.bind(this);
        imgLoader.load(
            'https://sdg.mesonet.org/people/brad/images/radialTest2.png',
            // onLoad callback
            assignFunc,
            undefined,
            function(err) {console.log(err);}
        );
        imgTexture.colorSpace = THREE.SRGBColorSpace;

        const outMaterial = new THREE.ShaderMaterial(
            {
                vertexShader: vertexSource,
                fragmentShader: fragmentSource,
                uniforms: {
                    //u_color: { value: new THREE.Color(0xFF0000)}
                    uRadius: {value: 1.3},
                    uTexture: { value: imgTexture }
                }
            }
        );
        return outMaterial;
    }



    createThreeTextureMaterial ()
    {
        const imgLoader = new THREE.TextureLoader();
        const imgTexture = imgLoader.load('https://sdg.mesonet.org/people/brad/images/radialTest2.png');
        imgTexture.colorSpace = THREE.SRGBColorSpace;

        const imgMaterial = new THREE.MeshBasicMaterial({map: imgTexture});
        return imgMaterial;
    }

    draw ()
    {
        if (this.needsRedraw)
        {
            console.log("Drawing...");
            this.renderer.render(this.scene, this.camera);
            this.needsRedraw = false;
        }
    }
}