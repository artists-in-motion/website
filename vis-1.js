
(function startWhenAIMReady() {
    if (!window.AIM) {
      window.addEventListener('aimGlobalReady', startWhenAIMReady, {
        once: true,
      });
      return;
    }

    const app = window.AIM;

const THREE = app.THREE;
const container = app.container;
const scene = app.scene;
const renderer = app.renderer;
const clock = app.clock;

// === IMAGE URLS === //
// Uses global AIM image helper
// Second value = max number of images / No second value to return all images
// Example window.AIM.getImageUrls('.urls', 6); / will fetch 6 images
let IMAGE_URLS = [];

const MOUSE_SHAPE_SVG = `
<svg width="100%" style="" viewBox="0 0 225 237" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M109.532 10L112.494 13.1562L204.774 111.466L211.198 118.31L204.774 125.153L112.494 223.474L109.532 226.63H23.1025L38.9121 209.786L124.768 118.31L38.9121 26.8438L23.1016 10H109.532Z" fill="currentColor" stroke="currentColor" stroke-width="10"/>
</svg>
`;

const CONFIG = {
  // === FOR TESTING / DEBUGGiNG ===

  DEBUG_SOLID_COLOR: false, // true = replaces image with solid debug colour

  // === IMAGE SAMPLING ===

  SAMPLE_WIDTH: 450, // sampled image width
  SAMPLE_HEIGHT: 0, // 0 = auto height from image aspect ratio

  // === IMAGE COVER FRAME ===

  IMAGE_FRAME_WIDTH: 800, // virtual cover frame width
  IMAGE_FRAME_HEIGHT: 800, // virtual cover frame height

  // === PARTICLES ===

  POINT_SIZE: 3.0, // particle size
  USE_ROUND_POINTS: false, // true = circular particles
  ALPHA_CUTOFF: 0.01, // discard alpha below this threshold

  // === BASE SCENE TRANSFORM ===

  BASE_ROT_X: -0.6, // base X rotation
  BASE_ROT_Y: -0.0, // base Y rotation
  BASE_ROT_Z: -0.0, // base Z rotation

  BASE_POS_X: 0.0, // base X position before scroll transition
  BASE_POS_Y: -0.0, // base Y position before scroll transition
  BASE_POS_Z: 0.2, // base Z position before scroll transition

  MS_TARGET_ROT_X: 0.0, // X rotation reached during MS, 0 = facing camera

  // === MOUSE PAINT ===

  MOUSE_PAINT_ENABLED: true, // enables SVG mouse light trail
  MOUSE_PAINT_TEXTURE_SIZE: 150, // SVG mask quality. 120 lighter, 256 sharper
  MOUSE_PAINT_WIDTH: 0.6, // overall SVG size. 0.4 small, 1.5 large
  MOUSE_PAINT_WHITE_MIX: 0.0, // white blend amount. 0 none, 1 full white
  MOUSE_PAINT_BRIGHTNESS: 0.7, // brightness boost. 0 off, 1 subtle, 3 strong
  MOUSE_PAINT_CONTRAST: 15.0, // contrast boost. 0 off, 1 subtle, 3 strong
  MOUSE_PAINT_SAMPLE_STEP: 1, // performance control. 1 best quality, 3 lighter CP
  MOUSE_PAINT_ROTATE_LERP: 0.1, // rotation smoothing. Lower = smoother/slower, higher = snappier
  MOUSE_PAINT_PIVOT_X: 0.5, // horizontal SVG pivot. 0 left, 0.5 centre, 1 right
  MOUSE_PAINT_PIVOT_Y: 0.5, // vertical SVG pivot. 0 top, 0.5 centre, 1 bottom
  MOUSE_PAINT_ROTATION_OFFSET: 0.0, // manual SVG rotation offset in radians
  MOUSE_PAINT_FADE_IN: 0.05, // light-up speed. Lower softer, higher faster
  MOUSE_PAINT_MASK_BLUR: 10, // SVG edge blur in pixels. 0 sharp, 20 soft
  MOUSE_PAINT_FOLLOW: 0.05, // shape follow speed. Lower = more lag/trailing.Higher=tighter/faster catchup to pointer.
  MOUSE_PAINT_DISTANCE_MIN_PX: 3, // minimum pointer movement in pixels before brightness reacts.Higher=ignores smaller movement/jitter.
  MOUSE_PAINT_WHITE_RAMP: 0.05, // speed of white/brightness ramp-up when movement increases.Higher=faster transition to full white.
  MOUSE_PAINT_WHITE_FADE: 0.05, // speed of white/brightness fade-down when movement slows/stops.Lower=smoother/longer fade out.Higher=faster fade out.
  MOUSE_PAINT_STATE_DELAY: 8, // frames movement must stay above/below threshold before white target changes.Higher=less flicker/slower response.
  MOUSE_PAINT_FADE: 0.98, // how long painted particles remain lit after movement stops.Lower=faster fade out.Higher=longer lingering trail.
  MOUSE_PAINT_INITIAL_STEPDOWN: 0.8, // first trail drop after fresh stamp.1.0=no stepdown.Lower=bigger gap between head and trail.

  MOUSE_PAINT_ANGLE_FROM_CHASE: true, // true = rotation follows eased movement

  // === MOUSE ROTATION ===

  MOUSE_ROTATE_X: 0.1, // mouse influence on X
  MOUSE_ROTATE_Y: 0.1, // mouse influence on Y
  MOUSE_ROTATE_Z: 0.0, // mouse influence on Z

  ROTATION_LERP: 0.08, // rotation smoothing
  INITIAL_POINTER_EASE_MS: 1000, // pointer ease-in duration

  // === BASE WAVE ===

  WAVE_AMPLITUDE: 0.2, // base wave height (0.15 base)
  WAVE_FREQUENCY_X: 3.0, // X wave frequency
  WAVE_FREQUENCY_Y: 4.0, // Y wave frequency
  WAVE_SPEED: 0.5, // wave animation speed

  // === RIPPLE PULSE ===

  MS_PULSE_ENABLED: true, // enables ripple pulse
  MS_PULSE_DELAY_MS: 0, // delay before pulse starts
  MS_PULSE_DURATION_MS: 2500, // total pulse duration

  MS_PULSE_HEIGHT: 0.3, // pulse displacement height

  MS_PULSE_RING_WIDTH: 1.0, // pulse ring thickness
  MS_PULSE_RING_COUNT: 1.0, // wave count within ring

  MS_PULSE_START_RADIUS: 0.22, // starting radius
  MS_PULSE_END_RADIUS: 1.0, // ending radius

  MS_PULSE_EASE_POWER: 1.0, // pulse travel easing

  MS_PULSE_CENTER_X: 0.0, // pulse origin X
  MS_PULSE_CENTER_Y: 0.0, // pulse origin Y

  // === RIPPLE WHITE BLEND ===

  MS_PULSE_WHITE_MIX: 0.1, // 0 = no white, 1 = fully white
  MS_PULSE_WHITE_POWER: 5.0, // higher = tighter white falloff

  // === TOP RETURN TRIGGER ===

  TOP_RETURN_ENABLED: true, // enables ripple restart near page top
  TOP_RETURN_SCROLL_Y: 150, // trigger threshold
  TOP_RETURN_REARM_SCROLL_Y: 300, // must scroll below this before re-trigger
  TOP_RETURN_COOLDOWN_MS: 1200, // cooldown between triggers

  // === MS STARFIELD TIMING ===

  MS_STARFIELD_ENABLED: true, // enables starfield effect

  MS_STARFIELD_START: 0.0, // MS progress where starfield begins
  MS_STARFIELD_END: 1.0, // MS progress where starfield completes

  MS_STARFIELD_EASE_POWER: 0.5, // starfield easing strength

  // === MS STARFIELD SHAPE ===

  MS_STARFIELD_CENTER_RADIUS: 0.2, // centre void radius
  MS_STARFIELD_CENTER_SOFTNESS: 0.6, // centre falloff softness
  MS_STARFIELD_POWER: 1.0, // edge emphasis strength

  // === MS STARFIELD DEPTH ===

  MS_STARFIELD_REAR_PUSH_Z: -0.6, // rear depth displacement
  MS_STARFIELD_FRONT_PUSH_Z: 1.4, // forward depth displacement

  MS_STARFIELD_SPREAD_X: 0.02, // X spread
  MS_STARFIELD_SPREAD_Y: 0.01, // Y spread

  // === MS STARFIELD OPACITY ===

  MS_STARFIELD_CENTER_OPACITY: 0.3, // centre opacity
  MS_STARFIELD_EDGE_OPACITY: 1.0, // edge opacity

  MS_STARFIELD_OPACITY_POWER: 0.7, // opacity falloff strength

  // === MS STARFIELD FRONT WHITE ===

  MS_STARFIELD_FRONT_WHITE_MIX: 0.2, // 0 = no extra white, 1 = fully white on front particles
  MS_STARFIELD_FRONT_WHITE_POWER: 0.4, // higher = only whitens strongest front particles

  // === IMAGE COLOUR ===

  IMAGE_BRIGHTNESS: 1.4, // overall image brightness
  IMAGE_CONTRAST: 1.2, // image contrast
  IMAGE_SATURATION: 1.0, // image saturation

  // === IMAGE CYCLING ===

  DISPLAY_TIME_MS: 5000, // display duration per image

  TRANSITION_OUT_DURATION_MS: 1000, // image transition out duration
  TRANSITION_IN_DURATION_MS: 1000, // image transition in duration

  RANDOM_DELAY_MS: 1000, // random particle delay

  OPEN_WITH_TRANSITION_IN: true, // first load opens with transition in
  AUTO_START: true, // auto-start image cycling

  // === IMAGE CYCLING PAUSE ===

  PAUSE_IMAGE_CYCLE_ON_SCROLL: true, // pause cycling during deeper MS
  PAUSE_IMAGE_CYCLE_PROGRESS: 0.1, // pause threshold
  RESUME_IMAGE_CYCLE_PROGRESS: 0.04, // resume threshold

  // === IMAGE TRANSITION MOTION ===

  PARTICLE_MOVE_DISTANCE: 0.3, // particle transition distance
  OUT_SIZE_TO: 0.15, // particle scale at end of transition out
  IN_SIZE_FROM: 0.15 // particle scale at start of transition in
};

const TRANSITION = {
  // === TO STARFIELD RETURN ===

  TO_STARFIELD_RETURN_END: 0.8, // starfield fully returns to plane by this TO progress

  // === TO EDGE FADE ===

  TO_EDGE_FADE_START: 0.0, // TO progress where edge fade starts
  TO_EDGE_FADE_END: 0.1, // TO progress where edge fade completes
  TO_EDGE_FADE_X: 0.5, // outer left/right fade width
  TO_EDGE_FADE_Y: 1.0, // outer top/bottom fade height
  TO_EDGE_FADE_STRENGTH: 1.0, // 1 = full edge fade
  TO_EDGE_FADE_POWER: 1.0, // higher = sharper edge fade

  // === TO VIS 2 ALIGNMENT ===

  TO_ALIGN_ENABLED: true, // true = align toward Vis 2 TI
  TO_ALIGN_START: 0.0, // TO progress where alignment begins
  TO_ALIGN_END: 0.9, // TO progress where alignment finishes

  TO_STARFIELD_VISUAL_RETURN: 0.8, // 1 = fully restore opacity, 0 = keep MS opacity

  TO_TARGET_ROT_X: -1.3, // target X rotation
  TO_TARGET_ROT_Y: 0.0, // target Y rotation
  TO_TARGET_ROT_Z: 0.0, // target Z rotation

  TO_TARGET_POS_X: 0.0, // target X position during TO
  TO_TARGET_POS_Y: -0.1, // target Y position during TO, negative = down
  TO_TARGET_POS_Z: 0.5, // target Z position during TO

  // === TO COLOUR / ALPHA MATCH ===

  TO_COLOR_MATCH_START: 0.5, // TO progress where whitening begins
  TO_COLOR_MATCH_END: 1.0, // TO progress where whitening completes
  TO_WHITE_BLEND: 0.1, // 0 = retain image colour, 1 = fully white

  TO_ALPHA_START: 0.0, // TO progress where alpha reduction begins
  TO_ALPHA_END: 1.0, // TO progress where alpha reduction completes
  TO_ALPHA_TO: 1.0, // target alpha before fade

  // === TO FADE ===

  TO_FADE_START: 0.5, // TO progress where fade begins
  TO_FADE_END: 0.95, // TO progress where fade completes
  FADE_TO: 0.0, // final opacity

  // === TO FALLBACK MOTION ===

  WAVE_BOOST: 0.18, // extra wave strength during TO
  Z_PUSH: 0.3, // fallback Z push if alignment disabled

  ROT_X: -0.35, // fallback X rotation
  ROT_Y: 0.0, // fallback Y rotation
  ROT_Z: 0.08, // fallback Z rotation

  ROTATION_REDUCTION: 1.0 // reduces mouse influence during TO
};
    
// === FOR MAIN SCRIPT IN WEBFLOW ===

const vertexShader = `
  attribute vec3 aStartPosition;
  attribute float aDelayMs;
  
  uniform float uPointSize;
  uniform float uTime;
  
  uniform float uWaveAmplitude;
  uniform float uWaveFrequencyX;
  uniform float uWaveFrequencyY;
  uniform float uWaveSpeed;
  uniform float uBaseZOffset;
  
  uniform float uToEdgeFadeProgress;
  uniform float uToEdgeFadeX;
  uniform float uToEdgeFadeY;
  uniform float uToEdgeFadeStrength;
  uniform float uToEdgeFadePower;
  
  uniform float uMsPulseEnabled;
  uniform float uMsPulseProgress;
  uniform float uMsPulseHeight;
  uniform float uMsPulseRingWidth;
  uniform float uMsPulseRingCount;
  uniform float uMsPulseStartRadius;
  uniform float uMsPulseEndRadius;
  uniform float uMsPulseEasePower;
  uniform float uMsPulseCenterX;
  uniform float uMsPulseCenterY;
  uniform float uMsPulseWhiteMix;
  uniform float uMsPulseWhitePower;
  
  uniform float uMsStarfieldEnabled;
  uniform float uMsStarfieldShapeMix;
  uniform float uMsStarfieldVisualMix;
  uniform float uMsStarfieldCenterRadius;
  uniform float uMsStarfieldCenterSoftness;
  uniform float uMsStarfieldRearPushZ;
  uniform float uMsStarfieldFrontPushZ;
  uniform float uMsStarfieldSpreadX;
  uniform float uMsStarfieldSpreadY;
  uniform float uMsStarfieldPower;
  uniform float uMsStarfieldCenterOpacity;
  uniform float uMsStarfieldEdgeOpacity;
  uniform float uMsStarfieldOpacityPower;
  uniform float uMsStarfieldFrontWhiteMix;
  uniform float uMsStarfieldFrontWhitePower;
  
  uniform float uPhase;
  uniform float uElapsedPhaseMs;
  uniform float uPhaseDurationMs;
  uniform float uMoveDistance;
  uniform float uOutSizeTo;
  uniform float uInSizeFrom;
  
  uniform float uPlaneHalfWidth;
  uniform float uPlaneHalfHeight;
  
  varying vec2 vUv;
  varying float vAlpha;
  varying float vStarfieldAlpha;
  
  varying float vPulseWhite;
  varying float vFrontWhite;
  
  varying float vToEdgeFade;
  
attribute float aMousePaint;
varying float vMousePaint;

attribute float aMouseBright;
attribute float aMouseContrast;

varying float vMouseBright;
varying float vMouseContrast;


  
  float easeInCubic(float t) {
  return t * t * t;
  }
  
  float easeOutCubic(float t) {
  return 1.0 - pow(1.0 - t, 3.0);
  }
  
  void main() {
  vUv = uv;
  
  vec3 basePos = aStartPosition;
  vec3 displayPos = basePos;
  
  float normX = clamp(basePos.x / max(uPlaneHalfWidth, 0.0001), -1.0, 1.0);
  float normY = clamp(basePos.y / max(uPlaneHalfHeight, 0.0001), -1.0, 1.0);
  
  float edgeX =
  smoothstep(
  1.0 - uToEdgeFadeX,
  1.0,
  abs(normX)
  );
  
  float edgeY =
  smoothstep(
  1.0 - uToEdgeFadeY,
  1.0,
  abs(normY)
  );
  
  float edgeAmount =
  pow(
  max(edgeX, edgeY),
  max(uToEdgeFadePower, 0.0001)
  );
  
  vToEdgeFade =
  mix(
  1.0,
  1.0 - edgeAmount,
  uToEdgeFadeProgress * uToEdgeFadeStrength
  );
  
  displayPos.z += uBaseZOffset;
  
  float waveA = sin(basePos.x * uWaveFrequencyX + uTime * uWaveSpeed);
  float waveB = sin(basePos.y * uWaveFrequencyY + uTime * uWaveSpeed);
  float wave = (waveA + waveB) * 0.5;
  displayPos.z += wave * uWaveAmplitude;
  
  vec2 pulseCenter = vec2(uMsPulseCenterX, uMsPulseCenterY);
  float pulseDist = length(basePos.xy - pulseCenter);
  float maxPulseRadius = length(vec2(uPlaneHalfWidth, uPlaneHalfHeight)) * uMsPulseEndRadius;
  
  float pulseT = clamp(uMsPulseProgress, 0.0, 1.0);
  float pulseTravel = pow(pulseT, max(uMsPulseEasePower, 0.0001));
  
  float startPulseRadius = maxPulseRadius * uMsPulseStartRadius;
  float pulseRadius = mix(startPulseRadius, maxPulseRadius, pulseTravel);
  
  float ringDistance = abs(pulseDist - pulseRadius);
  float ringMask = 1.0 - smoothstep(uMsPulseRingWidth, uMsPulseRingWidth * 2.0, ringDistance);
  
  float ringPhase = (pulseDist - pulseRadius) / max(uMsPulseRingWidth, 0.0001);
  float ringWave = sin(ringPhase * 3.14159265 * uMsPulseRingCount);
  
  float pulseFade = 1.0 - smoothstep(0.45, 1.0, pulseT);
  float startFade = smoothstep(0.0, 0.08, pulseT);
  float pulseStrength = pulseFade * startFade * step(0.5, uMsPulseEnabled);
  
  displayPos.z += ringWave * ringMask * uMsPulseHeight * pulseStrength;
  
  float pulseWhite =
  pow(
  max(ringMask * abs(ringWave), 0.0),
  max(uMsPulseWhitePower, 0.0001)
  ) *
  pulseStrength;
  
  vPulseWhite =
  pulseWhite *
  uMsPulseWhiteMix;
  
  float starShapeMix = uMsStarfieldShapeMix * step(0.5, uMsStarfieldEnabled);
  float starVisualMix = uMsStarfieldVisualMix * step(0.5, uMsStarfieldEnabled);
  
  vec2 radialVec = vec2(normX, normY);
  float radialDist = clamp(length(radialVec), 0.0, 1.41421356);
  
  vec2 radialDir = vec2(0.0);
  if (radialDist > 0.0001) {
  radialDir = radialVec / radialDist;
  }
  
  float centreReveal = smoothstep(
  uMsStarfieldCenterRadius,
  uMsStarfieldCenterRadius + uMsStarfieldCenterSoftness,
  radialDist
  );
  
  float frontStrength = pow(centreReveal, max(uMsStarfieldPower, 0.0001)) * starShapeMix;
  float rearStrength = (1.0 - centreReveal) * starShapeMix;
  
  displayPos.z += uMsStarfieldRearPushZ * rearStrength;
  displayPos.z += uMsStarfieldFrontPushZ * frontStrength;
  
  displayPos.x += radialDir.x * uMsStarfieldSpreadX * frontStrength;
  displayPos.y += radialDir.y * uMsStarfieldSpreadY * frontStrength;
  
  float opacityT = pow(centreReveal, max(uMsStarfieldOpacityPower, 0.0001));
  float starAlpha = mix(uMsStarfieldCenterOpacity, uMsStarfieldEdgeOpacity, opacityT);
  vStarfieldAlpha = mix(1.0, starAlpha, starVisualMix);
  
  
  vFrontWhite =
  pow(
  frontStrength,
  max(uMsStarfieldFrontWhitePower, 0.0001)
  ) *
  uMsStarfieldFrontWhiteMix;
  
  vec3 outPos = displayPos + vec3(0.0, 0.0, uMoveDistance);
  vec3 inStartPos = displayPos - vec3(0.0, 0.0, uMoveDistance);
  
  vec3 pos = displayPos;
  float alpha = 1.0;
  float sizeScale = 1.0;
  
  float localT = clamp((uElapsedPhaseMs - aDelayMs) / max(uPhaseDurationMs, 0.0001), 0.0, 1.0);
  
  if (uPhase < 0.5) {
  pos = displayPos;
  alpha = 1.0;
  sizeScale = 1.0;
  } else if (uPhase < 1.5) {
  float e = easeInCubic(localT);
  pos = mix(displayPos, outPos, e);
  alpha = mix(1.0, 0.0, e);
  sizeScale = mix(1.0, uOutSizeTo, e);
  } else {
  float e = easeOutCubic(localT);
  pos = mix(inStartPos, displayPos, e);
  alpha = mix(0.0, 1.0, e);
  sizeScale = mix(uInSizeFrom, 1.0, e);
  }
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  
  gl_PointSize = max(0.0, uPointSize * sizeScale);
  gl_Position = projectionMatrix * mvPosition;
  
vAlpha = alpha;
vMousePaint = aMousePaint;
vMouseBright = aMouseBright;
vMouseContrast = aMouseContrast;
}
  `;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uUseRoundPoints;
  uniform float uAlphaCutoff;
  uniform float uScrollAlpha;
  uniform float uMsStarfieldWhiteMix;
  uniform float uToWhiteMix;
  uniform float uToAlphaMix;
  uniform float uDebugSolidColor;
  
  uniform float uImageBrightness;
  uniform float uImageContrast;
  uniform float uImageSaturation;
  
  varying vec2 vUv;
  varying float vAlpha;
  varying float vStarfieldAlpha;
  
  varying float vPulseWhite;
  varying float vFrontWhite;
  
  varying float vToEdgeFade;
  varying float vMousePaint;
  varying float vMouseBright;
varying float vMouseContrast;
  
  void main() {
  if (uUseRoundPoints > 0.5) {
  vec2 p = gl_PointCoord - vec2(0.5);
  if (dot(p, p) > 0.25) discard;
  }

vec4 color =
  uDebugSolidColor > 0.5
    ? vec4(0.25, 0.45, 0.9, 1.0)
    : texture2D(uTexture, vUv);
  
  color.rgb *= uImageBrightness;
  
  float luma =
  dot(
  color.rgb,
  vec3(0.299, 0.587, 0.114)
  );
  
  color.rgb =
  mix(
  vec3(luma),
  color.rgb,
  uImageSaturation
  );
  
  color.rgb =
  (color.rgb - 0.5) *
  uImageContrast +
  0.5;
  
  float whiteAmount =
  clamp(
  max(
  max(
  vPulseWhite,
  vFrontWhite
  ),
  uToWhiteMix
  ),
  0.0,
  1.0
  );
  
color.rgb += vMouseBright;

float mouseContrast = max(0.0, 1.0 + vMouseContrast);

color.rgb =
(color.rgb - 0.5) *
mouseContrast +
0.5;

color.rgb = clamp(color.rgb, 0.0, 1.0);
  
  color.a *= vAlpha * vStarfieldAlpha * vToEdgeFade * uScrollAlpha;
  color.a *= uToAlphaMix;
  
  if (color.a < uAlphaCutoff) discard;
  
  gl_FragColor = color;
  }
  `;

function waitForImageUrls(selector = '.urls', minCount = 1, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const start = performance.now();

    function getCmsUrls() {
      return [...document.querySelectorAll(selector)]
        .map((el) => el.textContent.trim())
        .filter((url) => url.startsWith('http'));
    }

    function check() {
      const cmsUrls = getCmsUrls();

      if (cmsUrls.length >= minCount) {
        resolve(window.AIM.getImageUrls(selector));
        return;
      }

      if (performance.now() - start >= timeoutMs) {
        resolve(window.AIM.getImageUrls(selector));
        return;
      }

      requestAnimationFrame(check);
    }

    check();
  });
}

const Vis1 = (() => {
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");

  let statsEl = null; // debugger

  let points = null;
  let geometry = null;
  let material = null;
  let textures = [];

  let mouseMaskCanvas = null;
  let mouseMaskCtx = null;
  let mouseMaskAspect = 1;
  let mousePaintAttr = null;
  let mouseBrightAttr = null;
  let mouseContrastAttr = null;
  let mousePaintX = 0;
  let mousePaintY = 0;
  let mousePaintNormX = 0;
  let mousePaintNormY = 0;
  let mousePaintClientX = 0;
  let mousePaintClientY = 0;
  let mousePaintFollowLastMs = 0;
  let mousePaintTargetNormX = 0;
  let mousePaintTargetNormY = 0;
  let mousePaintAngle = 0;
  let mousePaintTargetAngle = 0;
  let mousePaintSpeed = 0;
  let mousePaintIntensity = 0;
  let mousePaintTargetState = 0;

  let mousePaintPendingState = 0;
  let mousePaintPendingFrames = 0;
  let mouseLastPaintX = 0;
  let mouseLastPaintY = 0;
  let mouseLastPaintClientX = 0;
  let mouseLastPaintClientY = 0;
  let mouseHasPaintPoint = false;
  let mouseMovedThisFrame = false;

  let shuffledImageIndexes = [];
  let shuffledImagePointer = 0;

  let currentImageIndex = 0;
  let nextImageIndex = 0;

  let state = "display";
  let stateStartMs = 0;

  let hasRealPointer = false;
  let lastPointerClientX = null;
  let lastPointerClientY = null;

  let firstPointerSeen = false;
  let pointerIntroStartMs = -1;
  let pointerIntroComplete = false;
  let introInfluence = 0.0;

  let isActive = false;
  let listenersAttached = false;
  let texturesLoaded = false;
    let initialIntroStarted = false;

  let scrollOutroProgress = 0;
  let scrollMainProgress = 0;
  let msStarfieldProgress = 0;
  let imageCyclePaused = false;

  let pulseStartMs = -1;
  let pulseProgress = 1;

  let topReturnArmed = false;
  let lastTopReturnMs = -999999;
  let lastScrollY = window.scrollY || 0;

  let currentPlaneHalfWidth = 3;
  let currentPlaneHalfHeight = 2;

  const rawMouseRotation = {
    x: 0,
    y: 0,
    z: 0
  };
  const currentMouseRotation = {
    x: 0,
    y: 0,
    z: 0
  };

  const targetRotation = {
    x: CONFIG.BASE_ROT_X,
    y: CONFIG.BASE_ROT_Y,
    z: CONFIG.BASE_ROT_Z
  };

  function getNowMs() {
    return clock.getElapsedTime() * 1000;
  }

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4.0 * t * t * t
      : 1.0 - Math.pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  function lerpAngle(a, b, t) {
    let d = b - a;

    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;

    return a + d * t;
  }

  function shuffleImageIndexes() {
    shuffledImageIndexes = Array.from(
      { length: IMAGE_URLS.length },
      (_, i) => i
    );

    for (let i = shuffledImageIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [shuffledImageIndexes[i], shuffledImageIndexes[j]] = [
        shuffledImageIndexes[j],
        shuffledImageIndexes[i]
      ];
    }
  }

  function loadMouseMask() {
    const size = CONFIG.MOUSE_PAINT_TEXTURE_SIZE;
    const viewBox = MOUSE_SHAPE_SVG.match(/viewBox=["']([^"']+)["']/i);
    if (viewBox) {
      const v = viewBox[1]
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      if (v.length === 4 && v[2] > 0 && v[3] > 0) mouseMaskAspect = v[2] / v[3];
    }

    mouseMaskCanvas = document.createElement("canvas");
    mouseMaskCanvas.width = size;
    mouseMaskCanvas.height = Math.max(1, Math.round(size / mouseMaskAspect));
    mouseMaskCtx = mouseMaskCanvas.getContext("2d", {
      willReadFrequently: true
    });

    const img = new Image();
    const url = URL.createObjectURL(
      new Blob([MOUSE_SHAPE_SVG], { type: "image/svg+xml" })
    );

    img.onload = () => {
      mouseMaskCtx.clearRect(
        0,
        0,
        mouseMaskCanvas.width,
        mouseMaskCanvas.height
      );
      mouseMaskCtx.filter = `blur(${CONFIG.MOUSE_PAINT_MASK_BLUR}px)`;
      mouseMaskCtx.drawImage(
        img,
        0,
        0,
        mouseMaskCanvas.width,
        mouseMaskCanvas.height
      );
      mouseMaskCtx.filter = "none";
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }

  function paintMouseShape() {
    if (
      !CONFIG.MOUSE_PAINT_ENABLED ||
      !mousePaintAttr ||
      !mouseBrightAttr ||
      !hasStoredPointerPosition() ||
      !mouseMaskCtx
    )
      return;

    const pointer = getNormalizedPointer(
      lastPointerClientX,
      lastPointerClientY
    );

    mousePaintTargetNormX = pointer.x;
    mousePaintTargetNormY = pointer.y;

    if (!mouseHasPaintPoint) {
      mousePaintNormX = mousePaintTargetNormX;
      mousePaintNormY = mousePaintTargetNormY;
      mousePaintClientX = lastPointerClientX;
      mousePaintClientY = lastPointerClientY;
      mousePaintFollowLastMs = getNowMs();
      mouseLastPaintClientX = lastPointerClientX;
      mouseLastPaintClientY = lastPointerClientY;

      mousePaintX = mousePaintNormX * currentPlaneHalfWidth;
      mousePaintY = -mousePaintNormY * currentPlaneHalfHeight;

      mouseLastPaintX = mousePaintTargetNormX;
      mouseLastPaintY = mousePaintTargetNormY;

      mouseHasPaintPoint = true;
    }

    const prevX = mousePaintX;
    const prevY = mousePaintY;

    const nowMs = getNowMs();

    if (mousePaintFollowLastMs <= 0) {
      mousePaintFollowLastMs = nowMs;
    }

    const deltaFrames = Math.max(
      0.001,
      (nowMs - mousePaintFollowLastMs) / 16.6667
    );

    mousePaintFollowLastMs = nowMs;

    const followAmount =
      1.0 - Math.pow(1.0 - CONFIG.MOUSE_PAINT_FOLLOW, deltaFrames);

    mousePaintClientX +=
      (lastPointerClientX - mousePaintClientX) * followAmount;

    mousePaintClientY +=
      (lastPointerClientY - mousePaintClientY) * followAmount;

    const easedPointer = getNormalizedPointer(
      mousePaintClientX,
      mousePaintClientY
    );

    mousePaintNormX = easedPointer.x;
    mousePaintNormY = easedPointer.y;

    mousePaintX = mousePaintNormX * currentPlaneHalfWidth;
    mousePaintY = -mousePaintNormY * currentPlaneHalfHeight;

    const chaseMoveX = mousePaintX - prevX;
    const chaseMoveY = mousePaintY - prevY;
    const chaseDist = Math.sqrt(
      chaseMoveX * chaseMoveX + chaseMoveY * chaseMoveY
    );

    const pointerMoveX = mousePaintTargetNormX - mouseLastPaintX;

    const pointerMoveY = mousePaintTargetNormY - mouseLastPaintY;

    const pointerDist = Math.sqrt(
      pointerMoveX * pointerMoveX + pointerMoveY * pointerMoveY
    );

    const pointerMovePxX = lastPointerClientX - mouseLastPaintClientX;

    const pointerMovePxY = lastPointerClientY - mouseLastPaintClientY;

    const movementAmount = Math.sqrt(
      pointerMovePxX * pointerMovePxX + pointerMovePxY * pointerMovePxY
    );

    const rawTargetState =
      movementAmount >= CONFIG.MOUSE_PAINT_DISTANCE_MIN_PX ? 1 : 0;

    if (rawTargetState !== mousePaintPendingState) {
      mousePaintPendingState = rawTargetState;
      mousePaintPendingFrames = 0;
    } else {
      mousePaintPendingFrames++;
    }

    if (mousePaintPendingFrames >= CONFIG.MOUSE_PAINT_STATE_DELAY) {
      mousePaintTargetState = mousePaintPendingState;
    }

    const targetPaintIntensity = mousePaintTargetState;

    const intensityLerp =
      targetPaintIntensity > mousePaintIntensity
        ? CONFIG.MOUSE_PAINT_WHITE_RAMP
        : CONFIG.MOUSE_PAINT_WHITE_FADE;

    mousePaintIntensity +=
      (targetPaintIntensity - mousePaintIntensity) * intensityLerp;

    mousePaintSpeed = mousePaintIntensity;

    if (chaseDist > 0.0001) {
      const angleX = CONFIG.MOUSE_PAINT_ANGLE_FROM_CHASE
        ? chaseMoveX
        : pointerMoveX;
      const angleY = CONFIG.MOUSE_PAINT_ANGLE_FROM_CHASE
        ? chaseMoveY
        : pointerMoveY;

      mousePaintTargetAngle =
        Math.atan2(angleY, angleX) + CONFIG.MOUSE_PAINT_ROTATION_OFFSET;
    }

    mousePaintAngle = lerpAngle(
      mousePaintAngle,
      mousePaintTargetAngle,
      CONFIG.MOUSE_PAINT_ROTATE_LERP
    );

    mouseLastPaintX = mousePaintTargetNormX;
    mouseLastPaintY = mousePaintTargetNormY;

    mouseLastPaintClientX = lastPointerClientX;
    mouseLastPaintClientY = lastPointerClientY;

    if (mousePaintSpeed <= 0.001) return;

    const shapeW = Math.max(CONFIG.MOUSE_PAINT_WIDTH, 0.001);
    const shapeH = shapeW / mouseMaskAspect;

    const pivotX = shapeW * (CONFIG.MOUSE_PAINT_PIVOT_X - 0.5);
    const pivotY = shapeH * (CONFIG.MOUSE_PAINT_PIVOT_Y - 0.5);

    const sinA = Math.sin(-mousePaintAngle);
    const cosA = Math.cos(-mousePaintAngle);

    const pos = geometry.attributes.aStartPosition.array;
    const paint = mousePaintAttr.array;
    const bright = mouseBrightAttr.array;
    const contrast = mouseContrastAttr.array;

    for (let i = 0; i < paint.length; i += CONFIG.MOUSE_PAINT_SAMPLE_STEP) {
      const dx = pos[i * 3] - mousePaintX;
      const dy = pos[i * 3 + 1] - mousePaintY;

      const rx = dx * cosA - dy * sinA;
      const ry = dx * sinA + dy * cosA;

      const localX = rx + pivotX;
      const localY = ry + pivotY;

      const u = localX / shapeW + 0.5;
      const v = 1 - (localY / shapeH + 0.5);

      if (u < 0 || u > 1 || v < 0 || v > 1) continue;

      const px = Math.floor(u * (mouseMaskCanvas.width - 1));
      const py = Math.floor(v * (mouseMaskCanvas.height - 1));
      const a = mouseMaskCtx.getImageData(px, py, 1, 1).data[3] / 255;

      if (a > 0.01) {
        const strength = a * mousePaintSpeed;

        paint[i] = Math.max(paint[i], strength * CONFIG.MOUSE_PAINT_WHITE_MIX);

        bright[i] = Math.max(
          bright[i],
          strength * CONFIG.MOUSE_PAINT_BRIGHTNESS
        );
        contrast[i] = Math.max(
          contrast[i],
          strength * CONFIG.MOUSE_PAINT_CONTRAST
        );
      }
    }

    mousePaintAttr.needsUpdate = true;
    mouseBrightAttr.needsUpdate = true;
  }

  function fadeMousePaint() {
    if (!mousePaintAttr || !mouseBrightAttr) return;

    const paint = mousePaintAttr.array;
    const bright = mouseBrightAttr.array;
    const contrast = mouseContrastAttr.array;

    for (let i = 0; i < paint.length; i++) {
      const fadeAmount = CONFIG.MOUSE_PAINT_FADE;

      const stepAmount = CONFIG.MOUSE_PAINT_INITIAL_STEPDOWN;

      paint[i] *= paint[i] > stepAmount ? stepAmount : fadeAmount;

      bright[i] *= bright[i] > stepAmount ? stepAmount : fadeAmount;

      contrast[i] *= contrast[i] > stepAmount ? stepAmount : fadeAmount;
    }

    mousePaintAttr.needsUpdate = true;
    mouseBrightAttr.needsUpdate = true;
    mouseContrastAttr.needsUpdate = true;
  }

  function getMsStarfieldEffect(progress) {
    const p = clamp01(progress);
    const start = CONFIG.MS_STARFIELD_START;
    const end = CONFIG.MS_STARFIELD_END;
    const t = clamp01((p - start) / Math.max(end - start, 0.0001));
    return Math.pow(
      easeInOutCubic(t),
      Math.max(CONFIG.MS_STARFIELD_EASE_POWER, 0.0001)
    );
  }

  function setVec3(obj, x, y, z) {
    obj.x = x;
    obj.y = y;
    obj.z = z;
  }

  function hasStoredPointerPosition() {
    return (
      hasRealPointer && lastPointerClientX != null && lastPointerClientY != null
    );
  }

  function isPointerIntroActive() {
    return hasRealPointer && firstPointerSeen && !pointerIntroComplete;
  }

  function restartPulse() {
    pulseStartMs = getNowMs() + CONFIG.MS_PULSE_DELAY_MS;
    pulseProgress = 0;
  }

  function updatePulse(nowMs) {
    if (!CONFIG.MS_PULSE_ENABLED || pulseStartMs < 0) {
      pulseProgress = 1;
      return;
    }

    const elapsed = nowMs - pulseStartMs;

    if (elapsed <= 0) {
      pulseProgress = 0;
      return;
    }

    pulseProgress = clamp01(elapsed / Math.max(CONFIG.MS_PULSE_DURATION_MS, 1));
  }

  function updateTopReturnTrigger() {
    if (!CONFIG.TOP_RETURN_ENABLED) return;

    const currentScrollY = window.scrollY || 0;
    const scrollingUp = currentScrollY < lastScrollY;

    lastScrollY = currentScrollY;

    if (currentScrollY > CONFIG.TOP_RETURN_REARM_SCROLL_Y) {
      topReturnArmed = true;
    }

    const nowMs = getNowMs();

    const canTrigger =
      topReturnArmed &&
      scrollingUp &&
      currentScrollY <= CONFIG.TOP_RETURN_SCROLL_Y &&
      nowMs - lastTopReturnMs >= CONFIG.TOP_RETURN_COOLDOWN_MS;

    if (!canTrigger) return;

    topReturnArmed = false;
    lastTopReturnMs = nowMs;

    restartPulse();

    imageCyclePaused = false;

    resetToDisplayPhase();

    // make the next image transition eligible immediately
    stateStartMs = nowMs - CONFIG.DISPLAY_TIME_MS;
  }

  function updateImageCyclePause() {
    if (!CONFIG.PAUSE_IMAGE_CYCLE_ON_SCROLL) {
      imageCyclePaused = false;
      return;
    }

    if (scrollMainProgress >= CONFIG.PAUSE_IMAGE_CYCLE_PROGRESS) {
      imageCyclePaused = true;
      return;
    }

    if (scrollMainProgress <= CONFIG.RESUME_IMAGE_CYCLE_PROGRESS) {
      imageCyclePaused = false;
    }
  }

  function getContainerSize() {
    return {
      width: Math.max(container.clientWidth, 1),
      height: Math.max(container.clientHeight, 1)
    };
  }

  function getPlaneSize(imageWidth, imageHeight) {
    const imageAspect = imageWidth / imageHeight;
    const { width: viewWidth, height: viewHeight } = getContainerSize();
    const viewAspect = viewWidth / viewHeight;

    if (imageAspect > viewAspect) {
      const width = 6;
      return {
        width,
        height: width / imageAspect
      };
    }

    const height = 4;
    return {
      width: height * imageAspect,
      height
    };
  }

  function getNormalizedPointer(clientX, clientY) {
    const rect = container.getBoundingClientRect();

    return {
      x: ((clientX - rect.left) / rect.width) * 2 - 1,
      y: ((clientY - rect.top) / rect.height) * 2 - 1
    };
  }

  function buildParticleData(texture) {
    const image = texture.image;
    const aspect = image.width / image.height;

    const sampleWidth = Math.max(2, Math.floor(CONFIG.SAMPLE_WIDTH));
    const sampleHeight =
      CONFIG.SAMPLE_HEIGHT > 0
        ? Math.max(2, Math.floor(CONFIG.SAMPLE_HEIGHT))
        : Math.max(2, Math.floor(sampleWidth / aspect));

    const offCanvas = document.createElement("canvas");
    offCanvas.width = sampleWidth;
    offCanvas.height = sampleHeight;

    const ctx = offCanvas.getContext("2d", {
      willReadFrequently: true
    });
    ctx.drawImage(image, 0, 0, sampleWidth, sampleHeight);

    const data = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;
    const plane = getPlaneSize(image.width, image.height);

    const planeAspect = plane.width / plane.height;
    const imageAspect = image.width / image.height;

    let uvScaleX = 1.0;
    let uvScaleY = 1.0;

    let uvOffsetX = 0.0;
    let uvOffsetY = 0.0;

    if (imageAspect > planeAspect) {
      uvScaleX = planeAspect / imageAspect;
      uvOffsetX = (1.0 - uvScaleX) * 0.5;
    } else {
      uvScaleY = imageAspect / planeAspect;
      uvOffsetY = (1.0 - uvScaleY) * 0.5;
    }

    currentPlaneHalfWidth = plane.width * 0.5;
    currentPlaneHalfHeight = plane.height * 0.5;

    const positions = [];
    const startPositions = [];
    const uvs = [];
    const delays = [];

    for (let y = 0; y < sampleHeight; y++) {
      for (let x = 0; x < sampleWidth; x++) {
        const i = (y * sampleWidth + x) * 4;
        const a = data[i + 3] / 255;

        if (a <= CONFIG.ALPHA_CUTOFF) continue;

        const px = (x / (sampleWidth - 1) - 0.5) * plane.width;
        const py = -(y / (sampleHeight - 1) - 0.5) * plane.height;

        positions.push(px, py, 0);
        startPositions.push(px, py, 0);
        const u = uvOffsetX + (x / (sampleWidth - 1)) * uvScaleX;

        const v = uvOffsetY + (1 - y / (sampleHeight - 1)) * uvScaleY;

        uvs.push(u, v);
        delays.push(Math.random() * CONFIG.RANDOM_DELAY_MS);
      }
    }

    return {
      positions: new Float32Array(positions),
      startPositions: new Float32Array(startPositions),
      uvs: new Float32Array(uvs),
      delays: new Float32Array(delays)
    };
  }

  function disposePoints() {
    if (!points) return;

    points.position.y =
      CONFIG.BASE_POS_Y + scrollOutroProgress * TRANSITION.TO_TARGET_Y_OFFSET;

    scene.remove(points);

    if (geometry) geometry.dispose();
    if (material) material.dispose();

    points = null;
    geometry = null;
    material = null;
  }

  function buildParticles(texture) {
    disposePoints();

    const data = buildParticleData(texture);

    geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(data.positions, 3)
    );
    geometry.setAttribute(
      "aStartPosition",
      new THREE.BufferAttribute(data.startPositions, 3)
    );
    geometry.setAttribute("uv", new THREE.BufferAttribute(data.uvs, 2));
    geometry.setAttribute(
      "aDelayMs",
      new THREE.BufferAttribute(data.delays, 1)
    );

    const particleCount = data.positions.length / 3;

    mousePaintAttr = new THREE.BufferAttribute(
      new Float32Array(particleCount),
      1
    );
    mouseBrightAttr = new THREE.BufferAttribute(
      new Float32Array(particleCount),
      1
    );
    mouseContrastAttr = new THREE.BufferAttribute(
      new Float32Array(particleCount),
      1
    );

    geometry.setAttribute("aMousePaint", mousePaintAttr);
    geometry.setAttribute("aMouseBright", mouseBrightAttr);
    geometry.setAttribute("aMouseContrast", mouseContrastAttr);

    material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: {
          value: texture
        },
        uPointSize: {
          value: CONFIG.POINT_SIZE * renderer.getPixelRatio()
        },
        uUseRoundPoints: {
          value: CONFIG.USE_ROUND_POINTS ? 1.0 : 0.0
        },
        uAlphaCutoff: {
          value: CONFIG.ALPHA_CUTOFF
        },
        uScrollAlpha: {
          value: 1.0
        },

        uToEdgeFadeProgress: {
          value: 0.0
        },
        uToEdgeFadeX: {
          value: TRANSITION.TO_EDGE_FADE_X
        },
        uToEdgeFadeY: {
          value: TRANSITION.TO_EDGE_FADE_Y
        },
        uToEdgeFadeStrength: {
          value: TRANSITION.TO_EDGE_FADE_STRENGTH
        },
        uToEdgeFadePower: {
          value: TRANSITION.TO_EDGE_FADE_POWER
        },
        uDebugSolidColor: {
          value: CONFIG.DEBUG_SOLID_COLOR ? 1.0 : 0.0
        },
        uTime: {
          value: 0
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
        uWaveSpeed: {
          value: CONFIG.WAVE_SPEED
        },
        uBaseZOffset: {
          value: CONFIG.BASE_POS_Z
        },

        uImageBrightness: {
          value: CONFIG.IMAGE_BRIGHTNESS
        },

        uImageContrast: {
          value: CONFIG.IMAGE_CONTRAST
        },

        uImageSaturation: {
          value: CONFIG.IMAGE_SATURATION
        },

        uMsPulseEnabled: {
          value: CONFIG.MS_PULSE_ENABLED ? 1.0 : 0.0
        },
        uMsPulseProgress: {
          value: 1.0
        },
        uMsPulseHeight: {
          value: CONFIG.MS_PULSE_HEIGHT
        },
        uMsPulseRingWidth: {
          value: CONFIG.MS_PULSE_RING_WIDTH
        },
        uMsPulseRingCount: {
          value: CONFIG.MS_PULSE_RING_COUNT
        },
        uMsPulseStartRadius: {
          value: CONFIG.MS_PULSE_START_RADIUS
        },
        uMsPulseEndRadius: {
          value: CONFIG.MS_PULSE_END_RADIUS
        },
        uMsPulseEasePower: {
          value: CONFIG.MS_PULSE_EASE_POWER
        },
        uMsPulseCenterX: {
          value: CONFIG.MS_PULSE_CENTER_X
        },
        uMsPulseCenterY: {
          value: CONFIG.MS_PULSE_CENTER_Y
        },
        uMsPulseWhiteMix: {
          value: CONFIG.MS_PULSE_WHITE_MIX
        },
        uMsPulseWhitePower: {
          value: CONFIG.MS_PULSE_WHITE_POWER
        },

        uMsStarfieldEnabled: {
          value: CONFIG.MS_STARFIELD_ENABLED ? 1.0 : 0.0
        },
        uMsStarfieldShapeMix: {
          value: 0.0
        },
        uMsStarfieldVisualMix: {
          value: 0.0
        },
        uMsStarfieldCenterRadius: {
          value: CONFIG.MS_STARFIELD_CENTER_RADIUS
        },
        uMsStarfieldCenterSoftness: {
          value: CONFIG.MS_STARFIELD_CENTER_SOFTNESS
        },
        uMsStarfieldRearPushZ: {
          value: CONFIG.MS_STARFIELD_REAR_PUSH_Z
        },
        uMsStarfieldFrontPushZ: {
          value: CONFIG.MS_STARFIELD_FRONT_PUSH_Z
        },
        uMsStarfieldSpreadX: {
          value: CONFIG.MS_STARFIELD_SPREAD_X
        },
        uMsStarfieldSpreadY: {
          value: CONFIG.MS_STARFIELD_SPREAD_Y
        },
        uMsStarfieldPower: {
          value: CONFIG.MS_STARFIELD_POWER
        },
        uMsStarfieldCenterOpacity: {
          value: CONFIG.MS_STARFIELD_CENTER_OPACITY
        },
        uMsStarfieldEdgeOpacity: {
          value: CONFIG.MS_STARFIELD_EDGE_OPACITY
        },
        uMsStarfieldOpacityPower: {
          value: CONFIG.MS_STARFIELD_OPACITY_POWER
        },
        uMsStarfieldFrontWhiteMix: {
          value: CONFIG.MS_STARFIELD_FRONT_WHITE_MIX
        },
        uMsStarfieldFrontWhitePower: {
          value: CONFIG.MS_STARFIELD_FRONT_WHITE_POWER
        },

        uToWhiteMix: {
          value: 0.0
        },
        uToAlphaMix: {
          value: 1.0
        },

        uPhase: {
          value: 0.0
        },
        uElapsedPhaseMs: {
          value: 0.0
        },
        uPhaseDurationMs: {
          value: CONFIG.TRANSITION_OUT_DURATION_MS
        },
        uMoveDistance: {
          value: CONFIG.PARTICLE_MOVE_DISTANCE
        },
        uOutSizeTo: {
          value: CONFIG.OUT_SIZE_TO
        },
        uInSizeFrom: {
          value: CONFIG.IN_SIZE_FROM
        },

        uPlaneHalfWidth: {
          value: currentPlaneHalfWidth
        },
        uPlaneHalfHeight: {
          value: currentPlaneHalfHeight
        }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    points = new THREE.Points(geometry, material);
    points.rotation.x = CONFIG.BASE_ROT_X;
    points.rotation.y = CONFIG.BASE_ROT_Y;
    points.rotation.z = CONFIG.BASE_ROT_Z;
    points.position.x = CONFIG.BASE_POS_X;
    points.position.y = CONFIG.BASE_POS_Y;
    points.visible = isActive;

    scene.add(points);
  }

  function updateRawPointerTargets(clientX, clientY) {
    const pointer = getNormalizedPointer(clientX, clientY);

    rawMouseRotation.y = pointer.x * CONFIG.MOUSE_ROTATE_Y;
    rawMouseRotation.x = pointer.y * CONFIG.MOUSE_ROTATE_X;
    rawMouseRotation.z = pointer.x * CONFIG.MOUSE_ROTATE_Z;
  }

  function beginPointerIntroIfNeeded() {
    if (firstPointerSeen) return;

    firstPointerSeen = true;
    pointerIntroStartMs = getNowMs();
    pointerIntroComplete = false;
  }

  function registerRealPointer(clientX, clientY) {
    hasRealPointer = true;
    lastPointerClientX = clientX;
    lastPointerClientY = clientY;

    updateRawPointerTargets(clientX, clientY);
    beginPointerIntroIfNeeded();
  }

  function initPointerStateBeforeFirstRender() {
    introInfluence = 0.0;
    pointerIntroComplete = false;

    setVec3(rawMouseRotation, 0, 0, 0);
    setVec3(currentMouseRotation, 0, 0, 0);
    setVec3(
      targetRotation,
      CONFIG.BASE_ROT_X,
      CONFIG.BASE_ROT_Y,
      CONFIG.BASE_ROT_Z
    );
  }

  function updateIntroInfluence(nowMs) {
    if (!firstPointerSeen || pointerIntroStartMs < 0) {
      introInfluence = 0.0;
      return;
    }

    if (pointerIntroComplete) {
      introInfluence = 1.0;
      return;
    }

    const elapsed = nowMs - pointerIntroStartMs;
    const t = clamp01(elapsed / CONFIG.INITIAL_POINTER_EASE_MS);

    introInfluence = easeInOutCubic(t);

    if (t >= 1) {
      pointerIntroComplete = true;
      introInfluence = 1.0;
    }
  }

  function getNextImageIndex() {
    const index = shuffledImageIndexes[shuffledImagePointer];

    shuffledImagePointer =
      (shuffledImagePointer + 1) % shuffledImageIndexes.length;

    return index;
  }

  function setState(nextState) {
    state = nextState;
    stateStartMs = getNowMs();
  }

  function setPhaseUniforms(phase, elapsedMs, durationMs) {
    if (!material) return;

    material.uniforms.uPhase.value = phase;
    material.uniforms.uElapsedPhaseMs.value = elapsedMs;
    material.uniforms.uPhaseDurationMs.value = durationMs;
  }

  function startCycle() {
    if (!material || textures.length < 2) return;

    nextImageIndex = getNextImageIndex();
    setState("transitionOut");
    setPhaseUniforms(1.0, 0.0, CONFIG.TRANSITION_OUT_DURATION_MS);
  }

  function startIntro() {
    if (!material) return;

    setState("transitionIn");
    setPhaseUniforms(2.0, 0.0, CONFIG.TRANSITION_IN_DURATION_MS);
  }

  function swapHiddenImage() {
    currentImageIndex = nextImageIndex;
    material.uniforms.uTexture.value = textures[currentImageIndex];
  }

  function resetToDisplayPhase() {
    if (!material) return;

    material.uniforms.uPhase.value = 0.0;
    material.uniforms.uElapsedPhaseMs.value = 0.0;
    setState("display");
  }

  function startInitialDisplayState() {
    if (CONFIG.OPEN_WITH_TRANSITION_IN) {
      startIntro();
    } else {
      resetToDisplayPhase();
    }
  }

    function startInitialIntroOnce() {
  if (initialIntroStarted) return;
  if (!texturesLoaded || !points || !material) return;

  initialIntroStarted = true;

  points.visible = true;

  setState("transitionIn");
  setPhaseUniforms(2.0, 0.0, CONFIG.TRANSITION_IN_DURATION_MS);

  restartPulse();

}

  function updatePointerState(nowMs) {
    updateIntroInfluence(nowMs);

    if (!hasRealPointer) {
      setVec3(currentMouseRotation, 0, 0, 0);
    } else if (isPointerIntroActive()) {
      currentMouseRotation.x = rawMouseRotation.x * introInfluence;
      currentMouseRotation.y = rawMouseRotation.y * introInfluence;
      currentMouseRotation.z = rawMouseRotation.z * introInfluence;
    } else {
      currentMouseRotation.x = rawMouseRotation.x;
      currentMouseRotation.y = rawMouseRotation.y;
      currentMouseRotation.z = rawMouseRotation.z;
    }

    const flatten = Math.min(
      1,
      scrollOutroProgress * TRANSITION.ROTATION_REDUCTION
    );

    const mouseX = currentMouseRotation.x * (1 - flatten);
    const mouseY = currentMouseRotation.y * (1 - flatten);
    const mouseZ = currentMouseRotation.z * (1 - flatten);

    if (TRANSITION.TO_ALIGN_ENABLED) {
      const to = clamp01(
        (scrollOutroProgress - TRANSITION.TO_ALIGN_START) /
          Math.max(TRANSITION.TO_ALIGN_END - TRANSITION.TO_ALIGN_START, 0.0001)
      );

      const msBaseRotX =
        CONFIG.BASE_ROT_X +
        (CONFIG.MS_TARGET_ROT_X - CONFIG.BASE_ROT_X) * msStarfieldProgress;

      const baseRotX =
        msBaseRotX + (TRANSITION.TO_TARGET_ROT_X - msBaseRotX) * to;
      const baseRotY =
        CONFIG.BASE_ROT_Y +
        (TRANSITION.TO_TARGET_ROT_Y - CONFIG.BASE_ROT_Y) * to;
      const baseRotZ =
        CONFIG.BASE_ROT_Z +
        (TRANSITION.TO_TARGET_ROT_Z - CONFIG.BASE_ROT_Z) * to;

      targetRotation.x = baseRotX + mouseX;
      targetRotation.y = baseRotY + mouseY;
      targetRotation.z = baseRotZ + mouseZ;
      return;
    }

    const msBaseRotX =
      CONFIG.BASE_ROT_X +
      (CONFIG.MS_TARGET_ROT_X - CONFIG.BASE_ROT_X) * msStarfieldProgress;

    targetRotation.x =
      msBaseRotX + mouseX + scrollOutroProgress * TRANSITION.ROT_X;
    targetRotation.y =
      CONFIG.BASE_ROT_Y + mouseY + scrollOutroProgress * TRANSITION.ROT_Y;
    targetRotation.z =
      CONFIG.BASE_ROT_Z + mouseZ + scrollOutroProgress * TRANSITION.ROT_Z;
  }

  function updateMaterialUniforms(nowSeconds) {
    if (!material) return;

    const uniforms = material.uniforms;

    const edgeFadeProgress = clamp01(
      (scrollOutroProgress - TRANSITION.TO_EDGE_FADE_START) /
        Math.max(
          TRANSITION.TO_EDGE_FADE_END - TRANSITION.TO_EDGE_FADE_START,
          0.0001
        )
    );

    uniforms.uToEdgeFadeProgress.value = edgeFadeProgress;
    uniforms.uToEdgeFadeX.value = TRANSITION.TO_EDGE_FADE_X;
    uniforms.uToEdgeFadeY.value = TRANSITION.TO_EDGE_FADE_Y;
    uniforms.uToEdgeFadeStrength.value = TRANSITION.TO_EDGE_FADE_STRENGTH;
    uniforms.uToEdgeFadePower.value = TRANSITION.TO_EDGE_FADE_POWER;
    uniforms.uDebugSolidColor.value = CONFIG.DEBUG_SOLID_COLOR ? 1.0 : 0.0;
    uniforms.uImageBrightness.value = CONFIG.IMAGE_BRIGHTNESS;

    uniforms.uImageContrast.value = CONFIG.IMAGE_CONTRAST;

    uniforms.uImageSaturation.value = CONFIG.IMAGE_SATURATION;

    const starReturnT = clamp01(
      scrollOutroProgress / Math.max(TRANSITION.TO_STARFIELD_RETURN_END, 0.0001)
    );

    const starReturn = 1.0 - easeInOutCubic(starReturnT);

    const starShapeMix = msStarfieldProgress * starReturn;
    const visualReturn =
      1.0 - easeInOutCubic(starReturnT) * TRANSITION.TO_STARFIELD_VISUAL_RETURN;

    const starVisualMix = msStarfieldProgress * visualReturn;

    const toWhiteT = clamp01(
      (scrollOutroProgress - TRANSITION.TO_COLOR_MATCH_START) /
        Math.max(
          TRANSITION.TO_COLOR_MATCH_END - TRANSITION.TO_COLOR_MATCH_START,
          0.0001
        )
    );

    const toAlphaT = clamp01(
      (scrollOutroProgress - TRANSITION.TO_ALPHA_START) /
        Math.max(TRANSITION.TO_ALPHA_END - TRANSITION.TO_ALPHA_START, 0.0001)
    );

    uniforms.uTime.value = nowSeconds;
    uniforms.uPointSize.value = CONFIG.POINT_SIZE * renderer.getPixelRatio();

    uniforms.uWaveAmplitude.value =
      CONFIG.WAVE_AMPLITUDE + scrollOutroProgress * TRANSITION.WAVE_BOOST;
    uniforms.uWaveFrequencyX.value = CONFIG.WAVE_FREQUENCY_X;
    uniforms.uWaveFrequencyY.value = CONFIG.WAVE_FREQUENCY_Y;
    uniforms.uWaveSpeed.value = CONFIG.WAVE_SPEED;

    uniforms.uMsPulseWhiteMix.value = CONFIG.MS_PULSE_WHITE_MIX;
    uniforms.uMsPulseWhitePower.value = CONFIG.MS_PULSE_WHITE_POWER;

    uniforms.uMsStarfieldFrontWhiteMix.value =
      CONFIG.MS_STARFIELD_FRONT_WHITE_MIX;
    uniforms.uMsStarfieldFrontWhitePower.value =
      CONFIG.MS_STARFIELD_FRONT_WHITE_POWER;

    if (TRANSITION.TO_ALIGN_ENABLED) {
      const to = clamp01(
        (scrollOutroProgress - TRANSITION.TO_ALIGN_START) /
          Math.max(1.0 - TRANSITION.TO_ALIGN_START, 0.0001)
      );

      uniforms.uBaseZOffset.value =
        CONFIG.BASE_POS_Z +
        (TRANSITION.TO_TARGET_POS_Z - CONFIG.BASE_POS_Z) * to;
    } else {
      uniforms.uBaseZOffset.value =
        CONFIG.BASE_POS_Z + scrollOutroProgress * TRANSITION.Z_PUSH;
    }

    uniforms.uMsPulseEnabled.value = CONFIG.MS_PULSE_ENABLED ? 1.0 : 0.0;
    uniforms.uMsPulseProgress.value = pulseProgress;
    uniforms.uMsPulseHeight.value = CONFIG.MS_PULSE_HEIGHT;
    uniforms.uMsPulseRingWidth.value = CONFIG.MS_PULSE_RING_WIDTH;
    uniforms.uMsPulseRingCount.value = CONFIG.MS_PULSE_RING_COUNT;
    uniforms.uMsPulseStartRadius.value = CONFIG.MS_PULSE_START_RADIUS;
    uniforms.uMsPulseEndRadius.value = CONFIG.MS_PULSE_END_RADIUS;
    uniforms.uMsPulseEasePower.value = CONFIG.MS_PULSE_EASE_POWER;
    uniforms.uMsPulseCenterX.value = CONFIG.MS_PULSE_CENTER_X;
    uniforms.uMsPulseCenterY.value = CONFIG.MS_PULSE_CENTER_Y;

    uniforms.uMsStarfieldEnabled.value = CONFIG.MS_STARFIELD_ENABLED
      ? 1.0
      : 0.0;
    uniforms.uMsStarfieldShapeMix.value = starShapeMix;
    uniforms.uMsStarfieldVisualMix.value = starVisualMix;
    uniforms.uMsStarfieldCenterRadius.value = CONFIG.MS_STARFIELD_CENTER_RADIUS;
    uniforms.uMsStarfieldCenterSoftness.value =
      CONFIG.MS_STARFIELD_CENTER_SOFTNESS;
    uniforms.uMsStarfieldRearPushZ.value = CONFIG.MS_STARFIELD_REAR_PUSH_Z;
    uniforms.uMsStarfieldFrontPushZ.value = CONFIG.MS_STARFIELD_FRONT_PUSH_Z;
    uniforms.uMsStarfieldSpreadX.value = CONFIG.MS_STARFIELD_SPREAD_X;
    uniforms.uMsStarfieldSpreadY.value = CONFIG.MS_STARFIELD_SPREAD_Y;
    uniforms.uMsStarfieldPower.value = CONFIG.MS_STARFIELD_POWER;
    uniforms.uMsStarfieldCenterOpacity.value =
      CONFIG.MS_STARFIELD_CENTER_OPACITY;
    uniforms.uMsStarfieldEdgeOpacity.value = CONFIG.MS_STARFIELD_EDGE_OPACITY;
    uniforms.uMsStarfieldOpacityPower.value = CONFIG.MS_STARFIELD_OPACITY_POWER;

    uniforms.uToWhiteMix.value =
      easeInOutCubic(toWhiteT) * TRANSITION.TO_WHITE_BLEND;

    uniforms.uToAlphaMix.value =
      1.0 + (TRANSITION.TO_ALPHA_TO - 1.0) * easeInOutCubic(toAlphaT);

    uniforms.uPlaneHalfWidth.value = currentPlaneHalfWidth;
    uniforms.uPlaneHalfHeight.value = currentPlaneHalfHeight;

    const toFadeProgress = clamp01(
      (scrollOutroProgress - TRANSITION.TO_FADE_START) /
        Math.max(TRANSITION.TO_FADE_END - TRANSITION.TO_FADE_START, 0.0001)
    );

    uniforms.uScrollAlpha.value =
      1.0 - toFadeProgress * (1.0 - TRANSITION.FADE_TO);
  }

  function updateTransitionState(nowMs) {
    if (!material) return;

    if (state === "display") {
      material.uniforms.uPhase.value = 0.0;
      material.uniforms.uElapsedPhaseMs.value = 0.0;

      if (
        CONFIG.AUTO_START &&
        !imageCyclePaused &&
        nowMs - stateStartMs >= CONFIG.DISPLAY_TIME_MS
      ) {
        startCycle();
      }

      return;
    }

    if (state === "transitionOut") {
      const elapsedMs = nowMs - stateStartMs;

      setPhaseUniforms(1.0, elapsedMs, CONFIG.TRANSITION_OUT_DURATION_MS);

      if (
        elapsedMs >=
        CONFIG.TRANSITION_OUT_DURATION_MS + CONFIG.RANDOM_DELAY_MS
      ) {
        swapHiddenImage();
        setState("transitionIn");
        setPhaseUniforms(2.0, 0.0, CONFIG.TRANSITION_IN_DURATION_MS);
      }

      return;
    }

    if (state === "transitionIn") {
      const elapsedMs = nowMs - stateStartMs;

      setPhaseUniforms(2.0, elapsedMs, CONFIG.TRANSITION_IN_DURATION_MS);

      if (
        elapsedMs >=
        CONFIG.TRANSITION_IN_DURATION_MS + CONFIG.RANDOM_DELAY_MS
      ) {
        resetToDisplayPhase();
      }
    }
  }

  function updatePointRotations() {
    if (!points) return;

    if (isPointerIntroActive()) {
      points.rotation.x = targetRotation.x;
      points.rotation.y = targetRotation.y;
      points.rotation.z = targetRotation.z;
      return;
    }

    points.position.x =
  CONFIG.BASE_POS_X +
  scrollOutroProgress *
    (TRANSITION.TO_TARGET_POS_X - CONFIG.BASE_POS_X);

points.position.y =
  CONFIG.BASE_POS_Y +
  scrollOutroProgress *
    (TRANSITION.TO_TARGET_POS_Y - CONFIG.BASE_POS_Y);

    points.rotation.x +=
      (targetRotation.x - points.rotation.x) * CONFIG.ROTATION_LERP;
    points.rotation.y +=
      (targetRotation.y - points.rotation.y) * CONFIG.ROTATION_LERP;
    points.rotation.z +=
      (targetRotation.z - points.rotation.z) * CONFIG.ROTATION_LERP;
  }

  function onPointerMove(e) {
    registerRealPointer(e.clientX, e.clientY);
  }

  function addListeners() {
    if (listenersAttached) return;

    window.addEventListener("pointermove", onPointerMove);
    listenersAttached = true;
  }

  function removeListeners() {
    if (!listenersAttached) return;

    window.removeEventListener("pointermove", onPointerMove);
    listenersAttached = false;
  }

  function loadTexture(url) {
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;

          const sourceImage = texture.image;
          const targetW = CONFIG.IMAGE_FRAME_WIDTH;
          const targetH = CONFIG.IMAGE_FRAME_HEIGHT;
          const targetAspect = targetW / targetH;
          const sourceAspect = sourceImage.width / sourceImage.height;

          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;

          const ctx = canvas.getContext("2d");

          let drawW;
          let drawH;
          let drawX;
          let drawY;

          if (sourceAspect > targetAspect) {
            drawH = targetH;
            drawW = targetH * sourceAspect;
            drawX = (targetW - drawW) * 0.5;
            drawY = 0;
          } else {
            drawW = targetW;
            drawH = targetW / sourceAspect;
            drawX = 0;
            drawY = (targetH - drawH) * 0.5;
          }

          ctx.drawImage(sourceImage, drawX, drawY, drawW, drawH);

          const coverTexture = new THREE.CanvasTexture(canvas);
          coverTexture.colorSpace = THREE.SRGBColorSpace;
          coverTexture.needsUpdate = true;

          resolve(coverTexture);
        },
        undefined,
        reject
      );
    });
  }

  return {
    async init() {
      initPointerStateBeforeFirstRender();
      loadMouseMask();
      statsEl = document.getElementById("stats");
try {
  IMAGE_URLS = await waitForImageUrls('.urls', 1, 5000);

  const results = await Promise.allSettled(IMAGE_URLS.map(loadTexture));

  textures = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);

  if (!textures.length) {
    throw new Error('No Vis 1 textures loaded');
  }

  texturesLoaded = true;

  shuffleImageIndexes();

  currentImageIndex = getNextImageIndex();
  nextImageIndex = getNextImageIndex();

  buildParticles(textures[currentImageIndex]);

  window.AIM_VIS1_READY = true;

  window.dispatchEvent(
    new CustomEvent('aimVisualReady', {
      detail: { id: 'vis-1' },
    })
  );


} catch (error) {
  console.error("Vis 1 setup failed:", error);
}
    },

enter(app, progress = {}) {
  isActive = true;
  addListeners();

  if (!points && texturesLoaded) {
    buildParticles(textures[currentImageIndex]);
  }

  if (points) {
    points.visible = true;
  }

  if (!initialIntroStarted) {
    startInitialIntroOnce();
  } else {
    resetToDisplayPhase();
  }
},

update(app, progress) {
      const exitProgress = progress.exitProgress || 0;

      scrollOutroProgress = clamp01(exitProgress);

      const section = document.getElementById("vis-1");
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportH = window.innerHeight || 1;

      const totalScrollable = Math.max(rect.height - viewportH, 1);
      const travelled =
        rect.top >= 0 ? 0 : clamp01(Math.abs(rect.top) / totalScrollable);

      scrollMainProgress = travelled;
      msStarfieldProgress = getMsStarfieldEffect(scrollMainProgress);

      updateImageCyclePause();
      updateTopReturnTrigger();
    },

    tick() {
      if (!isActive || !points || !material) return;

      const nowMs = getNowMs();
      const nowSeconds = nowMs / 1000;

      fadeMousePaint();
      paintMouseShape();

      updatePulse(nowMs);
      updatePointerState(nowMs);
      updateMaterialUniforms(nowSeconds);
      updateTransitionState(nowMs);
      updatePointRotations();
    },

    exit() {
      isActive = false;
      removeListeners();

      if (points) {
        points.visible = false;
      }
    },

    destroy() {
      disposePoints();
    },

    resize() {
      if (hasStoredPointerPosition()) {
        updateRawPointerTargets(lastPointerClientX, lastPointerClientY);
      }

      if (texturesLoaded && isActive) {
        buildParticles(textures[currentImageIndex]);
      }
    }
  };
})();

window.AIM.register("vis-1", Vis1);
})();
