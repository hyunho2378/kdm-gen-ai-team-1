#!/usr/bin/env python3
"""S2 선수 스크럽 프레임 추출기. presentation-v2.

scroll-scrub-starter(MIT)가 ffmpeg로 하는 일(추출 → 리사이즈 → 시퀀스)을 동일하게 재현한다.
이 환경에 ffmpeg 바이너리가 없어 imageio-ffmpeg(정적 ffmpeg)로 프레임을 읽고 PIL로 webp 저장한다.
가로/세로 두 영상을 각각 뽑아 화면 비율에 따라 런타임이 골라 쓴다(landscape=데스크탑, portrait=모바일).

산출: presentation-v2/public/frames/{landscape,portrait}/frame_%04d.webp + manifest.json
재실행: python3 presentation-v2/scripts/extract_frames.py
"""
import json
import os
import imageio.v2 as iio
from PIL import Image

HERE = os.path.dirname(__file__)
ROOT = os.path.normpath(os.path.join(HERE, "..", "public"))

# (소스, 출력 폴더, 목표 가로폭, 목표 프레임 수)
JOBS = [
    ("fencing-landscape.mp4", "landscape", 1600, 150),
    ("fencing-portrait.mp4", "portrait", 1080, 150),
]
QUALITY = 75


def even_indices(total, count):
    """0..total-1에서 count개를 균등 추출한 인덱스 집합."""
    if count >= total:
        return list(range(total))
    return [round(i * (total - 1) / (count - 1)) for i in range(count)]


def run_job(src_name, out_name, target_w, target_count):
    src = os.path.join(ROOT, "videos", src_name)
    out_dir = os.path.join(ROOT, "frames", out_name)
    os.makedirs(out_dir, exist_ok=True)
    # 기존 프레임 정리(재실행 시 잔여 방지)
    for f in os.listdir(out_dir):
        if f.endswith(".webp") or f == "manifest.json":
            os.remove(os.path.join(out_dir, f))

    reader = iio.get_reader(src, "ffmpeg")
    meta = reader.get_meta_data()
    fps = float(meta.get("fps", 30))
    duration = float(meta.get("duration", 0))
    src_w, src_h = meta.get("size", (0, 0))
    total = int(round(duration * fps)) or reader.count_frames()

    target_h = round(src_h * target_w / src_w)
    # 짝수로 맞춘다(webp/코덱 호환 관례)
    target_h -= target_h % 2

    want = set(even_indices(total, target_count))
    saved = 0
    for i, frame in enumerate(reader):
        if i not in want:
            continue
        img = Image.fromarray(frame).convert("RGB").resize((target_w, target_h), Image.LANCZOS)
        saved += 1
        img.save(os.path.join(out_dir, f"frame_{saved:04d}.webp"), "WEBP", quality=QUALITY, method=6)
        if saved >= target_count:
            break
    reader.close()

    manifest = {
        "count": saved,
        "pattern": "frame_%04d.webp",
        "width": target_w,
        "height": target_h,
        "fps": round(fps, 3),
        "source": src_name,
        "sourceSize": [src_w, src_h],
        "placeholder": True,
    }
    with open(os.path.join(out_dir, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"[{out_name}] {saved} frames @ {target_w}x{target_h} (from {src_w}x{src_h}, {total} src frames)")


def main():
    for job in JOBS:
        run_job(*job)


if __name__ == "__main__":
    main()
