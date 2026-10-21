"""Zet bronfoto's om naar AVIF + WebP in meerdere breedtes voor src/assets/img/photos/.

Gebruik (vereist Pillow >= 11.3 met AVIF-ondersteuning):
    python3 tools/images.py <bronmap>

De bronmap bevat de originele bestanden onder de namen in FOTOS hieronder.
Productfoto's (product: True) worden automatisch uitgesneden zonder de ingebakken prijsbadge.
"""
import sys
from pathlib import Path
from PIL import Image

OUT = Path(__file__).resolve().parent.parent / 'src' / 'assets' / 'img' / 'photos'

# naam: (bronbestand, breedtes, beeldverhouding (b/h) of None, focus-y 0..1, product)
FOTOS = {
    'hero-camper-strand':   ('AdobeStock_222131372.jpeg', [960, 1600, 2400], 16 / 9, 0.5, False),
    'team':                 ('team.jpeg',                 [800, 1200], 4 / 3, 0.45, False),
    'kampeershop':          ('home-content.png',          [600, 1000], None, 0.5, False),
    'werkplaats-caravan':   ('werkplaats-content.png',    [960, 1600, 2400], None, 0.5, False),
    'werkplaats-monteur':   ('werkplaats-hero.png',       [960, 1600, 2300], None, 0.5, False),
    'apk':                  ('apk-hero.png',              [960, 1600, 2300], None, 0.5, False),
    'onderhoud':            ('onderhoud-hero.png',        [960, 1600, 2300], None, 0.5, False),
    'aircoservice':         ('airco-hero.png',            [960, 1600, 2400], None, 0.5, False),
    'bandenservice':        ('banden-hero.png',           [960, 1600, 2400], None, 0.5, False),
    'storing-diagnose':     ('diagnose-hero.png',         [960, 1600, 2400], None, 0.5, False),
    'accessoire-opbouw':    ('accessoire-hero.png',       [960, 1600, 2400], None, 0.5, False),
    'schadeherstel':        ('schade-hero.png',           [960, 1600, 1927], None, 0.5, False),
    'tarieven':             ('tarieven-hero.png',         [960, 1600, 2300], None, 0.5, False),
    'verhuur-thule-koffer': ('verhuur-hero.png',          [960, 1600, 2300], None, 0.5, False),
    'pand-kampeermeer':     ('contact-kampeermeer.png',   [800, 1600, 2300], None, 0.5, False),
    'pand-lokerse':         ('contact-lokerse.png',       [800, 1600, 2400], None, 0.5, False),
    'product-fietsendrager':     ('verhuur-1.png', [600], None, 0.5, True),
    'product-dakkoffer-medium':  ('verhuur-2.png', [600], None, 0.5, True),
    'product-dakkoffer-large':   ('verhuur-3.png', [600], None, 0.5, True),
    'product-dakkoffer-xl':      ('verhuur-4.png', [600], None, 0.5, True),
}


def crop_ratio(img, ratio, focus_y):
    w, h = img.size
    if ratio is None:
        return img
    if w / h > ratio:  # te breed: links/rechts bijsnijden
        nw = round(h * ratio)
        x = (w - nw) // 2
        return img.crop((x, 0, x + nw, h))
    nh = round(w / ratio)
    y = round((h - nh) * focus_y)
    return img.crop((0, y, w, y + nh))


def crop_product(img):
    """Snijd het product uit (linkerdeel, zonder lijn en prijsbadge) met een smalle witte rand."""
    g = img.convert('L')
    w, h = g.size
    px = g.load()
    limit = int(w * 0.6)
    cols = [x for x in range(limit) if sum(1 for y in range(0, h, 2) if px[x, y] < 225) > 6]
    rows = [y for y in range(h) if sum(1 for x in range(0, limit, 2) if px[x, y] < 225) > 10]
    box = (min(cols), min(rows), max(cols) + 1, max(rows) + 1)
    prod = img.convert('RGB').crop(box)
    # De prijslijn loopt horizontaal door naar de badge: wis hem op die hoogte van rechts naar
    # links, tot waar boven/onder de lijn product begint.
    line_y = max(range(h), key=lambda y: sum(1 for x in range(limit, int(w * 0.8)) if px[x, y] < 225))
    ppx, pg = prod.load(), prod.convert('L').load()
    ly = line_y - box[1]
    if 0 <= ly < prod.height:
        for x in range(prod.width - 1, -1, -1):
            above = pg[x, max(ly - 6, 0)] > 235
            below = pg[x, min(ly + 6, prod.height - 1)] > 235
            if not (above and below):
                break
            for y in range(max(ly - 4, 0), min(ly + 5, prod.height)):
                ppx[x, y] = (255, 255, 255)
    pad = round(max(prod.size) * 0.05)
    canvas = Image.new('RGB', (prod.width + 2 * pad, prod.height + 2 * pad), 'white')
    canvas.paste(prod, (pad, pad))
    return canvas


def main(src_dir):
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (src, widths, ratio, focus_y, product) in FOTOS.items():
        path = Path(src_dir) / src
        if not path.exists():
            print(f'  overgeslagen (niet gevonden): {src}')
            continue
        img = Image.open(path)
        img = crop_product(img) if product else crop_ratio(img.convert('RGB'), ratio, focus_y)
        widths = [w for w in widths if w <= img.width] or [img.width]
        for w in widths:
            im = img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
            im.save(OUT / f'{name}-{w}.avif', quality=55, speed=6)
            im.save(OUT / f'{name}-{w}.webp', quality=78, method=6)
        print(f'{name}: {img.width}x{img.height} -> {widths}')


if __name__ == '__main__':
    main(sys.argv[1])
