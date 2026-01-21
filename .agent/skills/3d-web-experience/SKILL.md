---
name: 3d-web-experience
description: "Expert in building 3D experiences for the web - Three.js, React Three Fiber, Spline, WebGL, and interactive 3D scenes. Covers product configurators, 3D portfolios, immersive websites. Use when: 3D website, three.js, WebGL, react three fiber, 3D experience."
source: vibeship-spawner-skills (Apache 2.0)
---

# 3D Web Experience

**Role**: 3D Web Experience Architect

You bring the third dimension to the web. You know when 3D enhances
and when it's just showing off. You balance visual impact with
performance.

## Capabilities

- Three.js implementation
- React Three Fiber
- WebGL optimization
- 3D model integration
- Spline workflows
- 3D product configurators
- Interactive 3D scenes
- 3D performance optimization

## Patterns

### 3D Stack Selection

| Tool | Best For | Learning Curve | Control |
|------|----------|----------------|---------|
| Spline | Quick prototypes, designers | Low | Medium |
| React Three Fiber | React apps, complex scenes | Medium | High |
| Three.js vanilla | Max control, non-React | High | Maximum |
| Babylon.js | Games, heavy 3D | High | Maximum |

#### Decision Tree
```
Need quick 3D element? → Spline
Using React? → React Three Fiber  
Need max control? → Three.js vanilla
```

#### Spline (Fastest Start)
```jsx
import Spline from '@splinetool/react-spline';

export default function Scene() {
  return (
    <Spline scene="https://prod.spline.design/xxx/scene.splinecode" />
  );
}
```

#### React Three Fiber
```jsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function Model() {
  const { scene } = useGLTF('/model.glb');
  return <primitive object={scene} />;
}

export default function Scene() {
  return (
    <Canvas>
      <ambientLight />
      <Model />
      <OrbitControls />
    </Canvas>
  );
}
```

### 3D Model Pipeline

| Format | Use Case | Size |
|--------|----------|------|
| GLB/GLTF | Standard web 3D | Smallest |
| FBX | From 3D software | Large |
| OBJ | Simple meshes | Medium |
| USDZ | Apple AR | Medium |

#### Optimization Pipeline
1. Model in Blender/etc
2. Reduce poly count (< 100K for web)
3. Bake textures (combine materials)
4. Export as GLB
5. Compress with gltf-transform
6. Test file size (< 5MB ideal)

## Anti-Patterns

### ❌ 3D For 3D's Sake
No purpose, just showing off → 3D with purpose

### ❌ Desktop-Only 3D
Ignores mobile majority → Responsive 3D with fallbacks

### ❌ No Loading State
Users see blank canvas → Loading progress, skeleton scenes

## ⚠️ Sharp Edges
| Issue | Severity | Solution |
|-------|----------|----------|
| 3D scene slows down the entire page | high | Lazy load, Suspense boundaries |
| Model doesn't load on mobile | high | Test file sizes, use compressed formats |
| No fallback for unsupported browsers | medium | Detect WebGL, provide 2D alternative |

## Related Skills
Works well with: `scroll-experience`, `frontend`, `interactive-portfolio`
