import "./three";
import "./shaders";
import "./postprocessing";
import "./helpers";
import "./styles.css";

const PI = 3.14;

function _toLineSegments(geometry, materialOptions = {}) {
  return new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({
      color: COLORS.DARK,
      ...materialOptions
    })
  );
}

function _toTransparentFilledMesh(geometry, materialOptions = {}) {
  return new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: COLORS.DARK,
      transparent: true,
      opacity: 0.05,
      ...materialOptions
    })
  );
}

const COLORS = {
  LIGHT: "#dfd8d1",
  DARK: "#3d3a4b"
};

//================================

var controls;
var scene, renderer, camera, saturn, light, effect, boxOuterLines, cyliGroup;
var WIDTH = window.innerWidth,
  HEIGHT = window.innerHeight;
var mainGroup;

function initScene() {
  scene = new THREE.Scene();

  // Perspective or Orthographic
  // Field of view : I use 75, play with it
  // Aspect ratio : width / height of the screen
  // near and far plane : I usually set them at .1 and 2000
  /*
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );
  */
  camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 2000);
  camera.position.z = 20;

  //
  // THE RENDERER
  //

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  // renderer = new THREE.CanvasRenderer();
  // renderer.setClearColor(0xf0f0f0);
  renderer.setSize(WIDTH, HEIGHT);
  renderer.setPixelRatio(window.devicePixelRatio);
  // renderer.toneMapping = THREE.ReinhardToneMapping;
  // renderer.setClearColor(0x000000, 1.0)
  // renderer.shadowMap.enabled = true;

  // Make the renderer use the #world div to render le scene
  const worldContainer = document.getElementById("world");
  worldContainer.appendChild(renderer.domElement);
  worldContainer.style.background = COLORS.LIGHT;

  //
  // LIGHT
  //
  // test these
  // var globalLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  // var ambiantLight = new THREE.AmbientLight( globalColor );
  // var pointLight = new THREE.PointLight(color, intensity, radius, decay);
  // var directionalLight = new THREE.DirectionlLight(color, intensity);
  // scene.add(new THREE.AmbientLight(0x222222));
  // light = new THREE.DirectionalLight(0xff0000);
  // light.position.set(10, 1, 20);
  // scene.add(light);

  // POSTPRO

  // composer = new THREE.EffectComposer(renderer);
  // composer.addPass(new THREE.RenderPass(scene, camera));

  // var posteffect = new THREE.ShaderPass(THREE.DotScreenShader);
  // posteffect.uniforms["scale"].value = 4;
  // composer.addPass(posteffect);

  // var posteffect = new THREE.ShaderPass(THREE.RGBShiftShader);
  // posteffect.uniforms["amount"].value = 0.0015;
  // posteffect.renderToScreen = true;

  // composer.addPass(posteffect);

  //
  // CONTROLS
  // used to rotate around the scene with the mouse
  // you can drag to rotate, scroll to zoom
  //;
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  //
  // HANDLE SCREEN RESIZE
  //
  window.addEventListener("resize", handleWindowResize, false);
}

function initWorld() {
  const BOX_SIZE = 2;

  var boxLines = _toLineSegments(
    new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE),
    { color: COLORS.LIGHT }
  );

  var boxInner = _toTransparentFilledMesh(
    new THREE.BoxGeometry(BOX_SIZE * 2, BOX_SIZE * 2, BOX_SIZE * 2)
  );

  boxOuterLines = _toLineSegments(
    new THREE.BoxGeometry(BOX_SIZE * 2, BOX_SIZE * 2, BOX_SIZE * 2)
  );

  var boxMesh = new THREE.Mesh(
    new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE),
    new THREE.MeshBasicMaterial({
      color: COLORS.DARK
    })
  );

  const coneRadius = Math.sqrt(2 * Math.pow(BOX_SIZE, 2));

  const coneGeometry = new THREE.ConeGeometry(coneRadius, BOX_SIZE, 4);
  const coneTopLines = _toLineSegments(coneGeometry);
  const coneTopFIlled = _toTransparentFilledMesh(coneGeometry);
  const coneBottomLines = _toLineSegments(coneGeometry);
  const coneBottomFIlled = _toTransparentFilledMesh(coneGeometry);

  coneBottomFIlled.position.y -= BOX_SIZE * 1.75;
  coneTopLines.position.y += BOX_SIZE * 1.75;
  coneTopFIlled.position.y += BOX_SIZE * 1.75;
  coneBottomLines.position.y -= BOX_SIZE * 1.75;

  coneTopLines.rotation.y = PI / 4;
  coneTopFIlled.rotation.y = PI / 4;
  coneBottomLines.rotation.y = PI / 4;
  coneBottomFIlled.rotation.y = PI / 4;
  coneBottomLines.rotation.x = PI;
  coneBottomFIlled.rotation.x = PI;

  var gridHelperY = new THREE.GridHelper(BOX_SIZE, BOX_SIZE);
  gridHelperY.position.y -= BOX_SIZE;

  var cyliGeometry = new THREE.CylinderGeometry(
    BOX_SIZE / 4,
    BOX_SIZE / 4,
    BOX_SIZE * 2
  );
  var cyliMaterial = new THREE.MeshBasicMaterial({
    color: COLORS.LIGHT
  });
  var cyli = new THREE.Mesh(cyliGeometry, cyliMaterial);
  var cilyLines = _toLineSegments(cyliGeometry, {
    color: COLORS.DARK
  });

  cyliGroup = new THREE.Group();
  cyliGroup.add(cyli);
  cyliGroup.add(cilyLines);

  mainGroup = new THREE.Group();
  mainGroup.add(boxMesh);
  mainGroup.add(boxLines);
  mainGroup.add(boxOuterLines);
  mainGroup.add(boxInner);
  mainGroup.add(cyliGroup);

  mainGroup.add(coneBottomFIlled);
  mainGroup.add(coneTopLines);
  mainGroup.add(coneTopFIlled);
  mainGroup.add(coneBottomLines);

  mainGroup.rotation.x = -(PI / 2);
  mainGroup.rotation.y = -(PI / 4);

  // mainGroup.add(gridHelper2);
  // mainGroup.add(helper);
  scene.add(mainGroup);

  // START THE LOOP
  loop();
}

const MAX_SCALE = 1.5;
let multiplier = -1;

function loop() {
  const scaleYAbs = Math.abs(mainGroup.scale.y);
  if (scaleYAbs >= MAX_SCALE) {
    multiplier *= -1;
  }
  mainGroup.scale.y += multiplier * 0.01;
  mainGroup.rotation.y -= 0.005;
  mainGroup.rotation.x -= 0.002;

  cyliGroup.rotation.y += 0.05;
  renderer.render(scene, camera);

  requestAnimationFrame(loop);
}

initScene();
initWorld();

function handleWindowResize() {
  // Recalculate Width and Height as they had changed
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  // Update the renderer and the camera
  renderer.setSize(WIDTH, HEIGHT);

  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}
