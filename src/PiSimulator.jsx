import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── CONSTANTS & TYPES ──────────────────────────────────────────────────────

const PART_TYPES = {
  LED: { name: "LED", color: "#eb4d4b", pins: [{ id: "anode", x: 0, y: -20 }, { id: "cathode", x: 0, y: 20 }] },
  RESISTOR: { name: "Resistor", color: "#d1d8e0", pins: [{ id: "p1", x: -30, y: 0 }, { id: "p2", x: 30, y: 0 }] },
  SENSOR: { name: "ADXL355", color: "#4b7bec", pins: [{ id: "vcc", x: -20, y: -20 }, { id: "gnd", x: 20, y: -20 }, { id: "sda", x: -20, y: 20 }, { id: "scl", x: 20, y: 20 }] }
};

const PI_PINS = Array.from({ length: 40 }, (_, i) => ({
  id: `pin-${i + 1}`,
  num: i + 1,
  x: i % 2 === 0 ? 40 : 60,
  y: 20 + Math.floor(i / 2) * 15,
  type: i === 5 ? "GND" : i === 16 ? "GPIO17" : "OTHER"
}));

// ── COMPONENT ──────────────────────────────────────────────────────────────

export default function PiSimulator({ onComplete }) {
  const [parts, setParts] = useState([]);
  const [wires, setWires] = useState([]);
  const [activeWire, setActiveWire] = useState(null); // { fromNode, color }
  const [code, setCode] = useState(
`import RPi.GPIO as GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.OUT)

# TASK: Wire GPIO 17 -> LED -> GND
# THEN RUN: GPIO.output(17, 1)`
  );
  const [output, setOutput] = useState(["[OS] PiOS 64-bit Ready", "[INFO] Prototyping Mode Active"]);
  const [pinStates, setPinStates] = useState({});
  const [ledGlow, setLedGlow] = useState(false);
  const workspaceRef = useRef(null);

  // ── CIRCUIT RESOLUTION ───────────────────────────────────────────────────

  useEffect(() => {
    // Basic Simulation: If Pin 17 is HIGH and connected to an LED that reaches GND
    const pin17High = pinStates[17];
    let connectedToLED = false;
    let ledToGnd = false;

    if (pin17High) {
      // Find wires from Pin 17
      const wiresFrom17 = wires.filter(w => w.from === "pin-17" || w.to === "pin-17");
      wiresFrom17.forEach(w => {
        const otherNode = w.from === "pin-17" ? w.to : w.from;
        if (otherNode.startsWith("part-") && otherNode.includes("anode")) connectedToLED = true;
      });

      if (connectedToLED) {
        // Find wires from LED cathode to GND (Pin 6)
        const ledId = parts.find(p => p.type === "LED")?.id;
        if (ledId) {
          const wiresFromCathode = wires.filter(w => w.from === `${ledId}-cathode` || w.to === `${ledId}-cathode`);
          wiresFromCathode.forEach(w => {
            const other = w.from === `${ledId}-cathode` ? w.to : w.from;
            if (other === "pin-6") ledToGnd = true;
          });
        }
      }
    }

    if (ledToGnd) {
      setLedGlow(true);
      if (!output.includes("[SUCCESS] Circuit Closed: LED Active")) {
        setOutput(prev => [...prev, "[SUCCESS] Circuit Closed: LED Active"]);
        setTimeout(onComplete, 3000);
      }
    } else {
      setLedGlow(false);
    }
  }, [wires, pinStates, parts, onComplete]);

  // ── HANDLERS ─────────────────────────────────────────────────────────────

  const addPart = (type) => {
    const id = `part-${Date.now()}`;
    setParts([...parts, { id, type, x: 100, y: 100, rotation: 0 }]);
  };

  const handleNodeClick = (nodeId) => {
    if (!activeWire) {
      setActiveId(null);
      setActiveWire({ from: nodeId, color: "#f7b731" });
    } else {
      if (activeWire.from !== nodeId) {
        setWires([...wires, { from: activeWire.from, to: nodeId, color: activeWire.color }]);
      }
      setActiveWire(null);
    }
  };

  const runCode = () => {
    const lines = code.split("\n");
    const newStates = { ...pinStates };
    setOutput(prev => [...prev, "> python exec..."]);
    
    lines.forEach(line => {
      if (line.includes("GPIO.output(17, 1)") || line.includes("GPIO.output(17, GPIO.HIGH)")) {
        newStates[17] = true;
        setOutput(prev => [...prev, "[GPIO] Pin 17 -> HIGH"]);
      }
    });
    setPinStates(newStates);
  };

  return (
    <div style={{ background: "#0c0c16", color: "#fff", display: "flex", height: "100%", width: "100%", borderRadius: "20px", overflow: "hidden", border: "1px solid #333" }}>
      
      {/* Sidebar - Parts Bin */}
      <div style={{ width: "80px", background: "#080814", borderRight: "1px solid #222", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "20px 0" }}>
        <div style={{ fontSize: "8px", color: "#444", fontFamily: "Orbitron" }}>PARTS</div>
        {Object.entries(PART_TYPES).map(([key, config]) => (
          <motion.div key={key} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => addPart(key)}
            style={{ width: "40px", height: "40px", background: config.color, borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: `0 0 10px ${config.color}33` }}>
            {key === "LED" ? "💡" : key === "RESISTOR" ? "Ω" : "📡"}
          </motion.div>
        ))}
        <button onClick={() => setWires([])} style={{ marginTop: "auto", fontSize: "8px", color: "#eb4d4b", background: "none", border: "1px solid #eb4d4b22", padding: "5px", cursor: "pointer" }}>CLEAR WIRES</button>
      </div>

      {/* Main Workspace */}
      <div ref={workspaceRef} style={{ flex: 1, position: "relative", background: "#050510", overflow: "hidden" }}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          {/* Breadboard Pattern */}
          {[...Array(30)].map((_, i) => [...Array(10)].map((__, j) => (
            <circle key={`${i}-${j}`} cx={150 + i * 15} cy={100 + j * 15} r="1.5" fill="#1a1a2e" />
          )))}

          {/* Wires */}
          {wires.map((w, i) => {
            const start = getNodeCoords(w.from, parts);
            const end = getNodeCoords(w.to, parts);
            return (
              <line key={i} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={w.color} strokeWidth="2" strokeLinecap="round" strokeDasharray="4 2" />
            );
          })}

          {/* Pi Header */}
          <g transform="translate(20, 20)">
            <rect width="80" height="320" fill="#111" rx="4" />
            {PI_PINS.map(p => (
              <circle key={p.id} cx={p.x} cy={p.y} r="4" fill={p.type === "GND" ? "#222" : p.type === "GPIO17" ? "#eb4d4b" : "#444"} 
                onClick={() => handleNodeClick(p.id)} style={{ cursor: "pointer" }} />
            ))}
          </g>

          {/* Draggable Parts */}
          {parts.map(p => (
            <foreignObject key={p.id} x={p.x - 40} y={p.y - 40} width="80" height="80">
              <motion.div drag dragMomentum={false} onDrag={(_, info) => {
                const newParts = parts.map(part => part.id === p.id ? { ...part, x: part.x + info.delta.x, y: part.y + info.delta.y } : part);
                setParts(newParts);
              }}
              style={{ width: "100%", height: "100%", position: "relative", cursor: "grab" }}>
                <div style={{ width: "30px", height: "30px", background: PART_TYPES[p.type].color, borderRadius: "4px", margin: "25px auto", boxShadow: (p.type === "LED" && ledGlow) ? `0 0 20px ${PART_TYPES[p.type].color}` : "none" }} />
                {PART_TYPES[p.type].pins.map(pin => (
                  <div key={pin.id} onClick={() => handleNodeClick(`${p.id}-${pin.id}`)}
                    style={{ position: "absolute", left: `calc(50% + ${pin.x}px)`, top: `calc(50% + ${pin.y}px)`, width: "6px", height: "6px", background: "#fff", borderRadius: "50%", transform: "translate(-50%, -50%)", cursor: "pointer", border: "1px solid #00f5d4" }} />
                ))}
              </motion.div>
            </foreignObject>
          ))}
        </svg>

        <div style={{ position: "absolute", bottom: "20px", left: "20px", display: "flex", gap: "15px" }}>
            <div style={{ fontSize: "9px", color: "#444", fontFamily: "Orbitron" }}>BOARD: RASPBERRY PI 5</div>
            <div style={{ fontSize: "9px", color: "#eb4d4b", fontFamily: "Orbitron" }}>PIN 17: {pinStates[17] ? "HIGH" : "LOW"}</div>
        </div>
      </div>

      {/* Editor & Console */}
      <div style={{ width: "300px", borderLeft: "1px solid #222", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#080814", padding: "10px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "10px", color: "#aaa", fontFamily: "Orbitron" }}>IDE</span>
          <button onClick={runCode} style={{ background: "#00f5d4", border: "none", color: "#000", padding: "2px 10px", borderRadius: "4px", fontSize: "10px", fontWeight: "900", cursor: "pointer" }}>RUN</button>
        </div>
        <textarea value={code} onChange={(e) => setCode(e.target.value)}
          style={{ flex: 1, background: "#050510", color: "#00f5d4", padding: "10px", fontFamily: "monospace", border: "none", outline: "none", resize: "none" }} />
        <div style={{ height: "120px", background: "#000", padding: "10px", fontFamily: "monospace", fontSize: "9px", color: "#666", overflowY: "auto", borderTop: "1px solid #222" }}>
          {output.map((l, i) => <div key={i} style={{ color: l.startsWith("[SUCCESS]") ? "#00f5d4" : "#666" }}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}

// ── UTILS ──────────────────────────────────────────────────────────────────

function getNodeCoords(nodeId, parts) {
  if (nodeId.startsWith("pin-")) {
    const pinNum = parseInt(nodeId.split("-")[1]);
    const i = pinNum - 1;
    return { x: 20 + (i % 2 === 0 ? 40 : 60), y: 20 + 20 + Math.floor(i / 2) * 15 };
  } else {
    const [partId, pinId] = nodeId.split("-");
    const part = parts.find(p => p.id === partId);
    if (!part) return { x: 0, y: 0 };
    const pinConfig = PART_TYPES[part.type].pins.find(p => p.id === pinId);
    return { x: part.x + pinConfig.x, y: part.y + pinConfig.y };
  }
}
