console.log("Vis 7 - SAT 20th JUN v1");

        const app = window.AIM;
        const THREE = app.THREE;
        const scene = app.scene;
  
        const CONFIG = {
          // ==========================================================
          // SHAPE
          // ==========================================================
  
          SHAPE: 'svg', // svg | sphere | cube | torus
  
          // ==========================================================
          // PARTICLES
          // ==========================================================
  
          CORE_PARTICLE_COUNT: 6000, // Total particle count. Try 2000 to 12000.
          PARTICLE_SIZE: 0.004, // Particle size. Try 0.001 to 0.02.
          OBJECT_SCALE: 0.0, // Used for non-SVG shapes.
  
          FACE_OPACITY: 1.0, // Final particle opacity.
          HOLD_OPACITY: 1.0, // Overall opacity multiplier.
          USE_ROUND_POINTS: false, // True = circular particles.
  
          // ==========================================================
          // SVG
          // ==========================================================
  
          SVG_SCALE: 0.003, // Overall SVG scale.
          SVG_GRID_JITTER: 0.0, // Randomises SVG particle placement.
          SVG_ALPHA_THRESHOLD: 20, // SVG alpha cutoff threshold.
  
          // ==========================================================
          // IMAGE COLOUR MAPPING
          // ==========================================================
  
          SVG_IMAGE_URL: 'https://cdn.prod.website-files.com/69dec44200d5fa5789162235/6a0d470fce8ee3c056e98343_services-cc-6.jpg', // Image mapped onto SVG particles.
  
          SVG_IMAGE_MIX: 1.0, // 0 = fallback colour, 1 = image colour.
          SVG_IMAGE_BRIGHTNESS: 1.0, // Image brightness multiplier.
          SVG_IMAGE_TO_WHITE: 0.4, // 0 = full image colour, 1 = white.
  
          SVG_FALLBACK_COLOR: '#ffffff', // Used when image mix is reduced.
  
          // ==========================================================
          // OBJECT POSITION
          // ==========================================================
  
          OBJECT_POSITION_X: 0.0, // Final object X position.
          OBJECT_POSITION_Y: 0.1, // Final object Y position.
          OBJECT_POSITION_Z: 0.2, // Final object Z position.
  
          // ==========================================================
          // OBJECT ROTATION
          // ==========================================================
  
          OBJECT_ROTATION_X: -0.5, // Final object X rotation.
          OBJECT_ROTATION_Y: -0.4, // Final object Y rotation.
          OBJECT_ROTATION_Z: -0.2, // Final object Z rotation.
  
          // ==========================================================
          // SOURCE
          // ==========================================================
  
          SOURCE_POSITION_X: 20.0, // Beam source X position.
          SOURCE_POSITION_Y: -9.0, // Beam source Y position.
          SOURCE_DISTANCE: 18.0, // Beam source Z depth.
  
          SOURCE_SPREAD_X: 0.035, // Beam source X randomness.
          SOURCE_SPREAD_Y: 0.035, // Beam source Y randomness.
          SOURCE_SPREAD_Z: 0.18, // Beam source Z randomness.
  
          LINE_SOURCE_RADIUS: 0.1, // Beam source cluster radius.
  
          // ==========================================================
          // BEAMS
          // ==========================================================
  
          EXTRUSION_BEAM_OPACITY_SOURCE: 0.0, // Beam opacity near source.
          EXTRUSION_BEAM_OPACITY_TARGET: 0.2, // Beam opacity near target.
  
          EXTRUSION_BEAM_COLOR: 0xffffff, // Fallback beam colour.
  
          BEAM_DELAY_MIN: 0.4, // Earliest beam start.
          BEAM_DELAY_MAX: 0.6, // Latest beam start.
  
          BEAM_DURATION_MIN: 0.3, // Fastest beam travel.
          BEAM_DURATION_MAX: 0.6, // Slowest beam travel.
  
          BEAM_MIN_ALPHA: 0.15, // Minimum visible beam opacity.
  
          // ==========================================================
          // TARGET REVEAL
          // ==========================================================
  
          TARGET_SWITCH_DURATION: 0.08, // Particle switch-on duration.
          TARGET_POP_SIZE: 1.4, // Particle pop scale amount.
          TARGET_POP_DURATION: 0.16, // Particle pop duration.
  
          // ==========================================================
          // PULSE
          // ==========================================================
  
          PULSE_ENABLED: true, // Enables autoplay pulse.
          PULSE_PARTICLE_COUNT: 6000, // Number of random particles and beams that pulse.
  
          PULSE_SPEED_MIN: 1.0, // Slowest pulse speed.
          PULSE_SPEED_MAX: 1.5, // Fastest pulse speed.
  
          PULSE_MIN_ALPHA: 0.1, // Lowest pulse opacity.
          PULSE_MAX_ALPHA: 1.0, // Highest pulse opacity.
  
          PULSE_BEAM_MULTIPLIER: 1.0, // How much beams follow particle pulse.
  
          // ==========================================================
          // TI
          // ==========================================================
  
          TI_VH: 100, // TI scroll range in vh.
  
          TI_SCENE_START_Y: -1.0, // Starting scene Y offset.
  
          TI_SCENE_START_ROT_X: 0.0, // Starting scene X rotation.
          TI_SCENE_START_ROT_Y: 0.0, // Starting scene Y rotation.
          TI_SCENE_START_ROT_Z: 0.0, // Starting scene Z rotation.
          TI_EASE_POWER: 0.0, // 0 = linear, 0.5 = normal ease out, 1 = strong ease out.
  
          // ==========================================================
          // MOUSE
          // ==========================================================
  
          MOUSE_INFLUENCE_X: 0.1, // Mouse movement on X.
          MOUSE_INFLUENCE_Y: 0.1, // Mouse movement on Y.
  
          MOUSE_EASE: 0.01, // Mouse smoothing, lower = slower ease out.
        };
  
        const SVG_STRING = `
  <svg width="174" height="61" viewBox="0 0 174 61" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M94.64 0.0302734H79.52V60.2603H94.64V0.0302734Z" fill="currentColor"/>
  <path d="M32.12 0L0 60.28H15.12L32.12 29.69L49.11 60.28H64.24L32.12 0Z" fill="currentColor"/>
  <path d="M141.89 30.14L109.77 0V19.27L141.89 49.41L174 19.27V0L141.89 30.14Z" fill="currentColor"/>
  </svg>
  `;
  
        const Vis7 = (() => {
          let sectionEl = null;
  
          let rootGroup = null;
  
          let coreGeometry = null;
          let coreParticles = null;
          let beamGeometry = null;
          let beamLines = null;
  
          let coreLocalPositions = null;
          let coreWorldPositions = null;
          let sourceWorldPositions = null;
  
          let coreAlphas = null;
          let coreSizes = null;
          let coreColors = null;
  
          let beamPositions = null;
          let beamAlphas = null;
          let beamColors = null;
  
          let revealDelays = null;
          let revealDurations = null;
  
          let pulseFlags = null;
          let pulseSpeeds = null;
          let pulsePhases = null;
  
          let isActive = false;
          let isBuilt = false;
          let isBuilding = false;
          let buildPromise = null;
  
          let tiProgress = 0;
  
          const objectPosition = new THREE.Vector3();
          const objectEuler = new THREE.Euler();
          const objectQuaternion = new THREE.Quaternion();
          const sourceCenter = new THREE.Vector3();
  
          const mouse = {
            x: 0,
            y: 0
          };
          const targetMouseOffset = new THREE.Vector3();
          const currentMouseOffset = new THREE.Vector3();
  
          function clamp01(v) {
            return Math.min(Math.max(v, 0), 1);
          }
  
          function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
          }
  
          function easeTI(t) {
            const amount = clamp01(CONFIG.TI_EASE_POWER);
  
            const easeOut = 1 - Math.pow(1 - t, 3);
  
            return t + (easeOut - t) * amount;
          }
  
          function updateTransformVectors() {
            objectPosition.set(CONFIG.OBJECT_POSITION_X, CONFIG.OBJECT_POSITION_Y, CONFIG.OBJECT_POSITION_Z);
            objectEuler.set(CONFIG.OBJECT_ROTATION_X, CONFIG.OBJECT_ROTATION_Y, CONFIG.OBJECT_ROTATION_Z);
            objectQuaternion.setFromEuler(objectEuler);
            sourceCenter.set(CONFIG.SOURCE_POSITION_X, CONFIG.SOURCE_POSITION_Y, -CONFIG.SOURCE_DISTANCE);
          }
  
          function getPointScale() {
            const height = app.container ? app.container.clientHeight : window.innerHeight;
            return height * app.renderer.getPixelRatio() * (app.camera.projectionMatrix.elements[5] / 2);
          }
  
          function createSharedParticleMaterial() {
            return new THREE.ShaderMaterial({
              transparent: true,
              depthWrite: false,
              depthTest: false,
              blending: THREE.NormalBlending,
              uniforms: {
                uSize: {
                  value: CONFIG.PARTICLE_SIZE
                },
                uScale: {
                  value: getPointScale()
                },
                uUseRoundPoints: {
                  value: CONFIG.USE_ROUND_POINTS ? 1.0 : 0.0,
                },
              },
              vertexShader: `
  attribute float aAlpha;
  attribute float aSize;
  attribute vec3 aColor;
  
  varying float vAlpha;
  varying vec3 vColor;
  
  uniform float uSize;
  uniform float uScale;
  
  void main() {
  vAlpha = max(aAlpha, 0.0);
  vColor = aColor;
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  
  gl_PointSize = aSize * uSize * uScale / max(1.0, -mvPosition.z);
  
  gl_Position = projectionMatrix * mvPosition;
  }
  `,
              fragmentShader: `
  uniform float uUseRoundPoints;
  
  varying float vAlpha;
  varying vec3 vColor;
  
  void main() {
  if (uUseRoundPoints > 0.5) {
  vec2 p = gl_PointCoord - vec2(0.5);
  
  if (dot(p, p) > 0.25) discard;
  }
  
  if (vAlpha < 0.01) discard;
  
  gl_FragColor = vec4(vColor, vAlpha);
  }
  `,
            });
          }
  
          function createBeamMaterial() {
            return new THREE.ShaderMaterial({
              transparent: true,
              depthWrite: false,
              depthTest: false,
              blending: THREE.NormalBlending,
              uniforms: {
                uOpacitySource: {
                  value: CONFIG.EXTRUSION_BEAM_OPACITY_SOURCE
                },
                uOpacityTarget: {
                  value: CONFIG.EXTRUSION_BEAM_OPACITY_TARGET
                },
              },
              vertexShader: `
  attribute float aBeamMix;
  attribute float aBeamAlpha;
  attribute vec3 aBeamColor;
  
  varying float vBeamMix;
  varying float vBeamAlpha;
  varying vec3 vBeamColor;
  
  void main() {
  vBeamMix = aBeamMix;
  vBeamAlpha = aBeamAlpha;
  vBeamColor = aBeamColor;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
              fragmentShader: `
  uniform float uOpacitySource;
  uniform float uOpacityTarget;
  
  varying float vBeamMix;
  varying float vBeamAlpha;
  varying vec3 vBeamColor;
  
  void main() {
  float alpha = mix(uOpacitySource, uOpacityTarget, vBeamMix) * vBeamAlpha;
  
  if (alpha < 0.001) discard;
  
  gl_FragColor = vec4(vBeamColor, alpha);
  }
  `,
            });
          }
  
          async function buildCoreObject() {
            const shapeData = await createShapePositions(CONFIG.SHAPE, CONFIG.CORE_PARTICLE_COUNT);
  
            coreLocalPositions = shapeData.positions;
            coreColors = shapeData.colors;
  
            const count = coreLocalPositions.length / 3;
  
            coreWorldPositions = new Float32Array(coreLocalPositions.length);
            sourceWorldPositions = new Float32Array(coreLocalPositions.length);
  
            coreAlphas = new Float32Array(count);
            coreSizes = new Float32Array(count);
            revealDelays = new Float32Array(count);
            revealDurations = new Float32Array(count);
  
            pulseFlags = new Float32Array(count);
            pulseSpeeds = new Float32Array(count);
            pulsePhases = new Float32Array(count);
  
            const pulseCount = Math.min(CONFIG.PULSE_PARTICLE_COUNT, count);
            const picked = new Set();
  
            while (picked.size < pulseCount) {
              picked.add(Math.floor(Math.random() * count));
            }
  
            for (let i = 0; i < count; i++) {
              const i3 = i * 3;
  
              const p = new THREE.Vector3(coreLocalPositions[i3], coreLocalPositions[i3 + 1], coreLocalPositions[i3 + 2]);
  
              p.applyQuaternion(objectQuaternion);
              p.add(objectPosition);
  
              coreWorldPositions[i3] = p.x;
              coreWorldPositions[i3 + 1] = p.y;
              coreWorldPositions[i3 + 2] = p.z;
  
              const sourceOffset = randomPointInDisc(CONFIG.LINE_SOURCE_RADIUS);
  
              sourceWorldPositions[i3] = sourceCenter.x + sourceOffset.x + (Math.random() - 0.5) * CONFIG.SOURCE_SPREAD_X;
              sourceWorldPositions[i3 + 1] = sourceCenter.y + sourceOffset.y + (Math.random() - 0.5) * CONFIG.SOURCE_SPREAD_Y;
              sourceWorldPositions[i3 + 2] = sourceCenter.z + (Math.random() - 0.5) * CONFIG.SOURCE_SPREAD_Z;
  
              coreAlphas[i] = 0.0;
              coreSizes[i] = 1.0;
  
              const delay = CONFIG.BEAM_DELAY_MIN + Math.random() * (CONFIG.BEAM_DELAY_MAX - CONFIG.BEAM_DELAY_MIN);
              const maxDuration = Math.max(CONFIG.BEAM_DURATION_MIN, 1.0 - delay);
              const duration = CONFIG.BEAM_DURATION_MIN + Math.random() * (Math.min(CONFIG.BEAM_DURATION_MAX, maxDuration) - CONFIG.BEAM_DURATION_MIN);
  
              revealDelays[i] = delay;
              revealDurations[i] = duration;
  
              pulseFlags[i] = CONFIG.PULSE_ENABLED && picked.has(i) ? 1.0 : 0.0;
              pulseSpeeds[i] = CONFIG.PULSE_SPEED_MIN + Math.random() * (CONFIG.PULSE_SPEED_MAX - CONFIG.PULSE_SPEED_MIN);
              pulsePhases[i] = Math.random() * Math.PI * 2;
            }
  
            coreGeometry = new THREE.BufferGeometry();
  
            coreGeometry.setAttribute('position', new THREE.BufferAttribute(coreWorldPositions, 3));
            coreGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(coreAlphas, 1));
            coreGeometry.setAttribute('aSize', new THREE.BufferAttribute(coreSizes, 1));
            coreGeometry.setAttribute('aColor', new THREE.BufferAttribute(coreColors, 3));
  
            coreParticles = new THREE.Points(coreGeometry, createSharedParticleMaterial());
  
            coreParticles.visible = false;
            coreParticles.frustumCulled = false;
            coreParticles.renderOrder = 10;
  
            rootGroup.add(coreParticles);
          }
  
          function buildExtrusionBeams() {
            const count = coreWorldPositions.length / 3;
  
            beamPositions = new Float32Array(count * 2 * 3);
            beamAlphas = new Float32Array(count * 2);
            beamColors = new Float32Array(count * 2 * 3);
  
            const beamMix = new Float32Array(count * 2);
  
            for (let i = 0; i < count; i++) {
              const i3 = i * 3;
              const i6 = i * 6;
              const i2 = i * 2;
  
              beamPositions[i6] = sourceWorldPositions[i3];
              beamPositions[i6 + 1] = sourceWorldPositions[i3 + 1];
              beamPositions[i6 + 2] = sourceWorldPositions[i3 + 2];
  
              beamPositions[i6 + 3] = sourceWorldPositions[i3];
              beamPositions[i6 + 4] = sourceWorldPositions[i3 + 1];
              beamPositions[i6 + 5] = sourceWorldPositions[i3 + 2];
  
              beamMix[i2] = 0.0;
              beamMix[i2 + 1] = 1.0;
  
              beamAlphas[i2] = 0.0;
              beamAlphas[i2 + 1] = 0.0;
  
              beamColors[i6] = coreColors[i3];
              beamColors[i6 + 1] = coreColors[i3 + 1];
              beamColors[i6 + 2] = coreColors[i3 + 2];
  
              beamColors[i6 + 3] = coreColors[i3];
              beamColors[i6 + 4] = coreColors[i3 + 1];
              beamColors[i6 + 5] = coreColors[i3 + 2];
            }
  
            beamGeometry = new THREE.BufferGeometry();
  
            beamGeometry.setAttribute('position', new THREE.BufferAttribute(beamPositions, 3));
            beamGeometry.setAttribute('aBeamMix', new THREE.BufferAttribute(beamMix, 1));
            beamGeometry.setAttribute('aBeamAlpha', new THREE.BufferAttribute(beamAlphas, 1));
            beamGeometry.setAttribute('aBeamColor', new THREE.BufferAttribute(beamColors, 3));
  
            beamLines = new THREE.LineSegments(beamGeometry, createBeamMaterial());
  
            beamLines.visible = false;
            beamLines.frustumCulled = false;
            beamLines.renderOrder = 20;
  
            rootGroup.add(beamLines);
          }
  
          async function build() {
            if (isBuilt) return;
  
            if (buildPromise) {
              return buildPromise;
            }
  
            isBuilding = true;
  
            buildPromise = (async () => {
              rootGroup = new THREE.Group();
              rootGroup.visible = isActive;
  
              scene.add(rootGroup);
  
              updateTransformVectors();
  
              await buildCoreObject();
  
              buildExtrusionBeams();
  
              isBuilt = true;
              isBuilding = false;
  
              applyReveal();
              applyTITransform();
            })();
  
            await buildPromise;
  
            buildPromise = null;
          }
  
          function dispose() {
  
            if (coreParticles) {
              rootGroup.remove(coreParticles);
  
              if (coreGeometry) coreGeometry.dispose();
              if (coreParticles.material) coreParticles.material.dispose();
            }
  
            if (beamLines) {
              rootGroup.remove(beamLines);
  
              if (beamGeometry) beamGeometry.dispose();
              if (beamLines.material) beamLines.material.dispose();
            }
  
            if (rootGroup) {
              scene.remove(rootGroup);
            }
  
            rootGroup = null;
  
            coreGeometry = null;
            coreParticles = null;
            beamGeometry = null;
            beamLines = null;
  
            coreLocalPositions = null;
            coreWorldPositions = null;
            sourceWorldPositions = null;
  
            coreAlphas = null;
            coreSizes = null;
            coreColors = null;
  
            beamPositions = null;
            beamAlphas = null;
            beamColors = null;
  
            revealDelays = null;
            revealDurations = null;
  
            pulseFlags = null;
            pulseSpeeds = null;
            pulsePhases = null;
  
            isBuilt = false;
            isBuilding = false;
          }
  
         function updateTransitionProgress(progress = {}) {
          sectionEl = sectionEl || document.getElementById('vis-7');
        
          if (!sectionEl) return;
        
          const viewportHeight =
            progress.viewportHeight ||
            window.AIM?.getViewportHeight?.() ||
            window.innerHeight ||
            1;
        
          const localY =
            typeof progress.shiftedLocalY === 'number'
              ? progress.shiftedLocalY
              : typeof progress.localY === 'number'
                ? progress.localY
                : 0;
        
          const tiPx = viewportHeight * (CONFIG.TI_VH / 100);
        
          tiProgress = clamp01(localY / Math.max(tiPx, 1));
        }
  
          function updateMouseOffset() {
            targetMouseOffset.x = mouse.x * CONFIG.MOUSE_INFLUENCE_X;
            targetMouseOffset.y = -mouse.y * CONFIG.MOUSE_INFLUENCE_Y;
            targetMouseOffset.z = 0;
  
            currentMouseOffset.lerp(targetMouseOffset, CONFIG.MOUSE_EASE);
          }
  
          function applyTITransform() {
            if (!rootGroup) return;
  
            updateMouseOffset();
  
            const t = easeTI(tiProgress);
            const inv = 1 - t;
  
            rootGroup.position.set(currentMouseOffset.x, CONFIG.TI_SCENE_START_Y * inv + currentMouseOffset.y, 0);
  
            rootGroup.rotation.set(CONFIG.TI_SCENE_START_ROT_X * inv, CONFIG.TI_SCENE_START_ROT_Y * inv, CONFIG.TI_SCENE_START_ROT_Z * inv);
          }
  
          function getPulseAlpha(index, targetT, time) {
            if (!CONFIG.PULSE_ENABLED) return 1.0;
            if (!pulseFlags || pulseFlags[index] < 0.5) return 1.0;
  
            const wave = Math.sin(time * pulseSpeeds[index] + pulsePhases[index]) * 0.5 + 0.5;
            const pulse = CONFIG.PULSE_MIN_ALPHA + wave * (CONFIG.PULSE_MAX_ALPHA - CONFIG.PULSE_MIN_ALPHA);
  
            return 1.0 + (pulse - 1.0) * clamp01(targetT);
          }
  
          function applyReveal() {
            if (!isBuilt || !coreGeometry || !beamGeometry) return;
  
            const count = coreWorldPositions.length / 3;
  
            const easedTI = easeTI(tiProgress);
  
            const time = performance.now() * 0.001;
  
            for (let i = 0; i < count; i++) {
              const i3 = i * 3;
              const i6 = i * 6;
              const i2 = i * 2;
  
              const delay = revealDelays[i];
              const duration = revealDurations[i];
  
              const beamT = clamp01((easedTI - delay) / Math.max(duration, 0.0001));
  
              const sx = sourceWorldPositions[i3];
              const sy = sourceWorldPositions[i3 + 1];
              const sz = sourceWorldPositions[i3 + 2];
  
              const tx = coreWorldPositions[i3];
              const ty = coreWorldPositions[i3 + 1];
              const tz = coreWorldPositions[i3 + 2];
  
              beamPositions[i6] = sx;
              beamPositions[i6 + 1] = sy;
              beamPositions[i6 + 2] = sz;
  
              beamPositions[i6 + 3] = sx + (tx - sx) * beamT;
  
              beamPositions[i6 + 4] = sy + (ty - sy) * beamT;
  
              beamPositions[i6 + 5] = sz + (tz - sz) * beamT;
  
              const travellingAlpha = beamT > 0.001 && beamT < 0.999 ? CONFIG.BEAM_MIN_ALPHA + beamT * (1 - CONFIG.BEAM_MIN_ALPHA) : beamT >= 0.999 ? 1 : 0;
  
              const targetT = clamp01((beamT - 1.0 + CONFIG.TARGET_SWITCH_DURATION) / CONFIG.TARGET_SWITCH_DURATION);
  
              const popT = clamp01((beamT - 1.0 + CONFIG.TARGET_POP_DURATION) / CONFIG.TARGET_POP_DURATION);
  
              const pulseAlpha = getPulseAlpha(i, targetT, time);
  
              const beamPulseAlpha = 1.0 - (1.0 - pulseAlpha) * CONFIG.PULSE_BEAM_MULTIPLIER;
  
              const baseParticleAlpha = targetT * CONFIG.FACE_OPACITY * CONFIG.HOLD_OPACITY;
  
              const baseBeamAlpha = travellingAlpha;
  
              beamAlphas[i2] = baseBeamAlpha * beamPulseAlpha;
  
              beamAlphas[i2 + 1] = baseBeamAlpha * beamPulseAlpha;
  
              coreAlphas[i] = baseParticleAlpha * pulseAlpha;
  
              coreSizes[i] = 1.0 + Math.sin(popT * Math.PI) * CONFIG.TARGET_POP_SIZE * targetT;
            }
  
            coreGeometry.attributes.aAlpha.needsUpdate = true;
            coreGeometry.attributes.aSize.needsUpdate = true;
  
            beamGeometry.attributes.position.needsUpdate = true;
            beamGeometry.attributes.aBeamAlpha.needsUpdate = true;
          }

  
          async function createShapePositions(shapeName, count) {
            if (shapeName === 'cube') return createFallbackShapeData(createCubePositions(count));
            if (shapeName === 'torus') return createFallbackShapeData(createTorusPositions(count));
            if (shapeName === 'svg') return await createFlatSVGPositions(SVG_STRING, count);
  
            return createFallbackShapeData(createSpherePositions(count));
          }
  
          function createFallbackShapeData(positions) {
            const count = positions.length / 3;
            const colors = new Float32Array(count * 3);
            const fallback = new THREE.Color(CONFIG.SVG_FALLBACK_COLOR);
  
            for (let i = 0; i < count; i++) {
              const i3 = i * 3;
  
              colors[i3] = fallback.r;
              colors[i3 + 1] = fallback.g;
              colors[i3 + 2] = fallback.b;
            }
  
            return {
              positions,
              colors
            };
          }
  
          function createSpherePositions(count) {
            const out = new Float32Array(count * 3);
            const radius = CONFIG.OBJECT_SCALE;
  
            for (let i = 0; i < count; i++) {
              const i3 = i * 3;
  
              const u = Math.random();
              const v = Math.random();
  
              const theta = 2 * Math.PI * u;
              const phi = Math.acos(2 * v - 1);
  
              out[i3] = radius * Math.sin(phi) * Math.cos(theta);
              out[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
              out[i3 + 2] = radius * Math.cos(phi);
            }
  
            return out;
          }
  
          function createCubePositions(count) {
            const out = new Float32Array(count * 3);
            const size = CONFIG.OBJECT_SCALE * 2;
  
            for (let i = 0; i < count; i++) {
              const i3 = i * 3;
  
              out[i3] = (Math.random() - 0.5) * size;
              out[i3 + 1] = (Math.random() - 0.5) * size;
              out[i3 + 2] = (Math.random() - 0.5) * size;
            }
  
            return out;
          }
  
          function createTorusPositions(count) {
            const out = new Float32Array(count * 3);
            const R = CONFIG.OBJECT_SCALE * 0.95;
            const r = CONFIG.OBJECT_SCALE * 0.34;
  
            for (let i = 0; i < count; i++) {
              const i3 = i * 3;
  
              const u = Math.random() * Math.PI * 2;
              const v = Math.random() * Math.PI * 2;
  
              out[i3] = (R + r * Math.cos(v)) * Math.cos(u);
              out[i3 + 1] = (R + r * Math.cos(v)) * Math.sin(u);
              out[i3 + 2] = r * Math.sin(v);
            }
  
            return out;
          }
  
          async function createFlatSVGPositions(svgString, targetCount) {
            const img = await loadSVGImage(svgString);
            const image = await loadColorImage(CONFIG.SVG_IMAGE_URL);
  
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', {
              willReadFrequently: true
            });
  
            const drawWidth = 1200;
            const aspect = img.height / img.width;
            const drawHeight = Math.max(1, Math.round(drawWidth * aspect));
  
            canvas.width = drawWidth;
            canvas.height = drawHeight;
  
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  
            const colorCanvas = document.createElement('canvas');
            const colorCtx = colorCanvas.getContext('2d', {
              willReadFrequently: true
            });
  
            colorCanvas.width = drawWidth;
            colorCanvas.height = drawHeight;
  
            drawImageCover(colorCtx, image, drawWidth, drawHeight);
  
            const colorData = colorCtx.getImageData(0, 0, drawWidth, drawHeight).data;
  
            let filledPixelCount = 0;
  
            for (let i = 3; i < imageData.length; i += 4) {
              if (imageData[i] > CONFIG.SVG_ALPHA_THRESHOLD) {
                filledPixelCount++;
              }
            }
  
            if (!filledPixelCount) {
              console.warn('No SVG pixels found. Falling back to sphere.');
              return createFallbackShapeData(createSpherePositions(targetCount));
            }
  
            const areaPerParticle = filledPixelCount / targetCount;
            const step = Math.max(1, Math.round(Math.sqrt(areaPerParticle)));
  
            const sampled = [];
  
            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;
  
            for (let y = 0; y < canvas.height; y += step) {
              for (let x = 0; x < canvas.width; x += step) {
                const jitterX = (Math.random() - 0.5) * step * CONFIG.SVG_GRID_JITTER;
                const jitterY = (Math.random() - 0.5) * step * CONFIG.SVG_GRID_JITTER;
  
                const sx = Math.max(0, Math.min(canvas.width - 1, Math.round(x + jitterX)));
                const sy = Math.max(0, Math.min(canvas.height - 1, Math.round(y + jitterY)));
  
                const idx = (sy * canvas.width + sx) * 4;
                const alpha = imageData[idx + 3];
  
                if (alpha > CONFIG.SVG_ALPHA_THRESHOLD) {
                  sampled.push({
                    x: sx,
                    y: sy
                  });
  
                  if (sx < minX) minX = sx;
                  if (sy < minY) minY = sy;
                  if (sx > maxX) maxX = sx;
                  if (sy > maxY) maxY = sy;
                }
              }
            }
  
            if (!sampled.length) {
              console.warn('No SVG sample points found. Falling back to sphere.');
              return createFallbackShapeData(createSpherePositions(targetCount));
            }
  
            const centerX = (minX + maxX) * 0.5;
            const centerY = (minY + maxY) * 0.5;
  
            const out = new Float32Array(sampled.length * 3);
            const colors = new Float32Array(sampled.length * 3);
  
            for (let i = 0; i < sampled.length; i++) {
              const i3 = i * 3;
  
              out[i3] = (sampled[i].x - centerX) * CONFIG.SVG_SCALE;
              out[i3 + 1] = (centerY - sampled[i].y) * CONFIG.SVG_SCALE;
              out[i3 + 2] = 0;
  
              const cIdx = (sampled[i].y * drawWidth + sampled[i].x) * 4;
              const fallback = new THREE.Color(CONFIG.SVG_FALLBACK_COLOR);
  
              const imageColor = new THREE.Color(colorData[cIdx] / 255, colorData[cIdx + 1] / 255, colorData[cIdx + 2] / 255);
  
              imageColor.multiplyScalar(CONFIG.SVG_IMAGE_BRIGHTNESS);
  
              imageColor.r = THREE.MathUtils.clamp(imageColor.r, 0, 1);
              imageColor.g = THREE.MathUtils.clamp(imageColor.g, 0, 1);
              imageColor.b = THREE.MathUtils.clamp(imageColor.b, 0, 1);
  
              imageColor.r = THREE.MathUtils.lerp(imageColor.r, 1.0, CONFIG.SVG_IMAGE_TO_WHITE);
              imageColor.g = THREE.MathUtils.lerp(imageColor.g, 1.0, CONFIG.SVG_IMAGE_TO_WHITE);
              imageColor.b = THREE.MathUtils.lerp(imageColor.b, 1.0, CONFIG.SVG_IMAGE_TO_WHITE);
  
              const finalColor = fallback.lerp(imageColor, CONFIG.SVG_IMAGE_MIX);
  
              colors[i3] = finalColor.r;
              colors[i3 + 1] = finalColor.g;
              colors[i3 + 2] = finalColor.b;
            }
  
            return {
              positions: out,
              colors,
            };
          }
  
          function drawImageCover(ctx, img, width, height) {
            if (!img || !img.width || !img.height) {
              ctx.fillStyle = CONFIG.SVG_FALLBACK_COLOR;
              ctx.fillRect(0, 0, width, height);
              return;
            }
  
            const imageAspect = img.width / img.height;
            const frameAspect = width / height;
  
            let drawWidth;
            let drawHeight;
            let drawX;
            let drawY;
  
            if (imageAspect > frameAspect) {
              drawHeight = height;
              drawWidth = height * imageAspect;
              drawX = (width - drawWidth) * 0.5;
              drawY = 0;
            } else {
              drawWidth = width;
              drawHeight = width / imageAspect;
              drawX = 0;
              drawY = (height - drawHeight) * 0.5;
            }
  
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          }
  
          function loadColorImage(url) {
            return new Promise((resolve) => {
              if (!url) {
                resolve(null);
                return;
              }
  
              const img = new Image();
              img.crossOrigin = 'anonymous';
  
              img.onload = () => resolve(img);
              img.onerror = () => resolve(null);
  
              img.src = url;
            });
          }
  
          function loadSVGImage(svgString) {
            return new Promise((resolve, reject) => {
              const blob = new Blob([svgString], {
                type: 'image/svg+xml;charset=utf-8'
              });
              const url = URL.createObjectURL(blob);
              const img = new Image();
  
              img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
              };
  
              img.onerror = (err) => {
                URL.revokeObjectURL(url);
                reject(err);
              };
  
              img.src = url;
            });
          }
  
          function randomPointInDisc(radius) {
            const a = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * radius;
  
            return {
              x: Math.cos(a) * r,
              y: Math.sin(a) * r,
            };
          }
  
          window.addEventListener('pointermove', (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
          });
  
          return {
            async init() {
                  sectionEl = document.getElementById('vis-7');
                
                  await build();
                
                  window.AIM_VIS7_READY = true;
                
                  window.dispatchEvent(
                    new CustomEvent('aimVisualReady', {
                      detail: { id: 'vis-7' },
                    })
                  );
                },
            enter(app, progress = {}) {
              isActive = true;
  
              updateTransitionProgress(progress);
  
              if (!isBuilt) {
                build().then(() => {
                  if (!isActive) return;
  
                  if (rootGroup) rootGroup.visible = true;
                  if (coreParticles) coreParticles.visible = true;
                  if (beamLines) beamLines.visible = true;
  
                  applyTITransform();
                  applyReveal();

                });
  
                return;
              }
  
              if (rootGroup) rootGroup.visible = true;
              if (coreParticles) coreParticles.visible = true;
              if (beamLines) beamLines.visible = true;
  
              applyTITransform();
              applyReveal();

            },
  
            update(app, progress = {}) {
              if (!isActive) return;
  
              updateTransitionProgress(progress);
              applyTITransform();
              applyReveal();
            },
  
            tick(app, progress = {}) {
              if (!isActive) return;
  
              updateTransitionProgress(progress);
              applyTITransform();
              applyReveal();
            },
  
            exit() {
              isActive = false;
  
              if (rootGroup) rootGroup.visible = false;
              if (coreParticles) coreParticles.visible = false;
              if (beamLines) beamLines.visible = false;
            },
  
            resize() {
              if (coreParticles && coreParticles.material.uniforms.uScale) {
                coreParticles.material.uniforms.uScale.value = getPointScale();
              }
            },
  
            destroy() {
              dispose();
            },
          };
        })();
window.AIM.register('vis-7', Vis7);
