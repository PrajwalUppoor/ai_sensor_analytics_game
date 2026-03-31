import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiLabEngine } from "./PiLabEngine";
import { iotManager } from "./lib/RenderIotManager";

// ── RASPBERRY PI 5 PINOUT (BCM2712) ────────────────────────────────────────

const PINOUT = [
  { p: 1,  bcm: "3.3V",  type: "SOURCE_3V3" }, { p: 2,  bcm: "5V",    type: "SOURCE_5V" },
  { p: 3,  bcm: "GPIO2", type: "GPIO" },       { p: 4,  bcm: "5V",    type: "SOURCE_5V" },
  { p: 5,  bcm: "GPIO3", type: "GPIO" },       { p: 6,  bcm: "GND",   type: "GND" },
  { p: 7,  bcm: "GPIO4", type: "GPIO" },       { p: 8,  bcm: "TXD",   type: "GPIO" },
  { p: 9,  bcm: "GND",   type: "GND" },       { p: 10, bcm: "RXD",   type: "GPIO" },
  { p: 11, bcm: "GPIO17",type: "GPIO" },       { p: 12, bcm: "GPIO18",type: "GPIO" },
  { p: 13, bcm: "GPIO27",type: "GPIO" },       { p: 14, bcm: "GND",   type: "GND" },
  { p: 15, bcm: "GPIO22",type: "GPIO" },       { p: 16, bcm: "GPIO23",type: "GPIO" },
  { p: 17, bcm: "3.3V",  type: "SOURCE_3V3" }, { p: 18, bcm: "GPIO24",type: "GPIO" },
  { p: 19, bcm: "GPIO10",type: "GPIO" },       { p: 20, bcm: "GND",   type: "GND" },
  { p: 21, bcm: "GPIO9", type: "GPIO" },       { p: 22, bcm: "GPIO25",type: "GPIO" },
  { p: 23, bcm: "GPIO11",type: "GPIO" },       { p: 24, bcm: "GPIO8", type: "GPIO" },
  { p: 25, bcm: "GND",   type: "GND" },       { p: 26, bcm: "GPIO7", type: "GPIO" },
  { p: 37, bcm: "GPIO26",type: "GPIO" },       { p: 38, bcm: "GPIO20",type: "GPIO" },
  { p: 39, bcm: "GND",   type: "GND" },       { p: 40, bcm: "GPIO21",type: "GPIO" },
];

const PART_CATEGORIES = {
  GENERAL: ["RES", "CAP", "DIODE"],
  INPUT: ["BTN", "POT", "LDR", "PIR", "USONIC"],
  OUTPUT: ["LED", "RGB_LED", "SERVO", "MOTOR_DC", "PIEZO", "LCD_I2C"],
  POWER: ["BATT_9V", "BATT_AA"]
};

const PART_DATA = {
  RES: { name: "Resistor", color: "#d1d8e0", pins: [{ id: "p1", x: -20, y: 0 }, { id: "p2", x: 20, y: 0 }], attr: { resistance: 220 } },
  CAP: { name: "Capacitor", color: "#45aaf2", pins: [{ id: "p1", x: -10, y: 0 }, { id: "p2", x: 10, y: 0 }] },
  DIODE: { name: "Diode", color: "#4b4b4b", pins: [{ id: "an", x: -15, y: 0 }, { id: "ca", x: 15, y: 0 }] },
  BTN: { name: "Button", color: "#4b7bec", pins: [{ id: "l", x: -10, y: 0 }, { id: "r", x: 10, y: 0 }] },
  POT: { name: "Potentiometer", color: "#2d98da", pins: [{ id: "p1", x: -15, y: 10 }, { id: "w", x: 0, y: -10 }, { id: "p2", x: 15, y: 10 }] },
  LDR: { name: "Photoresistor", color: "#f7b731", pins: [{ id: "p1", x: -10, y: 0 }, { id: "p2", x: 10, y: 0 }] },
  PIR: { name: "PIR Sensor", color: "#26de81", pins: [{ id: "vcc", x: -10, y: 10 }, { id: "out", x: 0, y: 10 }, { id: "gnd", x: 10, y: 10 }] },
  USONIC: { name: "Ultrasonic", color: "#4b7bec", pins: [{ id: "vcc", x: -15, y: 15 }, { id: "tr", x: -5, y: 15 }, { id: "ec", x: 5, y: 15 }, { id: "gnd", x: 15, y: 15 }] },
  LED: { name: "LED", color: "#eb4d4b", pins: [{ id: "an", x: -5, y: 0 }, { id: "ca", x: 5, y: 0 }], attr: { color: "#eb4d4b" } },
  RGB_LED: { name: "RGB LED", color: "#a55eea", pins: [{ id: "r", x: -15, y: 0 }, { id: "g", x: -5, y: 0 }, { id: "ca", x: 5, y: 0 }, { id: "b", x: 15, y: 0 }] },
  SERVO: { name: "Servo", color: "#4b4b4b", pins: [{ id: "pwm", x: -10, y: 10 }, { id: "vcc", x: 0, y: 10 }, { id: "gnd", x: 10, y: 10 }] },
  MOTOR_DC: { name: "DC Motor", color: "#778ca3", pins: [{ id: "p1", x: -15, y: 0 }, { id: "p2", x: 15, y: 0 }] },
  PIEZO: { name: "Piezo", color: "#4b4b4b", pins: [{ id: "p", x: -10, y: 0 }, { id: "n", x: 10, y: 0 }] },
  LCD_I2C: { name: "LCD 16x2", color: "#4b7bec", pins: [{ id: "gnd", x: -15, y: 25 }, { id: "vcc", x: -5, y: 25 }, { id: "sda", x: 5, y: 25 }, { id: "scl", x: 15, y: 25 }] },
  BATT_9V: { name: "9V Battery", color: "#2d3436", pins: [{ id: "p", x: -10, y: -20 }, { id: "n", x: 10, y: -20 }] },
  BATT_AA: { name: "AA Battery", color: "#636e72", pins: [{ id: "p", x: 0, y: -15 }, { id: "n", x: 0, y: 15 }] }
};

export default function PiLab({ onBackToMenu }) {
  const [parts, setParts] = useState([]);
  const [wires, setWires] = useState([]);
  const [activeWire, setActiveWire] = useState(null);
  const [meterProbes, setMeterProbes] = useState({ red: null, black: null });
  const [activeProbe, setActiveProbe] = useState(null); 
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("CODE"); // CODE | CLOUD | LOGS
  const [apiKey, setApiKey] = useState(null);
  const [history, setHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [engine] = useState(() => new PiLabEngine());
  const [simResults, setSimResults] = useState({ voltages: {}, faults: [] });
  const [code, setCode] = useState("# Raspberry Pi 5 Python\nimport RPi.GPIO as GPIO\nGPIO.setmode(GPIO.BCM)\nGPIO.setup(17, GPIO.OUT)\nGPIO.output(17, 1)");

  // ── CIRCUIT RE-RESOLUTION (WOKWI-STYLE JSON SYNC) ─────────────────────────

  useEffect(() => {
    // Sync to Engine structure
    engine.clearGraph();
    PINOUT.forEach(p => engine.addNode(`pin-${p.p}`, p.type));
    wires.forEach(w => engine.addWire(w.from, w.to));
  }, [parts, wires]);

  // ── INTERACTION HANDLERS ─────────────────────────────────────────────────

  useEffect(() => {
    const handleEsc = (e) => { 
      if (e.key === "Escape") setActiveWire(null); 
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  function handleNodeClick(id) {
    if (activeProbe) {
      setMeterProbes(prev => ({ ...prev, [activeProbe]: id }));
      setActiveProbe(null);
      return;
    }
    if (activeWire) {
      if (activeWire.from !== id) {
        setWires([...wires, { from: activeWire.from, to: id, color: activeWire.color }]);
      }
      setActiveWire(null);
    } else {
      // Auto-Color Logic
      let color = "#f7b731"; // Default Orange
      if (id.startsWith("pin-")) {
        const pinNum = parseInt(id.split("-")[1]);
        const pinDef = PINOUT.find(p => p.p === pinNum);
        if (pinDef?.type.startsWith("SOURCE")) color = "#eb4d4b"; // Red for Power
        if (pinDef?.type === "GND") color = "#222"; // Black for Ground
      }
      setActiveWire({ from: id, color });
    }
  }

  useEffect(() => {
    if (!apiKey) return;
    const interval = setInterval(async () => {
      const data = await iotManager.getHistory("temperature", 15);
      setHistory(data);
    }, 5000);
    return () => clearInterval(interval);
  }, [apiKey]);

  const stopApp = () => {
    setIsRunning(false);
    setLogs(prev => [...prev, "[OK] Simulation Stopped."]);
    // Reset all pins to DTS defaults
    PINOUT.forEach(p => {
      engine.setPinMode(p.p, "INPUT");
      engine.setPinState(p.p, 0);
    });
  };

  const runApp = async () => {
    if (isRunning) stopApp();
    setIsRunning(true);
    setLogs([]);
    setActiveTab("LOGS");

    // BCM to Physical Mapping (Hardware Accurate)
    const BCM_MAP = {};
    PINOUT.forEach(p => { if (p.bcm.startsWith("GPIO")) BCM_MAP[parseInt(p.bcm.replace("GPIO", ""))] = p.p; });
    // Additional common mappings
    BCM_MAP[2] = 3; BCM_MAP[3] = 5; BCM_MAP[14] = 8; BCM_MAP[15] = 10;

    let currentMode = "BCM";

    const GPIO = {
      OUT: "OUTPUT", IN: "INPUT", HIGH: 1, LOW: 0, BCM: "BCM", BOARD: "BOARD",
      setmode: (m) => { currentMode = m; },
      setup: (pin, mode) => {
        const physicalPin = currentMode === "BCM" ? BCM_MAP[pin] : pin;
        if (physicalPin) engine.setPinMode(physicalPin, mode);
      },
      output: (pin, val) => {
        const physicalPin = currentMode === "BCM" ? BCM_MAP[pin] : pin;
        if (physicalPin) engine.setPinState(physicalPin, val);
      },
      input: (pin) => {
        const physicalPin = currentMode === "BCM" ? BCM_MAP[pin] : pin;
        return physicalPin ? engine.getPinState(physicalPin) : 0;
      },
      cleanup: () => stopApp()
    };

    const sleep = (ms) => new Promise(res => setTimeout(res, ms));
    const print = (msg) => setLogs(prev => [...prev, `> ${msg}`]);

    try {
      const func = new Function("GPIO", "sleep", "print", "iot", `
        (async () => {
          try {
            ${code}
          } catch(e) {
            print("RUNTIME ERROR: " + e.message);
          }
        })();
      `);

      func(GPIO, sleep, print, iotManager);
      setLogs(prev => [...prev, "[OK] Script Started..."]);
    } catch (err) {
      setLogs(prev => [...prev, "[!] SYNTAX ERROR: " + err.message]);
      setIsRunning(false);
    }
  };

  // Main 60Hz Physics Resolver Loop
  useEffect(() => {
    let frame;
    const loop = () => {
      engine.resolve();
      setSimResults({ 
         voltages: Object.fromEntries(Array.from(engine.nodes.entries()).map(([k,v]) => [k, v.potential])),
         faults: Array.from(engine.nodes.values()).filter(n => n.blown).map(n => n.id)
      });
      frame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(frame);
  }, [engine]);

  const deleteCircuit = () => { if(confirm("Clear current lab?")) { setWires([]); setParts([]); } };

  return (
    <div style={{ height: "100vh", width: "100vw", background: "#060612", color: "#fff", display: "flex", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
      
      {/* Sidebar: Pro Parts Palette */}
      {!isFullScreen && (
        <div style={{ width: "240px", borderRight: "1px solid #111", background: "#09091b", display: "flex", flexDirection: "column", zIndex: 100 }}>
          <div style={{ padding: "20px", borderBottom: "1px solid #1c1c3f" }}>
            <input 
              type="text" 
              placeholder="Search components..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              style={{ width: "100%", background: "#050510", border: "1px solid #1c1c3f", borderRadius: "6px", padding: "8px 12px", color: "#fff", fontSize: "12px", outline: "none" }}
            />
          </div>
          
          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            {Object.entries(PART_CATEGORIES).map(([cat, types]) => {
              const filtered = types.filter(t => PART_DATA[t].name.toUpperCase().includes(searchQuery));
              if (filtered.length === 0) return null;
              
              return (
                <div key={cat} style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "10px", color: "#444", fontFamily: "Orbitron", letterSpacing: "2px", marginBottom: "10px", paddingLeft: "10px" }}>{cat}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {filtered.map(type => (
                      <motion.div 
                        key={type} 
                        whileHover={{ scale: 1.05, background: "#1a1a3a" }} 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const id = `pt-${Date.now()}`;
                          setParts([...parts, { id, type, x: 500, y: 300, rotation: 0, attr: { ...PART_DATA[type].attr } }]);
                        }}
                        style={{ background: "#111126", borderRadius: "8px", padding: "12px", cursor: "pointer", textAlign: "center", border: "1px solid #1c1c3f44" }}
                      >
                        <div style={{ fontSize: "20px", marginBottom: "5px" }}>
                          {type === "LED" ? "💡" : type === "RES" ? "Ω" : type.includes("BATT") ? "🔋" : type.includes("MOTOR") ? "⚙️" : "📦"}
                        </div>
                        <div style={{ fontSize: "9px", color: "#666", fontWeight: "bold" }}>{PART_DATA[type].name}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Multimeter Probes Quick Access */}
          <div style={{ padding: "20px", borderTop: "1px solid #1c1c3f", display: "flex", gap: "10px", justifyContent: "center" }}>
            <div onClick={() => setActiveProbe("red")} style={{ width: "24px", height: "24px", background: "#eb4d4b", borderRadius: "50%", cursor: "pointer", border: activeProbe === "red" ? "3px solid #fff" : "none", boxShadow: "0 0 10px #eb4d4b44" }} />
            <div onClick={() => setActiveProbe("black")} style={{ width: "24px", height: "24px", background: "#000", border: "2px solid #333", borderRadius: "50%", cursor: "pointer", border: activeProbe === "black" ? "3px solid #fff" : "2px solid #333" }} />
          </div>
          
          <button onClick={deleteCircuit} style={{ background: "#1a1a3a", border: "none", color: "#ed4c67", padding: "10px", fontSize: "10px", fontWeight: "bold", cursor: "pointer", fontFamily: "Orbitron" }}>ERASE LAB</button>
        </div>
      )}

      {/* Main Lab Canvas */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", cursor: activeWire ? "crosshair" : "default" }}>
        
        {/* Pro Toolbar */}
        <div style={{ position: "absolute", top: 0, width: "100%", height: "45px", background: "rgba(10,10,25,0.7)", backdropFilter: "blur(5px)", borderBottom: "1px solid #1c1c3f", display: "flex", alignItems: "center", padding: "0 20px", gap: "20px", zIndex: 40 }}>
           <button onClick={onBackToMenu} style={{ background: "none", border: "1px solid #333", color: "#666", padding: "4px 12px", borderRadius: "50px", fontSize: "10px", fontFamily: "Orbitron", cursor: "pointer" }}>QUIT LAB</button>
           <h2 style={{ fontSize: "10px", fontFamily: "Orbitron", letterSpacing: "2px", color: "#00f5d4", margin: 0 }}>PI-5 DIGITAL TWIN V1.0</h2>
           <div style={{ flex: 1 }} />
           <button onClick={() => setIsFullScreen(!isFullScreen)} style={{ padding: "5px 15px", background: "#222", border: "none", color: "#999", borderRadius: "4px", fontSize: "10px" }}>{isFullScreen ? "EXIT FULLSCREEN" : "FULLSCREEN"}</button>
           <button onClick={() => setIsSideBarOpen(!isSideBarOpen)} style={{ padding: "5px 15px", background: "#00f5d4", color: "#000", border: "none", borderRadius: "4px", fontSize: "10px", fontWeight: "bold" }}>{isSideBarOpen ? "HIDE CODE" : "SHOW CODE"}</button>
        </div>

        {/* PRO SIMULATION AREA (SVG) */}
        <svg 
          width="100%" height="100%" 
          style={{ background: "#080814" }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
        >
           <defs>
             <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#111" /></pattern>
           </defs>
           <rect width="100%" height="100%" fill="url(#dotGrid)" />

           {/* INDUSTRIAL CM5 LITE + CARRIER BOARD */}
           <g transform="translate(80, 80)">
              {/* Carrier Board Base */}
              <rect width="260" height="380" fill="#1b1b1b" rx="10" stroke="#333" strokeWidth="3" />
              <rect width="240" height="360" x="10" y="10" fill="#0c2d1e" rx="8" />
              <text x="25" y="40" fill="rgba(255,255,255,0.15)" fontFamily="Orbitron" fontSize="10">CM5-CARRIER-V1.0 / INDUSTRIAL AIoT</text>
              
              {/* SODIMM SLOTS (Top) */}
              <rect width="180" height="15" x="40" y="60" fill="#111" rx="2" />
              
              {/* CM5 LITE MODULE (SODIMM FORM FACTOR) */}
              <g transform="translate(45, 65)">
                <rect width="170" height="110" fill="#2e7d32" rx="4" stroke="#1b5e20" strokeWidth="1" />
                <rect width="30" height="30" x="20" y="20" fill="#333" rx="4" /> {/* BCM2712 */}
                <rect width="20" height="20" x="110" y="20" fill="#444" rx="2" /> {/* PMIC */}
                <text x="25" y="45" fill="rgba(255,255,255,0.3)" fontSize="6" fontFamily="monospace">BCM2712 / CM5 LITE</text>
              </g>

              {/* 40-PIN INDUSTRIAL HEADER */}
              <g transform="translate(200, 60)">
                 <rect width="45" height="280" fill="#000" rx="4" stroke="#444" />
                 {PINOUT.map((p, i) => {
                    const x = i % 2 === 0 ? 12 : 33;
                    const y = 12 + Math.floor(i / 2) * 13.5;
                    return (
                      <circle key={p.p} onClick={() => handleNodeClick(`pin-${p.p}`)} onMouseEnter={() => setHoveredNode(p)} onMouseLeave={() => setHoveredNode(null)}
                        cx={x} cy={y} r="4.2" fill={p.type === "GND" ? "#222" : p.type.startsWith("SOURCE") ? "#eb4d4b" : "#444"} stroke="#222" style={{ cursor: "pointer" }} />
                    );
                 })}
              </g>
           </g>

           {/* PRO INDUSTRIAL BREADBOARD */}
           <g transform="translate(480, 80)">
              <rect width="420" height="380" fill="#eee" rx="10" stroke="#bbb" strokeWidth="2" />
              {/* Metallic Rails */}
              <rect width="10" height="340" x="20" y="20" fill="#fbc53122" rx="2" /> {/* Rail + */}
              <rect width="10" height="340" x="40" y="20" fill="#00a8ff22" rx="2" /> {/* Rail - */}
              
              {[...Array(22)].map((_, r) => [...Array(22)].map((__, c) => (
                 <circle key={`${r}-${c}`} onClick={() => handleNodeClick(`brd-${r}-${c}`)} cx={70 + c * 15.5} cy={25 + r * 15.5} r="3" fill="#888" stroke="#ccc" style={{ cursor: "pointer" }} />
              )))}
           </g>

           {/* High-Fidelity Component Layer */}
           {parts.map(p => (
              <foreignObject key={p.id} x={p.x - 60} y={p.y - 60} width="120" height="120">
                 <motion.div drag dragMomentum={false} 
                    onDrag={(_, info) => setParts(parts.map(part => part.id === p.id ? { ...part, x: part.x + info.delta.x, y: part.y + info.delta.y } : part))}
                    onClick={() => setSelectedPart(p)}
                    style={{ width: "120px", height: "120px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "grab", border: selectedPart?.id === p.id ? "1px dashed #00f5d4" : "none" }}
                 >
                    {/* Component-Specific Specialized Rendering */}
                    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                      
                      {p.type === "USONIC" ? (
                        <div style={{ width: "60px", height: "30px", background: "#4b7bec", borderRadius: "4px", display: "flex", justifyContent: "space-around", alignItems: "center", padding: "5px" }}>
                           <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#333", border: "2px solid #aaa" }} />
                           <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#333", border: "2px solid #aaa" }} />
                        </div>
                      ) : p.type === "LCD_I2C" ? (
                        <div style={{ width: "100px", height: "60px", background: "#1a1a3a", border: "2px solid #4b7bec", borderRadius: "4px", padding: "5px" }}>
                           <div style={{ width: "100%", height: "100%", background: "#4b7bec44", color: "#00f5d4", fontSize: "6px", fontFamily: "monospace", overflow: "hidden" }}>
                             [I2C_LCD] Booting...<br/>PiLab Ready.
                           </div>
                        </div>
                      ) : p.type === "SERVO" ? (
                        <div style={{ position: "relative", width: "40px", height: "25px", background: "#333", borderRadius: "4px" }}>
                           <motion.div animate={{ rotate: p.attr?.angle || 0 }} style={{ position: "absolute", top: "-10px", left: "10px", width: "30px", height: "10px", background: "#fff", borderRadius: "40px", originX: "20%" }} />
                        </div>
                      ) : p.type === "RGB_LED" ? (
                        <div style={{ width: "30px", height: "30px", borderRadius: "50% 50% 10% 10%", background: "rgba(255,255,255,0.2)", border: "2px solid #aaa", boxShadow: `inset 0 0 15px ${p.attr?.color || "#fff"}` }} />
                      ) : p.type === "BATT_9V" ? (
                        <div style={{ width: "40px", height: "60px", background: "#2d3436", borderRadius: "4px", border: "2px solid #000" }}>
                           <div style={{ background: "#f1c40f", height: "5px", width: "100%", position: "absolute", top: "10px" }} />
                        </div>
                      ) : (
                        <div style={{ width: "30px", height: "10px", background: p.attr?.color || PART_DATA[p.type].color, borderRadius: "2px", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }} />
                      )}

                      {/* Unified Socket Points */}
                      {PART_DATA[p.type].pins.map(pin => (
                        <div key={pin.id} onClick={(e) => { e.stopPropagation(); handleNodeClick(`${p.id}-${pin.id}`); }}
                           style={{ position: "absolute", left: `calc(50% + ${pin.x}px)`, top: `calc(50% + ${pin.y}px)`, width: "7px", height: "7px", background: "#fff", border: "1.5px solid #000", borderRadius: "50%", transform: "translate(-50%,-50%)", cursor: "pointer" }} />
                      ))}
                    </div>
                 </motion.div>
              </foreignObject>
           ))}

           {/* Wires (Finalized) */}
           {wires.map((w, i) => {
              const start = getCoords(w.from, parts);
              const end = getCoords(w.to, parts);
              if (!start || !end) return null;
              const cpY = Math.min(start.y, end.y) - 40;
              return <path key={i} d={`M ${start.x} ${start.y} Q ${(start.x+end.x)/2} ${cpY} ${end.x} ${end.y}`} fill="none" stroke={w.color} strokeWidth="2.5" strokeLinecap="round" style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))" }} />;
           })}

           {/* Ghost Wire (Tinkercad-style) */}
           {activeWire && (
             <motion.path 
               d={`M ${getCoords(activeWire.from, parts).x} ${getCoords(activeWire.from, parts).y} Q ${(getCoords(activeWire.from, parts).x + mousePos.x)/2} ${Math.min(getCoords(activeWire.from, parts).y, mousePos.y) - 50} ${mousePos.x} ${mousePos.y}`} 
               stroke={activeWire.color} strokeWidth="3" fill="none" strokeDasharray="5,5" strokeLinecap="round" opacity="0.6"
             />
           )}

           {/* Pin Snapping Halos */}
           {hoveredNode && (
             <motion.circle 
               initial={{ scale: 1 }} animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
               cx={getCoords(`pin-${hoveredNode.p}`, parts).x} cy={getCoords(`pin-${hoveredNode.p}`, parts).y} r="10" fill="#00f5d422" stroke="#00f5d444" 
             />
           )}
        </svg>

        {/* HUD: Mouse Annotations */}
        {hoveredNode && (
          <div style={{ position: "absolute", left: 260, top: 100 + (hoveredNode.p / 2) * 12, background: "#00f5d4", color: "#000", padding: "4px 10px", borderRadius: "4px", fontSize: "10px", fontWeight: "900", zIndex: 200, pointerEvents: "none" }}>
            {hoveredNode.bcm} ({hoveredNode.type})
          </div>
        )}

        {/* DIGITAL MULTIMETER HUD */}
        <motion.div drag initial={{ left: 100, bottom: 50 }} style={{ position: "absolute", width: "160px", background: "linear-gradient(#f7b731, #f39c12)", padding: "15px", borderRadius: "15px", border: "3px solid #333", display: "flex", flexDirection: "column", gap: "10px", boxShadow: "0 20px 40px rgba(0,0,0,0.7)", zIndex: 110 }}>
           <div style={{ background: "#111", height: "60px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#00f5d4", fontSize: "32px", fontFamily: "Digital-7, monospace", textShadow: "0 0 10px rgba(0,245,212,0.3)" }}>
              {computeV()} V
           </div>
           <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8px", color: "#333", fontWeight: "900", fontFamily: "Orbitron" }}>
              <span>COM</span><span>VΩmA</span>
           </div>
           <div style={{ alignSelf: "center", width: "50px", height: "50px", border: "5px solid #333", borderRadius: "50%", background: "#444" }} />
        </motion.div>

        {/* COMPONENT INSPECTOR */}
        <AnimatePresence>
          {selectedPart && (
            <motion.div 
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              style={{ position: "absolute", top: "60px", left: "20px", width: "220px", background: "#0c0c24", border: "1px solid #1c1c3f", borderRadius: "12px", padding: "20px", zIndex: 100, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                <span style={{ fontSize: "12px", color: "#00f5d4", fontFamily: "Orbitron" }}>INSPECTOR</span>
                <button onClick={() => setSelectedPart(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>✕</button>
              </div>
              
              <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "20px" }}>{PART_DATA[selectedPart.type].name}</div>
              
              {selectedPart.attr && Object.entries(selectedPart.attr).map(([key, val]) => (
                <div key={key} style={{ marginBottom: "15px" }}>
                  <div style={{ fontSize: "10px", color: "#444", marginBottom: "5px", textTransform: "uppercase" }}>{key}</div>
                  <input 
                    type={typeof val === "number" ? "number" : "text"} 
                    value={val}
                    onChange={(e) => {
                      const newVal = typeof val === "number" ? parseFloat(e.target.value) : e.target.value;
                      setParts(parts.map(p => p.id === selectedPart.id ? { ...p, attr: { ...p.attr, [key]: newVal } } : p));
                      setSelectedPart({ ...selectedPart, attr: { ...selectedPart.attr, [key]: newVal } });
                    }}
                    style={{ width: "100%", background: "#050510", border: "1px solid #1c1c3f", padding: "8px", color: "#fff", borderRadius: "4px", fontSize: "12px" }}
                  />
                </div>
              ))}
              
              <button 
                onClick={() => {
                  setParts(parts.filter(p => p.id !== selectedPart.id));
                  setWires(wires.filter(w => !w.from.startsWith(selectedPart.id) && !w.to.startsWith(selectedPart.id)));
                  setSelectedPart(null);
                }}
                style={{ width: "100%", background: "#ed4c67", border: "none", color: "#fff", padding: "10px", borderRadius: "50px", fontSize: "11px", fontWeight: "bold", marginTop: "10px", cursor: "pointer" }}
              >
                DELETE COMPONENT
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Retractable IDE Panel */}
      <AnimatePresence>
        {isSideBarOpen && (
          <motion.div initial={{ width: 0 }} animate={{ width: 440 }} exit={{ width: 0 }}
            style={{ background: "#0c0c1e", borderLeft: "1px solid #1c1c3f", display: "flex", flexDirection: "column", zIndex: 110 }}>
             
             {/* IDE TAB BAR */}
             <div style={{ display: "flex", background: "#050510", borderBottom: "1px solid #1c1c3f" }}>
                {["CODE", "CLOUD", "LOGS"].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "12px", background: activeTab === tab ? "transparent" : "#08081a", border: "none", color: activeTab === tab ? "#00f5d4" : "#444", fontSize: "10px", fontFamily: "Orbitron", cursor: "pointer", borderBottom: activeTab === tab ? "2px solid #00f5d4" : "none" }}>{tab}</button>
                ))}
             </div>

             {activeTab === "CODE" && (
                <>
                  <div style={{ padding: "12px 20px", borderBottom: "1px solid #1c1c3f11", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "9px", color: "#444" }}>main.py</span>
                    {isRunning ? (
                      <button onClick={stopApp} style={{ background: "#eb4d4b", color: "#fff", border: "none", padding: "4px 15px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold", cursor: "pointer" }}>STOP</button>
                    ) : (
                      <button onClick={runApp} style={{ background: "#00f5d4", color: "#000", border: "none", padding: "4px 15px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold", cursor: "pointer" }}>RUN</button>
                    )}
                  </div>
                  <textarea value={code} onChange={e => setCode(e.target.value)} style={{ flex: 1, background: "transparent", color: "#00f5d4", border: "none", padding: "20px", fontFamily: "monospace", outline: "none", resize: "none" }} />
                </>
             )}

             {activeTab === "CLOUD" && (
                <div style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "25px", overflowY: "auto" }}>
                  <div style={{ background: "#111126", borderRadius: "12px", padding: "20px", border: "1px solid #1c1c3f" }}>
                    <div style={{ fontSize: "10px", color: "#444", letterSpacing: "1px", marginBottom: "15px" }}>IOT GATEWAY (RENDER)</div>
                    {!apiKey ? (
                      <button onClick={async () => {
                        const key = await iotManager.generateKey();
                        setApiKey(key);
                      }} style={{ width: "100%", background: "#00f5d4", padding: "12px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}>CREATE NEW CHANNEL</button>
                    ) : (
                      <div style={{ wordBreak: "break-all", background: "#000", padding: "10px", borderRadius: "4px", border: "1px solid #00f5d444", color: "#00f5d4", fontSize: "11px", fontFamily: "monospace" }}>KEY: {apiKey}</div>
                    )}
                  </div>

                  <div style={{ flex: 1, background: "#050510", borderRadius: "12px", border: "1px solid #1c1c3f", padding: "20px" }}>
                    <div style={{ fontSize: "10px", color: "#444", marginBottom: "20px" }}>LIVE TELEMETRY (TEMPERATURE)</div>
                    <div style={{ height: "150px", display: "flex", alignItems: "flex-end", gap: "5px" }}>
                      {history.map((h, i) => (
                        <div key={i} style={{ flex: 1, background: "#00f5d4", height: `${(parseFloat(h.value) / 50) * 100}%`, borderRadius: "2px 2px 0 0", minWidth: "15px", opacity: (i+1)/history.length }} />
                      ))}
                    </div>
                  </div>
                </div>
             )}

             <div style={{ height: "120px", background: "#000", padding: "15px", color: "#00f5d4", fontSize: "10px", fontFamily: "monospace", borderTop: "1px solid #1c1c3f", overflowY: "auto" }}>
                {logs.map((L, i) => <div key={i}>{L}</div>)}
                {!logs.length && (
                  <>
                    [SYSTEM] CM5 Lite Digital Twin Online.<br/>
                    [DTS] Loaded 46 Pin Profiles.<br/>
                    [I2C] PCF8523 Ready at 0x68.
                  </>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );

  function computeV() {
    if (!meterProbes.red || !meterProbes.black) return "0.00";
    const v1 = simResults.voltages[meterProbes.red] || 0;
    const v2 = simResults.voltages[meterProbes.black] || 0;
    return Math.abs(v1-v2).toFixed(2);
  }
}

// ── COORD RESOLVER ─────────────────────────────────────────────────────────

function getCoords(id, parts) {
  if (!id) return null;
  // CM5 Header Coordinates (Synced with SVG)
  if (id.startsWith("pin-")) {
    const num = parseInt(id.split("-")[1]) - 1;
    const xBase = 80 + 200;
    const yBase = 80 + 60;
    const x = xBase + (num % 2 === 0 ? 12 : 33);
    const y = yBase + 12 + Math.floor(num / 2) * 13.5;
    return { x, y };
  } 
  // Breadboard Coordinates (Synced with SVG)
  else if (id.startsWith("brd-")) {
    const [_, r, c] = id.split("-");
    const xBase = 480;
    const yBase = 80;
    return { x: xBase + 70 + parseInt(c) * 15.5, y: yBase + 25 + parseInt(r) * 15.5 };
  } 
  // Component Coordinates (ID split fix)
  else if (id.includes("-")) {
    const segments = id.split("-");
    if (segments[0] !== "pt") return null;
    const ptId = `${segments[0]}-${segments[1]}`;
    const pinId = segments[2];
    
    const p = parts.find(part => part.id === ptId);
    if (!p) return null;
    const pinDef = PART_DATA[p.type].pins.find(pin => pin.id === pinId);
    if (!pinDef) return null;
    return { x: p.x + pinDef.x, y: p.y + pinDef.y };
  }
  return null;
}
