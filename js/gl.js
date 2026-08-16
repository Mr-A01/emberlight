/* ============================================================
   Emberlight — Three.js / WebGL module
   Armillary sphere + relic scenes used on home & craft sections.
   Exposes: initGL, killGL, Ember3D helpers
   ============================================================ */
(function (global) {
  'use strict';

  var glInst = [];
  var glRunning = false;
  var glIOs = [];
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function goldMat() {
    return new THREE.MeshStandardMaterial({
      color: 0xb08a52,
      metalness: 0.92,
      roughness: 0.32
    });
  }

  function Ember3D(canvas, builder, camZ) {
    this.canvas = canvas;
    var w = canvas.clientWidth || 300;
    var h = canvas.clientHeight || 300;
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    this.renderer.setSize(w, h, false);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 60);
    this.camera.position.set(0, 0, camZ || 6);

    this.scene.add(new THREE.HemisphereLight(0xffe2b8, 0x191009, 0.85));
    var key = new THREE.DirectionalLight(0xffc38a, 1.35);
    key.position.set(2.5, 3, 4);
    this.scene.add(key);
    var rim = new THREE.DirectionalLight(0x8fb0c9, 0.45);
    rim.position.set(-3, -1.5, -2);
    this.scene.add(rim);

    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.parts = builder(this.group);
    this.t = Math.random() * 9;
    this.active = false;
  }

  Ember3D.prototype.frame = function (dt) {
    this.t += dt;
    var g = this.group;
    var p = this.parts;
    g.rotation.y += dt * 0.22;
    g.position.y = Math.sin(this.t * 0.6) * 0.07;

    if (p.rings) {
      p.rings.forEach(function (r, i) {
        r.rotation.z += dt * (0.14 + i * 0.07);
        r.rotation.x += dt * (0.05 + i * 0.03);
      });
    }
    if (p.orbit) {
      var a = this.t * 0.5;
      p.orbit.position.set(Math.cos(a) * 1.5, Math.sin(a) * 0.35, Math.sin(a) * 0.6);
    }
    if (p.core) {
      p.core.material.emissiveIntensity = 0.75 + Math.sin(this.t * 1.4) * 0.25;
    }
    g.rotation.x = Math.sin(this.t * 0.2) * 0.08;
    this.renderer.render(this.scene, this.camera);
  };

  function buildArmillary(n) {
    return function (g) {
      var rings = [];
      var rad = [1, 0.78, 0.56, 0.9, 0.66];
      for (var i = 0; i < n; i++) {
        var m = new THREE.Mesh(
          new THREE.TorusGeometry(rad[i], 0.034 - i * 0.005, 20, 110),
          goldMat()
        );
        m.rotation.set(i * 1.1, i * 0.7, 0);
        rings.push(m);
        g.add(m);
      }
      var core = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 32, 32),
        new THREE.MeshStandardMaterial({
          color: 0x140d08,
          emissive: 0xd96f32,
          emissiveIntensity: 0.85,
          roughness: 0.5
        })
      );
      g.add(core);
      return { rings: rings, core: core };
    };
  }

  function buildRelic(g) {
    var gem = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.85, 0),
      new THREE.MeshStandardMaterial({
        color: 0x8f7a5c,
        metalness: 0.85,
        roughness: 0.42,
        flatShading: true
      })
    );
    var ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.016, 16, 120), goldMat());
    ring.rotation.x = 1.2;
    var orbit = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x140d08,
        emissive: 0xd96f32,
        emissiveIntensity: 1,
        roughness: 0.4
      })
    );
    g.add(gem, ring, orbit);
    return { rings: [gem, ring], orbit: orbit, core: orbit };
  }

  function initGL(scope) {
    if (!window.THREE) {
      Array.prototype.slice
        .call((scope || document).querySelectorAll('.gl'))
        .forEach(function (b) {
          b.classList.add('fail');
          b.style.opacity = 1;
        });
      return;
    }

    Array.prototype.slice
      .call((scope || document).querySelectorAll('.gl'))
      .forEach(function (box) {
        // avoid double-init
        if (box.querySelector('canvas')) return;
        var kind = box.getAttribute('data-gl');
        var canvas = document.createElement('canvas');
        box.appendChild(canvas);
        try {
          var inst = new Ember3D(
            canvas,
            kind === 'relic' ? buildRelic : buildArmillary(3),
            kind === 'relic' ? 5.2 : 5.4
          );
          glInst.push(inst);
          var io = new IntersectionObserver(
            function (es) {
              es.forEach(function (en) {
                inst.active = en.isIntersecting;
                if (en.isIntersecting && reduced) inst.frame(0.016);
              });
            },
            { rootMargin: '120px' }
          );
          io.observe(canvas);
          glIOs.push(io);
          if (reduced) box.style.opacity = 0.9;
        } catch (e) {
          box.classList.add('fail');
          box.style.opacity = 1;
        }
      });
  }

  function killGL() {
    glIOs.forEach(function (io) {
      io.disconnect();
    });
    glIOs = [];
    glInst.forEach(function (g) {
      try {
        g.renderer.dispose();
      } catch (e) {}
    });
    glInst = [];
  }

  // Lightweight animation loop – only runs when at least one scene is visible
  setInterval(function () {
    if (reduced || document.hidden || !glInst.length) return;
    var any = glInst.some(function (g) {
      return g.active;
    });
    if (any && !glRunning) {
      glRunning = true;
      var last = performance.now();
      (function loop(now) {
        var a = glInst.some(function (g) {
          return g.active;
        });
        if (!a) {
          glRunning = false;
          return;
        }
        requestAnimationFrame(loop);
        var dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        glInst.forEach(function (g) {
          if (g.active) g.frame(dt);
        });
      })(last);
    }
  }, 300);

  // Public API
  global.EmberGL = {
    initGL: initGL,
    killGL: killGL
  };
})(window);
