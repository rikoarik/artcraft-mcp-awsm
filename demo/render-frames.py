#!/usr/bin/env python3
"""Render typography frames; needs Pillow. No proprietary content or network."""
from PIL import Image, ImageDraw, ImageFont
import json, sys
from pathlib import Path

scenes = json.loads(Path(sys.argv[1]).read_text())
out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
font_path = '/System/Library/Fonts/Supplemental/Menlo.ttc'
for i, (title, command, result) in enumerate(scenes):
    im = Image.new('RGB', (1280, 720), '#101c1b')
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 17, 720), fill='#58e0ae')
    d.text((65, 55), 'AWSM / MCP + SKILLS  —  ACTUAL CLI OUTPUT', font=ImageFont.truetype(font_path, 19), fill='#58e0ae')
    d.text((65, 145), title, font=ImageFont.truetype(font_path, 38), fill='#f2eee2')
    y = 230
    for line in command.splitlines():
        d.text((65, y), line, font=ImageFont.truetype(font_path, 24), fill='#58e0ae')
        y += 39
    y += 25
    for line in result.splitlines():
        d.text((65, y), line, font=ImageFont.truetype(font_path, 20), fill='#f2eee2')
        y += 34
    d.text((65, 655), 'Silent scripted demo — not FigCraft canvas footage', font=ImageFont.truetype(font_path, 16), fill='#9caca8')
    im.save(out / f'frame-{i:02}.png')
