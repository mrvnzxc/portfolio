## Portfolio Gallery: Infinite Horizontal Drag + Lightbox

This document explains how the custom gallery section on the portfolio page works and how to tweak it.

---

### 1. HTML Structure

- Section lives in `index.html` under the `Gallery` heading.
- Core elements:
  - `#gallery-container`: outer framed card with border, padding, and background.
  - `#gallery-track`: horizontal flex track that is draggable and scrollable.
- Images are **not hard‑coded in HTML**; JavaScript injects them into `#gallery-track`.

```html
<section id="gallery">
  <div id="gallery-container">
    <div id="gallery-track">
      <!-- JS injects repeated images here -->
    </div>
  </div>
</section>
```

---

### 2. Image Source & Layout

- The base image list is defined in `script.js`:

```js
const galleryBaseImages = [
  'images/me1.jpg',
  'images/me2.jpg',
  'images/me3.jpg',
  'images/me4.jpg',
  'images/me5.jpg',
  'images/me6.jpg',
];
```

- Each image is rendered inside a `button.gallery-item`:
  - Portrait frame: `aspect-[3/4]`
  - Responsive width:
    - Desktop: `lg:w-1/3` → **3 images visible**
    - Tablet: `sm:w-1/2` → **2 images visible**
    - Mobile: `w-full` → **1 image visible**
  - Fixed visual size across all images via `object-fit: cover`.

- Non‑draggable image behavior:
  - `draggable="false"` on `<img>`
  - CSS in `style.css`:

```css
.gallery-image {
  object-fit: cover;
  -webkit-user-drag: none;
  user-select: none;
}
```

This ensures the **container** is what moves on drag, not the image itself.

---

### 3. Infinite Horizontal Scroll Technique

Implemented in `script.js` below the existing lightbox logic.

Core ideas:

- Build one logical **segment** from `galleryBaseImages`.
- Duplicate that segment **7 times** (`SEGMENT_COUNT = 7`) inside `#gallery-track`.
- Place the scroll position in the **middle copy** on load and after resizes.
- While dragging/scrolling, if the user drifts too far from the middle cluster, jump the scroll position by several full segments so they never hit the real start or end.

Key pieces:

```js
const SEGMENT_COUNT = 7; // >= 5 to allow long drags in both directions

function createSegment() {
  const fragment = document.createDocumentFragment();
  galleryBaseImages.forEach((src, index) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className =
      'gallery-item relative aspect-[3/4] w-full flex-none overflow-hidden rounded-xl border ... lg:w-1/3 sm:w-1/2';
    item.setAttribute('data-gallery-index', String(index));

    const img = document.createElement('img');
    img.src = src;
    img.alt = `Gallery photo ${index + 1}`;
    img.draggable = false;
    img.className = 'h-full w-full object-cover select-none pointer-events-none gallery-image';

    item.appendChild(img);
    fragment.appendChild(item);
  });
  return fragment;
}
```

- After creating and appending all segments, the script:
  - Measures `segmentWidth` (width of one base set of images, including gaps).
  - Centers the scroll:

```js
const middleOffset = segmentWidth * Math.floor(SEGMENT_COUNT / 2);
galleryTrack.scrollLeft = middleOffset;
```

- On `scroll`, the handler:
  - Checks how far the current `scrollLeft` is from `middleOffset`.
  - If it goes beyond a threshold, it jumps by several segments (`shiftAmount`) to land back near the middle, without visible snapping or jitter.

The user can now drag **left or right forever** with no start or end.

---

### 4. Drag‑to‑Scroll Behavior

- Dragging is implemented on `#gallery-track`:
  - `mousedown` / `touchstart`: record starting pointer position and `scrollLeft`.
  - `mousemove` / `touchmove`: update `scrollLeft` based on pointer delta.
  - `mouseup` / `mouseleave` / `touchend` / `touchcancel`: stop dragging.

- Pointer events and classes:
  - Default state: `cursor-grab`.
  - While dragging: `cursor-grabbing`.
  - Movement uses direct `scrollLeft` updates for a fast, native feel (no slow snapping).

This keeps drag motion **smooth and responsive**, targeting ~60fps.

---

### 5. Lightbox Viewer (Gallery)

The gallery has its own fullscreen lightbox, separate from the certificates lightbox.

- Dynamically created as `#gallery-lightbox` and appended to `document.body`.
- UI:
  - Dark overlay background.
  - Centered image wrapper.
  - Previous (`‹`) and next (`›`) navigation buttons.
  - Close button (`✕`) in the top‑right.

Behavior:

- Clicking a `.gallery-item`:
  - Reads `data-gallery-index` (0–5).
  - Opens the lightbox and shows that base image.

- Navigation:
  - `currentGalleryIndex` is tracked.
  - `showGalleryImage(index)` wraps the index with modular arithmetic so:
    - Next from last → first.
    - Previous from first → last.
  - Keyboard:
    - `ArrowRight` → next.
    - `ArrowLeft` → previous.

- Closing:
  - ESC key.
  - Click outside the centered content (on the dark overlay).
  - Close button.

Images fade in with a simple opacity transition for a smooth appearance.

---

### 6. How to Customize

- **Add / remove images**
  - Edit `galleryBaseImages` in `script.js`.
  - Keep the relative path format (`images/your-image-name.jpg`).

- **Change aspect ratio**
  - Update the `aspect-[3/4]` class in the gallery item `className` to something like:
    - `aspect-[4/3]` for a bit wider frames.
    - `aspect-square` for square thumbnails.

- **Adjust how many images are on screen**
  - Change Tailwind width classes on the item:
    - `lg:w-1/3` (desktop), `sm:w-1/2` (tablet), and `w-full` (mobile) can be adjusted if you want different counts.

- **Tune infinite scroll feel**
  - `SEGMENT_COUNT`: increasing this gives more repeated segments before a recenter jump.
  - Threshold and `shiftAmount` in `handleGalleryScroll` control when and how far the scroll jumps back near the middle.

This gallery is designed to be:

- **Truly infinite** in both directions.
- **Drag‑first**, not wheel‑snapping.
- **Lightweight**, using only HTML + TailwindCSS + vanilla JavaScript with transform/scroll‑based movement for good performance.

