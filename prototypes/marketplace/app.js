// =============================================================================
// Train Marketplace — clickable prototype
// State: route + filters + selected coach IDs + form values + generated output
// =============================================================================

const state = {
  route: 'marketplace',          // 'marketplace' | 'profile' | 'gen' | 'plan'
  profileId: null,
  filterCategory: 'all',
  filterGoal: 'all',
  filterLevel: 'all',
  filterDays: 'all',
  search: '',
  selected: [],                  // coach IDs
  form: {
    goal: 'vertical jump',
    level: 'intermediate',
    days: 5,
    sessionLength: '60-90 min',
    equipment: 'full gym',
    notes: '',
  },
};

const app = document.getElementById('app');
const selectionBar = document.getElementById('selection-bar');

// ---------------------------------------------------------------- helpers
const initials = name => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const coachById = id => COACHES.find(c => c.id === id);
const accentFor = cat => CATEGORIES[cat]?.accent || '#6b7280';
const catLabel = cat => CATEGORIES[cat]?.label || cat;

function avatarHtml(coach, opts = {}) {
  const cls = opts.class || 'avatar';
  return `<div class="${cls}" style="background:${accentFor(coach.category)}">${initials(coach.name)}</div>`;
}

function navTo(route, opts = {}) {
  state.route = route;
  if (opts.profileId !== undefined) state.profileId = opts.profileId;
  render();
  window.scrollTo(0, 0);
}

// =============================================================================
// MARKETPLACE
// =============================================================================
function renderMarketplace() {
  const filtered = COACHES.filter(c => {
    if (state.filterCategory !== 'all' && c.category !== state.filterCategory) return false;
    if (state.filterGoal !== 'all' && !c.tags.goals.includes(state.filterGoal)) return false;
    if (state.filterLevel !== 'all' && !c.tags.levels.includes(state.filterLevel)) return false;
    if (state.search && !(`${c.name} ${c.tagline}`.toLowerCase().includes(state.search.toLowerCase()))) return false;
    return true;
  });

  const allGoals = [...new Set(COACHES.flatMap(c => c.tags.goals))].sort();
  const allLevels = ['beginner', 'intermediate', 'advanced'];

  app.innerHTML = `
    <section class="hero">
      <h1>Find your training team</h1>
      <p>Browse the world's best coaches and their philosophies. Pick the ones you trust, tell us about you, and generate a personalized plan that synthesizes their best programming.</p>
    </section>

    <section class="filter-bar">
      <input type="search" id="search" class="search" placeholder="Search coaches, programs, philosophies..." value="${state.search}" />
      <div class="chips" id="cat-chips">
        <button class="chip ${state.filterCategory === 'all' ? 'active' : ''}" data-cat="all">All</button>
        ${Object.entries(CATEGORIES).map(([key, cat]) => `
          <button class="chip ${state.filterCategory === key ? 'active' : ''}" data-cat="${key}">
            <span class="dot" style="background:${cat.accent}"></span>${cat.label}
          </button>
        `).join('')}
      </div>
      <div class="filter-row">
        <label>Goal:
          <select id="goal-filter">
            <option value="all">Any</option>
            ${allGoals.map(g => `<option value="${g}" ${state.filterGoal === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </label>
        <label>Level:
          <select id="level-filter">
            <option value="all">Any</option>
            ${allLevels.map(l => `<option value="${l}" ${state.filterLevel === l ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </label>
        <span class="result-count">${filtered.length} coach${filtered.length === 1 ? '' : 'es'}</span>
      </div>
    </section>

    <section class="grid">
      ${filtered.map(coach => `
        <article class="card ${state.selected.includes(coach.id) ? 'selected' : ''}" data-id="${coach.id}">
          <button class="card-select-btn" data-action="toggle" data-id="${coach.id}">✓</button>
          <div class="card-head">
            ${avatarHtml(coach)}
            <div class="card-meta">
              <div class="card-name">${coach.name}</div>
              <div class="card-handle">${coach.handle}</div>
              <div class="card-cat"><span class="dot" style="background:${accentFor(coach.category)}"></span>${catLabel(coach.category)}</div>
            </div>
          </div>
          <p class="card-tagline">${coach.tagline}</p>
          <div class="card-foot">
            <div class="stat-row">
              <span>★ ${coach.stats.rating}</span>
              <span>${coach.stats.followers}</span>
              <span>${coach.stats.programs} programs</span>
            </div>
          </div>
        </article>
      `).join('')}
      ${filtered.length === 0 ? `<div style="grid-column:1/-1;padding:64px 0;text-align:center;color:var(--text-2);">No coaches match those filters. <a href="#" id="reset-filters" style="color:var(--text);text-decoration:underline;">Reset</a></div>` : ''}
    </section>
  `;

  // event wiring
  document.getElementById('search').addEventListener('input', e => {
    state.search = e.target.value;
    renderMarketplace();
    renderSelectionBar();
  });
  document.querySelectorAll('#cat-chips .chip').forEach(el => {
    el.addEventListener('click', () => {
      state.filterCategory = el.dataset.cat;
      renderMarketplace();
      renderSelectionBar();
    });
  });
  document.getElementById('goal-filter').addEventListener('change', e => {
    state.filterGoal = e.target.value;
    renderMarketplace();
    renderSelectionBar();
  });
  document.getElementById('level-filter').addEventListener('change', e => {
    state.filterLevel = e.target.value;
    renderMarketplace();
    renderSelectionBar();
  });
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', e => {
      // if clicked the select button, toggle; otherwise navigate to profile
      if (e.target.dataset.action === 'toggle') {
        e.stopPropagation();
        toggleSelection(e.target.dataset.id);
        renderMarketplace();
        renderSelectionBar();
      } else {
        navTo('profile', { profileId: card.dataset.id });
      }
    });
  });
  const reset = document.getElementById('reset-filters');
  if (reset) reset.addEventListener('click', e => {
    e.preventDefault();
    state.filterCategory = 'all';
    state.filterGoal = 'all';
    state.filterLevel = 'all';
    state.search = '';
    renderMarketplace();
    renderSelectionBar();
  });
}

// =============================================================================
// PROFILE
// =============================================================================
function renderProfile() {
  const coach = coachById(state.profileId);
  if (!coach) return navTo('marketplace');
  const isAdded = state.selected.includes(coach.id);
  const dows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  app.innerHTML = `
    <section class="profile">
      <a href="#" class="back" id="back-link">← Back to marketplace</a>

      <div class="profile-head">
        ${avatarHtml(coach, { class: 'profile-avatar' })}
        <div class="profile-meta">
          <div class="profile-name">${coach.name}</div>
          <div class="profile-handle">${coach.handle} · ${catLabel(coach.category)}</div>
          <p class="profile-tagline">${coach.tagline}</p>
          <div class="profile-stats">
            <span><strong>★ ${coach.stats.rating}</strong> rating</span>
            <span><strong>${coach.stats.followers}</strong> followers</span>
            <span><strong>${coach.stats.programs}</strong> programs</span>
          </div>
        </div>
        <button class="profile-action ${isAdded ? 'added' : ''}" id="add-btn">
          ${isAdded ? '✓ Added to plan' : '+ Add to plan'}
        </button>
      </div>

      <div class="section">
        <h2>At a glance</h2>
        <div class="spec-table">
          <div class="spec-cell"><div class="label">Goals</div><div class="value">${coach.tags.goals.join(', ')}</div></div>
          <div class="spec-cell"><div class="label">Levels</div><div class="value">${coach.tags.levels.join(', ')}</div></div>
          <div class="spec-cell"><div class="label">Equipment</div><div class="value">${coach.tags.equipment.join(', ')}</div></div>
          <div class="spec-cell"><div class="label">Days/week</div><div class="value">${coach.tags.daysPerWeek}</div></div>
          <div class="spec-cell"><div class="label">Session length</div><div class="value">${coach.tags.sessionLength}</div></div>
          <div class="spec-cell"><div class="label">Category</div><div class="value">${catLabel(coach.category)}</div></div>
        </div>
      </div>

      <div class="section">
        <h2>Philosophy</h2>
        <p class="philosophy-text">${coach.philosophy}</p>
      </div>

      <div class="section">
        <h2>Core principles</h2>
        <div class="principles">
          ${coach.principles.map(p => `
            <div class="principle">
              <div class="principle-title">${p.title}</div>
              <div class="principle-body">${p.body}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section">
        <h2>Typical week</h2>
        <div class="week-grid">
          ${coach.weekStructure.map((day, i) => `
            <div class="week-day ${day.toLowerCase() === 'rest' ? 'rest' : ''}">
              <div class="dow">${dows[i]}</div>
              <div class="label">${day}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section">
        <h2>Featured videos</h2>
        <div class="video-grid">
          ${coach.videos.map(v => `
            <div class="video">
              <div class="thumb" style="background:linear-gradient(135deg, ${accentFor(coach.category)}22 0%, ${accentFor(coach.category)}44 100%)">
                <div class="play">▶</div>
                <div class="duration">${v.duration}</div>
              </div>
              <div class="video-meta">
                <div class="video-title">${v.title}</div>
                <div class="video-views">${v.views} views</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section">
        <h2>Is this right for you?</h2>
        <div class="fit-grid">
          <div class="fit-col best">
            <h4>Best for</h4>
            <ul>${coach.bestFor.map(b => `<li>${b}</li>`).join('')}</ul>
          </div>
          <div class="fit-col not">
            <h4>Probably not for</h4>
            <ul>${coach.notFor.map(b => `<li>${b}</li>`).join('')}</ul>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Pairs well with</h2>
        <div class="pairs">
          ${coach.pairsWith.map(id => {
            const p = coachById(id);
            if (!p) return '';
            return `
              <div class="pair-card" data-id="${p.id}">
                ${avatarHtml(p)}
                <div>
                  <div class="pair-name">${p.name}</div>
                  <div class="pair-cat">${catLabel(p.category)}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>
  `;

  document.getElementById('back-link').addEventListener('click', e => {
    e.preventDefault();
    navTo('marketplace');
  });
  document.getElementById('add-btn').addEventListener('click', () => {
    toggleSelection(coach.id);
    renderProfile();
    renderSelectionBar();
  });
  document.querySelectorAll('.pair-card').forEach(el => {
    el.addEventListener('click', () => navTo('profile', { profileId: el.dataset.id }));
  });
}

// =============================================================================
// GENERATOR FORM
// =============================================================================
function renderGen() {
  if (state.selected.length === 0) return navTo('marketplace');
  const goalOpts = ['vertical jump', 'hypertrophy', 'strength', 'endurance', 'aesthetics', 'longevity', 'general fitness'];
  const levelOpts = ['beginner', 'intermediate', 'advanced'];
  const sessionOpts = ['30-45 min', '45-60 min', '60-90 min', '90+ min'];
  const equipmentOpts = ['full gym', 'home gym', 'minimal', 'bodyweight only'];

  app.innerHTML = `
    <section class="gen">
      <a href="#" class="back" id="back-link">← Back to marketplace</a>
      <h1>Build your plan</h1>
      <p class="subtitle">We'll synthesize your selected coaches' philosophies into one coherent program.</p>

      <div class="selected-coaches">
        <div class="label">${state.selected.length} coach${state.selected.length === 1 ? '' : 'es'} selected</div>
        <div class="coach-pills">
          ${state.selected.map(id => {
            const c = coachById(id);
            return `<span class="coach-pill">
              ${avatarHtml(c)}
              ${c.name}
              <span class="x" data-id="${c.id}">×</span>
            </span>`;
          }).join('')}
        </div>
      </div>

      <div class="field">
        <label>What's your primary goal?</label>
        <select id="f-goal">
          ${goalOpts.map(g => `<option value="${g}" ${state.form.goal === g ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
      </div>

      <div class="field">
        <label>Your current level</label>
        <div class="radio-group" id="f-level">
          ${levelOpts.map(l => `<button class="radio-pill ${state.form.level === l ? 'active' : ''}" data-val="${l}">${l}</button>`).join('')}
        </div>
      </div>

      <div class="field">
        <label>Days per week you can train</label>
        <div class="radio-group" id="f-days">
          ${[3,4,5,6,7].map(d => `<button class="radio-pill ${state.form.days === d ? 'active' : ''}" data-val="${d}">${d}</button>`).join('')}
        </div>
      </div>

      <div class="field">
        <label>Session length</label>
        <div class="radio-group" id="f-session">
          ${sessionOpts.map(s => `<button class="radio-pill ${state.form.sessionLength === s ? 'active' : ''}" data-val="${s}">${s}</button>`).join('')}
        </div>
      </div>

      <div class="field">
        <label>Equipment access</label>
        <div class="radio-group" id="f-equipment">
          ${equipmentOpts.map(e => `<button class="radio-pill ${state.form.equipment === e ? 'active' : ''}" data-val="${e}">${e}</button>`).join('')}
        </div>
      </div>

      <div class="field">
        <label>Tell us about you</label>
        <textarea id="f-notes" placeholder="6'2 240lb. Squat 315, vert 28&quot;. Played D2 basketball, want to dunk again by August. Only have access to a commercial gym, no platform.">${state.form.notes}</textarea>
        <div class="help">Anything that shapes the plan: history, current numbers, target, constraints.</div>
      </div>

      <button class="gen-submit" id="gen-submit">Generate plan</button>
    </section>
  `;

  document.getElementById('back-link').addEventListener('click', e => {
    e.preventDefault();
    navTo('marketplace');
  });
  document.querySelectorAll('.coach-pill .x').forEach(el => {
    el.addEventListener('click', () => {
      toggleSelection(el.dataset.id);
      renderGen();
      renderSelectionBar();
    });
  });
  document.getElementById('f-goal').addEventListener('change', e => state.form.goal = e.target.value);
  document.getElementById('f-notes').addEventListener('input', e => state.form.notes = e.target.value);
  ['f-level','f-days','f-session','f-equipment'].forEach(id => {
    const map = { 'f-level': 'level', 'f-days': 'days', 'f-session': 'sessionLength', 'f-equipment': 'equipment' };
    document.querySelectorAll(`#${id} .radio-pill`).forEach(el => {
      el.addEventListener('click', () => {
        let v = el.dataset.val;
        if (id === 'f-days') v = parseInt(v, 10);
        state.form[map[id]] = v;
        renderGen();
      });
    });
  });
  document.getElementById('gen-submit').addEventListener('click', () => {
    runGeneration();
  });
}

// =============================================================================
// GENERATION (mocked) → PLAN OUTPUT
// =============================================================================
function runGeneration() {
  const steps = [
    'Reading the philosophies of your selected coaches…',
    'Mapping principles against your goal and constraints…',
    'Negotiating volume and intensity across blocks…',
    'Drafting your 16-week arc…',
    'Wiring KPIs and progression checkpoints…',
  ];

  app.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <h2 style="font-size:18px;font-weight:600;">Generating your plan</h2>
      <div id="loading-steps"></div>
    </div>
  `;

  const stepsEl = document.getElementById('loading-steps');
  steps.forEach((s, i) => {
    setTimeout(() => {
      const div = document.createElement('div');
      div.className = 'step';
      div.style.animationDelay = `${0.05}s`;
      div.textContent = s;
      stepsEl.appendChild(div);
    }, i * 500);
  });
  setTimeout(() => {
    state.route = 'plan';
    renderPlan();
    window.scrollTo(0, 0);
  }, steps.length * 500 + 400);
}

function renderPlan() {
  const coachNames = state.selected.map(id => coachById(id).name).join(' + ');
  const subtitle = SAMPLE_PLAN.meta.subtitleTemplate.replace('{coaches}', coachNames);

  app.innerHTML = `
    <section class="plan">
      <a href="#" class="back" id="back-link">← Edit inputs</a>

      <div class="plan-hero">
        <div class="eyebrow">Generated plan</div>
        <h1>${SAMPLE_PLAN.meta.title}</h1>
        <p class="subtitle">${subtitle}</p>
        <div class="plan-stats">
          <div class="plan-stat"><div class="label">Horizon</div><div class="value">${SAMPLE_PLAN.meta.horizon}</div></div>
          <div class="plan-stat"><div class="label">Days/week</div><div class="value">${state.form.days}</div></div>
          <div class="plan-stat"><div class="label">Session</div><div class="value">${state.form.sessionLength}</div></div>
          <div class="plan-stat"><div class="label">Goal</div><div class="value" style="text-transform:capitalize;">${state.form.goal}</div></div>
        </div>
      </div>

      <div class="rationale">
        <div class="label">How this plan was synthesized</div>
        ${SAMPLE_PLAN.rationale}
      </div>

      <div class="section">
        <h2 style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-3);font-weight:600;margin-bottom:14px;">Block structure</h2>
        <div class="blocks">
          ${SAMPLE_PLAN.blocks.map((b, i) => `
            <div class="block">
              <div class="block-num">Block ${i + 1}</div>
              <div class="block-name">${b.name.split(': ')[1] || b.name}</div>
              <div class="block-weeks">Weeks ${b.weeks}</div>
              <div class="block-focus">${b.focus}</div>
              <div class="block-source">Source: ${b.source}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section">
        <h2 style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-3);font-weight:600;margin-bottom:14px;">Sample week</h2>
        <div class="sample-week">
          <div class="header">${SAMPLE_PLAN.sampleWeek.label}</div>
          ${SAMPLE_PLAN.sampleWeek.days.map(d => `
            <div class="sample-day">
              <div class="dow">${d.day}</div>
              <div class="title">${d.title}</div>
              <div class="items">${d.items.join(' · ')}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section">
        <h2 style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-3);font-weight:600;margin-bottom:14px;">KPIs to track</h2>
        <div class="kpi-table">
          <div class="row head"><div>Metric</div><div>Baseline</div><div>Target</div><div>Tested</div></div>
          ${SAMPLE_PLAN.kpis.map(k => `
            <div class="row">
              <div><strong>${k.name}</strong></div>
              <div class="val">${k.baseline}</div>
              <div class="target">${k.target}</div>
              <div class="val">${k.measured}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="handoff">
        <div>
          <h3>Ready to execute?</h3>
          <div class="hand-text">Open this plan in Train and start logging tomorrow's session.</div>
        </div>
        <button onclick="alert('In production: opens this plan inside the Train app and starts the morning text + logging cycle.')">Open in Train →</button>
      </div>
    </section>
  `;

  document.getElementById('back-link').addEventListener('click', e => {
    e.preventDefault();
    navTo('gen');
  });
}

// =============================================================================
// SELECTION BAR (floating)
// =============================================================================
function toggleSelection(id) {
  const i = state.selected.indexOf(id);
  if (i >= 0) state.selected.splice(i, 1);
  else state.selected.push(id);
}

function renderSelectionBar() {
  const visible = state.selected.length > 0 && state.route === 'marketplace';
  selectionBar.classList.toggle('visible', visible);
  if (!visible) return;

  document.getElementById('selection-pills').innerHTML = state.selected.slice(0, 5).map(id => {
    const c = coachById(id);
    return `<div class="mini-avatar" style="background:${accentFor(c.category)}">${initials(c.name)}</div>`;
  }).join('');
  document.getElementById('selection-label').textContent =
    `${state.selected.length} coach${state.selected.length === 1 ? '' : 'es'} selected`;
}

document.getElementById('build-plan-btn').addEventListener('click', () => navTo('gen'));
document.getElementById('clear-btn').addEventListener('click', () => {
  state.selected = [];
  if (state.route === 'marketplace') renderMarketplace();
  renderSelectionBar();
});

// nav links
document.querySelectorAll('[data-route]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    navTo(el.dataset.route);
  });
});

// =============================================================================
// ROOT RENDER
// =============================================================================
function render() {
  if (state.route === 'marketplace') renderMarketplace();
  else if (state.route === 'profile') renderProfile();
  else if (state.route === 'gen') renderGen();
  else if (state.route === 'plan') renderPlan();
  renderSelectionBar();
}

render();
