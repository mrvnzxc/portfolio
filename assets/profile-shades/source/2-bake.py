"""Step 2: bakes public/profile-shades-hand.webp from hand-cut.png.

Grades the webcam's grey skin up to the portrait's, swings the forearm towards vertical, scales the
hand against the face, carries the sleeve past the bottom of the frame (the photo stops at the elbow)
and adds the same drop shadow the SVG art used. Prints the HAND_BOX percentages for ProfileShades.vue.

    python assets/profile-shades/source/2-bake.py -30 0.80 0.82
"""
import sys, math
from PIL import Image, ImageFilter
import numpy as np

BAKE='assets/profile-shades/source'
ROT   = float(sys.argv[1]) if len(sys.argv) > 1 else -30.0
SCALE = float(sys.argv[2]) if len(sys.argv) > 2 else 0.80
FINISH = float(sys.argv[3]) if len(sys.argv) > 3 else 0.82   # the whole layer, hand and sleeve alike
RENDER = 720                      # the photo's baking width, as in the SVG sources
PX, PY = 0.683*RENDER, 0.286*RENDER
SKIN_TARGET = np.array([200.0, 165.0, 150.0])   # the portrait's cheek, a shade darker
SLEEVE_LEAN = 13.0                              # the forearm's lean where the photo runs out
SLEEVE_FLARE = 0.9                              # how much wider the sleeve gets by the bottom
SLEEVE_INWARD = -7.0                            # and where that lean has eased to by the frame's bottom

# ---- grade: the webcam is grey and hazy next to the studio portrait
cut = Image.open(BAKE+'/hand-cut.png')
a = np.asarray(cut).astype(float)
rgb, alpha = a[...,:3], a[...,3]
sel = (alpha > 200) & (rgb[...,0]-rgb[...,2] > 12) & (rgb@[0.299,0.587,0.114] > 110)
def curve(x, g): return np.clip(255*((np.clip(x-8,0,None)/247)**1.08)*g, 0, 252)
gains = []
for ch in range(3):
    lo, hi = 0.5, 3.0
    for _ in range(40):
        mid = (lo+hi)/2
        if curve(rgb[...,ch][sel], mid).mean() < SKIN_TARGET[ch]: lo = mid
        else: hi = mid
    gains.append((lo+hi)/2)
print('channel gains', [round(g,3) for g in gains])
graded = np.stack([curve(rgb[...,ch], gains[ch]) for ch in range(3)], -1)
cut = Image.fromarray(np.dstack([graded, alpha]).astype('uint8'))
# the webcam leaves JPEG speckle the grade amplifies; median it out, keep the alpha crisp
rgbp = Image.merge('RGB', cut.split()[:3]).filter(ImageFilter.MedianFilter(3))
cut = Image.merge('RGBA', (*rgbp.split(), cut.split()[-1]))

# ---- rotate + scale, tracking where the fingers pinch
import json
ORIGIN = json.load(open(BAKE+'/hand-cut.json'))['origin']   # where 1-cut.py cropped
PINCH_IN_PHOTO = (689, 305)                                 # where the fingers grip, in 1.jpg
pinch = (PINCH_IN_PHOTO[0]-ORIGIN[0], PINCH_IN_PHOTO[1]-ORIGIN[1])
rot = cut.rotate(ROT, resample=Image.BICUBIC, expand=True)
t = math.radians(ROT)
dx, dy = pinch[0]-cut.width/2, pinch[1]-cut.height/2
pr = (dx*math.cos(t) + dy*math.sin(t) + rot.width/2, -dx*math.sin(t) + dy*math.cos(t) + rot.height/2)
art = rot.resize((round(rot.width*SCALE), round(rot.height*SCALE)), Image.LANCZOS)
pa = (pr[0]*SCALE, pr[1]*SCALE)

# ---- place on the photo-sized canvas, pinch on target
ox, oy = round(PX-pa[0]), round(PY-pa[1])
canvas = Image.new('RGBA', (RENDER, RENDER + 160), (0,0,0,0))
canvas.alpha_composite(art, (ox, oy))
arr = np.asarray(canvas).astype(float)

# ---- the photo stops at the elbow; carry the sleeve down past the bottom of the frame
al = arr[...,3] > 128
ys = np.nonzero(al.any(1))[0]
# The cut ends the arm on a straight diagonal, so its last rows taper away. Picking one of those up
# makes the sleeve carry on at 60% width: an elbow sliced off. Take the last row still at full width.
lo = max(ys.min(), ys.max() - 320)
widths = {y: int(al[y].sum()) for y in range(lo, ys.max()+1)}
full = max(widths.values())
y_src = max(y for y, w in widths.items() if w >= 0.93*full)
print(f'sleeve carries on from row {y_src} ({widths[y_src]} px wide, arm peaks at {full})')
xs = np.nonzero(al[y_src])[0]
x0, x1 = xs.min(), xs.max()
row = arr[y_src:y_src+1, x0:x1+1].copy()
lean = math.radians(SLEEVE_LEAN)
ext_rows = RENDER + 160 - (y_src+1)
# The forearm runs towards the elbow, which sits near the body, so the sleeve eases inwards as it
# falls. Straight on the arm's own angle it leaves through the side of the round photo and gets
# clipped flat, which reads as a severed arm.
# Repeating one row leaves vertical streaks where the fabric should have grain, so the extension
# walks up and down a band of real sleeve instead.
band = []
for by in range(max(0, y_src-79), y_src+1):
    bxs = np.nonzero(al[by])[0]
    if len(bxs) > 20:
        band.append(arr[by:by+1, bxs.min():bxs.max()+1].copy())
if not band:
    band = [row]

dx = 0.0
for i, y in enumerate(range(y_src+1, RENDER + 160)):
    k = i / max(1, ext_rows)
    dx += math.tan(lean * (1 - k) + math.radians(SLEEVE_INWARD) * k)
    # Flares wide enough that the sleeve always reaches past the round photo's edge: a narrower one
    # runs almost parallel to that edge and leaves a sliver of gown showing beside it. The overdraw
    # is clipped away, so it costs nothing.
    w = round((x1-x0+1) * (1 + SLEEVE_FLARE*k))
    x = round(x0 + dx - (w-(x1-x0+1))/2)
    j = i % (2*len(band) - 2) if len(band) > 1 else 0
    src = band[j if j < len(band) else 2*len(band)-2-j]            # ping-pong, so the grain never jumps
    strip = np.asarray(Image.fromarray(src.astype('uint8')).resize((w,1), Image.BICUBIC)).astype(float)[0]
    strip[:, :3] *= 1 - 0.14*k                                      # the arm recedes as it falls
    x = max(0, min(x, arr.shape[1]-1))
    strip = strip[:arr.shape[1]-x]
    arr[y, x:x+len(strip)] = strip
canvas = Image.fromarray(arr.astype('uint8'))

# ---- shadow, as the SVG sources describe it: drop-shadow(-3.6 4.8 7.2 rgb(30 12 6 / .35))
pad = 24
big = Image.new('RGBA', (canvas.width+2*pad, canvas.height+2*pad), (0,0,0,0))
big.alpha_composite(canvas, (pad, pad))
sh_a = big.split()[-1].filter(ImageFilter.GaussianBlur(3.6)).point(lambda v: int(v*0.35))
shadow = Image.new('RGBA', big.size, (30,12,6,0)); shadow.putalpha(sh_a)
out = Image.new('RGBA', big.size, (0,0,0,0))
out.alpha_composite(shadow, (round(-3.6), round(4.8)))
out.alpha_composite(big)

bbox = out.split()[-1].point(lambda v: 255 if v > 4 else 0).getbbox()
final = out.crop(bbox)
# Shrink the finished layer about the grip point, so the hand reads smaller without the sleeve
# having to be regenerated (regenerating it from higher up only flares it wider).
fin_left = (bbox[0]-pad)/RENDER*100
fin_top = (bbox[1]-pad)/RENDER*100
if FINISH != 1.0:
    final = final.resize((round(final.width*FINISH), round(final.height*FINISH)), Image.LANCZOS)
    fin_left = PX/RENDER*100 - (PX/RENDER*100 - fin_left) * FINISH
    fin_top = PY/RENDER*100 - (PY/RENDER*100 - fin_top) * FINISH
    print(f'layer finished at x{FINISH:g}')
# box of the art inside the photo, in % of the photo's width (what ProfileShades needs)
left, top = fin_left, fin_top
width = final.width/RENDER*100
print(f'HAND_BOX left {left:.2f}% top {top:.2f}% width {width:.2f}%  ({final.width}x{final.height})')
final.save(BAKE+'/profile-shades-hand.webp', quality=88, method=6)
final.save(BAKE+'/hand-final.png')
import os; print('webp bytes', os.path.getsize(BAKE+'/profile-shades-hand.webp'))

# preview on the portrait
base = Image.open('public/profile.webp').convert('RGBA').resize((RENDER,RENDER), Image.LANCZOS)
gl = Image.open('public/profile-shades-glasses.webp').convert('RGBA')
gw = round(RENDER*0.3986); gl = gl.resize((gw, round(gl.height*gw/gl.width)), Image.LANCZOS)
base.alpha_composite(gl, (round(RENDER*0.3056), round(RENDER*0.2625)))
base.alpha_composite(final, (round(left/100*RENDER), round(top/100*RENDER)))
mask = Image.new('L', base.size, 0)
from PIL import ImageDraw; ImageDraw.Draw(mask).ellipse((0,0,RENDER-1,RENDER-1), fill=255)
flat = Image.new('RGB', base.size, (244,247,250)); flat.paste(base.convert('RGB'), (0,0), mask)
flat.save(BAKE+'/preview-final.png')
