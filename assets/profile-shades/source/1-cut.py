"""Step 1 of the hand art: lifts the hand and sleeve out of the webcam photo (1.jpg).

The wall is bright and neutral, the skin is warm and the sleeve is near-black, so a colour rule
separates them; a polygon cuts away his head, his spectacles and his torso, where no threshold could.
Writes hand-cut.png (and hand-cut-check.png on magenta, to eyeball the edge).

    python assets/profile-shades/source/1-cut.py
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from collections import deque

SRC='assets/profile-shades/source/1.jpg'
OUT='assets/profile-shades/source'
im = Image.open(SRC).convert('RGB')
a = np.asarray(im).astype(int)
R,G,B = a[...,0],a[...,1],a[...,2]
lum = (R*0.299+G*0.587+B*0.114)

POLY=[(710,240),(900,240),(1000,330),(1080,470),(1160,600),(1215,720),(980,720),(865,420),
      (760,395),(700,370),(690,345),(686,320),(690,296),(700,272)]
region = Image.new('L', im.size, 0)
ImageDraw.Draw(region).polygon(POLY, fill=255)
reg = np.asarray(region) > 0

fg = (((R-B > 12) & (lum < 210)) | (lum < 110)) & reg
# A dark wedge of his spectacle frame sits on the index finger; the frame is not part of the hand
yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]]
fg &= ~((xx >= 686) & (xx <= 710) & (yy >= 262) & (yy <= 300) & (lum < 125))
m = Image.fromarray((fg*255).astype('uint8'))
m = m.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
arr = np.asarray(m) > 0
h,w = arr.shape

def components(mask):
    seen = np.zeros_like(mask); out=[]
    ys,xs = np.nonzero(mask)
    for sy,sx in zip(ys,xs):
        if seen[sy,sx]: continue
        q=deque([(sy,sx)]); seen[sy,sx]=True; comp=[]
        while q:
            y,x=q.popleft(); comp.append((y,x))
            for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
                ny,nx=y+dy,x+dx
                if 0<=ny<h and 0<=nx<w and mask[ny,nx] and not seen[ny,nx]:
                    seen[ny,nx]=True; q.append((ny,nx))
        out.append(comp)
    return out

comps = components(arr)
comps.sort(key=len, reverse=True)
keep = np.zeros_like(arr)
for y,x in comps[0]: keep[y,x]=True

# fill only pinholes; the gap between thumb and finger must stay see-through
inv = ~keep
holes = [c for c in components(inv) if not any(y in (0,h-1) or x in (0,w-1) for y,x in c)]
for c in holes:
    if len(c) < 220:
        for y,x in c: keep[y,x]=True
print('kept', keep.sum(), 'holes left', sum(1 for c in holes if len(c) >= 220))

# The fingertips end against his spectacles, so the cut leaves them squared off. Round them back on:
# each tip grows a cap that peaks where the two meet, which reads as a pinch instead of a chop.
rgbf = np.asarray(im).astype(float)
keepf = keep.astype(float)
def round_tip(y0, y1, depth):
    import math
    for y in range(y0, y1):
        xs = np.nonzero(keep[y])[0]
        if not len(xs): continue
        lx = xs.min()
        d = round(depth * math.sin(math.pi * (y-y0) / (y1-y0)) ** 0.65)
        if d <= 0: continue
        edge = rgbf[y, lx:lx+3].mean(0)
        for i in range(1, d+1):
            x = lx - i
            if x < 0: break
            shade = 1.0 - 0.13 * (i/d) ** 1.4          # the tip curves away from the light
            rgbf[y, x] = np.clip(edge * shade, 0, 255)
            keepf[y, x] = 1.0
round_tip(289, 311, 13)   # index finger
round_tip(311, 348, 13)   # thumb
keep = keepf > 0.5
im = Image.fromarray(rgbf.astype('uint8'))

alpha = Image.fromarray((keep*255).astype('uint8'))
alpha = alpha.filter(ImageFilter.MinFilter(3))
alpha = alpha.filter(ImageFilter.GaussianBlur(0.7))
cut = im.copy(); cut.putalpha(alpha)
bbox = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
print('bbox', bbox)
c = cut.crop(bbox)
c.save(OUT+'/hand-cut.png')
import json
json.dump({'origin': [bbox[0], bbox[1]]}, open(OUT+'/hand-cut.json','w'))
Image.alpha_composite(Image.new('RGBA', c.size, (255,0,255,255)), c).save(OUT+'/hand-cut-check.png')
