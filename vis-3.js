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
    const IMAGE_URLS = window.AIM.getImageUrls('.urls');

    const CONFIG = {
      // =========================================================
      // POSITION / SCALE
      // =========================================================

      VISUAL_SCALE: 0.25, // Scales whole visual to suit shared camera. Try 0.15 to 0.5.

      CUBE_POSITION_X: 1.5, // Moves cube pivot left/right. Try -3 to 3.
      CUBE_POSITION_Y: 0.0, // Moves cube pivot up/down. Try -2 to 2.
      CUBE_POSITION_Z: 0.0, // Moves cube pivot forward/back. Try -2 to 2.

      // =========================================================
      // RUBIK CUBE
      // =========================================================

      GRID_SIZE: 3, // Rubik grid count per axis. 3 = classic cube.

      CUBELET_SIZE: 0.9, // Built cubelet size. Try 0.6 to 1.4.
      CUBELET_GAP: 0.02, // Gap between cubelets. Try 0 to 0.08.

      BUILT_CUBE_SCALE: 1.0, // Final cubelet scale once built. Usually 1.

      SCRAMBLE_MOVE_COUNT: 5, // Number of Rubik scramble moves. Try 2 to 10.
      SCRAMBLE_RANDOM: true, // true = new scramble each load, false = fixed scramble.

      // =========================================================
      // RUBIK CUBE ORIENTATION
      // =========================================================

      RUBIK_ROT_X: 0.0, // Rotates only the Rubik cube inside the shared scene.
      RUBIK_ROT_Y: 0.0, // Rotates only the Rubik cube inside the shared scene.
      RUBIK_ROT_Z: 0.0, // Rotates only the Rubik cube inside the shared scene.

      // =========================================================
      // FLOATING CUBES
      // =========================================================

      FLOAT_CUBE_COUNT: 1000, // Extra surrounding cubes. Try 300 to 3000.

      FLOAT_SPREAD_X: 26.5, // Horizontal spread of floating cubes. Try 10 to 40.
      FLOAT_SPREAD_Y: 8.5, // Vertical spread of floating cubes. Try 4 to 16.
      FLOAT_SPREAD_Z: 9.5, // Depth spread of floating cubes. Try 4 to 18.

      FLOAT_CLEAR_RADIUS: 2.25, // Empty radius around Rubik cube. Try 1.8 to 3.0.

      FLOAT_MIN_SCALE: 0.005, // Smallest floating cube scale. Try 0.005 to 0.03.
      FLOAT_MAX_SCALE: 0.015, // Largest floating cube scale. Try 0.01 to 0.06.

      FLOAT_OPACITY: 1.0, // Global floating cube opacity. Try 0.2 to 1.

      FLOAT_NEAR_DISTANCE: 2.0, // Distance where float cubes are pure white. Try 1 to 5.
      FLOAT_FAR_DISTANCE: 7.0, // Distance where float cubes become grey. Try 5 to 10.

      FLOAT_NEAR_COLOR: new THREE.Color(0xffffff), // Near float cube colour.
      FLOAT_FAR_COLOR: new THREE.Color(0x666666), // Far float cube colour.

      // =========================================================
      // GLOBAL ROTATION
      // =========================================================

      DEFAULT_ROT_X: -0.82, // Base X tilt. Try -1 to 1.
      DEFAULT_ROT_Y: -0.18, // Base Y turn. Try -1 to 1.
      DEFAULT_ROT_Z: -0.08, // Base Z roll. Try -0.5 to 0.5.

      MOUSE_ROT_X: 0.18, // Mouse tilt strength on X. Try 0 to 0.5.
      MOUSE_ROT_Y: 0.28, // Mouse turn strength on Y. Try 0 to 0.7.
      MOUSE_ROT_Z: 0.05, // Mouse roll strength on Z. Try 0 to 0.2.

      ROTATION_LERP: 0.08, // Rotation smoothing. Lower = smoother/slower, higher = snappier.

      SCROLL_ROT_X: 0.25, // Extra X rotation across scroll. Try 0 to 1.
      SCROLL_ROT_Y: 1.2, // Extra Y rotation across scroll. Try 0.5 to 3.
      SCROLL_ROT_Z: 0.0, // Extra Z rotation across scroll. Try 0 to 1.

      ROT_SPEED_TI: 4.0, // Rotation speed during TI. 1 = normal, 3 to 8 = multiple loops.
      ROT_SPEED_MS: 1.0, // Rotation speed during MS. 1 = normal.
      ROT_SPEED_TO: 4.0, // Rotation speed during TO. 1 = normal, higher = faster.

      // =========================================================
      // MATERIAL / LIGHTING
      // =========================================================

      ROUGHNESS: 0.72, // Surface roughness. 0 = glossy, 1 = matte.
      METALNESS: 0.06, // Surface metalness. 0 = flat, 0.5+ = shiny.
    };

    const TRANSITION = {
      // === SCROLL LENGTHS ===
      // How much scroll distance transition in uses in VH.
      TI: 100,

      // How much scroll distance transition out uses in VH.
      TO: 100,

      // === SHARED CUBE FADE ===
      // % of TI where all cubes start fading in.
      TI_CUBE_FADE_START: 0,

      // % of TI where all cubes reach full opacity.
      TI_CUBE_FADE_END: 18,

      // === TI: FLOAT CUBES ===
      // % of TI where floating cubes finish rising.
      TI_FLOAT_END: 80,

      // Floating cubes start this far below their resting place.
      TI_FLOAT_FROM_Y: -8.0,

      // === TI: RUBIK BUILD ===
      // % of TI where Rubik cubelets start rising.
      TI_RUBIK_START: 0,

      // % of TI where Rubik cubelets finish rising.
      TI_RUBIK_END: 100,

      // Top visible layer fall distance.
      TI_TOP_LAYER_FALL: 5.0,

      // Middle visible layer fall multiplier.
      TI_MID_LAYER_FALL_MULT: 1.15,

      // Bottom visible layer fall multiplier.
      TI_BOTTOM_LAYER_FALL_MULT: 1.45,

      // Small random fall variation per cube.
      TI_LAYER_FALL_VARIANCE: 0.25,

      // Delay between visible top, middle and bottom layers.
      TI_LAYER_STAGGER: 0.1,

      // Small timing variation within each visible layer.
      TI_LAYER_WAVE: 0.035,

      // Smoothing curve for TI movement. Try 0.8 to 2.0.
      TI_EASE_POWER: 1.1,

      // === MS: RUBIK SOLVE ===
      // % of MS where Rubik solve starts.
      MS_SOLVE_START: 0,

      // % of MS where Rubik solve finishes.
      MS_SOLVE_END: 50,

      // % of full section where scroll rotation starts.
      ROT_START: 0,

      // % of full section where scroll rotation reaches full strength.
      ROT_END: 100,

      // === FLOAT TO MOVEMENT ===
      // How much float cubes move during TO. 0 = hold field, 1 = full target.
      FLOAT_TO_PULL_STRENGTH: 0.35,

      // % of TO before float movement begins. 0 keeps TO seamless.
      FLOAT_TO_MOVE_START: 0,

      // % of TO where float movement reaches full strength.
      FLOAT_TO_MOVE_END: 65,

      // === TO TIMING ===
      // % of TO where Rubik breakup starts.
      TO_RUBIK_BREAK_START: 10,

      // % of breakup phase where Rubik cubelets finish moving outward.
      TO_RUBIK_MOVE_END: 50,

      // % of TO where everything has faded to 0 opacity.
      TO_FADE_END: 100,

      // === TO: RUBIK OUTWARD DISPERSAL ===
      // Minimum outward distance from each cubelet's built position.
      RUBIK_OUT_DISTANCE_MIN: 0.3,

      // Maximum outward distance from each cubelet's built position.
      RUBIK_OUT_DISTANCE_MAX: 1.0,

      // Sideways drift after outward push. Try 0.2 to 1.5.
      RUBIK_OUT_TANGENT_VARIANCE: 1.2,

      // Extra vertical looseness for cubelet targets.
      RUBIK_FIELD_Y_BIAS: 0.5,

      // Avoids cubelets taking identical paths.
      RUBIK_TO_STAGGER_MAX: 0.22,

      // Random cubelet rotation at field position.
      RUBIK_FIELD_ROT_VARIANCE: 1.2,

      // Reduces mouse rotation during TO.
      TO_MOUSE_REDUCTION: 1.0,
    };

    function shuffle(arr) {
      const a = [...arr];

      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = a[i];
        a[i] = a[j];
        a[j] = temp;
      }

      return a;
    }

    const shuffledImages = shuffle(IMAGE_URLS);

    const IMAGES = {
      right: shuffledImages[0],
      left: shuffledImages[1],
      top: shuffledImages[2],
      bottom: shuffledImages[3],
      front: shuffledImages[4],
      back: shuffledImages[5],
    };

    const Vis3 = (() => {
      let SCRAMBLE_MOVES = [];
      let SOLVE_MOVES = [];

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

      let sectionEl = null;
      let textures = {};
      let cubelets = [];

      let floatingData = [];
      let floatingInstancedMesh = null;
      let floatingMaterial = null;
      let floatingGeometry = null;
      let floatingAlphaArray = null;

      const tempObject = new THREE.Object3D();
      const tempPosition = new THREE.Vector3();
      const tempTangent = new THREE.Vector3();
      const tempTangentB = new THREE.Vector3();

      let tiProgress = 0;
      let msProgress = 0;
      let toProgress = 0;
      let fullProgress = 0;

      let isActive = false;
      let isBuilt = false;

      const mouse = {
        x: 0,
        y: 0,
      };
      const smoothMouse = {
        x: 0,
        y: 0,
      };

      const currentRotation = {
        x: CONFIG.DEFAULT_ROT_X,
        y: CONFIG.DEFAULT_ROT_Y,
        z: CONFIG.DEFAULT_ROT_Z,
      };

      function clamp01(v) {
        return Math.min(Math.max(v, 0), 1);
      }

      function pct(v) {
        return v / 100;
      }

      function mapRange(v, inMin, inMax, outMin, outMax) {
        const t = clamp01((v - inMin) / Math.max(inMax - inMin, 0.0001));
        return outMin + (outMax - outMin) * t;
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

      function makeFieldQuaternion(baseQuaternion) {
        const randomRotation = new THREE.Euler((Math.random() - 0.5) * TRANSITION.RUBIK_FIELD_ROT_VARIANCE, (Math.random() - 0.5) * TRANSITION.RUBIK_FIELD_ROT_VARIANCE, (Math.random() - 0.5) * TRANSITION.RUBIK_FIELD_ROT_VARIANCE);

        const q = new THREE.Quaternion().setFromEuler(randomRotation);
        return baseQuaternion.clone().multiply(q);
      }

      function axisVector(axis) {
        if (axis === 'x') return new THREE.Vector3(1, 0, 0);
        if (axis === 'y') return new THREE.Vector3(0, 1, 0);
        return new THREE.Vector3(0, 0, 1);
      }

      function generateScrambleMoves() {
        const moves = [];
        const axes = ['x', 'y', 'z'];
        const layers = [-1, 0, 1];
        let lastMove = null;

        for (let i = 0; i < CONFIG.SCRAMBLE_MOVE_COUNT; i++) {
          let move;

          do {
            move = {
              axis: axes[Math.floor(Math.random() * axes.length)],
              layer: layers[Math.floor(Math.random() * layers.length)],
              dir: Math.random() > 0.5 ? 1 : -1,
            };
          } while (lastMove && move.axis === lastMove.axis && move.layer === lastMove.layer);

          moves.push(move);
          lastMove = move;
        }

        return moves;
      }

      function initMoves() {
        SCRAMBLE_MOVES = CONFIG.SCRAMBLE_RANDOM
          ? generateScrambleMoves()
          : [
              {
                axis: 'x',
                layer: 1,
                dir: 1,
              },
              {
                axis: 'y',
                layer: -1,
                dir: -1,
              },
              {
                axis: 'z',
                layer: 1,
                dir: 1,
              },
            ];

        SOLVE_MOVES = [...SCRAMBLE_MOVES].reverse().map((m) => ({
          axis: m.axis,
          layer: m.layer,
          dir: -m.dir,
        }));
      }

      function updateGridAfterMove(grid, move) {
        const x = grid.x;
        const y = grid.y;
        const z = grid.z;
        const d = move.dir;

        if (move.axis === 'x') {
          grid.y = -d * z;
          grid.z = d * y;
        }

        if (move.axis === 'y') {
          grid.x = d * z;
          grid.z = -d * x;
        }

        if (move.axis === 'z') {
          grid.x = -d * y;
          grid.y = d * x;
        }
      }

      function snapCubelet(cubelet) {
        const spacing = CONFIG.CUBELET_SIZE + CONFIG.CUBELET_GAP;
        const g = cubelet.userData.grid;

        cubelet.position.set(g.x * spacing, g.y * spacing, g.z * spacing);
      }

      function applyMove(move, amount, updateGrid) {
        const angle = move.dir * Math.PI * 0.5 * amount;
        const axis = axisVector(move.axis);
        const q = new THREE.Quaternion().setFromAxisAngle(axis, angle);

        cubelets.forEach((cubelet) => {
          if (Math.round(cubelet.userData.grid[move.axis]) !== move.layer) return;

          cubelet.position.applyAxisAngle(axis, angle);
          cubelet.quaternion.premultiply(q);

          if (updateGrid) {
            updateGridAfterMove(cubelet.userData.grid, move);
            snapCubelet(cubelet);
          }
        });
      }

      function loadTexture(url) {
        return new Promise((resolve, reject) => {
          loader.load(
            url,
            (texture) => {
              texture.colorSpace = THREE.SRGBColorSpace;
              resolve(texture);
            },
            undefined,
            reject,
          );
        });
      }

      async function loadTextures() {
        textures = {
          right: await loadTexture(IMAGES.right),
          left: await loadTexture(IMAGES.left),
          bottom: await loadTexture(IMAGES.bottom),
          top: await loadTexture(IMAGES.top),
          front: await loadTexture(IMAGES.front),
          back: await loadTexture(IMAGES.back),
        };
      }

      function cloneTextureTile(texture, col, row) {
        const t = texture.clone();

        t.colorSpace = THREE.SRGBColorSpace;
        t.wrapS = THREE.ClampToEdgeWrapping;
        t.wrapT = THREE.ClampToEdgeWrapping;

        const gridSize = CONFIG.GRID_SIZE;

        const imageAspect = texture.image.width / texture.image.height;
        const faceAspect = 1;

        let coverRepeatX = 1;
        let coverRepeatY = 1;
        let coverOffsetX = 0;
        let coverOffsetY = 0;

        // Apply cover crop to the full face first
        if (imageAspect > faceAspect) {
          coverRepeatX = faceAspect / imageAspect;
          coverOffsetX = (1 - coverRepeatX) * 0.5;
        } else {
          coverRepeatY = imageAspect / faceAspect;
          coverOffsetY = (1 - coverRepeatY) * 0.5;
        }

        // Then slice the already-covered face into grid tiles
        const tileRepeatX = coverRepeatX / gridSize;
        const tileRepeatY = coverRepeatY / gridSize;

        const tileOffsetX = coverOffsetX + col * tileRepeatX;
        const tileOffsetY = coverOffsetY + (gridSize - 1 - row) * tileRepeatY;

        t.repeat.set(tileRepeatX, tileRepeatY);
        t.offset.set(tileOffsetX, tileOffsetY);

        t.needsUpdate = true;

        return t;
      }

      function makeMaterial(texture, col, row) {
        return new THREE.MeshStandardMaterial({
          map: cloneTextureTile(texture, col, row),
          transparent: true,
          opacity: 1,
          roughness: CONFIG.ROUGHNESS,
          metalness: CONFIG.METALNESS,
          depthWrite: true,
          depthTest: true,
        });
      }

      function makeDarkMaterial() {
        return new THREE.MeshStandardMaterial({
          color: 0x080808,
          transparent: true,
          opacity: 1,
          roughness: CONFIG.ROUGHNESS,
          metalness: CONFIG.METALNESS,
          depthWrite: true,
          depthTest: true,
        });
      }

      function setMaterialOpacity(mesh, opacity) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

        materials.forEach((mat) => {
          mat.opacity = opacity;
        });
      }

      function makeFaceMaterials(x, y, z, grid, dark) {
        const isRight = x === grid - 1;
        const isLeft = x === 0;
        const isTop = y === grid - 1;
        const isBottom = y === 0;
        const isFront = z === grid - 1;
        const isBack = z === 0;

        return [
          // RIGHT
          isRight ? makeMaterial(textures.right, grid - 1 - z, grid - 1 - y) : dark,

          // LEFT
          isLeft ? makeMaterial(textures.left, z, grid - 1 - y) : dark,

          // TOP
          isTop ? makeMaterial(textures.top, x, grid - 1 - z) : dark,

          // BOTTOM
          isBottom ? makeMaterial(textures.bottom, x, grid - 1 - z) : dark,

          // FRONT
          isFront ? makeMaterial(textures.front, x, grid - 1 - y) : dark,

          // BACK
          isBack ? makeMaterial(textures.back, grid - 1 - x, grid - 1 - y) : dark,
        ];
      }

      function getLayerFall(layerIndex) {
        let multiplier = 1;

        if (layerIndex === 1) multiplier = TRANSITION.TI_MID_LAYER_FALL_MULT;
        if (layerIndex === 2) multiplier = TRANSITION.TI_BOTTOM_LAYER_FALL_MULT;

        return TRANSITION.TI_TOP_LAYER_FALL * multiplier + Math.random() * TRANSITION.TI_LAYER_FALL_VARIANCE;
      }

      function buildCubelets() {
        const grid = CONFIG.GRID_SIZE;
        const spacing = CONFIG.CUBELET_SIZE + CONFIG.CUBELET_GAP;
        const offset = ((grid - 1) * spacing) / 2;

        for (let x = 0; x < grid; x++) {
          for (let y = 0; y < grid; y++) {
            for (let z = 0; z < grid; z++) {
              const dark = makeDarkMaterial();
              const imageMaterials = makeFaceMaterials(x, y, z, grid, dark);

              const geometry = new THREE.BoxGeometry(CONFIG.CUBELET_SIZE, CONFIG.CUBELET_SIZE, CONFIG.CUBELET_SIZE);

              const cubelet = new THREE.Mesh(geometry, imageMaterials);
              cubelet.renderOrder = 0;

              const baseGrid = {
                x: x - 1,
                y: y - 1,
                z: z - 1,
              };

              const builtPosition = new THREE.Vector3(x * spacing - offset, y * spacing - offset, z * spacing - offset);

              cubelet.userData.baseGrid = baseGrid;
              cubelet.userData.grid = {
                ...baseGrid,
              };
              cubelet.userData.builtPosition = builtPosition;
              cubelet.userData.builtQuaternion = new THREE.Quaternion();

              cubelet.userData.fieldPosition = makeRubikFieldPosition(builtPosition);
              cubelet.userData.fieldScale = makeFieldScale();
              cubelet.userData.fieldQuaternion = makeFieldQuaternion(cubelet.userData.builtQuaternion);
              cubelet.userData.toStagger = Math.random() * TRANSITION.RUBIK_TO_STAGGER_MAX;

              cubelet.position.copy(builtPosition);
              cubelet.scale.setScalar(CONFIG.BUILT_CUBE_SCALE);
              setMaterialOpacity(cubelet, 0);

              cubeGroup.add(cubelet);
              cubelets.push(cubelet);
            }
          }
        }
      }

      function resetToSolvedState() {
        cubelets.forEach((cubelet) => {
          cubelet.position.copy(cubelet.userData.builtPosition);
          cubelet.quaternion.copy(cubelet.userData.builtQuaternion);
          cubelet.scale.setScalar(CONFIG.BUILT_CUBE_SCALE);
          cubelet.userData.grid = {
            ...cubelet.userData.baseGrid,
          };
        });
      }

      function captureScrambledState() {
        resetToSolvedState();

        SCRAMBLE_MOVES.forEach((move) => {
          applyMove(move, 1, true);
        });

        let minY = Infinity;
        let maxY = -Infinity;

        cubelets.forEach((cubelet) => {
          minY = Math.min(minY, cubelet.position.y);
          maxY = Math.max(maxY, cubelet.position.y);
        });

        const yRange = Math.max(maxY - minY, 0.0001);

        cubelets.forEach((cubelet) => {
          const scrambledPosition = cubelet.position.clone();

          cubelet.userData.scrambledPosition = scrambledPosition;
          cubelet.userData.scrambledQuaternion = cubelet.quaternion.clone();
          cubelet.userData.scrambledGrid = {
            ...cubelet.userData.grid,
          };

          const visualTopToBottom = (maxY - scrambledPosition.y) / yRange;
          const layerIndex = Math.round(visualTopToBottom * (CONFIG.GRID_SIZE - 1));
          const fall = getLayerFall(layerIndex);

          cubelet.userData.introPosition = scrambledPosition.clone();
          cubelet.userData.introPosition.y -= fall;

          const wave = ((scrambledPosition.x + scrambledPosition.z) / 6 + 0.5) * TRANSITION.TI_LAYER_WAVE;

          cubelet.userData.tiDelay = layerIndex * TRANSITION.TI_LAYER_STAGGER + wave;
          cubelet.userData.tiDuration = Math.max(0.3, 1 - cubelet.userData.tiDelay);
        });
      }

      function applyScrambledState() {
        cubelets.forEach((cubelet) => {
          cubelet.position.copy(cubelet.userData.scrambledPosition);
          cubelet.quaternion.copy(cubelet.userData.scrambledQuaternion);
          cubelet.scale.setScalar(CONFIG.BUILT_CUBE_SCALE);
          cubelet.userData.grid = {
            ...cubelet.userData.scrambledGrid,
          };
          setMaterialOpacity(cubelet, 1);
        });
      }

      function applyRubikSolve(progress) {
        if (progress <= 0.0001) {
          applyScrambledState();
          return;
        }

        resetToSolvedState();

        SCRAMBLE_MOVES.forEach((move) => {
          applyMove(move, 1, true);
        });

        const totalMoves = SOLVE_MOVES.length;
        const timeline = progress * totalMoves;

        for (let i = 0; i < totalMoves; i++) {
          const moveStart = i;
          const moveEnd = i + 1;

          let amount = 0;

          if (timeline >= moveEnd) {
            amount = 1;
          } else if (timeline > moveStart) {
            amount = timeline - moveStart;
          }

          if (amount <= 0) continue;

          applyMove(SOLVE_MOVES[i], amount, amount >= 1);
        }

        cubelets.forEach((cubelet) => {
          cubelet.scale.setScalar(CONFIG.BUILT_CUBE_SCALE);
          setMaterialOpacity(cubelet, 1);
        });
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
            uNearDistance: {
              value: CONFIG.FLOAT_NEAR_DISTANCE,
            },
            uFarDistance: {
              value: CONFIG.FLOAT_FAR_DISTANCE,
            },
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

          const introPosition = finalPosition.clone();
          introPosition.y += TRANSITION.TI_FLOAT_FROM_Y;

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
        sectionEl = sectionEl || document.getElementById('vis-3');
        if (!sectionEl) return;

        const rect = sectionEl.getBoundingClientRect();
        const sectionTop = window.scrollY + rect.top;
        const sectionHeight = sectionEl.offsetHeight;

        const localY = typeof progress.shiftedLocalY === 'number' ? progress.shiftedLocalY : window.scrollY - sectionTop;

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
        const cubeFadeT = easeOutCubic(mapRange(tiProgress, pct(TRANSITION.TI_CUBE_FADE_START), pct(TRANSITION.TI_CUBE_FADE_END), 0, 1));

        const floatT = easeOutCubic(mapRange(tiProgress, 0, pct(TRANSITION.TI_FLOAT_END), 0, 1));

        const rubikTimeline = mapRange(tiProgress, pct(TRANSITION.TI_RUBIK_START), pct(TRANSITION.TI_RUBIK_END), 0, 1);

        cubelets.forEach((cubelet) => {
          const delayed = clamp01((rubikTimeline - cubelet.userData.tiDelay) / Math.max(cubelet.userData.tiDuration, 0.0001));

          const t = easeInOutCubic(Math.pow(delayed, TRANSITION.TI_EASE_POWER));

          cubelet.position.lerpVectors(cubelet.userData.introPosition, cubelet.userData.scrambledPosition, t);

          cubelet.quaternion.copy(cubelet.userData.scrambledQuaternion);
          cubelet.scale.setScalar(CONFIG.BUILT_CUBE_SCALE);
          cubelet.userData.grid = {
            ...cubelet.userData.scrambledGrid,
          };
          setMaterialOpacity(cubelet, cubeFadeT);
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
        const solveProgress = mapRange(msProgress, pct(TRANSITION.MS_SOLVE_START), pct(TRANSITION.MS_SOLVE_END), 0, 1);

        applyRubikSolve(solveProgress);
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

          cubelet.position.lerpVectors(cubelet.userData.builtPosition, cubelet.userData.fieldPosition, moveT);

          cubelet.quaternion.slerpQuaternions(cubelet.userData.builtQuaternion, cubelet.userData.fieldQuaternion, moveT);

          const scale = CONFIG.BUILT_CUBE_SCALE + (cubelet.userData.fieldScale - CONFIG.BUILT_CUBE_SCALE) * moveT;

          cubelet.scale.setScalar(Math.max(scale, 0.0001));
          cubelet.userData.grid = {
            ...cubelet.userData.baseGrid,
          };
          setMaterialOpacity(cubelet, fadeT);
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
        applyTimeline();
        updateRotationAndTransform();
      }

      return {
        async init() {
          sectionEl = document.getElementById('vis-3');

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

  initMoves();
  buildCubelets();
  buildFloatingCubes();
  captureScrambledState();

  isBuilt = true;
  applyCurrentStateAfterLoad();

  window.AIM_VIS3_READY = true;

  window.dispatchEvent(
    new CustomEvent('aimVisualReady', {
      detail: { id: 'vis-3' },
    })
  );

} catch (error) {
  console.error('Vis 3 texture load failed:', error);
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
          applyTimeline();
          updateRotationAndTransform();
        },

        exit() {
          isActive = false;
          masterGroup.visible = false;

          window.removeEventListener('pointermove', onPointerMove);
        },

        resize() {
          updateTransitionProgress();
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

    window.AIM.register('vis-3', Vis3);
  })();
