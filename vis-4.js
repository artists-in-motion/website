//console.log("Vis 4 - SAT 20th JUN v1");
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

  // === IMAGE URLS === //
  // Uses global AIM image helper
  // Second value = max number of images / No second value to return all images
  // Example window.AIM.getImageUrls('.urls', 6); / will fetch 6 images
  const IMAGE_URLS = window.AIM.getImageUrls('.image-urls');

  let CONFIG = {
    // === POSITION / SCALE ===
    VISUAL_SCALE: 0.25, // Overall scale of the entire globe system.

    CUBE_POSITION_X: 3.5, // Globe position offset X.
    CUBE_POSITION_Y: 0.0, // Globe position offset Y.
    CUBE_POSITION_Z: 0.0, // Globe position offset Z.

    // === GLOBE STRUCTURE ===
    GLOBE_RADIUS: 2.0, // Globe radius.
    GLOBE_ROWS: 16, // Fixed latitude row count.
    GLOBE_COLUMNS: 32, // Fixed longitude column count.

    // === TILE LAYOUT ===
    GLOBE_TILE_3X3_COUNT: 12, // Number of large 3x3 tiles. Try 0 to 8.
    GLOBE_TILE_2X2_COUNT: 8, // Number of medium 2x2 tiles. Try 4 to 20.
    GLOBE_TILE_1X1_DENSITY: 0.9, // Percentage of remaining cells used as 1x1 tiles. Try 0.35 to 0.9.

    // === TILE OFFSET ===
    GLOBE_TILE_OFFSET_MIN: 0.4, // Minimum outward offset.
    GLOBE_TILE_OFFSET_MAX: 2.2, // Maximum outward offset.
    GLOBE_TILE_OFFSET_LEVELS: 8, // Number of evenly distributed offset depth levels.
    GLOBE_TILE_OFFSET_JITTER: 0.08, // Small random variation added to each offset level.

    // === TILE LATITUDE LIMITS ===
    GLOBE_TILE_3X3_ROW_PADDING: 0.35, // Excludes top/bottom percentage for 3x3 placement.
    GLOBE_TILE_2X2_ROW_PADDING: 0.25, // Excludes top/bottom percentage for 2x2 placement.
    GLOBE_TILE_1X1_ROW_PADDING: 0.1, // Excludes top/bottom percentage for 1x1 placement.

    // === TILE SHAPE ===
    TILE_GAP_LAT: 0.02, // Vertical tile gap.
    TILE_GAP_LON: 0.02, // Horizontal tile gap.
    SURFACE_EXTRUSION: 0.05, // Tile thickness.
    SURFACE_SEGMENTS_X: 5, // Curved surface subdivisions horizontally.
    SURFACE_SEGMENTS_Y: 5, // Curved surface subdivisions vertically.
    BUILT_CUBE_SCALE: 1.0, // Final tile scale once assembled.

    // === TILE SIDE MATERIAL ===
    CUBE_SIDE_COLOR: new THREE.Color(0x333333), // Side wall colour.
    CUBE_SIDE_OPACITY: 0.6, // Side wall opacity.

    // === GLOBE DEPTH SHADING ===
    GLOBE_REAR_FADE_START: 0.05, // Rear fade start threshold.
    GLOBE_REAR_FADE_END: 0.3, // Rear fade end threshold.
    GLOBE_REAR_OPACITY: 1.0, // Rear-side opacity multiplier.
    GLOBE_REAR_BRIGHTNESS: 0.02, // Rear-side brightness multiplier.

    // === STATIC GLOBE ROTATION ===
    RUBIK_ROT_X: 0.0, // Permanent globe rotation X.
    RUBIK_ROT_Y: 0.0, // Permanent globe rotation Y.
    RUBIK_ROT_Z: 0.0, // Permanent globe rotation Z.

    // === FLOAT CUBES ===
    FLOAT_CUBE_COUNT: 1000, // Number of floating cubes.

    FLOAT_SPREAD_X: 26.5, // Float field width.
    FLOAT_SPREAD_Y: 8.5, // Float field height.
    FLOAT_SPREAD_Z: 9.5, // Float field depth.

    FLOAT_CLEAR_RADIUS: 2.4, // Empty space around the globe.

    FLOAT_MIN_SCALE: 0.005, // Minimum float cube scale.
    FLOAT_MAX_SCALE: 0.015, // Maximum float cube scale.

    FLOAT_OPACITY: 1.0, // Overall float cube opacity.

    FLOAT_NEAR_DISTANCE: 2.0, // Near distance for colour fade.
    FLOAT_FAR_DISTANCE: 7.0, // Far distance for colour fade.

    FLOAT_NEAR_COLOR: new THREE.Color(0xffffff), // Near float cube colour.
    FLOAT_FAR_COLOR: new THREE.Color(0x666666), // Far float cube colour.

    // === INTERACTION ROTATION ===
    DEFAULT_ROT_X: -0.82, // Default resting rotation X.
    DEFAULT_ROT_Y: -0.18, // Default resting rotation Y.
    DEFAULT_ROT_Z: -0.08, // Default resting rotation Z.

    MOUSE_ROT_X: 0.18, // Mouse influence rotation X.
    MOUSE_ROT_Y: 0.28, // Mouse influence rotation Y.
    MOUSE_ROT_Z: 0.05, // Mouse influence rotation Z.

    ROTATION_LERP: 0.08, // Rotation smoothing strength.

    SCROLL_ROT_X: 0.25, // Scroll-driven rotation X.
    SCROLL_ROT_Y: 1.2, // Scroll-driven rotation Y.
    SCROLL_ROT_Z: 0.0, // Scroll-driven rotation Z.

    ROT_SPEED_TI: 4.0, // Extra rotation speed during TI.
    ROT_SPEED_MS: 1.0, // Rotation speed during MS.
    ROT_SPEED_TO: 4.0, // Extra rotation speed during TO.

    // === MATERIAL RESPONSE ===
    ROUGHNESS: 0.72, // Surface roughness.

    METALNESS: 0.06, // Surface metalness.
  };

  CONFIG = app.getVisualConfig?.('vis-4', CONFIG) || CONFIG;
    
  const TRANSITION = {
    TI: 100,
    TO: 100,

    TI_CUBE_FADE_START: 0,
    TI_CUBE_FADE_END: 100,

    TI_FLOAT_END: 80,
    TI_FLOAT_FROM_DISTANCE: 8.0,
    TI_FLOAT_Y_VARIANCE: 0.5,

    TI_GLOBE_START: 0,
    TI_GLOBE_END: 100,
    TI_GLOBE_DELAY_MAX: 0.35,
    TI_GLOBE_DURATION_MIN: 0.55,
    TI_GLOBE_DURATION_MAX: 0.9,
    TI_EASE_POWER: 1.1,

    GLOBE_START_DISTANCE_MIN: 0.0,
    GLOBE_START_DISTANCE_MAX: 3.0,
    GLOBE_START_TANGENT_VARIANCE: 0.7,
    GLOBE_START_ROT_VARIANCE: 1.2,

    ROT_START: 0,
    ROT_END: 100,

    FLOAT_TO_PULL_STRENGTH: 0.35,
    FLOAT_TO_MOVE_START: 0,
    FLOAT_TO_MOVE_END: 65,

    TO_RUBIK_BREAK_START: 10,
    TO_RUBIK_MOVE_END: 50,
    TO_FADE_END: 100,

    RUBIK_OUT_DISTANCE_MIN: 0.3,
    RUBIK_OUT_DISTANCE_MAX: 1.0,
    RUBIK_OUT_TANGENT_VARIANCE: 1.2,
    RUBIK_FIELD_Y_BIAS: 0.5,
    RUBIK_TO_STAGGER_MAX: 0.22,
    RUBIK_FIELD_ROT_VARIANCE: 1.2,
    TO_MOUSE_REDUCTION: 1.0,
  };

  const Vis4 = (() => {
    const masterGroup = new THREE.Group();
    const pivotGroup = new THREE.Group();
    const rubikRotationGroup = new THREE.Group();
    const cubeGroup = new THREE.Group();
    const floatGroup = new THREE.Group();

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    const light1 = new THREE.PointLight(0xffffff, 8.5, 30, 2);
    const light2 = new THREE.PointLight(0xffffff, 4.5, 30, 2);

    light1.position.set(-3, 2.5, 4.2);
    light2.position.set(3, -2, 4.2);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    let textures = [];
    let cubelets = [];
    let imagePickIndex = 0;
    let shuffledImageIndexes = [];

    let floatingData = [];
    let floatingInstancedMesh = null;
    let floatingMaterial = null;
    let floatingGeometry = null;
    let floatingAlphaArray = null;

    const tempObject = new THREE.Object3D();
    const tempPosition = new THREE.Vector3();
    const tempTangent = new THREE.Vector3();
    const tempTangentB = new THREE.Vector3();

    const tempCubeWorldPosition = new THREE.Vector3();
    const tempGlobeWorldPosition = new THREE.Vector3();
    const tempCubeViewPosition = new THREE.Vector3();
    const tempGlobeViewPosition = new THREE.Vector3();
    const tempColor = new THREE.Color();
    const whiteColor = new THREE.Color(0xffffff);

    let tiProgress = 0;
    let msProgress = 0;
    let toProgress = 0;
    let fullProgress = 0;

    let sectionEl = null;

    let isActive = false;
    let isBuilt = false;

    const mouse = { x: 0, y: 0 };
    const smoothMouse = { x: 0, y: 0 };

    const currentRotation = {
      x: CONFIG.DEFAULT_ROT_X,
      y: CONFIG.DEFAULT_ROT_Y,
      z: CONFIG.DEFAULT_ROT_Z,
    };

    const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

    function pct(v) {
      return v / 100;
    }

    function degToRad(v) {
      return (v * Math.PI) / 180;
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function mapRange(v, inMin, inMax, outMin, outMax) {
      const t = clamp01((v - inMin) / Math.max(inMax - inMin, 0.0001));
      return outMin + (outMax - outMin) * t;
    }

    function smoothstep(edge0, edge1, x) {
      const t = clamp01((x - edge0) / Math.max(edge1 - edge0, 0.0001));
      return t * t * (3 - 2 * t);
    }

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function randomRange(min, max) {
      return min + Math.random() * (max - min);
    }

    function randomOnSphere(radius) {
      const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);

      if (v.lengthSq() < 0.0001) v.set(0, 1, 0);

      return v.normalize().multiplyScalar(radius);
    }

    function latLonToSphere(lat, lon, radius) {
      const phi = degToRad(90 - lat);
      const theta = degToRad(lon + 180);

      return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
    }

    function makeGlobeStartPosition(builtPosition) {
      const normal = builtPosition.clone().normalize();

      const distance = randomRange(TRANSITION.GLOBE_START_DISTANCE_MIN, TRANSITION.GLOBE_START_DISTANCE_MAX);

      const startPosition = builtPosition.clone().addScaledVector(normal, distance);

      tempTangent.set(-normal.z, 0, normal.x);

      if (tempTangent.lengthSq() < 0.0001) {
        tempTangent.set(0, -normal.z, normal.y);
      }

      tempTangent.normalize();
      tempTangentB.crossVectors(normal, tempTangent).normalize();

      startPosition.addScaledVector(tempTangent, (Math.random() - 0.5) * TRANSITION.GLOBE_START_TANGENT_VARIANCE);

      startPosition.addScaledVector(tempTangentB, (Math.random() - 0.5) * TRANSITION.GLOBE_START_TANGENT_VARIANCE);

      return startPosition;
    }

    function makeOffsetBuiltPosition(builtPosition, candidate) {
      const normal = builtPosition.clone().normalize();

      const levelT = Math.max(candidate.offsetT || 0, candidate.minOffsetLevelBySize || 0);

      const jitter = randomRange(-CONFIG.GLOBE_TILE_OFFSET_JITTER, CONFIG.GLOBE_TILE_OFFSET_JITTER);

      const offsetAmount = lerp(CONFIG.GLOBE_TILE_OFFSET_MIN, CONFIG.GLOBE_TILE_OFFSET_MAX, levelT) + jitter;

      const clampedOffset = Math.min(Math.max(offsetAmount, CONFIG.GLOBE_TILE_OFFSET_MIN), CONFIG.GLOBE_TILE_OFFSET_MAX);

      return builtPosition.clone().addScaledVector(normal, clampedOffset);
    }

    function makeStartQuaternion(builtQuaternion) {
      const randomRotation = new THREE.Euler((Math.random() - 0.5) * TRANSITION.GLOBE_START_ROT_VARIANCE, (Math.random() - 0.5) * TRANSITION.GLOBE_START_ROT_VARIANCE, (Math.random() - 0.5) * TRANSITION.GLOBE_START_ROT_VARIANCE);

      const q = new THREE.Quaternion().setFromEuler(randomRotation);
      return builtQuaternion.clone().multiply(q);
    }

    function makeGlobeTiming() {
      const delay = Math.random() * TRANSITION.TI_GLOBE_DELAY_MAX;
      const maxDuration = Math.max(0.0001, 1 - delay);

      const duration = Math.min(randomRange(TRANSITION.TI_GLOBE_DURATION_MIN, TRANSITION.TI_GLOBE_DURATION_MAX), maxDuration);

      return {
        delay,
        duration: Math.max(0.0001, duration),
      };
    }

    function getDelayedProgress(progress, delay, duration) {
      return clamp01((progress - delay) / Math.max(duration, 0.0001));
    }

    function makeFieldPosition() {
      let position = null;

      for (let i = 0; i < 60; i++) {
        position = new THREE.Vector3((Math.random() - 0.5) * CONFIG.FLOAT_SPREAD_X, (Math.random() - 0.5) * CONFIG.FLOAT_SPREAD_Y, (Math.random() - 0.5) * CONFIG.FLOAT_SPREAD_Z);

        if (position.length() >= CONFIG.FLOAT_CLEAR_RADIUS) return position;
      }

      if (!position || position.lengthSq() < 0.0001) {
        position = randomOnSphere(CONFIG.FLOAT_CLEAR_RADIUS);
      }

      return position.normalize().multiplyScalar(CONFIG.FLOAT_CLEAR_RADIUS);
    }

    function makeFloatIntroPosition(finalPosition) {
      const introDirection = finalPosition.clone();

      if (introDirection.lengthSq() < 0.0001) {
        introDirection.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      }

      introDirection.normalize();

      const introPosition = finalPosition.clone().addScaledVector(introDirection, TRANSITION.TI_FLOAT_FROM_DISTANCE);

      introPosition.y += (Math.random() - 0.5) * TRANSITION.TI_FLOAT_Y_VARIANCE;

      return introPosition;
    }

    function makeFloatToTarget(finalPosition) {
      const outward = finalPosition.clone();

      if (outward.lengthSq() < 0.0001) {
        outward.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      }

      outward.normalize();

      const target = finalPosition.clone().addScaledVector(outward, randomRange(0.4, 1.4));

      target.y += (Math.random() - 0.5) * 0.45;

      if (target.length() < CONFIG.FLOAT_CLEAR_RADIUS) {
        target.copy(outward).multiplyScalar(CONFIG.FLOAT_CLEAR_RADIUS);
      }

      return target;
    }

    function makeRubikFieldPosition(sourcePosition) {
      const outward = sourcePosition.clone();

      if (outward.lengthSq() < 0.0001) {
        outward.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      }

      outward.normalize();

      const distance = randomRange(TRANSITION.RUBIK_OUT_DISTANCE_MIN, TRANSITION.RUBIK_OUT_DISTANCE_MAX);

      const target = sourcePosition.clone().addScaledVector(outward, distance);

      tempTangent.set(-outward.z, 0, outward.x);

      if (tempTangent.lengthSq() < 0.0001) {
        tempTangent.set(0, -outward.z, outward.y);
      }

      tempTangent.normalize();
      tempTangentB.crossVectors(outward, tempTangent).normalize();

      target.addScaledVector(tempTangent, (Math.random() - 0.5) * TRANSITION.RUBIK_OUT_TANGENT_VARIANCE);

      target.addScaledVector(tempTangentB, (Math.random() - 0.5) * TRANSITION.RUBIK_OUT_TANGENT_VARIANCE);

      target.y += (Math.random() - 0.5) * TRANSITION.RUBIK_FIELD_Y_BIAS;

      return target;
    }

    function makeFieldScale() {
      return CONFIG.FLOAT_MIN_SCALE + Math.random() * (CONFIG.FLOAT_MAX_SCALE - CONFIG.FLOAT_MIN_SCALE);
    }

    function makeFieldQuaternion() {
      return new THREE.Quaternion().setFromEuler(new THREE.Euler((Math.random() - 0.5) * TRANSITION.RUBIK_FIELD_ROT_VARIANCE, (Math.random() - 0.5) * TRANSITION.RUBIK_FIELD_ROT_VARIANCE, (Math.random() - 0.5) * TRANSITION.RUBIK_FIELD_ROT_VARIANCE));
    }

    function getCubeRearFade(cubelet) {
      if (!app.camera) return 0;

      cubelet.getWorldPosition(tempCubeWorldPosition);
      cubeGroup.getWorldPosition(tempGlobeWorldPosition);

      tempCubeViewPosition.copy(tempCubeWorldPosition).applyMatrix4(app.camera.matrixWorldInverse);

      tempGlobeViewPosition.copy(tempGlobeWorldPosition).applyMatrix4(app.camera.matrixWorldInverse);

      const rearDepth = tempGlobeViewPosition.z - tempCubeViewPosition.z;

      return smoothstep(CONFIG.GLOBE_REAR_FADE_START, CONFIG.GLOBE_REAR_FADE_END, rearDepth);
    }

    function applyGlobeShading(cubelet, baseOpacity) {
      const rearFade = getCubeRearFade(cubelet);

      const opacity = baseOpacity * THREE.MathUtils.lerp(1, CONFIG.GLOBE_REAR_OPACITY, rearFade);

      const brightness = THREE.MathUtils.lerp(1, CONFIG.GLOBE_REAR_BRIGHTNESS, rearFade);

      const materials = Array.isArray(cubelet.material) ? cubelet.material : [cubelet.material];

      materials.forEach((mat, index) => {
        mat.opacity = index === 0 ? opacity : opacity * CONFIG.CUBE_SIDE_OPACITY;

        if (index === 0) {
          tempColor.copy(whiteColor).multiplyScalar(brightness);
          mat.color.copy(tempColor);
        } else {
          tempColor.copy(CONFIG.CUBE_SIDE_COLOR).multiplyScalar(brightness);
          mat.color.copy(tempColor);
        }
      });
    }

    function loadTexture(url) {
      return new Promise((resolve, reject) => {
        loader.load(
          url,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.repeat.set(1, 1);
            texture.offset.set(0, 0);
            texture.needsUpdate = true;
            resolve(texture);
          },
          undefined,
          reject,
        );
      });
    }

    async function loadTextures() {
      textures = await Promise.all(IMAGE_URLS.map((url) => loadTexture(url)));
    }

    function getCoverCrop(texture, targetAspect = 1) {
      const image = texture.image;
      const imageAspect = image.width / image.height;

      if (imageAspect > targetAspect) {
        const scaleX = targetAspect / imageAspect;

        return {
          scaleX,
          scaleY: 1,
          offsetX: (1 - scaleX) * 0.5,
          offsetY: 0,
        };
      }

      const scaleY = imageAspect / targetAspect;

      return {
        scaleX: 1,
        scaleY,
        offsetX: 0,
        offsetY: (1 - scaleY) * 0.5,
      };
    }

    function cloneTexturePatch(texture, patchSize, patchX, patchY, targetAspect = 1) {
      const t = texture.clone();

      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = THREE.ClampToEdgeWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;

      const crop = getCoverCrop(texture, targetAspect);

      const patchScaleX = crop.scaleX / patchSize;
      const patchScaleY = crop.scaleY / patchSize;

      t.repeat.set(-patchScaleX, -patchScaleY);

      t.offset.set(crop.offsetX + (patchX + 1) * patchScaleX, crop.offsetY + crop.scaleY - patchY * patchScaleY);

      t.needsUpdate = true;

      return t;
    }

    function makeImageMaterial(texture, patchSize = 1, patchX = 0, patchY = 0, targetAspect = 1) {
      return new THREE.MeshStandardMaterial({
        map: cloneTexturePatch(texture, patchSize, patchX, patchY, targetAspect),
        transparent: true,
        opacity: 1,
        roughness: CONFIG.ROUGHNESS,
        metalness: CONFIG.METALNESS,
        depthWrite: true,
        depthTest: true,
        side: THREE.DoubleSide,
      });
    }

    function makeSideMaterial() {
      return new THREE.MeshStandardMaterial({
        color: CONFIG.CUBE_SIDE_COLOR,
        transparent: true,
        opacity: CONFIG.CUBE_SIDE_OPACITY,
        roughness: CONFIG.ROUGHNESS,
        metalness: CONFIG.METALNESS,
        depthWrite: true,
        depthTest: true,
        side: THREE.DoubleSide,
      });
    }

    function makeFaceMaterials(patch, candidate) {
      const texture = textures[patch.imageIndex];

      const latHeight = Math.abs(candidate.latTop - candidate.latBottom);
      const lonWidth = Math.abs(candidate.lonRight - candidate.lonLeft);

      const targetAspect = lonWidth / Math.max(latHeight, 0.0001);

      return [makeImageMaterial(texture, patch.size, patch.x, patch.y, targetAspect), makeSideMaterial()];
    }

    function setMaterialOpacity(mesh, opacity) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

      materials.forEach((mat) => {
        mat.opacity = opacity;
      });
    }

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }

      return array;
    }

    const recentImageIndexes = [];
    const RECENT_IMAGE_LIMIT = 6;

    function getNextImageIndex() {
      if (shuffledImageIndexes.length === 0 || imagePickIndex >= shuffledImageIndexes.length) {
        shuffledImageIndexes = textures.map((_, index) => index);
        shuffleArray(shuffledImageIndexes);
        imagePickIndex = 0;
      }

      let imageIndex = shuffledImageIndexes[imagePickIndex];
      let attempts = 0;

      while (recentImageIndexes.includes(imageIndex) && attempts < shuffledImageIndexes.length) {
        imagePickIndex = (imagePickIndex + 1) % shuffledImageIndexes.length;
        imageIndex = shuffledImageIndexes[imagePickIndex];
        attempts++;
      }

      imagePickIndex++;

      recentImageIndexes.push(imageIndex);
      if (recentImageIndexes.length > RECENT_IMAGE_LIMIT) {
        recentImageIndexes.shift();
      }

      return imageIndex;
    }

    function getSpatialImageIndex(row, col, size, imageGrid) {
      if (!textures.length) return 0;

      const blocked = new Set();

      for (let y = row - 2; y <= row + size + 1; y++) {
        if (y < 0 || y >= imageGrid.length) continue;

        for (let x = col - 2; x <= col + size + 1; x++) {
          const wrappedX = (x + CONFIG.GLOBE_COLUMNS) % CONFIG.GLOBE_COLUMNS;
          const existing = imageGrid[y][wrappedX];

          if (typeof existing === 'number') blocked.add(existing);
        }
      }

      const options = textures.map((_, index) => index).filter((index) => !blocked.has(index));

      if (!options.length) return Math.floor(Math.random() * textures.length);

      return options[Math.floor(Math.random() * options.length)];
    }

    function createTileFootprints(rows, cols) {
      const occupiedMap = [];
      const sizeMap = [];
      const imageGrid = [];
      const footprints = [];
      let occupiedCount = 0;

      for (let row = 0; row < rows; row++) {
        occupiedMap[row] = [];
        sizeMap[row] = [];
        imageGrid[row] = [];
      }

      function hasSameSizeNearby(row, col, size, gap) {
        for (let y = -gap; y < size + gap; y++) {
          for (let x = -gap; x < size + gap; x++) {
            const r = row + y;
            const c = (col + x + cols) % cols;

            if (r < 0 || r >= rows) continue;

            if (sizeMap[r][c] === size) return true;
          }
        }

        return false;
      }

      function canPlacePlannedFootprint(row, col, size, sameSizeGap) {
        if (row < 0 || row + size > rows) return false;

        const topCapRows = 1;
        const bottomCapStart = rows - 1;

        let capTileCount = 0;

        footprints.forEach((footprint) => {
          if (footprint.row <= 0 || footprint.row + footprint.size >= rows) {
            capTileCount++;
          }
        });

        const touchesTopCap = row <= topCapRows - 1;
        const touchesBottomCap = row + size >= bottomCapStart + 1;

        if ((touchesTopCap || touchesBottomCap) && capTileCount >= 1) return false;

        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const r = row + y;
            const c = (col + x) % cols;

            if (occupiedMap[r][c]) return false;
          }
        }

        return !hasSameSizeNearby(row, col, size, sameSizeGap);
      }

      function markFootprint(row, col, size) {
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const r = row + y;
            const c = (col + x) % cols;

            occupiedMap[r][c] = true;
            sizeMap[r][c] = size;
            occupiedCount++;
          }
        }

        const minOffsetLevelBySize = size >= 3 ? 0.45 : size >= 2 ? 0.25 : 0.0;

        const imageIndex = getSpatialImageIndex(row, col, size, imageGrid);

        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const r = row + y;
            const c = (col + x) % cols;
            imageGrid[r][c] = imageIndex;
          }
        }

        footprints.push({
          row,
          col,
          size,
          rows,
          cols,
          imageIndex,
          minOffsetLevelBySize,
          offsetT: 0,
        });
      }

      function findPlannedCell(preferredRow, preferredCol, size, sameSizeGap, minRow, maxRow) {
        const maxSearch = Math.max(rows, cols);

        for (let radius = 0; radius < maxSearch; radius++) {
          for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
              const row = preferredRow + y;
              const col = (preferredCol + x + cols) % cols;

              if (row < minRow || row > maxRow) continue;

              if (canPlacePlannedFootprint(row, col, size, sameSizeGap)) {
                return { row, col };
              }
            }
          }
        }

        return null;
      }

      function placeDistributedSize(size, count, rowMinT, rowMaxT, jitterT, sameSizeGap) {
        if (count <= 0) return;

        const safeRows = rows - size;
        const minRow = Math.floor(safeRows * rowMinT);
        const maxRow = Math.floor(safeRows * rowMaxT);
        const spacing = cols / count;
        const phase = Math.random() * spacing;

        for (let i = 0; i < count; i++) {
          const baseCol = phase + i * spacing;
          const jitter = (Math.random() - 0.5) * spacing * jitterT;

          const col = Math.round(baseCol + jitter + cols) % cols;
          const row = Math.round(randomRange(minRow, maxRow));

          const cell = findPlannedCell(row, col, size, sameSizeGap, minRow, maxRow);
          if (!cell) continue;

          markFootprint(cell.row, cell.col, size);
        }
      }

      function assignBalancedOffsets() {
        const levels = [];

        for (let i = 0; i < footprints.length; i++) {
          const levelIndex = i % CONFIG.GLOBE_TILE_OFFSET_LEVELS;
          const offsetT = levelIndex / Math.max(CONFIG.GLOBE_TILE_OFFSET_LEVELS - 1, 1);

          levels.push(offsetT);
        }

        shuffleArray(levels);

        footprints.forEach((footprint, index) => {
          footprint.offsetT = levels[index];
        });
      }

      placeDistributedSize(3, CONFIG.GLOBE_TILE_3X3_COUNT, CONFIG.GLOBE_TILE_3X3_ROW_PADDING, 1 - CONFIG.GLOBE_TILE_3X3_ROW_PADDING, 0.35, 1);

      placeDistributedSize(2, CONFIG.GLOBE_TILE_2X2_COUNT, CONFIG.GLOBE_TILE_2X2_ROW_PADDING, 1 - CONFIG.GLOBE_TILE_2X2_ROW_PADDING, 0.45, 1);

      const remainingCells = rows * cols - occupiedCount;

      const smallCount = Math.floor(remainingCells * CONFIG.GLOBE_TILE_1X1_DENSITY);

      placeDistributedSize(1, smallCount, CONFIG.GLOBE_TILE_1X1_ROW_PADDING, 1 - CONFIG.GLOBE_TILE_1X1_ROW_PADDING, 0.65, 1);

      assignBalancedOffsets();

      return footprints;
    }

    function makeGlobeCandidates() {
      const candidates = [];
      const rows = CONFIG.GLOBE_ROWS;
      const cols = CONFIG.GLOBE_COLUMNS;
      const footprints = createTileFootprints(rows, cols);

      footprints.forEach((footprint) => {
        const row = footprint.row;
        const col = footprint.col;
        const size = footprint.size;

        const latTop = 90 - (row / rows) * 180;
        const latBottom = 90 - ((row + size) / rows) * 180;
        const latCenter = (latTop + latBottom) * 0.5;

        const lonLeft = -180 + (col / cols) * 360;
        const lonRight = -180 + ((col + size) / cols) * 360;
        const lonCenter = (lonLeft + lonRight) * 0.5;

        candidates.push({
          row,
          col,
          size,
          rows,
          cols,
          imageIndex: footprint.imageIndex,
          latTop,
          latBottom,
          latCenter,
          lonLeft,
          lonRight,
          lonCenter,
          offsetT: footprint.offsetT,
          minOffsetLevelBySize: footprint.minOffsetLevelBySize,
        });
      });

      return candidates;
    }

    function makeSphericalTileGeometry(candidate) {
      const geometry = new THREE.BufferGeometry();

      const positions = [];
      const uvs = [];
      const indices = [];

      const center = latLonToSphere(candidate.latCenter, candidate.lonCenter, CONFIG.GLOBE_RADIUS);

      const latTop = lerp(candidate.latCenter, candidate.latTop, 1 - CONFIG.TILE_GAP_LAT);
      const latBottom = lerp(candidate.latCenter, candidate.latBottom, 1 - CONFIG.TILE_GAP_LAT);
      const lonLeft = lerp(candidate.lonCenter, candidate.lonLeft, 1 - CONFIG.TILE_GAP_LON);
      const lonRight = lerp(candidate.lonCenter, candidate.lonRight, 1 - CONFIG.TILE_GAP_LON);

      const outerRadius = CONFIG.GLOBE_RADIUS + CONFIG.SURFACE_EXTRUSION * 0.5;
      const innerRadius = CONFIG.GLOBE_RADIUS - CONFIG.SURFACE_EXTRUSION * 0.5;

      function addSurface(radius) {
        for (let y = 0; y <= CONFIG.SURFACE_SEGMENTS_Y; y++) {
          const v = y / CONFIG.SURFACE_SEGMENTS_Y;
          const lat = lerp(latTop, latBottom, v);

          for (let x = 0; x <= CONFIG.SURFACE_SEGMENTS_X; x++) {
            const u = x / CONFIG.SURFACE_SEGMENTS_X;
            const lon = lerp(lonLeft, lonRight, u);

            const p = latLonToSphere(lat, lon, radius).sub(center);

            positions.push(p.x, p.y, p.z);
            uvs.push(1 - u, v);
          }
        }
      }

      addSurface(outerRadius);

      for (let y = 0; y < CONFIG.SURFACE_SEGMENTS_Y; y++) {
        for (let x = 0; x < CONFIG.SURFACE_SEGMENTS_X; x++) {
          const a = y * (CONFIG.SURFACE_SEGMENTS_X + 1) + x;
          const b = a + 1;
          const c = a + CONFIG.SURFACE_SEGMENTS_X + 1;
          const d = c + 1;

          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }

      const frontCount = indices.length;
      const backOffset = positions.length / 3;

      addSurface(innerRadius);

      const sideStart = indices.length;

      for (let y = 0; y < CONFIG.SURFACE_SEGMENTS_Y; y++) {
        for (let x = 0; x < CONFIG.SURFACE_SEGMENTS_X; x++) {
          const a = backOffset + y * (CONFIG.SURFACE_SEGMENTS_X + 1) + x;
          const b = a + 1;
          const c = a + CONFIG.SURFACE_SEGMENTS_X + 1;
          const d = c + 1;

          indices.push(a, c, b);
          indices.push(b, c, d);
        }
      }

      function addSide(frontA, frontB, backA, backB) {
        indices.push(frontA, backA, frontB);
        indices.push(frontB, backA, backB);
      }

      for (let x = 0; x < CONFIG.SURFACE_SEGMENTS_X; x++) {
        const topFrontA = x;
        const topFrontB = x + 1;
        const topBackA = backOffset + x;
        const topBackB = backOffset + x + 1;

        addSide(topFrontA, topFrontB, topBackA, topBackB);

        const bottomFrontA = CONFIG.SURFACE_SEGMENTS_Y * (CONFIG.SURFACE_SEGMENTS_X + 1) + x;
        const bottomFrontB = bottomFrontA + 1;
        const bottomBackA = backOffset + bottomFrontA;
        const bottomBackB = backOffset + bottomFrontB;

        addSide(bottomFrontB, bottomFrontA, bottomBackB, bottomBackA);
      }

      for (let y = 0; y < CONFIG.SURFACE_SEGMENTS_Y; y++) {
        const leftFrontA = y * (CONFIG.SURFACE_SEGMENTS_X + 1);
        const leftFrontB = (y + 1) * (CONFIG.SURFACE_SEGMENTS_X + 1);
        const leftBackA = backOffset + leftFrontA;
        const leftBackB = backOffset + leftFrontB;

        addSide(leftFrontB, leftFrontA, leftBackB, leftBackA);

        const rightFrontA = leftFrontA + CONFIG.SURFACE_SEGMENTS_X;
        const rightFrontB = leftFrontB + CONFIG.SURFACE_SEGMENTS_X;
        const rightBackA = backOffset + rightFrontA;
        const rightBackB = backOffset + rightFrontB;

        addSide(rightFrontA, rightFrontB, rightBackA, rightBackB);
      }

      geometry.setIndex(indices);
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

      geometry.clearGroups();
      geometry.addGroup(0, frontCount, 0);
      geometry.addGroup(sideStart, indices.length - sideStart, 1);

      geometry.computeVertexNormals();

      return {
        geometry,
        center,
      };
    }

    function buildCubelets() {
      const rows = CONFIG.GLOBE_ROWS;
      const cols = CONFIG.GLOBE_COLUMNS;
      const candidates = makeGlobeCandidates();

      candidates.forEach((candidate) => {
        const patch = {
          imageIndex: candidate.imageIndex,
          size: 1,
          x: 0,
          y: 0,
        };

        const built = makeSphericalTileGeometry(candidate);

        const cubelet = new THREE.Mesh(built.geometry, makeFaceMaterials(patch, candidate));
        cubelet.renderOrder = 0;

        const builtPosition = built.center.clone();
        const settledPosition = makeOffsetBuiltPosition(builtPosition, candidate);
        const builtQuaternion = new THREE.Quaternion();
        const builtScale = CONFIG.BUILT_CUBE_SCALE;

        const startPosition = makeGlobeStartPosition(builtPosition);
        const startQuaternion = makeStartQuaternion(builtQuaternion);
        const fieldScale = makeFieldScale();
        const timing = makeGlobeTiming();

        cubelet.position.copy(startPosition);
        cubelet.quaternion.copy(startQuaternion);
        cubelet.scale.setScalar(fieldScale);

        cubelet.userData.baseGrid = { x: 0, y: 0, z: 0 };
        cubelet.userData.grid = { x: 0, y: 0, z: 0 };

        cubelet.userData.builtPosition = builtPosition.clone();
        cubelet.userData.settledPosition = settledPosition.clone();
        cubelet.userData.builtQuaternion = builtQuaternion.clone();
        cubelet.userData.builtScale = builtScale;

        cubelet.userData.startPosition = startPosition.clone();
        cubelet.userData.startQuaternion = startQuaternion.clone();
        cubelet.userData.startScale = fieldScale;

        cubelet.userData.fieldPosition = makeRubikFieldPosition(builtPosition);
        cubelet.userData.fieldScale = fieldScale;
        cubelet.userData.fieldQuaternion = makeFieldQuaternion();
        cubelet.userData.toStagger = Math.random() * TRANSITION.RUBIK_TO_STAGGER_MAX;

        cubelet.userData.pullDelay = timing.delay;
        cubelet.userData.pullDuration = timing.duration;

        setMaterialOpacity(cubelet, 0);

        cubeGroup.add(cubelet);
        cubelets.push(cubelet);
      });
    }

    function applyGlobeBuiltState() {
      cubelets.forEach((cubelet) => {
        cubelet.position.copy(cubelet.userData.settledPosition);
        cubelet.quaternion.copy(cubelet.userData.builtQuaternion);
        cubelet.scale.setScalar(cubelet.userData.builtScale);
        cubelet.userData.grid = { ...cubelet.userData.baseGrid };
        applyGlobeShading(cubelet, 1);
      });
    }

    function makeFloatingShaderMaterial() {
      return new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true,
        uniforms: {
          uOpacity: { value: 0 },
          uNearColor: { value: CONFIG.FLOAT_NEAR_COLOR },
          uFarColor: { value: CONFIG.FLOAT_FAR_COLOR },
          uNearDistance: { value: CONFIG.FLOAT_NEAR_DISTANCE },
          uFarDistance: { value: CONFIG.FLOAT_FAR_DISTANCE },
        },
        vertexShader: `
        uniform float uNearDistance;
        uniform float uFarDistance;

        attribute float aInstanceAlpha;

        varying float vDistanceMix;
        varying float vInstanceAlpha;

        void main() {
          vec4 instanceCenter = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float d = length(instanceCenter.xyz);

          vDistanceMix = smoothstep(
            uNearDistance,
            uFarDistance,
            d
          );

          vInstanceAlpha = aInstanceAlpha;

          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
        fragmentShader: `
        uniform float uOpacity;
        uniform vec3 uNearColor;
        uniform vec3 uFarColor;

        varying float vDistanceMix;
        varying float vInstanceAlpha;

        void main() {
          vec3 color = mix(uNearColor, uFarColor, vDistanceMix);
          gl_FragColor = vec4(color, uOpacity * vInstanceAlpha);
        }
      `,
      });
    }

    function setFloatingInstance(index, position, scale, rotation) {
      tempObject.position.copy(position);
      tempObject.rotation.copy(rotation);
      tempObject.scale.setScalar(scale);
      tempObject.updateMatrix();

      floatingInstancedMesh.setMatrixAt(index, tempObject.matrix);
    }

    function setFloatingAlpha(index, alpha) {
      if (!floatingAlphaArray) return;
      floatingAlphaArray[index] = alpha;
    }

    function updateFloatingMaterialOpacity(opacity) {
      if (!floatingMaterial) return;
      floatingMaterial.uniforms.uOpacity.value = opacity;
    }

    function commitFloatingInstances() {
      if (!floatingInstancedMesh) return;

      floatingInstancedMesh.instanceMatrix.needsUpdate = true;

      const alphaAttr = floatingInstancedMesh.geometry.getAttribute('aInstanceAlpha');
      if (alphaAttr) alphaAttr.needsUpdate = true;
    }

    function buildFloatingCubes() {
      floatingGeometry = new THREE.BoxGeometry(1, 1, 1);
      floatingMaterial = makeFloatingShaderMaterial();

      floatingInstancedMesh = new THREE.InstancedMesh(floatingGeometry, floatingMaterial, CONFIG.FLOAT_CUBE_COUNT);

      floatingInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      floatingInstancedMesh.renderOrder = 1;

      floatingAlphaArray = new Float32Array(CONFIG.FLOAT_CUBE_COUNT);

      floatingGeometry.setAttribute('aInstanceAlpha', new THREE.InstancedBufferAttribute(floatingAlphaArray, 1));

      for (let i = 0; i < CONFIG.FLOAT_CUBE_COUNT; i++) {
        const finalPosition = makeFieldPosition();
        const introPosition = makeFloatIntroPosition(finalPosition);
        const toTarget = makeFloatToTarget(finalPosition);
        const scale = makeFieldScale();

        const rotation = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

        floatingData.push({
          finalPosition,
          introPosition,
          toTarget,
          scale,
          rotation,
        });

        setFloatingInstance(i, introPosition, scale, rotation);
        setFloatingAlpha(i, 1);
      }

      updateFloatingMaterialOpacity(0);
      commitFloatingInstances();
      floatGroup.add(floatingInstancedMesh);
    }

    function updateTransitionProgress(progress = {}) {
  sectionEl = sectionEl || document.getElementById('vis-4');
  if (!sectionEl) return;

  const sectionHeight =
    progress.sectionHeight ||
    sectionEl.offsetHeight ||
    1;

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

  const tiPx = viewportHeight * (TRANSITION.TI / 100);
  const toPx = viewportHeight * (TRANSITION.TO / 100);

  const msStart = tiPx;
  const msEnd = sectionHeight;

  tiProgress = clamp01(localY / Math.max(tiPx, 1));
  toProgress = clamp01((localY - msEnd) / Math.max(toPx, 1));
  msProgress = clamp01((localY - msStart) / Math.max(msEnd - msStart, 1));
  fullProgress = clamp01(localY / Math.max(sectionHeight, 1));
}

    function updateFloatingCubesAtField(globalOpacity) {
      floatingData.forEach((cube, i) => {
        setFloatingInstance(i, cube.finalPosition, cube.scale, cube.rotation);
        setFloatingAlpha(i, 1);
      });

      updateFloatingMaterialOpacity(CONFIG.FLOAT_OPACITY * globalOpacity);
      commitFloatingInstances();
    }

    function updateFloatingCubesDuringTO(moveT, globalOpacity) {
      floatingData.forEach((cube, i) => {
        const pullT = easeInOutCubic(moveT) * TRANSITION.FLOAT_TO_PULL_STRENGTH;

        tempPosition.lerpVectors(cube.finalPosition, cube.toTarget, pullT);

        setFloatingInstance(i, tempPosition, cube.scale, cube.rotation);
        setFloatingAlpha(i, 1);
      });

      updateFloatingMaterialOpacity(CONFIG.FLOAT_OPACITY * globalOpacity);
      commitFloatingInstances();
    }

    function applyTransitionIn() {
      const cubeFadeT = easeOutCubic(mapRange(tiProgress, pct(TRANSITION.TI_CUBE_FADE_START), pct(TRANSITION.TI_CUBE_FADE_END), 0, 1));

      const floatT = easeOutCubic(mapRange(tiProgress, 0, pct(TRANSITION.TI_FLOAT_END), 0, 1));

      const globeTimeline = mapRange(tiProgress, pct(TRANSITION.TI_GLOBE_START), pct(TRANSITION.TI_GLOBE_END), 0, 1);

      cubelets.forEach((cubelet) => {
        const delayed = getDelayedProgress(globeTimeline, cubelet.userData.pullDelay, cubelet.userData.pullDuration);

        const t = easeInOutCubic(Math.pow(delayed, TRANSITION.TI_EASE_POWER));

        cubelet.position.lerpVectors(cubelet.userData.startPosition, cubelet.userData.settledPosition, t);

        cubelet.quaternion.slerpQuaternions(cubelet.userData.startQuaternion, cubelet.userData.builtQuaternion, t);

        const scale = cubelet.userData.startScale + (cubelet.userData.builtScale - cubelet.userData.startScale) * t;

        cubelet.scale.setScalar(Math.max(scale, 0.0001));
        applyGlobeShading(cubelet, cubeFadeT);
      });

      floatingData.forEach((cube, i) => {
        tempPosition.lerpVectors(cube.introPosition, cube.finalPosition, floatT);
        setFloatingInstance(i, tempPosition, cube.scale, cube.rotation);
        setFloatingAlpha(i, 1);
      });

      updateFloatingMaterialOpacity(CONFIG.FLOAT_OPACITY * cubeFadeT);
      commitFloatingInstances();
    }

    function applyMainScroll() {
      applyGlobeBuiltState();
      updateFloatingCubesAtField(1);
    }

    function applyTransitionOut() {
      const breakupProgress = mapRange(toProgress, pct(TRANSITION.TO_RUBIK_BREAK_START), 1, 0, 1);

      const rubikRawMove = mapRange(breakupProgress, 0, pct(TRANSITION.TO_RUBIK_MOVE_END), 0, 1);

      const floatMoveT = mapRange(toProgress, pct(TRANSITION.FLOAT_TO_MOVE_START), pct(TRANSITION.FLOAT_TO_MOVE_END), 0, 1);

      const fadeT = 1 - mapRange(toProgress, 0, pct(TRANSITION.TO_FADE_END), 0, 1);

      updateFloatingCubesDuringTO(floatMoveT, fadeT);

      cubelets.forEach((cubelet) => {
        const delayed = clamp01((rubikRawMove - cubelet.userData.toStagger) / Math.max(1 - cubelet.userData.toStagger, 0.0001));

        const moveT = easeInOutCubic(Math.pow(delayed, TRANSITION.TI_EASE_POWER));

        cubelet.position.lerpVectors(cubelet.userData.settledPosition, cubelet.userData.fieldPosition, moveT);

        cubelet.quaternion.slerpQuaternions(cubelet.userData.builtQuaternion, cubelet.userData.fieldQuaternion, moveT);

        const scale = cubelet.userData.builtScale + (cubelet.userData.fieldScale - cubelet.userData.builtScale) * moveT;

        cubelet.scale.setScalar(Math.max(scale, 0.0001));
        applyGlobeShading(cubelet, fadeT);
      });
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

    function updateRotationAndTransform() {
      smoothMouse.x += (mouse.x - smoothMouse.x) * 0.1;
      smoothMouse.y += (mouse.y - smoothMouse.y) * 0.1;

      const flatten = Math.min(1, toProgress * TRANSITION.TO_MOUSE_REDUCTION);

      const mouseX = -smoothMouse.y * CONFIG.MOUSE_ROT_X * (1 - flatten);
      const mouseY = smoothMouse.x * CONFIG.MOUSE_ROT_Y * (1 - flatten);
      const mouseZ = smoothMouse.x * CONFIG.MOUSE_ROT_Z * (1 - flatten);

      const scrollRotProgress = mapRange(fullProgress, pct(TRANSITION.ROT_START), pct(TRANSITION.ROT_END), 0, 1);

      const baseScrollX = scrollRotProgress * CONFIG.SCROLL_ROT_X;
      const baseScrollY = scrollRotProgress * CONFIG.SCROLL_ROT_Y;
      const baseScrollZ = scrollRotProgress * CONFIG.SCROLL_ROT_Z;

      const tiExtraRotation = tiProgress * Math.max(CONFIG.ROT_SPEED_TI - CONFIG.ROT_SPEED_MS, 0);

      const toExtraRotation = toProgress * Math.max(CONFIG.ROT_SPEED_TO - CONFIG.ROT_SPEED_MS, 0);

      const extraRotation = tiExtraRotation + toExtraRotation;

      const axisLength = Math.sqrt(CONFIG.SCROLL_ROT_X * CONFIG.SCROLL_ROT_X + CONFIG.SCROLL_ROT_Y * CONFIG.SCROLL_ROT_Y + CONFIG.SCROLL_ROT_Z * CONFIG.SCROLL_ROT_Z) || 1;

      const axisX = CONFIG.SCROLL_ROT_X / axisLength;
      const axisY = CONFIG.SCROLL_ROT_Y / axisLength;
      const axisZ = CONFIG.SCROLL_ROT_Z / axisLength;

      const scrollX = baseScrollX + axisX * extraRotation;
      const scrollY = baseScrollY + axisY * extraRotation;
      const scrollZ = baseScrollZ + axisZ * extraRotation;

      const targetX = CONFIG.DEFAULT_ROT_X + mouseX + scrollX;
      const targetY = CONFIG.DEFAULT_ROT_Y + mouseY + scrollY;
      const targetZ = CONFIG.DEFAULT_ROT_Z + mouseZ + scrollZ;

      currentRotation.x += (targetX - currentRotation.x) * CONFIG.ROTATION_LERP;
      currentRotation.y += (targetY - currentRotation.y) * CONFIG.ROTATION_LERP;
      currentRotation.z += (targetZ - currentRotation.z) * CONFIG.ROTATION_LERP;

      pivotGroup.rotation.set(currentRotation.x, currentRotation.y, currentRotation.z);

      rubikRotationGroup.rotation.set(CONFIG.RUBIK_ROT_X, CONFIG.RUBIK_ROT_Y, CONFIG.RUBIK_ROT_Z);

      masterGroup.scale.setScalar(CONFIG.VISUAL_SCALE);
      masterGroup.position.z = 0;

      masterGroup.updateMatrixWorld(true);
    }

    function onPointerMove(e) {
      const rect = container.getBoundingClientRect();

      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    }

    function applyCurrentStateAfterLoad(progress = {}) {
      if (!isActive || !isBuilt) return;

      masterGroup.visible = true;
      updateTransitionProgress(progress);
      updateRotationAndTransform();
      applyTimeline();
    }

    return {
      async init() {
        sectionEl = document.getElementById('vis-4');

        masterGroup.visible = false;
        masterGroup.scale.setScalar(CONFIG.VISUAL_SCALE);

        pivotGroup.position.set(CONFIG.CUBE_POSITION_X, CONFIG.CUBE_POSITION_Y, CONFIG.CUBE_POSITION_Z);

        masterGroup.add(pivotGroup);

        pivotGroup.add(rubikRotationGroup);
        rubikRotationGroup.add(cubeGroup);

        pivotGroup.add(floatGroup);

        scene.add(masterGroup);
        scene.add(ambientLight);
        scene.add(light1, light2);

  try {
  await loadTextures();

  buildCubelets();
  buildFloatingCubes();

  isBuilt = true;
  applyCurrentStateAfterLoad();

  window.AIM_VIS4_READY = true;

  window.dispatchEvent(
    new CustomEvent('aimVisualReady', {
      detail: { id: 'vis-4' },
    })
  );
} catch (error) {
  console.error('Vis 4 globe texture load failed:', error);
}
      },

      enter(app, progress = {}) {
        isActive = true;

        if (isBuilt) {
          masterGroup.visible = true;
          applyCurrentStateAfterLoad(progress);
        }

        window.addEventListener('pointermove', onPointerMove);
      },

      update(app, progress = {}) {
        applyCurrentStateAfterLoad(progress);
      },

      tick(app, progress = {}) {
        if (!isActive || !isBuilt) return;

        updateTransitionProgress(progress);
        updateRotationAndTransform();
        applyTimeline();
      },

      exit() {
        isActive = false;
        masterGroup.visible = false;

        window.removeEventListener('pointermove', onPointerMove);
      },

      resize(app, progress = {}) {
        updateTransitionProgress(app?.scroll?.progressById?.['vis-4'] || progress);
      },

       async prewarm(app, options = {}) {
          if (!isBuilt) {
          console.warn('[VIS-4 PREWARM] skipped because not built yet');
          return false;
        }
        
        if (this.__prewarmed) {
          console.log('[VIS-4 PREWARM] already done');
          return true;
        }

      console.log("[VIS-4 PREWARM] start");

      const wasActive = isActive;
      const wasVisible = masterGroup.visible;

      isActive = true;
      masterGroup.visible = true;

      const viewportHeight =
      app.getViewportHeight?.() ||
      app.viewport?.height ||
      window.innerHeight ||
      1;

const sectionHeight =
  sectionEl?.offsetHeight || viewportHeight * 3;

      const ratios = options.ratios || [0.02, 0.08, 0.15, 0.25, 0.4, 0.6, 0.85, 1.0];
      const framesPerRatio = options.framesPerRatio || 12;

      for (const ratio of ratios) {
        const localY = sectionHeight * ratio;

        const progress = {
          sectionProgress: ratio,
          enterProgress: 1,
          exitProgress: 0,
          localY,
          shiftedLocalY: localY,
          sectionHeight,
          viewportHeight
        };

        for (let i = 0; i < framesPerRatio; i++) {
          updateTransitionProgress(progress);
          updateRotationAndTransform();
          applyTimeline();

          app.renderer.compile(app.scene, app.camera);
          app.renderer.render(app.scene, app.camera);

          await new Promise(requestAnimationFrame);
        }
      }

      masterGroup.visible = wasVisible;
      isActive = wasActive;

      this.__prewarmed = true;

      console.log("[VIS-4 PREWARM] done", {
        calls: app.renderer.info.render.calls,
        textures: app.renderer.info.memory.textures,
        geometries: app.renderer.info.memory.geometries,
        programs: app.renderer.info.programs?.length
      });

      return true;
    },

      destroy() {
        window.removeEventListener('pointermove', onPointerMove);

        scene.remove(masterGroup);
        scene.remove(ambientLight);
        scene.remove(light1);
        scene.remove(light2);

        if (floatingGeometry) floatingGeometry.dispose();
        if (floatingMaterial) floatingMaterial.dispose();

        cubelets.forEach((cubelet) => {
          if (cubelet.geometry) cubelet.geometry.dispose();

          const materials = Array.isArray(cubelet.material) ? cubelet.material : [cubelet.material];

          materials.forEach((mat) => {
            if (mat.map) mat.map.dispose();
            mat.dispose();
          });
        });

        cubelets = [];
        floatingData = [];
        floatingInstancedMesh = null;
        floatingAlphaArray = null;
      },
    };
  })();

  window.AIM.register('vis-4', Vis4);
  })();
