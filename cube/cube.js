/*!
 * Mega hero cube: the designer's 3D M (client/2026-11-19 Logo To Deebs/GLTF), rendered live with Three.js.
 * Loaded by mega-motion.js only on desktops with a fine pointer, WebGL and no reduced-motion preference.
 * The still image (.hero_art_img) stays underneath until the cube is ready, and is the fallback everywhere else.
 *
 * Pose: orthographic camera fitted to the designer's render (yaw -27.25deg, pitch -15.5deg, 96% face agreement).
 * Framing: the shape sits where it does in mega-hero-3d.webp (x 246, y 30, 931 wide in a 1440 x 820 art box).
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.min.js";

// Indices (276 uint32), positions (112 vec3), normals (112 vec3), from the GLTF.
var GEOMETRY = "FQAAABYAAAAXAAAAFQAAABcAAAAYAAAAFAAAABUAAAAZAAAAGQAAABoAAAAUAAAAFQAAABgAAAAZAAAAFAAAABoAAAATAAAAGwAAABwAAAAaAAAAEwAAABoAAAAdAAAAHQAAABoAAAAcAAAAHgAAAB8AAAAQAAAAEgAAAB0AAAAeAAAAHQAAABIAAAATAAAAHgAAABEAAAASAAAAEQAAAB4AAAAQAAAABgAAAAUAAAAHAAAABwAAAAUAAAAIAAAABQAAAAQAAAAJAAAACgAAAAkAAAAEAAAACAAAAAUAAAAJAAAACgAAAAQAAAADAAAADAAAAAsAAAAKAAAACgAAAAMAAAANAAAACgAAAA0AAAAMAAAADwAAAA4AAAAAAAAADQAAAAIAAAAOAAAAAgAAAA0AAAADAAAAAQAAAA4AAAACAAAADgAAAAEAAAAAAAAAIAAAADAAAAAyAAAAIAAAADIAAABSAAAAIAAAAFIAAABQAAAAIAAAAFAAAAAwAAAAIQAAADMAAAA0AAAAIQAAADQAAABUAAAAIQAAAFQAAABTAAAAIQAAAFMAAAAzAAAAIgAAADUAAAA2AAAAIgAAADYAAABWAAAAIgAAAFYAAABVAAAAIgAAAFUAAAA1AAAAIwAAADcAAAA4AAAAIwAAADgAAABYAAAAIwAAAFgAAABXAAAAIwAAAFcAAAA3AAAAJAAAADkAAAA6AAAAJAAAADoAAABaAAAAJAAAAFoAAABZAAAAJAAAAFkAAAA5AAAAJQAAADsAAAA8AAAAJQAAADwAAABcAAAAJQAAAFwAAABbAAAAJQAAAFsAAAA7AAAAJgAAAD0AAAA+AAAAJgAAAD4AAABeAAAAJgAAAF4AAABdAAAAJgAAAF0AAAA9AAAAJwAAAD8AAABAAAAAJwAAAEAAAABgAAAAJwAAAGAAAABfAAAAJwAAAF8AAAA/AAAAKAAAAEEAAABCAAAAKAAAAEIAAABiAAAAKAAAAGIAAABhAAAAKAAAAGEAAABBAAAAKQAAAEMAAABEAAAAKQAAAEQAAABkAAAAKQAAAGQAAABjAAAAKQAAAGMAAABDAAAAKgAAAEUAAABGAAAAKgAAAEYAAABmAAAAKgAAAGYAAABlAAAAKgAAAGUAAABFAAAAKwAAAEcAAABIAAAAKwAAAEgAAABoAAAAKwAAAGgAAABnAAAAKwAAAGcAAABHAAAALAAAAEkAAABKAAAALAAAAEoAAABqAAAALAAAAGoAAABpAAAALAAAAGkAAABJAAAALQAAAEsAAABMAAAALQAAAEwAAABsAAAALQAAAGwAAABrAAAALQAAAGsAAABLAAAALgAAAE0AAABOAAAALgAAAE4AAABuAAAALgAAAG4AAABtAAAALgAAAG0AAABNAAAALwAAAE8AAAAxAAAALwAAADEAAABRAAAALwAAAFEAAABvAAAALwAAAG8AAABPAAAAxq6JPllpV75liGO+xq6JPlppVz5liGO+15j6PFppVz5liGO+2Jj6PPOu4T1liGO+OhYtvvKu4T1liGO+OhYtvhBYJDxliGO+xq6Jvg1YJDxliGO+xq6JvlppV75liGO+kLDwvVppV75liGO+kbDwvRJYJDxliGO+z52NvRRYJDxliGO+zp2NvVppV75liGO+GiKoPVppV75liGO+GSKoPfOu4T1liGO+bpoFPvOu4T1liGO+bpoFPlppV75liGO+xq6JPllpV75liGM+xq6JPlppVz5liGM+15j6PFppVz5liGM+2Jj6PPOu4T1liGM+OhYtvvKu4T1liGM+OhYtvhBYJDxliGM+xq6Jvg1YJDxliGM+xq6JvlppV75liGM+kLDwvVppV75liGM+kbDwvRJYJDxliGM+z52NvRRYJDxliGM+zp2NvVppV75liGM+GiKoPVppV75liGM+GSKoPfOu4T1liGM+bpoFPvOu4T1liGM+bpoFPlppV75liGM+xq6JPiihBzIAAAAAU1gZPlppVz4AAAAA2Jj6PGogJD4AAAAAH8ONvfKu4T0AAAAAOhYtvvQ5dj0AAAAA4zlgvg9YJDwAAAAAxq6Jvtojzb0AAAAA6tpFvlppV74AAAAAkLDwvdkjzb0AAAAAMCe/vRNYJDwAAAAAzp2Nvdkjzb0AAAAAYyLUO1ppV74AAAAAGiKoPcEjTb0AAAAAeqvZPfOu4T0AAAAAbpoFPsAjTb0AAAAA/XtMPlppV74AAAAAxq6JPllpV75liGO+xq6JPllpV75liGO+xq6JPlppVz5liGO+xq6JPlppVz5liGO+15j6PFppVz5liGO+15j6PFppVz5liGO+2Jj6PPOu4T1liGO+2Jj6PPOu4T1liGO+OhYtvvKu4T1liGO+OhYtvvKu4T1liGO+OhYtvhBYJDxliGO+OhYtvhBYJDxliGO+xq6Jvg1YJDxliGO+xq6Jvg1YJDxliGO+xq6JvlppV75liGO+xq6JvlppV75liGO+kLDwvVppV75liGO+kLDwvVppV75liGO+kbDwvRJYJDxliGO+kbDwvRJYJDxliGO+z52NvRRYJDxliGO+z52NvRRYJDxliGO+zp2NvVppV75liGO+zp2NvVppV75liGO+GiKoPVppV75liGO+GiKoPVppV75liGO+GSKoPfOu4T1liGO+GSKoPfOu4T1liGO+bpoFPvOu4T1liGO+bpoFPvOu4T1liGO+bpoFPlppV75liGO+bpoFPlppV75liGO+xq6JPllpV75liGM+xq6JPllpV75liGM+xq6JPlppVz5liGM+xq6JPlppVz5liGM+15j6PFppVz5liGM+15j6PFppVz5liGM+2Jj6PPOu4T1liGM+2Jj6PPOu4T1liGM+OhYtvvKu4T1liGM+OhYtvvKu4T1liGM+OhYtvhBYJDxliGM+OhYtvhBYJDxliGM+xq6Jvg1YJDxliGM+xq6Jvg1YJDxliGM+xq6JvlppV75liGM+xq6JvlppV75liGM+kLDwvVppV75liGM+kLDwvVppV75liGM+kbDwvRJYJDxliGM+kbDwvRJYJDxliGM+z52NvRRYJDxliGM+z52NvRRYJDxliGM+zp2NvVppV75liGM+zp2NvVppV75liGM+GiKoPVppV75liGM+GiKoPVppV75liGM+GSKoPfOu4T1liGM+GSKoPfOu4T1liGM+bpoFPvOu4T1liGM+bpoFPvOu4T1liGM+bpoFPlppV75liGM+bpoFPlppV75liGM+AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AACAP7Eu/DIAAAAAsS78sgAAgD8AAAAAAACAv7Eu/LIAAAAAsS78sgAAgD8AAAAAAACAv7Eu/LIAAAAAsS78sgAAgD8AAAAAAACAv7Eu/LIAAAAAsS78MgAAgL8AAAAAAACAP7Eu/DIAAAAAsS78MgAAgL8AAAAAAACAv7Eu/LIAAAAAsS78MgAAgL8AAAAAAACAP7Eu/DIAAAAAsS78MgAAgL8AAAAAAACAv7Eu/LIAAAAAsS78MgAAgL8AAAAAAACAP7Eu/DIAAAAAsS78MgAAgL8AAAAAAACAP7Eu/DIAAAAAsS78sgAAgD8AAAAAsS78sgAAgD8AAAAAAACAv7Eu/LIAAAAAAACAv7Eu/LIAAAAAsS78sgAAgD8AAAAAsS78sgAAgD8AAAAAAACAv7Eu/LIAAAAAAACAv7Eu/LIAAAAAsS78sgAAgD8AAAAAsS78sgAAgD8AAAAAAACAv7Eu/LIAAAAAAACAv7Eu/LIAAAAAsS78MgAAgL8AAAAAsS78MgAAgL8AAAAAAACAP7Eu/DIAAAAAAACAP7Eu/DIAAAAAsS78MgAAgL8AAAAAsS78MgAAgL8AAAAAAACAv7Eu/LIAAAAAAACAv7Eu/LIAAAAAsS78MgAAgL8AAAAAsS78MgAAgL8AAAAAAACAP7Eu/DIAAAAAAACAP7Eu/DIAAAAAsS78MgAAgL8AAAAAsS78MgAAgL8AAAAAAACAv7Eu/LIAAAAAAACAv7Eu/LIAAAAAsS78MgAAgL8AAAAAAACAP7Eu/DIAAAAAsS78MgAAgL8AAAAAAACAP7Eu/DIAAAAAsS78sgAAgD8AAAAAsS78sgAAgD8AAAAAAACAv7Eu/LIAAAAAAACAv7Eu/LIAAAAAsS78sgAAgD8AAAAAsS78sgAAgD8AAAAAAACAv7Eu/LIAAAAAAACAv7Eu/LIAAAAAsS78sgAAgD8AAAAAsS78sgAAgD8AAAAAAACAv7Eu/LIAAAAAAACAv7Eu/LIAAAAAsS78MgAAgL8AAAAAsS78MgAAgL8AAAAAAACAP7Eu/DIAAAAAAACAP7Eu/DIAAAAAsS78MgAAgL8AAAAAsS78MgAAgL8AAAAAAACAv7Eu/LIAAAAAAACAv7Eu/LIAAAAAsS78MgAAgL8AAAAAsS78MgAAgL8AAAAAAACAP7Eu/DIAAAAAAACAP7Eu/DIAAAAAsS78MgAAgL8AAAAAsS78MgAAgL8AAAAAAACAv7Eu/LIAAAAAAACAv7Eu/LIAAAAAsS78MgAAgL8AAAAA";

// Everything worth tuning on staging. Change here, or live: window.megaCube.settings.
export var settings = {
  color: 0x1b1c1d,        // the GLTF's base colour
  roughness: 0.4,         // the GLTF's roughness
  ambient: 2.4,           // fills the left faces (render: ~22/255)
  front: 0.25,            // soft front light on the slotted M face (render: ~28/255)
  key: 3.4,               // light from the right of the M: lights the step tops, casts the soft step shadows
  keyPosition: [1.2, 2.4, 0.3],
  shadowSoftness: 30,
  yaw: 8,                 // degrees the cube turns with the pointer, left/right
  pitch: 5,               // degrees up/down
  follow: 0.06,           // how quickly it catches up with the pointer (0..1 per frame); lower = softer lag
  lightFollow: 0.6,       // how far the key light slides with the pointer
  drift: 1.2,             // idle breathing, degrees
  driftSeconds: 9,
  fadeIn: 0.8,            // seconds for the cube to take over from the still image
};

var POSE = { yaw: -27.25, pitch: -15.5 };
var ART = { w: 1440, h: 820, left: 246, top: 30, width: 931 };

function decode() {
  var bin = atob(GEOMETRY), bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  var buf = bytes.buffer;
  return {
    index: new Uint32Array(buf, 0, 276),
    position: new Float32Array(buf, 1104, 336),
    normal: new Float32Array(buf, 2448, 336),
  };
}

// The same fade that is baked into mega-hero-3d.webp (see docs/2026-11-20-hero-art/compose.cjs),
// as a mask image in art-box units, so the live cube dissolves into the page exactly like the still.
function fadeMask() {
  var W = 288, H = 164, s = W / ART.w;
  var c = document.createElement("canvas"); c.width = W; c.height = H;
  var x = c.getContext("2d"), d = x.createImageData(W, H);
  var T = [[200,1],[260,.976],[320,.91],[360,.84],[400,.75],[440,.64],[480,.52],[520,.40],[560,.29],[600,.19],[640,.10],[680,.04],[720,.01],[760,0]];
  var f = function (v) { if (v <= T[0][0]) return 1; for (var i = 1; i < T.length; i++) if (v <= T[i][0]) { return T[i-1][1] + (T[i][1] - T[i-1][1]) * (v - T[i-1][0]) / (T[i][0] - T[i-1][0]); } return 0; };
  for (var yy = 0; yy < H; yy++) {
    var y = yy / s, ov = y <= 393.6 ? 1 : Math.max(0, 1 - (y - 393.6) / 426.4);
    for (var xx = 0; xx < W; xx++) {
      var a = f(y + 0.15 * (xx / s - 700)) * ov;
      d.data[(yy * W + xx) * 4 + 3] = Math.round(a * 255);
    }
  }
  x.putImageData(d, 0, 0);
  return c.toDataURL("image/png");
}

export function start(opts) {
  var img = opts.image, holder = img.parentElement, gsap = window.gsap;
  var S = settings;

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.className = "hero_art_canvas";
  var mask = "url(" + fadeMask() + ")";
  Object.assign(canvas.style, {
    position: "absolute", pointerEvents: "none", opacity: "0",
    maskImage: mask, webkitMaskImage: mask, maskSize: "100% 100%", webkitMaskSize: "100% 100%",
  });
  holder.appendChild(canvas);

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  var g = decode();
  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(g.position, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(g.normal, 3));
  geo.setIndex(new THREE.BufferAttribute(g.index, 1));

  var scene = new THREE.Scene();
  var material = new THREE.MeshStandardMaterial({ color: S.color, roughness: S.roughness, metalness: 0 });
  var mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = mesh.receiveShadow = true;
  var pivot = new THREE.Group(); pivot.add(mesh); scene.add(pivot);

  var ambient = new THREE.AmbientLight(0xffffff, S.ambient); scene.add(ambient);
  var front = new THREE.DirectionalLight(0xffffff, S.front); front.position.set(0, 0, 1); scene.add(front);
  var key = new THREE.DirectionalLight(0xffffff, S.key);
  key.position.fromArray(S.keyPosition);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = S.shadowSoftness; key.shadow.blurSamples = 25;
  key.shadow.bias = -0.0005; key.shadow.normalBias = 0.002;
  Object.assign(key.shadow.camera, { left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 10 });
  scene.add(key);

  // Camera fixed at the fitted pose; the cube turns, so the lights stay put and the shading moves across it.
  var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
  var dir = new THREE.Vector3(0, 0, 1).applyEuler(new THREE.Euler(THREE.MathUtils.degToRad(POSE.pitch), THREE.MathUtils.degToRad(POSE.yaw), 0, "YXZ"));
  camera.position.copy(dir.multiplyScalar(5)); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();

  // The shape's projected box at rest, in view units.
  var box = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9 }, v = new THREE.Vector3();
  for (var i = 0; i < g.position.length; i += 3) {
    v.set(g.position[i], g.position[i + 1], g.position[i + 2]).applyMatrix4(camera.matrixWorldInverse);
    box.x0 = Math.min(box.x0, v.x); box.x1 = Math.max(box.x1, v.x); box.y0 = Math.min(box.y0, v.y); box.y1 = Math.max(box.y1, v.y);
  }

  // Sit the canvas exactly over the still image, and frame the shape where the still has it.
  function layout() {
    var r = img.getBoundingClientRect(), h = holder.getBoundingClientRect();
    if (!r.width) return;
    Object.assign(canvas.style, { left: (r.left - h.left) + "px", top: (r.top - h.top) + "px", width: r.width + "px", height: r.height + "px" });
    renderer.setSize(r.width, r.height, false);
    var perPx = (box.x1 - box.x0) / (ART.width / ART.w * r.width);
    camera.left = box.x0 - (ART.left / ART.w) * r.width * perPx;
    camera.right = camera.left + r.width * perPx;
    camera.top = box.y1 + (ART.top / ART.h) * r.height * perPx;
    camera.bottom = camera.top - r.height * perPx;
    camera.updateProjectionMatrix();
  }
  layout();
  new ResizeObserver(layout).observe(img);

  // Pointer: -1..1 across the window. Leaving the window eases back to the designed pose.
  var target = { x: 0, y: 0 }, now = { x: 0, y: 0 };
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", function () { target.x = target.y = 0; });

  // Only draw while the hero is on screen.
  var visible = true;
  new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }).observe(holder);

  var t0 = performance.now();
  function frame() {
    if (!visible) return;
    now.x += (target.x - now.x) * S.follow;
    now.y += (target.y - now.y) * S.follow;
    var t = (performance.now() - t0) / 1000, w = (Math.PI * 2) / S.driftSeconds;
    var d2r = Math.PI / 180;
    pivot.rotation.y = (now.x * S.yaw + Math.sin(t * w) * S.drift) * d2r;
    pivot.rotation.x = (now.y * S.pitch + Math.sin(t * w * 0.7 + 1) * S.drift * 0.5) * d2r;
    key.position.set(S.keyPosition[0] + now.x * S.lightFollow, S.keyPosition[1] - now.y * S.lightFollow * 0.5, S.keyPosition[2]);
    ambient.intensity = S.ambient; front.intensity = S.front; key.intensity = S.key;
    renderer.render(scene, camera);
  }
  renderer.render(scene, camera);
  gsap.ticker.add(frame);

  // Take over from the still image: the canvas fades in over it, then the image is hidden underneath.
  return new Promise(function (resolve) {
    gsap.to(canvas, {
      opacity: 1, duration: S.fadeIn, ease: "power2.inOut",
      onComplete: function () { img.style.visibility = "hidden"; resolve(); },
    });
    window.megaCube = { settings: S, renderer: renderer, scene: scene, layout: layout };
  });
}
