import * as THREE from "three";
import { vertexSource, fragmentSource } from "./radialShaders";

export class ThreeTest
{
    constructor(inContainer)
    {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(inContainer.devicePixelRatio);
        this.renderer.setSize(inContainer.offsetWidth, inContainer.offsetHeight);
        
        inContainer.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(45, inContainer.offsetWidth / inContainer.offsetHeight, 1, 4000);
        this.camera.position.set(0,0,3.333);

        //const geometry = this.createPlaneGeometry(2,1.3);
        const geometry = this.createRadialGeometry (360, 1.3);

        // const wireframe = new THREE.WireframeGeometry(geometry);
        // const lines = new THREE.LineSegments(wireframe);
        const material = this.createThreeBasicShader();
        const mesh = new THREE.Mesh( geometry, material);

        this.scene.add(mesh);
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
        
        let radialValue = 0.0;
        let texLeft = radialValue / 360.0;
        
        let radianValue = deg2rad * (radialValue - 270.0);
        let vertLeftY = radius * Math.sin(radianValue);
        let vertLeftX = radius * Math.cos(radianValue);

        const texTop = 1.0;
        const texBottom = 0.0;

        let texPoints = []
        let vertPoints = [];
        let indices = [];
        let indexCenter = 0, indexLeft = 1, indexRight = 2;
        let i = 1;
        while (i < inNumRadials)
        {
            vertPoints.push(0.0);
            vertPoints.push(0.0);
            vertPoints.push(0.0);

            indices.push(indexCenter);

            vertPoints.push(vertLeftX);
            vertPoints.push(vertLeftY);
            vertPoints.push(0.0);
            indices.push(indexLeft++);
            
            // Left side texture coordinates
            texPoints.push (texLeft);
            texPoints.push (texBottom);
            texPoints.push(texLeft);
            texPoints.push(texTop);
            
            // Calculate the right side vertex coords
            radialValue += 1.0;
            radianValue = deg2rad * (radialValue -270.0);

            let vertRightY = radius * Math.sin(radianValue);
            let vertRightX = radius * Math.cos(radianValue);

            vertPoints.push(vertRightX);
            vertPoints.push(vertRightY);
            vertPoints.push(0.0);

            indices.push(indexRight++);
            if (indexRight == 360) indexRight = 0;

            let texRight = radialValue / 360.0;
            texPoints.push(texRight);
            texPoints.push(texTop);

            vertLeftX = vertRightX;
            vertLeftY = vertRightY;
            texLeft = texRight;

            i++;
        }

        let vertSize = 3;
        let outGeometry = new THREE.BufferGeometry();
        //outGeometry.setIndex(indices);
        
        const posAttribute = new THREE.Float32BufferAttribute(vertPoints, vertSize);
        const uvAttribute = new THREE.Float32BufferAttribute(texPoints, 2);
        outGeometry.setAttribute('position', posAttribute);
        outGeometry.setAttribute('uv', uvAttribute);

        return outGeometry;
    }

    createThreeBasicMaterial ()
    {
        const colorMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
        return colorMaterial;
    }


    createThreeBasicShader ()
    {
        const imgLoader = new THREE.TextureLoader();
        const imgTexture = imgLoader.load('https://sdg.mesonet.org/people/brad/images/radialTest2.png');
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
        this.renderer.render(this.scene, this.camera);
    }
}