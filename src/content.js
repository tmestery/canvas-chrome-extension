(() => {
  if (!location.hostname.startsWith("canvas.")) return;

  // Prevent double-injection on SPA navigation
  if (document.getElementById("canvas-helper")) return;

  const style = document.createElement("style");
  style.textContent = `
  :root {
    --canvas-bg: rgba(255, 255, 255, 0.92);
    --canvas-text: #111827;
    --canvas-muted: #6b7280;
    --canvas-border: rgba(0,0,0,.08);

    --canvas-accent: #dc2626;
    --canvas-accent-dark: #991b1b;
    --canvas-accent-soft: #fca5a5;

    --canvas-panel-bg: rgba(255,255,255,.92);
  }

  body.ic-Layout--dark {
    --canvas-bg: rgba(17, 24, 39, 0.94);
    --canvas-text: #e5e7eb;
    --canvas-muted: #9ca3af;
    --canvas-border: rgba(255,255,255,.06);

    --canvas-panel-bg: rgba(17, 24, 39, 0.94);
  }

  #canvas-helper {
    position: fixed;
    top: 96px;
    right: 24px;
    width: 300px;
    max-height: calc(100vh - 140px);
    background: var(--canvas-panel-bg);
    backdrop-filter: blur(14px);
    border-radius: 18px;
    box-shadow:
      0 10px 30px rgba(0,0,0,.35),
      inset 0 1px 0 rgba(255,255,255,.05);
    z-index: 999999;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    color: var(--canvas-text);
  }

  #canvas-helper header {
    padding: 14px 16px;
    font-size: 14px;
    font-weight: 600;
    background: linear-gradient(
      135deg,
      var(--canvas-accent),
      var(--canvas-accent-dark)
    );
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
  }

  #canvas-helper-toggle {
    cursor: pointer;
    opacity: .7;
    transition: opacity .15s ease;
  }

  #canvas-helper-toggle:hover {
    opacity: 1;
  }

  #canvas-helper section {
    padding: 14px 16px;
    border-bottom: 1px solid var(--canvas-border);
  }

  #canvas-helper section:last-child {
    border-bottom: none;
  }

  #canvas-helper h3 {
    margin: 0 0 10px;
    font-size: 11px;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--canvas-accent-soft);
  }

  .canvas-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 0;
  }

  .canvas-item span {
    font-size: 13px;
    line-height: 1.35;
    color: var(--canvas-text);
  }

  .canvas-item strong {
    font-size: 12px;
    font-weight: 500;
    color: var(--canvas-accent-soft);
  }

  .canvas-muted {
    font-size: 11px;
    color: var(--canvas-muted);
  }

  #grades-list,
  #assignments-list {
    display: flex;
    flex-direction: column;
  }
`;
  document.head.appendChild(style);

  const panel = document.createElement("div");
  panel.id = "canvas-helper";
  panel.innerHTML = `
    <header>
      <span>Canvas Overview</span>
      <span id="canvas-helper-toggle">✕</span>
    </header>

    <section>
      <h3>Grades</h3>
      <div id="grades-list" class="canvas-muted">Loading…</div>
    </section>

    <section>
      <h3>Upcoming</h3>
      <div id="assignments-list" class="canvas-muted">Loading…</div>
    </section>
  `;
  document.body.appendChild(panel);
  const observer = new MutationObserver(() => {
  // Force reflow so CSS vars update instantly
  panel.style.display = "none";
  panel.offsetHeight;
  panel.style.display = "";
});

observer.observe(document.body, {
  attributes: true,
  attributeFilter: ["class"]
});


  document.getElementById("canvas-helper-toggle").onclick = () => {
    panel.remove();
  };
})();

// Attempt to read grades from dashboard cards
function getGrades() {
  const results = [];

  document.querySelectorAll(".ic-DashboardCard").forEach(card => {
    const title = card.querySelector(".ic-DashboardCard__header-title")?.innerText;
    const grade = card.querySelector(".ic-DashboardCard__header-subtitle")?.innerText;

    if (title && grade) {
      results.push({ title, grade });
    }
  });

  return results;
}

// Attempt to read upcoming assignments
function getUpcoming() {
  const results = [];

  document.querySelectorAll(".PlannerItem").forEach(item => {
    const title = item.querySelector(".PlannerItem__title")?.innerText;
    const date = item.querySelector(".PlannerItem__date")?.innerText;

    if (title && date) {
      results.push({ title, date });
    }
  });

  return results;
}

function renderGrades(grades) {
  const el = document.getElementById("grades-list");
  if (!grades.length) {
    el.textContent = "No grades found";
    return;
  }

  el.innerHTML = "";
  grades.forEach(g => {
    el.innerHTML += `
      <div class="canvas-item">
        <span>${g.title}</span>
        <strong>${g.grade}</strong>
      </div>
    `;
  });
}

function renderUpcoming(items) {
  const el = document.getElementById("assignments-list");
  if (!items.length) {
    el.textContent = "No upcoming work 🎉";
    return;
  }

  el.innerHTML = "";
  items.slice(0, 6).forEach(a => {
    el.innerHTML += `
      <div class="canvas-item">
        <span>${a.title}</span>
        <span class="canvas-muted">${a.date}</span>
      </div>
    `;
  });
}

function init() {
  renderGrades(getGrades());
  renderUpcoming(getUpcoming());
}

let attempts = 0;
const interval = setInterval(() => {
  attempts++;
  init();
  if (attempts > 10) clearInterval(interval);
}, 1000);