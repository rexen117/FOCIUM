import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
uniform float uTime;
// Classic Perlin/simplex noise by Ian McEwan, Ashima Arts (slightly adapted)
vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857; // 1.0/7.0
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.x, a0.y, h.x);
  vec3 p1 = vec3(a0.z, a0.w, h.y);
  vec3 p2 = vec3(a1.x, a1.y, h.z);
  vec3 p3 = vec3(a1.z, a1.w, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

uniform float uNoiseAmp;
uniform float uTime;
void main() {
  vUv = uv;
  vNormal = normal;
  vec3 pos = position;
  float n = snoise(vec3(pos * 1.3 + uTime * 0.25));
  pos += normal * n * uNoiseAmp;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const fragmentShader = `
precision highp float;
varying vec2 vUv;
varying vec3 vNormal;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
void main(){
  float intensity = pow(1.0 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 2.0);
  float pulse = 0.5 + 0.5 * sin(uTime * 1.6 + length(vUv - 0.5) * 10.0);
  vec3 color = mix(uColorA, uColorB, vUv.y + pulse * 0.2);
  color += vec3(0.08) * intensity;
  gl_FragColor = vec4(color, 1.0);
}
`

export default function Orb(){
  const mesh = useRef()
  const materialRef = useRef()

  // create geometry once
  const geometry = React.useMemo(()=>{
    // Lower detail for better performance during the hackathon.
    // Increase the second param if you need more smoothness (e.g. 8 or 16).
    const g = new THREE.IcosahedronGeometry(1.2, 6)
    g.computeVertexNormals()
    return g
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if(materialRef.current){
      materialRef.current.uniforms.uTime.value = t
    }
    if(mesh.current){
      mesh.current.rotation.y += 0.002
      mesh.current.rotation.x = Math.sin(t * 0.08) * 0.05
    }
  })

  return (
    <mesh ref={mesh} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uNoiseAmp: { value: 0.22 },
          uColorA: { value: new THREE.Color('#62f0ff') },
          uColorB: { value: new THREE.Color('#8a5cff') }
        }}
        // enable lighting response from threejs
        lights={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
