#!/usr/bin/env python3
"""Render demo frames from actual MCP results. Requires Pillow."""
from PIL import Image, ImageDraw, ImageFont
import json, sys
from pathlib import Path

scenes = json.loads(Path(sys.argv[1]).read_text())
out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
font_path = '/System/Library/Fonts/Supplemental/Menlo.ttc'
mono = ImageFont.truetype(font_path, 20)
small = ImageFont.truetype(font_path, 16)
large = ImageFont.truetype(font_path, 34)
for i, scene in enumerate(scenes):
    image = Image.new('RGB', (1280, 720), '#101c1b')
    d = ImageDraw.Draw(image)
    d.rectangle((0, 0, 17, 720), fill='#58e0ae')
    d.text((60, 52), 'AWSM  /  USAGE & RESULTS', font=mono, fill='#58e0ae')
    d.text((60, 132), scene['title'], font=large, fill='#f2eee2')
    has_image = bool(scene.get('image'))
    for n, line in enumerate(scene['command'].splitlines()):
        d.text((60, 225 + n * 35), line, font=small if len(line) > 53 else mono, fill='#58e0ae')
    y = 335
    for line in scene['result'].splitlines():
        d.text((60, y), line, font=small if len(line) > 55 else mono, fill='#f2eee2')
        y += 35
    if scene.get('swatches'):
        for n, color in enumerate(scene['swatches']):
            x = 60 + n * 170
            d.rounded_rectangle((x, 525, x + 146, 590), radius=6, fill=color)
            d.text((x, 605), color, font=small, fill='#f2eee2')
    if has_image:
        card = Image.open(scene['image']).convert('RGB')
        # Quick Look fits 1200×630 SVG inside a square preview; crop the white letterbox.
        # Detect non-white artwork bounds rather than relying on thumbnail padding.
        from PIL import ImageChops
        difference = ImageChops.difference(card, Image.new('RGB', card.size, 'white'))
        artwork = difference.getbbox()
        if artwork:
            card = card.crop(artwork)
        card.thumbnail((560, 430))
        image.paste(card, (685, 188))
    d.text((60, 665), 'Scripted demo of real MCP calls  /  no FigCraft canvas recording', font=small, fill='#9caca8')
    image.save(out / f'frame-{i:02}.png')
