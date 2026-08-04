#!/usr/bin/env python3
"""S4 컨셉 배경 텍스처. 유리 카드가 굴절할 대상 — 시각적으로 풍부해야 굴절이 눈에 보인다.
검끝 궤적 모티프: 실버-시안 + 레드 곡선들이 흐르는 고대비 텍스처(블랙 위). 브랜드 블랙·실버·레드.
재생성: python3 presentation-v2/scripts/gen_concept_texture.py → public/textures/concept.webp
"""
import math
import os
from PIL import Image, ImageDraw, ImageFilter

W, H = 1600, 1000
BLACK = (10, 10, 11)
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'textures')

SILVER = (216, 226, 240)
CYAN = (169, 223, 255)
RED = (255, 59, 78)
REDD = (179, 18, 44)


def cubic(p0, p1, p2, p3, s):
    u = 1 - s
    x = u*u*u*p0[0] + 3*u*u*s*p1[0] + 3*u*s*s*p2[0] + s*s*s*p3[0]
    y = u*u*u*p0[1] + 3*u*u*s*p1[1] + 3*u*s*s*p2[1] + s*s*s*p3[1]
    return (x, y)


# (색, 제어점 4개, 폭). 화면을 가로지르는 검끝 궤적들.
CURVES = [
    (CYAN, [(-100, 300), (400, 120), (900, 520), (1700, 260)], 5),
    (SILVER, [(-100, 620), (500, 780), (1000, 420), (1700, 640)], 4),
    (CYAN, [(-100, 820), (600, 640), (1100, 900), (1700, 720)], 3),
    (SILVER, [(-100, 160), (450, 340), (1050, 120), (1700, 420)], 3),
    (RED, [(-100, 480), (550, 300), (1150, 700), (1700, 480)], 4),
    (REDD, [(-100, 900), (700, 980), (1200, 560), (1700, 860)], 3),
    (SILVER, [(200, -60), (700, 500), (1000, 400), (1300, 1080)], 2),
]


def draw_curves(width_scale, alpha):
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for col, cps, w in CURVES:
        pts = [cubic(*cps, i / 120) for i in range(121)]
        d.line(pts, fill=col + (alpha,), width=max(1, int(w * width_scale)), joint='curve')
    return layer


def main():
    os.makedirs(OUT, exist_ok=True)
    img = Image.new('RGBA', (W, H), BLACK + (255,))
    # 은은한 실버/레드 방사 글로우 몇 점(깊이)
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for (cx, cy, r, col, a) in [(430, 340, 320, SILVER, 40), (1150, 620, 300, CYAN, 34),
                                (820, 820, 260, REDD, 40), (300, 760, 220, RED, 26)]:
        gd.ellipse([cx-r, cy-r, cx+r, cy+r], fill=col + (a,))
    img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(120)))
    # 궤적: 넓은 글로우 + 선명한 코어(가산 느낌)
    img = Image.alpha_composite(img, draw_curves(6, 90).filter(ImageFilter.GaussianBlur(9)))
    img = Image.alpha_composite(img, draw_curves(1, 235))
    img.convert('RGB').save(os.path.join(OUT, 'concept.webp'), 'WEBP', quality=88, method=6)
    print('generated concept.webp', W, 'x', H)


if __name__ == '__main__':
    main()
