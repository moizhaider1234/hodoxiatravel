"""Searches Openverse (free-licence photos) for each website slot, downloads a few candidates,
and builds contact sheets so they can be reviewed. Run by .github/workflows/fetch-photos.yml"""
import os, io, json, time, requests
from PIL import Image, ImageDraw

SLOTS = {
 "airports": {
  "yyz": ["Toronto skyline CN Tower", "Toronto Pearson airport terminal"],
  "yvr": ["Vancouver skyline mountains", "Vancouver International Airport terminal"],
  "yul": ["Montreal skyline", "Montreal Trudeau airport terminal"],
  "yyc": ["Calgary skyline", "Calgary International Airport terminal"],
  "yow": ["Parliament Hill Ottawa", "Ottawa Macdonald-Cartier airport terminal"],
  "yeg": ["Edmonton skyline", "Edmonton International Airport terminal"],
  "ywg": ["Winnipeg skyline", "Winnipeg Richardson airport terminal"],
  "yhz": ["Halifax waterfront harbour", "Halifax Stanfield airport terminal"],
  "yyj": ["Victoria Inner Harbour British Columbia", "Victoria International Airport British Columbia"],
  "yqb": ["Chateau Frontenac Quebec City", "Quebec City Jean Lesage airport terminal"],
  "yvz": ["Deer Lake Ontario", "northern Ontario lake boreal forest"],
 },
 "occasions": {
  "occ-wedding": ["wedding car decorated luxury"],
  "occ-roadshow": ["businessmen suits black SUV"],
  "occ-conference": ["business conference delegates arriving"],
  "occ-evening": ["gala evening formal dress night"],
  "occ-daytour": ["sightseeing tour luxury car city"],
  "occ-meetgreet": ["chauffeur holding name sign airport arrivals"],
 },
 "routes": {
  "route-niagara": ["Niagara Falls"],
  "route-whistler": ["Whistler village British Columbia"],
  "route-quebec": ["old Quebec City street"],
  "route-banff": ["Banff Rocky Mountains"],
  "route-ottawa": ["Rideau Canal Ottawa"],
  "route-toronto-night": ["Toronto downtown night"],
 },
 "other": {
  "who": ["chauffeur opening car door passenger"],
  "extra-jet": ["private jet airport"],
  "extra-interior": ["luxury car interior leather rear seat"],
  "extra-limo": ["black limousine street"],
  "extra-office": ["executive office tower business district"],
  "extra-highway": ["highway countryside road trip"],
  "extra-hotel": ["luxury hotel entrance doorman"],
 },
}
PER_QUERY = 3
UA = {"User-Agent": "HodoxiaPhotoBot/1.0 (website image research)"}

def search(q):
    for attempt in range(3):
        try:
            r = requests.get("https://api.openverse.org/v1/images/", headers=UA, timeout=30, params={
                "q": q, "license_type": "commercial", "category": "photograph",
                "size": "large", "page_size": 20})
            if r.status_code == 429: time.sleep(20); continue
            r.raise_for_status(); return r.json().get("results", [])
        except Exception as e:
            print("search fail", q, e); time.sleep(5)
    return []

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
            print("dl fail", u[:80], e)
    return None

credits = {}
os.makedirs("candidates", exist_ok=True); os.makedirs("sheets", exist_ok=True)
for group, slots in SLOTS.items():
    rows = []
    for slot, queries in slots.items():
        got = []
        for qi, q in enumerate(queries):
            n = 0
            for res in search(q):
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
