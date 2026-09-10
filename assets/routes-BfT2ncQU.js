import { n as getReact, r as interopDefault, t as getJsx } from "./index-BhRP3WX5.js";

const React = interopDefault(getReact());
const _ = getJsx();

// Utility for CSS class merging
const cn = (...classes) => classes.filter((c, i, arr) => !!c && c.trim() !== "" && arr.indexOf(c) === i).join(" ").trim();

// SVG Icons
const svgProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

const createIcon = (name, iconNode) => {
  const IconComponent = React.forwardRef(({ className = "", color = "currentColor", size = 24, strokeWidth = 2, ...props }, ref) => {
    return React.createElement(
      "svg",
      {
        ref,
        ...svgProps,
        width: size,
        height: size,
        stroke: color,
        strokeWidth,
        className: cn("lucide", `lucide-${name}`, className),
        "aria-hidden": "true",
        ...props
      },
      iconNode.map(([tag, attrs], idx) => React.createElement(tag, { ...attrs, key: idx }))
    );
  });
  IconComponent.displayName = name;
  return IconComponent;
};

const QrCodeIcon = createIcon("qr-code", [
  ["rect", { width: "5", height: "5", x: "3", y: "3", rx: "1" }],
  ["rect", { width: "5", height: "5", x: "16", y: "3", rx: "1" }],
  ["rect", { width: "5", height: "5", x: "3", y: "16", rx: "1" }],
  ["path", { d: "M21 16h-3a2 2 0 0 0-2 2v3" }],
  ["path", { d: "M21 21v.01" }],
  ["path", { d: "M12 7v3a2 2 0 0 1-2 2H7" }],
  ["path", { d: "M3 12h.01" }],
  ["path", { d: "M12 3h.01" }],
  ["path", { d: "M12 16v.01" }],
  ["path", { d: "M16 12h1" }],
  ["path", { d: "M21 12v.01" }],
  ["path", { d: "M12 21v-1" }]
]);

const RotateCcwIcon = createIcon("rotate-ccw", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }],
  ["path", { d: "M3 3v5h5" }]
]);

const ScanLineIcon = createIcon("scan-line", [
  ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2" }],
  ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2" }],
  ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2" }],
  ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2" }],
  ["path", { d: "M7 12h10" }]
]);

const UsersIcon = createIcon("users", [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }],
  ["circle", { cx: "9", cy: "7", r: "4" }]
]);

const PauseIcon = createIcon("pause", [
  ["rect", { width: "4", height: "16", x: "6", y: "4" }],
  ["rect", { width: "4", height: "16", x: "14", y: "4" }]
]);

// Asset paths
const bannerImage = {
  url: "/__l5e/assets-v1/634a551f-8685-4759-b46e-fdbe6a390438/tinkerhub-snmimt-banner.png"
};

const celebrationImage = {
  url: "/__l5e/assets-v1/b3f5291b-4d5e-4635-a21e-c1beb140f910/useless-projects-3.png"
};

// Reishi Root Procedural Geometry
function pseudoRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const ROOT_CX = 500;
const ROOT_RADIUS = 196;
const ROOT_MAX_LEN = 900;

function makeRibbonPath(points, startW, endW) {
  let left = [], right = [];
  for (let i = 0; i < points.length; i++) {
    let p = points[i];
    let prev = points[Math.max(0, i - 1)];
    let next = points[Math.min(points.length - 1, i + 1)];
    let dx = next[0] - prev[0];
    let dy = next[1] - prev[1];
    let len = Math.hypot(dx, dy) || 1;
    let nx = -dy / len;
    let ny = dx / len;
    let t = i / (points.length - 1);
    let halfW = (startW + (endW - startW) * t) / 2;
    left.push(`${(p[0] + nx * halfW).toFixed(1)} ${(p[1] + ny * halfW).toFixed(1)}`);
    right.unshift(`${(p[0] - nx * halfW).toFixed(1)} ${(p[1] - ny * halfW).toFixed(1)}`);
  }
  return `M ${left.join(" L ")} L ${right.join(" L ")} Z`;
}

function makeCorePath(points) {
  return `M ${points.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ")}`;
}

function generateSpine(rand, origin, angle, length, segments, curl) {
  let pts = [origin];
  let x = origin[0];
  let y = origin[1];
  let curAngle = angle;
  let segLen = length / segments;
  for (let i = 0; i < segments; i++) {
    curAngle += (rand() - 0.5) * curl;
    curAngle = curAngle * 0.82 + angle * 0.18;
    x += Math.cos(curAngle) * segLen;
    y += Math.sin(curAngle) * segLen;
    pts.push([x, y]);
  }
  return pts;
}

function generateRoots(count) {
  let rand = pseudoRandom(20260910);
  let roots = [];
  for (let i = 0; i < count; i++) {
    let baseAngle = (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.12;
    let origin = [ROOT_CX + Math.cos(baseAngle) * ROOT_RADIUS, ROOT_CX + Math.sin(baseAngle) * ROOT_RADIUS];
    let len = ROOT_MAX_LEN * (0.55 + rand() * 0.45);
    let w = 16 + rand() * 14;
    let spine = generateSpine(rand, origin, baseAngle, len, 5 + Math.floor(rand() * 3), 0.9);
    let branches = [{
      ribbon: makeRibbonPath(spine, w, w * 0.18),
      core: makeCorePath(spine),
      coreWidth: w * 0.24
    }];
    let subBranches = 2 + Math.floor(rand() * 2);
    for (let j = 0; j < subBranches; j++) {
      let idx = 1 + Math.floor(rand() * (spine.length - 2));
      let pt = spine[idx];
      let prev = spine[idx - 1];
      let bAngle = Math.atan2(pt[1] - prev[1], pt[0] - prev[0]) + (rand() > 0.5 ? 1 : -1) * (0.45 + rand() * 0.5);
      let bW = w * (0.32 + rand() * 0.28);
      let bSpine = generateSpine(rand, pt, bAngle, len * (0.3 + rand() * 0.35), 4, 1.1);
      branches.push({
        ribbon: makeRibbonPath(bSpine, bW, bW * 0.15),
        core: makeCorePath(bSpine),
        coreWidth: bW * 0.28
      });
    }
    roots.push(branches);
  }
  return roots;
}

function getGoldenIndexOrder(count) {
  let order = Array(count);
  let step = Math.max(1, Math.round(count * 0.382));
  let rank = 0;
  let seen = new Set();
  for (let i = 0; i < count * 4 && seen.size < count; i++) {
    let pos = (i * step) % count;
    if (!seen.has(pos)) {
      seen.add(pos);
      order[pos] = rank++;
    }
  }
  for (let i = 0; i < count; i++) {
    if (!seen.has(i)) order[i] = rank++;
  }
  return order;
}

// Reishi Root SVG Render Component
function ReishiRoots({ total = 24, lit = 0, armed = false }) {
  const roots = React.useMemo(() => generateRoots(total), [total]);
  const order = React.useMemo(() => getGoldenIndexOrder(total), [total]);
  const fillRatio = total ? lit / total : 0;

  return _(React.Fragment, null, [
    (0, _.jsxs)("svg", {
      viewBox: "0 0 1000 1000",
      className: "pointer-events-none h-full w-full overflow-visible",
      "aria-hidden": "true",
      children: [
        (0, _.jsxs)("defs", {
          children: [
            (0, _.jsxs)("filter", {
              id: "reishi-halo",
              x: "-60%",
              y: "-60%",
              width: "220%",
              height: "220%",
              children: [
                (0, _.jsx)("feGaussianBlur", { stdDeviation: "12", result: "b" }),
                (0, _.jsxs)("feMerge", {
                  children: [
                    (0, _.jsx)("feMergeNode", { in: "b" }),
                    (0, _.jsx)("feMergeNode", { in: "SourceGraphic" })
                  ]
                })
              ]
            }),
            (0, _.jsxs)("radialGradient", {
              id: "reishi-belt",
              cx: "50%",
              cy: "50%",
              r: "50%",
              children: [
                (0, _.jsx)("stop", { offset: "0%", stopColor: "var(--color-reishi)" }),
                (0, _.jsx)("stop", { offset: "45%", stopColor: "var(--color-reishi)" }),
                (0, _.jsx)("stop", { offset: "100%", stopColor: "var(--color-reishi-deep)" })
              ]
            }),
            (0, _.jsxs)("radialGradient", {
              id: "reishi-core",
              cx: "50%",
              cy: "50%",
              r: "50%",
              children: [
                (0, _.jsx)("stop", { offset: "0%", stopColor: "#ffffff", stopOpacity: "0.85" }),
                (0, _.jsx)("stop", { offset: "60%", stopColor: "var(--color-reishi)", stopOpacity: "0.35" }),
                (0, _.jsx)("stop", { offset: "100%", stopColor: "var(--color-reishi-deep)", stopOpacity: "0" })
              ]
            })
          ]
        }),
        (0, _.jsx)("circle", {
          cx: ROOT_CX,
          cy: ROOT_CX,
          r: 280,
          fill: "url(#reishi-core)",
          style: { opacity: 0.12 + fillRatio * 0.8, transition: "opacity 700ms ease" }
        }),
        (0, _.jsx)("circle", {
          cx: ROOT_CX,
          cy: ROOT_CX,
          r: 182,
          fill: "none",
          stroke: "var(--color-reishi)",
          strokeWidth: armed ? 8 : 5,
          filter: "url(#reishi-halo)",
          style: { opacity: 0.18 + fillRatio * 0.82, transition: "opacity 500ms ease, stroke-width 400ms ease" }
        }),
        (0, _.jsx)("circle", {
          cx: ROOT_CX,
          cy: ROOT_CX,
          r: 182,
          fill: "none",
          stroke: "#ffffff",
          strokeWidth: armed ? 2.4 : 1.4,
          strokeDasharray: "14 22",
          style: { opacity: 0.15 + fillRatio * 0.7, animation: "reishi-flow 3.4s linear infinite" }
        }),
        roots.map((branchList, rootIdx) => {
          const isLit = (order[rootIdx] ?? rootIdx) < lit;
          return (0, _.jsx)(
            "g",
            {
              key: rootIdx,
              style: {
                opacity: isLit ? 1 : 0,
                transform: isLit ? "scale(1)" : "scale(0.35)",
                transformOrigin: `${ROOT_CX}px ${ROOT_CX}px`,
                transition: "opacity 420ms ease, transform 820ms cubic-bezier(.16,.9,.28,1)"
              },
              children: branchList.map((branch, branchIdx) =>
                (0, _.jsxs)("g", {
                  key: branchIdx,
                  children: [
                    (0, _.jsx)("path", {
                      d: branch.ribbon,
                      fill: "url(#reishi-belt)",
                      filter: "url(#reishi-halo)",
                      opacity: 0.92
                    }),
                    (0, _.jsx)("path", {
                      d: branch.core,
                      fill: "none",
                      stroke: "#ffffff",
                      strokeWidth: branch.coreWidth,
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      opacity: armed ? 0.95 : 0.75
                    }),
                    (0, _.jsx)("path", {
                      d: branch.core,
                      fill: "none",
                      stroke: "#ffffff",
                      strokeWidth: branch.coreWidth * 0.7,
                      strokeLinecap: "round",
                      strokeDasharray: "10 90",
                      style: {
                        animation: `reishi-flow ${1.5 + ((rootIdx + branchIdx) % 5) * 0.3}s linear infinite`,
                        opacity: 0.9
                      }
                    })
                  ]
                })
              )
            }
          );
        })
      ]
    })
  ]);
}

// Big Red Button Component
function BigRedButton({ armed, fired, onFire, paused }) {
  const isClickable = armed && !fired && !paused;

  return (0, _.jsxs)("div", {
    className: "relative z-10 flex flex-col items-center",
    children: [
      (0, _.jsxs)("div", {
        className: "relative",
        children: [
          isClickable &&
            (0, _.jsx)("span", {
              className: "absolute inset-0 rounded-full bg-btn-red/25",
              style: { animation: "shockwave 2.4s ease-out infinite" }
            }),
          (0, _.jsx)("div", {
            className: "relative grid h-56 w-56 place-items-center rounded-full border-4 border-foreground bg-secondary shadow-[8px_10px_0_0_var(--color-foreground)]",
            children: (0, _.jsx)("button", {
              type: "button",
              onClick: isClickable ? onFire : undefined,
              disabled: !isClickable,
              "aria-label": "Inauguration button",
              className: cn(
                "group relative grid h-40 w-40 place-items-center rounded-full border-4 border-foreground transition-all duration-200",
                isClickable
                  ? "animate-btn-breathe cursor-pointer bg-btn-red active:translate-y-2 active:shadow-[0_2px_0_0_var(--color-btn-red-dark)]"
                  : "cursor-not-allowed bg-btn-red/25"
              ),
              style: {
                boxShadow: isClickable
                  ? "0 10px 0 0 var(--color-btn-red-dark), inset 0 -8px 18px rgba(0,0,0,.25)"
                  : "0 8px 0 0 color-mix(in oklab, var(--color-btn-red-dark) 35%, transparent)"
              },
              children: (0, _.jsx)("span", {
                className: cn(
                  "font-display text-center text-lg leading-tight tracking-widest",
                  isClickable ? "text-primary-foreground" : "text-foreground/40"
                ),
                children: fired ? "LIVE" : paused ? "PAUSED" : "PRESS"
              })
            })
          })
        ]
      }),
      (0, _.jsx)("p", {
        className: "absolute -bottom-16 left-1/2 w-max max-w-[80vw] -translate-x-1/2 rounded-full border-2 border-foreground bg-card/90 px-4 py-1 text-center font-hand text-base text-muted-foreground shadow-sm",
        children: fired
          ? "reishi released. useless projects 3.0 is live <3"
          : paused
          ? "system is paused by admin"
          : armed
          ? "all roots are lit — the button is hot. press it."
          : "button stays cold until every root drinks reishi"
      })
    ]
  });
}

// Lightweight, High-Performance Canvas Confetti Celebration Modal (0% Lag / PC Freeze)
function CelebrationModal({ attendees = 0, onClose }) {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#FE7B02", "#FE3F21", "#F858BC", "#575ECF", "#06D6A0", "#FFD166", "#118AB2"];
    const particles = [];
    const particleCount = 120;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width * 0.5 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.6 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 16 - 6,
        size: Math.random() * 9 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.35,
        drag: 0.985
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.vx *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();

        // Recycle particles for continuous gentle falling
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
          p.vy = Math.random() * 3 + 2;
          p.vx = (Math.random() - 0.5) * 2;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (0, _.jsxs)("div", {
    className: "fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-background/95 backdrop-blur-md px-6 text-center animate-stamp-in",
    children: [
      (0, _.jsx)("canvas", {
        ref: canvasRef,
        className: "pointer-events-none absolute inset-0 h-full w-full"
      }),
      (0, _.jsxs)("div", {
        className: "relative z-10 flex max-w-2xl flex-col items-center",
        children: [
          (0, _.jsx)("img", {
            src: celebrationImage.url,
            alt: "Useless Projects 3.0 logo",
            className: "w-[min(480px,85vw)] drop-shadow-[0_12px_0_rgba(0,0,0,0.12)] animate-stamp-in"
          }),
          (0, _.jsx)("h1", {
            className: "mt-8 font-display text-4xl sm:text-6xl text-foreground tracking-tight",
            children: "WELCOME TO USELESS PROJECTS 3.0!"
          }),
          (0, _.jsx)("p", {
            className: "mt-4 font-display text-2xl sm:text-3xl text-tetris-orange uppercase tracking-wider",
            children: "LET'S START THE CHAOS!"
          }),
          (0, _.jsxs)("div", {
            className: "mt-6 space-y-2 font-hand text-xl text-muted-foreground",
            children: [
              (0, _.jsxs)("p", {
                children: [
                  (0, _.jsx)("span", { className: "font-bold text-foreground font-display text-2xl", children: attendees }),
                  " makers scanned in. Pointless ideas activated."
                ]
              }),
              (0, _.jsx)("p", {
                className: "text-base",
                children: "SNMIMT TinkerHub × Useless Projects 3.0"
              })
            ]
          }),
          (0, _.jsx)("button", {
            type: "button",
            onClick: onClose,
            className: "btn-ink mt-8 px-8 py-3 text-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform",
            children: "back to console"
          })
        ]
      })
    ]
  });
}

// Scannable Dynamic SVG QR Code
function DynamicQRCode({ url }) {
  // Generate a high-contrast standard QR Code SVG via simple Google Chart API image or pure SVG
  // For 100% offline scannability, we encode using standard QR URL or direct SVG
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}&bgcolor=FAF9F6&color=1B1B1B&margin=1`;
  
  return (0, _.jsxs)("div", {
    className: "flex flex-col items-center justify-center",
    children: [
      (0, _.jsx)("div", {
        className: "overflow-hidden rounded-xl border-2 border-foreground bg-[#FAF9F6] p-2 shadow-sm",
        children: (0, _.jsx)("img", {
          src: qrUrl,
          alt: "Scan QR Code",
          className: "h-36 w-36 object-contain",
          onError: (e) => {
            // Offline fallback SVG icon if no internet
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "block";
          }
        })
      }),
      (0, _.jsx)("a", {
        href: url,
        target: "_blank",
        rel: "noreferrer",
        className: "mt-2 font-hand text-xs text-muted-foreground hover:text-foreground underline",
        children: "or open mobile scanner"
      })
    ]
  });
}

// Main Inauguration Dashboard Component
function MainInaugurationComponent() {
  const [target, setTarget] = React.useState(32);
  const [attendees, setAttendees] = React.useState([]);
  const [fired, setFired] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [scanningEffect, setScanningEffect] = React.useState(false);
  const [connected, setConnected] = React.useState(false);

  const scanUrl = typeof window !== "undefined" ? `${window.location.origin}/scan.html` : "/scan.html";
  const count = attendees.length;
  const isArmed = count >= target;
  const rootsLit = Math.min(24, Math.round((count / Math.max(1, target)) * 24));

  // Connect to real-time Server-Sent Events stream
  React.useEffect(() => {
    let evtSource = null;
    let reconnectTimeout = null;

    const connectSSE = () => {
      try {
        evtSource = new EventSource("/api/events");

        evtSource.onopen = () => {
          setConnected(true);
        };

        evtSource.addEventListener("init", (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.state) {
              setTarget(data.state.target);
              setAttendees(data.state.attendees);
              setPaused(data.state.paused);
              setFired(data.state.fired);
            }
          } catch (err) {
            console.error("SSE init error", err);
          }
        });

        evtSource.addEventListener("scan", (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.state) {
              setAttendees(data.state.attendees);
              setTarget(data.state.target);
              setPaused(data.state.paused);
              setFired(data.state.fired);
            }
            setScanningEffect(true);
            setTimeout(() => setScanningEffect(false), 300);
          } catch (err) {
            console.error("SSE scan error", err);
          }
        });

        evtSource.addEventListener("target", (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.state) setTarget(data.state.target);
          } catch (err) {}
        });

        evtSource.addEventListener("pause", (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.state) setPaused(data.state.paused);
          } catch (err) {}
        });

        evtSource.addEventListener("fire", (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.state) setFired(data.state.fired);
          } catch (err) {}
        });

        evtSource.addEventListener("reset", (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.state) {
              setAttendees(data.state.attendees);
              setFired(data.state.fired);
              setPaused(data.state.paused);
            }
          } catch (err) {}
        });

        evtSource.addEventListener("delete", (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.state) setAttendees(data.state.attendees);
          } catch (err) {}
        });

        evtSource.onerror = () => {
          setConnected(false);
          if (evtSource) evtSource.close();
          reconnectTimeout = setTimeout(connectSSE, 2000);
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connectSSE, 3000);
      }
    };

    connectSSE();

    // Initial state fetch
    fetch("/api/state")
      .then((res) => res.json())
      .then((s) => {
        if (s) {
          setTarget(s.target);
          setAttendees(s.attendees);
          setPaused(s.paused);
          setFired(s.fired);
        }
      })
      .catch(() => {});

    return () => {
      if (evtSource) evtSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Trigger Scan
  const handleScan = React.useCallback(async () => {
    if (paused || isArmed) return;
    setScanningEffect(true);
    try {
      await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => setScanningEffect(false), 260);
  }, [paused, isArmed]);

  // Handle keyboard shortcut (Space or S)
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Space" || e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!fired) handleScan();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleScan, fired]);

  // Reset stage
  const handleReset = async () => {
    try {
      await fetch("/api/reset", { method: "POST" });
    } catch (err) {
      console.error(err);
    }
  };

  // Target change
  const handleTargetChange = async (val) => {
    const num = Math.max(1, Number(val) || 1);
    setTarget(num);
    try {
      await fetch("/api/target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: num })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Button Fire
  const handleFire = async () => {
    try {
      await fetch("/api/fire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fired: true })
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (0, _.jsxs)("main", {
    className: "min-h-screen bg-background text-foreground",
    children: [
      fired && (0, _.jsx)(CelebrationModal, { attendees: count, onClose: () => handleReset() }),
      (0, _.jsxs)("header", {
        className: "border-b-2 border-foreground bg-foreground px-4 py-2 flex items-center justify-between",
        children: [
          (0, _.jsx)("div", { className: "w-24" }),
          (0, _.jsx)("img", {
            src: bannerImage.url,
            alt: "TinkerHub SNMIMT and SNMIMT Engineering College",
            className: "mx-auto h-14 sm:h-18 w-auto object-contain"
          }),
          (0, _.jsx)("div", {
            className: "w-24 flex justify-end",
            children: (0, _.jsx)("a", {
              href: "/admin.html",
              className: "text-xs font-hand px-2.5 py-1 rounded border border-card bg-card/20 text-card-foreground hover:bg-card/40 transition-colors",
              children: "⚙ Admin"
            })
          })
        ]
      }),
      (0, _.jsxs)("div", {
        className: "mx-auto grid max-w-[1400px] gap-8 px-5 py-8 lg:grid-cols-[380px_1fr]",
        children: [
          // Left Sidebar Section
          (0, _.jsxs)("section", {
            className: "space-y-5",
            children: [
              (0, _.jsxs)("div", {
                children: [
                  (0, _.jsxs)("div", {
                    className: "flex items-center gap-2",
                    children: [
                      (0, _.jsx)("span", { className: "pill", children: "inauguration system" }),
                      (0, _.jsxs)("span", {
                        className: cn("pill text-xs", connected ? "bg-green-500/20 text-green-700" : "bg-yellow-500/20 text-yellow-700"),
                        children: [connected ? "● live" : "○ connecting..."]
                      }),
                      paused && (0, _.jsx)("span", { className: "pill bg-red-500/20 text-red-700 font-bold", children: "⏸ paused" })
                    ]
                  }),
                  (0, _.jsx)("h1", { className: "mt-3 font-display text-4xl leading-none", children: "useless projects 3.0" }),
                  (0, _.jsx)("p", {
                    className: "mt-2 font-hand text-lg text-muted-foreground",
                    children: "scan your tinkerhub ticket, feed the roots, wake the red button."
                  })
                ]
              }),
              (0, _.jsxs)("div", {
                className: "panel p-5 relative",
                children: [
                  paused && (0, _.jsxs)("div", {
                    className: "absolute inset-0 bg-background/80 backdrop-blur-xs z-20 flex flex-col items-center justify-center rounded-xl p-4",
                    children: [
                      (0, _.jsx)(PauseIcon, { className: "h-8 w-8 text-btn-red mb-2 animate-pulse" }),
                      (0, _.jsx)("p", { className: "font-display text-lg text-foreground", children: "SYSTEM PAUSED" }),
                      (0, _.jsx)("p", { className: "font-hand text-xs text-muted-foreground", children: "Admin has paused scanning and button firing" })
                    ]
                  }),
                  (0, _.jsxs)("div", {
                    className: "flex items-center justify-between",
                    children: [
                      (0, _.jsxs)("span", {
                        className: "pill",
                        children: [(0, _.jsx)(UsersIcon, { className: "h-3.5 w-3.5 inline mr-1" }), " makers in"]
                      }),
                      (0, _.jsxs)("span", {
                        className: "font-display text-4xl tabular-nums",
                        children: [count, (0, _.jsxs)("span", { className: "text-muted-foreground", children: ["/", target] })]
                      })
                    ]
                  }),
                  (0, _.jsx)("div", {
                    className: "mt-4 h-4 w-full overflow-hidden rounded-full border-2 border-foreground bg-secondary",
                    children: (0, _.jsx)("div", {
                      className: "h-full rounded-full bg-reishi transition-[width] duration-500",
                      style: { width: `${Math.min(100, (count / Math.max(1, target)) * 100)}%` }
                    })
                  }),
                  // Functional QR Code scanner section
                  (0, _.jsxs)("div", {
                    className: cn(
                      "mt-5 flex flex-col items-center rounded-xl border-2 border-dashed border-foreground/40 py-5 transition-colors",
                      scanningEffect ? "bg-reishi/20" : "bg-secondary/60"
                    ),
                    children: [
                      (0, _.jsx)(DynamicQRCode, { url: scanUrl }),
                      (0, _.jsx)("p", {
                        className: "mt-3 font-hand text-sm text-muted-foreground",
                        children: isArmed ? "gate full — roots saturated" : "scan ticket or hold phone to QR"
                      })
                    ]
                  }),
                  (0, _.jsxs)("div", {
                    className: "mt-4 flex gap-2",
                    children: [
                      (0, _.jsxs)("button", {
                        type: "button",
                        onClick: handleScan,
                        disabled: isArmed || paused,
                        className: "btn-ink flex flex-1 items-center justify-center gap-2",
                        children: [(0, _.jsx)(ScanLineIcon, { className: "h-4 w-4" }), " scan ticket"]
                      }),
                      (0, _.jsx)("button", {
                        type: "button",
                        onClick: handleReset,
                        "aria-label": "Reset",
                        className: "rounded-full border-2 border-foreground px-3 transition-colors hover:bg-secondary cursor-pointer",
                        children: (0, _.jsx)(RotateCcwIcon, { className: "h-4 w-4" })
                      })
                    ]
                  }),
                  (0, _.jsx)("p", {
                    className: "mt-2 text-center font-hand text-xs text-muted-foreground",
                    children: "tip: press SPACE or S to scan — ESP32 gate sends the same key"
                  }),
                  (0, _.jsxs)("label", {
                    className: "mt-4 flex items-center justify-between font-hand text-sm text-muted-foreground",
                    children: [
                      "target makers",
                      (0, _.jsx)("input", {
                        type: "number",
                        min: "1",
                        max: "500",
                        value: target,
                        onChange: (e) => handleTargetChange(e.target.value),
                        className: "w-20 rounded-md border-2 border-foreground bg-card px-2 py-1 text-right font-display text-foreground outline-none"
                      })
                    ]
                  })
                ]
              }),
              // Live check-ins feed
              (0, _.jsxs)("div", {
                className: "panel max-h-72 overflow-y-auto p-4",
                children: [
                  (0, _.jsx)("p", { className: "pill mb-3", children: "live check-ins" }),
                  count === 0 &&
                    (0, _.jsx)("p", { className: "font-hand text-sm text-muted-foreground", children: "nobody scanned yet." }),
                  (0, _.jsx)("ul", {
                    className: "space-y-2",
                    children: attendees.slice(0, 12).map((a) =>
                      (0, _.jsxs)(
                        "li",
                        {
                          className: "animate-ticker-in flex items-center justify-between border-b border-border pb-1 font-hand text-sm",
                          children: [
                            (0, _.jsxs)("span", { children: ["#", a.id, " ", a.name] }),
                            (0, _.jsx)("span", { className: "text-muted-foreground font-mono text-xs", children: a.ticket })
                          ]
                        },
                        a.id
                      )
                    )
                  })
                ]
              })
            ]
          }),
          // Right Reishi Roots & Inauguration Button Section
          (0, _.jsxs)("section", {
            className: "panel relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden p-6",
            children: [
              (0, _.jsx)("div", {
                className: "absolute left-5 top-5 flex gap-2",
                children: (0, _.jsx)("span", {
                  className: "pill",
                  children: isArmed ? "reishi: full" : `reishi: ${rootsLit}/24 roots`
                })
              }),
              (0, _.jsxs)("div", {
                className: "absolute right-5 top-5 flex gap-2",
                children: [
                  (0, _.jsx)("span", { className: "h-6 w-6 animate-float-soft rounded-full border-4 border-tetris-magenta bg-tetris-cyan" }),
                  (0, _.jsx)("span", { className: "h-6 w-6 animate-float-soft rounded-full border-4 border-tetris-red bg-tetris-yellow" })
                ]
              }),
              (0, _.jsxs)("div", {
                className: "relative grid aspect-square w-full max-w-[620px] place-items-center",
                children: [
                  (0, _.jsx)("div", {
                    className: "absolute inset-0",
                    children: (0, _.jsx)(ReishiRoots, { total: 24, lit: rootsLit, armed: isArmed })
                  }),
                  (0, _.jsx)(BigRedButton, { armed: isArmed, fired, onFire: handleFire, paused })
                ]
              })
            ]
          })
        ]
      }),
      (0, _.jsx)("footer", {
        className: "px-5 pb-8 text-center font-hand text-sm text-muted-foreground",
        children: "built for the snmimt tinkerhub campus community <3"
      })
    ]
  });
}

export { MainInaugurationComponent as component };