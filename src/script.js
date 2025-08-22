import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// Particle GLSL
import particleVertexShader from './shaders/particles/vertex.glsl'
import particleFragmentShader from './shaders/particles/fragment.glsl'

// Portal GLSL
import portalVertexShader from './shaders/portal/vertex.glsl'
import portalFragmentShader from './shaders/portal/fragment.glsl'

/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Texture
 */

const bakedTexture = textureLoader.load('/baked.jpg')
bakedTexture.flipY = false
bakedTexture.colorSpace = THREE.SRGBColorSpace

/**
 * Materials
 */
const bakedMaterial = new THREE.MeshBasicMaterial({map: bakedTexture})

const lampMaterial = new THREE.MeshBasicMaterial({color: 0xffffe5})

const portalMaterial = new THREE.ShaderMaterial({
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader,
    uniforms: {
        uTime: {value: 0},
        uColorStart : {value: new THREE.Color('#1e6177')},
        uColorEnd : {value: new THREE.Color('#ffffff')}
    },
    side: THREE.DoubleSide
})

gui.addColor(portalMaterial.uniforms.uColorStart, 'value')
gui.addColor(portalMaterial.uniforms.uColorEnd, 'value')

/**
 * Model
 */
gltfLoader.load('/portal_scene.glb',
    (gltf) => {
        gltf.scene.traverse((child) => {         
            if(child.name === 'Cube033' || child.name === 'Cube031') {
                child.material = lampMaterial
            }
            else if (child.name === 'Circle') {
                child.material = portalMaterial
            }
            else {
                child.material = bakedMaterial
            }
        })
        scene.add(gltf.scene)
    }
)

/**
 * Particles
 */
//Geometry
const particleGeometry = new THREE.BufferGeometry()
debugObject.count = 200

// Random position & scale
const position = new Float32Array(debugObject.count * 3)
const scale = new Float32Array(debugObject.count)

for(let i=0; i< debugObject.count*3; i++){
    position[i*3] = (Math.random() -0.5) * 4
    position[i*3 + 1] = Math.random() * 1.5
    position[i*3 + 2] = (Math.random() -0.5)* 4

    scale[i] = Math.random()
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
particleGeometry.setAttribute('aScale', new THREE.BufferAttribute(scale, 3))

//Material
const particleMaterial = new THREE.ShaderMaterial({
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    uniforms: {
        uTime: {value: 0},
        uPixelRatio : {value : Math.min(window.devicePixelRatio, 2)},
        uSize : {value : 200.0}
    }
})

gui.add(particleMaterial.uniforms.uSize, 'value').min(0.1).max(200).step(0.1).name('particle size')

//Mesh
const particle = new THREE.Points(
    particleGeometry,
    particleMaterial
)

scene.add(particle)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    //Update particles
    particleMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

debugObject.clearColor = '#010e07'
renderer.setClearColor(debugObject.clearColor)
gui.
    addColor(debugObject, 'clearColor')
    .onChange(() => {
        renderer.setClearColor(debugObject.clearColor)
    })
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    particleMaterial.uniforms.uTime.value = elapsedTime
    portalMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()