//console.log("Vis 5 - WED 17th JUN v1");
(function startWhenAIMReady() {
  if (!window.AIM) {
    window.addEventListener("aimGlobalReady", startWhenAIMReady, {
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
const IMAGE_URLS = window.AIM.getImageUrls(".image-urls");

const CONFIG = {
  // === MASTER POSITION / SCALE ===
  VISUAL_SCALE: 0.25, // Scales entire visual. Try 0.1 to 0.5.
  CUBE_POSITION_X: 3.5, // Moves full scene left/right.
  CUBE_POSITION_Y: 0.0, // Moves full scene up/down.
  CUBE_POSITION_Z: 0.0, // Moves full scene forward/back.

  // === GRID LAYOUT ===
  GRID_ROWS: 10, // Number of tile rows.
  GRID_COLUMNS: 10, // Number of tile columns.
  GRID_WIDTH: 6.0, // Total grid width.
  GRID_HEIGHT: 6.0, // Total grid height.

  // === TILE GEOMETRY ===
  TILE_GAP: 0.03, // Gap between tiles.
  TILE_DEPTH: 0.06, // Tile extrusion depth.
  TILE_START_SCALE: 0.1, // Initial TI scale.
  TILE_IDLE_SCALE: 0.2, // Default resting scale.
  TILE_ACTIVE_SCALE: 1.0, // Scale when activated by SVG.
  TILE_ACTIVE_Z_LIFT: 0.0, // Forward movement when activated. 0.08 default

  // === LOCAL GRID ROTATION ===
  TILE_ANGLE_X: 0.8, // Local grid X rotation.
  TILE_ANGLE_Y: 8.8, // Local grid Y rotation.
  TILE_ANGLE_Z: -0.8, // Local grid Z rotation.

  // === LOCAL GRID POSITION ===
  TILE_POSITION_X: 0.7, // Local grid X offset. Lower = left / higher = right
  TILE_POSITION_Y: 0.4, // Local grid Y offset. Lower = down / higher = up
  TILE_POSITION_Z: 0.3, // Local grid Z offset.

  // === SVG MASK ===
  SVG_PADDING_CELLS: 0, // Padding rows/columns around grid that never react.
  SVG_MASK_FEATHER: 0.18, // Edge softness of SVG mask.
  SVG_PASS_START: 0, // MS % where SVG starts entering.
  SVG_PASS_END: 100, // MS % where SVG fully exits.
  SVG_MASK_RESOLUTION: 512, // Internal SVG mask texture resolution.
  SVG_RESPONSE_LERP: 0.08, // Tile grow/shrink smoothing. Lower = softer.

  // === SVG SHAPE ===
  SVG_MARKUP: `
  <svg width="533" height="185" style="" viewBox="0 0 533 185" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M289.739 0.0999756H243.439V184.47H289.739V0.0999756Z" fill="currentColor"/>
  <path d="M98.32 0L0 184.56H46.3L98.32 90.91L150.35 184.56H196.65L98.32 0Z" fill="currentColor"/>
  <path d="M434.359 92.28L336.039 0V59L434.359 151.28L532.669 59V0L434.359 92.28Z" fill="currentColor"/>
  </svg>
  `,

  // === IMAGE PATCH SYSTEM ===
  IMAGE_PATCH_MODE: true, // Enables grouped image patches.
  IMAGE_PATCH_SIZES: [1, 2, 3], // Allowed patch sizes.
  IMAGE_PATCH_PROBABILITY: 0.38, // Chance of multi-tile patches.
  IMAGE_PATCH_LARGE_BIAS: 0.45, // Bias toward larger patches.

  // === TILE MATERIALS ===
  CUBE_SIDE_COLOR: new THREE.Color(0x777777), // Tile side colour.
  CUBE_SIDE_OPACITY: 0.18, // Tile side opacity.

  // === BASE GRID ROTATION ===
  RUBIK_ROT_X: 0.0, // Additional base X rotation.
  RUBIK_ROT_Y: 0.0, // Additional base Y rotation.
  RUBIK_ROT_Z: 0.0, // Additional base Z rotation.

  // === FLOAT PARTICLES ===
  FLOAT_CUBE_COUNT: 1000, // Number of float cubes.
  FLOAT_SPREAD_X: 26.5, // Float field width.
  FLOAT_SPREAD_Y: 8.5, // Float field height.
  FLOAT_SPREAD_Z: 9.5, // Float field depth.
  FLOAT_CLEAR_RADIUS: 2.4, // Clear area around centre.
  FLOAT_MIN_SCALE: 0.005, // Smallest float size.
  FLOAT_MAX_SCALE: 0.015, // Largest float size.
  FLOAT_OPACITY: 1.0, // Float opacity.
  FLOAT_NEAR_DISTANCE: 2.0, // Near brightness distance.
  FLOAT_FAR_DISTANCE: 7.0, // Far darkness distance.
  FLOAT_NEAR_COLOR: new THREE.Color(0xffffff), // Near float colour.
  FLOAT_FAR_COLOR: new THREE.Color(0x666666), // Far float colour.

  // === GLOBAL SCENE ROTATION ===
  DEFAULT_ROT_X: -0.82, // Match Vis 4 resting rotation.
  DEFAULT_ROT_Y: -0.18, // Resting Y rotation.
  DEFAULT_ROT_Z: -0.08, // Resting Z rotation.

  // === MOUSE ROTATION ===
  MOUSE_ROT_X: 0.18, // Mouse influence on X rotation.
  MOUSE_ROT_Y: 0.28, // Mouse influence on Y rotation.
  MOUSE_ROT_Z: 0.05, // Mouse influence on Z rotation.
  ROTATION_LERP: 0.08, // Rotation smoothing.

  // === SCROLL ROTATION ===
  SCROLL_ROT_X: 0.25, // Scroll-driven X rotation.
  SCROLL_ROT_Y: 1.2, // Scroll-driven Y rotation.
  SCROLL_ROT_Z: 0.0, // Scroll-driven Z rotation.

  // === ROTATION SPEEDS ===
  ROT_SPEED_TI: 4.0, // Extra TI rotational speed.
  ROT_SPEED_MS: 1.0, // Main scroll rotational speed.
  ROT_SPEED_TO: 4.0, // TO rotational speed.

  // === MATERIAL RESPONSE ===
  ROUGHNESS: 0.72, // Material roughness.
  METALNESS: 0.06 // Material metalness.
};

const TRANSITION = {
  // === TRANSITION LENGTHS ===
  TI: 100, // TI viewport height percentage.
  TO: 100, // TO viewport height percentage.

  // === TI TILE FADE ===
  TI_CUBE_FADE_START: 0, // TI % where tile fade begins.
  TI_CUBE_FADE_END: 100, // TI % where tile fade completes.

  // === TI FLOAT INTRO ===
  TI_FLOAT_END: 80, // TI % where float cubes settle.
  TI_FLOAT_FROM_DISTANCE: 8.0, // Float intro travel distance.
  TI_FLOAT_Y_VARIANCE: 0.5, // Random Y variance during intro.

  // === TI GRID BUILD ===
  TI_GRID_START: 0, // TI % where grid build begins.
  TI_GRID_END: 100, // TI % where grid build completes.
  TI_GRID_DELAY_MAX: 0.25, // Maximum stagger delay.
  TI_GRID_DURATION_MIN: 0.45, // Minimum tile build duration.
  TI_GRID_DURATION_MAX: 0.85, // Maximum tile build duration.
  TI_EASE_POWER: 1.1, // Build easing strength.

  // === GRID START STATE ===
  GRID_START_DISTANCE_MIN: 0.0, // Minimum tile start offset.
  GRID_START_DISTANCE_MAX: 2.5, // Maximum tile start offset.
  GRID_START_TANGENT_VARIANCE: 0.7, // Random tangent variance.
  GRID_START_ROT_VARIANCE: 1.2, // Random rotation variance.

  // === SCROLL ROTATION RANGE ===
  ROT_START: 0, // Scroll % where rotation begins.
  ROT_END: 100, // Scroll % where rotation completes.

  // === FLOAT TO MOVEMENT ===
  FLOAT_TO_PULL_STRENGTH: 0.35, // Float pull strength during TO.
  FLOAT_TO_MOVE_START: 0, // TO % where float movement begins.
  FLOAT_TO_MOVE_END: 65, // TO % where float movement completes.

  // === TO TIMING ===
  TO_TILE_BREAK_START: 10, // TO % where tiles begin dispersing.
  TO_TILE_MOVE_END: 50, // TO % where tile movement completes.
  TO_FADE_END: 100, // TO % where scene fully fades.

  // === TO SCENE MOVEMENT ===
  TO_MOVE_X: 0.1, // Whole scene horizontal movement during TO.
  TO_MOVE_Y: 4.0, // Whole scene vertical movement during TO.
  TO_MOVE_Z: 0.0, // Whole scene depth movement during TO.

  // === TILE FIELD STATE ===
  TILE_OUT_DISTANCE_MIN: 0.1, // Minimum tile field spread distance.
  TILE_OUT_DISTANCE_MAX: 0.2, // Maximum tile field spread distance.
  TILE_FIELD_Y_BIAS: 0.0, // Vertical spread bias.
  TILE_TO_STAGGER_MAX: 0.0, // Maximum TO stagger.
  TILE_FIELD_ROT_VARIANCE: 1.2, // Random field rotation variance.

  // === TO INTERACTION ===
  TO_MOUSE_REDUCTION: 1.0 // Reduces mouse influence during TO.
};

const Vis5 = (() => {
  const masterGroup = new THREE.Group();
  const pivotGroup = new THREE.Group();
  const rubikRotationGroup = new THREE.Group();
  const tileGroup = new THREE.Group();
  const floatGroup = new THREE.Group();

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  const light1 = new THREE.PointLight(0xffffff, 8.5, 30, 2);
  const light2 = new THREE.PointLight(0xffffff, 4.5, 30, 2);

  light1.position.set(-3, 2.5, 4.2);
  light2.position.set(3, -2, 4.2);

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");

  let sectionEl = null;
  let textures = [];
  let tiles = [];
  let patchIdCounter = 1;

  let maskCanvas = null;
  let maskCtx = null;
  let maskImageData = null;
  let maskReady = false;

  let floatingData = [];
  let floatingInstancedMesh = null;
  let floatingMaterial = null;
  let floatingGeometry = null;
  let floatingAlphaArray = null;

  const tempObject = new THREE.Object3D();
  const tempPosition = new THREE.Vector3();
  const tempColor = new THREE.Color();
  const whiteColor = new THREE.Color(0xffffff);

  let tiProgress = 0;
  let msProgress = 0;
  let toProgress = 0;
  let fullProgress = 0;

  let isActive = false;
  let isBuilt = false;

  const mouse = {
    x: 0,
    y: 0
  };
  const smoothMouse = {
    x: 0,
    y: 0
  };

  const currentRotation = {
    x: CONFIG.DEFAULT_ROT_X,
    y: CONFIG.DEFAULT_ROT_Y,
    z: CONFIG.DEFAULT_ROT_Z
  };

  function clamp01(v) {
    return Math.min(Math.max(v, 0), 1);
  }

  function pct(v) {
    return v / 100;
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
  let imageBag = [];

  function shuffleArray(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
  }

  function getNextImageIndex(allowedOptions = null) {
    if (!textures.length) return 0;

    const allowed =
      allowedOptions && allowedOptions.length
        ? allowedOptions
        : textures.map((_, index) => index);

    if (!imageBag.length) {
      imageBag = shuffleArray(textures.map((_, index) => index));
    }

    let bagIndex = imageBag.findIndex((index) => allowed.includes(index));

    if (bagIndex === -1) {
      imageBag = shuffleArray(textures.map((_, index) => index));
      bagIndex = imageBag.findIndex((index) => allowed.includes(index));
    }

    if (bagIndex === -1) {
      return allowed[Math.floor(Math.random() * allowed.length)];
    }

    const imageIndex = imageBag[bagIndex];
    imageBag.splice(bagIndex, 1);

    return imageIndex;
  }
  function randomOnSphere(radius) {
    const v = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    );

    if (v.lengthSq() < 0.0001) v.set(0, 1, 0);

    return v.normalize().multiplyScalar(radius);
  }

  function makeGridStartPosition(builtPosition) {
    const direction = builtPosition.clone();

    if (direction.lengthSq() < 0.0001) {
      direction.set(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      );
    }

    direction.normalize();

    const distance = randomRange(
      TRANSITION.GRID_START_DISTANCE_MIN,
      TRANSITION.GRID_START_DISTANCE_MAX
    );

    const startPosition = builtPosition
      .clone()
      .addScaledVector(direction, distance);

    startPosition.x +=
      (Math.random() - 0.5) * TRANSITION.GRID_START_TANGENT_VARIANCE;
    startPosition.y +=
      (Math.random() - 0.5) * TRANSITION.GRID_START_TANGENT_VARIANCE;
    startPosition.z +=
      (Math.random() - 0.5) * TRANSITION.GRID_START_TANGENT_VARIANCE;

    return startPosition;
  }

  function makeStartQuaternion(builtQuaternion) {
    const randomRotation = new THREE.Euler(
      (Math.random() - 0.5) * TRANSITION.GRID_START_ROT_VARIANCE,
      (Math.random() - 0.5) * TRANSITION.GRID_START_ROT_VARIANCE,
      (Math.random() - 0.5) * TRANSITION.GRID_START_ROT_VARIANCE
    );

    const q = new THREE.Quaternion().setFromEuler(randomRotation);
    return builtQuaternion.clone().multiply(q);
  }

  function makeGridTiming(row, col) {
    const rowT = row / Math.max(CONFIG.GRID_ROWS - 1, 1);
    const colT = col / Math.max(CONFIG.GRID_COLUMNS - 1, 1);
    const centreBias = Math.abs(rowT - 0.5) + Math.abs(colT - 0.5);

    const delay = Math.min(
      TRANSITION.TI_GRID_DELAY_MAX,
      centreBias * TRANSITION.TI_GRID_DELAY_MAX + Math.random() * 0.08
    );

    const maxDuration = Math.max(0.0001, 1 - delay);

    const duration = Math.min(
      randomRange(
        TRANSITION.TI_GRID_DURATION_MIN,
        TRANSITION.TI_GRID_DURATION_MAX
      ),
      maxDuration
    );

    return {
      delay,
      duration: Math.max(0.0001, duration)
    };
  }

  function getDelayedProgress(progress, delay, duration) {
    return clamp01((progress - delay) / Math.max(duration, 0.0001));
  }

  function makeFieldPosition() {
    let position = null;

    for (let i = 0; i < 60; i++) {
      position = new THREE.Vector3(
        (Math.random() - 0.5) * CONFIG.FLOAT_SPREAD_X,
        (Math.random() - 0.5) * CONFIG.FLOAT_SPREAD_Y,
        (Math.random() - 0.5) * CONFIG.FLOAT_SPREAD_Z
      );

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
      introDirection.set(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      );
    }

    introDirection.normalize();

    const introPosition = finalPosition
      .clone()
      .addScaledVector(introDirection, TRANSITION.TI_FLOAT_FROM_DISTANCE);

    introPosition.y += (Math.random() - 0.5) * TRANSITION.TI_FLOAT_Y_VARIANCE;

    return introPosition;
  }

  function makeFloatToTarget(finalPosition) {
    const outward = finalPosition.clone();

    if (outward.lengthSq() < 0.0001) {
      outward.set(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      );
    }

    outward.normalize();

    const target = finalPosition
      .clone()
      .addScaledVector(outward, randomRange(0.4, 1.4));

    target.y += (Math.random() - 0.5) * 0.45;

    if (target.length() < CONFIG.FLOAT_CLEAR_RADIUS) {
      target.copy(outward).multiplyScalar(CONFIG.FLOAT_CLEAR_RADIUS);
    }

    return target;
  }

  function makeTileFieldPosition(sourcePosition) {
    const outward = sourcePosition.clone();

    if (outward.lengthSq() < 0.0001) {
      outward.set(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      );
    }

    outward.normalize();

    const distance = randomRange(
      TRANSITION.TILE_OUT_DISTANCE_MIN,
      TRANSITION.TILE_OUT_DISTANCE_MAX
    );

    const target = sourcePosition.clone().addScaledVector(outward, distance);

    target.x += (Math.random() - 0.5) * 0.8;
    target.y += (Math.random() - 0.5) * TRANSITION.TILE_FIELD_Y_BIAS;
    target.z += (Math.random() - 0.5) * 0.8;

    return target;
  }

  function makeFieldScale() {
    return (
      CONFIG.FLOAT_MIN_SCALE +
      Math.random() * (CONFIG.FLOAT_MAX_SCALE - CONFIG.FLOAT_MIN_SCALE)
    );
  }

  function makeFieldQuaternion() {
    return new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        (Math.random() - 0.5) * TRANSITION.TILE_FIELD_ROT_VARIANCE,
        (Math.random() - 0.5) * TRANSITION.TILE_FIELD_ROT_VARIANCE,
        (Math.random() - 0.5) * TRANSITION.TILE_FIELD_ROT_VARIANCE
      )
    );
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
        reject
      );
    });
  }

  async function loadTextures() {
    textures = await Promise.all(IMAGE_URLS.map((url) => loadTexture(url)));
    imageBag = [];
  }

  function getCoverCrop(texture) {
    const image = texture.image;
    const imageAspect = image.width / image.height;
    const targetAspect = 1;

    if (imageAspect > targetAspect) {
      const scaleX = targetAspect / imageAspect;
      const offsetX = (1 - scaleX) * 0.5;

      return {
        scaleX,
        scaleY: 1,
        offsetX,
        offsetY: 0
      };
    }

    const scaleY = imageAspect / targetAspect;
    const offsetY = (1 - scaleY) * 0.5;

    return {
      scaleX: 1,
      scaleY,
      offsetX: 0,
      offsetY
    };
  }

  function cloneTexturePatch(texture, patchSize, patchX, patchY) {
    const t = texture.clone();

    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;

    const crop = getCoverCrop(texture);

    const patchScaleX = crop.scaleX / patchSize;
    const patchScaleY = crop.scaleY / patchSize;

    const patchOffsetX = crop.offsetX + patchX * patchScaleX;
    const patchOffsetY =
      crop.offsetY + crop.scaleY - (patchY + 1) * patchScaleY;

    t.repeat.set(patchScaleX, patchScaleY);
    t.offset.set(patchOffsetX, patchOffsetY);

    t.needsUpdate = true;

    return t;
  }

  function makeImageMaterial(texture, patchSize = 1, patchX = 0, patchY = 0) {
    return new THREE.MeshStandardMaterial({
      map: cloneTexturePatch(texture, patchSize, patchX, patchY),
      transparent: true,
      opacity: 1,
      roughness: CONFIG.ROUGHNESS,
      metalness: CONFIG.METALNESS,
      depthWrite: true,
      depthTest: true,
      side: THREE.DoubleSide
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
      side: THREE.DoubleSide
    });
  }

  function makeFaceMaterials(patch) {
    const texture = textures[patch.imageIndex];

    return [
      makeSideMaterial(),
      makeSideMaterial(),
      makeSideMaterial(),
      makeSideMaterial(),
      makeImageMaterial(texture, patch.size, patch.x, patch.y),
      makeSideMaterial()
    ];
  }

  function setMaterialOpacity(mesh, opacity) {
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];

    materials.forEach((mat, index) => {
      mat.opacity = index === 4 ? opacity : opacity * CONFIG.CUBE_SIDE_OPACITY;
    });
  }

  function applyTileShading(tile, baseOpacity) {
    const materials = Array.isArray(tile.material)
      ? tile.material
      : [tile.material];

    materials.forEach((mat, index) => {
      mat.opacity =
        index === 4 ? baseOpacity : baseOpacity * CONFIG.CUBE_SIDE_OPACITY;

      if (index === 4) {
        mat.color.copy(whiteColor);
      } else {
        tempColor.copy(CONFIG.CUBE_SIDE_COLOR);
        mat.color.copy(tempColor);
      }
    });
  }

  function choosePatchSize() {
    if (!CONFIG.IMAGE_PATCH_MODE) return 1;

    const sizes = CONFIG.IMAGE_PATCH_SIZES;
    const r = Math.random();

    if (r < CONFIG.IMAGE_PATCH_LARGE_BIAS && sizes.includes(3)) return 3;
    if (r < CONFIG.IMAGE_PATCH_LARGE_BIAS + 0.3 && sizes.includes(2)) return 2;

    return sizes.includes(1) ? 1 : sizes[0];
  }

  function getNeighbourCells(patchMap, row, col, rows, cols) {
    const neighbours = [];

    for (let y = -1; y <= 1; y++) {
      for (let x = -1; x <= 1; x++) {
        if (x === 0 && y === 0) continue;

        const targetRow = row + y;
        if (targetRow < 0 || targetRow >= rows) continue;

        const targetCol = col + x;
        if (targetCol < 0 || targetCol >= cols) continue;

        const cell = patchMap[targetRow][targetCol];

        if (cell) neighbours.push(cell);
      }
    }

    return neighbours;
  }

  function imageWouldTouchDifferentPatch(
    patchMap,
    row,
    col,
    rows,
    cols,
    imageIndex,
    patchId
  ) {
    const neighbours = getNeighbourCells(patchMap, row, col, rows, cols);

    return neighbours.some((cell) => {
      return cell.imageIndex === imageIndex && cell.patchId !== patchId;
    });
  }

  function canPlacePatch(
    patchMap,
    row,
    col,
    rows,
    cols,
    size,
    imageIndex,
    patchId
  ) {
    if (row + size > rows) return false;
    if (col + size > cols) return false;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const targetRow = row + y;
        const targetCol = col + x;

        if (patchMap[targetRow][targetCol]) return false;

        if (
          imageWouldTouchDifferentPatch(
            patchMap,
            targetRow,
            targetCol,
            rows,
            cols,
            imageIndex,
            patchId
          )
        ) {
          return false;
        }
      }
    }

    return true;
  }

  function chooseImageForPatch(patchMap, row, col, rows, cols, size, patchId) {
    const options = textures.map((_, index) => index);

    for (let attempt = 0; attempt < 20; attempt++) {
      const imageIndex = getNextImageIndex(options);

      if (
        canPlacePatch(patchMap, row, col, rows, cols, size, imageIndex, patchId)
      ) {
        return imageIndex;
      }
    }

    return null;
  }

  function chooseImageForSingle(patchMap, row, col, rows, cols, patchId) {
    const blocked = new Set();
    const neighbours = getNeighbourCells(patchMap, row, col, rows, cols);

    neighbours.forEach((cell) => {
      if (cell.patchId !== patchId) {
        blocked.add(cell.imageIndex);
      }
    });

    const options = textures
      .map((_, index) => index)
      .filter((index) => !blocked.has(index));

    if (options.length === 0) {
      return Math.floor(Math.random() * textures.length);
    }

    return getNextImageIndex(options);
  }

  function createImagePatchMap(rows, cols) {
    const patchMap = [];

    for (let row = 0; row < rows; row++) {
      patchMap[row] = [];
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (patchMap[row][col]) continue;

        const shouldPatch = Math.random() < CONFIG.IMAGE_PATCH_PROBABILITY;
        const preferredSize = shouldPatch ? choosePatchSize() : 1;
        const maxSize = Math.min(preferredSize, rows - row, cols - col);
        const patchId = patchIdCounter++;

        let finalSize = maxSize;
        let imageIndex = null;

        while (finalSize > 1) {
          imageIndex = chooseImageForPatch(
            patchMap,
            row,
            col,
            rows,
            cols,
            finalSize,
            patchId
          );

          if (imageIndex !== null) break;

          finalSize--;
        }

        if (imageIndex === null) {
          finalSize = 1;
          imageIndex = chooseImageForSingle(
            patchMap,
            row,
            col,
            rows,
            cols,
            patchId
          );
        }

        for (let y = 0; y < finalSize; y++) {
          for (let x = 0; x < finalSize; x++) {
            const targetRow = row + y;
            const targetCol = col + x;

            patchMap[targetRow][targetCol] = {
              imageIndex,
              patchId,
              size: finalSize,
              x,
              y
            };
          }
        }
      }
    }

    return patchMap;
  }

  function loadSvgMask() {
    return new Promise((resolve) => {
      maskCanvas = document.createElement("canvas");
      maskCanvas.width = CONFIG.SVG_MASK_RESOLUTION;
      maskCanvas.height = CONFIG.SVG_MASK_RESOLUTION;
      maskCtx = maskCanvas.getContext("2d", {
        willReadFrequently: true
      });

      const svg = CONFIG.SVG_MARKUP.trim();
      const svgBlob = new Blob([svg], {
        type: "image/svg+xml;charset=utf-8"
      });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();

      img.onload = () => {
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        maskCtx.drawImage(img, 0, 0, maskCanvas.width, maskCanvas.height);
        maskImageData = maskCtx.getImageData(
          0,
          0,
          maskCanvas.width,
          maskCanvas.height
        ).data;
        URL.revokeObjectURL(url);
        maskReady = true;
        resolve();
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        maskReady = false;
        resolve();
      };

      img.src = url;
    });
  }

  function sampleSvgMask(u, v) {
    if (!maskReady || !maskImageData) return 0;

    if (u < 0 || u > 1 || v < 0 || v > 1) return 0;

    const x = Math.floor(u * (maskCanvas.width - 1));
    const y = Math.floor((1 - v) * (maskCanvas.height - 1));
    const index = (y * maskCanvas.width + x) * 4;

    return maskImageData[index + 3] / 255;
  }

  function getSvgAspectRatio(svgMarkup) {
    const viewBoxMatch = svgMarkup.match(/viewBox=["']([^"']+)["']/i);

    if (viewBoxMatch) {
      const values = viewBoxMatch[1]
        .trim()
        .split(/[\s,]+/)
        .map(Number);

      if (values.length === 4 && values[2] > 0 && values[3] > 0) {
        return values[2] / values[3];
      }
    }

    const widthMatch = svgMarkup.match(/width=["']([\d.]+)["']/i);
    const heightMatch = svgMarkup.match(/height=["']([\d.]+)["']/i);

    if (widthMatch && heightMatch) {
      const width = Number(widthMatch[1]);
      const height = Number(heightMatch[1]);

      if (width > 0 && height > 0) return width / height;
    }

    return CONFIG.SVG_ASPECT_RATIO_FALLBACK;
  }

  function getSvgInfluence(tile) {
    const passT = smoothstep(
      pct(CONFIG.SVG_PASS_START),
      pct(CONFIG.SVG_PASS_END),
      msProgress
    );

    const pad = CONFIG.SVG_PADDING_CELLS;

    if (
      tile.userData.row < pad ||
      tile.userData.row >= CONFIG.GRID_ROWS - pad ||
      tile.userData.col < pad ||
      tile.userData.col >= CONFIG.GRID_COLUMNS - pad
    ) {
      return 0;
    }

    const cellW = 2 / CONFIG.GRID_COLUMNS;
    const cellH = 2 / CONFIG.GRID_ROWS;

    const paddedLeft = -1 + pad * cellW;
    const paddedRight = 1 - pad * cellW;
    const paddedBottom = -1 + pad * cellH;
    const paddedTop = 1 - pad * cellH;

    const paddedHeightNormalized = paddedTop - paddedBottom;
    const paddedCenterY = (paddedTop + paddedBottom) * 0.5;

    const svgAspectRatio = getSvgAspectRatio(CONFIG.SVG_MARKUP);

    const svgHeightNormalized = paddedHeightNormalized;
    const svgWidthNormalized = svgHeightNormalized * svgAspectRatio;

    const svgHalfWidth = svgWidthNormalized * 0.5;

    const svgStartCenterX = paddedRight + svgHalfWidth;
    const svgEndCenterX = paddedLeft - svgHalfWidth;

    const svgCenterX = lerp(svgStartCenterX, svgEndCenterX, passT);

    const localX = tile.userData.normalizedX;
    const localY = tile.userData.normalizedY;

    if (
      localX < paddedLeft ||
      localX > paddedRight ||
      localY < paddedBottom ||
      localY > paddedTop
    ) {
      return 0;
    }

    if (
      Math.abs(localY - paddedCenterY) > svgHeightNormalized * 0.5 ||
      Math.abs(localX - svgCenterX) > svgWidthNormalized * 0.5
    ) {
      return 0;
    }

    const maskU = (localX - svgCenterX) / svgWidthNormalized + 0.5;

    const maskV = (localY - paddedCenterY) / svgHeightNormalized + 0.5;

    const alpha = sampleSvgMask(maskU, maskV);

    if (CONFIG.SVG_MASK_FEATHER <= 0) {
      return alpha > 0.01 ? 1 : 0;
    }

    return smoothstep(0.01, CONFIG.SVG_MASK_FEATHER, alpha);
  }

  function buildTiles() {
    const rows = CONFIG.GRID_ROWS;
    const cols = CONFIG.GRID_COLUMNS;

    const patchMap = createImagePatchMap(rows, cols);

    const cellW = CONFIG.GRID_WIDTH / cols;
    const cellH = CONFIG.GRID_HEIGHT / rows;

    const tileW = Math.max(cellW - CONFIG.TILE_GAP, 0.001);
    const tileH = Math.max(cellH - CONFIG.TILE_GAP, 0.001);

    const geometry = new THREE.BoxGeometry(tileW, tileH, CONFIG.TILE_DEPTH);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const patch = patchMap[row][col] || {
          imageIndex: Math.floor(Math.random() * textures.length),
          patchId: patchIdCounter++,
          size: 1,
          x: 0,
          y: 0
        };

        const tile = new THREE.Mesh(geometry.clone(), makeFaceMaterials(patch));
        tile.renderOrder = 0;

        const x = (col + 0.5) * cellW - CONFIG.GRID_WIDTH * 0.5;
        const y = CONFIG.GRID_HEIGHT * 0.5 - (row + 0.5) * cellH;
        const z = 0;

        const normalizedX = (x / CONFIG.GRID_WIDTH) * 2;
        const normalizedY = (y / CONFIG.GRID_HEIGHT) * 2;

        const builtPosition = new THREE.Vector3(x, y, z);
        const builtQuaternion = new THREE.Quaternion();
        const builtScale = CONFIG.TILE_IDLE_SCALE;

        const startPosition = makeGridStartPosition(builtPosition);
        const startQuaternion = makeStartQuaternion(builtQuaternion);
        const fieldScale = makeFieldScale();
        const timing = makeGridTiming(row, col);

        tile.position.copy(startPosition);
        tile.quaternion.copy(startQuaternion);
        tile.scale.setScalar(fieldScale);

        tile.userData.row = row;
        tile.userData.col = col;
        tile.userData.normalizedX = normalizedX;
        tile.userData.normalizedY = normalizedY;

        tile.userData.builtPosition = builtPosition.clone();
        tile.userData.builtQuaternion = builtQuaternion.clone();
        tile.userData.builtScale = builtScale;

        tile.userData.startPosition = startPosition.clone();
        tile.userData.startQuaternion = startQuaternion.clone();
        tile.userData.startScale = fieldScale;

        tile.userData.fieldPosition = makeTileFieldPosition(builtPosition);
        tile.userData.fieldScale = fieldScale;
        tile.userData.fieldQuaternion = makeFieldQuaternion();
        tile.userData.toStagger =
          Math.random() * TRANSITION.TILE_TO_STAGGER_MAX;

        tile.userData.pullDelay = timing.delay;
        tile.userData.pullDuration = timing.duration;

        setMaterialOpacity(tile, 0);

        tileGroup.add(tile);
        tiles.push(tile);
      }
    }
  }

  function makeFloatingShaderMaterial() {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      uniforms: {
        uOpacity: {
          value: 0
        },
        uNearColor: {
          value: CONFIG.FLOAT_NEAR_COLOR
        },
        uFarColor: {
          value: CONFIG.FLOAT_FAR_COLOR
        },
        uNearDistance: {
          value: CONFIG.FLOAT_NEAR_DISTANCE
        },
        uFarDistance: {
          value: CONFIG.FLOAT_FAR_DISTANCE
        }
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
  `
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

    const alphaAttr = floatingInstancedMesh.geometry.getAttribute(
      "aInstanceAlpha"
    );
    if (alphaAttr) alphaAttr.needsUpdate = true;
  }

  function buildFloatingCubes() {
    floatingGeometry = new THREE.BoxGeometry(1, 1, 1);
    floatingMaterial = makeFloatingShaderMaterial();

    floatingInstancedMesh = new THREE.InstancedMesh(
      floatingGeometry,
      floatingMaterial,
      CONFIG.FLOAT_CUBE_COUNT
    );

    floatingInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    floatingInstancedMesh.renderOrder = 1;

    floatingAlphaArray = new Float32Array(CONFIG.FLOAT_CUBE_COUNT);

    floatingGeometry.setAttribute(
      "aInstanceAlpha",
      new THREE.InstancedBufferAttribute(floatingAlphaArray, 1)
    );

    for (let i = 0; i < CONFIG.FLOAT_CUBE_COUNT; i++) {
      const finalPosition = makeFieldPosition();
      const introPosition = makeFloatIntroPosition(finalPosition);
      const toTarget = makeFloatToTarget(finalPosition);
      const scale = makeFieldScale();

      const rotation = new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      floatingData.push({
        finalPosition,
        introPosition,
        toTarget,
        scale,
        rotation
      });

      setFloatingInstance(i, introPosition, scale, rotation);
      setFloatingAlpha(i, 1);
    }

    updateFloatingMaterialOpacity(0);
    commitFloatingInstances();
    floatGroup.add(floatingInstancedMesh);
  }

  function updateTransitionProgress(progress = {}) {
    sectionEl = sectionEl || document.getElementById("vis-5");
    if (!sectionEl) return;

    const rect = sectionEl.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const sectionHeight = sectionEl.offsetHeight;

    const localY =
      typeof progress.shiftedLocalY === "number"
        ? progress.shiftedLocalY
        : window.scrollY - sectionTop;

    const tiPx = window.innerHeight * (TRANSITION.TI / 100);
    const toPx = window.innerHeight * (TRANSITION.TO / 100);

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
    const tileFadeT = easeOutCubic(
      mapRange(
        tiProgress,
        pct(TRANSITION.TI_CUBE_FADE_START),
        pct(TRANSITION.TI_CUBE_FADE_END),
        0,
        1
      )
    );

    const floatT = easeOutCubic(
      mapRange(tiProgress, 0, pct(TRANSITION.TI_FLOAT_END), 0, 1)
    );

    const gridTimeline = mapRange(
      tiProgress,
      pct(TRANSITION.TI_GRID_START),
      pct(TRANSITION.TI_GRID_END),
      0,
      1
    );

    tiles.forEach((tile) => {
      const delayed = getDelayedProgress(
        gridTimeline,
        tile.userData.pullDelay,
        tile.userData.pullDuration
      );

      const t = easeInOutCubic(Math.pow(delayed, TRANSITION.TI_EASE_POWER));

      tile.position.lerpVectors(
        tile.userData.startPosition,
        tile.userData.builtPosition,
        t
      );

      tile.quaternion.slerpQuaternions(
        tile.userData.startQuaternion,
        tile.userData.builtQuaternion,
        t
      );

      const scale =
        tile.userData.startScale +
        (tile.userData.builtScale - tile.userData.startScale) * t;

      tile.scale.setScalar(Math.max(scale, 0.0001));
      applyTileShading(tile, tileFadeT);
    });

    floatingData.forEach((cube, i) => {
      tempPosition.lerpVectors(cube.introPosition, cube.finalPosition, floatT);
      setFloatingInstance(i, tempPosition, cube.scale, cube.rotation);
      setFloatingAlpha(i, 1);
    });

    updateFloatingMaterialOpacity(CONFIG.FLOAT_OPACITY * tileFadeT);
    commitFloatingInstances();
  }

  function applyMainScroll() {
    tiles.forEach((tile) => {
      const targetInfluence = getSvgInfluence(tile);

      tile.userData.currentInfluence ??= 0;

      tile.userData.currentInfluence +=
        (targetInfluence - tile.userData.currentInfluence) *
        CONFIG.SVG_RESPONSE_LERP;

      const easedInfluence = easeInOutCubic(tile.userData.currentInfluence);

      const scale = lerp(
        CONFIG.TILE_IDLE_SCALE,
        CONFIG.TILE_ACTIVE_SCALE,
        easedInfluence
      );

      const zLift = CONFIG.TILE_ACTIVE_Z_LIFT * easedInfluence;

      tile.position.copy(tile.userData.builtPosition);
      tile.position.z += zLift;

      tile.quaternion.copy(tile.userData.builtQuaternion);
      tile.scale.setScalar(scale);

      applyTileShading(tile, 1);
    });

    updateFloatingCubesAtField(1);
  }

  function applyTransitionOut() {
    const breakupProgress = mapRange(
      toProgress,
      pct(TRANSITION.TO_TILE_BREAK_START),
      1,
      0,
      1
    );

    const tileRawMove = mapRange(
      breakupProgress,
      0,
      pct(TRANSITION.TO_TILE_MOVE_END),
      0,
      1
    );

    const floatMoveT = mapRange(
      toProgress,
      pct(TRANSITION.FLOAT_TO_MOVE_START),
      pct(TRANSITION.FLOAT_TO_MOVE_END),
      0,
      1
    );

    const fadeT =
      1 - mapRange(toProgress, 0, pct(TRANSITION.TO_FADE_END), 0, 1);

    updateFloatingCubesDuringTO(floatMoveT, fadeT);

    tiles.forEach((tile) => {
      const delayed = clamp01(
        (tileRawMove - tile.userData.toStagger) /
          Math.max(1 - tile.userData.toStagger, 0.0001)
      );

      const moveT = easeInOutCubic(Math.pow(delayed, TRANSITION.TI_EASE_POWER));

      tile.position.lerpVectors(
        tile.userData.builtPosition,
        tile.userData.fieldPosition,
        moveT
      );

      tile.quaternion.slerpQuaternions(
        tile.userData.builtQuaternion,
        tile.userData.fieldQuaternion,
        moveT
      );

      const scale =
        CONFIG.TILE_IDLE_SCALE +
        (tile.userData.fieldScale - CONFIG.TILE_IDLE_SCALE) * moveT;

      tile.scale.setScalar(Math.max(scale, 0.0001));
      applyTileShading(tile, fadeT);
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

    const scrollRotProgress = mapRange(
      fullProgress,
      pct(TRANSITION.ROT_START),
      pct(TRANSITION.ROT_END),
      0,
      1
    );

    const baseScrollX = scrollRotProgress * CONFIG.SCROLL_ROT_X;
    const baseScrollY = scrollRotProgress * CONFIG.SCROLL_ROT_Y;
    const baseScrollZ = scrollRotProgress * CONFIG.SCROLL_ROT_Z;

    const tiExtraRotation =
      tiProgress * Math.max(CONFIG.ROT_SPEED_TI - CONFIG.ROT_SPEED_MS, 0);

    const toExtraRotation = 0;

    const extraRotation = tiExtraRotation + toExtraRotation;

    const axisLength =
      Math.sqrt(
        CONFIG.SCROLL_ROT_X * CONFIG.SCROLL_ROT_X +
          CONFIG.SCROLL_ROT_Y * CONFIG.SCROLL_ROT_Y +
          CONFIG.SCROLL_ROT_Z * CONFIG.SCROLL_ROT_Z
      ) || 1;

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

    pivotGroup.rotation.set(
      currentRotation.x,
      currentRotation.y,
      currentRotation.z
    );

    // Additive TO movement on the whole scene group.
    pivotGroup.position.x =
      CONFIG.CUBE_POSITION_X + toProgress * TRANSITION.TO_MOVE_X;

    pivotGroup.position.y =
      CONFIG.CUBE_POSITION_Y +
      easeInOutCubic(toProgress) * TRANSITION.TO_MOVE_Y;

    pivotGroup.position.z =
      CONFIG.CUBE_POSITION_Z + toProgress * TRANSITION.TO_MOVE_Z;

    rubikRotationGroup.rotation.set(
      CONFIG.RUBIK_ROT_X + CONFIG.TILE_ANGLE_X,
      CONFIG.RUBIK_ROT_Y + CONFIG.TILE_ANGLE_Y,
      CONFIG.RUBIK_ROT_Z + CONFIG.TILE_ANGLE_Z
    );

    rubikRotationGroup.position.set(
      CONFIG.TILE_POSITION_X,
      CONFIG.TILE_POSITION_Y,
      CONFIG.TILE_POSITION_Z
    );

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
      sectionEl = document.getElementById("vis-5");

      masterGroup.visible = false;
      masterGroup.scale.setScalar(CONFIG.VISUAL_SCALE);

      pivotGroup.position.set(
        CONFIG.CUBE_POSITION_X,
        CONFIG.CUBE_POSITION_Y,
        CONFIG.CUBE_POSITION_Z
      );

      masterGroup.add(pivotGroup);

      pivotGroup.add(rubikRotationGroup);
      rubikRotationGroup.add(tileGroup);

      pivotGroup.add(floatGroup);

      scene.add(masterGroup);
      scene.add(ambientLight);
      scene.add(light1, light2);

      await loadTextures();
      await loadSvgMask();

      buildTiles();
      buildFloatingCubes();

      isBuilt = true;
      applyCurrentStateAfterLoad();

      window.AIM_VIS5_READY = true;

      window.dispatchEvent(
        new CustomEvent("aimVisualReady", {
          detail: { id: "vis-5" }
        })
      );
    },

    enter(app, progress = {}) {
      isActive = true;

      if (isBuilt) {
        masterGroup.visible = true;
        applyCurrentStateAfterLoad(progress);
      }

      window.addEventListener("pointermove", onPointerMove);
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

      window.removeEventListener("pointermove", onPointerMove);
    },

    resize() {
      updateTransitionProgress();
    },

    async prewarm(app, options = {}) {
  if (!isBuilt) {
    console.warn('[VIS-5 PREWARM] skipped because not built yet');
    return false;
  }

  if (this.__prewarmed) {
    console.log('[VIS-5 PREWARM] already done');
    return true;
  }

  console.log('[VIS-5 PREWARM] start');

  const wasActive = isActive;
  const wasVisible = masterGroup.visible;

  isActive = true;
  masterGroup.visible = true;

  const ratios = options.ratios || [0.08, 0.25, 0.5, 0.85];
  const framesPerRatio = options.framesPerRatio || 6;

  const sectionHeight = sectionEl?.offsetHeight || window.innerHeight * 3;
  const viewportHeight = app.viewport?.height || window.innerHeight;

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

  console.log('[VIS-5 PREWARM] done', {
    calls: app.renderer.info.render.calls,
    textures: app.renderer.info.memory.textures,
    geometries: app.renderer.info.memory.geometries,
    programs: app.renderer.info.programs?.length
  });

  return true;
},
    
    destroy() {
      window.removeEventListener("pointermove", onPointerMove);

      scene.remove(masterGroup);
      scene.remove(ambientLight);
      scene.remove(light1);
      scene.remove(light2);

      if (floatingGeometry) floatingGeometry.dispose();
      if (floatingMaterial) floatingMaterial.dispose();

      tiles.forEach((tile) => {
        if (tile.geometry) tile.geometry.dispose();

        const materials = Array.isArray(tile.material)
          ? tile.material
          : [tile.material];

        materials.forEach((mat) => {
          if (mat.map) mat.map.dispose();
          mat.dispose();
        });
      });

      tiles = [];
      floatingData = [];
      floatingInstancedMesh = null;
      floatingAlphaArray = null;
    }
  };
})();

window.AIM.register("vis-5", Vis5);
})();
