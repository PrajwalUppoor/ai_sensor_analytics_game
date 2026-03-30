import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuizGame from "./QuizGame";
import VisualGame from "./VisualGame";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;600;700&display=swap');
@keyframes floatUp  { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-70px) scale(1.5)} }
@keyframes pulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
@keyframes shake    { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-7px)} 40%,80%{transform:translateX(7px)} }
@keyframes slideIn  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes badgePop { 0%{opacity:0;transform:scale(0.3) rotate(-12deg)} 70%{transform:scale(1.12) rotate(2deg)} 100%{opacity:1;transform:scale(1)} }
@keyframes urgBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
@keyframes glow     { 0%,100%{opacity:0.7} 50%{opacity:1} }
* { box-sizing:border-box; }
body { margin: 0; padding: 0; overflow: hidden; background: #060610; color: #e0e0e0; font-family: 'Inter', sans-serif; }
`;

function CircuitBg(){
  return (
    <svg style={{position:"fixed",inset:0,width:"100%",height:"100%",opacity:0.04,pointerEvents:"none",zIndex:0}} viewBox="0 0 900 700" preserveAspectRatio="xMidYMid slice">
      {[...Array(14)].map((_,i)=><line key={i} x1={i*70} y1={0} x2={i*70+80} y2={700} stroke="#00f5d4" strokeWidth="1"/>)}
      {[...Array(12)].map((_,i)=><line key={i} x1={0} y1={i*65} x2={900} y2={i*65+40} stroke="#00f5d4" strokeWidth="1"/>)}
      {[...Array(24)].map((_,i)=><circle key={i} cx={Math.sin(i*1.7)*420+450} cy={Math.cos(i*1.3)*300+350} r="3" fill="#00f5d4"/>)}
    </svg>
  );
}

export default function App() {
  const [mode, setMode] = useState("menu");
  const [totalScore, setTotalScore] = useState(() => {
    const saved = localStorage.getItem("ai_quest_score");
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem("ai_quest_score", totalScore);
  }, [totalScore]);

  const handleAchievement = (ach) => {
    console.log("Achievement Unlocked:", ach);
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <CircuitBg />

      <AnimatePresence mode="wait">
        {mode === "menu" && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ 
              maxWidth: "680px", margin: "0 auto", padding: "60px 20px", 
              textAlign: "center", position: "relative", zIndex: 1 
            }}
          >
            <div style={{ marginBottom: "10px" }}>
              <motion.span 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                style={{ fontSize: "80px", display: "inline-block" }}
              >
                📡
              </motion.span>
            </div>
            
            <h1 style={{ fontFamily: "Orbitron", fontSize: "clamp(26px, 6vw, 48px)", letterSpacing: "5px", color: "#00f5d4", textShadow: "0 0 30px #00f5d444", marginBottom: "5px" }}>
              AI ANALYTICS HUB
            </h1>
            <p style={{ color: "#555", fontSize: "11px", letterSpacing: "4px", marginBottom: "40px" }}>BMSCE ECE — SENSOR SYSTEMS INTERFACE</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
              {/* Quiz Mode */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode("quiz")}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1.5px solid #00f5d433",
                  borderRadius: "20px",
                  padding: "30px 15px",
                  cursor: "pointer",
                  transition: "border 0.3s"
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>🧠</div>
                <div style={{ fontFamily: "Orbitron", color: "#00f5d4", fontSize: "16px", marginBottom: "10px" }}>SENSOR QUEST</div>
                <p style={{ color: "#444", fontSize: "11px", lineHeight: "1.5" }}>5-Mission analytics course covering ML, Cloud & Edge AI.</p>
              </motion.div>

              {/* Visual Mode */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode("visual")}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1.5px solid #f7b73133",
                  borderRadius: "20px",
                  padding: "30px 15px",
                  cursor: "pointer"
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>⚡</div>
                <div style={{ fontFamily: "Orbitron", color: "#f7b731", fontSize: "16px", marginBottom: "10px" }}>SIGNAL MASTER</div>
                <p style={{ color: "#444", fontSize: "11px", lineHeight: "1.5" }}>Fast-action anomaly filtering. Sharpen your sensor reflex.</p>
              </motion.div>
            </div>

            <div style={{ 
              background: "rgba(0,0,0,0.3)", border: "1px solid #111", borderRadius: "100px", 
              padding: "15px 30px", display: "inline-flex", alignItems: "center", gap: "15px" 
            }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ color: "#555", fontSize: "10px", fontFamily: "Orbitron" }}>TOTAL CAREER XP</div>
                <div style={{ color: "#f7b731", fontSize: "20px", fontWeight: "900", fontFamily: "Orbitron" }}>{totalScore}</div>
              </div>
              <div style={{ height: "30px", width: "1px", background: "#222" }} />
              <div style={{ textAlign: "left" }}>
                <div style={{ color: "#555", fontSize: "10px", fontFamily: "Orbitron" }}>CURRENT RANK</div>
                <div style={{ color: "#00f5d4", fontSize: "13px", fontWeight: "900", fontFamily: "Orbitron" }}>
                  {totalScore > 5000 ? "AI ARCHITECT" : totalScore > 2000 ? "SENIOR ANALYST" : "TRAINEE"}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {mode === "quiz" && (
          <motion.div 
            key="quiz" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ maxWidth: "680px", margin: "0 auto" }}
          >
            <QuizGame score={totalScore} setScore={setTotalScore} onBackToMenu={() => setMode("menu")} onAchievement={handleAchievement} />
          </motion.div>
        )}

        {mode === "visual" && (
          <motion.div 
            key="visual" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            <VisualGame score={totalScore} setScore={setTotalScore} onBackToMenu={() => setMode("menu")} onAchievement={handleAchievement} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
