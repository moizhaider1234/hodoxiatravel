"""Searches Openverse (free-licence photos) for each website slot, downloads a few candidates,
and builds contact sheets so they can be reviewed. Run by .github/workflows/fetch-photos.yml"""
import os, io, json, time, requests
from PIL import Image, ImageDraw

SLOTS = {
 "round2": {
  "yvz": ["Red Lake Ontario", "Sioux Lookout Ontario", "northwestern Ontario lake"],
  "occ-wedding": ["wedding car", "bride and groom car"],
  "occ-roadshow": ["businessmen suits", "business people walking"],
  "occ-conference": ["conference hall", "business conference"],
  "occ-evening": ["gala dinner", "red carpet evening"],
  "occ-daytour": ["sightseeing bus", "city tour"],
  "occ-meetgreet": ["airport arrivals hall", "airport driver sign"],
  "who": ["chauffeur", "limousine driver"],
  "extra-sedan": ["Mercedes-Benz S-Class", "luxury sedan"],
  "extra-hotel": ["hotel entrance", "luxury hotel lobby"],
  "extra-lounge": ["airport lounge", "business class cabin"],
  "extra-highway": ["Trans-Canada Highway", "Canadian highway"],
  "extra-suv": ["Cadillac Escalade", "Chevrolet Suburban"],
  "extra-interior2": ["limousine interior", "car interior leather"],
  "extra-night": ["city street night traffic"],
  "svc2-airport": ["airplane takeoff sunset", "airport terminal night"],
  "svc2-corporate": ["business meeting boardroom", "skyscraper business district"],
  "svc2-wedding": ["wedding bouquet", "wedding reception"],
  "svc2-hourly": ["wristwatch", "city street evening"],
  "svc2-citytocity": ["highway landscape road", "mountain road Canada"],
  "nx-book": ["hand holding smartphone", "smartphone app"],
  "nx-coverage": ["Canadian Rockies lake", "Canada autumn landscape"],
  "nx-contact": ["customer service headset", "telephone call"],
  "bg-hero": ["luxury car night city", "limousine night"],
  "bg-cta": ["city skyline dusk", "airport runway dusk"],
 },
}
PER_QUERY = 4
UA = {"User-Agent": "HodoxiaPhotoBot/1.0 (https://github.com/moizhaider1234/hodoxiatravel; image research for a chauffeur website)"}
os.makedirs("sheets", exist_ok=True)
LOG = open("sheets/log.txt", "w")
def log(*a):
    m = " ".join(str(x) for x in a); print(m); LOG.write(m + "\n"); LOG.flush()

def search(q):
    for attempt in range(3):
        try:
            r = requests.get("https://api.openverse.org/v1/images/", headers=UA, timeout=30, params={
                "q": q, "license_type": "commercial", "category": "photograph",
                "size": "large", "page_size": 20})
            if r.status_code == 429: time.sleep(20); continue
            r.raise_for_status(); return r.json().get("results", [])
        except Exception as e:
            log("search fail", q, e); time.sleep(5)
    return []


BAD = ("map", "logo", "flag", "diagram", "coat", "seal", "locator", "plan", "chart", "poster", "stamp", "crest", "icon", "svg", "panorama_of", "interior")
def commons(q):
    out = []
    try:
        r = requests.get("https://commons.wikimedia.org/w/api.php", headers=UA, timeout=30, params={
            "action": "query", "format": "json", "generator": "search", "gsrsearch": q + " filetype:bitmap",
            "gsrnamespace": 6, "gsrlimit": 25, "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata", "iiurlwidth": 1600})
        r.raise_for_status()
        pages = (r.json().get("query") or {}).get("pages") or {}
        for p in sorted(pages.values(), key=lambda x: x.get("index", 99)):
            ii = (p.get("imageinfo") or [{}])[0]
            title = p.get("title", "")
            if ii.get("mime") != "image/jpeg" or ii.get("width", 0) < 1400: continue
            if ii.get("width", 1) < ii.get("height", 1) * 1.1 and "portrait" not in q: continue
            if any(b in title.lower() for b in BAD): continue
            md = ii.get("extmetadata") or {}
            lic = (md.get("LicenseShortName") or {}).get("value", "")
            if "nc" in lic.lower().split("-"): continue
            artist = (md.get("Artist") or {}).get("value", "")
            import re as _re
            artist = _re.sub("<[^>]+>", "", artist)[:80]
            out.append({"url": ii.get("thumburl") or ii.get("url"), "thumbnail": None, "title": title, "creator": artist,
                        "license": lic, "license_version": "", "foreign_landing_url": ii.get("descriptionurl"), "source": "wikimedia commons"})
    except Exception as e:
        log("commons fail", q, e)
    return out

def fetch(res):
    for u in (res.get("url"), res.get("thumbnail")):
        if not u: continue
        try:
            r = requests.get(u, headers=UA, timeout=40)
            if r.ok and "image" in r.headers.get("content-type", "") and len(r.content) > 60_000:
                im = Image.open(io.BytesIO(r.content)).convert("RGB")
                if im.width < 900: continue
                if im.width > 1600: im = im.resize((1600, int(im.height * 1600 / im.width)))
                return im
        except Exception as e:
            log("dl fail", u[:90], e)
    return None

credits = {}
os.makedirs("candidates", exist_ok=True); os.makedirs("sheets", exist_ok=True)
for group, slots in SLOTS.items():
    rows = []
    for slot, queries in slots.items():
        got = []
        for qi, q in enumerate(queries):
            n = 0
            results = commons(q); time.sleep(1); results += search(q)
            log(slot, "|", q, "|", len(results), "results")
            for res in results:
                if n >= PER_QUERY: break
                if res["url"] in [g[2] for g in got]: continue
                im = fetch(res)
                if im is None: continue
                name = f"{slot}__q{qi}_{n}.jpg"
                os.makedirs(f"candidates/{slot}", exist_ok=True)
                im.save(f"candidates/{slot}/{name}", quality=82)
                credits[f"{slot}/{name}"] = {"query": q, "title": res.get("title"), "creator": res.get("creator"),
                    "license": f"{res.get('license')} {res.get('license_version')}", "page": res.get("foreign_landing_url"), "source": res.get("source")}
                got.append((name, im.copy(), res["url"], q)); n += 1
                time.sleep(1)
            time.sleep(1.5)
        rows.append((slot, got))
    # contact sheet for this group
    tw, th = 300, 190; cols = 6
    sheet = Image.new("RGB", (cols * tw, max(1, len(rows)) * (th + 22)), (20, 20, 22)); d = ImageDraw.Draw(sheet)
    for ri, (slot, got) in enumerate(rows):
        d.text((6, ri * (th + 22) + 4), slot, fill=(220, 190, 120))
        for ci, (name, im, _, q) in enumerate(got[:cols]):
            t = im.copy(); t.thumbnail((tw - 6, th))
            sheet.paste(t, (ci * tw + 3, ri * (th + 22) + 20))
            d.text((ci * tw + 6, ri * (th + 22) + 20 + 2), name.split("__")[1][:7], fill=(255, 255, 255))
    sheet.save(f"sheets/{group}.jpg", quality=80)
json.dump(credits, open("candidates/credits.json", "w"), indent=1)
print("done", len(credits), "images")
