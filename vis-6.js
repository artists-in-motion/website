 (function startWhenAIMReady() {
    if (!window.AIM) {
      window.addEventListener('aimGlobalReady', startWhenAIMReady, {
        once: true,
      });
      return;
    }

    const app = window.AIM;

    const THREE = app.THREE;
    const scene = app.scene;
    const container = app.container || document.body;

    const CONFIG = {
      // === IMAGE INPUTS ===
      IMAGE_URLS: ['https://cdn.prod.website-files.com/69dec44200d5fa5789162235/6a0d470f53bef97415fa643c_services-cc-3.jpg', 'https://cdn.prod.website-files.com/69dec44200d5fa5789162235/6a0d470fd60de97eda0e4745_services-sd-3.jpg', 'https://cdn.prod.website-files.com/69dec44200d5fa5789162235/69fc3e4104a446665141c025_b315331a6b60a373ff3c62fd52e9a1d7_services-cp-2.jpg', 'https://cdn.prod.website-files.com/69dec44200d5fa5789162235/6a0d470fe2d021788d4be3d5_services-os-1.jpg', 'https://cdn.prod.website-files.com/69dec44200d5fa5789162235/6a0d47109ae48de106727be4_services-sdir-4.jpg', 'https://cdn.prod.website-files.com/69dec44200d5fa5789162235/6a0fd6678918163860cfe524_services-pm-2.jpg'],

      // === IMAGE FRAME / MOSAIC ===
      FRAME_RATIO_X: 16, // Image frame aspect width.
      FRAME_RATIO_Y: 10, // Image frame aspect height.
      MOSAIC_COLS: 30, // Number of image tile columns. Higher = more detail, heavier.
      ALPHA_CUTOFF: 0.01, // Removes transparent / near-transparent tiles.
      PLANE_MAX_WIDTH: 1.5, // Image plane width. Height auto-fits from aspect.
      PARTICLE_SPACING_MULTIPLIER: 1.0, // Tile spacing multiplier. Above 1 adds gaps.

      // === IMAGE GRID LAYOUT ===
      GRID_COLS: 1, // Number of image columns.
      GRID_ROWS: 6, // Number of image rows.
      GRID_GAP_X: 0.2, // Horizontal gap between images.
      GRID_GAP_Y: 0.2, // Vertical gap between images.
      SECTION_COUNT: 6, // Number of images to use from IMAGE_URLS.

      // === BASE POSITION / ROTATION ===
      BASE_POS_X: 0.4, // Whole visual X position.
      BASE_POS_Y: 0.0, // Whole visual Y position.
      BASE_POS_Z: 0.0, // Whole visual Z position.
      BASE_ROT_X: -0.5, // Whole visual X rotation.
      BASE_ROT_Y: -0.1, // Whole visual Y rotation.
      BASE_ROT_Z: -0.15, // Whole visual Z rotation.

      // === SCROLL IMAGE TIMELINE ===
      FIRST_IMAGE_CENTER_VH: 100, // Scroll point where first image is centred.
      IMAGE_STEP_VH: 100, // Scroll distance between each image centre.
      COLUMN_Y_OFFSET: 0.0, // Extra vertical offset for the image column.

      // === IMAGE COLOUR ===
      IMAGE_BRIGHTNESS: 1.0, // Image brightness. 1 = original.
      IMAGE_CONTRAST: 1.0, // Image contrast. 1 = original.
      IMAGE_SATURATION: 1.0, // Image saturation. 1 = original.

      // === IMAGE CLOSE DARKENING ===
      IMAGE_CLOSE_DARKEN_NEAR: 2.0, // Distance where close darkening is strongest.
      IMAGE_CLOSE_DARKEN_FAR: 7.0, // Distance where close darkening fades out.
      IMAGE_CLOSE_DARKEN_STRENGTH: 0.0, // Strength of close darkening. 0 = off.

      // === IMAGE BUILD-IN ===
      BUILD_ZONE_START_Y: -2.0, // Image Y position where build starts.
      BUILD_ZONE_END_Y: -0.4, // Image Y position where build finishes.
      BUILD_ROW_STAGGER: 0.5, // Delay down each tile column. Higher = more cascading.
      BUILD_RANDOM_STAGGER: 0.0, // Random delay per tile. Keep 0 for clean non-flicker build.
      BUILD_EASE_POWER: 6.0, // Build easing strength.
      BUILD_ALPHA_POWER: 1.0, // Fade-in curve. Higher = slower alpha start.
      BUILD_COLUMN_GAP_MIN: 0.002, // Minimum extra vertical gap added per tile.
      BUILD_COLUMN_GAP_MAX: 0.5, // Maximum extra vertical gap added per tile.
      BUILD_COLUMN_GAP_DIRECTION: -1.0, // -1 = tiles start stretched downward.

      // === MOUSE ROTATION ===
      MOUSE_ROTATE_X: 0.18, // Mouse tilt strength on X.
      MOUSE_ROTATE_Y: 0.22, // Mouse turn strength on Y.
      MOUSE_ROTATE_Z: 0.06, // Mouse roll strength on Z.
      ROTATION_LERP: 0.08, // Rotation smoothing. Lower = smoother.

      // === IMAGE TILE WAVE ===
      WAVE_AMPLITUDE: 0.0, // Tile wave height. 0 = off.
      WAVE_FREQUENCY_X: 2.2, // Wave frequency across X.
      WAVE_FREQUENCY_Y: 1.8, // Wave frequency across Y.
      WAVE_SPEED: 1.2, // Wave animation speed.
      WAVE_PHASE_OFFSET_X: 0.0, // Wave phase offset on X.
      WAVE_PHASE_OFFSET_Y: 0.0, // Wave phase offset on Y.

      // === FLOAT CUBE SHARED COLOUR ===
      FLOAT_NEAR_Z: 0.0, // Local Z distance from image plane where cubes are nearest colour.
      FLOAT_FAR_Z: 0.5, // Local Z distance from image plane where cubes are furthest colour.
      FLOAT_NEAR_COLOR: new THREE.Color(0xffffff), // Colour closest to image plane.
      FLOAT_FAR_COLOR: new THREE.Color(0x555555), // Colour furthest from image plane.
      FLOAT_FALLOFF_POWER: 1.0, // Higher = keeps more cubes grey until very close to plane.

      // === FLOAT CUBE BACK LAYER ===
      FLOAT_BACK_ENABLED: true, // Turns rear cube layer on/off.
      FLOAT_BACK_COUNT: 900, // Number of rear cubes.
      FLOAT_BACK_SPREAD_X_MULTIPLIER: 3.55, // Rear layer width relative to image width.
      FLOAT_BACK_SPREAD_Y_MULTIPLIER: 1.22, // Rear layer height relative to image stack.
      FLOAT_BACK_EXTRA_HEIGHT: 2.0, // Extra vertical height for rear layer.
      FLOAT_BACK_Z_OFFSET: -0.75, // Rear layer centre behind image plane.
      FLOAT_BACK_Z_SPREAD: 0.9, // Rear layer depth spread.
      FLOAT_BACK_SCROLL_SPEED: 0.55, // Rear layer scroll speed relative to image column.
      FLOAT_BACK_Y_OFFSET: 0.0, // Extra rear layer Y offset.
      FLOAT_BACK_CLOSE_IMAGE_SCALE: 0.005, // Rear cube scale closest to image plane.
      FLOAT_BACK_FAR_IMAGE_SCALE: 0.004, // Rear cube scale furthest from image plane.
      FLOAT_BACK_OPACITY: 1.0, // Rear layer opacity.

      // === FLOAT CUBE FRONT LAYER ===
      FLOAT_FRONT_ENABLED: true, // Turns front cube layer on/off.
      FLOAT_FRONT_COUNT: 100, // Number of front cubes.
      FLOAT_FRONT_SPREAD_X_MULTIPLIER: 5.0, // Front layer width relative to image width.
      FLOAT_FRONT_SPREAD_Y_MULTIPLIER: 1.05, // Front layer height relative to image stack.
      FLOAT_FRONT_EXTRA_HEIGHT: 1.2, // Extra vertical height for front layer.
      FLOAT_FRONT_Z_OFFSET: 0.45, // Front layer centre in front of image plane.
      FLOAT_FRONT_Z_SPREAD: 0.45, // Front layer depth spread.
      FLOAT_FRONT_SCROLL_SPEED: 1.18, // Front layer scroll speed relative to image column.
      FLOAT_FRONT_Y_OFFSET: 0.0, // Extra front layer Y offset.
      FLOAT_FRONT_CLOSE_IMAGE_SCALE: 0.01, // Front cube scale closest to image plane.
      FLOAT_FRONT_FAR_IMAGE_SCALE: 0.03, // Front cube scale furthest from image plane.
      FLOAT_FRONT_OPACITY: 0.3, // Front layer opacity.

      // === TRANSITION OUT ===
      TO_LAST_FADE_TO: 0.0, // Last image opacity at end of transition out.
      TO_SCROLL_SPEED_MULTIPLIER: 0.5, // Extra scroll speed added during TO.
      TO_SCROLL_EASE_POWER: 2.0, // Higher = slower start into TO speed.

      // === TRANSITION IN ===
      TI_OPACITY_FROM: 0.0, // Starting opacity.
      TI_OPACITY_TO: 1.0, // Final opacity.
      TI_OPACITY_START: 0, // TI percentage where opacity starts.
      TI_OPACITY_END: 100, // TI percentage where opacity finishes.
      TI_START_Y: -0.35, // Starting Y offset during TI.
      TI_START_SCALE: 0.9, // Starting scale during TI.
      TI_EASE_POWER: 1.4, // TI easing strength.
    };

    const TRANSITION = {
      TI: 100,
      TO: 100,
      TO_FADE_POWER: 1.5,
    };

    const imageVertexShader = `
  attribute vec2 instanceUvOffset;
  attribute vec2 instanceUvScale;
  attribute vec2 instanceGridPos;
  attribute float instanceRandom;
  attribute float instanceRowProgress;
  attribute float instanceBuildYOffset;
  
  uniform float uTime;
  uniform float uWaveAmplitude;
  uniform float uWaveFrequencyX;
  uniform float uWaveFrequencyY;
  uniform float uWaveSpeed;
  uniform float uWavePhaseOffsetX;
  uniform float uWavePhaseOffsetY;
  uniform vec2 uPlaneOffset;
  
  uniform float uBuildProgress;
  uniform float uBuildRowStagger;
  uniform float uBuildRandomStagger;
  uniform float uBuildEasePower;
  uniform float uBuildAlphaPower;
  
  uniform float uCloseDarkenNear;
  uniform float uCloseDarkenFar;
  uniform float uCloseDarkenStrength;
  
  varying vec2 vTileUv;
  varying float vBuildAlpha;
  varying float vCloseDarken;
  
  float getWaveHeight(vec2 p) {
  float waveX =
  sin((p.x + uWavePhaseOffsetX) * uWaveFrequencyX + uTime * uWaveSpeed);
  
  float waveY =
  sin((p.y + uWavePhaseOffsetY) * uWaveFrequencyY + uTime * uWaveSpeed);
  
  return (waveX + waveY) * 0.5 * uWaveAmplitude;
  }
  
  void main() {
  vTileUv =
  instanceUvOffset +
  uv *
  instanceUvScale;
  
  float rowDelay =
  instanceRowProgress *
  uBuildRowStagger;
  
  float randomDelay =
  instanceRandom *
  uBuildRandomStagger;
  
  float totalDelay =
  min(
  rowDelay + randomDelay,
  0.95
  );
  
  float buildT =
  clamp(
  (uBuildProgress - totalDelay) /
  max(1.0 - totalDelay, 0.0001),
  0.0,
  1.0
  );
  
  buildT =
  pow(
  buildT,
  uBuildEasePower
  );
  
  vBuildAlpha =
  pow(
  buildT,
  uBuildAlphaPower
  );
  
  vec2 tileCenter =
  instanceGridPos +
  uPlaneOffset;
  
  vec2 vertexGridPos =
  tileCenter +
  position.xy;
  
  vec3 displacedPosition =
  position;
  
  float unbuilt =
  1.0 - buildT;
  
  displacedPosition.y +=
  unbuilt *
  instanceBuildYOffset;
  
  displacedPosition.z =
  getWaveHeight(vertexGridPos);
  
  vec4 mvPosition =
  modelViewMatrix *
  instanceMatrix *
  vec4(displacedPosition, 1.0);
  
  float d =
  -mvPosition.z;
  
  float closeAmount =
  1.0 -
  smoothstep(
  uCloseDarkenNear,
  uCloseDarkenFar,
  d
  );
  
  vCloseDarken =
  clamp(
  closeAmount * uCloseDarkenStrength,
  0.0,
  1.0
  );
  
  gl_Position =
  projectionMatrix *
  mvPosition;
  }
  `;

    const imageFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uAlphaCutoff;
  uniform float uOpacity;
  
  uniform float uImageBrightness;
  uniform float uImageContrast;
  uniform float uImageSaturation;
  
  varying vec2 vTileUv;
  varying float vBuildAlpha;
  varying float vCloseDarken;
  
  void main() {
  vec4 color =
  texture2D(
  uTexture,
  vTileUv
  );
  
  if (color.a < uAlphaCutoff) discard;
  
  vec3 rgb =
  color.rgb;
  
  rgb =
  (rgb - 0.5) *
  uImageContrast +
  0.5;
  
  float luma =
  dot(
  rgb,
  vec3(0.2126, 0.7152, 0.0722)
  );
  
  rgb =
  mix(
  vec3(luma),
  rgb,
  uImageSaturation
  );
  
  rgb *=
  uImageBrightness;
  
  rgb =
  mix(
  rgb,
  rgb * 0.45,
  vCloseDarken
  );
  
  color.rgb =
  rgb;
  
  color.a *=
  uOpacity *
  vBuildAlpha;
  
  if (color.a <= 0.001) discard;
  
  gl_FragColor =
  color;
  
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  }
  `;

    const Vis6 = (() => {
      let sectionEl = null;

      let outerGroup = null;
      let backFloatGroup = null;
      let columnGroup = null;
      let frontFloatGroup = null;

      let imagePlanes = [];

      let backFloatLayer = null;
      let frontFloatLayer = null;

      let isActive = false;
      let isBuilt = false;
      let isBuilding = false;

      let localY = 0;
      let tiProgress = 0;
      let toProgress = 0;
      let columnOffsetY = 0;

      let firstImageBaseY = 0;
      let imageStepY = 1;
      let columnTotalHeight = 1;
      let columnMaxWidth = 1;

      let mouseX = 0;
      let mouseY = 0;

      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin('anonymous');

      const currentRotation = {
        x: CONFIG.BASE_ROT_X,
        y: CONFIG.BASE_ROT_Y,
        z: CONFIG.BASE_ROT_Z,
      };

      const tempObject = new THREE.Object3D();

      function clamp01(v) {
        return Math.min(Math.max(v, 0), 1);
      }

      function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
      }

      function easeInCubic(t) {
        return t * t * t;
      }

      function inverseLerp(a, b, v) {
        if (a === b) return 0;
        return clamp01((v - a) / (b - a));
      }

      function randomSigned() {
        return Math.random() * 2 - 1;
      }

      function randomRange(min, max) {
        return min + Math.random() * (max - min);
      }

      function getToFade() {
        const fadeT = Math.pow(easeInCubic(toProgress), TRANSITION.TO_FADE_POWER);

        return 1 - fadeT * (1 - CONFIG.TO_LAST_FADE_TO);
      }

      function getTiProgress() {
        const rawT = inverseLerp(CONFIG.TI_OPACITY_START / 100, CONFIG.TI_OPACITY_END / 100, tiProgress);

        return Math.pow(easeOutCubic(rawT), CONFIG.TI_EASE_POWER);
      }

      function getTiOpacity() {
        const t = getTiProgress();

        return CONFIG.TI_OPACITY_FROM + (CONFIG.TI_OPACITY_TO - CONFIG.TI_OPACITY_FROM) * t;
      }

      function getFrameAspect() {
        return CONFIG.FRAME_RATIO_X / CONFIG.FRAME_RATIO_Y;
      }

      function getMosaicDimensions() {
        const cols = Math.max(1, Math.floor(CONFIG.MOSAIC_COLS));

        const rows = Math.max(1, Math.round(cols / getFrameAspect()));

        return {
          cols,
          rows,
        };
      }

      function getFrameSize() {
        const frameAspect = getFrameAspect();

        return {
          width: CONFIG.PLANE_MAX_WIDTH,
          height: CONFIG.PLANE_MAX_WIDTH / frameAspect,
        };
      }

      function sampleAlphaMaskForFrame(image, cols, rows) {
        const canvas = document.createElement('canvas');

        canvas.width = cols;
        canvas.height = rows;

        const ctx = canvas.getContext('2d', {
          willReadFrequently: true,
        });

        ctx.clearRect(0, 0, cols, rows);

        const imageAspect = image.width / image.height;

        const frameAspect = cols / rows;

        let drawWidth;
        let drawHeight;
        let drawX;
        let drawY;

        if (imageAspect > frameAspect) {
          drawHeight = rows;
          drawWidth = rows * imageAspect;
          drawX = (cols - drawWidth) * 0.5;
          drawY = 0;
        } else {
          drawWidth = cols;
          drawHeight = cols / imageAspect;
          drawX = 0;
          drawY = (rows - drawHeight) * 0.5;
        }

        ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

        return ctx.getImageData(0, 0, cols, rows).data;
      }

      function getCoverUvTransform(imageWidth, imageHeight, frameAspect) {
        const imageAspect = imageWidth / imageHeight;

        let scaleX = 1.0;
        let scaleY = 1.0;
        let offsetX = 0.0;
        let offsetY = 0.0;

        if (imageAspect > frameAspect) {
          scaleX = frameAspect / imageAspect;

          offsetX = (1.0 - scaleX) * 0.5;
        } else {
          scaleY = imageAspect / frameAspect;

          offsetY = (1.0 - scaleY) * 0.5;
        }

        return {
          scaleX,
          scaleY,
          offsetX,
          offsetY,
        };
      }

      function createTiledImagePlane(texture) {
        const image = texture.image;

        const { cols, rows } = getMosaicDimensions();

        const frameSize = getFrameSize();

        const frameAspect = frameSize.width / frameSize.height;

        const alphaData = sampleAlphaMaskForFrame(image, cols, rows);

        const coverUv = getCoverUvTransform(image.width, image.height, frameAspect);

        const tileWidth = frameSize.width / cols;

        const tileHeight = frameSize.height / rows;

        const spacingX = tileWidth * CONFIG.PARTICLE_SPACING_MULTIPLIER;

        const spacingY = tileHeight * CONFIG.PARTICLE_SPACING_MULTIPLIER;

        const planeWidth = cols * spacingX;

        const planeHeight = rows * spacingY;

        const positions = [];
        const gridPositions = [];
        const uvOffsets = [];
        const uvScales = [];
        const randoms = [];
        const rowProgresses = [];
        const buildYOffsets = [];

        const cumulativeColumnOffsets = Array.from(
          {
            length: cols,
          },
          () => 0,
        );

        for (let y = 0; y < rows; y++) {
          const rowProgress = y / Math.max(rows - 1, 1);

          for (let x = 0; x < cols; x++) {
            const i = (y * cols + x) * 4;

            const alpha = alphaData[i + 3] / 255;

            if (alpha <= CONFIG.ALPHA_CUTOFF) continue;

            const px = (x - cols / 2 + 0.5) * spacingX;

            const py = -(y - rows / 2 + 0.5) * spacingY;

            const gap = randomRange(CONFIG.BUILD_COLUMN_GAP_MIN, CONFIG.BUILD_COLUMN_GAP_MAX);

            cumulativeColumnOffsets[x] += gap;

            const buildYOffset = cumulativeColumnOffsets[x] * CONFIG.BUILD_COLUMN_GAP_DIRECTION;

            positions.push(px, py, 0);
            gridPositions.push(px, py);
            randoms.push(Math.random());
            rowProgresses.push(rowProgress);
            buildYOffsets.push(buildYOffset);

            const u0 = coverUv.offsetX + (x / cols) * coverUv.scaleX;

            const v0 = coverUv.offsetY + (1.0 - (y + 1) / rows) * coverUv.scaleY;

            const us = coverUv.scaleX / cols;

            const vs = coverUv.scaleY / rows;

            uvOffsets.push(u0, v0);
            uvScales.push(us, vs);
          }
        }

        const count = positions.length / 3;

        const geometry = new THREE.PlaneGeometry(tileWidth, tileHeight, 1, 1);

        geometry.setAttribute('instanceUvOffset', new THREE.InstancedBufferAttribute(new Float32Array(uvOffsets), 2));

        geometry.setAttribute('instanceUvScale', new THREE.InstancedBufferAttribute(new Float32Array(uvScales), 2));

        geometry.setAttribute('instanceGridPos', new THREE.InstancedBufferAttribute(new Float32Array(gridPositions), 2));

        geometry.setAttribute('instanceRandom', new THREE.InstancedBufferAttribute(new Float32Array(randoms), 1));

        geometry.setAttribute('instanceRowProgress', new THREE.InstancedBufferAttribute(new Float32Array(rowProgresses), 1));

        geometry.setAttribute('instanceBuildYOffset', new THREE.InstancedBufferAttribute(new Float32Array(buildYOffsets), 1));

        const material = new THREE.ShaderMaterial({
          uniforms: {
            uTexture: {
              value: texture,
            },
            uAlphaCutoff: {
              value: CONFIG.ALPHA_CUTOFF,
            },
            uOpacity: {
              value: 0.0,
            },

            uImageBrightness: {
              value: CONFIG.IMAGE_BRIGHTNESS,
            },
            uImageContrast: {
              value: CONFIG.IMAGE_CONTRAST,
            },
            uImageSaturation: {
              value: CONFIG.IMAGE_SATURATION,
            },

            uCloseDarkenNear: {
              value: CONFIG.IMAGE_CLOSE_DARKEN_NEAR,
            },
            uCloseDarkenFar: {
              value: CONFIG.IMAGE_CLOSE_DARKEN_FAR,
            },
            uCloseDarkenStrength: {
              value: CONFIG.IMAGE_CLOSE_DARKEN_STRENGTH,
            },

            uTime: {
              value: 0.0,
            },
            uWaveAmplitude: {
              value: CONFIG.WAVE_AMPLITUDE,
            },
            uWaveFrequencyX: {
              value: CONFIG.WAVE_FREQUENCY_X,
            },
            uWaveFrequencyY: {
              value: CONFIG.WAVE_FREQUENCY_Y,
            },
            uWaveSpeed: {
              value: CONFIG.WAVE_SPEED,
            },
            uWavePhaseOffsetX: {
              value: CONFIG.WAVE_PHASE_OFFSET_X,
            },
            uWavePhaseOffsetY: {
              value: CONFIG.WAVE_PHASE_OFFSET_Y,
            },
            uPlaneOffset: {
              value: new THREE.Vector2(0, 0),
            },

            uBuildProgress: {
              value: 0.0,
            },
            uBuildRowStagger: {
              value: CONFIG.BUILD_ROW_STAGGER,
            },
            uBuildRandomStagger: {
              value: CONFIG.BUILD_RANDOM_STAGGER,
            },
            uBuildEasePower: {
              value: CONFIG.BUILD_EASE_POWER,
            },
            uBuildAlphaPower: {
              value: CONFIG.BUILD_ALPHA_POWER,
            },
          },

          vertexShader: imageVertexShader,
          fragmentShader: imageFragmentShader,

          transparent: true,
          depthTest: true,
          depthWrite: true,
          side: THREE.DoubleSide,
        });

        const mesh = new THREE.InstancedMesh(geometry, material, count);

        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        const dummy = new THREE.Object3D();

        for (let i = 0; i < count; i++) {
          dummy.position.set(positions[i * 3 + 0], positions[i * 3 + 1], positions[i * 3 + 2]);

          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();

          mesh.setMatrixAt(i, dummy.matrix);
        }

        mesh.instanceMatrix.needsUpdate = true;

        return {
          mesh,
          geometry,
          material,
          width: planeWidth,
          height: planeHeight,
          baseY: 0,
        };
      }

      function makeFloatingShaderMaterial() {
        return new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          depthTest: true,
          uniforms: {
            uOpacity: {
              value: 0,
            },
            uNearColor: {
              value: CONFIG.FLOAT_NEAR_COLOR,
            },
            uFarColor: {
              value: CONFIG.FLOAT_FAR_COLOR,
            },
            uNearZ: {
              value: CONFIG.FLOAT_NEAR_Z,
            },
            uFarZ: {
              value: CONFIG.FLOAT_FAR_Z,
            },
            uFalloffPower: {
              value: CONFIG.FLOAT_FALLOFF_POWER,
            },
          },
          vertexShader: `
  uniform float uNearZ;
  uniform float uFarZ;
  uniform float uFalloffPower;
  
  attribute float aInstanceAlpha;
  attribute float aPlaneDistance;
  
  varying float vDistanceMix;
  varying float vInstanceAlpha;
  
  void main() {
  float farMix =
  smoothstep(
  uNearZ,
  uFarZ,
  aPlaneDistance
  );
  
  farMix =
  pow(
  clamp(farMix, 0.0, 1.0),
  uFalloffPower
  );
  
  vDistanceMix = farMix;
  vInstanceAlpha = aInstanceAlpha;
  
  vec4 mvPosition =
  modelViewMatrix *
  instanceMatrix *
  vec4(position, 1.0);
  
  gl_Position =
  projectionMatrix *
  mvPosition;
  }
  `,
          fragmentShader: `
  uniform float uOpacity;
  uniform vec3 uNearColor;
  uniform vec3 uFarColor;
  
  varying float vDistanceMix;
  varying float vInstanceAlpha;
  
  void main() {
  vec3 color =
  mix(
  uNearColor,
  uFarColor,
  vDistanceMix
  );
  
  gl_FragColor =
  vec4(
  color,
  uOpacity * vInstanceAlpha
  );
  
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  }
  `,
        });
      }

      function createFloatLayer(settings) {
        if (!settings.enabled || !settings.group) return null;

        const count = Math.max(1, Math.floor(settings.count));

        const floatWidth = columnMaxWidth * settings.spreadXMultiplier;

        const floatHeight = columnTotalHeight * settings.spreadYMultiplier + settings.extraHeight;

        const geometry = new THREE.BoxGeometry(1, 1, 1);

        const material = makeFloatingShaderMaterial();

        const mesh = new THREE.InstancedMesh(geometry, material, count);

        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        mesh.renderOrder = settings.renderOrder;

        const alphaArray = new Float32Array(count);

        const planeDistanceArray = new Float32Array(count);

        geometry.setAttribute('aInstanceAlpha', new THREE.InstancedBufferAttribute(alphaArray, 1));

        geometry.setAttribute('aPlaneDistance', new THREE.InstancedBufferAttribute(planeDistanceArray, 1));

        for (let i = 0; i < count; i++) {
          const z = settings.zOffset + randomSigned() * settings.zSpread;

          const position = new THREE.Vector3(randomSigned() * floatWidth * 0.5, randomSigned() * floatHeight * 0.5, z);

          const planeDistance = Math.abs(z);

          const distanceT = clamp01((planeDistance - CONFIG.FLOAT_NEAR_Z) / Math.max(CONFIG.FLOAT_FAR_Z - CONFIG.FLOAT_NEAR_Z, 0.0001));

          const scale = settings.closeImageScale + (settings.farImageScale - settings.closeImageScale) * distanceT;

          const rotation = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

          tempObject.position.copy(position);
          tempObject.rotation.copy(rotation);
          tempObject.scale.setScalar(scale);
          tempObject.updateMatrix();

          mesh.setMatrixAt(i, tempObject.matrix);

          alphaArray[i] = 1;
          planeDistanceArray[i] = planeDistance;
        }

        mesh.instanceMatrix.needsUpdate = true;
        geometry.getAttribute('aInstanceAlpha').needsUpdate = true;
        geometry.getAttribute('aPlaneDistance').needsUpdate = true;

        material.uniforms.uOpacity.value = 0;

        settings.group.add(mesh);

        return {
          group: settings.group,
          mesh,
          geometry,
          material,
          scrollSpeed: settings.scrollSpeed,
          yOffset: settings.yOffset,
          opacity: settings.opacity,
          enabled: settings.enabled,
        };
      }

      function updateFloatLayer(layer, tiOpacity) {
        if (!layer || !layer.mesh || !layer.group) return;

        const floatOffsetY = columnOffsetY * layer.scrollSpeed + layer.yOffset;

        layer.group.position.set(0, floatOffsetY, 0);

        layer.group.visible = layer.enabled && tiOpacity > 0.001;

        layer.material.uniforms.uOpacity.value = layer.opacity * tiOpacity * (1.0 - toProgress);

        layer.material.uniforms.uNearColor.value = CONFIG.FLOAT_NEAR_COLOR;

        layer.material.uniforms.uFarColor.value = CONFIG.FLOAT_FAR_COLOR;

        layer.material.uniforms.uNearZ.value = CONFIG.FLOAT_NEAR_Z;

        layer.material.uniforms.uFarZ.value = CONFIG.FLOAT_FAR_Z;

        layer.material.uniforms.uFalloffPower.value = CONFIG.FLOAT_FALLOFF_POWER;
      }

      function disposeFloatLayer(layer) {
        if (!layer) return;

        if (layer.mesh && layer.group) {
          layer.group.remove(layer.mesh);
        }

        if (layer.geometry) {
          layer.geometry.dispose();
        }

        if (layer.material) {
          layer.material.dispose();
        }
      }

      function disposeFloatingCubes() {
        disposeFloatLayer(backFloatLayer);
        disposeFloatLayer(frontFloatLayer);

        backFloatLayer = null;
        frontFloatLayer = null;
      }

      function disposeGrid() {
        if (!outerGroup) return;

        disposeFloatingCubes();

        for (const item of imagePlanes) {
          if (columnGroup) {
            columnGroup.remove(item.mesh);
          }

          if (item.geometry) {
            item.geometry.dispose();
          }

          if (item.material) {
            item.material.dispose();
          }
        }

        scene.remove(outerGroup);

        outerGroup = null;
        backFloatGroup = null;
        columnGroup = null;
        frontFloatGroup = null;
        imagePlanes = [];
        isBuilt = false;
        isBuilding = false;
      }

      function layoutColumn() {
        if (!columnGroup || !imagePlanes.length) return;

        const cols = Math.max(1, Math.floor(CONFIG.GRID_COLS));

        const rows = CONFIG.GRID_ROWS > 0 ? Math.max(1, Math.floor(CONFIG.GRID_ROWS)) : Math.ceil(imagePlanes.length / cols);

        const maxWidth = Math.max(...imagePlanes.map((p) => p.width));

        const maxHeight = Math.max(...imagePlanes.map((p) => p.height));

        columnMaxWidth = maxWidth;

        const stepX = maxWidth + CONFIG.GRID_GAP_X;

        const stepY = maxHeight + CONFIG.GRID_GAP_Y;

        imageStepY = stepY;

        const totalWidth = (cols - 1) * stepX;

        const totalHeight = (rows - 1) * stepY;

        columnTotalHeight = totalHeight + maxHeight;

        imagePlanes.forEach((item, index) => {
          const col = index % cols;

          const row = Math.floor(index / cols);

          const x = col * stepX - totalWidth / 2;

          const y = -(row * stepY - totalHeight / 2);

          item.baseY = y;

          if (index === 0) {
            firstImageBaseY = y;
          }

          item.mesh.position.set(x, y, 0);
          item.material.uniforms.uPlaneOffset.value.set(x, y);
        });
      }

      function loadTexture(url) {
        return new Promise((resolve, reject) => {
          loader.load(
            url,
            (texture) => {
              texture.colorSpace = THREE.SRGBColorSpace;
              texture.minFilter = THREE.LinearFilter;
              texture.magFilter = THREE.LinearFilter;
              texture.generateMipmaps = true;
              texture.needsUpdate = true;

              resolve(texture);
            },
            undefined,
            reject,
          );
        });
      }

      async function buildGrid() {
        if (isBuilding || isBuilt) return;

        disposeGrid();

        outerGroup = new THREE.Group();
        backFloatGroup = new THREE.Group();
        columnGroup = new THREE.Group();
        frontFloatGroup = new THREE.Group();

        outerGroup.add(backFloatGroup);
        outerGroup.add(columnGroup);
        outerGroup.add(frontFloatGroup);

        outerGroup.visible = isActive;

        outerGroup.position.set(CONFIG.BASE_POS_X, CONFIG.BASE_POS_Y, CONFIG.BASE_POS_Z);

        outerGroup.rotation.set(CONFIG.BASE_ROT_X, CONFIG.BASE_ROT_Y, CONFIG.BASE_ROT_Z);

        scene.add(outerGroup);

        const urls = CONFIG.IMAGE_URLS.slice(0, CONFIG.SECTION_COUNT);

        const textures = await Promise.all(urls.map(loadTexture));

        for (const texture of textures) {
          const item = createTiledImagePlane(texture);

          imagePlanes.push(item);
          columnGroup.add(item.mesh);
        }

        layoutColumn();

        backFloatLayer = createFloatLayer({
          enabled: CONFIG.FLOAT_BACK_ENABLED,
          group: backFloatGroup,
          count: CONFIG.FLOAT_BACK_COUNT,
          spreadXMultiplier: CONFIG.FLOAT_BACK_SPREAD_X_MULTIPLIER,
          spreadYMultiplier: CONFIG.FLOAT_BACK_SPREAD_Y_MULTIPLIER,
          extraHeight: CONFIG.FLOAT_BACK_EXTRA_HEIGHT,
          zOffset: CONFIG.FLOAT_BACK_Z_OFFSET,
          zSpread: CONFIG.FLOAT_BACK_Z_SPREAD,
          scrollSpeed: CONFIG.FLOAT_BACK_SCROLL_SPEED,
          yOffset: CONFIG.FLOAT_BACK_Y_OFFSET,
          closeImageScale: CONFIG.FLOAT_BACK_CLOSE_IMAGE_SCALE,
          farImageScale: CONFIG.FLOAT_BACK_FAR_IMAGE_SCALE,
          opacity: CONFIG.FLOAT_BACK_OPACITY,
          renderOrder: -1,
        });

        frontFloatLayer = createFloatLayer({
          enabled: CONFIG.FLOAT_FRONT_ENABLED,
          group: frontFloatGroup,
          count: CONFIG.FLOAT_FRONT_COUNT,
          spreadXMultiplier: CONFIG.FLOAT_FRONT_SPREAD_X_MULTIPLIER,
          spreadYMultiplier: CONFIG.FLOAT_FRONT_SPREAD_Y_MULTIPLIER,
          extraHeight: CONFIG.FLOAT_FRONT_EXTRA_HEIGHT,
          zOffset: CONFIG.FLOAT_FRONT_Z_OFFSET,
          zSpread: CONFIG.FLOAT_FRONT_Z_SPREAD,
          scrollSpeed: CONFIG.FLOAT_FRONT_SCROLL_SPEED,
          yOffset: CONFIG.FLOAT_FRONT_Y_OFFSET,
          closeImageScale: CONFIG.FLOAT_FRONT_CLOSE_IMAGE_SCALE,
          farImageScale: CONFIG.FLOAT_FRONT_FAR_IMAGE_SCALE,
          opacity: CONFIG.FLOAT_FRONT_OPACITY,
          renderOrder: 2,
        });

       isBuilt = true;
isBuilding = false;

window.AIM_VIS6_READY = true;

window.dispatchEvent(
  new CustomEvent('aimVisualReady', {
    detail: { id: 'vis-6' },
  })
);

      function updateTransitionProgress(progress = {}) {
        sectionEl = sectionEl || document.getElementById('vis-6');

        if (!sectionEl) return;

        const rect = sectionEl.getBoundingClientRect();

        const sectionTop = window.scrollY + rect.top;

        const sectionHeight = sectionEl.offsetHeight;

        localY = typeof progress.shiftedLocalY === 'number' ? progress.shiftedLocalY : window.scrollY - sectionTop;

        const tiPx = window.innerHeight * (TRANSITION.TI / 100);

        const toPx = window.innerHeight * (TRANSITION.TO / 100);

        tiProgress = clamp01(localY / Math.max(tiPx, 1));

        toProgress = clamp01((localY - sectionHeight) / Math.max(toPx, 1));
      }

      function applyTimeline() {
        const vh = Math.max(window.innerHeight, 1);

        const scrollIndex = localY / vh;

        const firstCenterIndex = CONFIG.FIRST_IMAGE_CENTER_VH / 100;

        const stepIndex = CONFIG.IMAGE_STEP_VH / 100;

        const imageIndexFloat = (scrollIndex - firstCenterIndex) / Math.max(stepIndex, 0.0001);

        const baseColumnOffsetY = -firstImageBaseY + imageIndexFloat * imageStepY + CONFIG.COLUMN_Y_OFFSET;

        const toSpeedT = Math.pow(toProgress, CONFIG.TO_SCROLL_EASE_POWER);

        const toExtraScroll = toProgress * imageStepY * CONFIG.TO_SCROLL_SPEED_MULTIPLIER * toSpeedT;

        columnOffsetY = baseColumnOffsetY + toExtraScroll;
        columnOffsetY = baseColumnOffsetY + imageStepY * CONFIG.TO_SCROLL_SPEED_MULTIPLIER * toSpeedT;
      }

      function updateRotation() {
        if (!outerGroup) return;

        const targetX = CONFIG.BASE_ROT_X + -mouseY * CONFIG.MOUSE_ROTATE_X;

        const targetY = CONFIG.BASE_ROT_Y + mouseX * CONFIG.MOUSE_ROTATE_Y;

        const targetZ = CONFIG.BASE_ROT_Z + mouseX * CONFIG.MOUSE_ROTATE_Z;

        currentRotation.x += (targetX - currentRotation.x) * CONFIG.ROTATION_LERP;

        currentRotation.y += (targetY - currentRotation.y) * CONFIG.ROTATION_LERP;

        currentRotation.z += (targetZ - currentRotation.z) * CONFIG.ROTATION_LERP;

        outerGroup.rotation.set(currentRotation.x, currentRotation.y, currentRotation.z);
      }

      function updateImageUniforms(item, opacity, buildProgress, time) {
        const uniforms = item.material.uniforms;

        uniforms.uOpacity.value = opacity;

        uniforms.uBuildProgress.value = buildProgress;

        uniforms.uImageBrightness.value = CONFIG.IMAGE_BRIGHTNESS;

        uniforms.uImageContrast.value = CONFIG.IMAGE_CONTRAST;

        uniforms.uImageSaturation.value = CONFIG.IMAGE_SATURATION;

        uniforms.uCloseDarkenNear.value = CONFIG.IMAGE_CLOSE_DARKEN_NEAR;

        uniforms.uCloseDarkenFar.value = CONFIG.IMAGE_CLOSE_DARKEN_FAR;

        uniforms.uCloseDarkenStrength.value = CONFIG.IMAGE_CLOSE_DARKEN_STRENGTH;

        uniforms.uBuildRowStagger.value = CONFIG.BUILD_ROW_STAGGER;

        uniforms.uBuildRandomStagger.value = CONFIG.BUILD_RANDOM_STAGGER;

        uniforms.uBuildEasePower.value = CONFIG.BUILD_EASE_POWER;

        uniforms.uBuildAlphaPower.value = CONFIG.BUILD_ALPHA_POWER;

        uniforms.uTime.value = time;

        uniforms.uWaveAmplitude.value = CONFIG.WAVE_AMPLITUDE;

        uniforms.uWaveFrequencyX.value = CONFIG.WAVE_FREQUENCY_X;

        uniforms.uWaveFrequencyY.value = CONFIG.WAVE_FREQUENCY_Y;

        uniforms.uWaveSpeed.value = CONFIG.WAVE_SPEED;

        uniforms.uWavePhaseOffsetX.value = CONFIG.WAVE_PHASE_OFFSET_X;

        uniforms.uWavePhaseOffsetY.value = CONFIG.WAVE_PHASE_OFFSET_Y;
      }

      function updateGridState() {
        if (!outerGroup || !columnGroup) return;

        const tiT = getTiProgress();

        const tiOpacity = getTiOpacity();

        const tiY = CONFIG.TI_START_Y * (1 - tiT);

        const tiScale = CONFIG.TI_START_SCALE + (1 - CONFIG.TI_START_SCALE) * tiT;

        outerGroup.position.set(CONFIG.BASE_POS_X, CONFIG.BASE_POS_Y + tiY, CONFIG.BASE_POS_Z);

        outerGroup.scale.setScalar(tiScale);

        columnGroup.position.set(0, columnOffsetY, 0);

        outerGroup.visible = isActive;

        const time = performance.now() * 0.001;

        const lastIndex = imagePlanes.length - 1;

        const lastImageOpacity = getToFade();

        for (let i = 0; i < imagePlanes.length; i++) {
          const item = imagePlanes[i];

          const imageSceneY = columnOffsetY + item.baseY;

          const imageBuildProgress = easeOutCubic(inverseLerp(CONFIG.BUILD_ZONE_START_Y, CONFIG.BUILD_ZONE_END_Y, imageSceneY));

          const isLastImage = i === lastIndex;

          const baseOpacity = isLastImage ? lastImageOpacity : 1.0;

          updateImageUniforms(item, baseOpacity * tiOpacity, imageBuildProgress, time);
        }

        updateFloatLayer(backFloatLayer, tiOpacity);
        updateFloatLayer(frontFloatLayer, tiOpacity);
      }

      function applyCurrentState(progress = {}) {
        updateTransitionProgress(progress);
        applyTimeline();
        updateRotation();
        updateGridState();
      }

      function onPointerMove(e) {
        const rect = container.getBoundingClientRect();

        mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;

        mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      }

      window.addEventListener('pointermove', onPointerMove);

return {
  init() {
    sectionEl = document.getElementById('vis-6');

    buildGrid();
  },

  enter(app, progress = {}) {
          isActive = true;

          if (!isBuilt) {
            buildGrid();
          }

          if (outerGroup) {
            outerGroup.visible = true;
          }

          applyCurrentState(progress);
        },

        update(app, progress = {}) {
          if (!isActive) return;
          applyCurrentState(progress);
        },

        tick(app, progress = {}) {
          if (!isActive) return;
          applyCurrentState(progress);
        },

        exit() {
          isActive = false;

          if (outerGroup) {
            outerGroup.visible = false;
          }
        },

        destroy() {
          window.removeEventListener('pointermove', onPointerMove);
          disposeGrid();
        },

        resize() {
          if (isActive) {
            disposeGrid();
            buildGrid();
            applyCurrentState();
          }
        },
      };
    })();

    window.AIM.register('vis-6', Vis6);
  })();
