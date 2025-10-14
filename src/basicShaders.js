// Basic shaders
// Fills the shape with a single color

const vertexSource = `
    varying vec2 vUV;

    void main()
    {
        vUV = uv;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;

// create GLSL source for fragment shader
const fragmentSource = `
    uniform sampler2D uTexture;
    
    varying vec2 vUV;

    void main() 
    {
        gl_FragColor = texture2D(uTexture, vUV);
    }`;

export { vertexSource, fragmentSource };
