import { useState, useEffect } from "react";

const GOALS = [
  { value: "fat_loss", label: "ลดไขมัน",   sub: "Fat Loss", emoji: "🔥", deficit: 500,  proteinMult: 1.8 },
  { value: "recomp",   label: "รักษากล้าม", sub: "Recomp",   emoji: "⚖️", deficit: 350,  proteinMult: 2.0 },
  { value: "bulk",     label: "สร้างกล้าม", sub: "Bulk",     emoji: "💪", deficit: -300, proteinMult: 2.2 },
];

const ACTIVITY = [
  { value: "sedentary", label: "นั่งทำงาน — Sedentary",        mult: 1.2 },
  { value: "light",     label: "ขยับบ้าง 1–2 วัน — Light",     mult: 1.375 },
  { value: "moderate",  label: "ปานกลาง 3–5 วัน — Moderate",   mult: 1.55 },
  { value: "very",      label: "หนักมาก 6–7 วัน — Very Active", mult: 1.725 },
];

// ── Theme tokens ──────────────────────────────────────────────────────────────
const DARK = {
  pageBg:      "linear-gradient(160deg,#0e1c28 0%,#162535 100%)",
  hdrBg:       "linear-gradient(135deg,#0b3328,#0b2840)",
  cardBg:      "#162535", cardBorder: "#1e3a50", cardShadow: "none",
  inpBg:       "#0d1b26", inpBorder: "#1e3448", inpText: "#e8f4f8",
  tabBg:       "#0d1b26", tabActiveBg: "#162535", tabCol: "#2dd4bf", tabMuted: "#5a8fa8",
  text:        "#e8f4f8", muted: "#5a8fa8", dim: "#8fa8b8", sub: "#c8dde8",
  accent:      "#2dd4bf", accentBg: "#0d2e20", accentText: "#0d2e20",
  goalAct:     "#0d2e20", goalInact: "#0d1b26", goalBorder: "#1e3448", goalActBorder: "#2dd4bf",
  goalText:    "#c8dde8", goalActText: "#2dd4bf",
  toggleBg:    "#0d1b26", toggleActBg: "#2dd4bf", toggleActText: "#0d2e20", toggleInactBg: "#1e3448", toggleInactText: "#5a8fa8",
  statBg:      "#162535", statBorder: "#1e3a50",
  calBg:       "linear-gradient(135deg,#0d3d2e,#0d2e45)", calBorder: "#1a5040",
  riceBg:      "#0d2535", riceText: "#7ecdb8",
  divider:     "#1e3a50",
  warnBg:      "#2d1a0a", warnBorder: "#f97316", warnText: "#fb923c",
  chartLine:   "#1e3a50", chartText: "#5a8fa8",
  selectBg:    "#0d1b26", selectColor: "#e8f4f8",
  savedBg:     "#0d2e20", savedText: "#2dd4bf",
};

const LIGHT = {
  pageBg:      "linear-gradient(160deg,#f0faf8 0%,#f4f7fb 100%)",
  hdrBg:       "linear-gradient(135deg,#0f4c41,#1a3a5c)",
  cardBg:      "#ffffff", cardBorder: "#e2e8f0", cardShadow: "0 1px 8px #0000000d",
  inpBg:       "#f8fafc", inpBorder: "#cbd5e1", inpText: "#1e293b",
  tabBg:       "#e8eef4", tabActiveBg: "#ffffff", tabCol: "#0d9488", tabMuted: "#64748b",
  text:        "#1e293b", muted: "#64748b", dim: "#94a3b8", sub: "#475569",
  accent:      "#0d9488", accentBg: "#f0fdf9", accentText: "#0d9488",
  goalAct:     "#f0fdf9", goalInact: "#f8fafc", goalBorder: "#e2e8f0", goalActBorder: "#0d9488",
  goalText:    "#475569", goalActText: "#0d9488",
  toggleBg:    "#f1f5f9", toggleActBg: "#0d9488", toggleActText: "#ffffff", toggleInactBg: "#e2e8f0", toggleInactText: "#64748b",
  statBg:      "#f8fafc", statBorder: "#e2e8f0",
  calBg:       "linear-gradient(135deg,#0f766e,#1d4ed8)", calBorder: "#0d9488",
  riceBg:      "rgba(0,0,0,0.2)", riceText: "rgba(255,255,255,0.85)",
  divider:     "#e2e8f0",
  warnBg:      "#fff7ed", warnBorder: "#f97316", warnText: "#c2410c",
  chartLine:   "#e2e8f0", chartText: "#94a3b8",
  selectBg:    "#f8fafc", selectColor: "#1e293b",
  savedBg:     "#f0fdf9", savedText: "#0d9488",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function calcBMR(w, h, age, gender) {
  return gender === "male" ? 10*w + 6.25*h - 5*age + 5 : 10*w + 6.25*h - 5*age - 161;
}

function calcMacros(goal, target, w, isTraining) {
  const g = GOALS.find(x => x.value === goal);
  const protein = Math.round(g.proteinMult * w);
  const fat = Math.round((isTraining ? 0.9 : 1.0) * w);
  const carb = Math.max(100, Math.round((target - protein*4 - fat*9) / 4));
  return { protein, fat, carb };
}

function calcFoodGuide(macros, weight) {
  const riceCooked = Math.round(macros.carb / 0.28);
  const riceScoops = +(riceCooked / 150).toFixed(1);
  const meatG = Math.round(macros.protein / 0.20);
  const meatHandfuls = +(meatG / 150).toFixed(1);
  const oilG = Math.round(macros.fat * 0.4);
  const oilTbsp = +(oilG / 14).toFixed(1);
  const almondG = Math.round(macros.fat * 1.2);
  const almondPcs = Math.round(almondG / 1.2);
  const waterL = +(weight * 0.035).toFixed(1);
  const waterCups = Math.round(waterL / 0.25);
  return { riceCooked, riceScoops, meatG, meatHandfuls, oilG, oilTbsp, almondG, almondPcs, waterL, waterCups };
}

function todayStr() {
  return new Date().toLocaleDateString("th-TH", { day:"2-digit", month:"2-digit", year:"numeric" });
}

function avg7(logs, idx) {
  const slice = logs.slice(Math.max(0, idx-6), idx+1);
  return +(slice.reduce((s,l) => s+l.w, 0) / slice.length).toFixed(2);
}

// ── Food Tracker ──────────────────────────────────────────────────────────────
function FoodTracker({ trackKey, trackTarget, trackStep, trackUnit, consumed, onAdd, accentColor }) {
  const remaining = Math.max(0, trackTarget - consumed);
  const pct = Math.min(100, (consumed / trackTarget) * 100);
  const done = consumed >= trackTarget;
  return (
    <div style={{ marginTop:10, borderTop:"1px solid #f0f0f0", paddingTop:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:4 }}>
        <span style={{ color:"#888" }}>กินแล้ว <b style={{ color:accentColor }}>{consumed}{trackUnit}</b></span>
        <span style={{ color:"#888" }}>เหลือ <b style={{ color:done?"#16a34a":"#1a1a1a" }}>{remaining}{trackUnit}</b>{done?" ✓":""}</span>
      </div>
      <div style={{ height:5, background:"#f0f0f0", borderRadius:99, overflow:"hidden", marginBottom:8 }}>
        <div style={{ width:`${pct}%`, height:"100%", background:done?"#22c55e":accentColor, borderRadius:99, transition:"width .2s" }}/>
      </div>
      <div style={{ display:"flex", gap:6 }}>
        <button onClick={() => onAdd(trackKey, -trackStep)} style={{ flex:1, background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"5px 0", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Sarabun',sans-serif", color:"#64748b" }}>−{trackStep}{trackUnit}</button>
        <button onClick={() => onAdd(trackKey, trackStep)}  style={{ flex:1, background:"#dcfce7", border:"1px solid #86efac", borderRadius:8, padding:"5px 0", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Sarabun',sans-serif", color:"#15803d" }}>+{trackStep}{trackUnit}</button>
      </div>
    </div>
  );
}

// ── Weight Chart ──────────────────────────────────────────────────────────────
function WeightChart({ logs, T }) {
  if (logs.length < 2) return (
    <div style={{ textAlign:"center", padding:"16px 0", color:T.muted, fontSize:12 }}>
      บันทึกอย่างน้อย 2 วัน เพื่อดูกราฟ
    </div>
  );
  const recent = logs.slice(-20);
  const weights = recent.map(l => l.w);
  const avgs = recent.map((_,i) => avg7(recent, i));
  const all = [...weights, ...avgs];
  const minV = Math.min(...all)-0.3, maxV = Math.max(...all)+0.3;
  const W=300, H=100, P={t:8,r:8,b:18,l:30};
  const iW=W-P.l-P.r, iH=H-P.t-P.b, n=recent.length;
  const x = i => P.l + (i/Math.max(n-1,1))*iW;
  const y = v => P.t + iH - ((v-minV)/(maxV-minV))*iH;
  const poly = pts => pts.map((p,i) => `${x(i)},${y(p)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", display:"block" }}>
      {[minV+0.2,(minV+maxV)/2,maxV-0.2].map(v => (
        <g key={v}>
          <line x1={P.l} x2={W-P.r} y1={y(v)} y2={y(v)} stroke={T.chartLine} strokeWidth={1} strokeDasharray="3,2"/>
          <text x={P.l-3} y={y(v)+3} fontSize={8} fill={T.chartText} textAnchor="end">{v.toFixed(1)}</text>
        </g>
      ))}
      <polyline points={poly(avgs)} fill="none" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="4,2" strokeLinejoin="round"/>
      <polyline points={poly(weights)} fill="none" stroke="#2dd4bf" strokeWidth={2} strokeLinejoin="round"/>
      {weights.map((w,i) => <circle key={i} cx={x(i)} cy={y(w)} r={2.5} fill="#2dd4bf"/>)}
      {[0, Math.floor((n-1)/2), n-1].filter((v,i,a) => a.indexOf(v)===i).map(i => (
        <text key={i} x={x(i)} y={H-3} fontSize={8} fill={T.chartText} textAnchor="middle">{recent[i].d}</text>
      ))}
    </svg>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SmartCalCoach() {
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("dark_mode") !== "false"; }
    catch { return true; }
  });
  const [tab, setTab] = useState("calc");
  const [form, setForm] = useState(() => {
    try {
      const s = localStorage.getItem("sc_form");
      return s ? JSON.parse(s) : { weight:"", height:"", gender:"male", age:"", activity:"sedentary", bodyFat:"", goal:"recomp", isTraining:true };
    } catch { return { weight:"", height:"", gender:"male", age:"", activity:"sedentary", bodyFat:"", goal:"recomp", isTraining:true }; }
  });
  const [weightInput, setWeightInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [logs, setLogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wt_logs") || "[]"); }
    catch { return []; }
  });
  const [foodConsumed, setFoodConsumed] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem("food_consumed") || "{}");
      if (s.date === todayStr()) return s.consumed;
    } catch {}
    return { meat:0, rice:0, oil:0, almond:0, water:0 };
  });
  const [foodLogs, setFoodLogs] = useState(() => {
    try {
      const ls = JSON.parse(localStorage.getItem("food_logs") || "[]");
      const prev = JSON.parse(localStorage.getItem("food_consumed") || "{}");
      if (prev.date && prev.date !== todayStr() && prev.consumed) {
        const d = prev.date.slice(0,5);
        if (!ls.find(l => l.d === d))
          return [...ls, { d, ...prev.consumed }].slice(-30);
      }
      return ls;
    } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("dark_mode", darkMode); }, [darkMode]);
  useEffect(() => { localStorage.setItem("wt_logs", JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem("sc_form", JSON.stringify(form)); }, [form]);
  useEffect(() => { localStorage.setItem("food_consumed", JSON.stringify({ date:todayStr(), consumed:foodConsumed })); }, [foodConsumed]);
  useEffect(() => { localStorage.setItem("food_logs", JSON.stringify(foodLogs)); }, [foodLogs]);
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 0, 0, 0);
    const t = setTimeout(() => {
      try {
        const s = JSON.parse(localStorage.getItem("food_consumed") || "{}");
        if (s.consumed) {
          const d = (s.date || todayStr()).slice(0,5);
          setFoodLogs(prev => [...prev.filter(l => l.d !== d), { d, ...s.consumed }].slice(-30));
        }
      } catch {}
      setFoodConsumed({ meat:0, rice:0, oil:0, almond:0, water:0 });
    }, midnight - now);
    return () => clearTimeout(t);
  }, []);

  // ── Theme ──
  const T = darkMode ? DARK : LIGHT;
  const INP  = { width:"100%", background:T.inpBg, border:`1.5px solid ${T.inpBorder}`, borderRadius:10, padding:"9px 12px", color:T.inpText, fontSize:14, fontFamily:"'Sarabun',sans-serif", outline:"none", boxSizing:"border-box", height:40 };
  const LBL  = { display:"block", fontSize:10, color:T.muted, marginBottom:4, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase" };
  const CARD = { background:T.cardBg, borderRadius:18, padding:16, marginBottom:12, border:`1px solid ${T.cardBorder}`, boxShadow:T.cardShadow };
  const SEC  = { fontSize:10, color:T.muted, fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:12 };

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));
  const addConsumed = (key, delta) => setFoodConsumed(prev => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));

  const result = (() => {
    if (!form.weight || !form.height || !form.age) return null;
    const w=parseFloat(form.weight), h=parseFloat(form.height), age=parseInt(form.age);
    const act = ACTIVITY.find(a => a.value === form.activity);
    const g = GOALS.find(x => x.value === form.goal);
    const bmr = calcBMR(w, h, age, form.gender);
    const tdee = Math.round(bmr * act.mult);
    const target = Math.max(1200, tdee - g.deficit);
    const macros = calcMacros(form.goal, target, w, form.isTraining);
    const foodGuide = calcFoodGuide(macros, w);
    const deficit = tdee - target;
    return { bmr:Math.round(bmr), tdee, target, macros, foodGuide, deficit, bmi:(w/((h/100)**2)).toFixed(1) };
  })();

  const handleSaveWeight = () => {
    const w = parseFloat(weightInput);
    if (!w || w < 30 || w > 300) return;
    const d = todayStr().slice(0,5);
    setLogs(prev => [...prev.filter(l=>l.d!==d), {d, w}].slice(-30));
    setWeightInput(""); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const latest = logs[logs.length-1];
  const change = logs.length >= 2 ? (logs[logs.length-1].w - logs[0].w).toFixed(1) : null;
  const avgW = logs.length ? avg7(logs, logs.length-1) : null;

  return (
    <div style={{ fontFamily:"'Sarabun','Noto Sans Thai',sans-serif", minHeight:"100vh", background:T.pageBg, color:T.text, paddingBottom:40, transition:"background .3s,color .3s" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box} input:focus,select:focus{border-color:${T.accent}!important} select option{background:${T.selectBg};color:${T.selectColor}}`}</style>

      {/* Header */}
      <div style={{ background:T.hdrBg, padding:"16px 20px", boxShadow:"0 4px 20px #00000060" }}>
        <div style={{ maxWidth:480, margin:"0 auto", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#2dd4bf,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>🥗</div>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:"#fff" }}>SmartCal Coach</div>
            <div style={{ fontSize:10, color:"#7ecdb8", letterSpacing:1 }}>วิเคราะห์แผนการทานอาหารส่วนบุคคล</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={() => setDarkMode(d => !d)} style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:20, padding:"5px 10px", fontSize:15, cursor:"pointer", lineHeight:1 }}>
              {darkMode ? "☀️" : "🌙"}
            </button>
            {result && (
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:20, fontWeight:800, color:"#2dd4bf" }}>{result.target.toLocaleString()}</div>
                <div style={{ fontSize:10, color:"#7ecdb8" }}>kcal/วัน</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ maxWidth:480, margin:"12px auto 0", padding:"0 16px" }}>
        <div style={{ display:"flex", gap:5, background:T.tabBg, borderRadius:14, padding:4 }}>
          {[{id:"calc",label:"🧮 คำนวณ"},{id:"weight",label:"📈 น้ำหนัก"}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:"8px 0", borderRadius:10, border:"none", background:tab===t.id?T.tabActiveBg:"transparent", color:tab===t.id?T.tabCol:T.tabMuted, fontFamily:"inherit", fontSize:13, fontWeight:700, cursor:"pointer", transition:"all .2s", boxShadow:tab===t.id&&!darkMode?"0 1px 4px #0000001a":"none" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:480, margin:"0 auto", padding:"12px 16px 0" }}>

        {/* ══ CALC TAB ══ */}
        {tab === "calc" && <>
          <div style={CARD}>
            <div style={SEC}>ข้อมูลร่างกาย</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div><label style={LBL}>น้ำหนัก (กก.)</label><input type="number" value={form.weight} onChange={set("weight")} style={INP}/></div>
              <div><label style={LBL}>ส่วนสูง (ซม.)</label><input type="number" value={form.height} onChange={set("height")} style={INP}/></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginTop:10 }}>
              <div><label style={LBL}>เพศ</label><select value={form.gender} onChange={set("gender")} style={{...INP,cursor:"pointer"}}><option value="male">ชาย</option><option value="female">หญิง</option></select></div>
              <div><label style={LBL}>อายุ (ปี)</label><input type="number" value={form.age} onChange={set("age")} style={INP}/></div>
              <div><label style={LBL}>Body Fat %</label><input type="number" value={form.bodyFat} onChange={set("bodyFat")} placeholder="ไม่บังคับ" style={INP}/></div>
            </div>
            <div style={{ marginTop:10 }}>
              <label style={LBL}>กิจกรรม</label>
              <select value={form.activity} onChange={set("activity")} style={{...INP,cursor:"pointer"}}>
                {ACTIVITY.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          </div>

          <div style={CARD}>
            <div style={SEC}>เป้าหมาย</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {GOALS.map(g => (
                <button key={g.value} onClick={() => setForm(f => ({...f, goal:g.value}))}
                  style={{ background:form.goal===g.value?T.goalAct:T.goalInact, border:`1.5px solid ${form.goal===g.value?T.goalActBorder:T.goalBorder}`, borderRadius:12, padding:"12px 4px", cursor:"pointer", textAlign:"center", transition:"all .2s" }}>
                  <div style={{ fontSize:22 }}>{g.emoji}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:form.goal===g.value?T.goalActText:T.goalText, marginTop:4 }}>{g.label}</div>
                  <div style={{ fontSize:9, color:T.muted, marginTop:2 }}>{g.sub}</div>
                </button>
              ))}
            </div>
            <div style={{ marginTop:12, display:"flex", alignItems:"center", justifyContent:"space-between", background:T.toggleBg, borderRadius:10, padding:"8px 12px" }}>
              <div>
                <div style={{ fontSize:12, color:T.sub, fontWeight:600 }}>{form.isTraining?"🏋️ วันเทรน":"😴 วันพัก"}</div>
                <div style={{ fontSize:10, color:T.muted }}>{form.isTraining?"คาร์บ ↑ ไขมัน ↓":"คาร์บ ↓ ไขมัน ↑"}</div>
              </div>
              <button onClick={() => setForm(f => ({...f, isTraining:!f.isTraining}))}
                style={{ background:form.isTraining?T.toggleActBg:T.toggleInactBg, border:"none", borderRadius:20, padding:"6px 14px", color:form.isTraining?T.toggleActText:T.toggleInactText, fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"'Sarabun',sans-serif" }}>
                {form.isTraining?"เทรนอยู่":"วันพัก"}
              </button>
            </div>
          </div>

          {result && <>
            {result.deficit > 500 && (
              <div style={{ background:T.warnBg, border:`1px solid ${T.warnBorder}`, borderRadius:12, padding:"8px 12px", marginBottom:12, fontSize:12, color:T.warnText }}>
                ⚠️ Deficit สูงเกินไป อาจสูญเสียกล้ามเนื้อ
              </div>
            )}

            <div style={{ background:T.calBg, borderRadius:18, padding:"18px 16px", marginBottom:12, border:`1px solid ${T.calBorder}` }}>
              <div style={{ fontSize:48, fontWeight:800, color:"#fff", textAlign:"center", lineHeight:1 }}>{result.target.toLocaleString()}</div>
              <div style={{ textAlign:"center", color:"rgba(255,255,255,0.75)", fontSize:12, marginBottom:12 }}>แคลอรี่ / วัน</div>
              <div style={{ display:"flex", height:6, borderRadius:99, overflow:"hidden", marginBottom:10, gap:2 }}>
                <div style={{ flex:result.macros.protein*4, background:"#f87171", borderRadius:"99px 0 0 99px" }}/>
                <div style={{ flex:result.macros.fat*9, background:"#fbbf24" }}/>
                <div style={{ flex:result.macros.carb*4, background:"#34d399", borderRadius:"0 99px 99px 0" }}/>
              </div>
              <div style={{ display:"flex", justifyContent:"center", gap:14, fontSize:12, flexWrap:"wrap" }}>
                <span style={{ color:"rgba(255,255,255,0.9)" }}><span style={{ color:"#f87171", fontWeight:700 }}>● </span>โปรตีน <b>{result.macros.protein}g</b></span>
                <span style={{ color:"rgba(255,255,255,0.9)" }}><span style={{ color:"#fbbf24", fontWeight:700 }}>● </span>ไขมัน <b>{result.macros.fat}g</b></span>
                <span style={{ color:"rgba(255,255,255,0.9)" }}><span style={{ color:"#34d399", fontWeight:700 }}>● </span>คาร์บ <b>{result.macros.carb}g</b></span>
              </div>
              <div style={{ marginTop:10, background:T.riceBg, borderRadius:8, padding:"7px 12px", textAlign:"center" }}>
                <span style={{ fontSize:11, color:T.riceText }}>🍚 ข้าวสวยสุกทั้งวัน ≈ </span>
                <span style={{ fontSize:13, fontWeight:800, color:"#34d399" }}>{result.foodGuide.riceCooked}g</span>
                <span style={{ fontSize:11, color:T.riceText }}> ({result.foodGuide.riceScoops} ทัพพี)</span>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {[{label:"BMR",value:result.bmr,unit:"kcal"},{label:"TDEE",value:result.tdee,unit:"kcal"},{label:"BMI",value:result.bmi,unit:""}].map(s => (
                <div key={s.label} style={{ background:T.statBg, borderRadius:12, padding:"10px 6px", textAlign:"center", border:`1px solid ${T.statBorder}`, boxShadow:T.cardShadow }}>
                  <div style={{ fontSize:9, color:T.muted, marginBottom:3, fontWeight:700, textTransform:"uppercase" }}>{s.label}</div>
                  <div style={{ fontSize:16, fontWeight:800, color:T.text }}>{s.value}</div>
                  <div style={{ fontSize:9, color:T.muted }}>{s.unit}</div>
                </div>
              ))}
            </div>

            {/* Food Guide */}
            <div style={{ ...CARD, marginTop:12 }}>
              <div style={SEC}>เป้าหมายการกิน</div>
              {(() => {
                const g = result.foodGuide;
                const cards = [
                  { icon:"🥩", title:"เนื้อสัตว์ (ชั่งดิบ)", border:"#f97316", badge:"#fff7ed", badgeText:"#ea580c", big:`${g.meatG}g`, sub:`≈ ${g.meatHandfuls} ฝ่ามือ`, items:null, trackKey:"meat", trackTarget:g.meatG, trackStep:25, trackUnit:"g" },
                  { icon:"🍚", title:"ข้าวสวยหุงสุก",         border:"#eab308", badge:"#fefce8", badgeText:"#ca8a04", big:`${g.riceCooked}g`, sub:`≈ ${g.riceScoops} ทัพพี`, items:null, trackKey:"rice", trackTarget:g.riceCooked, trackStep:50, trackUnit:"g" },
                  { icon:"🫒", title:"ไขมันดี", border:"#22c55e", badge:null, badgeText:"#16a34a", big:null, sub:null,
                    items:[
                      { label:"น้ำมันมะกอก / รำข้าว", val:`${g.oilG}g ≈ ${g.oilTbsp} ช้อน`, trackKey:"oil",    trackTarget:g.oilG,    trackStep:5, trackUnit:"g" },
                      { label:"อัลมอนด์อบ",             val:`${g.almondG}g ≈ ${g.almondPcs} เม็ด`, trackKey:"almond", trackTarget:g.almondG, trackStep:6, trackUnit:"g" },
                    ]
                  },
                  { icon:"💧", title:"น้ำดื่มต่อวัน", border:"#38bdf8", badge:"#f0f9ff", badgeText:"#0284c7", big:`${g.waterL} ลิตร`, sub:`≈ ${g.waterCups} แก้ว (250ml)`, items:null, trackKey:"water", trackTarget:Math.round(g.waterL*1000), trackStep:250, trackUnit:"ml" },
                ];
                return (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {cards.map((c,ci) => (
                      <div key={ci} style={{ background:"#fff", borderRadius:14, padding:"14px 12px", border:`2px solid ${c.border}`, boxShadow:"0 1px 4px #00000008" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                          <div style={{ width:34, height:34, borderRadius:8, background:c.badge||"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{c.icon}</div>
                          <span style={{ fontWeight:700, fontSize:13, color:"#1a1a1a" }}>{c.title}{c.title==="ไขมันดี"&&<span style={{ fontSize:10, color:"#999", fontWeight:400 }}> (เลือกอย่างหนึ่ง)</span>}</span>
                        </div>
                        {c.big && <>
                          <div style={{ fontSize:36, fontWeight:800, color:"#1a1a1a", lineHeight:1 }}>{c.big}</div>
                          <div style={{ marginTop:6, display:"inline-block", background:c.badge, borderRadius:20, padding:"3px 12px", fontSize:12, color:c.badgeText, fontWeight:600 }}>{c.sub}</div>
                        </>}
                        {c.items && (
                          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                            {c.items.map((item,ii) => (
                              <div key={ii}>
                                <div style={{ display:"flex", justifyContent:"space-between", background:"#f0fdf4", borderRadius:8, padding:"8px 10px" }}>
                                  <span style={{ fontSize:12, color:"#333" }}>{item.label}</span>
                                  <span style={{ fontSize:12, fontWeight:700, color:c.badgeText }}>{item.val}</span>
                                </div>
                                <FoodTracker trackKey={item.trackKey} trackTarget={item.trackTarget} trackStep={item.trackStep} trackUnit={item.trackUnit} consumed={foodConsumed[item.trackKey]} onAdd={addConsumed} accentColor={c.badgeText}/>
                              </div>
                            ))}
                          </div>
                        )}
                        {c.trackKey && <FoodTracker trackKey={c.trackKey} trackTarget={c.trackTarget} trackStep={c.trackStep} trackUnit={c.trackUnit} consumed={foodConsumed[c.trackKey]} onAdd={addConsumed} accentColor={c.badgeText}/>}
                      </div>
                    ))}
                    <div style={{ textAlign:"center", fontSize:11, color:T.muted, lineHeight:1.8, paddingTop:4 }}>ตัวเลขถูกปัดเศษเพื่อเตรียมอาหารได้ง่าย · ผักใบเขียวได้ไม่อั้น · ประเมินผลทุก 2 สัปดาห์</div>
                  </div>
                );
              })()}
            </div>
          </>}
        </>}

        {/* ══ WEIGHT TAB ══ */}
        {tab === "weight" && <>
          <div style={CARD}>
            <div style={SEC}>บันทึกน้ำหนักวันนี้</div>
            <div style={{ display:"flex", gap:8, marginBottom:8 }}>
              <input type="number" value={weightInput} onChange={e => setWeightInput(e.target.value)} placeholder="เช่น 85.8" style={{...INP,flex:1}}/>
              <button onClick={handleSaveWeight} style={{ background:saved?T.savedBg:"linear-gradient(135deg,#2dd4bf,#3b82f6)", border:"none", borderRadius:10, padding:"0 14px", color:saved?T.savedText:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Sarabun',sans-serif", height:40, flexShrink:0 }}>
                {saved?"✓ บันทึก":"บันทึก"}
              </button>
            </div>
            <div style={{ fontSize:11, color:T.muted }}>📅 {todayStr()}</div>
          </div>

          {latest && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
              {[
                { label:"ล่าสุด",      value:`${latest.w} kg`, color:"#2dd4bf" },
                { label:"เฉลี่ย 7 วัน", value:avgW?`${avgW} kg`:"-", color:"#fbbf24" },
                { label:"เปลี่ยนแปลง", value:change?`${parseFloat(change)>0?"+":""}${change} kg`:"-", color:parseFloat(change)<0?"#34d399":parseFloat(change)>0?"#f87171":T.sub },
              ].map(s => (
                <div key={s.label} style={{ background:T.statBg, borderRadius:12, padding:"10px 6px", textAlign:"center", border:`1px solid ${T.statBorder}`, boxShadow:T.cardShadow }}>
                  <div style={{ fontSize:9, color:T.muted, marginBottom:3, fontWeight:700, textTransform:"uppercase" }}>{s.label}</div>
                  <div style={{ fontSize:13, fontWeight:800, color:s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ ...CARD, padding:"14px 12px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <div style={{ fontSize:10, color:T.muted, fontWeight:700, textTransform:"uppercase" }}>กราฟน้ำหนัก</div>
              <div style={{ display:"flex", gap:10, fontSize:9, color:T.muted }}>
                <span style={{ color:"#2dd4bf" }}>● จริง</span>
                <span style={{ color:"#fbbf24" }}>- - เฉลี่ย 7 วัน</span>
              </div>
            </div>
            <WeightChart logs={logs} T={T}/>
          </div>

          <div style={CARD}>
            <div style={SEC}>ประวัติ</div>
            <div style={{ maxHeight:180, overflowY:"auto" }}>
              {[...logs].reverse().map((l,i) => (
                <div key={l.d} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:i<logs.length-1?`1px solid ${T.divider}`:"none" }}>
                  <span style={{ fontSize:12, color:T.dim }}>{l.d}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:"#2dd4bf" }}>{l.w} kg</span>
                    <button onClick={() => setLogs(logs.filter(x=>x.d!==l.d))} style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer", fontSize:12, padding:0 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(() => {
            const todayD = todayStr().slice(0,5);
            const allRows = [{ d:todayD, ...foodConsumed, isToday:true }, ...[...foodLogs].reverse()];
            return (
              <div style={CARD}>
                <div style={SEC}>บันทึกการกิน</div>
                <div style={{ display:"grid", gridTemplateColumns:"52px 1fr 1fr 1fr 1fr", gap:4, paddingBottom:8, borderBottom:`1px solid ${T.divider}`, marginBottom:2 }}>
                  <div/>
                  {["เนื้อ","ข้าว","ไขมัน","น้ำ"].map(h => (
                    <div key={h} style={{ fontSize:9, color:T.muted, fontWeight:700, textAlign:"center", textTransform:"uppercase" }}>{h}</div>
                  ))}
                </div>
                <div style={{ maxHeight:200, overflowY:"auto" }}>
                  {allRows.map((l,i) => (
                    <div key={l.d} style={{ display:"grid", gridTemplateColumns:"52px 1fr 1fr 1fr 1fr", gap:4, padding:"7px 0", borderBottom:i<allRows.length-1?`1px solid ${T.divider}`:"none", alignItems:"center" }}>
                      <span style={{ fontSize:11, color:l.isToday?T.accent:T.dim, fontWeight:l.isToday?700:400 }}>{l.d}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:"#f87171", textAlign:"center" }}>{l.meat}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:"#fbbf24", textAlign:"center" }}>{l.rice}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:"#34d399", textAlign:"center" }}>{l.oil || l.almond}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:"#38bdf8", textAlign:"center" }}>{(l.water/1000).toFixed(1)}L</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </>}
      </div>
    </div>
  );
}
