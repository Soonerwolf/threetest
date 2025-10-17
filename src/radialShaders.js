// Radial shaders
// Transforms a 2-d array into a radial image

const vertexSource = `
    varying vec3 vPosition;
    
    void main()
    {
        vPosition = position;

        vec4 clipCoords = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = clipCoords;
    }`;

// create GLSL source for fragment shader
const fragmentSource = `
    precision mediump float;
    
    varying vec3 vPosition;
    
    uniform float uRadius;
    uniform sampler2D uTexture;

    void main()
    {
        vec3 delta = vPosition;
        
        float dist = length(delta) / uRadius;
        vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

        if (dist <= 1.0)
        {
            float angle = atan(delta.x, delta.y);
            float angleDeg = degrees(angle);
            if (angleDeg < 0.0) angleDeg += 360.0;
            float angleFrac = angleDeg / 360.0;
//            color = vec4(0.0, angleFrac, 0.0, 1.0);
            color = texture(uTexture, vec2(angleFrac, dist));
        }
        gl_FragColor = color;
    }`;

export { vertexSource, fragmentSource };
