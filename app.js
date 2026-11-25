// ====== ตั้งค่า (แก้แค่ 2 ค่านี้) ======
const SHEET_ID = "1iRnvjaoB2uPezKRhLOajlkzCTinPK4p5rTP6hKpuvOo"; // ID ของ Google Sheet (เช็กให้ตรงกับ URL ชีตของคุณ)
const ORDER_API = ""; // URL ของ Apps Script Web App (ใส่ทีหลังได้ ถ้าว่างจะเก็บออเดอร์ไว้ในเครื่องแทน)
const SHOP = { name: "Smile Brush Shop", phone: "02-000-0000", address: "123 ถ.สุขุมวิท กรุงเทพฯ 10110" };
// =====================================

function parseCSV(t) {
  const rows = []; let r = [], c = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
    else if (ch === '"') q = true;
    else if (ch === ",") { r.push(c); c = ""; }
    else if (ch === "\n") { r.push(c); rows.push(r); r = []; c = ""; }
    else if (ch !== "\r") c += ch;
  }
  if (c || r.length) { r.push(c); rows.push(r); }
  const h = rows.shift() || [];
  return rows.filter(x => x.some(v => v)).map(x => Object.fromEntries(h.map((k, i) => [k.trim(), (x[i] || "").trim()])));
}
async function sheet(name) {
  const u = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${name}`;
  const res = await fetch(u); if (!res.ok) throw new Error("โหลดชีต " + name + " ไม่ได้ (เช็กว่าแชร์เป็น Anyone with the link)");
  return parseCSV(await res.text());
}
const getProducts = () => sheet("products");
const localOrders = () => { try { return JSON.parse(localStorage.getItem("orders") || "[]"); } catch { return []; } };
async function getOrders() {
  let remote = []; try { remote = await sheet("orders"); } catch (e) { console.warn(e); }
  return [...remote, ...localOrders()];
}
const money = n => Number(n || 0).toLocaleString("th-TH");
const imgSrc = f => "images/" + f;
