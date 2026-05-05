# SmartCal Coach

แอปคำนวณแคลอรี่และแผนอาหารส่วนบุคคล

## วิธี Deploy ขึ้น Vercel (ฟรีตลอด)

### ขั้นตอนที่ 1 — ติดตั้ง Node.js
ดาวน์โหลดที่ https://nodejs.org และติดตั้ง LTS version

### ขั้นตอนที่ 2 — ทดสอบบนเครื่องก่อน
```bash
npm install
npm run dev
```
เปิด http://localhost:5173 ดูผลได้เลย

### ขั้นตอนที่ 3 — Push ขึ้น GitHub
1. สมัคร GitHub ที่ https://github.com
2. กด New Repository → ตั้งชื่อ smartcal-coach → Create
3. รันคำสั่งนี้ในโฟลเดอร์โปรเจกต์:

```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/YOUR_USERNAME/smartcal-coach.git
git push -u origin main
```

### ขั้นตอนที่ 4 — Deploy บน Vercel
1. ไปที่ https://vercel.com → Sign up ด้วย GitHub account
2. กด "Add New Project"
3. เลือก repo "smartcal-coach"
4. กด Deploy → รอ 1 นาที
5. ได้ URL เช่น https://smartcal-coach.vercel.app ✅

## Add to Home Screen บน iPhone (ดูเหมือน App จริง)
1. เปิด URL บน Safari
2. กดปุ่ม Share (กล่องมีลูกศรขึ้น)
3. เลือก "Add to Home Screen"
4. กด Add → ได้ icon บน Home Screen เลย
