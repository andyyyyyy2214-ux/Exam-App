import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs('client/assets', exist_ok=True)

def create_app_icon(size=1024):
    # Create image with deep navy background
    img = Image.new('RGBA', (size, size), (30, 58, 138, 255)) # #1e3a8a
    draw = ImageDraw.Draw(img)

    # Draw rounded gradient/circle in center
    margin = size // 8
    # Outer circle highlight
    draw.ellipse([margin, margin, size - margin, size - margin], fill=(37, 99, 235, 255)) # #2563eb

    # Draw Mortarboard (Cap)
    # Diamond top of graduation cap
    cx = size // 2
    cy = size // 2 - size // 16
    cw = size // 3
    ch = size // 6

    top_diamond = [
        (cx, cy - ch),          # Top
        (cx + cw, cy),          # Right
        (cx, cy + ch),          # Bottom
        (cx - cw, cy),          # Left
    ]
    draw.polygon(top_diamond, fill=(255, 255, 255, 255))

    # Cap skull band underneath
    band_top = cy + ch // 3
    band_bottom = cy + ch + size // 10
    band_w = size // 5
    draw.chord([cx - band_w, cy, cx + band_w, band_bottom], 0, 180, fill=(240, 240, 250, 255))

    # Tassel
    tassel_color = (250, 204, 21, 255) # Golden yellow #facc15
    draw.line([(cx, cy), (cx + cw - 20, cy + ch // 2), (cx + cw - 10, cy + ch + 80)], fill=tassel_color, width=16)
    draw.ellipse([cx + cw - 30, cy + ch + 70, cx + cw + 10, cy + ch + 130], fill=tassel_color)

    # Checkmark / Shield badge below
    badge_cy = cy + ch + size // 7
    r = size // 10
    draw.ellipse([cx - r, badge_cy - r, cx + r, badge_cy + r], fill=(16, 185, 129, 255)) # Emerald green #10b981

    # White Checkmark
    check_points = [
        (cx - r // 2, badge_cy),
        (cx - r // 6, badge_cy + r // 3),
        (cx + r // 2, badge_cy - r // 3)
    ]
    draw.line(check_points, fill=(255, 255, 255, 255), width=24, joint='curve')

    # Save icons
    img.save('client/assets/icon.png')
    img.save('client/assets/adaptive-icon.png')

    # Create small favicon
    favicon = img.resize((48, 48), Image.Resampling.LANCZOS)
    favicon.save('client/assets/favicon.png')
    favicon.save('client/dist/favicon.ico')
    img.save('client/dist/icon.png')
    print("✅ Generated app icons: icon.png, adaptive-icon.png, favicon.png, favicon.ico")

if __name__ == '__main__':
    create_app_icon()
