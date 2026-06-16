//console.log("Vis 2 - THU 12th JUN");
(function startWhenAIMReady() {
  if (!window.AIM) {
    window.addEventListener("aimGlobalReady", startWhenAIMReady, {
      once: true
    });
    return;
  }

  const app = window.AIM;

  const THREE = app.THREE;
  const scene = app.scene;
  const renderer = app.renderer;
  const clock = app.clock;

  const SVG_STRING = `
  <svg width="533" height="185" style="" viewBox="0 0 533 185" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M289.739 0.0999756H243.439V184.47H289.739V0.0999756Z" fill="currentColor"/>
  <path d="M98.32 0L0 184.56H46.3L98.32 90.91L150.35 184.56H196.65L98.32 0Z" fill="currentColor"/>
  <path d="M434.359 92.28L336.039 0V59L434.359 151.28L532.669 59V0L434.359 92.28Z" fill="currentColor"/>
  </svg>
  `;

  // === CONFIG PULLED FROM WEBFLOW WEBFLOW ===

  const CONFIG = window.AIM_VIS2_CONFIG || {};
  const TRANSITION = window.AIM_VIS2_TRANSITION || {};

  // === MAIN SCRIPT ===

  function getSvgViewBoxAspect(svgString) {
    const match = svgString.match(/viewBox=["']([^"']+)["']/i);
    if (!match) return 1;

    const parts = match[1].trim().split(/\s+/).map(Number);
    if (parts.length !== 4) return 1;

    return parts[2] / Math.max(parts[3], 0.0001);
  }

  function getSvgMaskWidth() {
    if (!CONFIG.SVG_MASK_WIDTH_AUTO) {
      return CONFIG.SVG_MASK_WIDTH;
    }

    return CONFIG.SVG_MASK_HEIGHT * getSvgViewBoxAspect(SVG_STRING);
  }

  const riverVertexShader = `
  attribute vec3 aStartPosition;
  attribute float aRowIndex;
  attribute float aToDelayMs;
  attribute float aToDistance;
  attribute float aToMoveStrength;
  attribute float aSvgMask;
  attribute float aSvgLiftDelay;
  
  uniform float uPointSize;
  uniform float uScrollWaveOffset;
  uniform float uAutoWaveOffset;
  uniform float uAutoWaveBlend;
  
  uniform float uWaveAmplitude;
  uniform float uWaveFrequencyX;
  uniform float uWaveFrequencyY;
  uniform float uBaseZOffset;
  
  uniform float uRiverScrollMoveX;
  uniform float uRiverScrollMoveY;
  uniform float uRiverScrollMoveZ;
  
  uniform float uRowCount;
  uniform float uFrontFadeRows;
  uniform float uBackFadeRows;
  uniform float uMinFadeAlpha;
  
  uniform float uRiverOffsetY;
  uniform float uRiverOffsetZ;
  
  uniform float uToProgress;
  uniform float uToDurationMs;
  uniform float uToMoveY;
  
  uniform float uSvgReveal;
  uniform float uSvgLiftProgress;
  uniform float uSvgFillerStart;
  uniform float uSvgFillerEnd;
  
  uniform float uBackgroundAlphaMultiplier;
  uniform float uSvgAlphaMultiplier;
  uniform float uBackgroundSizeMultiplier;
  uniform float uSvgSizeMultiplier;
  
  varying float vAlpha;
  varying float vSvgMask;
  
  uniform float uToWhiteMix;
  uniform float uToWhitePower;
  varying float vToWhite;
  uniform float uToOpacityBoost;
  
  float easeInCubic(float t) {
  return t * t * t;
  }
  
  float easeOutCubic(float t) {
  return 1.0 - pow(1.0 - t, 3.0);
  }
  
  float getWave(float offset) {
  float waveA = sin(aStartPosition.x * uWaveFrequencyX + offset);
  float waveB = sin(aStartPosition.y * uWaveFrequencyY + offset * 0.7);
  return (waveA + waveB) * 0.5;
  }
  
  float getFrontFadeAlpha(float rowIndex, float fadeRows, float minAlpha) {
  if (fadeRows <= 0.0) return 1.0;
  if (rowIndex >= fadeRows) return 1.0;
  
  float t = (rowIndex + 1.0) / fadeRows;
  return mix(minAlpha, 1.0, t);
  }
  
  float getBackFadeAlpha(float rowIndex, float rowCount, float fadeRows, float minAlpha) {
  if (fadeRows <= 0.0) return 1.0;
  
  float startRow = rowCount - fadeRows;
  
  if (rowIndex < startRow) return 1.0;
  
  float indexInFade = rowIndex - startRow;
  float t = 1.0 - ((indexInFade + 1.0) / fadeRows);
  
  return mix(minAlpha, 1.0, t);
  }
  
  void main() {
  float mask = aSvgMask;
  
  float localLift = clamp(
  (uSvgLiftProgress - aSvgLiftDelay) /
  max(1.0 - aSvgLiftDelay, 0.0001),
  0.0,
  1.0
  );
  
  float liftDone = easeOutCubic(localLift);
  
  float svgHighlight = mask * uSvgReveal * (1.0 - liftDone);
  vSvgMask = svgHighlight;
  
  vec3 displayPos = aStartPosition;
  
  displayPos.x += uRiverScrollMoveX;
  displayPos.y += uRiverScrollMoveY;
  displayPos.z += uRiverScrollMoveZ;
  
  displayPos.y += uRiverOffsetY;
  displayPos.z += uBaseZOffset + uRiverOffsetZ;
  
  float scrollOnlyWave = getWave(uScrollWaveOffset);
  float autoWave = getWave(uScrollWaveOffset + uAutoWaveOffset);
  float blendedWave = mix(scrollOnlyWave, autoWave, uAutoWaveBlend);
  
  displayPos.z += blendedWave * uWaveAmplitude;
  
  float toElapsed =
  uToProgress *
  (uToDurationMs + aToDelayMs);
  
  float localTo = clamp(
  (toElapsed - aToDelayMs) /
  max(uToDurationMs, 0.0001),
  0.0,
  1.0
  );
  
  float toEase = easeInCubic(localTo);
  
  vToWhite = pow(uToProgress, uToWhitePower) * uToWhiteMix;
  
  float frontAlpha = getFrontFadeAlpha(
  aRowIndex,
  uFrontFadeRows,
  uMinFadeAlpha
  );
  
  float backAlpha = getBackFadeAlpha(
  aRowIndex,
  uRowCount,
  uBackFadeRows,
  uMinFadeAlpha
  );
  
  float dissolveAlpha = mix(1.0, 0.0, toEase);
  
  float holeAlpha = 1.0;
  
  float maskAlphaBoost = mix(
  uBackgroundAlphaMultiplier,
  uSvgAlphaMultiplier,
  svgHighlight
  );
  
  float toOpacityBoost = mix(1.0, uToOpacityBoost, uToProgress);
  
  vAlpha =
  frontAlpha *
  backAlpha *
  dissolveAlpha *
  holeAlpha *
  maskAlphaBoost *
  toOpacityBoost;
  
  vec4 mvPosition =
  modelViewMatrix *
  vec4(displayPos, 1.0);
  
  mvPosition.y +=
  toEase *
  uToMoveY *
  aToDistance *
  aToMoveStrength;
  
  float sizeBoost = mix(
  uBackgroundSizeMultiplier,
  uSvgSizeMultiplier,
  svgHighlight
  );
  
  gl_PointSize =
  max(0.0, uPointSize * sizeBoost);
  
  gl_Position =
  projectionMatrix *
  mvPosition;
  }
  `;

  const riverFragmentShader = `
  uniform float uUseRoundPoints;
  uniform float uAlphaCutoff;
  uniform float uScrollAlpha;
  uniform float uBaseAlpha;
  
  uniform vec3 uRiverColor;
  uniform vec3 uSvgColor;
  
  varying float vAlpha;
  varying float vSvgMask;
  
  varying float vToWhite;
  
  void main() {
  if (uUseRoundPoints > 0.5) {
  vec2 p = gl_PointCoord - vec2(0.5);
  
  if (dot(p, p) > 0.25) discard;
  }
  
  float alpha =
  vAlpha *
  uScrollAlpha *
  uBaseAlpha;
  
  float brightness =
  mix(0.65, 1.0, vSvgMask);
  
  vec3 finalColor =
  mix(uRiverColor, uSvgColor, vSvgMask);
  
  finalColor *= brightness;
  
  finalColor = mix(finalColor, vec3(1.0), vToWhite);
  
  vec4 color =
  vec4(finalColor, alpha);
  
  if (color.a <= uAlphaCutoff) discard;
  
  gl_FragColor = color;
  }
  `;

  const liftVertexShader = `
  attribute vec3 aStartPosition;
  attribute float aRowIndex;
  attribute float aSvgLiftDelay;
  attribute float aSvgLiftHeight;
  attribute float aSvgLayerOffset;
  attribute float aSvgU;
  attribute float aSvgV;
  attribute float aSvgLayerIndex;
  
  uniform float uPointSize;
  
  uniform float uScrollWaveOffset;
  uniform float uAutoWaveOffset;
  uniform float uAutoWaveBlend;
  
  
  uniform float uWaveAmplitude;
  uniform float uWaveFrequencyX;
  uniform float uWaveFrequencyY;
  uniform float uBaseZOffset;
  
  uniform float uRiverScrollMoveX;
  uniform float uRiverScrollMoveY;
  uniform float uRiverScrollMoveZ;
  
  uniform float uRiverOffsetY;
  uniform float uRiverOffsetZ;
  
  uniform float uSvgReveal;
  uniform float uSvgLiftProgress;
  uniform float uSvgLiftFadePower;
  uniform float uSvgLayerCount;
  
  varying float vAlpha;
  varying vec2 vSvgUv;
  varying float vSvgLayerIndex;
  
  float easeOutCubic(float t) {
  return 1.0 - pow(1.0 - t, 3.0);
  }
  
  float getWave(float offset) {
  float waveA = sin(aStartPosition.x * uWaveFrequencyX + offset);
  float waveB = sin(aStartPosition.y * uWaveFrequencyY + offset * 0.7);
  return (waveA + waveB) * 0.5;
  }
  
  void main() {
  float localLift = clamp(
  (uSvgLiftProgress - aSvgLiftDelay) /
  max(1.0 - aSvgLiftDelay, 0.0001),
  0.0,
  1.0
  );
  
  float liftEase = easeOutCubic(localLift);
  
  vec3 displayPos = aStartPosition;
  
  displayPos.x += uRiverScrollMoveX;
  displayPos.y += uRiverScrollMoveY;
  displayPos.z += uRiverScrollMoveZ;
  
  displayPos.y += uRiverOffsetY;
  displayPos.z += uBaseZOffset + uRiverOffsetZ;
  
  float scrollOnlyWave = getWave(uScrollWaveOffset);
  float autoWave = getWave(uScrollWaveOffset + uAutoWaveOffset);
  float blendedWave = mix(scrollOnlyWave, autoWave, uAutoWaveBlend);
  
  displayPos.z += blendedWave * uWaveAmplitude;
  
  float fadeOut = pow(1.0 - liftEase, uSvgLiftFadePower);
  
  float layerNormal =
  aSvgLayerIndex / max(uSvgLayerCount - 1.0, 1.0);
  
  float layerRevealStart =
  layerNormal * 0.65;
  
  float layerReveal =
  smoothstep(
  layerRevealStart,
  layerRevealStart + 0.28,
  uSvgReveal
  );
  
  vAlpha = layerReveal * fadeOut;
  vSvgUv = vec2(aSvgU, aSvgV);
  vSvgLayerIndex = aSvgLayerIndex;
  
  vec4 mvPosition =
  modelViewMatrix *
  vec4(displayPos, 1.0);
  
  mvPosition.y += aSvgLayerOffset * layerReveal;
  mvPosition.y += liftEase * aSvgLiftHeight;
  
  gl_PointSize = max(0.0, uPointSize);
  gl_Position = projectionMatrix * mvPosition;
  }
  `;

  const liftFragmentShader = `
  uniform float uUseRoundPoints;
  uniform float uAlphaCutoff;
  uniform float uBaseAlpha;
  
  uniform vec3 uSvgColor;
  uniform sampler2D uSvgTexture;
  uniform float uUseSvgTexture;
  uniform float uSvgImageMode;
  uniform float uSvgLayerCount;
  uniform float uSvgLayerCropShift;
  uniform float uSvgImageMix;
  uniform float uSvgImageBrightness;
  uniform float uSvgImageAlpha;
  uniform float uSvgImageToWhite;
  
  varying float vAlpha;
  varying vec2 vSvgUv;
  varying float vSvgLayerIndex;
  
  void main() {
  if (uUseRoundPoints > 0.5) {
  vec2 p = gl_PointCoord - vec2(0.5);
  
  if (dot(p, p) > 0.25) discard;
  }
  
  vec2 uv = vSvgUv;
  
  if (uSvgImageMode > 0.5) {
  uv.y = (uv.y + vSvgLayerIndex) / max(uSvgLayerCount, 1.0);
  uv.x = fract(uv.x + vSvgLayerIndex * uSvgLayerCropShift);
  } else {
  uv.x = fract(uv.x + vSvgLayerIndex * uSvgLayerCropShift);
  }
  
  vec4 texColor = texture2D(uSvgTexture, uv);
  
  vec3 imageColor =
  texColor.rgb *
  uSvgImageBrightness;
  
  vec3 whitenedImage =
  mix(imageColor, vec3(1.0), uSvgImageToWhite);
  
  vec3 finalColor =
  mix(
  uSvgColor,
  whitenedImage,
  uUseSvgTexture * uSvgImageMix
  );
  
  float alpha =
  vAlpha *
  uBaseAlpha *
  mix(
  1.0,
  texColor.a * uSvgImageAlpha,
  uUseSvgTexture
  );
  
  if (alpha <= uAlphaCutoff) discard;
  
  gl_FragColor = vec4(finalColor, alpha);
  }
  `;

  const Vis2 = (() => {
    let sectionEl = null;

    let riverPoints = null;
    let riverGeometry = null;
    let riverMaterial = null;

    let liftPoints = null;
    let liftGeometry = null;
    let liftMaterial = null;

    let svgTexture = null;

    let maskCanvas = null;
    let maskCtx = null;
    let maskImageData = null;

    let isActive = false;

    let tiProgress = 0;
    let msProgress = 0;
    let toProgress = 0;
    let fullProgress = 0;

    let scrollAlpha = 0;
    let scrollWaveOffset = 0;
    let autoWaveOffset = 0;
    let autoWaveBlend = 1;

    let riverOffsetY = 0;
    let riverOffsetZ = 0;
    let riverScrollMoveX = 0;
    let riverScrollMoveY = 0;
    let riverScrollMoveZ = 0;
    let waveBoost = 0;

    let svgReveal = 0;
    let svgLiftProgress = 0;

    let lastFullProgress = 0;
    let scrollDirection = 1;
    let lastTickTime = null;

    let rowCount = 1;

    function showLogoEnabled() {
      if (!sectionEl) return true;

      const isHidden = window.getComputedStyle(sectionEl).display === "none";

      return !sectionEl.hasAttribute("hide-logo") && !isHidden;
    }

    function clamp01(v) {
      return Math.min(Math.max(v, 0), 1);
    }

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function getRangeProgress(value, start, end) {
      return clamp01((value - start) / Math.max(end - start, 0.0001));
    }

    function randomRange(min, max) {
      return min + Math.random() * (max - min);
    }

    function createFallbackTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;

      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1, 1);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;

      return texture;
    }

    function loadImageTexture(url) {
      return new Promise((resolve) => {
        if (!url) {
          resolve(createFallbackTexture());
          return;
        }

        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");

        loader.load(
          url,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.needsUpdate = true;

            resolve(texture);
          },
          undefined,
          () => {
            resolve(createFallbackTexture());
          }
        );
      });
    }

    function loadSVGImage(svgString) {
      return new Promise((resolve, reject) => {
        const clean = svgString.replaceAll("currentColor", "#ffffff");

        const blob = new Blob([clean], {
          type: "image/svg+xml;charset=utf-8"
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

    async function buildSvgMaskCanvas() {
      const img = await loadSVGImage(SVG_STRING);

      const drawWidth = Math.max(2, Math.floor(CONFIG.SVG_MASK_DRAW_WIDTH));
      const aspect = img.height / img.width;
      const drawHeight = Math.max(2, Math.round(drawWidth * aspect));

      maskCanvas = document.createElement("canvas");
      maskCanvas.width = drawWidth;
      maskCanvas.height = drawHeight;

      maskCtx = maskCanvas.getContext("2d", {
        willReadFrequently: true
      });

      maskCtx.clearRect(0, 0, drawWidth, drawHeight);
      maskCtx.drawImage(img, 0, 0, drawWidth, drawHeight);

      maskImageData = maskCtx.getImageData(0, 0, drawWidth, drawHeight).data;
    }

    function sampleSvgMaskAtWorld(worldX, worldY) {
      if (!maskCanvas || !maskImageData) return 0;

      const localX =
        (worldX - CONFIG.SVG_MASK_POSITION_X) /
        Math.max(getSvgMaskWidth(), 0.0001);

      const localY =
        (worldY - CONFIG.SVG_MASK_POSITION_Y) /
        Math.max(CONFIG.SVG_MASK_HEIGHT, 0.0001);

      const u = localX + 0.5;
      const v = 0.5 - localY;

      if (u < 0 || u > 1 || v < 0 || v > 1) return 0;

      const x = Math.floor(u * (maskCanvas.width - 1));
      const y = Math.floor(v * (maskCanvas.height - 1));

      const idx = (y * maskCanvas.width + x) * 4;
      const alpha = maskImageData[idx + 3];

      return alpha > CONFIG.SVG_MASK_ALPHA_THRESHOLD ? 1 : 0;
    }

    function getSvgUvAtWorld(worldX, worldY) {
      const localX =
        (worldX - CONFIG.SVG_MASK_POSITION_X) /
        Math.max(getSvgMaskWidth(), 0.0001);

      const localY =
        (worldY - CONFIG.SVG_MASK_POSITION_Y) /
        Math.max(CONFIG.SVG_MASK_HEIGHT, 0.0001);

      return {
        u: localX + 0.5,
        v: 0.5 - localY
      };
    }

    function buildParticleData() {
      const cols = Math.max(2, Math.floor(CONFIG.PARTICLES_WIDE));
      const rows = Math.max(2, Math.floor(CONFIG.PARTICLES_DEEP));
      const spacing = CONFIG.PARTICLE_SPACING;

      const planeWidth = (cols - 1) * spacing;
      const planeHeight = (rows - 1) * spacing;

      rowCount = rows;

      const positions = [];
      const startPositions = [];
      const rowIndices = [];
      const toDelays = [];
      const toDistances = [];
      const toMoveStrengths = [];
      const svgMasks = [];
      const svgLiftDelays = [];

      const liftPositions = [];
      const liftRowIndices = [];
      const liftDelays = [];
      const liftHeights = [];
      const liftLayerOffsets = [];
      const liftUs = [];
      const liftVs = [];
      const liftLayerIndices = [];

      const layerCount = Math.max(1, Math.floor(CONFIG.SVG_EXTRUDE_LAYERS));

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = (x / (cols - 1) - 0.5) * planeWidth;
          const py = -(y / (rows - 1) - 0.5) * planeHeight;

          const mask = sampleSvgMaskAtWorld(px, py);
          const liftDelay = Math.random() * CONFIG.SVG_LIFT_RANDOM_DELAY;
          const liftHeight = randomRange(
            CONFIG.SVG_LIFT_MIN_HEIGHT,
            CONFIG.SVG_LIFT_MAX_HEIGHT
          );

          positions.push(px, py, 0);
          startPositions.push(px, py, 0);
          rowIndices.push(y);

          toDelays.push(Math.random() * TRANSITION.TO_RANDOM_DELAY_MS);
          toDistances.push(0.65 + Math.random() * 0.7);

          let moveStrength;

          if (Math.random() < TRANSITION.TO_STAY_PERCENT) {
            moveStrength = 0;
          } else {
            moveStrength = Math.pow(Math.random(), 2.5);
          }

          toMoveStrengths.push(moveStrength);
          svgMasks.push(mask);
          svgLiftDelays.push(liftDelay);

          if (mask > 0.5) {
            const uv = getSvgUvAtWorld(px, py);

            for (let layer = 0; layer < layerCount; layer++) {
              const layerOffset =
                layer * CONFIG.SVG_EXTRUDE_LAYER_HEIGHT +
                randomRange(
                  -CONFIG.SVG_EXTRUDE_HEIGHT_VARIATION,
                  CONFIG.SVG_EXTRUDE_HEIGHT_VARIATION
                );

              liftPositions.push(px, py, 0);
              liftRowIndices.push(y);
              liftDelays.push(liftDelay);
              liftHeights.push(liftHeight);
              liftLayerOffsets.push(layerOffset);
              liftUs.push(uv.u);
              liftVs.push(uv.v);
              liftLayerIndices.push(layer);
            }
          }
        }
      }

      return {
        positions: new Float32Array(positions),
        startPositions: new Float32Array(startPositions),
        rowIndices: new Float32Array(rowIndices),
        toDelays: new Float32Array(toDelays),
        toDistances: new Float32Array(toDistances),
        toMoveStrengths: new Float32Array(toMoveStrengths),
        svgMasks: new Float32Array(svgMasks),
        svgLiftDelays: new Float32Array(svgLiftDelays),

        liftPositions: new Float32Array(liftPositions),
        liftRowIndices: new Float32Array(liftRowIndices),
        liftDelays: new Float32Array(liftDelays),
        liftHeights: new Float32Array(liftHeights),
        liftLayerOffsets: new Float32Array(liftLayerOffsets),
        liftUs: new Float32Array(liftUs),
        liftVs: new Float32Array(liftVs),
        liftLayerIndices: new Float32Array(liftLayerIndices)
      };
    }

    function disposeAll() {
      if (riverPoints) {
        scene.remove(riverPoints);
        if (riverGeometry) riverGeometry.dispose();
        if (riverMaterial) riverMaterial.dispose();
      }

      if (liftPoints) {
        scene.remove(liftPoints);
        if (liftGeometry) liftGeometry.dispose();
        if (liftMaterial) liftMaterial.dispose();
      }

      riverPoints = null;
      riverGeometry = null;
      riverMaterial = null;

      liftPoints = null;
      liftGeometry = null;
      liftMaterial = null;
    }

    function buildParticles() {
      disposeAll();

      const data = buildParticleData();

      riverGeometry = new THREE.BufferGeometry();

      riverGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(data.positions, 3)
      );
      riverGeometry.setAttribute(
        "aStartPosition",
        new THREE.BufferAttribute(data.startPositions, 3)
      );
      riverGeometry.setAttribute(
        "aRowIndex",
        new THREE.BufferAttribute(data.rowIndices, 1)
      );
      riverGeometry.setAttribute(
        "aToDelayMs",
        new THREE.BufferAttribute(data.toDelays, 1)
      );
      riverGeometry.setAttribute(
        "aToDistance",
        new THREE.BufferAttribute(data.toDistances, 1)
      );
      riverGeometry.setAttribute(
        "aToMoveStrength",
        new THREE.BufferAttribute(data.toMoveStrengths, 1)
      );
      riverGeometry.setAttribute(
        "aSvgMask",
        new THREE.BufferAttribute(data.svgMasks, 1)
      );
      riverGeometry.setAttribute(
        "aSvgLiftDelay",
        new THREE.BufferAttribute(data.svgLiftDelays, 1)
      );

      riverMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uPointSize: {
            value: CONFIG.POINT_SIZE * renderer.getPixelRatio()
          },
          uBaseAlpha: {
            value: CONFIG.BASE_ALPHA
          },
          uUseRoundPoints: {
            value: CONFIG.USE_ROUND_POINTS ? 1.0 : 0.0
          },
          uAlphaCutoff: {
            value: CONFIG.ALPHA_CUTOFF
          },
          uScrollAlpha: {
            value: 0.0
          },
          uScrollWaveOffset: {
            value: 0
          },
          uAutoWaveOffset: {
            value: 0
          },
          uAutoWaveBlend: {
            value: 1
          },
          uWaveAmplitude: {
            value: CONFIG.WAVE_AMPLITUDE
          },
          uWaveFrequencyX: {
            value: CONFIG.WAVE_FREQUENCY_X
          },
          uWaveFrequencyY: {
            value: CONFIG.WAVE_FREQUENCY_Y
          },
          uBaseZOffset: {
            value: CONFIG.BASE_Z_OFFSET
          },
          uRiverScrollMoveX: {
            value: 0
          },
          uRiverScrollMoveY: {
            value: 0
          },
          uRiverScrollMoveZ: {
            value: 0
          },
          uRowCount: {
            value: rowCount
          },
          uFrontFadeRows: {
            value: CONFIG.FRONT_FADE_ROWS
          },
          uBackFadeRows: {
            value: CONFIG.BACK_FADE_ROWS
          },
          uMinFadeAlpha: {
            value: CONFIG.MIN_FADE_ALPHA
          },
          uRiverOffsetY: {
            value: 0
          },
          uRiverOffsetZ: {
            value: 0
          },
          uToProgress: {
            value: 0
          },
          uToDurationMs: {
            value: TRANSITION.TO_DURATION_MS
          },
          uToMoveY: {
            value: TRANSITION.TO_PARTICLE_LIFT_Y
          },
          uSvgReveal: {
            value: 0
          },
          uSvgLiftProgress: {
            value: 0
          },
          uSvgFillerStart: {
            value: CONFIG.SVG_FILLER_START
          },
          uSvgFillerEnd: {
            value: CONFIG.SVG_FILLER_END
          },
          uBackgroundAlphaMultiplier: {
            value: CONFIG.BACKGROUND_ALPHA_MULTIPLIER
          },
          uSvgAlphaMultiplier: {
            value: CONFIG.SVG_ALPHA_MULTIPLIER
          },
          uBackgroundSizeMultiplier: {
            value: CONFIG.BACKGROUND_SIZE_MULTIPLIER
          },
          uSvgSizeMultiplier: {
            value: CONFIG.SVG_SIZE_MULTIPLIER
          },
          uRiverColor: {
            value: new THREE.Color(CONFIG.RIVER_COLOR)
          },
          uSvgColor: {
            value: new THREE.Color(CONFIG.SVG_COLOR)
          },
          uToWhiteMix: {
            value: TRANSITION.TO_WHITE_MIX
          },
          uToWhiteMix: {
            value: TRANSITION.TO_WHITE_MIX
          },
          uToWhitePower: {
            value: TRANSITION.TO_WHITE_POWER
          },
          uToOpacityBoost: {
            value: TRANSITION.TO_OPACITY_BOOST
          }
        },
        vertexShader: riverVertexShader,
        fragmentShader: riverFragmentShader,
        transparent: true,
        depthTest: false,
        depthWrite: false
      });

      riverPoints = new THREE.Points(riverGeometry, riverMaterial);

      riverPoints.rotation.x = CONFIG.BASE_ROT_X;
      riverPoints.rotation.y = CONFIG.BASE_ROT_Y;
      riverPoints.rotation.z = CONFIG.BASE_ROT_Z;
      riverPoints.visible = isActive;
      riverPoints.frustumCulled = false;

      scene.add(riverPoints);

      liftGeometry = new THREE.BufferGeometry();

      liftGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(data.liftPositions, 3)
      );
      liftGeometry.setAttribute(
        "aStartPosition",
        new THREE.BufferAttribute(data.liftPositions, 3)
      );
      liftGeometry.setAttribute(
        "aRowIndex",
        new THREE.BufferAttribute(data.liftRowIndices, 1)
      );
      liftGeometry.setAttribute(
        "aSvgLiftDelay",
        new THREE.BufferAttribute(data.liftDelays, 1)
      );
      liftGeometry.setAttribute(
        "aSvgLiftHeight",
        new THREE.BufferAttribute(data.liftHeights, 1)
      );
      liftGeometry.setAttribute(
        "aSvgLayerOffset",
        new THREE.BufferAttribute(data.liftLayerOffsets, 1)
      );
      liftGeometry.setAttribute(
        "aSvgU",
        new THREE.BufferAttribute(data.liftUs, 1)
      );
      liftGeometry.setAttribute(
        "aSvgV",
        new THREE.BufferAttribute(data.liftVs, 1)
      );
      liftGeometry.setAttribute(
        "aSvgLayerIndex",
        new THREE.BufferAttribute(data.liftLayerIndices, 1)
      );

      liftMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uPointSize: {
            value: CONFIG.POINT_SIZE * renderer.getPixelRatio()
          },
          uUseRoundPoints: {
            value: CONFIG.USE_ROUND_POINTS ? 1.0 : 0.0
          },
          uAlphaCutoff: {
            value: CONFIG.ALPHA_CUTOFF
          },
          uBaseAlpha: {
            value: CONFIG.BASE_ALPHA * CONFIG.SVG_ALPHA_MULTIPLIER
          },
          uScrollWaveOffset: {
            value: 0
          },
          uAutoWaveOffset: {
            value: 0
          },
          uAutoWaveBlend: {
            value: 1
          },
          uWaveAmplitude: {
            value: CONFIG.WAVE_AMPLITUDE
          },
          uWaveFrequencyX: {
            value: CONFIG.WAVE_FREQUENCY_X
          },
          uWaveFrequencyY: {
            value: CONFIG.WAVE_FREQUENCY_Y
          },
          uBaseZOffset: {
            value: CONFIG.BASE_Z_OFFSET
          },
          uRiverScrollMoveX: {
            value: 0
          },
          uRiverScrollMoveY: {
            value: 0
          },
          uRiverScrollMoveZ: {
            value: 0
          },
          uRiverOffsetY: {
            value: 0
          },
          uRiverOffsetZ: {
            value: 0
          },
          uSvgReveal: {
            value: 0
          },
          uSvgLiftProgress: {
            value: 0
          },
          uSvgLiftFadePower: {
            value: CONFIG.SVG_LIFT_FADE_POWER
          },
          uSvgColor: {
            value: new THREE.Color(CONFIG.SVG_COLOR)
          },
          uSvgTexture: {
            value: svgTexture || createFallbackTexture()
          },
          uUseSvgTexture: {
            value: CONFIG.SVG_IMAGE_URL ? 1.0 : 0.0
          },
          uSvgImageMode: {
            value: CONFIG.SVG_IMAGE_MODE === "layerTiles" ? 1.0 : 0.0
          },
          uSvgLayerCount: {
            value: Math.max(1, Math.floor(CONFIG.SVG_EXTRUDE_LAYERS))
          },
          uSvgLayerCropShift: {
            value: CONFIG.SVG_IMAGE_LAYER_CROP_SHIFT
          },
          uSvgImageMix: {
            value: CONFIG.SVG_IMAGE_MIX
          },
          uSvgImageBrightness: {
            value: CONFIG.SVG_IMAGE_BRIGHTNESS
          },
          uSvgImageAlpha: {
            value: CONFIG.SVG_IMAGE_ALPHA
          },
          uSvgImageToWhite: {
            value: CONFIG.SVG_IMAGE_TO_WHITE
          }
        },
        vertexShader: liftVertexShader,
        fragmentShader: liftFragmentShader,
        transparent: true,
        depthTest: false,
        depthWrite: false
      });

      liftPoints = new THREE.Points(liftGeometry, liftMaterial);

      liftPoints.rotation.x = CONFIG.BASE_ROT_X;
      liftPoints.rotation.y = CONFIG.BASE_ROT_Y;
      liftPoints.rotation.z = CONFIG.BASE_ROT_Z;
      liftPoints.visible = isActive;
      liftPoints.frustumCulled = false;

      scene.add(liftPoints);
    }

    function updateTransitionProgress(progress = {}) {
      sectionEl = sectionEl || document.getElementById("vis-2");

      if (!sectionEl) return;

      const rect = sectionEl.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const sectionHeight = sectionEl.offsetHeight;

      const localY =
        typeof progress.shiftedLocalY === "number"
          ? progress.shiftedLocalY - window.innerHeight
          : window.scrollY - sectionTop;

      const tiPx = window.innerHeight * (TRANSITION.TI / 100);
      const toPx = window.innerHeight * (TRANSITION.TO / 100);

      const msStart = tiPx;
      const toStartOffsetPx = window.innerHeight * TRANSITION.TO_START_OFFSET;
      const msEnd = sectionHeight - toStartOffsetPx;

      tiProgress = clamp01(localY / Math.max(tiPx, 1));
      toProgress = clamp01((localY - msEnd) / Math.max(toPx, 1));
      msProgress = clamp01((localY - msStart) / Math.max(msEnd - msStart, 1));
      fullProgress = clamp01(localY / Math.max(sectionHeight, 1));
    }

    function applyTransitionIn() {
      const fadeT = Math.pow(
        easeOutCubic(tiProgress),
        TRANSITION.TI_FADE_POWER
      );
      const moveT = easeOutCubic(tiProgress);

      scrollAlpha = fadeT;

      riverOffsetY = TRANSITION.TI_FROM_Y * (1 - moveT);
      riverOffsetZ = TRANSITION.TI_FROM_Z * (1 - moveT);
      waveBoost = TRANSITION.TI_WAVE_BOOST * (1 - moveT);

      svgReveal = showLogoEnabled()
        ? getRangeProgress(
            tiProgress,
            CONFIG.SVG_REVEAL_START,
            CONFIG.SVG_REVEAL_END
          )
        : 0;

      svgLiftProgress = 0;
    }

    function applyMainScroll() {
      scrollAlpha = 1;

      riverOffsetY = 0;
      riverOffsetZ = 0;
      waveBoost = 0;

      if (showLogoEnabled()) {
        svgReveal = 1;

        svgLiftProgress = getRangeProgress(
          msProgress,
          CONFIG.SVG_LIFT_START,
          CONFIG.SVG_LIFT_END
        );
      } else {
        svgReveal = 0;
        svgLiftProgress = 1;
      }
    }

    function applyTransitionOut() {
      scrollAlpha = 1;

      riverOffsetY = 0;
      riverOffsetZ = 0;
      waveBoost = TRANSITION.TO_WAVE_BOOST * toProgress;

      svgReveal = 0;
      svgLiftProgress = 1;
    }

    function applyTimeline() {
      if (toProgress > 0) {
        applyTransitionOut();
        return;
      }

      if (tiProgress < 1) {
        applyTransitionIn();
        return;
      }

      applyMainScroll();
    }

    function updateScrollDirection() {
      const delta = fullProgress - lastFullProgress;

      if (Math.abs(delta) > CONFIG.SCROLL_DIRECTION_EPSILON) {
        scrollDirection = delta > 0 ? 1 : -1;
      }

      lastFullProgress = fullProgress;
    }

    function updateWaveOffset() {
      const tiWave = tiProgress * TRANSITION.TI_WAVE_SCROLL_DISTANCE;
      const mainWave = fullProgress * TRANSITION.WAVE_SCROLL_DISTANCE;
      const toWave = toProgress * TRANSITION.TO_WAVE_SCROLL_DISTANCE;

      scrollWaveOffset = tiWave + mainWave + toWave;

      const toFadeT = getRangeProgress(
        toProgress,
        0.0,
        CONFIG.AUTO_WAVE_TO_FADE_END
      );

      autoWaveBlend = 1 - easeOutCubic(toFadeT);
    }

    function updateRiverScrollMove() {
      const baseMoveX = fullProgress * CONFIG.RIVER_SCROLL_MOVE_X;
      const baseMoveY = fullProgress * CONFIG.RIVER_SCROLL_MOVE_Y;
      const baseMoveZ = fullProgress * CONFIG.RIVER_SCROLL_MOVE_Z;

      riverScrollMoveX =
        baseMoveX + toProgress * TRANSITION.TO_SCROLL_CONTINUE_X;

      riverScrollMoveY = baseMoveY;
      riverScrollMoveZ = baseMoveZ;
    }

    function updateMaterialUniforms() {
      if (riverMaterial && riverPoints) {
        riverMaterial.uniforms.uScrollWaveOffset.value = scrollWaveOffset;
        riverMaterial.uniforms.uAutoWaveOffset.value = autoWaveOffset;
        riverMaterial.uniforms.uAutoWaveBlend.value = autoWaveBlend;
        riverMaterial.uniforms.uScrollAlpha.value = scrollAlpha;
        riverMaterial.uniforms.uPointSize.value =
          CONFIG.POINT_SIZE * renderer.getPixelRatio();
        riverMaterial.uniforms.uWaveAmplitude.value =
          CONFIG.WAVE_AMPLITUDE + waveBoost;
        riverMaterial.uniforms.uWaveFrequencyX.value = CONFIG.WAVE_FREQUENCY_X;
        riverMaterial.uniforms.uWaveFrequencyY.value = CONFIG.WAVE_FREQUENCY_Y;
        riverMaterial.uniforms.uBaseZOffset.value = CONFIG.BASE_Z_OFFSET;
        riverMaterial.uniforms.uRiverScrollMoveX.value = riverScrollMoveX;
        riverMaterial.uniforms.uRiverScrollMoveY.value = riverScrollMoveY;
        riverMaterial.uniforms.uRiverScrollMoveZ.value = riverScrollMoveZ;
        riverMaterial.uniforms.uFrontFadeRows.value = CONFIG.FRONT_FADE_ROWS;
        riverMaterial.uniforms.uBackFadeRows.value = CONFIG.BACK_FADE_ROWS;
        riverMaterial.uniforms.uMinFadeAlpha.value = CONFIG.MIN_FADE_ALPHA;
        riverMaterial.uniforms.uRiverOffsetY.value = riverOffsetY;
        riverMaterial.uniforms.uRiverOffsetZ.value = riverOffsetZ;
        riverMaterial.uniforms.uToProgress.value = toProgress;
        riverMaterial.uniforms.uToDurationMs.value = TRANSITION.TO_DURATION_MS;
        riverMaterial.uniforms.uToMoveY.value = TRANSITION.TO_PARTICLE_LIFT_Y;
        riverMaterial.uniforms.uSvgReveal.value = svgReveal;
        riverMaterial.uniforms.uSvgLiftProgress.value = svgLiftProgress;
        riverMaterial.uniforms.uSvgFillerStart.value = CONFIG.SVG_FILLER_START;
        riverMaterial.uniforms.uSvgFillerEnd.value = CONFIG.SVG_FILLER_END;
        riverMaterial.uniforms.uBackgroundAlphaMultiplier.value =
          CONFIG.BACKGROUND_ALPHA_MULTIPLIER;
        riverMaterial.uniforms.uSvgAlphaMultiplier.value =
          CONFIG.SVG_ALPHA_MULTIPLIER;
        riverMaterial.uniforms.uBackgroundSizeMultiplier.value =
          CONFIG.BACKGROUND_SIZE_MULTIPLIER;
        riverMaterial.uniforms.uSvgSizeMultiplier.value =
          CONFIG.SVG_SIZE_MULTIPLIER;
        riverMaterial.uniforms.uRiverColor.value.set(CONFIG.RIVER_COLOR);
        riverMaterial.uniforms.uSvgColor.value.set(CONFIG.SVG_COLOR);
        riverMaterial.uniforms.uToOpacityBoost.value =
          TRANSITION.TO_OPACITY_BOOST;

        riverPoints.visible = isActive && scrollAlpha > 0.001;

        riverPoints.position.y = toProgress * TRANSITION.TO_OBJECT_MOVE_Y;
        riverPoints.position.z = toProgress * TRANSITION.TO_OBJECT_MOVE_Z;
        riverPoints.rotation.x =
          CONFIG.BASE_ROT_X + toProgress * TRANSITION.TO_OBJECT_ROTATE_X;
      }

      if (liftMaterial && liftPoints) {
        liftMaterial.uniforms.uScrollWaveOffset.value = scrollWaveOffset;
        liftMaterial.uniforms.uAutoWaveOffset.value = autoWaveOffset;
        liftMaterial.uniforms.uAutoWaveBlend.value = autoWaveBlend;
        liftMaterial.uniforms.uPointSize.value =
          CONFIG.POINT_SIZE * renderer.getPixelRatio();
        liftMaterial.uniforms.uWaveAmplitude.value =
          CONFIG.WAVE_AMPLITUDE + waveBoost;
        liftMaterial.uniforms.uWaveFrequencyX.value = CONFIG.WAVE_FREQUENCY_X;
        liftMaterial.uniforms.uWaveFrequencyY.value = CONFIG.WAVE_FREQUENCY_Y;
        liftMaterial.uniforms.uBaseZOffset.value = CONFIG.BASE_Z_OFFSET;
        liftMaterial.uniforms.uRiverScrollMoveX.value = riverScrollMoveX;
        liftMaterial.uniforms.uRiverScrollMoveY.value = riverScrollMoveY;
        liftMaterial.uniforms.uRiverScrollMoveZ.value = riverScrollMoveZ;
        liftMaterial.uniforms.uRiverOffsetY.value = riverOffsetY;
        liftMaterial.uniforms.uRiverOffsetZ.value = riverOffsetZ;
        liftMaterial.uniforms.uSvgReveal.value = svgReveal;
        liftMaterial.uniforms.uSvgLiftProgress.value = svgLiftProgress;
        liftMaterial.uniforms.uSvgLiftFadePower.value =
          CONFIG.SVG_LIFT_FADE_POWER;
        liftMaterial.uniforms.uSvgColor.value.set(CONFIG.SVG_COLOR);
        liftMaterial.uniforms.uUseSvgTexture.value = CONFIG.SVG_IMAGE_URL
          ? 1.0
          : 0.0;
        liftMaterial.uniforms.uSvgImageMode.value =
          CONFIG.SVG_IMAGE_MODE === "layerTiles" ? 1.0 : 0.0;
        liftMaterial.uniforms.uSvgLayerCount.value = Math.max(
          1,
          Math.floor(CONFIG.SVG_EXTRUDE_LAYERS)
        );
        liftMaterial.uniforms.uSvgLayerCropShift.value =
          CONFIG.SVG_IMAGE_LAYER_CROP_SHIFT;
        liftMaterial.uniforms.uSvgImageMix.value = CONFIG.SVG_IMAGE_MIX;
        liftMaterial.uniforms.uSvgImageBrightness.value =
          CONFIG.SVG_IMAGE_BRIGHTNESS;
        liftMaterial.uniforms.uSvgImageAlpha.value = CONFIG.SVG_IMAGE_ALPHA;
        liftMaterial.uniforms.uSvgImageToWhite.value =
          CONFIG.SVG_IMAGE_TO_WHITE;

        liftPoints.visible =
          showLogoEnabled() &&
          isActive &&
          scrollAlpha > 0.001 &&
          svgReveal > 0.001 &&
          svgLiftProgress < 0.999;
        liftPoints.position.y = toProgress * TRANSITION.TO_OBJECT_MOVE_Y;
        liftPoints.position.z = toProgress * TRANSITION.TO_OBJECT_MOVE_Z;
        liftPoints.rotation.x =
          CONFIG.BASE_ROT_X + toProgress * TRANSITION.TO_OBJECT_ROTATE_X;

        if (svgTexture) {
          liftMaterial.uniforms.uSvgTexture.value = svgTexture;
        }
      }
    }

    function applyCurrentState(progress = {}) {
      updateTransitionProgress(progress);
      updateScrollDirection();
      updateWaveOffset();
      updateRiverScrollMove();
      applyTimeline();
      updateMaterialUniforms();
    }

    return {
      async init() {
        sectionEl = document.getElementById("vis-2");

        await buildSvgMaskCanvas();
        svgTexture = await loadImageTexture(CONFIG.SVG_IMAGE_URL);

        buildParticles();

        window.AIM_VIS2_READY = true;

        window.dispatchEvent(
          new CustomEvent("aimVisualReady", {
            detail: { id: "vis-2" }
          })
        );
      },

      enter(app, progress = {}) {
        isActive = true;
        lastTickTime = clock.getElapsedTime();

        if (!riverPoints || !liftPoints) {
          buildParticles();
        }

        if (riverPoints) riverPoints.visible = true;
        if (liftPoints) liftPoints.visible = true;

        applyCurrentState(progress);
      },

      update(app, progress = {}) {
        if (!isActive) return;
        applyCurrentState(progress);
      },

      tick(app, progress = {}) {
        if (!isActive || !riverPoints || !riverMaterial) return;

        const elapsed = clock.getElapsedTime();

        if (lastTickTime === null) {
          lastTickTime = elapsed;
        }

        const dt = Math.min(Math.max(elapsed - lastTickTime, 0), 0.05);
        lastTickTime = elapsed;

        autoWaveOffset += CONFIG.AUTO_WAVE_SPEED * scrollDirection * dt;

        applyCurrentState(progress);
      },

      exit() {
        isActive = false;
        lastTickTime = null;

        if (riverPoints) riverPoints.visible = false;
        if (liftPoints) liftPoints.visible = false;
      },

      destroy() {
        disposeAll();

        if (svgTexture) {
          svgTexture.dispose();
          svgTexture = null;
        }
      },

      resize() {
        if (isActive) {
          buildParticles();
          applyCurrentState();
        }
      }
    };
  })();

  window.AIM.register("vis-2", Vis2);
})();
