import { useState, useEffect, useRef, useCallback } from "react";

const MISSIONS = [
  {
    id: 1, title: "AI Foundations", icon: "🧠", color: "#00f5d4",
    description: "Boot up the AI core — classify the intelligence.",
    questions: [
      { type:"mcq", multi:true, xp:30, q:"Which THREE branches make up the AI tree in this module?", opts:["Machine Learning","Blockchain","Deep Learning","Edge AI","Quantum AI"], correct:[0,2,3], explanation:"ML (learns from data), Deep Learning (neural networks), and Edge AI (on-device inference) are the three core branches." },
      { type:"mcq", multi:false, xp:20, q:"In ECE terms, Machine Learning is best analogous to…", opts:["Amplifier gain tuning","Signal processing evolving into pattern learning","Voltage divider circuits","PCB trace routing"], correct:[1], explanation:"ML is like signal processing that learns — it extracts patterns from raw signals just as DSP extracts features." },
      { type:"mcq", multi:false, xp:20, q:"What fundamentally distinguishes Edge AI from cloud-based AI?", opts:["Runs only on supercomputers","Requires internet at all times","Performs inference directly on the local device","Uses more power than server AI"], correct:[2], explanation:"Edge AI runs inference on-device (e.g., STM32, ESP32) — no cloud round-trip, enabling ultra-low latency." },
    ],
  },
  {
    id: 2, title: "Sensor Intelligence", icon: "📡", color: "#f7b731",
    description: "Map the sensor network — identify the data sources.",
    questions: [
      { type:"match", xp:40, q:"Match each sensor to its application:", pairs:[{left:"Vibration Sensor",right:"Bearing fault detection"},{left:"Temp Sensor (PT100)",right:"Motor thermal monitoring"},{left:"Current Sensor (ACS712)",right:"Power draw analysis"},{left:"ADXL355",right:"3-axis 10 kHz accelerometer"}], explanation:"Each sensor feeds a specific IoT analytics layer — vibration for mechanical health, temperature for thermal, current for electrical load." },
      { type:"mcq", multi:false, xp:15, q:"How many major sensor categories are used in IoT systems in this module?", opts:["3","4","6","8"], correct:[2], explanation:"The module identifies 6 major sensor categories relevant to IoT systems." },
      { type:"mcq", multi:false, xp:20, q:"The ADXL355 in the case study samples at what rate?", opts:["100 Hz","1 kHz","10 kHz","100 kHz"], correct:[2], explanation:"The ADXL355 samples at 10 kHz — fast enough to detect high-frequency bearing anomalies." },
    ],
  },
  {
    id: 3, title: "Cloud & Pipelines", icon: "☁️", color: "#a55eea",
    description: "Route the data — build the cloud pipeline.",
    questions: [
      { type:"order", xp:40, q:"Tap steps in the correct IoT pipeline order (tap first step first):", steps:["Feature Extraction","Sense (raw data)","Model Inference","Filter & Clean","Act (alert/control)"], correct:[1,3,0,2,4], explanation:"Sense → Filter → Feature → Model → Act. This is the core sensor analytics loop." },
      { type:"mcq", multi:false, xp:20, q:"Which cloud IoT service is used in the case study?", opts:["Google Cloud IoT Core","AWS IoT Core","Azure IoT Hub","IBM Watson IoT"], correct:[1], explanation:"The case study uses AWS IoT Core + S3 for cloud ingestion and storage." },
      { type:"mcq", multi:false, xp:25, q:"Lambda Architecture differs from Kappa because Lambda has…", opts:["Only a stream layer","Both a batch layer AND a speed layer","Only edge processing","A serverless function framework"], correct:[1], explanation:"Lambda = batch + speed layers. Kappa = stream-only. Lambda handles historical reprocessing; Kappa is simpler." },
    ],
  },
  {
    id: 4, title: "NCP & Edge AI", icon: "⚡", color: "#fd9644",
    description: "Deploy the neural circuit — power the edge node.",
    questions: [
      { type:"mcq", multi:false, xp:25, q:"What biological system inspires the Neural Circuit Processor (NCP)?", opts:["Human visual cortex","C. elegans worm nervous system","Dolphin echolocation","Beehive swarm intelligence"], correct:[1], explanation:"NCP is inspired by C. elegans — its ~302 neurons solve complex navigation with sparse, efficient wiring." },
      { type:"mcq", multi:false, xp:25, q:"How does NCP parameter count compare to an LSTM?", opts:["10× more (20K–200K)","Same size","5–10× fewer (~2K–20K)","100× fewer (<500)"], correct:[2], explanation:"NCP uses only ~2K–20K parameters — 5–10× lighter than LSTM — deployable on microcontrollers." },
      { type:"mcq", multi:false, xp:20, q:"What is the NCP edge inference latency on the STM32H7?", opts:["50 ms","10 ms","5 ms","2.2 ms"], correct:[3], explanation:"2.2 ms edge inference — critical for real-time fault detection without cloud round-trips." },
      { type:"mcq", multi:false, xp:20, q:"What is the NCP node power consumption?", opts:["500 mW","50 mW","< 5 mW","1 W"], correct:[2], explanation:"<5 mW makes NCP viable for battery-powered and energy-harvesting IoT deployments." },
    ],
  },
  {
    id: 5, title: "Factory Boss", icon: "🏭", color: "#fc5c65",
    description: "Final test — run the smart factory. Prove your mastery.",
    questions: [
      { type:"mcq", multi:false, xp:20, q:"The 120 CNC machines lost how much per year to unplanned downtime?", opts:["$500K","$1.2M","$2.3M","$5.8M"], correct:[2], explanation:"$2.3M/year in downtime — the key business case driving the AIoT deployment." },
      { type:"mcq", multi:false, xp:20, q:"What fault detection accuracy did the NCP system achieve?", opts:["82.1%","90.5%","96.8%","99.9%"], correct:[2], explanation:"96.8% accuracy detecting bearing wear, imbalance, and misalignment faults." },
      { type:"mcq", multi:false, xp:25, q:"Average early warning lead time before failure?", opts:["12 hours","24 hours","48 hours","68 hours"], correct:[3], explanation:"68-hour lead time — enough to schedule maintenance without production disruption." },
      { type:"mcq", multi:true, xp:30, q:"Select ALL THREE core AI/ML use-cases in this module:", opts:["Pattern Recognition","Autonomous Driving","Predictive Maintenance","Anomaly Detection","Language Translation"], correct:[0,2,3], explanation:"The three core use-cases: Pattern Recognition, Predictive Maintenance, and Anomaly Detection." },
    ],
  },
];

const ACHIEVEMENTS = [
  { id:"first_blood",   icon:"⚔️",  label:"First Blood",     desc:"Answer your first question correctly",    check:(s)=>s.correctCount>=1 },
  { id:"hot_streak",    icon:"🔥",  label:"Hot Streak",      desc:"Get 3 correct in a row",                  check:(s)=>s.maxStreak>=3 },
  { id:"flawless",      icon:"💎",  label:"Flawless",        desc:"Complete a mission with no wrong answers",check:(s)=>s.flawlessMission },
  { id:"speed_demon",   icon:"⚡",  label:"Speed Demon",     desc:"Answer correctly in under 5 seconds",     check:(s)=>s.speedBonus },
  { id:"halfway",       icon:"🎯",  label:"Halfway There",   desc:"Complete 3 missions",                     check:(s)=>s.completedCount>=3 },
  { id:"ai_master",     icon:"🏆",  label:"AI Master",       desc:"Complete all 5 missions",                 check:(s)=>s.completedCount>=5 },
  { id:"combo_king",    icon:"👑",  label:"Combo King",      desc:"Reach a 5-streak multiplier",             check:(s)=>s.maxStreak>=5 },
  { id:"perfect_score", icon:"🌟",  label:"Perfect Score",   desc:"Finish with 90%+ accuracy",               check:(s)=>s.accuracy>=90 },
];

const MAX_LIVES = 3;
const TIMER_SEC = 25;
const TOTAL_MAX_XP = MISSIONS.reduce((a,m)=>a+m.questions.reduce((b,q)=>b+q.xp,0),0);

function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

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
`;

// ── SMALL UI ATOMS ──────────────────────────────────────────────────────────

function XPBar({current,max,color}){
  const pct = Math.min(100,(current/max)*100);
  return (
    <div style={{background:"#111",borderRadius:8,height:10,overflow:"hidden",border:"1px solid #1e1e1e"}}>
      <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${color},${color}88)`,transition:"width 0.7s cubic-bezier(.4,0,.2,1)",borderRadius:8,boxShadow:`0 0 10px ${color}66`}}/>
    </div>
  );
}

function Heart({filled}){
  return <span style={{fontSize:20,filter:filled?"drop-shadow(0 0 5px #fc5c65)":"grayscale(1) opacity(0.2)",transition:"all 0.4s"}}>{filled?"❤️":"🖤"}</span>;
}

function StreakBadge({streak}){
  if(streak<2) return null;
  const mult = streak>=5?3:streak>=3?2:1;
  const col  = streak>=5?"#fc5c65":streak>=3?"#f7b731":"#00f5d4";
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,background:`${col}22`,border:`1px solid ${col}77`,borderRadius:20,padding:"4px 10px",animation:"pulse 1.2s infinite"}}>
      <span style={{fontSize:14}}>🔥</span>
      <span style={{color:col,fontWeight:900,fontSize:12,fontFamily:"Orbitron,monospace"}}>{streak}×</span>
      {mult>1&&<span style={{background:col,color:"#000",borderRadius:8,padding:"1px 7px",fontSize:10,fontWeight:900}}>{mult}× XP</span>}
    </div>
  );
}

function FloatingXP({items}){
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999}}>
      {items.map(it=>(
        <div key={it.id} style={{position:"absolute",top:it.y,left:it.x,fontSize:20,fontWeight:900,fontFamily:"Orbitron,monospace",color:it.correct?"#2ecc71":"#e74c3c",animation:"floatUp 1.1s ease-out forwards",whiteSpace:"nowrap",textShadow:`0 0 10px ${it.correct?"#2ecc71":"#e74c3c"}`}}>
          {it.correct?`+${it.xp} XP`:"-1 ❤️"}
        </div>
      ))}
    </div>
  );
}

function AchievementToast({ach,onDone}){
  useEffect(()=>{ const t=setTimeout(onDone,3200); return()=>clearTimeout(t); },[onDone]);
  return (
    <div style={{position:"fixed",top:16,right:16,zIndex:10000,background:"#12121f",border:"1.5px solid #f7b731",borderRadius:16,padding:"14px 18px",display:"flex",gap:12,alignItems:"center",animation:"badgePop 0.5s ease-out",boxShadow:"0 8px 32px #f7b73155",minWidth:260,maxWidth:320}}>
      <span style={{fontSize:30}}>{ach.icon}</span>
      <div>
        <div style={{fontSize:9,color:"#f7b731",letterSpacing:2,fontFamily:"Orbitron,monospace"}}>ACHIEVEMENT UNLOCKED</div>
        <div style={{color:"#fff",fontWeight:700,fontSize:14,marginTop:2}}>{ach.label}</div>
        <div style={{color:"#777",fontSize:11,marginTop:2}}>{ach.desc}</div>
      </div>
    </div>
  );
}

function TimerRing({secs,total,color}){
  const pct=secs/total;
  const r=20, circ=2*Math.PI*r;
  const urg=secs<=7;
  return (
    <div style={{position:"relative",width:54,height:54,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <svg width="54" height="54" style={{position:"absolute",transform:"rotate(-90deg)"}}>
        <circle cx="27" cy="27" r={r} fill="none" stroke="#1e1e1e" strokeWidth="4"/>
        <circle cx="27" cy="27" r={r} fill="none" stroke={urg?"#fc5c65":color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}
          style={{transition:"stroke-dashoffset 0.85s linear",filter:`drop-shadow(0 0 4px ${urg?"#fc5c65":color})`}}/>
      </svg>
      <span style={{fontFamily:"Orbitron,monospace",fontWeight:900,fontSize:13,color:urg?"#fc5c65":color,animation:urg?"urgBlink 0.55s infinite":""}}>{secs}</span>
    </div>
  );
}

function CircuitBg(){
  return (
    <svg style={{position:"fixed",inset:0,width:"100%",height:"100%",opacity:0.055,pointerEvents:"none",zIndex:0}} viewBox="0 0 900 700" preserveAspectRatio="xMidYMid slice">
      {[...Array(14)].map((_,i)=><line key={i} x1={i*70} y1={0} x2={i*70+80} y2={700} stroke="#00f5d4" strokeWidth="1"/>)}
      {[...Array(12)].map((_,i)=><line key={i} x1={0} y1={i*65} x2={900} y2={i*65+40} stroke="#00f5d4" strokeWidth="1"/>)}
      {[...Array(24)].map((_,i)=><circle key={i} cx={Math.sin(i*1.7)*420+450} cy={Math.cos(i*1.3)*300+350} r="3" fill="#00f5d4"/>)}
    </svg>
  );
}

// ── MCQ ────────────────────────────────────────────────────────────────────

function MCQQuestion({q,onAnswer,color}){
  const [sel,setSel]=useState([]);
  const [done,setDone]=useState(false);

  const toggle=(i)=>{
    if(done) return;
    setSel(s=> q.multi ? (s.includes(i)?s.filter(x=>x!==i):[...s,i]) : [i]);
  };
  const submit=()=>{
    if(!sel.length||done) return;
    setDone(true);
    const ok = q.multi
      ? sel.length===q.correct.length && q.correct.every(c=>sel.includes(c))
      : sel[0]===q.correct[0];
    setTimeout(()=>onAnswer(ok),1100);
  };

  const bg  = (i)=>{ if(!done) return sel.includes(i)?`${color}1e`:"rgba(255,255,255,0.03)"; if(q.correct.includes(i)) return "rgba(46,204,113,0.18)"; if(sel.includes(i)) return "rgba(231,76,60,0.18)"; return "rgba(255,255,255,0.015)"; };
  const bd  = (i)=>{ if(!done) return sel.includes(i)?color:"#232323"; if(q.correct.includes(i)) return "#2ecc71"; if(sel.includes(i)) return "#e74c3c"; return "#181818"; };
  const fc  = (i)=>{ if(!done) return sel.includes(i)?color:"#aaa"; if(q.correct.includes(i)) return "#2ecc71"; if(sel.includes(i)) return "#e74c3c"; return "#444"; };
  const icon= (i)=>{ if(done&&q.correct.includes(i)) return "✓"; if(done&&sel.includes(i)) return "✗"; return q.multi?(sel.includes(i)?"☑":"☐"):(sel.includes(i)?"◉":"○"); };

  return (
    <div>
      {q.multi&&<div style={{fontSize:11,color:"#666",marginBottom:10,letterSpacing:1}}>SELECT ALL THAT APPLY</div>}
      {q.opts.map((opt,i)=>(
        <div key={i} onClick={()=>toggle(i)} style={{padding:"11px 16px",borderRadius:10,border:`1.5px solid ${bd(i)}`,background:bg(i),color:fc(i),cursor:done?"default":"pointer",marginBottom:8,fontSize:14,display:"flex",alignItems:"center",gap:10,transition:"all 0.16s",userSelect:"none"}}>
          <span style={{fontSize:15,flexShrink:0,fontFamily:"monospace"}}>{icon(i)}</span>
          {opt}
        </div>
      ))}
      {!done&&(
        <button onClick={submit} disabled={!sel.length} style={{marginTop:6,padding:"10px 30px",background:sel.length?`linear-gradient(135deg,${color},#0090ff)`:"#1e1e1e",border:"none",borderRadius:10,color:sel.length?"#000":"#444",fontWeight:900,cursor:sel.length?"pointer":"not-allowed",fontSize:13,fontFamily:"Orbitron,monospace",letterSpacing:2}}>
          CONFIRM
        </button>
      )}
    </div>
  );
}

// ── MATCH ──────────────────────────────────────────────────────────────────

function MatchQuestion({q,onAnswer,color}){
  const [shuffled]=useState(()=>shuffle(q.pairs.map((_,i)=>i)));
  const [active,setActive]=useState(null); // left index selected
  const [matches,setMatches]=useState({});  // leftIdx → pairIdx
  const [done,setDone]=useState(false);
  const used=Object.values(matches);

  const pickLeft =(i)=>{ if(done) return; setActive(i); };
  const pickRight=(origIdx)=>{
    if(done||active===null) return;
    setMatches(m=>({...m,[active]:origIdx}));
    setActive(null);
  };

  const submit=()=>{
    if(Object.keys(matches).length<q.pairs.length) return;
    setDone(true);
    const ok=q.pairs.every((_,i)=>matches[i]===i);
    setTimeout(()=>onAnswer(ok),1400);
  };

  const lBorder=(i)=>{ if(!done) return active===i?color:matches[i]!==undefined?"#a55eea":"#232323"; return matches[i]===i?"#2ecc71":"#e74c3c"; };
  const rBorder=(origIdx)=>{ const li=Object.entries(matches).find(([,v])=>v===origIdx)?.[0]; if(!done) return active!==null&&!used.includes(origIdx)?`${color}77`:used.includes(origIdx)?"#a55eea":"#232323"; if(li===undefined) return "#232323"; return Number(li)===origIdx?"#2ecc71":"#e74c3c"; };

  return (
    <div>
      <div style={{fontSize:11,color:"#888",marginBottom:12,letterSpacing:1}}>
        {active!==null ? <span style={{color}}><b>Tap the match for:</b> {q.pairs[active].left}</span> : "Tap a LEFT item, then tap its RIGHT match"}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
        <div>
          {q.pairs.map((_,i)=>(
            <div key={i} onClick={()=>pickLeft(i)} style={{padding:"10px 12px",borderRadius:10,border:`1.5px solid ${lBorder(i)}`,background:active===i?`${color}1e`:"rgba(255,255,255,0.03)",color:"#ddd",cursor:done?"default":"pointer",marginBottom:8,fontSize:13,transition:"all 0.15s",userSelect:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{color:active===i?color:"#444",fontSize:12}}>{active===i?"▶":"○"}</span>
                {q.pairs[i].left}
              </div>
              {matches[i]!==undefined&&<div style={{fontSize:11,color:"#666",marginTop:3,paddingLeft:18}}>→ {q.pairs[matches[i]].right}</div>}
            </div>
          ))}
        </div>
        <div>
          {shuffled.map(origIdx=>(
            <div key={origIdx} onClick={()=>pickRight(origIdx)} style={{padding:"10px 12px",borderRadius:10,border:`1.5px solid ${rBorder(origIdx)}`,background:used.includes(origIdx)?"rgba(165,94,234,0.12)":"rgba(255,255,255,0.03)",color:used.includes(origIdx)?"#c9a0ff":"#ddd",cursor:(done||used.includes(origIdx))?"default":"pointer",marginBottom:8,fontSize:13,transition:"all 0.15s",userSelect:"none",opacity:used.includes(origIdx)&&active!==null?0.45:1}}>
              {q.pairs[origIdx].right}
            </div>
          ))}
        </div>
      </div>
      {!done&&(
        <button onClick={submit} disabled={Object.keys(matches).length<q.pairs.length} style={{marginTop:10,padding:"10px 30px",background:Object.keys(matches).length>=q.pairs.length?"linear-gradient(135deg,#f7b731,#fd9644)":"#1e1e1e",border:"none",borderRadius:10,color:Object.keys(matches).length>=q.pairs.length?"#000":"#444",fontWeight:900,cursor:Object.keys(matches).length>=q.pairs.length?"pointer":"not-allowed",fontSize:13,fontFamily:"Orbitron,monospace",letterSpacing:2}}>
          CONFIRM
        </button>
      )}
    </div>
  );
}

// ── ORDER ──────────────────────────────────────────────────────────────────

function OrderQuestion({q,onAnswer,color}){
  const [pool]=useState(()=>shuffle([...Array(q.steps.length).keys()]));
  const [seq,setSeq]=useState([]);
  const [done,setDone]=useState(false);

  const add=(idx)=>{ if(done||seq.includes(idx)) return; setSeq(s=>[...s,idx]); };
  const remove=(pos)=>{ if(done) return; setSeq(s=>s.filter((_,i)=>i!==pos)); };

  const submit=()=>{
    if(seq.length<q.steps.length) return;
    setDone(true);
    const ok=seq.every((v,i)=>v===q.correct[i]);
    setTimeout(()=>onAnswer(ok),1400);
  };

  return (
    <div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:8}}>YOUR SEQUENCE:</div>
        <div style={{minHeight:46,background:"rgba(255,255,255,0.02)",borderRadius:12,border:`1.5px dashed ${color}44`,padding:8,display:"flex",flexWrap:"wrap",gap:7,alignItems:"center"}}>
          {seq.length===0&&<span style={{color:"#333",fontSize:13}}>Tap steps below to build the pipeline…</span>}
          {seq.map((si,pos)=>{
            const ok=done&&si===q.correct[pos];
            const bad=done&&si!==q.correct[pos];
            return (
              <div key={pos} onClick={()=>remove(pos)} style={{padding:"5px 11px",borderRadius:8,border:`1.5px solid ${ok?"#2ecc71":bad?"#e74c3c":color}`,background:ok?"rgba(46,204,113,0.15)":bad?"rgba(231,76,60,0.12)":`${color}18`,color:ok?"#2ecc71":bad?"#e74c3c":color,fontSize:12,fontWeight:700,cursor:done?"default":"pointer",display:"flex",alignItems:"center",gap:5,userSelect:"none"}}>
                <span style={{opacity:0.5,fontSize:10}}>{pos+1}.</span>{q.steps[si]}{!done&&<span style={{opacity:0.35,fontSize:9}}>✕</span>}{ok&&"✓"}{bad&&"✗"}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:8}}>AVAILABLE STEPS:</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
        {pool.map(idx=>{
          const used=seq.includes(idx);
          return (
            <div key={idx} onClick={()=>add(idx)} style={{padding:"7px 13px",borderRadius:9,border:`1.5px solid ${used?"#1a1a1a":"#2e2e2e"}`,background:used?"rgba(255,255,255,0.01)":"rgba(255,255,255,0.05)",color:used?"#2a2a2a":"#ccc",cursor:used?"default":"pointer",fontSize:13,transition:"all 0.15s",userSelect:"none",opacity:used?0.35:1,textDecoration:used?"line-through":"none"}}>
              {q.steps[idx]}
            </div>
          );
        })}
      </div>
      {!done&&(
        <div style={{display:"flex",gap:10}}>
          <button onClick={submit} disabled={seq.length<q.steps.length} style={{padding:"10px 30px",background:seq.length>=q.steps.length?`linear-gradient(135deg,#a55eea,#0090ff)`:"#1e1e1e",border:"none",borderRadius:10,color:seq.length>=q.steps.length?"#fff":"#444",fontWeight:900,cursor:seq.length>=q.steps.length?"pointer":"not-allowed",fontSize:13,fontFamily:"Orbitron,monospace",letterSpacing:2}}>
            CONFIRM
          </button>
          <button onClick={()=>setSeq([])} style={{padding:"10px 14px",background:"transparent",border:"1px solid #2a2a2a",borderRadius:10,color:"#555",cursor:"pointer",fontSize:12}}>
            RESET
          </button>
        </div>
      )}
    </div>
  );
}

// ── SCREENS ────────────────────────────────────────────────────────────────

function HomeScreen({onStart}){
  return (
    <div style={{textAlign:"center",padding:"44px 20px 60px",position:"relative",zIndex:1,animation:"slideIn 0.5s ease-out"}}>
      <div style={{fontSize:70,marginBottom:12,filter:"drop-shadow(0 0 24px #00f5d4)"}}>🤖</div>
      <h1 style={{fontFamily:"Orbitron,monospace",fontSize:"clamp(22px,5vw,40px)",fontWeight:900,letterSpacing:4,color:"#00f5d4",textShadow:"0 0 40px #00f5d4",margin:"0 0 6px"}}>
        AI SENSOR QUEST
      </h1>
      <p style={{color:"#555",fontSize:11,letterSpacing:3,marginBottom:4}}>BMS COLLEGE OF ENGINEERING — ECE MODULE</p>
      <p style={{color:"#3a3a3a",fontSize:11,marginBottom:36}}>Introduction to AI &amp; Sensor Data Analytics</p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,maxWidth:640,margin:"0 auto 36px"}}>
        {MISSIONS.map((m,i)=>(
          <div key={m.id} style={{padding:"14px 6px",borderRadius:12,border:`1.5px solid ${m.color}2a`,background:`${m.color}0a`,color:m.color,animation:`slideIn ${0.2+i*0.08}s ease-out`}}>
            <div style={{fontSize:24}}>{m.icon}</div>
            <div style={{fontSize:9,fontFamily:"Orbitron,monospace",marginTop:4,opacity:0.8}}>M{m.id}</div>
            <div style={{fontSize:10,color:"#888",marginTop:2,lineHeight:1.3}}>{m.title}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",justifyContent:"center",gap:28,marginBottom:36}}>
        {[["5","Missions"],["19","Questions"],[`${TOTAL_MAX_XP}`,"Max XP"],["3","Lives"],["8","Achievements"]].map(([v,l])=>(
          <div key={l} style={{textAlign:"center"}}>
            <div style={{fontFamily:"Orbitron,monospace",fontSize:20,fontWeight:900,color:"#00f5d4"}}>{v}</div>
            <div style={{fontSize:10,color:"#444",letterSpacing:1,marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>

      <button onClick={onStart}
        style={{padding:"15px 52px",background:"linear-gradient(135deg,#00f5d4,#0090ff)",border:"none",borderRadius:50,color:"#000",fontSize:15,fontWeight:900,letterSpacing:3,cursor:"pointer",boxShadow:"0 0 32px #00f5d466",fontFamily:"Orbitron,monospace"}}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
        BOOT SYSTEM
      </button>
    </div>
  );
}

function MissionSelect({completedMissions,missionStars,score,lives,streak,onSelect}){
  return (
    <div style={{padding:"18px 16px",position:"relative",zIndex:1,animation:"slideIn 0.4s ease-out"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div>
          <h2 style={{fontFamily:"Orbitron,monospace",color:"#00f5d4",margin:"0 0 8px",fontSize:16,letterSpacing:2}}>MISSION SELECT</h2>
          <div style={{display:"flex",gap:5}}>{[...Array(MAX_LIVES)].map((_,i)=><Heart key={i} filled={i<lives}/>)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:"#f7b731",fontSize:22,fontWeight:900,fontFamily:"Orbitron,monospace"}}>{score}</div>
          <div style={{color:"#444",fontSize:10,letterSpacing:1}}>XP EARNED</div>
          <div style={{marginTop:6}}><StreakBadge streak={streak}/></div>
        </div>
      </div>
      <XPBar current={score} max={TOTAL_MAX_XP} color="#f7b731"/>
      <div style={{fontSize:10,color:"#444",textAlign:"right",marginTop:4,letterSpacing:1}}>{score} / {TOTAL_MAX_XP} XP</div>

      <div style={{marginTop:16,display:"grid",gap:10}}>
        {MISSIONS.map((m,idx)=>{
          const done=completedMissions.includes(m.id);
          const locked=idx>0&&!completedMissions.includes(MISSIONS[idx-1].id);
          const stars=missionStars[m.id]||0;
          return (
            <div key={m.id} onClick={()=>!locked&&onSelect(m)}
              style={{padding:"15px 16px",borderRadius:13,border:`1.5px solid ${done?m.color:locked?"#161616":`${m.color}44`}`,background:done?`${m.color}10`:locked?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.025)",cursor:locked?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:14,transition:"all 0.18s",opacity:locked?0.3:1,animation:`slideIn ${0.1+idx*0.07}s ease-out`}}
              onMouseEnter={e=>{ if(!locked) e.currentTarget.style.background=done?`${m.color}1e`:`${m.color}0e`; }}
              onMouseLeave={e=>{ e.currentTarget.style.background=done?`${m.color}10`:locked?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.025)"; }}>
              <span style={{fontSize:26}}>{locked?"🔒":m.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:9,color:m.color,letterSpacing:2,fontFamily:"Orbitron,monospace"}}>MISSION {m.id}</div>
                <div style={{color:"#e0e0e0",fontSize:14,fontWeight:700,marginTop:2}}>{m.title}</div>
                <div style={{color:"#555",fontSize:11,marginTop:1}}>{m.description}</div>
              </div>
              <div style={{textAlign:"right",minWidth:64}}>
                {done ? (
                  <div style={{fontSize:18,letterSpacing:1}}>{[...Array(3)].map((_,i)=><span key={i} style={{opacity:i<stars?1:0.2}}>⭐</span>)}</div>
                ) : (
                  <>
                    <div style={{color:m.color,fontSize:13,fontWeight:700,fontFamily:"Orbitron,monospace"}}>{m.questions.reduce((a,q)=>a+q.xp,0)}</div>
                    <div style={{color:"#444",fontSize:10}}>XP · {m.questions.length}Qs</div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuestionScreen({mission,questionIdx,lives,streak,score,onAnswer,onBack}){
  const q=mission.questions[questionIdx];
  const [timeLeft,setTimeLeft]=useState(TIMER_SEC);
  const [ticking,setTicking]=useState(true);
  const [feedback,setFeedback]=useState(null);
  const timerRef=useRef(null);

  useEffect(()=>{
    setTimeLeft(TIMER_SEC); setTicking(true); setFeedback(null);
  },[questionIdx]);

  useEffect(()=>{
    if(!ticking) return;
    if(timeLeft<=0){ setTicking(false); handleResult(false,0,true); return; }
    timerRef.current=setInterval(()=>setTimeLeft(t=>t-1),1000);
    return()=>clearInterval(timerRef.current);
  },[timeLeft,ticking]);

  const handleResult=useCallback((correct,baseXp,timeout=false)=>{
    setTicking(false); clearInterval(timerRef.current);
    const mult=streak>=5?3:streak>=3?2:1;
    const spd=(!timeout&&correct&&timeLeft>=20)?10:(!timeout&&correct&&timeLeft>=14)?5:0;
    const finalXp=correct?Math.round(baseXp*mult)+spd:0;
    setFeedback({correct,finalXp,spd,mult,timeout});
    setTimeout(()=>{ setFeedback(null); onAnswer(correct,finalXp,timeLeft,spd); },2500);
  },[streak,timeLeft,onAnswer]);

  return (
    <div style={{padding:"15px",position:"relative",zIndex:1,animation:"slideIn 0.3s ease-out"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <button onClick={onBack} style={{background:"none",border:"1px solid #222",borderRadius:8,color:"#555",padding:"5px 9px",cursor:"pointer",fontSize:10,fontFamily:"Orbitron,monospace",flexShrink:0}}>← EXIT</button>
        <div style={{flex:1}}>
          <div style={{fontSize:9,color:mission.color,letterSpacing:2,fontFamily:"Orbitron,monospace",marginBottom:5}}>
            {mission.icon} {mission.title.toUpperCase()} · Q{questionIdx+1}/{mission.questions.length}
          </div>
          <div style={{display:"flex",gap:4}}>
            {mission.questions.map((_,i)=>(
              <div key={i} style={{height:4,flex:1,borderRadius:4,background:i<questionIdx?mission.color:i===questionIdx?`${mission.color}66`:"#1a1a1a",transition:"background 0.4s"}}/>
            ))}
          </div>
        </div>
        <TimerRing secs={timeLeft} total={TIMER_SEC} color={mission.color}/>
      </div>

      {/* Lives + streak + score */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{display:"flex",gap:4}}>{[...Array(MAX_LIVES)].map((_,i)=><Heart key={i} filled={i<lives}/>)}</div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <StreakBadge streak={streak}/>
          <span style={{color:"#f7b731",fontFamily:"Orbitron,monospace",fontSize:13,fontWeight:900}}>{score} XP</span>
        </div>
      </div>

      {/* Card */}
      <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${mission.color}2e`,borderRadius:16,padding:"18px",marginBottom:14,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,width:"3px",height:"100%",background:mission.color}}/>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
          <span style={{fontSize:10,color:"#555",letterSpacing:1}}>{q.type==="mcq"?"MULTIPLE CHOICE":q.type==="match"?"MATCHING":"ORDERING"}</span>
          <span style={{fontSize:11,color:mission.color,fontFamily:"Orbitron,monospace",fontWeight:900}}>
            +{q.xp} XP{streak>=3?" ×"+(streak>=5?3:2):""}
          </span>
        </div>
        <p style={{color:"#f0f0f0",fontSize:15,lineHeight:1.65,margin:"0 0 16px",fontWeight:600}}>{q.q}</p>
        {q.type==="mcq"&&<MCQQuestion key={questionIdx} q={q} onAnswer={ok=>handleResult(ok,q.xp)} color={mission.color}/>}
        {q.type==="match"&&<MatchQuestion key={questionIdx} q={q} onAnswer={ok=>handleResult(ok,q.xp)} color={mission.color}/>}
        {q.type==="order"&&<OrderQuestion key={questionIdx} q={q} onAnswer={ok=>handleResult(ok,q.xp)} color={mission.color}/>}
      </div>

      {/* Feedback overlay */}
      {feedback&&(
        <div style={{position:"fixed",inset:0,background:"rgba(5,5,12,0.92)",zIndex:9000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,animation:"slideIn 0.2s"}}>
          <div style={{fontSize:64,marginBottom:10,animation:"pulse 0.4s"}}>{feedback.timeout?"⏰":feedback.correct?"✅":"❌"}</div>
          <div style={{fontFamily:"Orbitron,monospace",fontSize:"clamp(16px,4vw,26px)",fontWeight:900,color:feedback.correct?"#2ecc71":"#e74c3c",marginBottom:6}}>
            {feedback.timeout?"TIME'S UP!":feedback.correct?`+${feedback.finalXp} XP EARNED!`:"INCORRECT"}
          </div>
          {feedback.correct&&feedback.mult>1&&<div style={{color:"#f7b731",fontSize:13,fontFamily:"Orbitron,monospace",marginBottom:4}}>{feedback.mult}× STREAK MULTIPLIER!</div>}
          {feedback.correct&&feedback.spd>0&&<div style={{color:"#00f5d4",fontSize:12,marginBottom:6}}>⚡ SPEED BONUS +{feedback.spd} XP</div>}
          <div style={{maxWidth:460,background:"rgba(255,255,255,0.04)",borderRadius:14,padding:"14px 20px",border:`1px solid ${feedback.correct?"#2ecc7122":"#e74c3c22"}`,color:"#bbb",fontSize:14,lineHeight:1.7,textAlign:"center",marginTop:8}}>
            <div style={{fontSize:9,color:"#555",letterSpacing:2,marginBottom:6}}>💡 EXPLANATION</div>
            {q.explanation}
          </div>
        </div>
      )}
    </div>
  );
}

function GameOverScreen({score,onRestart}){
  return (
    <div style={{textAlign:"center",padding:"60px 24px",position:"relative",zIndex:1,animation:"slideIn 0.5s"}}>
      <div style={{fontSize:80,animation:"shake 0.6s ease-out"}}>💔</div>
      <h2 style={{fontFamily:"Orbitron,monospace",color:"#e74c3c",fontSize:28,letterSpacing:3,margin:"14px 0 8px",textShadow:"0 0 20px #e74c3c"}}>SYSTEM FAILURE</h2>
      <p style={{color:"#666",marginBottom:28}}>All lives depleted. The factory went offline.</p>
      <div style={{display:"inline-block",background:"rgba(231,76,60,0.08)",border:"1px solid #e74c3c33",borderRadius:14,padding:"18px 40px",marginBottom:28}}>
        <div style={{color:"#f7b731",fontSize:34,fontWeight:900,fontFamily:"Orbitron,monospace"}}>{score}</div>
        <div style={{color:"#555",fontSize:11,letterSpacing:1}}>XP BEFORE FAILURE</div>
      </div>
      <br/>
      <button onClick={onRestart} style={{padding:"13px 44px",background:"linear-gradient(135deg,#e74c3c,#c0392b)",border:"none",borderRadius:50,color:"#fff",fontSize:14,fontWeight:900,cursor:"pointer",letterSpacing:3,fontFamily:"Orbitron,monospace"}}>
        REBOOT
      </button>
    </div>
  );
}

function FinalScreen({score,missionStars,unlockedAchievements,onRestart}){
  const pct=Math.round((score/TOTAL_MAX_XP)*100);
  const grade=pct>=90?{label:"AI MASTER",icon:"🏆",color:"#f7b731"}:pct>=70?{label:"SENIOR ENGINEER",icon:"🥇",color:"#00f5d4"}:pct>=50?{label:"JUNIOR ANALYST",icon:"🎓",color:"#a55eea"}:{label:"TRAINEE",icon:"📚",color:"#fc5c65"};
  const totalStars=Object.values(missionStars).reduce((a,b)=>a+b,0);
  return (
    <div style={{padding:"28px 18px 60px",position:"relative",zIndex:1,animation:"slideIn 0.5s",maxWidth:600,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:70,filter:`drop-shadow(0 0 22px ${grade.color})`}}>{grade.icon}</div>
        <h2 style={{fontFamily:"Orbitron,monospace",color:grade.color,fontSize:"clamp(18px,5vw,30px)",margin:"10px 0 4px",textShadow:`0 0 22px ${grade.color}`,letterSpacing:3}}>{grade.label}</h2>
        <p style={{color:"#555",fontSize:12}}>All missions complete</p>
      </div>

      <div style={{background:"rgba(255,255,255,0.035)",border:`1.5px solid ${grade.color}33`,borderRadius:16,padding:"20px",marginBottom:16,textAlign:"center"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
          {[["XP EARNED",score],["ACCURACY",`${pct}%`],["STARS",`${totalStars}/15`]].map(([l,v])=>(
            <div key={l}>
              <div style={{fontFamily:"Orbitron,monospace",fontSize:24,fontWeight:900,color:grade.color}}>{v}</div>
              <div style={{color:"#444",fontSize:9,letterSpacing:2,marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
        <XPBar current={score} max={TOTAL_MAX_XP} color={grade.color}/>
      </div>

      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,color:"#444",letterSpacing:2,marginBottom:10}}>MISSION BREAKDOWN</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {MISSIONS.map(m=>(
            <div key={m.id} style={{padding:"11px 13px",borderRadius:12,background:"rgba(255,255,255,0.025)",border:`1px solid ${m.color}22`,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>{m.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:"#ccc",fontWeight:600}}>{m.title}</div>
                <div style={{fontSize:15,marginTop:3}}>{[...Array(3)].map((_,i)=><span key={i} style={{opacity:i<(missionStars[m.id]||0)?1:0.18}}>⭐</span>)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {unlockedAchievements.length>0&&(
        <div style={{marginBottom:22}}>
          <div style={{fontSize:10,color:"#444",letterSpacing:2,marginBottom:10}}>ACHIEVEMENTS</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {unlockedAchievements.map(a=>(
              <div key={a.id} style={{padding:"6px 12px",borderRadius:10,background:"rgba(247,183,49,0.08)",border:"1px solid #f7b73133",display:"flex",gap:7,alignItems:"center"}}>
                <span style={{fontSize:15}}>{a.icon}</span>
                <span style={{fontSize:12,color:"#f7b731",fontWeight:700}}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={onRestart} style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${grade.color},#0090ff)`,border:"none",borderRadius:13,color:"#000",fontSize:14,fontWeight:900,cursor:"pointer",letterSpacing:3,fontFamily:"Orbitron,monospace"}}>
        PLAY AGAIN
      </button>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────

export default function App(){
  const [screen,setScreen]=useState("home");
  const [activeMission,setActiveMission]=useState(null);
  const [qIdx,setQIdx]=useState(0);
  const [score,setScore]=useState(0);
  const [lives,setLives]=useState(MAX_LIVES);
  const [streak,setStreak]=useState(0);
  const [maxStreak,setMaxStreak]=useState(0);
  const [completed,setCompleted]=useState([]);
  const [stars,setStars]=useState({});
  const [mWrong,setMWrong]=useState(0);
  const [unlockedAch,setUnlockedAch]=useState([]);
  const [seenAch,setSeenAch]=useState([]);
  const [toasts,setToasts]=useState([]);
  const [floats,setFloats]=useState([]);
  const [correctCt,setCorrectCt]=useState(0);
  const [spdEver,setSpdEver]=useState(false);
  const [flawless,setFlawless]=useState(false);
  const fid=useRef(0);

  const spawnFloat=(correct,xp)=>{
    const id=fid.current++;
    setFloats(f=>[...f,{id,x:`${28+Math.random()*44}%`,y:`${25+Math.random()*22}%`,correct,xp}]);
    setTimeout(()=>setFloats(f=>f.filter(i=>i.id!==id)),1300);
  };

  const checkAch=(state)=>{
    const newOnes=ACHIEVEMENTS.filter(a=>!seenAch.includes(a.id)&&a.check(state));
    if(newOnes.length){
      setSeenAch(s=>[...s,...newOnes.map(a=>a.id)]);
      setUnlockedAch(u=>[...u,...newOnes]);
      setToasts(q=>[...q,...newOnes]);
    }
  };

  const handleAnswer=useCallback((correct,xp,timeLeft,spd)=>{
    const newScore=score+(correct?xp:0);
    const newStreak=correct?streak+1:0;
    const newMax=Math.max(maxStreak,newStreak);
    const newLives=correct?lives:lives-1;
    const newCt=correct?correctCt+1:correctCt;
    const newSpd=spdEver||(spd>0&&correct);
    const newMW=correct?mWrong:mWrong+1;

    setScore(newScore); setStreak(newStreak); setMaxStreak(newMax);
    setLives(newLives); setCorrectCt(newCt); setSpdEver(newSpd);
    spawnFloat(correct,xp);

    if(newLives<=0){ setScreen("gameover"); return; }

    const nextQ=qIdx+1;
    if(nextQ<activeMission.questions.length){
      setQIdx(nextQ); setMWrong(newMW);
    } else {
      const mStars=newMW===0?3:newMW===1?2:1;
      const newFlawless=flawless||newMW===0;
      const newCompleted=[...completed,activeMission.id];
      setStars(s=>({...s,[activeMission.id]:mStars}));
      setMWrong(0); setFlawless(newFlawless); setCompleted(newCompleted);
      checkAch({correctCount:newCt,maxStreak:newMax,flawlessMission:newFlawless,speedBonus:newSpd,completedCount:newCompleted.length,accuracy:Math.round((newScore/TOTAL_MAX_XP)*100)});
      if(newCompleted.length>=MISSIONS.length) setScreen("final");
      else setScreen("missions");
    }
  },[score,streak,maxStreak,lives,correctCt,spdEver,mWrong,qIdx,activeMission,completed,flawless,seenAch]);

  const startMission=(m)=>{ setActiveMission(m); setQIdx(0); setMWrong(0); setScreen("question"); };

  const restart=()=>{
    setScreen("home"); setScore(0); setLives(MAX_LIVES); setStreak(0); setMaxStreak(0);
    setCompleted([]); setStars({}); setMWrong(0); setUnlockedAch([]); setSeenAch([]);
    setToasts([]); setCorrectCt(0); setSpdEver(false); setFlawless(false);
  };

  return (
    <div style={{minHeight:"100vh",background:"#060610",color:"#e0e0e0",fontFamily:"Inter,system-ui,sans-serif",position:"relative",overflowX:"hidden"}}>
      <style dangerouslySetInnerHTML={{__html:CSS}}/>
      <CircuitBg/>
      <FloatingXP items={floats}/>
      {toasts[0]&&<AchievementToast ach={toasts[0]} onDone={()=>setToasts(q=>q.slice(1))}/>}
      <div style={{maxWidth:680,margin:"0 auto"}}>
        {screen==="home"    &&<HomeScreen onStart={()=>setScreen("missions")}/>}
        {screen==="missions"&&<MissionSelect completedMissions={completed} missionStars={stars} score={score} lives={lives} streak={streak} onSelect={startMission}/>}
        {screen==="question"&&activeMission&&<QuestionScreen mission={activeMission} questionIdx={qIdx} lives={lives} streak={streak} score={score} onAnswer={handleAnswer} onBack={()=>setScreen("missions")}/>}
        {screen==="gameover"&&<GameOverScreen score={score} onRestart={restart}/>}
        {screen==="final"   &&<FinalScreen score={score} missionStars={stars} unlockedAchievements={unlockedAch} onRestart={restart}/>}
      </div>
    </div>
  );
}
