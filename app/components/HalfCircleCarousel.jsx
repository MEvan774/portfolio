"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// ── Data ───────────────────────────────────────────────────────────────────────
const PROJECTS = [
  { title: "Shenzhen Vanke Longgang Sports Mountain", category: "Sports",      year: "2023", img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80" },
  { title: "CapitaMall Skyview Chongqing",            category: "Retail",      year: "2022", img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=80" },
  { title: "N.E.O. Plaza Shanghai",                   category: "Mixed Use",   year: "2021", img: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900&q=80" },
  { title: "Wuhan Ski Resort Complex",                category: "Cultural",    year: "2024", img: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=900&q=80" },
  { title: "Vantone Centre Hangzhou",                 category: "Residential", year: "2020", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&q=80" },
  { title: "Cube Gallery Xiaoshan",                   category: "Cultural",    year: "2019", img: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=900&q=80" },
  { title: "Play Stack Rotterdam Plaza",              category: "Retail",      year: "2021", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=80" },
  { title: "Duhui Peninsula Kunming",                 category: "Mixed Use",   year: "2025", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80" },
];
const N = PROJECTS.length;

// ── Card geometry ──────────────────────────────────────────────────────────────
const CARD_W = 3.6;
const CARD_H = 2.4;
const BORDER = 0.16;

// ── Fan offsets per card (index 0 = bottom-right/front, index N-1 = top-left/back)
const FAN_DX = -0.34;
const FAN_DY =  0.0;
const FAN_DZ = -0.28;

// ── X-axis curvature: cards bend along a gentle arc ────────────────────────────
// Positive = curves outward (middle cards pushed further in -X), like a slight bowl
const CURVE_STRENGTH = 0.06;

// ── How far the selected card peeks from its resting position ──────────────────
const PEEK_X = 0.7;

// ── Tray placement ─────────────────────────────────────────────────────────────
const TRAY_X  =  3.2;
const TRAY_Y  = -0.5;
const TRAY_Z  =  1.0;
const TRAY_RX =  0.10;
const TRAY_RY = -0.32;

// ── Pivot point for tray rotation (tweak these to move the pivot) ──────────────
const PIVOT_X = 15.0;   // ← pivot X: further right = cards swing wider
const PIVOT_Z = -5.0;  // ← pivot Z: further back = more dramatic arc
const rotAmount = 0.01; // Amount of rotations the tray makes when scrolling

export default function StackCarousel() {
  const mountRef = useRef(null);
  const stateRef = useRef({ activeIdx: 0, _goTo: null, trayRotTarget: 0, trayRotCurrent: 0 });
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 200);
    camera.position.set(0, 4.4, 12);
    camera.lookAt(1.2, 0, 0);

    // ── Rounded rectangle ─────────────────────────────────────────────────────
    function roundedRect(w, h, r) {
      const s = new THREE.Shape();
      s.moveTo(-w/2+r, -h/2);
      s.lineTo( w/2-r, -h/2); s.quadraticCurveTo( w/2, -h/2,  w/2, -h/2+r);
      s.lineTo( w/2,  h/2-r); s.quadraticCurveTo( w/2,  h/2,  w/2-r,  h/2);
      s.lineTo(-w/2+r,  h/2); s.quadraticCurveTo(-w/2,  h/2, -w/2,  h/2-r);
      s.lineTo(-w/2, -h/2+r); s.quadraticCurveTo(-w/2, -h/2, -w/2+r, -h/2);
      return s;
    }

    const imgGeo    = new THREE.ShapeGeometry(roundedRect(CARD_W, CARD_H, 0.08));
    const borderGeo = new THREE.ShapeGeometry(roundedRect(CARD_W + BORDER*2, CARD_H + BORDER*2, 0.12));

    // Fix UVs
    {
      const p = imgGeo.attributes.position;
      const uv = [];
      for (let i = 0; i < p.count; i++) {
        uv.push((p.getX(i) + CARD_W/2) / CARD_W, (p.getY(i) + CARD_H/2) / CARD_H);
      }
      imgGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    }

    // ── Textures ──────────────────────────────────────────────────────────────
    const texCache = {};
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    function loadTex(url, mat) {
      if (texCache[url]) { mat.map = texCache[url]; mat.color.set(0xffffff); mat.needsUpdate = true; return; }
      loader.load(url, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        texCache[url] = t;
        mat.map = t; mat.color.set(0xffffff); mat.needsUpdate = true;
      });
    }

    // ── Build cards ───────────────────────────────────────────────────────────
    function makeCard(proj) {
      const group = new THREE.Group();

      const borderMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.96, depthWrite: false,
      });
      const bMesh = new THREE.Mesh(borderGeo, borderMat);
      bMesh.position.z = -0.006;
      group.add(bMesh);

      const imgMat = new THREE.MeshBasicMaterial({
        color: 0xb0b0b0, transparent: true, opacity: 1, depthWrite: false,
      });
      group.add(new THREE.Mesh(imgGeo, imgMat));
      loadTex(proj.img, imgMat);

      const shGeo = new THREE.PlaneGeometry(CARD_W + 0.8, CARD_H + 0.8);
      const shMat = new THREE.MeshBasicMaterial({
        color: 0x000000, transparent: true, opacity: 0.05, depthWrite: false,
      });
      const shMesh = new THREE.Mesh(shGeo, shMat);
      shMesh.position.set(0.1, -0.1, -0.015);
      group.add(shMesh);

      scene.add(group);
      return { group, imgMat, borderMat, shMat };
    }

    const cards = PROJECTS.map(makeCard);

    // ── Mouse parallax ────────────────────────────────────────────────────────
    const mouse  = { x: 0, y: 0 };
    const sMouse = { x: 0, y: 0 };
    const onMM = (e) => {
      const r = mount.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width  - 0.5;
      mouse.y = (e.clientY - r.top)  / r.height - 0.5;
    };
    mount.addEventListener("mousemove", onMM);

    // ── Resize ────────────────────────────────────────────────────────────────
    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // ── Target for each card ──────────────────────────────────────────────────
    function getTarget(cardIdx, activeIdx, rotX, rotY) {
      const slot = cardIdx;

      // Local fan position (linear)
      let lx = slot * FAN_DX;
      let ly = slot * FAN_DY;
      let lz = slot * FAN_DZ;

      // X-axis curvature: centered parabola — middle cards go furthest left,
      // cards at start (slot 0) and end (slot N-1) go furthest right.
      // We use -(midpoint² - distance²) so the center is the leftmost point.
      const mid = (N - 1) / 2;
      const distFromMid = slot - mid;
      lx += CURVE_STRENGTH * (distFromMid * distFromMid - mid * mid);

      // If this card is selected, peek it out
      if (cardIdx === activeIdx) {
        lx -= PEEK_X;
      }

      // Apply tray rotation (Y then X)
      const cy = Math.cos(rotY), sy = Math.sin(rotY);
      const cx = Math.cos(rotX), sx = Math.sin(rotX);

      const rx1 = lx * cy + lz * sy;
      const rz1 = -lx * sy + lz * cy;

      const ry2 = ly * cx - rz1 * sx;
      const rz2 = ly * sx + rz1 * cx;

      // Opacity/scale falloff
      const t = slot / Math.max(1, N - 1);
      let opacity = Math.max(0.10, 1.0 - t * 0.90);
      const scale = Math.max(0.55, 1.0 - slot * 0.05);
      const shadowOp = Math.max(0, 0.05 - slot * 0.006);

      if (cardIdx === activeIdx) {
        opacity = 1.0;
      }

      return {
        x:  TRAY_X + rx1,
        y:  TRAY_Y + ry2,
        z:  TRAY_Z + rz2,
        rx: rotX,
        ry: rotY,
        rz: 0,
        scale,
        imgOp:    opacity,
        borderOp: Math.min(0.96, opacity + 0.12),
        shadowOp,
      };
    }

    // ── Snap initial ──────────────────────────────────────────────────────────
    function snapAll(ai) {
      cards.forEach((c, i) => {
        const t = getTarget(i, ai, TRAY_RX, TRAY_RY);
        c.group.position.set(t.x, t.y, t.z);
        c.group.rotation.set(t.rx, t.ry, t.rz);
        c.group.scale.setScalar(t.scale);
        c.imgMat.opacity    = t.imgOp;
        c.borderMat.opacity = t.borderOp;
        c.shMat.opacity     = t.shadowOp;
      });
    }
    snapAll(0);

    // ── Navigation ────────────────────────────────────────────────────────────
    let acc = 0, lastSnap = 0;

    function goTo(next) {
      const now = Date.now();
      if (now - lastSnap < 260) return;
      next = Math.max(0, Math.min(N - 1, next));
      if (next === stateRef.current.activeIdx) return;
      stateRef.current.trayRotTarget = next * rotAmount;
      stateRef.current.activeIdx = next;
      setActiveIdx(next);
      lastSnap = now;
    }

    const onWheel = (e) => {
      e.preventDefault();
      acc += e.deltaY;
      if (Math.abs(acc) > 22) {
        goTo(stateRef.current.activeIdx + (acc > 0 ? 1 : -1));
        acc = 0;
      }
    };
    mount.addEventListener("wheel", onWheel, { passive: false });

    const onKey = (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goTo(stateRef.current.activeIdx + 1);
      if (e.key === "ArrowUp"   || e.key === "ArrowLeft")  goTo(stateRef.current.activeIdx - 1);
    };
    window.addEventListener("keydown", onKey);
    stateRef.current._goTo = goTo;

    // ── Animate ───────────────────────────────────────────────────────────────
    let raf;
    const LP = 0.065;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const active = stateRef.current.activeIdx;

      // Smooth tray Y rotation (slow lerp = visible lag/momentum)
      stateRef.current.trayRotCurrent +=
        (stateRef.current.trayRotTarget - stateRef.current.trayRotCurrent) * 0.045;
      const trayRotOffset = stateRef.current.trayRotCurrent;

      sMouse.x += (mouse.x - sMouse.x) * 0.035;
      sMouse.y += (mouse.y - sMouse.y) * 0.035;

      const rotX = TRAY_RX - sMouse.y * 0.06;
      const rotY = TRAY_RY + sMouse.x * 0.10;

      cards.forEach((c, i) => {
        const t = getTarget(i, active, rotX, rotY);

        // ── Rotate around pivot point (right of tray) ──────────────────────
        // Translate so pivot is at origin, rotate by trayRotOffset, translate back
        const dx = t.x - PIVOT_X;  // ← pivot X offset
        const dz = t.z - PIVOT_Z;  // ← pivot Z offset
        const cosR = Math.cos(-trayRotOffset);
        const sinR = Math.sin(-trayRotOffset);
        t.x = PIVOT_X + dx * cosR + dz * sinR;
        t.z = PIVOT_Z - dx * sinR + dz * cosR;
        // Right side of the card faces the pivot point
        t.ry = Math.atan2(PIVOT_X - t.x, PIVOT_Z - t.z) - Math.PI / 2;

        c.group.position.x += (t.x  - c.group.position.x) * LP;
        c.group.position.y += (t.y  - c.group.position.y) * LP;
        c.group.position.z += (t.z  - c.group.position.z) * LP;
        c.group.rotation.x += (t.rx - c.group.rotation.x) * LP;
        c.group.rotation.y += (t.ry - c.group.rotation.y) * LP;
        c.group.rotation.z += (t.rz - c.group.rotation.z) * LP;

        const cs = c.group.scale.x;
        c.group.scale.setScalar(cs + (t.scale - cs) * LP);

        c.imgMat.opacity    += (t.imgOp    - c.imgMat.opacity)    * LP;
        c.borderMat.opacity += (t.borderOp - c.borderMat.opacity) * LP;
        c.shMat.opacity     += (t.shadowOp - c.shMat.opacity)     * LP;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mount.removeEventListener("wheel", onWheel);
      mount.removeEventListener("mousemove", onMM);
      window.removeEventListener("keydown", onKey);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  const navigate = useCallback((n) => stateRef.current._goTo?.(n), []);
  const proj = PROJECTS[activeIdx];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Outfit:wght@200;300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;overflow:hidden;background:#f5f2ec}

        .sc-root{
          width:100vw;height:100vh;overflow:hidden;position:relative;
          background:#f5f2ec;font-family:'Outfit',sans-serif;color:#1a1a1a;
        }

        .sc-nav{
          position:fixed;top:0;left:0;right:0;z-index:50;
          display:flex;justify-content:space-between;align-items:center;
          padding:24px 44px;
        }
        .sc-logo{font-weight:900;font-size:18px;letter-spacing:0.08em}
        .sc-nav-links{list-style:none;display:flex;gap:32px}
        .sc-nav-links a{
          font-size:13px;font-weight:400;color:#1a1a1a;text-decoration:none;
          transition:opacity .2s;
        }
        .sc-nav-links a:hover{opacity:.5}

        .sc-sub{
          position:fixed;top:60px;left:0;right:0;z-index:50;
          display:flex;justify-content:space-between;padding:0 44px;
        }
        .sc-sub a{
          font-size:12px;font-weight:400;color:#1a1a1a;text-decoration:none;
          border-bottom:1px solid #1a1a1a;padding-bottom:2px;
        }

        .sc-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:1}
        .sc-canvas canvas{width:100%!important;height:100%!important;display:block}

        .sc-left{
          position:absolute;left:52px;top:120px;bottom:120px;
          width:42%;z-index:10;pointer-events:none;
          display:flex;flex-direction:column;justify-content:center;
        }
        .sc-info-block{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both}
        @keyframes fadeUp{
          from{opacity:0;transform:translateY(12px)}
          to{opacity:1;transform:translateY(0)}
        }
        .sc-category{
          font-size:11px;font-weight:400;letter-spacing:0.04em;
          color:#666;margin-bottom:12px;
        }
        .sc-title{
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(28px,3.2vw,52px);font-weight:300;
          line-height:1.08;color:#1a1a1a;max-width:500px;margin-bottom:24px;
        }
        .sc-view-link{
          font-size:12px;font-weight:400;color:#1a1a1a;
          text-decoration:none;border-bottom:1px solid #1a1a1a;
          padding-bottom:2px;display:inline-flex;align-items:center;gap:6px;
          pointer-events:all;transition:gap .2s;
        }
        .sc-view-link:hover{gap:12px}

        .sc-back{
          position:absolute;left:20px;bottom:20px;z-index:20;
          width:32px;height:32px;border:1px solid #ddd;border-radius:50%;
          background:none;color:#999;display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:all .2s;
        }
        .sc-back:hover{background:#1a1a1a;border-color:#1a1a1a;color:#fff}
        .sc-back svg{width:10px;height:10px}
      `}</style>

      <div className="sc-root" tabIndex={0}>
        <nav className="sc-nav">
          <div className="sc-logo">CLOU.</div>
          <ul className="sc-nav-links">
            <li><a href="#">Projects</a></li>
            <li><a href="#">Info</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </nav>

        <div className="sc-sub">
          <a href="#">Filter Projects +</a>
          <a href="#">Grid view +</a>
        </div>

        <div className="sc-canvas" ref={mountRef} />

        <div className="sc-left">
          <div className="sc-info-block" key={activeIdx}>
            <p className="sc-category">{proj.category}</p>
            <h2 className="sc-title">{proj.title}</h2>
            <a className="sc-view-link" href="#">View project +</a>
          </div>
        </div>

        <button className="sc-back" onClick={() => navigate(activeIdx - 1)}>
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </>
  );
}