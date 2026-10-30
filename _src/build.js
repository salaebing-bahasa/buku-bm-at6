// สร้างเว็บไซต์หนังสือเรียนภาษามลายู (หลักสูตรอิสลามศึกษาตอนต้น) จากไฟล์ข้อมูลเดียวกับหนังสือ Word
// ไฟล์ข้อมูลอยู่ใน _src/data/ (ใช้ไฟล์ .js ไฟล์แรกที่พบ)
// วิธีใช้:  node _src/build.js   (รันที่โฟลเดอร์หลักของ repo)
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = fs.readdirSync(path.join(__dirname, "data")).filter((f) => f.endsWith(".js"))[0];
const book = require("./data/" + DATA);
const G = book.grade;
const N = book.units.length;
const GOATCOUNTER = `buku-bm-at${G}`; // รหัสเว็บไซต์ใน GoatCounter (สถิติผู้เข้าชม)
const REPO = book.repo || `buku-bm-at${G}`; // ชื่อ repo บน GitHub
const SITE = `https://salaebing-bahasa.github.io/${REPO}/`; // ที่อยู่เว็บไซต์ (ใช้กับ SEO และ sitemap)
const GOOGLE_VERIFY = ""; // รหัสยืนยันจาก Google Search Console (ถ้ามี)
const BOOK_MS = `Buku Teks Bahasa Melayu Tahun ${G}`;
const BOOK_TH = `หนังสือเรียนภาษามลายู อต.${G}`;
const AUTHOR = { "@type": "Person", name: "Muhammad Salaebing", alternateName: "ผศ.มูหำหมัด สาแลบิง", jobTitle: "Assistant Professor", affiliation: { "@type": "CollegeOrUniversity", name: "Thaksin University", alternateName: "มหาวิทยาลัยทักษิณ" } };
const SITEMAP = []; // หน้าที่จะใส่ใน sitemap.xml

const thNum = (n) => String(n); // ใช้เลขอารบิก
const pad = (n) => String(n).padStart(2, "0");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const AR = "\\u0600-\\u06FF\\u0750-\\u077F\\uFB50-\\uFDFF\\uFE70-\\uFEFF";
const AR_RUN = new RegExp(`[${AR}]+(?:\\s+[${AR}]+)*`, "g");
const AR_ONLY = new RegExp(`^[${AR}\\s/]+$`);
const hasAr = (s) => new RegExp(`[${AR}]`).test(s);

// **ตัวหนา**  *ตัวเอียง*  และห่ออักษรยาวีด้วย span ที่อ่านจากขวาไปซ้าย
// ข้อความสองภาษาในไฟล์ข้อมูลเขียนแบบ "มลายู||ไทย" → แสดงมลายูบรรทัดบน ไทยบรรทัดล่าง
function md(s) {
  const parts = String(s).split("||");
  // บรรทัดไทยไม่ต้องมีช่องเติมคำซ้ำ (ใช้ … แทน) เพื่อไม่ให้นักเรียนเขียนสองครั้ง
  if (parts.length === 2) return bi(md1(parts[0].trim()), md1(parts[1].trim().replace(/_{3,}/g, "…")));
  return md1(s);
}
const msPart = (s) => String(s).split("||")[0];
function md1(s) {
  let h = esc(s);
  h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
  h = h.replace(AR_RUN, (m) => `<span class="jw" lang="ms-Arab" dir="rtl">${m}</span>`);
  h = h.replace(/_{3,}/g, '<span class="blank" aria-label="ช่องว่าง"></span>');
  return h;
}
const plain = (s) => String(s).replace(/\*\*?/g, "");
// หลักการสะกดอักษรยาวีที่ใช้ทั้งชุด อต.1–อต.4
const EJAAN = ["Ejaan Jawi dalam buku ini berdasarkan kaedah ejaan Jawi dalam <em>Pedoman Umum Ejaan Jawi Bahasa Melayu</em> terbitan Dewan Bahasa dan Pustaka (DBP).",
  "การสะกดอักษรยาวีในหนังสือเล่มนี้ใช้หลักการสะกดตาม <em>Pedoman Umum Ejaan Jawi Bahasa Melayu</em> ของ Dewan Bahasa dan Pustaka (DBP)"];
const ejaanBox = () => `<aside class="box ejaan"><p class="box-t">${bi("Kaedah ejaan Jawi", "หลักการสะกดอักษรยาวี")}</p><p lang="ms">${EJAAN[0]}</p><p class="tr">${EJAAN[1]}</p></aside>`;
// ภาพประกอบคำศัพท์: assets/gambar/<คำ>.svg (ใช้คำแรกก่อนเครื่องหมาย /)
const slug = (w) => plain(w).split("/")[0].trim().toLowerCase().replace(/\s+/g, "-");
const imgOf = (w) => (fs.existsSync(path.join(ROOT, "assets", "gambar", slug(w) + ".svg")) ? slug(w) : "");
const picTag = (w, base, size) => { const g = imgOf(w); return g ? `<img class="pic" src="${base}assets/gambar/${g}.svg" alt="" width="${size}" height="${size}" loading="lazy" decoding="async">` : ""; };
// ป้ายสองภาษา: มลายูก่อน ไทยตามหลัง
const bi = (ms, th) => `<span class="bi"><span lang="ms">${ms}</span><span class="tr">${th}</span></span>`;
// หัวข้อในข้อมูลที่เขียนแบบ "มลายู  ไทย" (เว้นสองช่อง) แยกเป็นสองบรรทัด
const split2 = (t, f) => { const m = String(t).split(/\s{2,}/); return m.length === 2 ? f(md(m[0]), md(m[1])) : md(t); };
const hBi = (ms, th) => `<span lang="ms">${ms}</span><span class="h-th">${th}</span>`;
const pBi = (ms, th, cls = "") => `<div class="dw${cls ? " " + cls : ""}"><p lang="ms">${ms}</p><p class="tr">${th}</p></div>`;

const SPEAK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const DL_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const speakBtn = (text, label) => `<button type="button" class="say" data-say="${esc(plain(text))}" aria-label="ฟังเสียง ${esc(label || plain(text))}" title="ฟังเสียง">${SPEAK_ICON}</button>`;

// ---------------------------------------------------------------- บล็อกเนื้อหา
function renderBlock(b) {
  switch (b.type) {
    case "h": return `<h4>${md(b.text)}</h4>`;
    case "p": return `<p>${md(b.text)}</p>`;
    case "bullets": return `<ul class="bul">${b.items.map((i) => `<li>${md(i)}</li>`).join("")}</ul>`;
    case "vocab": {
      const hasPic = b.rows.some((r) => imgOf(r[0]));
      const picH = hasPic ? `<th class="pic-c">${bi("Gambar", "ภาพ")}</th>` : "";
      const head = b.noJawi ? `<th>#</th>${picH}<th>Bahasa Melayu</th><th>${bi("Maksud", "ความหมาย")}</th>` : `<th>#</th>${picH}<th>Rumi</th><th class="jw-h">Jawi</th><th>${bi("Maksud", "ความหมาย")}</th>`;
      const rows = b.rows.map((r, i) => {
        const [ms, a, c] = r;
        const jw = b.noJawi ? "" : `<td class="jw-cell">${md(a)}</td>`;
        const th = b.noJawi ? a : c;
        const picC = hasPic ? `<td class="pic-c">${picTag(ms, "../", 52)}</td>` : "";
        return `<tr><td class="n">${thNum(i + 1)}</td>${picC}<td class="ms"><span>${md(ms)}</span>${speakBtn(ms)}${b.noJawi ? "" : `<span class="jw-in">${md(a)}</span>`}</td>${jw}<td>${md(th)}</td></tr>`;
      }).join("");
      return `<div class="tbl"><table class="vocab"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    case "table": {
      const big = (ci) => b.sizes && b.sizes[ci] && b.sizes[ci] >= 40;
      const rows = b.rows.map((r) => `<tr>${r.map((c, ci) => {
        const cls = [];
        if (AR_ONLY.test(c)) cls.push("jw-cell");
        if (big(ci)) cls.push("big");
        if (b.bolds && b.bolds[ci]) cls.push("b");
        return `<td${cls.length ? ` class="${cls.join(" ")}"` : ""}>${md(c)}</td>`;
      }).join("")}</tr>`).join("");
      return `<div class="tbl"><table><thead><tr>${b.head.map((h) => `<th>${md(h)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    case "letters": {
      const tiles = b.items.map(([l, name]) => {
        const jawi = hasAr(l);
        const say = jawi ? name : l.split(" ")[0].toLowerCase();
        return `<li><button type="button" class="tile${jawi ? " is-jw" : ""}" data-say="${esc(say)}" aria-label="${esc(jawi ? `อักษร ${name}` : `อักษร ${l}`)}"><span class="glyph"${jawi ? ' lang="ms-Arab" dir="rtl"' : ""}>${esc(l)}</span>${name ? `<span class="nm">${esc(name)}</span>` : ""}</button></li>`;
      }).join("");
      return `<p class="hint">${bi("Sentuh huruf untuk mendengar sebutan", "แตะที่ตัวอักษรเพื่อฟังเสียง")}</p><ul class="letters${b.items.some((i) => hasAr(i[0])) ? " rtl" : ""}" style="--cols:${b.cols || 6}">${tiles}</ul>`;
    }
    case "dialog": return `<figure class="dialog">${b.title ? `<figcaption>${md(b.title)}</figcaption>` : ""}${b.lines.map(([who, t]) => `<div class="turn"><span class="who">${esc(who)}</span><span class="said">${md(t)} ${speakBtn(msPart(t).replace(/\(.*?\)/g, ""), who)}</span></div>`).join("")}</figure>`;
    case "reading": {
      const all = b.paras.map(plain).join(" ");
      return `<article class="reading">${b.title ? `<h4>${md(b.title)}</h4>` : ""}${b.paras.map((p) => `<p>${md(p)}</p>`).join("")}<button type="button" class="btn-ghost say-long" data-say="${esc(all)}">${SPEAK_ICON}<span>${bi("Dengar semua", "ฟังทั้งเรื่อง")}</span></button></article>`;
    }
    case "pantun": return `<blockquote class="pantun">${b.lines.map((l, i) => `${md(l)}${(i + 1) % 4 === 0 && i < b.lines.length - 1 ? "</blockquote><blockquote class=\"pantun\">" : "<br>"}`).join("")}</blockquote>`;
    case "note": return `<aside class="box note"><p class="box-t">${(b.title ? split2(b.title, bi) : bi("Catatan", "หมายเหตุ"))}</p>${b.lines.map((l) => `<p>${md(l)}</p>`).join("")}</aside>`;
    case "pattern": return `<aside class="box pattern"><p class="box-t">${split2(b.title || "Pola ayat  รูปประโยค", bi)}</p>${b.lines.map((l) => `<p>${md(l)}</p>`).join("")}</aside>`;
    default: throw new Error("บล็อกไม่รู้จัก: " + b.type);
  }
}

function renderLatihan(lat) {
  return `<ol class="latihan">${lat.map((x) => {
    let body = "";
    if (x.items) body += `<ol class="items">${x.items.map((i) => `<li>${md(i)}</li>`).join("")}</ol>`;
    if (x.table) body += renderBlock({ type: "table", head: x.table.head, rows: x.table.rows });
    if (x.lines) body += `<div class="write" style="--n:${x.lines}" aria-hidden="true"></div>`;
    if (x.answers) body += `<details class="ans"><summary>${bi("Lihat jawapan", "ดูเฉลย")}</summary><p>${md(x.answers)}</p></details>`;
    return `<li><p class="q">${md(x.q)}</p>${body}</li>`;
  }).join("")}</ol>`;
}

// คำศัพท์ทั้งหมดของบท (ใช้ทำแบบทดสอบตนเองและอภิธานศัพท์)
function unitVocab(u) {
  const out = [];
  u.sections.forEach((s) => s.blocks.forEach((b) => {
    // ตารางที่มีคอลัมน์ Rumi/คำ + Jawi + ความหมาย ก็นับเป็นคำศัพท์ด้วย
    if (b.type === "table") {
      const H = b.head.map((h) => plain(h).split("||").pop().trim());
      const m = H.findIndex((x) => x === "Rumi" || x === "คำ"), j = H.indexOf("Jawi"), t = H.indexOf("ความหมาย");
      if (m < 0 || j < 0 || t < 0) return;
      b.rows.forEach((r) => out.push({ ms: plain(r[m]), jw: r[j], th: r[t] }));
      return;
    }
    if (b.type !== "vocab") return;
    b.rows.forEach((r) => {
      const ms = plain(r[0]);
      if (/[?!…]|\.\.\./.test(ms)) return;
      const v = b.noJawi ? { ms, th: r[1] } : { ms, jw: r[1], th: r[2] };
      if (imgOf(ms)) v.img = imgOf(ms);
      out.push(v);
    });
  }));
  return out;
}

// ---------------------------------------------------------------- โครงหน้า
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree:wght@500;600;700&family=Noto+Naskh+Arabic:wght@400;600&family=Sarabun:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">';

function page({ title, desc, base, body, current, path: urlPath, ld }) {
  const url = SITE + urlPath;
  SITEMAP.push(url);
  const nav = [["index.html", "Laman Utama", "หน้าแรก", "utama"], ["index.html#pelajaran", "Pelajaran", "บทเรียน", "pelajaran"], ["glosari.html", "Glosari", "อภิธานศัพท์", "glosari"], ["index.html#guru", "Untuk Guru", "สำหรับครู", "guru"]]
    .map(([h, m, t, k]) => `<a href="${base}${h}"${current === k ? ' aria-current="page"' : ""}><span lang="ms">${m}</span><small>${t}</small></a>`).join("");
  return `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://gc.zgo.at; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://${GOATCOUNTER}.goatcounter.com; connect-src 'self' https://${GOATCOUNTER}.goatcounter.com; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="author" content="Muhammad Salaebing (ผศ.มูหำหมัด สาแลบิง)">
${GOOGLE_VERIFY ? `<meta name="google-site-verification" content="${esc(GOOGLE_VERIFY)}">\n` : ""}<meta property="og:type" content="website">
<meta property="og:site_name" content="${BOOK_MS} · ${BOOK_TH}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}assets/share.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="th_TH">
<meta property="og:locale:alternate" content="ms_MY">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
${FONTS}
<link rel="stylesheet" href="${base}assets/style.css">
<link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml">
</head>
<body>
<a class="skip" href="#isi">${bi("Langkau ke kandungan", "ข้ามไปยังเนื้อหา")}</a>
<header class="site-head">
  <a class="brand" href="${base}index.html"><span class="mark" aria-hidden="true"></span><span>Bahasa Melayu อต.${G}<small lang="ms">Kurikulum Pendidikan Islam Peringkat Awal</small><small>หลักสูตรอิสลามศึกษาตอนต้น</small></span></a>
  <nav aria-label="Menu utama · เมนูหลัก">${nav}</nav>
</header>
<main id="isi">
${body}
</main>
<footer class="site-foot">
  <div class="foot-ms" lang="ms">
    <p>Buku Teks Bahasa Melayu Tahun ${G} Kurikulum Pendidikan Islam Peringkat Awal</p>
    <p>Disusun oleh Asst. Prof. Muhammad Salaebing · Program Bahasa Melayu, Fakulti Kemanusiaan dan Sains Sosial, Universiti Thaksin</p>
  </div>
  <div class="foot-th">
    <p>หนังสือเรียนภาษามลายู ชั้นปีที่ ${G} (อต.${G}) หลักสูตรอิสลามศึกษาตอนต้น</p>
    <p>เรียบเรียงโดย ผศ.มูหำหมัด สาแลบิง · สาขาวิชาภาษามลายู คณะมนุษยศาสตร์และสังคมศาสตร์ มหาวิทยาลัยทักษิณ</p>
    <p class="copy">© ${new Date().getFullYear()} Muhammad Salaebing · <span lang="ms">Hak cipta terpelihara</span> · สงวนลิขสิทธิ์</p>
  </div>
</footer>
<script src="${base}assets/app.js"></script>
<script data-goatcounter="https://${GOATCOUNTER}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- ส่วนประกอบแบบหนังสือ
const ORN = '<p class="orn" aria-hidden="true"><span></span></p>';
const running = (right) => `<p class="running" aria-hidden="true"><span lang="ms">${BOOK_MS}</span><span>${right}</span></p>`;
const folio = (f) => `<p class="folio" aria-hidden="true"><span>${f}</span></p>`;

// ---------------------------------------------------------------- หน้าบทเรียน
function unitPage(u, i) {
  const n = i + 1;
  const prev = i > 0 ? book.units[i - 1] : null;
  const next = book.units[i + 1] || null;
  const vocab = unitVocab(u);
  const chips = u.indicators.map((k) => `<li title="${esc(book.indicators_ms[k - 1] + " · " + book.indicators[k - 1])}">อต.${thNum(book.grade)}/${thNum(k)}</li>`).join("");
  const sections = u.sections.map((s) => `<section class="sec"><h3>${split2(s.title, hBi)}</h3>${s.blocks.map(renderBlock).join("\n")}</section>`).join("\n");
  const quiz = vocab.length >= 4 ? `
<section class="sec kuiz" id="kuiz">
  <h3>${hBi("Kuiz Kendiri", "ทดสอบตนเอง")}</h3>
  <p class="hint">${bi("Pilih maksud yang betul. Kuiz boleh diulang; soalan dipilih secara rawak setiap kali.", "เลือกความหมายที่ถูกต้อง ทำซ้ำได้หลายรอบ ข้อจะสุ่มใหม่ทุกครั้ง")}</p>
  <div class="quiz" data-vocab="${esc(JSON.stringify(vocab))}"></div>
</section>
<section class="sec" id="kad">
  <h3>${hBi("Kad Imbas", "บัตรคำ")}</h3>
  <p class="hint">${bi("Sentuh kad untuk melihat maksud", "แตะบัตรเพื่อพลิกดูความหมาย")}</p>
  <div class="cards" data-vocab="${esc(JSON.stringify(vocab))}"></div>
</section>` : "";
  const body = `
<nav class="crumb" aria-label="Lokasi · ตำแหน่ง"><p lang="ms"><a href="../index.html">Laman Utama</a> / <a href="../index.html#pelajaran">Kandungan</a> / <span>Pelajaran ${n}</span></p><p class="tr"><a href="../index.html">หน้าแรก</a> / <a href="../index.html#pelajaran">สารบัญ</a> / <span>บทที่ ${thNum(n)}</span></p></nav>
<article class="sheet">
${running(`Pelajaran ${n} · ${esc(plain(u.title))}`)}
<header class="opener">
  <p class="op-k">${bi("Pelajaran", "บทที่")}</p>
  <p class="op-n" aria-hidden="true">${n}</p>
  ${ORN}
  <h1>${md(u.title)}</h1>
  <p class="th-title">${md(u.th)}</p>
  <ul class="chips" aria-label="Petunjuk · ตัวชี้วัด">${chips}</ul>
  <a class="btn-ghost dl" href="../pdf/pelajaran-${pad(n)}.pdf" download="Bahasa-Melayu-AT${G}-Pelajaran-${pad(n)}.pdf">${DL_ICON}${bi("Muat turun PDF", "ดาวน์โหลด PDF")}</a>
</header>
<aside class="box obj"><p class="box-t">${bi("Objektif Pembelajaran", "จุดประสงค์การเรียนรู้")}</p><ul>${u.objectives.map((o) => `<li>${md(o)}</li>`).join("")}</ul></aside>
${sections}
<section class="sec" id="latihan"><h3>${hBi("Latihan", "แบบฝึกหัด")}</h3>${renderLatihan(u.latihan)}</section>
${quiz}
<aside class="box nilai"><p class="box-t">${bi("Nilai Murni", "ข้อคิด")}</p>${u.nilai_ms ? `<p lang="ms">${md(u.nilai_ms)}</p><p class="tr nilai-th">${md(u.nilai)}</p>` : `<p>${md(u.nilai)}</p>`}</aside>
${folio(n)}
</article>
<nav class="pager" aria-label="Pelajaran sebelum dan seterusnya · บทก่อนหน้าและถัดไป">
  ${prev ? `<a class="prev" href="${pad(n - 1)}.html" rel="prev"><small>${bi("← Pelajaran sebelum", "บทก่อนหน้า")}</small>${esc(prev.title)}</a>` : `<a class="prev" href="../index.html#pelajaran"><small>${bi("← Kandungan", "สารบัญ")}</small>${bi("Kandungan", "สารบัญ")}</a>`}
  ${next ? `<a class="next" href="${pad(n + 1)}.html" rel="next"><small>${bi("Pelajaran seterusnya →", "บทถัดไป")}</small>${esc(next.title)}</a>` : `<a class="next" href="../glosari.html"><small>${bi("Akhir buku →", "ท้ายเล่ม")}</small>${bi("Glosari", "อภิธานศัพท์")}</a>`}
</nav>
<p class="swipe-hint">${bi("Leret ke kiri atau ke kanan untuk menukar pelajaran", "ปัดซ้ายหรือขวาเพื่อเปลี่ยนบท")}</p>`;
  const objMs = u.objectives.map((o) => plain(msPart(o))).join("; ");
  const ld = {
    "@context": "https://schema.org", "@type": "LearningResource",
    name: `Pelajaran ${n}: ${plain(u.title)} (${u.th})`, description: objMs,
    inLanguage: ["ms", "th"], learningResourceType: "Lesson", educationalLevel: `Tahun ${G} (อต.${G})`,
    teaches: plain(u.title), author: AUTHOR, isAccessibleForFree: true,
    isPartOf: { "@type": "Book", name: `${BOOK_MS} · ${BOOK_TH}`, url: SITE },
    encoding: { "@type": "MediaObject", encodingFormat: "application/pdf", contentUrl: `${SITE}pdf/pelajaran-${pad(n)}.pdf` },
  };
  return page({
    title: `${plain(u.title)} (${u.th}) — Pelajaran ${n} | ${BOOK_MS} · ${BOOK_TH}`,
    desc: `Pelajaran ${n} ${plain(u.title)} · บทที่ ${n} ${u.th} — ${objMs}. บทเรียนภาษามลายู ชั้น อต.${G} พร้อมเสียงอ่าน แบบฝึกหัด และ PDF`,
    base: "../", body, current: "pelajaran", path: `pelajaran/${pad(n)}.html`, ld,
  });
}

// ---------------------------------------------------------------- หน้าแรก
function indexPage(words) {
  const map = book.indicators.map((ind, k) => {
    const us = book.units.map((u, i) => (u.indicators.includes(k + 1) ? i + 1 : 0)).filter(Boolean);
    return `<tr><td class="code">อต.${thNum(book.grade)}/${thNum(k + 1)}</td><td><span lang="ms">${md(book.indicators_ms[k])}</span><span class="td-th">${md(ind)}</span></td><td>${us.map((x) => `<a href="pelajaran/${pad(x)}.html">${thNum(x)}</a>`).join(" ")}</td></tr>`;
  }).join("");
  const toc = [
    ...book.units.map((u, i) => `<li><a href="pelajaran/${pad(i + 1)}.html"><span class="toc-k">${bi(`Pelajaran ${i + 1}`, `บทที่ ${thNum(i + 1)}`)}</span><span class="toc-t">${md(u.title)}<small>${md(u.th)}</small></span><span class="toc-dots"></span><span class="toc-pg">${i + 1}</span></a></li>`),
  ].join("");
  const extra = [["#pengenalan", "Kata Pengantar", "คำนำ", "ii"], ["#standard", "Standard dan Petunjuk", "มาตรฐานและตัวชี้วัด", "iii"], ["#guru", "Untuk Guru", "สำหรับครู", "iv"]]
    .map(([h, m, t, f]) => `<li class="toc-front"><a href="${h}"><span class="toc-t"><span lang="ms">${m}</span><small>${t}</small></span><span class="toc-dots"></span><span class="toc-pg">${f}</span></a></li>`).join("");
  const body = `
<section class="cover-wrap">
  <div class="cover">
    <div class="cv-frame">
      <p class="cv-top"><span lang="ms">Kurikulum Pendidikan Islam Peringkat Awal</span><span class="cv-th">หลักสูตรอิสลามศึกษาตอนต้น</span></p>
      <div class="cv-mid">
        <p class="cv-year"><span lang="ms">Tahun ${G}</span> · อต.${G}</p>
        <h1><span lang="ms">Buku Teks<br>Bahasa Melayu</span></h1>
        <p class="cv-jw" lang="ms-Arab" dir="rtl">بوکو تيکس بهاس ملايو</p>
        <p class="cv-th-title">หนังสือเรียนภาษามลายู</p>
      </div>
      <p class="cv-author"><span lang="ms">Asst. Prof. Muhammad Salaebing</span><span class="cv-th">ผศ.มูหำหมัด สาแลบิง</span></p>
    </div>
  </div>
  <div class="cover-side">
    ${pBi(book.lede_ms, book.lede, "lede")}
    <div class="actions"><a class="btn" href="#pelajaran">${bi("Buka buku", "เปิดหนังสือ")}</a><a class="btn-ghost" href="pelajaran/01.html">${bi("Mula Pelajaran 1", "เริ่มบทที่ 1")}</a></div>
    <figure class="word" aria-live="polite">
      <p class="word-label">${bi("Perkataan hari ini", "คำศัพท์วันนี้")}</p>
      <img class="w-pic" id="w-pic" src="" alt="" width="84" height="84" hidden>
      <p class="w-ms" id="w-ms">—</p>
      <p class="w-jw jw" id="w-jw" lang="ms-Arab" dir="rtl"></p>
      <p class="w-th" id="w-th"></p>
      <div class="word-foot"><button type="button" class="btn-ghost" id="w-say">${SPEAK_ICON}<span>${bi("Dengar", "ฟังเสียง")}</span></button><button type="button" class="btn-ghost" id="w-next">${bi("Perkataan lain", "คำอื่น")}</button></div>
    </figure>
  </div>
  <script type="application/json" id="words">${JSON.stringify(words).replace(/</g, "\\u003c")}</script>
</section>

<article class="sheet" id="pelajaran">
  ${running(bi("Kandungan", "สารบัญ"))}
  <h2 class="sheet-title">${hBi("Kandungan", "สารบัญ")}</h2>
  ${ORN}
  <ol class="toc">${extra}${toc}<li class="toc-front"><a href="glosari.html"><span class="toc-t"><span lang="ms">Glosari</span><small>อภิธานศัพท์</small></span><span class="toc-dots"></span><span class="toc-pg">A–Z</span></a></li></ol>
  ${folio("i")}
</article>

<article class="sheet" id="pengenalan">
  ${running(bi("Kata Pengantar", "คำนำ"))}
  <h2 class="sheet-title">${hBi("Kata Pengantar", "คำนำ")}</h2>
  ${ORN}
  ${book.preface.map((p, i) => pBi(md(book.preface_ms[i]), md(p), "prose")).join("")}
  ${ejaanBox()}
  <p class="sign"><span lang="ms">Asst. Prof. Muhammad Salaebing</span><span class="tr">ผศ.มูหำหมัด สาแลบิง · ผู้เรียบเรียง</span></p>
  ${folio("ii")}
</article>

<article class="sheet" id="standard">
  ${running(bi("Standard dan Petunjuk", "มาตรฐานและตัวชี้วัด"))}
  <h2 class="sheet-title">${hBi("Standard dan Petunjuk", "มาตรฐานและตัวชี้วัด")}</h2>
  ${ORN}
  <aside class="box"><p class="box-t">${bi("Standard Bahasa Melayu", "มาตรฐาน มย")}</p><p lang="ms">Menggunakan proses mendengar, bertutur, membaca dan menulis serta memahami prinsip penggunaan bahasa Melayu untuk berkomunikasi, belajar, meningkatkan nilai kehidupan seharian dan mencari ilmu daripada sumber pembelajaran secara kreatif, serta mempunyai tabiat suka membaca.</p><p class="tr">ใช้กระบวนการฟัง พูด อ่าน เขียน เข้าใจหลักการในการใช้ภาษามลายูเพื่อการสื่อสาร การเรียนรู้ เพิ่มคุณค่าในการดำรงชีวิตประจำวันและศึกษาค้นคว้าความรู้จากแหล่งเรียนรู้อย่างสร้างสรรค์ และมีนิสัยรักการอ่าน</p></aside>
  <div class="tbl"><table class="map"><thead><tr><th>${bi("Kod", "รหัส")}</th><th>${bi(`Petunjuk Tahun ${G}`, `ตัวชี้วัดชั้นปีที่ ${G}`)}</th><th>${bi("Pelajaran", "บทที่")}</th></tr></thead><tbody>${map}</tbody></table></div>
  ${folio("iii")}
</article>

<article class="sheet" id="guru">
  ${running(bi("Untuk Guru", "สำหรับครู"))}
  <h2 class="sheet-title">${hBi("Untuk Guru", "สำหรับครู")}</h2>
  ${ORN}
  <ul class="bul prose guru">
    ${[
      ["Butang pembesar suara menggunakan suara bahasa Melayu pada peranti (sistem baca teks telefon atau komputer). Jika peranti tiada suara bahasa Melayu, sistem akan menggunakan suara bahasa Indonesia. Guru digalakkan menyebut perkataan untuk murid, dan menggunakan butang ini untuk ulang kaji.",
       "ปุ่มลำโพงใช้เสียงอ่านภาษามลายูของเครื่อง (ระบบอ่านออกเสียงของโทรศัพท์หรือคอมพิวเตอร์) ถ้าเครื่องไม่มีเสียงภาษามลายู ระบบจะใช้เสียงภาษาอินโดนีเซียแทน ครูควรออกเสียงให้นักเรียนฟังเป็นหลัก และใช้ปุ่มนี้เพื่อทบทวน"],
      ["Setiap latihan dalam laman web ini sama dengan buku (fail Word). Butang “Lihat jawapan” di bawah setiap soalan digunakan untuk menyemak jawapan selepas selesai menjawab.",
       "แบบฝึกหัดในเว็บไซต์ตรงกับหนังสือเล่ม (ไฟล์ Word) ทุกข้อ ปุ่ม “ดูเฉลย” ใต้แต่ละข้อใช้ตรวจคำตอบหลังทำเสร็จแล้ว"],
      ["“Kuiz Kendiri” dan “Kad Imbas” di akhir pelajaran dipilih secara rawak daripada perkataan pelajaran itu, sesuai untuk ulang kaji di rumah.",
       "“ทดสอบตนเอง” และ “บัตรคำ” ท้ายบทสุ่มจากคำศัพท์ของบทนั้น เหมาะสำหรับทบทวนที่บ้าน"],
      book.guru_projector || ["Laman web ini boleh dipaparkan melalui projektor di dalam kelas. Tulisannya bersaiz besar, dan butang pembesar suara di sebelah perkataan, dialog atau bacaan boleh disentuh untuk mendengar sebutan.",
       "เปิดบนโปรเจกเตอร์ในห้องเรียนได้ ตัวอักษรขนาดใหญ่ และแตะปุ่มลำโพงข้างคำศัพท์ บทสนทนา หรือเรื่องอ่าน เพื่อฟังเสียงได้"],
    ].map(([m, t]) => `<li><p lang="ms">${m}</p><p class="tr">${t}</p></li>`).join("\n    ")}
  </ul>
  ${folio("iv")}
</article>`;
  return page({
    title: `${BOOK_MS} · ${BOOK_TH} — Kurikulum Pendidikan Islam Peringkat Awal · หลักสูตรอิสลามศึกษาตอนต้น`,
    desc: `Buku teks Bahasa Melayu Tahun ${G} dalam tulisan Rumi dan Jawi: ${N} pelajaran, sebutan audio, latihan, kuiz dan PDF. หนังสือเรียนภาษามลายู ชั้นปีที่ ${G} (อต.${G}) หลักสูตรอิสลามศึกษาตอนต้น ${N} บท พร้อมเสียงอ่าน แบบฝึกหัด แบบทดสอบ และ PDF`,
    base: "", body, current: "utama", path: "",
    ld: { "@context": "https://schema.org", "@type": "Book", name: BOOK_MS, alternateName: BOOK_TH, url: SITE, inLanguage: ["ms", "th"], author: AUTHOR,
      educationalLevel: `Tahun ${G} (อต.${G})`, audience: { "@type": "EducationalAudience", educationalRole: "student" }, isAccessibleForFree: true,
      description: `Buku teks Bahasa Melayu Tahun ${G}, Kurikulum Pendidikan Islam Peringkat Awal · หนังสือเรียนภาษามลายู ชั้นปีที่ ${G} หลักสูตรอิสลามศึกษาตอนต้น`,
      hasPart: book.units.map((u, i) => ({ "@type": "LearningResource", position: i + 1, name: `${plain(u.title)} (${u.th})`, url: `${SITE}pelajaran/${pad(i + 1)}.html` })) },
  });
}

// ---------------------------------------------------------------- อภิธานศัพท์
function glosariPage() {
  const map = new Map();
  book.units.forEach((u, i) => unitVocab(u).forEach((v) => {
    const k = v.ms.toLowerCase();
    if (!map.has(k)) map.set(k, { ...v, unit: i + 1 });
  }));
  const all = [...map.values()].sort((a, b) => a.ms.localeCompare(b.ms, "ms"));
  const rows = all.map((v) => `<tr data-q="${esc((v.ms + " " + v.th).toLowerCase())}"><td class="ms">${v.img ? `<img class="pic" src="assets/gambar/${v.img}.svg" alt="" width="34" height="34" loading="lazy" decoding="async">` : ""}<span>${esc(v.ms)}</span>${speakBtn(v.ms)}</td><td class="jw-cell">${v.jw ? md(v.jw) : ""}</td><td>${esc(v.th)}</td><td class="n"><a href="pelajaran/${pad(v.unit)}.html">${thNum(v.unit)}</a></td></tr>`).join("");
  const body = `
<article class="sheet">
${running(bi("Glosari", "อภิธานศัพท์"))}
<header class="unit-head opener"><p class="op-k">${bi("Akhir buku", "ท้ายเล่ม")}</p><h1>Glosari</h1><p class="th-title">อภิธานศัพท์</p><p class="hint">${bi(`Semua perkataan: ${all.length}, disusun mengikut abjad`, `คำศัพท์ทั้งหมด ${thNum(all.length)} คำ เรียงตามตัวอักษร`)}</p></header>
${ejaanBox()}
<label class="search"><span>${bi("Cari perkataan (bahasa Melayu atau bahasa Thai)", "ค้นหาคำ (ภาษามลายูหรือภาษาไทย)")}</span><input type="search" id="g-q" placeholder="cth. mata · เช่น ครู" autocomplete="off"></label>
<p class="hint" id="g-count" aria-live="polite"></p>
<div class="tbl"><table class="vocab" id="g-table"><thead><tr><th>Rumi</th><th>Jawi</th><th>${bi("Maksud", "ความหมาย")}</th><th>${bi("Pelajaran", "บทที่")}</th></tr></thead><tbody>${rows}</tbody></table></div>
${folio("A–Z")}
</article>`;
  return { html: page({
    title: `Glosari · อภิธานศัพท์ภาษามลายู–ไทย — ${BOOK_MS} · ${BOOK_TH}`,
    desc: `Glosari bahasa Melayu–Thai: ${all.length} perkataan dalam tulisan Rumi dan Jawi beserta sebutan. อภิธานศัพท์ภาษามลายู–ไทย ${all.length} คำ อักษรรูมีและยาวี พร้อมเสียงอ่าน`,
    base: "", body, current: "glosari", path: "glosari.html",
    ld: { "@context": "https://schema.org", "@type": "DefinedTermSet", name: `Glosari Bahasa Melayu Tahun ${G} · อภิธานศัพท์ อต.${G}`, inLanguage: ["ms", "th"], url: SITE + "glosari.html",
      hasDefinedTerm: all.map((v) => ({ "@type": "DefinedTerm", name: v.ms, description: v.th, ...(v.jw ? { alternateName: v.jw } : {}) })) },
  }), all };
}

// ---------------------------------------------------------------- เขียนไฟล์
fs.mkdirSync(path.join(ROOT, "pelajaran"), { recursive: true });
book.units.forEach((u, i) => fs.writeFileSync(path.join(ROOT, "pelajaran", `${pad(i + 1)}.html`), unitPage(u, i)));
const g = glosariPage();
fs.writeFileSync(path.join(ROOT, "glosari.html"), g.html);
fs.writeFileSync(path.join(ROOT, "index.html"), indexPage(g.all));
// sitemap.xml สำหรับ Google
const today = new Date().toISOString().slice(0, 10);
const pdfs = book.units.map((u, i) => `${SITE}pdf/pelajaran-${pad(i + 1)}.pdf`);
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...SITEMAP.sort(), ...pdfs].map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
console.log(`สร้างเว็บไซต์แล้ว: ${book.units.length} บท, คำศัพท์ ${g.all.length} คำ`);
