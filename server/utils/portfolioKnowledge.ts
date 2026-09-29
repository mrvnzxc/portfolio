/*
 * Everything the portfolio assistant knows. Written from the site's sections and public/cv.pdf.
 * The bot answers only from this text, so update it when the portfolio changes.
 * Keep it compact: it rides along with every chat request, and Groq's free tier counts tokens per minute.
 */
export const PORTFOLIO_KNOWLEDGE = `
PROFILE
- Name: John Marvin E. Bautista (goes by Marvin). Software Engineer.
- Current role: Junior Software Developer at Brigada Distribution Incorporated.
- Based in General Santos City, Philippines (UTC+8). Open to remote work, freelance, full-time or consulting.
- Tagline: builds reliable, user-focused software that blends clean architecture with thoughtful design; currently exploring AI-assisted automation and modern web stacks.
- About: a problem-solver who enjoys translating complex requirements into intuitive interfaces and dependable APIs; values clean code, thoughtful UX and measurable impact. Comfortable across frontend, backend and DevOps handoffs. Champion for accessibility, performance and secure-by-default patterns.
- Interests: AI, developer tooling, clean UI. Goal: build products that scale with clarity.
- Soft skills: leadership, teamwork, communication, creativity.

EDUCATION
- Bachelor of Science in Information Systems, Cronasia Foundation College Inc., General Santos City (Aug 2022 - May 2026).

WORK EXPERIENCE
- Brigada Distribution Incorporated - Junior Software Developer (current job, present).
- Dean IT Services, General Santos City - Intern Junior Software Developer (Jan 2026 - Apr 2026):
  built a Law Office Management System with DOCX article upload; helped develop the MyLawyerPal SaaS project; built a Python web-scraping tool for automated data extraction.

PROJECTS
1. Payroll with Attendance System (Capstone Project, May - Dec 2025, role: programmer).
   Enterprise payroll and attendance platform with biometric validation and facial-recognition fallback checks, unifying attendance capture, identity validation and payroll computation for HR and finance teams.
   Problem: manual attendance and payroll were slow to reconcile, easy to dispute and weak on identity assurance.
   How: Java captures and validates fingerprints; Python facial recognition is the fallback/second factor and flags mismatches; approved attendance flows into a Laravel payroll service (shifts, overtime, absences, pay periods); MySQL keeps auditable history.
   Features: biometric authentication, facial recognition backup, automated payroll, attendance monitoring, payroll reports, government benefits monitoring.
   Stack: Java, Python, PHP/Laravel, MySQL.
2. NDDU Siena AR Campus Navigation System (AR platform, 2026).
   Real-time augmented-reality campus navigation guiding students, visitors and staff across facilities.
   How: Nuxt app loads building and path data from Supabase; WebXR anchors directions and markers in the camera view; Supabase realtime pushes route/point-of-interest updates; turn-by-turn cues, distance hints and destination cards.
   Features: AR routes, campus wayfinding, real-time updates, building search, on-site navigation cues.
   Stack: Nuxt, Supabase, WebXR, realtime.
3. ReedGrey Sales and Inventory System (merchandising suite, Apr - Jun 2026, role: programmer).
   Multi-branch sales and inventory platform centralising product movement, checkout and reporting; cuts manual product checking and spreadsheet reconciliation and gives real-time stock and sales visibility across branches.
   How: Nuxt/Vue branch workflows (catalog, stock intake, checkout, sales review); Supabase auth with role-based access for cashiers, staff and admins; POS transactions update inventory instantly and feed branch sales summaries.
   Features: product cataloging, inventory stocking, POS, cross-branch sales tracking, sales reporting, team management, inventory monitoring.
   Stack: Nuxt/Vue, Tailwind CSS, Supabase, POS module.

SKILLS
- Languages: Java, Python, JavaScript, PHP, TypeScript, C++.
- Frameworks: Laravel, React / Next.js, Vue / Nuxt, Tailwind CSS, Spring Boot, Node.js, Flask, Express.js, Angular.
- Data & tooling: MySQL, PostgreSQL, Supabase, GraphQL, PostGraphile, Docker, GitHub Actions, OpenCV, Firebase, RESTful APIs.

SERVICES
- Backend & APIs: reliable REST/GraphQL services, data models and integrations that stay scalable and secure.
- Frontend & UX: responsive, accessible UIs with clean component systems and thoughtful interactions.
- Automation & AI: automating workflows with Python, OpenCV and scripts to reduce manual ops.

AWARDS & ACHIEVEMENTS
- Programmer of the Year; Best in Capstone Project of the Year; Outstanding I.T.E Student of the Year; Programming Excellence Award.
- Three certificates (viewable and downloadable in the Achievements section) and several programming competitions (photos in Achievements).

CONTACT
- Email: johnmarvinbautista18@gmail.com
- Phone: +63 909 695 3266
- GitHub: https://github.com/mrvnzxc
- Facebook: https://www.facebook.com/jhnmrvnzxc - Instagram: https://www.instagram.com/jhnmrvnzxc/
- The Contact section on this page has a message form. Typical reply within 1 business day.
- CV: downloadable from the "Download CV" button at the top of the page, or the CV topic in this chat (/cv.pdf).
`.trim()
