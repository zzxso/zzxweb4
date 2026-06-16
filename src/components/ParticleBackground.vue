<template>
  <canvas ref="canvasRef" class="particle-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const canvasRef = ref(null)
let scene = null
let camera = null
let renderer = null
let particles = null
let particlePositions = null
let particleVelocities = null
let connections = null
let mouse = new THREE.Vector2(9999, 9999)
let animationId = null
let isMobile = false
let isVisible = true
let connectionFrameCounter = 0

const MOBILE_THRESHOLD = 768
const MIN_HEIGHT_THRESHOLD = 600
const CONNECTION_EVERY_N_FRAMES = 3

const detectMobile = () => {
  isMobile = window.innerWidth < MOBILE_THRESHOLD || window.innerHeight < MIN_HEIGHT_THRESHOLD
}

const initScene = () => {
  detectMobile()

  const canvas = canvasRef.value
  if (!canvas) return

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.z = 100

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'high-performance',
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, isMobile ? 1 : 2)
  )

  const particleCount = isMobile ? 400 : 1200
  const connectionDistance = isMobile ? 25 : 40

  const geometry = new THREE.BufferGeometry()
  particlePositions = new Float32Array(particleCount * 3)
  particleVelocities = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    particlePositions[i3] = (Math.random() - 0.5) * 200
    particlePositions[i3 + 1] = (Math.random() - 0.5) * 200
    particlePositions[i3 + 2] = (Math.random() - 0.5) * 100

    particleVelocities[i3] = (Math.random() - 0.5) * 0.1
    particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.1
    particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.03
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x6366f1,
    size: isMobile ? 2.5 : 1.5,
    transparent: true,
    opacity: isMobile ? 0.6 : 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })

  particles = new THREE.Points(geometry, particleMaterial)
  scene.add(particles)

  const maxLines = isMobile ? 300 : 1500
  const linePositions = new Float32Array(maxLines * 6)
  const lineGeometry = new THREE.BufferGeometry()
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x4f46e5,
    transparent: true,
    opacity: isMobile ? 0.08 : 0.15,
    blending: THREE.AdditiveBlending,
  })

  connections = new THREE.LineSegments(lineGeometry, lineMaterial)
  scene.add(connections)

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('touchmove', onTouchMove, { passive: true })
  window.addEventListener('resize', onResize)
  window.addEventListener('scroll', onScroll)

  // Visibility API - pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden
  })

  // IntersectionObserver - pause when off-screen
  const observer = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting
    },
    { threshold: 0 }
  )
  observer.observe(canvas)
}

const onMouseMove = (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
}

const onTouchMove = (event) => {
  if (event.touches.length > 0) {
    mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1
  }
}

const onResize = () => {
  detectMobile()
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, isMobile ? 1 : 2)
  )
}

const onScroll = () => {
  if (!particles) return
  const scrollY = window.scrollY
  particles.position.y = scrollY * 0.02
  connections.position.y = scrollY * 0.02
}

const updateConnections = () => {
  if (!connections || !particlePositions) return

  const positions = connections.geometry.attributes.position.array
  const particleCount = particlePositions.length / 3
  const connectionDistance = isMobile ? 25 : 40
  const connectionDistanceSq = connectionDistance * connectionDistance
  const maxLines = isMobile ? 300 : 1500
  let lineIndex = 0

  for (let i = 0; i < particleCount && lineIndex < maxLines; i++) {
    for (let j = i + 1; j < particleCount && lineIndex < maxLines; j++) {
      const i3 = i * 3
      const j3 = j * 3

      const dx = particlePositions[i3] - particlePositions[j3]
      const dy = particlePositions[i3 + 1] - particlePositions[j3 + 1]
      const dz = particlePositions[i3 + 2] - particlePositions[j3 + 2]
      const distanceSq = dx * dx + dy * dy + dz * dz

      if (distanceSq < connectionDistanceSq) {
        positions[lineIndex * 6] = particlePositions[i3]
        positions[lineIndex * 6 + 1] = particlePositions[i3 + 1]
        positions[lineIndex * 6 + 2] = particlePositions[i3 + 2]
        positions[lineIndex * 6 + 3] = particlePositions[j3]
        positions[lineIndex * 6 + 4] = particlePositions[j3 + 1]
        positions[lineIndex * 6 + 5] = particlePositions[j3 + 2]
        lineIndex++
      }
    }
  }

  for (let k = lineIndex * 6; k < positions.length; k++) {
    positions[k] = 0
  }

  connections.geometry.attributes.position.needsUpdate = true
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  if (!isVisible) return
  if (!particles || !particlePositions || !particleVelocities) return

  const particleCount = particlePositions.length / 3

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3

    particlePositions[i3] += particleVelocities[i3]
    particlePositions[i3 + 1] += particleVelocities[i3 + 1]
    particlePositions[i3 + 2] += particleVelocities[i3 + 2]

    // Simple mouse repulsion (no Raycaster on every frame for performance)
    const dx = particlePositions[i3] - mouse.x * 100
    const dy = particlePositions[i3 + 1] - mouse.y * 100
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < 25) {
      const force = (25 - dist) * 0.005
      particleVelocities[i3] += dx * force
      particleVelocities[i3 + 1] += dy * force
    }

    if (Math.abs(particlePositions[i3]) > 100) particleVelocities[i3] *= -1
    if (Math.abs(particlePositions[i3 + 1]) > 100) particleVelocities[i3 + 1] *= -1
    if (Math.abs(particlePositions[i3 + 2]) > 50) particleVelocities[i3 + 2] *= -1

    particleVelocities[i3] *= 0.99
    particleVelocities[i3 + 1] *= 0.99
  }

  particles.geometry.attributes.position.needsUpdate = true

  // Update connections every N frames
  connectionFrameCounter++
  if (connectionFrameCounter % CONNECTION_EVERY_N_FRAMES === 0) {
    updateConnections()
  }

  if (particles) {
    particles.rotation.z += 0.0002
    connections.rotation.z += 0.0002
  }

  renderer.render(scene, camera)
}

onMounted(() => {
  initScene()
  animate()
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', null)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', onScroll)

  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  if (renderer) {
    renderer.dispose()
  }
  if (scene) {
    scene.clear()
  }
})
</script>

<style lang="scss" scoped>
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .particle-canvas {
    display: none;
  }
}
</style>
