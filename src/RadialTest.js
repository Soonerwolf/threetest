/*
* RadialTest
* Testing radial output in ThreeJS
*/

import * as THREE from "three";
import NexradLevel3Parser from "NexradLevel3Parser";
import { fragmentSource, vertexSource } from "./radialShaders";
import * as RadarColors from "./config/color_curves";

export class RadialTest
{
   constructor(inContainer)
    {
        console.log("RadialTest constructor");
        this.mRadarData = {};
        this.mRadarUrl = "";
        this.mHasData = false;
        this.mNeedsToDraw = false;
        
        THREE.Cache.enabled = true;

        this.mGlParams = {
            renderer: null,
            scene: null,
            camera: null,
            texture: null,
            geometry: null,
            material: null,
            mesh: null,
        }
        this.mGlParams.renderer = new THREE.WebGLRenderer()
        this.mGlParams.renderer.setPixelRatio(inContainer.devicePixelRatio);
        this.mGlParams.renderer.setSize(inContainer.offsetWidth, inContainer.offsetHeight);
        inContainer.appendChild(this.mGlParams.renderer.domElement);

        this.mGlParams.camera = new THREE.PerspectiveCamera(45, inContainer.offsetWidth / inContainer.offsetHeight, 1, 4000);
        this.mGlParams.camera.position.set(0,0,3.333);

        this.mGlParams.scene = new THREE.Scene();

    }


    async initFromUrl (inUrl)
    {
        this.mRadarUrl = inUrl;
        let radarBuffer = await this.loadFromUrl(this.mRadarUrl);

        if (radarBuffer.byteLength > 0)
        {
            let radarData = this.parseRadarData(radarBuffer);
            if (radarData.payload)
            {
                let generateFunc = this.generateRadarImage.bind(this);
                this.resetGl();
                this.mRadarData = radarData;
                console.log(radarData);
                generateFunc();
                this.mHasData = true;
            }
        }
        else
        {
            console.error("radarbuffer.byteLength == 0");
        }
        if (this.mHasData) this.mNeedsToDraw = true;
        if (this.mNeedsRedraw) this.drawRadar();
    }


    async loadFromUrl (inUrl)
    {
        let outBuffer;
        console.log("Attempting to fetch ", inUrl);
        
        try {
            const response = await fetch(inUrl);
            console.log(response);
            if (!response.ok) {
                throw new Error(`Response not ok; status: ${response.status}`);
            }

            const result = await response.arrayBuffer();
            console.log("Result = ", result.byteLength);
            if (result.byteLength > 0)
            {
                outBuffer = result;
            }
        } catch (error) {
            console.error(error.message);
        }
        return outBuffer;
    }


    parseRadarData (inBuffer)
    {
        let outRadarData = {};
        if (inBuffer.byteLength > 0)
        {
            const parser = new NexradLevel3Parser(inBuffer, {});
            let didParse = parser.parse();
            if (didParse == 1)
            {
                console.log("Parse! 🥳");
                outRadarData = parser.parsed.data;
            }
            else
            {
                console.log("Did not parse.  🤨");
            }
        }
        else
        {
            console.log("radarBuffer is length 0");
        }
        return outRadarData;
    }

    
    generateRadarImage()
    {
        const colorBuffer = this.generateColorBuffer();
        this.mGlParams.radarTexture = new THREE.DataTexture(colorBuffer, this.mRadarData.numberOfRadials, this.mRadarData.numberOfRangeBins);
        this.mGlParams.geometry = this.createRadarGeometry();

        this.mGlParams.material = new THREE.ShaderMaterial(
            {
                vertexShader: vertexSource,
                fragmentShader: fragmentSource,
                uniforms: {
                    uRadius: {value: this.mRadarData.numberOfRangeBins},
                    uTexture: {value: this.mGlParams.texture}
                }
            }
        );

        this.mGlParams.mesh = new THREE.Mesh(this.mGeometry, this.mMaterial);

        const startRadial = this.mRadarData.radialAngleStart[0];
        const startRadian = THREE.MathUtils.degToRad(startRadial);
        this.mGlParams.mesh.rotateZ(-startRadian);

        this.mGlParams.scene.add(this.mGlParams.mesh);
        
        this.mNeedsRedraw = true;
    }


    generateColorBuffer ()
    {
        console.log('generateColorBuffer');
        
        let outColors = [];
        let colorTable = RadarColors.Reflectivity256;
        let colorValue = {};

        const numRadials = this.mRadarData.numberOfRadials;
        const numRangeBins = this.mRadarData.numberOfRangeBins;
        for (let radIndex = 0; radIndex < numRadials; radIndex++)
        {
            let radialInfo = this.mRadarData.binWord[radIndex];

            for (let rangeIndex = 0; rangeIndex < numRangeBins; rangeIndex++)
            {
                let binValue = radialInfo[rangeIndex];
                let colorHex = colorTable[binValue];
                colorValue = this.hexToRGB(colorHex);

                outColors.push(colorValue.r / 255.0);
                outColors.push(colorValue.g / 255.0);
                outColors.push(colorValue.b / 255.0);
                if ((colorValue.r + colorValue.g + colorValue.b) > 0)
                {
                    outColors.push(1.0);
                }
                else
                {
                    outColors.push(0.0);
                }
            }
        }
        console.log(outColors);
        return outColors;
    }


    createRadarGeometry ()
    {
        console.log('createRadarGeometry');

        const radius = this.mRadarData.numRangeBins;
        let radialValue = this.mRadarData.radialAngleStart[0];
        let radianValue = THREE.MathUtils.degToRad(radialValue);

        let vertStartY = radius * Math.sin(radianValue);
        let vertStartX = radius * Math.cos(radianValue);

        let vertPoints = [];

        let i = 1;
        while (i < this.mRadarData.numberOfRadials)
        {
            // center of the radar
            vertPoints.push(0.0);
            vertPoints.push(0.0);
            vertPoints.push(0.0);

            // beam from the current radial
            vertPoints.push(vertStartX);
            vertPoints.push(vertStartY);
            vertPoints.push(0.0);
            
            radialValue = this.mRadarData.radialAngleStart[i];
            radianValue = THREE.MathUtils.degToRad(radialValue);
            
            let vertEndY = radius * Math.sin(radianValue);
            let vertEndX = radius * Math.cos(radianValue);

            vertPoints.push(vertEndX);
            vertPoints.push(vertEndY);
            vertPoints.push(0.0);

            vertStartX = vertEndX;
            vertStartY = vertEndY;
        
            i++;
        }

        let vertSize = 3;
        let outGeometry = new THREE.BufferGeometry();
        
        const posAttribute = new THREE.Float32BufferAttribute(vertPoints, vertSize);
        outGeometry.setAttribute('position', posAttribute);
        
        return outGeometry;
    }


    hexToRGB(inHexString)
    {
         var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(inHexString);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : 
        {
            r: 0,
            g: 0,
            b: 0,
        };
    }

    drawRadar()
    {
        if (this.mNeedsRedraw)
        {
            this.mGlParams.renderer.render(this.mGlParams.scene, this.mGlParams.camera);
            this.mNeedsRedraw = false;
        }
    }


    resetGl()
    {
        if (this.mGlParams.mesh)
        {
            this.mGlParams.mesh.removeFromParent();
            this.mGlParams.mesh.dispose();
            this.mGlParams.mesh = null;
        
            this.mGlParams.material.dispose();
            this.mGlParams.material = null;

            this.mGlParams.geometry.dispose();
            this.mGlParams.geometry = null;

            this.mGlParams.texture.dispose();
            this.mGlParams.geometry = null;
        }
    }
}