uniform float uPixelRatio;
uniform float uSize;
uniform float uTime;

attribute float aScale;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.y = 1.0 + sin(200.0 * modelPosition.x + uTime * 0.2) * aScale;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    //Size
    gl_PointSize = uSize * uPixelRatio * aScale;

    //Size attenuation
    gl_PointSize *= ( 1.0 / - viewPosition.z );
}