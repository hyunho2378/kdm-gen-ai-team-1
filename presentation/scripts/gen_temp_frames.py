#!/usr/bin/env python3
"""임시 히어로 스크럽 프레임 생성기 (실물 펜싱 영상 도착 전 개발용).

DESIGN 10절 검끝 곡선 모티프: 준비 곡선 뒤 짧고 급한 찌르기. 검끝이 크롬에서 red.light로 물든다.
tokens 색만 사용. 산출은 실물과 동일한 규격/명명(1280x720 webp, frame_%04d)이라
P3 로더 경로가 임시/실물에서 동일하다. 실물은 이 폴더를 덮어쓰고 manifest.count만 바꾸면 된다.

재생성:  python3 presentation/scripts/gen_temp_frames.py
"""
import json
import math
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# --- tokens (shared/tokens.js와 동일 값. 하드코딩이 아니라 사양 사본) ---
BG_BASE = (11, 11, 14)       # #0B0B0E
BG_DEEP = (5, 5, 6)          # #050506
STEEL_HI = (255, 255, 255)   # #FFFFFF
STEEL_MID = (216, 226, 240)  # #D8E2F0
STEEL_SHADOW = (110, 123, 146)  # #6E7B92
RED_LIGHT = (255, 36, 66)    # #FF2442
TEXT_DIM = (242, 246, 255)   # a=0.55 로 알파 적용

W, H = 1280, 720
N = 72
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "frames", "hero")


def lerp(a, b, t):
    return a + (b - a) * t


def lerp_rgb(c1, c2, t):
    return tuple(int(round(lerp(c1[i], c2[i], t))) for i in range(3))


def smoothstep(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def cubic(p0, p1, p2, p3, s):
    u = 1 - s
    x = u*u*u*p0[0] + 3*u*u*s*p1[0] + 3*u*s*s*p2[0] + s*s*s*p3[0]
    y = u*u*u*p0[1] + 3*u*u*s*p1[1] + 3*u*s*s*p2[1] + s*s*s*p3[1]
    return (x, y)


# 검끝 궤적: 앞 70%는 완만한 준비 곡선(cubic bezier), 뒤 30%는 짧고 급한 직선 찌르기.
P0 = (170, 560)
C1 = (430, 250)
C2 = (720, 500)
PREP_END = (900, 360)   # 준비 끝 = 찌르기 시작
THRUST = (1150, 300)    # 찌르기 목표
PREP_RATIO = 0.7

HILT = (110, 650)       # 검자루 고정 앵커. 검신은 여기서 검끝까지의 직선.


def tip_at(s):
    """s in [0,1] → 검끝 좌표."""
    if s <= PREP_RATIO:
        return cubic(P0, C1, C2, PREP_END, s / PREP_RATIO)
    u = (s - PREP_RATIO) / (1 - PREP_RATIO)
    return (lerp(PREP_END[0], THRUST[0], u), lerp(PREP_END[1], THRUST[1], u))


# 궤적을 촘촘히 샘플해 부드러운 폴리라인으로 그린다(PIL line 스무딩 한계 회피).
SAMPLES = 260
PATH = [tip_at(i / (SAMPLES - 1)) for i in range(SAMPLES)]


def build_vignette():
    """방사 비네트 마스크. 중앙 밝고 가장자리 bg.deep."""
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    cx, cy = W * 0.5, H * 0.42
    maxr = math.hypot(max(cx, W - cx), max(cy, H - cy))
    # 동심 타원을 밖에서 안으로 밝게
    steps = 60
    for i in range(steps):
        r = maxr * (1 - i / steps)
        v = int(255 * (i / steps) ** 1.6)
        d.ellipse([cx - r, cy - r * (H / W) - 40, cx + r, cy + r * (H / W) + 40], fill=v)
    return mask.filter(ImageFilter.GaussianBlur(40))


VIGNETTE = build_vignette()
try:
    FONT = ImageFont.truetype("/System/Library/Fonts/SFNSMono.ttf", 18)
except Exception:
    FONT = ImageFont.load_default()


def draw_frame(i):
    t = i / (N - 1)
    # 배경: base에서 deep으로 비네트 합성
    base = Image.new("RGB", (W, H), BG_BASE)
    deep = Image.new("RGB", (W, H), BG_DEEP)
    img = Image.composite(base, deep, VIGNETTE).convert("RGBA")

    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))   # 블러해서 발광
    gd = ImageDraw.Draw(glow)
    core = Image.new("RGBA", (W, H), (0, 0, 0, 0))   # 선명한 심
    cd = ImageDraw.Draw(core)

    # 검끝이 지금까지 그린 궤적: 0..t 구간을 색 전이와 함께 폴리라인으로
    revealed = max(1, int(round(t * (SAMPLES - 1))))
    for k in range(revealed):
        s = k / (SAMPLES - 1)
        # 크롬(초반) → red.light(후반). ScrollTrail 그라디언트와 같은 서사
        col = lerp_rgb(STEEL_MID, RED_LIGHT, smoothstep((s - 0.55) / 0.45)) if s > 0.55 else STEEL_MID
        p, q = PATH[k], PATH[k + 1]
        gd.line([p, q], fill=col + (200,), width=9)
        cd.line([p, q], fill=col + (255,), width=3)

    tip = PATH[revealed]
    # 검신: 검자루 → 현재 검끝 직선(스틸)
    cd.line([HILT, tip], fill=STEEL_SHADOW + (230,), width=5)
    cd.line([HILT, tip], fill=STEEL_MID + (120,), width=2)

    # 검끝 점: 크롬 → 레드, 찌르기 순간 커진다
    tip_col = lerp_rgb(STEEL_HI, RED_LIGHT, smoothstep((t - 0.6) / 0.4))
    r = lerp(5, 11, smoothstep((t - 0.55) / 0.45))
    gd.ellipse([tip[0]-r*2.4, tip[1]-r*2.4, tip[0]+r*2.4, tip[1]+r*2.4], fill=tip_col + (200,))
    cd.ellipse([tip[0]-r, tip[1]-r, tip[0]+r, tip[1]+r], fill=tip_col + (255,))

    img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(10)))
    img = Image.alpha_composite(img, core).convert("RGB")

    # 임시 표식 겸 스크럽 검증 보조. 흐린 라벨, 실물엔 없음.
    ld = ImageDraw.Draw(img)
    ld.text((W - 190, H - 40), f"TEMP · {i+1:03d}/{N:03d}", font=FONT,
            fill=tuple(int(c * 0.55) for c in TEXT_DIM))
    return img


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for i in range(N):
        img = draw_frame(i)
        img.save(os.path.join(OUT_DIR, f"frame_{i+1:04d}.webp"), "WEBP", quality=80, method=6)
    manifest = {
        "count": N, "pattern": "frame_%04d.webp",
        "width": W, "height": H, "fps": 24, "placeholder": True,
    }
    with open(os.path.join(OUT_DIR, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"generated {N} frames + manifest.json in {os.path.normpath(OUT_DIR)}")


if __name__ == "__main__":
    main()
