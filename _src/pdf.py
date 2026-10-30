# สร้างไฟล์ PDF ของแต่ละบทจากหน้าเว็บ (ใช้หลังรัน node _src/build.js แล้ว)
# วิธีใช้:  pip install playwright && playwright install chromium
#           python3 _src/pdf.py      (รันที่โฟลเดอร์หลักของ repo)
import os
import pathlib
import re
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "pdf"
OUT.mkdir(exist_ok=True)
DATA = sorted((ROOT / "_src" / "data").glob("*.js"))[0]
G = re.search(r"grade:\s*(\d+)", DATA.read_text(encoding="utf-8")).group(1)

FOOT = (
    '<div style="width:100%;font:8pt sans-serif;color:#55605A;padding:0 14mm;'
    'display:flex;justify-content:space-between">'
    "<span>Buku Teks Bahasa Melayu Tahun {g} · หนังสือเรียนภาษามลายู อต.{g} · Pelajaran {n} · บทที่ {n}</span>"
    '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'
)

# ถ้าเครื่องโหลด Google Fonts ไม่ได้ ให้ชี้ FONTSOURCE_DIR ไปที่ node_modules/@fontsource
# (npm i @fontsource/sarabun @fontsource/bai-jamjuree @fontsource/noto-naskh-arabic)
LOCAL_FONTS = ""
fs_dir = os.environ.get("FONTSOURCE_DIR")
if fs_dir:
    want = {"sarabun": ["400", "600", "400-italic"], "bai-jamjuree": ["500", "600", "700"], "noto-naskh-arabic": ["400", "600"]}
    for fam, ws in want.items():
        d = pathlib.Path(fs_dir) / fam
        for w in ws:
            css = (d / f"{w}.css").read_text(encoding="utf-8")
            LOCAL_FONTS += css.replace("url(./files/", f"url({(d / 'files').as_uri()}/")

pages = sorted((ROOT / "pelajaran").glob("[0-9][0-9].html"))
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(color_scheme="light")
    for f in pages:
        n = int(f.stem)
        page.goto(f.as_uri(), wait_until="networkidle")
        if LOCAL_FONTS:
            page.add_style_tag(content=LOCAL_FONTS)
        page.evaluate("document.fonts.ready.then(() => true)")
        page.wait_for_timeout(300)
        out = OUT / f"pelajaran-{f.stem}.pdf"
        page.pdf(
            path=str(out),
            format="A4",
            print_background=True,
            prefer_css_page_size=True,
            display_header_footer=True,
            header_template="<span></span>",
            footer_template=FOOT.format(n=n, g=G),
        )
        print("สร้างแล้ว:", out.relative_to(ROOT))
    browser.close()
