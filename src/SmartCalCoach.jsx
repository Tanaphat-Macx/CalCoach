import { useState, useEffect } from "react";

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "นั่งทำงานเป็นหลัก — Sedentary", multiplier: 1.2 },
  { value: "light", label: "ขยับบ้าง 1–2 วัน/สัปดาห์ — Light Active", multiplier: 1.375 },
  { value: "moderate", label: "ปานกลาง 3–5 วัน/สัปดาห์ — Moderate", multiplier: 1.55 },
  { value: "very", label: "หนักมาก 6–7 วัน/สัปดาห์ — Very Active", multiplier: 1.725 },
];

const GOALS = [
  { value: "fat_loss", label: "ลดไขมัน", sub: "Fat Loss", emoji: "🔥", deficit: 400, proteinMultiplier: 1.6 },
  { value: "recomp", label: "รักษากล้าม", sub: "Recomp", emoji: "⚖️", deficit: 350, proteinMultiplier: 2.0 },
  { value: "bulk", label: "สร้างกล้าม", sub: "Bulk", emoji: "💪", deficit: -300, proteinMultiplier: 2.2 },
];

function calcBMR(weight, height, age, gender, lbm) {
  if (lbm) return 370 + 21.6 * lbm;
  if (gender === "male") return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

// ✅ FIXED: Priority-based macro calculation
// 1. Lock Protein (goal-based multiplier x weight)
// 2. Lock Fat (0.9g/kg training day, 1.0g/kg rest day)
// 3. Carb = remaining calories ÷ 4
function calcMacros(goal, targetCal, weight, isTrainingDay) {
  const goalData = GOALS.find(g => g.value === goal);
  const proteinMultiplier = goalData?.proteinMultiplier || 2.0;

  const protein = Math.round(proteinMultiplier * weight);
  const fatMultiplier = isTrainingDay ? 0.9 : 1.0;
  const fat = Math.round(fatMultiplier * weight);

  const proteinKcal = protein * 4;
  const fatKcal = fat * 9;
  const remaining = targetCal - proteinKcal - fatKcal;

  // Minimum carb floor = 100g, max deficit cap = 700 kcal
  const carb = Math.max(100, Math.round(remaining / 4));

  return { protein, fat, carb };
}

function calcFoodGuide(macros, weight) {
  const meatG = Math.round(macros.protein / 0.25); // avg 25g protein per 100g chicken breast
  const meatHandfuls = +(meatG / 150).toFixed(1);
  const riceCooked = Math.round(macros.carb / 0.26); // cooked rice ~26g carb per 100g
  const riceScoops = +(riceCooked / 150).toFixed(1);
  const oilG = Math.round(macros.fat * 0.4);
  const oilTbsp = +(oilG / 14).toFixed(1);
  const almondG = Math.round(macros.fat * 1.2);
  const almondPcs = Math.round(almondG / 1.2);
  const waterL = +(weight * 0.035).toFixed(1);
  const waterCups = Math.round(waterL / 0.25);
  return { meatG, meatHandfuls, riceCooked, riceScoops, oilG, oilTbsp, almondG, almondPcs, waterL, waterCups };
}

const mealTemplates = {
  fat_loss: [{ name: "มื้อเช้า", pct: 25 }, { name: "มื้อกลางวัน", pct: 35 }, { name: "มื้อเย็น", pct: 30 }, { name: "ว่างระหว่างวัน", pct: 10 }],
  recomp: [{ name: "มื้อเช้า", pct: 25 }, { name: "มื้อกลางวัน", pct: 30 }, { name: "ก่อนเทรน", pct: 20 }, { name: "หลังเทรน", pct: 15 }, { name: "ก่อนนอน", pct: 10 }],
  bulk: [{ name: "มื้อเช้า", pct: 25 }, { name: "มื้อกลางวัน", pct: 30 }, { name: "Pre-Workout", pct: 15 }, { name: "มื้อเย็น", pct: 25 }, { name: "ก่อนนอน", pct: 5 }],
};

const foodSuggestions = {
  fat_loss: ["ข้าวกล้อง + ไก่อกย่าง + ผักสด", "ไข่ต้ม 3 ฟอง + สลัดผัก", "ปลาทูนึ่ง + บร็อคโคลี่ + ข้าวกล้อง", "กรีกโยเกิร์ต + เบอร์รี่"],
  recomp: ["สมูทตี้อกไก่ + โอ๊ต + กล้วย + เวย์", "อกไก่ 150g + ข้าว 200g + ผัก", "ขนมปังซาวโดว์ + เนยถั่ว + กล้วย", "เวย์ + ข้าว/กล้วย หลังเทรน", "ไข่ต้ม 3 ฟอง + ถั่วอบ"],
  bulk: ["ข้าวขาว + เนื้อวัว + ไข่ดาว", "สมูทตี้กล้วย + นมโปรตีน", "ข้าว + ปลาแซลมอน + อะโวคาโด", "ข้าวโอ๊ต + นม + ผลไม้", "ข้าว + อกไก่ + ไข่ขาว"],
};

const INP = {
  width: "100%",
  background: "#0d1b26",
  border: "1.5px solid #1e3448",
  borderRadius: 10,
  padding: "10px 12px",
  color: "#e8f4f8",
  fontSize: 14,
  fontFamily: "'Sarabun',sans-serif",
  outline: "none",
  boxSizing: "border-box",
  height: 42,
};

const LBL = {
  display: "block",
  fontSize: 11,
  color: "#8fa8b8",
  marginBottom: 5,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: "uppercase",
};

function Field({ label, type, value, onChange, placeholder }) {
  return (
      <div>
        <label style={LBL}>{label}</label>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={INP} />
      </div>
  );
}

function AddToHomeScreen({ onDismiss }) {
  const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
  const isAndroid = /android/.test(navigator.userAgent.toLowerCase());

  return (
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: "linear-gradient(135deg,#0b3328,#0b2840)",
        borderTop: "1px solid #1e4060",
        padding: "16px 20px 24px",
        boxShadow: "0 -8px 32px #00000060",
        animation: "slideUp 0.35s cubic-bezier(.22,.68,0,1.2) both"
      }}>
        <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#2dd4bf,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🥗</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 4 }}>เพิ่ม SmartCal Coach ลง Home Screen?</div>
              {isIOS && <div style={{ fontSize: 12, color: "#7ecdb8", lineHeight: 1.6 }}>แตะ <span style={{ background: "#1e3448", borderRadius: 6, padding: "2px 7px", color: "#2dd4bf", fontWeight: 700 }}>⎙ Share</span> แล้วเลือก <span style={{ background: "#1e3448", borderRadius: 6, padding: "2px 7px", color: "#2dd4bf", fontWeight: 700 }}>Add to Home Screen</span></div>}
              {isAndroid && <div style={{ fontSize: 12, color: "#7ecdb8", lineHeight: 1.6 }}>แตะเมนู <span style={{ background: "#1e3448", borderRadius: 6, padding: "2px 7px", color: "#2dd4bf", fontWeight: 700 }}>⋮</span> แล้วเลือก <span style={{ background: "#1e3448", borderRadius: 6, padding: "2px 7px", color: "#2dd4bf", fontWeight: 700 }}>Add to Home Screen</span></div>}
              {!isIOS && !isAndroid && <div style={{ fontSize: 12, color: "#7ecdb8", lineHeight: 1.6 }}>ใช้เบราว์เซอร์บนมือถือเพื่อเพิ่มลง Home Screen ได้เลย</div>}
            </div>
            <button onClick={onDismiss} style={{ background: "none", border: "none", color: "#5a8fa8", fontSize: 20, cursor: "pointer", padding: "0 4px", flexShrink: 0, lineHeight: 1 }}>✕</button>
          </div>
        </div>
      </div>
  );
}

export default function SmartCalCoach() {
  const [form, setForm] = useState({
    weight: "", height: "", gender: "male",
    age: "",           // ✅ เปลี่ยนจาก dob เป็น age
    activity: "sedentary", bodyFat: "", goal: "fat_loss",
    isTrainingDay: true,
  });
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("plan");
  const [showA2HS, setShowA2HS] = useState(false);

  // ✅ ok condition ใช้ age แทน dob
  const ok = form.weight && form.height && form.age && parseInt(form.age) >= 10 && parseInt(form.age) <= 100;

  useEffect(() => {
    if (result && !sessionStorage.getItem("a2hs_dismissed")) {
      const t = setTimeout(() => setShowA2HS(true), 1200);
      return () => clearTimeout(t);
    }
  }, [result]);

  useEffect(() => {
    if (!ok) { setResult(null); return; }
    const w = parseFloat(form.weight);
    const h = parseFloat(form.height);
    const age = parseInt(form.age);
    const bodyFat = form.bodyFat ? parseFloat(form.bodyFat) : null;

    // ถ้ามี body fat % คำนวณ lean mass แล้วใช้แทน
    const lbm = bodyFat ? w * (1 - bodyFat / 100) : null;

    const act = ACTIVITY_LEVELS.find(a => a.value === form.activity);
    const goalData = GOALS.find(g => g.value === form.goal);

    const bmr = calcBMR(w, h, age, form.gender, lbm);
    const tdee = Math.round(bmr * act.multiplier);
    const targetCal = Math.max(1200, tdee - goalData.deficit);

    // ✅ FIXED Macro calculation
    const macros = calcMacros(form.goal, targetCal, w, form.isTrainingDay);

    // Deficit warning
    const deficit = tdee - targetCal;
    let deficitWarning = null;
    if (deficit > 500) deficitWarning = "⚠️ Deficit สูงเกินไป อาจสูญเสียกล้ามเนื้อ แนะนำไม่เกิน 500 kcal";
    else if (deficit < 200 && form.goal === "fat_loss") deficitWarning = "ℹ️ Deficit น้อยมาก การลด fat จะช้า";

    const meals = mealTemplates[form.goal].map(m => ({ ...m, kcal: Math.round(targetCal * m.pct / 100) }));
    const bmi = (w / ((h / 100) ** 2)).toFixed(1);
    const foodGuide = calcFoodGuide(macros, w);

    setResult({ bmr: Math.round(bmr), tdee, targetCal, macros, meals, bmi, age, foodGuide, deficit, deficitWarning, lbm });
  }, [form]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const dismissA2HS = () => {
    setShowA2HS(false);
    sessionStorage.setItem("a2hs_dismissed", "1");
  };

  return (
      <div style={{ fontFamily: "'Sarabun','Noto Sans Thai',sans-serif", minHeight: "100vh", background: "linear-gradient(160deg,#0e1c28 0%,#162535 60%,#0e1c28 100%)", color: "#e8f4f8", paddingBottom: showA2HS ? 140 : 60 }}>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <style>{`*{box-sizing:border-box} input:focus,select:focus{border-color:#2dd4bf!important} select option{background:#0d1b26;color:#e8f4f8}`}</style>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#0b3328,#0b2840)", padding: "20px 20px 16px", boxShadow: "0 4px 20px #00000060" }}>
          <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#2dd4bf,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🥗</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>SmartCal Coach</h1>
              <p style={{ margin: 0, fontSize: 11, color: "#7ecdb8", letterSpacing: 0.3 }}>วิเคราะห์แผนการทานอาหารส่วนบุคคล</p>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px 0" }}>

          {/* Body info */}
          <div style={{ background: "#162535", borderRadius: 20, padding: 20, marginBottom: 14, border: "1px solid #1e3a50" }}>
            <p style={{ margin: "0 0 14px", fontSize: 11, color: "#5a8fa8", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>ข้อมูลร่างกาย</p>

            {/* Row 1: น้ำหนัก + ส่วนสูง */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="น้ำหนัก (กก.)" type="number" value={form.weight} onChange={set("weight")} placeholder="เช่น 70" />
              <Field label="ส่วนสูง (ซม.)" type="number" value={form.height} onChange={set("height")} placeholder="เช่น 170" />
            </div>

            {/* Row 2: เพศ + อายุ + Body Fat % — 3 ช่องเท่ากัน */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
              <div>
                <label style={LBL}>เพศ</label>
                <select value={form.gender} onChange={set("gender")} style={{ ...INP, cursor: "pointer" }}>
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                </select>
              </div>
              {/* ✅ เปลี่ยนจากวันเกิดเป็นอายุ */}
              <Field label="อายุ (ปี)" type="number" value={form.age} onChange={set("age")} placeholder="เช่น 28" />
              <Field label="Body Fat %" type="number" value={form.bodyFat} onChange={set("bodyFat")} placeholder="ไม่บังคับ" />
            </div>

            {/* Row 3: กิจกรรม — full width */}
            <div style={{ marginTop: 12 }}>
              <label style={LBL}>กิจกรรมที่ทำเป็นประจำ</label>
              <select value={form.activity} onChange={set("activity")} style={{ ...INP, cursor: "pointer" }}>
                {ACTIVITY_LEVELS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          </div>

          {/* Goal */}
          <div style={{ background: "#162535", borderRadius: 20, padding: 20, marginBottom: 14, border: "1px solid #1e3a50" }}>
            <p style={{ margin: "0 0 14px", fontSize: 11, color: "#5a8fa8", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>เป้าหมายของคุณ</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {GOALS.map(g => (
                  <button key={g.value} onClick={() => setForm(f => ({ ...f, goal: g.value }))}
                          style={{ background: form.goal === g.value ? "#0d2e20" : "#0d1b26", border: `1.5px solid ${form.goal === g.value ? "#2dd4bf" : "#1e3448"}`, borderRadius: 14, padding: "14px 6px", cursor: "pointer", textAlign: "center", transition: "all .2s" }}>
                    <div style={{ fontSize: 24 }}>{g.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: form.goal === g.value ? "#2dd4bf" : "#c8dde8", marginTop: 5 }}>{g.label}</div>
                    <div style={{ fontSize: 10, color: "#5a8fa8", marginTop: 2 }}>{g.sub}</div>
                  </button>
              ))}
            </div>

            {/* ✅ Training Day Toggle */}
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d1b26", borderRadius: 12, padding: "10px 14px" }}>
            <span style={{ fontSize: 13, color: "#c8dde8", fontWeight: 600 }}>
              {form.isTrainingDay ? "🏋️ วันเทรน" : "😴 วันพัก"}
            </span>
              <button
                  onClick={() => setForm(f => ({ ...f, isTrainingDay: !f.isTrainingDay }))}
                  style={{
                    background: form.isTrainingDay ? "#2dd4bf" : "#1e3448",
                    border: "none", borderRadius: 20, padding: "6px 16px",
                    color: form.isTrainingDay ? "#0d2e20" : "#5a8fa8",
                    fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all .2s",
                    fontFamily: "'Sarabun',sans-serif"
                  }}>
                {form.isTrainingDay ? "เทรนอยู่" : "วันพัก"}
              </button>
            </div>
          </div>

          {/* Empty state */}
          {!result && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#5a8fa8" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 14 }}>กรอกน้ำหนัก ส่วนสูง และอายุเพื่อดูแผนอาหารของคุณ</div>
              </div>
          )}

          {result && <>

            {/* Deficit Warning */}
            {result.deficitWarning && (
                <div style={{
                  background: result.deficit > 500 ? "#2d1a0a" : "#0a1f2d",
                  border: `1px solid ${result.deficit > 500 ? "#f97316" : "#38bdf8"}`,
                  borderRadius: 14, padding: "10px 14px", marginBottom: 14,
                  fontSize: 13, color: result.deficit > 500 ? "#fb923c" : "#7dd3fc"
                }}>
                  {result.deficitWarning}
                </div>
            )}

            {/* Hero cal banner */}
            <div style={{ background: "linear-gradient(135deg,#0d3d2e,#0d2e45)", borderRadius: 20, padding: "20px 16px 16px", marginBottom: 14, border: "1px solid #1a5040" }}>
              <div style={{ fontSize: 50, fontWeight: 800, color: "#fff", textAlign: "center", letterSpacing: -1, lineHeight: 1 }}>
                {result.targetCal.toLocaleString()}
              </div>
              <div style={{ textAlign: "center", color: "#7ecdb8", fontSize: 13, marginBottom: 14 }}>แคลอรี่ / วัน</div>
              <div style={{ display: "flex", height: 7, borderRadius: 99, overflow: "hidden", marginBottom: 12, gap: 2 }}>
                <div style={{ flex: result.macros.protein * 4, background: "#f87171", borderRadius: "99px 0 0 99px" }} />
                <div style={{ flex: result.macros.fat * 9, background: "#fbbf24" }} />
                <div style={{ flex: result.macros.carb * 4, background: "#34d399", borderRadius: "0 99px 99px 0" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 18, fontSize: 13, color: "#c8dde8", flexWrap: "wrap" }}>
                <span><span style={{ color: "#f87171", fontWeight: 700 }}>● </span>โปรตีน {result.macros.protein}g</span>
                <span><span style={{ color: "#fbbf24", fontWeight: 700 }}>● </span>ไขมัน {result.macros.fat}g</span>
                <span><span style={{ color: "#34d399", fontWeight: 700 }}>● </span>คาร์บ {result.macros.carb}g</span>
              </div>

              {/* ✅ ข้าวสวยสุกทั้งวัน */}
              <div style={{ marginTop: 12, textAlign: "center", background: "#0d2535", borderRadius: 10, padding: "8px 14px" }}>
                <span style={{ fontSize: 12, color: "#7ecdb8" }}>🍚 ข้าวสวยสุกทั้งวัน ≈ </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#34d399" }}>{result.foodGuide.riceCooked}g</span>
                <span style={{ fontSize: 12, color: "#7ecdb8" }}> ({result.foodGuide.riceScoops} ทัพพี)</span>
              </div>
            </div>

            {/* Mini stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
              {[{ label: "BMR", value: result.bmr, unit: "kcal" }, { label: "TDEE", value: result.tdee, unit: "kcal" }, { label: "BMI", value: result.bmi, unit: "" }].map(s => (
                  <div key={s.label} style={{ background: "#162535", borderRadius: 14, padding: "12px 8px", textAlign: "center", border: "1px solid #1e3a50" }}>
                    <div style={{ fontSize: 10, color: "#5a8fa8", marginBottom: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
                    <div style={{ fontSize: 17, fontWeight: 800 }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: "#5a8fa8" }}>{s.unit}</div>
                  </div>
              ))}
            </div>

            {/* Tab bar */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14, background: "#0d1b26", borderRadius: 14, padding: 5 }}>
              {[{ id: "plan", label: "📋 มื้ออาหาร" }, { id: "guide", label: "🍽️ Food Guide" }].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                          style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", background: tab === t.id ? "#162535" : "transparent", color: tab === t.id ? "#2dd4bf" : "#5a8fa8", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .2s" }}>
                    {t.label}
                  </button>
              ))}
            </div>

            {/* Meal plan */}
            {tab === "plan" && (
                <div style={{ background: "#162535", borderRadius: 20, padding: 18, marginBottom: 14, border: "1px solid #1e3a50" }}>
                  <p style={{ margin: "0 0 14px", fontSize: 11, color: "#5a8fa8", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>แผนมื้ออาหารแนะนำ</p>
                  {result.meals.map((m, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: i < result.meals.length - 1 ? "1px solid #1e3a50" : "none" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: "#5a8fa8", marginTop: 3 }}>{foodSuggestions[form.goal][i % foodSuggestions[form.goal].length]}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
                          <div style={{ fontWeight: 800, color: "#2dd4bf", fontSize: 18 }}>{m.kcal}</div>
                          <div style={{ fontSize: 10, color: "#5a8fa8" }}>kcal · {m.pct}%</div>
                        </div>
                      </div>
                  ))}
                </div>
            )}

            {/* Food Guide */}
            {tab === "guide" && (() => {
              const g = result.foodGuide;
              const cards = [
                { icon: "🥩", title: "เนื้อสัตว์ (ชั่งดิบ)", border: "#f97316", badge: "#fff7ed", badgeText: "#ea580c", big: `${g.meatG}g`, sub: `≈ ${g.meatHandfuls} ฝ่ามือ`, items: null },
                { icon: "🍚", title: "ข้าวสวยหุงสุก", border: "#eab308", badge: "#fefce8", badgeText: "#ca8a04", big: `${g.riceCooked}g`, sub: `≈ ${g.riceScoops} ทัพพี`, items: null },
                {
                  icon: "🫒", title: "ไขมันดี", border: "#22c55e", badge: null, badgeText: "#16a34a", big: null, sub: null,
                  items: [
                    { label: "น้ำมันมะกอก / รำข้าว", val: `${g.oilG}g ≈ ${g.oilTbsp} ช้อน` },
                    { label: "อัลมอนด์อบ", val: `${g.almondG}g ≈ ${g.almondPcs} เม็ด` },
                  ],
                },
                { icon: "💧", title: "น้ำดื่มต่อวัน", border: "#38bdf8", badge: "#f0f9ff", badgeText: "#0284c7", big: `${g.waterL} ลิตร`, sub: `≈ ${g.waterCups} แก้ว (250ml)`, items: null },
              ];
              return (
                  <div>
                    {cards.map((c, ci) => (
                        <div key={ci} style={{ background: "#fff", borderRadius: 18, padding: "18px 16px", border: `2px solid ${c.border}`, marginBottom: 14 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: c.badge || "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{c.icon}</div>
                            <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>
                        {c.title}{c.title === "ไขมันดี" && <span style={{ fontSize: 11, color: "#999", fontWeight: 400 }}> (เลือกอย่างหนึ่ง)</span>}
                      </span>
                          </div>
                          {c.big && (
                              <>
                                <div style={{ fontSize: 44, fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}>{c.big}</div>
                                <div style={{ marginTop: 8, display: "inline-block", background: c.badge, borderRadius: 20, padding: "4px 14px", fontSize: 13, color: c.badgeText, fontWeight: 600 }}>{c.sub}</div>
                              </>
                          )}
                          {c.items && (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {c.items.map((item, ii) => (
                                    <div key={ii} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4", borderRadius: 10, padding: "9px 12px" }}>
                                      <span style={{ fontSize: 13, color: "#333" }}>{item.label}</span>
                                      <span style={{ fontSize: 13, fontWeight: 700, color: c.badgeText }}>{item.val}</span>
                                    </div>
                                ))}
                              </div>
                          )}
                        </div>
                    ))}
                    <div style={{ textAlign: "center", fontSize: 12, color: "#5a8fa8", lineHeight: 1.8, padding: "0 4px 8px" }}>
                      ตัวเลขถูกปัดเศษเพื่อเตรียมอาหารได้ง่าย · ทานผักใบเขียวได้ไม่อั้น · ประเมินผลทุก 2 สัปดาห์
                    </div>
                  </div>
              );
            })()}
          </>}
        </div>

        {showA2HS && <AddToHomeScreen onDismiss={dismissA2HS} />}
      </div>
  );
}