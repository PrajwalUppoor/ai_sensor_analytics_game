import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import PiSimulator from "./PiSimulator";

// ── UTILS ──────────────────────────────────────────────────────────────────

const shake = {
  shake: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } }
};

function InstructionOverlay({ title, text, onDismiss }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "340px", textAlign: "center" }}>
        <div style={{ color: "#f7b731", fontSize: "10px", fontFamily: "Orbitron", letterSpacing: "2px", marginBottom: "8px" }}>MISSION BRIEFING</div>
        <h4 style={{ color: "#fff", margin: "0 0 12px", fontFamily: "Orbitron", fontSize: "16px" }}>{title}</h4>
        <p style={{ color: "#aaa", fontSize: "13px", lineHeight: "1.6", marginBottom: "20px" }}>{text}</p>
        <button onClick={onDismiss} style={{ background: "#f7b731", border: "none", color: "#000", padding: "10px 24px", borderRadius: "50px", fontWeight: "900", fontFamily: "Orbitron", cursor: "pointer" }}>UNDERSTOOD</button>
      </div>
    </motion.div>
  );
}

// ── TASK 1: BRIDGE CALIBRATION (SENSE) ─────────────────────────────────────

function BridgeTask({ onComplete }) {
  const [balance, setBalance] = useState(10);
  const [noise, setNoise] = useState(0);
  const [instruction, setInstruction] = useState(true);
  const target = 72;
  const isAligned = Math.abs(balance - target) < 4;

  useEffect(() => {
    const t = setInterval(() => setNoise(Math.random() * 5), 100);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (isAligned) setTimeout(onComplete, 1500);
  }, [isAligned, onComplete]);

  return (
    <div style={{ padding: "20px", position: "relative" }}>
      <AnimatePresence>{instruction && <InstructionOverlay title="Bridge Balancing" text="PT100 sensors use a Wheatstone bridge. Drag the slider to null-balance the voltage offset before processing raw analog signals." onDismiss={() => setInstruction(false)} />}</AnimatePresence>
      <h3 style={{ color: "#00f5d4", fontFamily: "Orbitron", fontSize: "12px", marginBottom: "15px" }}>SENSE: ANALOG BRIDGE NULLING</h3>
      <div style={{ height: "100px", background: "#000", borderRadius: "8px", border: "1px solid #111", position: "relative", marginBottom: "18px", overflow: "hidden" }}>
        <svg width="100%" height="100%">
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#111" />
          <motion.path 
            animate={{ d: `M 0 50 ${[...Array(10)].map((_, i) => `L ${i * 40} ${50 + (balance - target) + (Math.random() - 0.5) * 4}`).join(" ")}` }}
            stroke={isAligned ? "#00f5d4" : "#ff4d4d"} fill="none" strokeWidth="2"
          />
        </svg>
        {isAligned && <div style={{ position: "absolute", inset: 0, background: "#00f5d411", display: "flex", alignItems: "center", justifyContent: "center", color: "#00f5d4", fontSize: "10px", fontFamily: "Orbitron", fontWeight: "900" }}>BRIDGE STABILIZED</div>}
      </div>
      <input type="range" min="0" max="100" value={balance} onChange={(e) => setBalance(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#00f5d4" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#444", marginTop: "8px", fontFamily: "monospace" }}><span>REF_V: 3.3V</span><span>OFFSET: {(balance - target).toFixed(1)} mV</span></div>
    </div>
  );
}

// ── TASK 2: FFT FILTERING (FILTER) ────────────────────────────────────────

function FilterTask({ onComplete }) {
  const [cutoff, setCutoff] = useState(5);
  const [instruction, setInstruction] = useState(true);
  const [shaking, setShaking] = useState(false);
  const target = 82;
  const isClean = cutoff >= target;

  useEffect(() => {
    if (isClean) setTimeout(onComplete, 1200);
  }, [isClean, onComplete]);

  const handleAdjust = (v) => {
    setCutoff(v);
    if (v < 20) setShaking(true);
    else setShaking(false);
  };

  return (
    <motion.div animate={shaking ? shake.shake : {}} style={{ padding: "20px", position: "relative" }}>
      <AnimatePresence>{instruction && <InstructionOverlay title="FFT Spectral Cleaning" text="Vibration data from ADXL355 is noisy. High-frequency artifacts must be filtered to reveal the machine's harmonic signature." onDismiss={() => setInstruction(false)} />}</AnimatePresence>
      <h3 style={{ color: "#0090ff", fontFamily: "Orbitron", fontSize: "12px", marginBottom: "15px" }}>FILTER: BANDPASS SIGNAL RECOVERY</h3>
      <div style={{ height: "100px", background: "#000", borderRadius: "8px", border: "1px solid #111", position: "relative", marginBottom: "18px", overflow: "hidden" }}>
        <svg width="100%" height="100%" viewBox="0 0 400 100">
           {[...Array(40)].map((_, i) => (
             <motion.line key={i} x1={i * 10} y1={50 + (Math.random() - 0.5) * (100 - cutoff)} x2={i * 10 + 4} y2={50 + (Math.random() - 0.5) * (100 - cutoff)} stroke="#ff4d4d" strokeWidth="1" opacity={isClean?0.1:0.6} />
           ))}
           <path d="M 0 50 L 400 50" stroke="#0090ff" strokeWidth="2" strokeDasharray="4 2" />
        </svg>
        {isClean && <div style={{ position: "absolute", inset: 0, background: "#0090ff11", display: "flex", alignItems: "center", justifyContent: "center", color: "#0090ff", fontSize: "10px", fontFamily: "Orbitron", fontWeight: "900" }}>HARMONICS RECOVERED</div>}
      </div>
      <input type="range" min="0" max="100" value={cutoff} onChange={(e) => handleAdjust(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#0090ff" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#444", marginTop: "8px", fontFamily: "monospace" }}><span>Fc: {cutoff * 100} Hz</span><span>SNR: {(cutoff / 10).toFixed(1)} dB</span></div>
    </motion.div>
  );
}

// ── TASK 3: SIGNATURE EXTRACTION (FEATURE) ────────────────────────────────

function FeatureTask({ onComplete }) {
  const [hits, setHits] = useState([]);
  const [instruction, setInstruction] = useState(true);
  const targets = [1, 3, 5]; // Harmonic peaks

  const toggle = (i) => {
    if (hits.includes(i)) return;
    if (targets.includes(i)) {
      const next = [...hits, i];
      setHits(next);
      if (next.length === targets.length) {
        setTimeout(onComplete, 1200);
        confetti({ particleCount: 20 });
      }
    }
  };

  return (
    <div style={{ padding: "20px", position: "relative" }}>
      <AnimatePresence>{instruction && <InstructionOverlay title="Harmonic Signature" text="Machine faults appear as specific harmonics (multiples of shaft speed). Tap the abnormal high-amplitude frequency peaks." onDismiss={() => setInstruction(false)} />}</AnimatePresence>
      <h3 style={{ color: "#f7b731", fontFamily: "Orbitron", fontSize: "12px", marginBottom: "15px" }}>FEATURE: FFT PEAK EXTRACTION</h3>
      <div style={{ height: "120px", background: "#050510", borderRadius: "10px", display: "flex", alignItems: "flex-end", gap: "8px", padding: "10px", border: "1px solid #111" }}>
        {[20, 90, 30, 85, 25, 95, 40, 50].map((h, i) => (
          <motion.div key={i} onClick={() => toggle(i)}
            animate={{ height: `${h}%`, background: hits.includes(i) ? "#f7b731" : "#1e1e1e" }}
            style={{ flex: 1, borderRadius: "4px", cursor: "pointer", position: "relative", boxShadow: hits.includes(i) ? "0 0 10px #f7b73166" : "none" }}
          >
             {targets.includes(i) && !hits.includes(i) && <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity }} style={{ position: "absolute", top: -15, left: "50%", transform: "translateX(-50%)", color: "#f7b731", fontSize: "10px" }}>▽</motion.div>}
          </motion.div>
        ))}
      </div>
      <div style={{ color: hits.length === targets.length ? "#00f5d4" : "#444", fontFamily: "Orbitron", fontSize: "10px", marginTop: "12px", textAlign: "center" }}>
        {hits.length === targets.length ? "SIGNATURE EXTRACTED" : "SELECT PEAK HARMONICS"}
      </div>
    </div>
  );
}

// ── TASK 4: SYNAPTIC MAPPING (MODEL) ──────────────────────────────────────

function NCPTask({ onComplete }) {
  const [links, setLinks] = useState([]);
  const [instruction, setInstruction] = useState(true);
  const nodes = [{ x: 10, y: 50, l: "IN" }, { x: 35, y: 30, l: "W1" }, { x: 35, y: 70, l: "W2" }, { x: 65, y: 50, l: "Σ" }, { x: 90, y: 50, l: "DET" }];

  const link = (i) => {
    if (links.includes(i)) return;
    const next = [...links, i];
    setLinks(next);
    if (next.length === nodes.length) setTimeout(onComplete, 1200);
  };

  return (
    <div style={{ padding: "20px", position: "relative" }}>
      <AnimatePresence>{instruction && <InstructionOverlay title="NCP Weight Tuning" text="Neural Circuit Processors use sparse, biological-inspired wiring. Map the synaptic path to identify the 'Bearing Wear' fault." onDismiss={() => setInstruction(false)} />}</AnimatePresence>
      <h3 style={{ color: "#a55eea", fontFamily: "Orbitron", fontSize: "12px", marginBottom: "15px" }}>MODEL: NCP SYNAPTIC MAPPING</h3>
      <div style={{ height: "160px", background: "#060610", borderRadius: "10px", position: "relative", border: "1px solid #111" }}>
        <svg width="100%" height="100%"><path d={`M ${links.map(i => `${nodes[i].x}% ${nodes[i].y}%`).join(" L ")}`} fill="none" stroke="#a55eea" strokeWidth="2" strokeDasharray="4 2" /></svg>
        {nodes.map((n, i) => (
          <motion.div key={i} onClick={() => link(i)} whileTap={{ scale: 0.9 }} style={{ position: "absolute", left: `${n.x}%`, top: `${n.y}%`, width: "30px", height: "30px", transform: "translate(-50%,-50%)", background: links.includes(i) ? "#a55eea" : "#111", border: "1.5px solid #a55eea", borderRadius: "50%", color: "#fff", fontSize: "9px", fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: links.includes(i) ? "0 0 15px #a55eea66" : "none" }}>{n.l}</motion.div>
        ))}
      </div>
    </div>
  );
}

// ── TASK 5: POWER OPTIMIZATION (DEVICE) ───────────────────────────────────

function PowerTask({ onComplete }) {
  const [modes, setModes] = useState({ cpu: "HIGH", radio: "ON", infer: "FAST" });
  const [instruction, setInstruction] = useState(true);
  const [fails, setFails] = useState(0);
  const [shaking, setShaking] = useState(false);

  const powerMap = { cpu: { LOW: 1.2, HIGH: 3.5 }, radio: { OFF: 0, ON: 2.5 }, infer: { SLOW: 1.1, FAST: 4.8 } };
  const total = powerMap.cpu[modes.cpu] + powerMap.radio[modes.radio] + powerMap.infer[modes.infer];
  const limit = 5.0;

  const [steadySecs, setSteadySecs] = useState(0);

  useEffect(() => {
    let t;
    if (total <= limit) {
      t = setInterval(() => setSteadySecs(s => s + 1), 1000);
      setShaking(false);
      if (steadySecs >= 3) onComplete();
    } else {
      setSteadySecs(0);
      setShaking(true);
      const timer = setTimeout(() => { setFails(f => f + 1); setModes({ cpu: "LOW", radio: "OFF", infer: "SLOW" }); }, 4000);
      return () => clearTimeout(timer);
    }
    return () => clearInterval(t);
  }, [total, steadySecs, onComplete]);

  return (
    <motion.div animate={shaking ? shake.shake : {}} style={{ padding: "20px", position: "relative" }}>
      <AnimatePresence>{instruction && <InstructionOverlay title="DVFS Optimization" text="Edge devices have strict energy limits (<5mW). Adjust processing frequency and radio states to stay within thermal limits." onDismiss={() => setInstruction(false)} />}</AnimatePresence>
      <h3 style={{ color: "#fc5c65", fontFamily: "Orbitron", fontSize: "12px", marginBottom: "15px" }}>DEVICE: DVFS POWER TUNING</h3>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "38px", fontFamily: "Orbitron", color: total <= limit ? "#00f5d4" : "#fc5c65", fontWeight: "900" }}>{total.toFixed(1)} <span style={{ fontSize: "14px" }}>mW</span></div>
        <div style={{ height: "4px", background: "#111", borderRadius: "100px", marginTop: "10px", position: "relative" }}>
          <div style={{ position: "absolute", left: "50%", width: "2px", height: "10px", background: "#333", top: "-3px" }} />
          <motion.div animate={{ width: `${(total / 12) * 100}%`, background: total <= limit ? "#00f5d4" : "#fc5c65" }} style={{ height: "100%", borderRadius: "100px" }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
        {Object.entries(modes).map(([k, v]) => (
          <div key={k} onClick={() => setModes(m => ({ ...m, [k]: k === "radio" ? (v === "ON" ? "OFF" : "ON") : (v === "HIGH" ? "LOW" : "HIGH") || (v === "FAST" ? "SLOW" : "FAST") }))}
            style={{ background: "#111", padding: "10px", borderRadius: "8px", border: "1px solid #222", cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontSize: "8px", color: "#444", marginBottom: "4px" }}>{k.toUpperCase()}</div>
            <div style={{ fontSize: "10px", color: "#fff", fontWeight: "700" }}>{v}</div>
          </div>
        ))}
      </div>
      {total > limit && <div style={{ color: "#fc5c65", fontSize: "9px", fontFamily: "Orbitron", marginTop: "15px", textAlign: "center", animation: "urgBlink 0.3s infinite" }}>⚠️ OVERTEMP CRITICAL</div>}
      {total <= limit && <div style={{ color: "#00f5d4", fontSize: "9px", fontFamily: "Orbitron", marginTop: "15px", textAlign: "center" }}>STABILIZING... {3 - steadySecs}s</div>}
    </motion.div>
  );
}

// ── TASK 6: MQTT PROVISIONING (CLOUD) ─────────────────────────────────────

function CloudTask({ onComplete }) {
  const [provisioned, setProvisioned] = useState([]);
  const [instruction, setInstruction] = useState(true);
  const tasks = [{ id: "cert", label: "GENERATE X.509 CERT" }, { id: "attach", label: "ATTACH POLICY" }, { id: "sync", label: "SHADOW UPDATED" }];

  const complete = (id) => {
    if (provisioned.includes(id)) return;
    const next = [...provisioned, id];
    setProvisioned(next);
    if (next.length === tasks.length) setTimeout(onComplete, 1200);
  };

  return (
    <div style={{ padding: "20px", position: "relative" }}>
      <AnimatePresence>{instruction && <InstructionOverlay title="MQTT Security Handshake" text="Cloud gateways require secure authentication. Generate certificates and attach policies to create a persistent telemetry path." onDismiss={() => setInstruction(false)} />}</AnimatePresence>
      <h3 style={{ color: "#686de0", fontFamily: "Orbitron", fontSize: "12px", marginBottom: "15px" }}>CLOUD: MQTT GATEWAY PROVISIONING</h3>
      <div style={{ display: "grid", gap: "8px" }}>
        {tasks.map(t => (
          <div key={t.id} onClick={() => complete(t.id)}
            style={{ padding: "14px", borderRadius: "10px", background: provisioned.includes(t.id) ? "rgba(104,109,224,0.15)" : "#050505", border: `1.5px solid ${provisioned.includes(t.id) ? "#686de0" : "#111"}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: provisioned.includes(t.id) ? "#fff" : "#444" }}>{t.label}</span>
            {provisioned.includes(t.id) ? <span style={{ color: "#686de0" }}>●</span> : <div style={{ width: "8px", height: "8px", border: "1px solid #222", borderRadius: "2px" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TASK 7: MILLISEC ACTUATION (ACT) ──────────────────────────────────────

function ActTask({ onComplete }) {
  const [active, setActive] = useState(Math.floor(Math.random() * 20));
  const [instruction, setInstruction] = useState(true);
  const [found, setFound] = useState(false);
  const [timer, setTimer] = useState(10);

  useEffect(() => {
    if (found || instruction) return;
    const t = setInterval(() => setTimer(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [found, instruction]);

  useEffect(() => {
    if (timer === 0 && !found) {
      setInstruction(true); // Restart briefing on fail
      setTimer(10);
      setActive(Math.floor(Math.random() * 20));
    }
  }, [timer, found]);

  const handleFix = (idx) => {
    if (idx === active && !found) {
      setFound(true);
      setTimeout(onComplete, 1500);
      confetti({ particleCount: 50, spread: 70 });
    }
  };

  return (
    <div style={{ padding: "20px", position: "relative" }}>
      <AnimatePresence>{instruction && <InstructionOverlay title="Remote Actuation" text="AI Inference detected a bearing fault. Trigger the Millisecond Emergency Stop on the specific machine unit before it seizes." onDismiss={() => setInstruction(false)} />}</AnimatePresence>
      <h3 style={{ color: "#eb4d4b", fontFamily: "Orbitron", fontSize: "12px", marginBottom: "15px" }}>ACT: LOW-LATENCY E-STOP</h3>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontFamily: "Orbitron", fontSize: "10px" }}>
        <span style={{ color: "#444" }}>UNIT_SEARCH: POSITIVE</span>
        <span style={{ color: timer < 4 ? "#eb4d4b" : "#444", animation: timer < 4 ? "urgBlink 0.3s infinite" : "" }}>MTBF: {timer}s</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
        {[...Array(20)].map((_, i) => (
          <motion.div key={i} onClick={() => handleFix(i)}
            style={{ 
              height: "30px", borderRadius: "6px", background: i === active && !found ? "#eb4d4b" : found && i === active ? "#00f5d4" : "#111",
              border: `1.5px solid ${i === active && !found ? "#eb4d4b" : "#222"}`, cursor: "pointer",
              boxShadow: i === active && !found ? "0 0 15px #eb4d4b88" : "none"
            }}
            animate={i === active && !found ? { opacity: [1, 0.4, 1], scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.4 }}
          />
        ))}
      </div>
      {found && <div style={{ color: "#00f5d4", fontSize: "10px", textAlign: "center", marginTop: "15px", fontFamily: "Orbitron" }}>COMMAND EXECUTED: UNIT SECURE</div>}
    </div>
  );
}

// ── MAIN MISSION HUB ────────────────────────────────────────────────────────

const PIPELINE = [
  { id: "S", tag: "SENSE", label: "Bridge Calibration", color: "#00f5d4" },
  { id: "F", tag: "FILTER", label: "Spectral Cleaning", color: "#0090ff" },
  { id: "E", tag: "FEATURE", label: "Harmonic Signature", color: "#f7b731" },
  { id: "M", tag: "MODEL", label: "Synaptic Mapping", color: "#a55eea" },
  { id: "D", tag: "DEVICE", label: "DVFS Optimization", color: "#fc5c65" },
  { id: "C", tag: "CLOUD", label: "Topic Provisioning", color: "#686de0" },
  { id: "A", tag: "ACT", label: "Remote Actuation", color: "#eb4d4b" },
  { id: "P", tag: "PROTO", label: "Pi Hardware Logic", color: "#00f5d4" }
];

export default function VisualGame({ score, setScore, onBackToMenu }) {
  const [briefing, setBriefing] = useState(true);
  const [completed, setCompleted] = useState([]); // ids
  const [activeId, setActiveId] = useState(null);
  const [roi, setRoi] = useState(0);

  const complete = (id) => {
    if (completed.includes(id)) return;
    setCompleted(prev => [...prev, id]);
    setScore(s => s + 400);
    setActiveId(null);
    // Animate ROI savings
    const targetRoi = roi + (2300000 / PIPELINE.length);
    let curr = roi;
    const t = setInterval(() => {
      curr += 25000;
      if (curr >= targetRoi) { setRoi(targetRoi); clearInterval(t); }
      else setRoi(curr);
    }, 20);
  };

  const isAllDone = completed.length === PIPELINE.length;

  return (
    <div style={{ minHeight: "100vh", background: "#060610", display: "flex", flexDirection: "column", position: "relative" }}>
      
      {/* HUD Bar */}
      <div style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #111", background: "#080814" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button onClick={onBackToMenu} style={{ background: "none", border: "1px solid #222", color: "#444", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontFamily: "Orbitron", fontSize: "9px" }}>ABORT</button>
          <div style={{ height: "16px", width: "1px", background: "#222" }} />
          <div style={{ fontSize: "10px", color: "#f7b731", fontFamily: "Orbitron" }}>ROI_SAVINGS: ${roi.toLocaleString()}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#444", fontSize: "8px", fontFamily: "Orbitron", letterSpacing: "2px" }}>PIPELINE CONSISTENCY</div>
          <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
            {PIPELINE.map(p => <div key={p.id} style={{ height: "4px", width: "16px", background: completed.includes(p.id) ? p.color : "#111", borderRadius: "1px", boxShadow: completed.includes(p.id) ? `0 0 5px ${p.color}` : "none" }} />)}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {briefing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "#060610", zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "30px" }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} style={{ maxWidth: "450px" }}>
              <div style={{ color: "#ff4d4d", fontSize: "10px", fontFamily: "Orbitron", letterSpacing: "5px", marginBottom: "15px" }}>INCIDENT REPORT #402</div>
              <h2 style={{ color: "#fff", fontFamily: "Orbitron", fontSize: "28px", letterSpacing: "3px", marginBottom: "20px" }}>FACTORY DOWNTIME IMMINENT</h2>
              <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.7", marginBottom: "30px" }}>
                CNC Machine Unit #42 is vibrating at critical harmonics. Estimated <strong>$2.3 Million</strong> in damages if the bearing fails.
                <br/><br/>
                Establish the end-to-end AIoT pipeline to detect and secure the unit remotely.
              </p>
              <button onClick={() => setBriefing(false)} style={{ background: "linear-gradient(135deg, #00f5d4, #0090ff)", border: "none", color: "#000", padding: "15px 45px", borderRadius: "50px", fontWeight: "900", fontFamily: "Orbitron", cursor: "pointer", fontSize: "18px", boxShadow: "0 0 30px #00f5d466" }}>ENGAGE HUB</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {PIPELINE.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => !completed.includes(p.id) && setActiveId(p.id)}
            style={{ 
              padding: "16px", borderRadius: "14px", border: `1.5px solid ${completed.includes(p.id) ? p.color : "#111"}`,
              background: completed.includes(p.id) ? `${p.color}08` : "rgba(255,255,255,0.01)",
              display: "flex", alignItems: "center", gap: "15px", cursor: completed.includes(p.id) ? "default" : "pointer",
              transition: "0.2s"
            }}>
            <div style={{ background: p.color, color: "#000", fontSize: "9px", fontWeight: "900", padding: "3px 8px", borderRadius: "5px", fontFamily: "Orbitron", width: "54px", textAlign: "center" }}>{p.tag}</div>
            <div style={{ flex: 1, color: completed.includes(p.id) ? "#888" : "#fff", fontSize: "14px", fontWeight: "600" }}>{p.label}</div>
            {completed.includes(p.id) && <span style={{ color: p.color, fontSize: "14px" }}>✔</span>}
          </motion.div>
        ))}

        {isAllDone && (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ marginTop: "20px", padding: "40px 20px", background: "rgba(0,245,212,0.1)", border: "2px dashed #00f5d4", borderRadius: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "50px" }}>🏆</div>
            <h3 style={{ color: "#00f5d4", fontFamily: "Orbitron", fontSize: "24px", margin: "10px 0" }}>MISSION SUCCESS</h3>
            <p style={{ color: "#666", fontSize: "13px", marginBottom: "25px" }}>Full pipeline secured. Machine Unit #42 shutdown gracefully.<br/><strong>Impact: $2.3M Downtime Avoided.</strong></p>
            <button onClick={onBackToMenu} style={{ background: "#00f5d4", border: "none", color: "#000", padding: "12px 40px", borderRadius: "50px", fontWeight: "900", fontFamily: "Orbitron", cursor: "pointer" }}>EXIT TO HUB</button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {activeId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20 }}
              style={{ width: "100%", maxWidth: "400px", background: "#080814", border: "1.5px solid #222", borderRadius: "24px", overflow: "hidden", position: "relative" }}>
              
              <div style={{ background: "#111", padding: "10px 15px", display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#444", fontFamily: "Orbitron" }}>
                <span>REMOTE_SIM_V2.1</span><span onClick={() => setActiveId(null)} style={{ cursor: "pointer" }}>CLOSE (✕)</span>
              </div>

              {activeId === "S" && <BridgeTask onComplete={() => complete("S")} />}
              {activeId === "F" && <FilterTask onComplete={() => complete("F")} />}
              {activeId === "E" && <FeatureTask onComplete={() => complete("E")} />}
              {activeId === "M" && <NCPTask onComplete={() => complete("M")} />}
              {activeId === "D" && <PowerTask onComplete={() => complete("D")} />}
              {activeId === "C" && <CloudTask onComplete={() => complete("C")} />}
              {activeId === "A" && <ActTask onComplete={() => complete("A")} />}
              {activeId === "P" && <PiSimulator onComplete={() => complete("P")} />}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
