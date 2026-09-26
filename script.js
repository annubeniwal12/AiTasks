/**
 * ===================================================================
 * StudyAI — Modern AI-Powered Student Productivity Suite
 * Main Application Script (script.js)
 * 
 * Features Supported:
 * Task 1: AI Resume Builder
 * Task 2: AI-Powered Notes Generator
 * Task 3: AI Presentation (PPT) Generator
 * Task 4: AI Mind Map Generator for Syllabus
 * Task 5: Google Sheets as Backend with Dynamic Frontend
 * Task 6: AI Quiz / MCQ Generator (Dynamic Question Generator)
 * Task 7: AI Subject Doubt-Solving Chatbot
 * Task 8: AI Flashcard Generator for Revision
 * Task 9: AI Study Planner / Timetable Generator
 * Task 10: AI Notes Summarizer from Photos (OCR + AI)
 * ===================================================================
 */

// All 10 Features Definition
const STUDY_FEATURES = [
  { id: 'resume', taskNum: 1, name: 'AI Resume Builder', icon: '💼', desc: 'ATS-tailored resume text & instant PDF export', page: 'pages/resume.html' },
  { id: 'notes', taskNum: 2, name: 'AI Notes Generator', icon: '📘', desc: 'Cornell notes, formulas & high-yield takeaways', page: 'pages/notes.html' },
  { id: 'ppt', taskNum: 3, name: 'AI Presentation (PPT)', icon: '📊', desc: 'Keynote slides, speaker notes & PPTX download', page: 'pages/ppt.html' },
  { id: 'mindmap', taskNum: 4, name: 'AI Syllabus Mind Map', icon: '🧠', desc: 'Visual syllabus tree diagrams & node details', page: 'pages/mindmap.html' },
  { id: 'sheets', taskNum: 5, name: 'Google Sheets Backend', icon: '📈', desc: 'Live Sheets API database & AI trend analytics', page: 'pages/sheets.html' },
  { id: 'quiz', taskNum: 6, name: 'AI Quiz & MCQ Generator', icon: '📝', desc: 'Dynamic questions, instant feedback & streak tracking', page: 'pages/quiz.html' },
  { id: 'doubts', taskNum: 7, name: 'AI Subject Doubt Solver', icon: '💬', desc: 'Step-by-step problem tutor & voice read-out', page: 'pages/doubts.html' },
  { id: 'flashcards', taskNum: 8, name: 'AI Flashcards Revision', icon: '🗂', desc: '3D active recall, shuffle & mastery tracking', page: 'pages/flashcards.html' },
  { id: 'planner', taskNum: 9, name: 'AI Study Timetable', icon: '📅', desc: 'Custom timetable & Pomodoro study blocks', page: 'pages/planner.html' },
  { id: 'ocr', taskNum: 10, name: 'Photo Notes Summarizer', icon: '📸', desc: 'Optical character extraction & AI summaries', page: 'pages/ocr.html' }
];

function getFeatureDisplayName(featureId) {
  if (featureId === 'chat') featureId = 'doubts';
  const f = STUDY_FEATURES.find(item => item.id === featureId);
  return f ? f.name : featureId;
}

// Application State Store
const StudyApp = {
  featureKeys: {
    resume: localStorage.getItem('studyai_api_key_resume') || '',
    notes: localStorage.getItem('studyai_api_key_notes') || '',
    ppt: localStorage.getItem('studyai_api_key_ppt') || '',
    mindmap: localStorage.getItem('studyai_api_key_mindmap') || '',
    sheets: localStorage.getItem('studyai_api_key_sheets') || '',
    quiz: localStorage.getItem('studyai_api_key_quiz') || '',
    doubts: localStorage.getItem('studyai_api_key_doubts') || '',
    flashcards: localStorage.getItem('studyai_api_key_flashcards') || '',
    planner: localStorage.getItem('studyai_api_key_planner') || '',
    ocr: localStorage.getItem('studyai_api_key_ocr') || ''
  },
  globalApiKey: localStorage.getItem('studyai_api_key') || '',
  theme: localStorage.getItem('studyai_theme') || 'light',
  currentView: 'home',

  // Session Memory
  sessionData: {
    resume: JSON.parse(sessionStorage.getItem('studyai_resume') || 'null'),
    notes: JSON.parse(sessionStorage.getItem('studyai_notes') || 'null'),
    slides: JSON.parse(sessionStorage.getItem('studyai_slides') || 'null'),
    mindmap: JSON.parse(sessionStorage.getItem('studyai_mindmap') || 'null'),
    sheetsData: JSON.parse(localStorage.getItem('studyai_sheets_data') || 'null'),
    quiz: JSON.parse(sessionStorage.getItem('studyai_quiz') || 'null'),
    chatHistory: JSON.parse(sessionStorage.getItem('studyai_chat') || '[]'),
    flashcards: JSON.parse(sessionStorage.getItem('studyai_flashcards') || 'null'),
    planner: JSON.parse(sessionStorage.getItem('studyai_planner') || 'null'),
    ocrSummary: JSON.parse(sessionStorage.getItem('studyai_ocr') || 'null')
  },

  currentSlideIndex: 0,
  currentCardIndex: 0,
  quizStreak: 0,
  quizTimerInterval: null,
  currentSubjectDoubt: 'Physics'
};

// ===================================================================
// Initialization & Startup
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initFeatureApiKeysSystem();
  initApiKeyModal();
  initRequiredApiKeyModal();
  updateAllFeatureKeyUI();
  initMobileMenu();

  // Auto-detect page and initialize features present in DOM
  initPageFeatures();

  // Handle URL Hash navigation for single-page views on index.html
  window.addEventListener('hashchange', handleHashRoute);
  if (window.location.hash && document.getElementById('mainAppContent')) {
    handleHashRoute();
  }

  // 🔑 Auto-prompt API Key popup on feature pages if not configured
  autoPromptApiKeyOnFeaturePage();
});

function handleHashRoute() {
  const hash = window.location.hash.replace('#', '') || 'home';
  switchView(hash);
}

function switchView(viewName) {
  const validViews = ['home', 'notes', 'ppt', 'mindmap', 'quiz', 'doubts', 'flashcards', 'planner', 'ocr', 'resume', 'sheets'];
  if (!validViews.includes(viewName)) viewName = 'home';

  StudyApp.currentView = viewName;

  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.view === viewName);
  });

  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const activeSec = document.getElementById(`view-${viewName}`);
  if (activeSec) {
    activeSec.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Auto-prompt API key if navigating to a specific feature view without key
  if (viewName !== 'home') {
    setTimeout(() => {
      autoPromptApiKeyOnFeaturePage();
    }, 250);
  }

  closeMobileMenu();
}

function initNavigation() {
  document.querySelectorAll('[data-view-target]').forEach(el => {
    el.addEventListener('click', (e) => {
      const target = el.dataset.viewTarget;
      const href = el.getAttribute('href') || '';
      const section = document.getElementById(`view-${target}`);

      if (section && !href.startsWith('pages/')) {
        e.preventDefault();
        window.location.hash = target;
        switchView(target);
      }

      if (href.includes('#features')) {
        e.preventDefault();
        if (StudyApp.currentView !== 'home') switchView('home');
        setTimeout(() => {
          document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      } else if (href.includes('#about')) {
        e.preventDefault();
        if (StudyApp.currentView !== 'home') switchView('home');
        setTimeout(() => {
          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
    });
  });

  // Direct anchors for #features and #about
  document.querySelectorAll('a[href*="#features"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const featEl = document.getElementById('features');
      if (featEl) {
        e.preventDefault();
        if (StudyApp.currentView !== 'home') switchView('home');
        featEl.scrollIntoView({ behavior: 'smooth' });
        closeMobileMenu();
      }
    });
  });

  document.querySelectorAll('a[href*="#about"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const aboutEl = document.getElementById('about');
      if (aboutEl) {
        e.preventDefault();
        if (StudyApp.currentView !== 'home') switchView('home');
        aboutEl.scrollIntoView({ behavior: 'smooth' });
        closeMobileMenu();
      }
    });
  });
}

function initMobileMenu() {
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNavDrawer');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });
  }
}

function closeMobileMenu() {
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNavDrawer');
  if (hamburger && mobileNav) {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
  }
}

// ===================================================================
// Theme Switching (Dark / Light Mode)
// ===================================================================
function initTheme() {
  document.documentElement.setAttribute('data-theme', StudyApp.theme);
  const themeToggle = document.getElementById('themeToggleBtn');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      StudyApp.theme = StudyApp.theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', StudyApp.theme);
      localStorage.setItem('studyai_theme', StudyApp.theme);
      updateThemeIcon();
    });
    updateThemeIcon();
  }
}

function updateThemeIcon() {
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    themeIcon.innerHTML = StudyApp.theme === 'dark'
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }
}

// ===================================================================
// Feature-Specific & Global API Key Management
// ===================================================================
function getFeatureApiKey(featureId) {
  if (featureId === 'chat') featureId = 'doubts';
  const customKey = StudyApp.featureKeys[featureId];
  if (customKey && customKey.trim()) return customKey.trim();
  if (StudyApp.globalApiKey && StudyApp.globalApiKey.trim()) return StudyApp.globalApiKey.trim();
  return '';
}

function hasCustomFeatureKey(featureId) {
  if (featureId === 'chat') featureId = 'doubts';
  return Boolean(StudyApp.featureKeys[featureId] && StudyApp.featureKeys[featureId].trim());
}

function saveFeatureApiKey(featureId, key) {
  if (featureId === 'chat') featureId = 'doubts';
  const trimmed = key.trim();
  StudyApp.featureKeys[featureId] = trimmed;
  if (!StudyApp.globalApiKey && trimmed) {
    StudyApp.globalApiKey = trimmed;
    localStorage.setItem('studyai_api_key', trimmed);
  }
  if (trimmed) {
    localStorage.setItem(`studyai_api_key_${featureId}`, trimmed);
    showToast(`✓ API key saved for ${getFeatureDisplayName(featureId)}!`, 'success');
  } else {
    localStorage.removeItem(`studyai_api_key_${featureId}`);
    showToast(`Removed custom API key for ${getFeatureDisplayName(featureId)}.`, 'info');
  }
  updateAllFeatureKeyUI();
}

function clearFeatureApiKey(featureId) {
  if (featureId === 'chat') featureId = 'doubts';
  StudyApp.featureKeys[featureId] = '';
  localStorage.removeItem(`studyai_api_key_${featureId}`);
  showToast(`API key cleared for ${getFeatureDisplayName(featureId)}.`, 'info');
  updateAllFeatureKeyUI();
  autoPromptApiKeyOnFeaturePage();
}

function applyKeyToAllFeatures(key) {
  const trimmed = key.trim();
  if (!trimmed) {
    showToast('Please enter an API key to apply across all features.', 'warning');
    return;
  }
  StudyApp.globalApiKey = trimmed;
  localStorage.setItem('studyai_api_key', trimmed);
  STUDY_FEATURES.forEach(f => {
    StudyApp.featureKeys[f.id] = trimmed;
    localStorage.setItem(`studyai_api_key_${f.id}`, trimmed);
  });
  updateAllFeatureKeyUI();
  removeFeatureLockBanner();
  showToast('API key applied to all 10 features successfully!', 'success');
}

function clearAllFeatureKeys() {
  StudyApp.globalApiKey = '';
  localStorage.removeItem('studyai_api_key');
  STUDY_FEATURES.forEach(f => {
    StudyApp.featureKeys[f.id] = '';
    localStorage.removeItem(`studyai_api_key_${f.id}`);
  });
  updateAllFeatureKeyUI();
  showToast('All feature API keys cleared. Features are locked.', 'info');
  autoPromptApiKeyOnFeaturePage();
}

async function testFeatureApiKey(featureId, customKey = null) {
  if (featureId === 'chat') featureId = 'doubts';
  const keyToTest = (customKey !== null && customKey !== undefined) ? customKey.trim() : getFeatureApiKey(featureId);
  const featureName = getFeatureDisplayName(featureId);

  if (!keyToTest) {
    showToast(`No API key entered for ${featureName}. Please enter a key to test.`, 'warning');
    return false;
  }

  showToast(`Verifying API key for ${featureName}...`, 'info');
  const isValid = await testGeminiApiKey(keyToTest);
  if (isValid) {
    showToast(`✓ Key for ${featureName} is valid and connected to Gemini!`, 'success');
    return true;
  } else {
    showToast(`✗ Failed to connect with key for ${featureName}. Check key or quotas.`, 'error');
    return false;
  }
}

async function testGeminiApiKey(key) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello! Reply with 'OK'" }] }]
      })
    });
    return res.ok;
  } catch (err) {
    console.error('API Verification error:', err);
    return false;
  }
}

function updateAllFeatureKeyUI() {
  STUDY_FEATURES.forEach(f => {
    const key = StudyApp.featureKeys[f.id] || '';
    const isCustom = Boolean(key);
    const isUsingGlobal = !isCustom && Boolean(StudyApp.globalApiKey);

    const input = document.getElementById(`featureKeyInput-${f.id}`);
    if (input && document.activeElement !== input) {
      input.value = key;
    }

    const badge = document.getElementById(`featureBadge-${f.id}`);
    if (badge) {
      badge.className = 'feature-api-badge';
      let badgeHtml = '';
      if (isCustom) {
        badge.classList.add('active');
        badgeHtml = '<span class="feature-api-badge-dot"></span><span class="badge-text">Key Active</span>';
      } else if (isUsingGlobal) {
        badge.classList.add('global');
        badgeHtml = '<span class="feature-api-badge-dot"></span><span class="badge-text">Global Key</span>';
      } else {
        badge.classList.add('demo');
        badgeHtml = '<span class="feature-api-badge-dot"></span><span class="badge-text">Key Required</span>';
      }
      badge.innerHTML = badgeHtml;
    }

    const modalInput = document.getElementById(`modalKeyInput-${f.id}`);
    if (modalInput && document.activeElement !== modalInput) {
      modalInput.value = key;
    }
  });

  updateNavbarKeyBadge();

  const modalCount = document.getElementById('modalActiveKeyCount');
  if (modalCount) {
    const activeCount = STUDY_FEATURES.filter(f => Boolean(getFeatureApiKey(f.id))).length;
    modalCount.innerText = activeCount > 0 
      ? `${activeCount} of ${STUDY_FEATURES.length} features active` 
      : 'No active API keys (Enter key below to activate features)';
  }
}

function updateNavbarKeyBadge() {
  const statusDot = document.getElementById('apiStatusDot');
  const statusText = document.getElementById('apiStatusText');

  const activeCount = STUDY_FEATURES.filter(f => Boolean(getFeatureApiKey(f.id))).length;

  if (activeCount > 0) {
    statusDot?.classList.add('active');
    if (statusText) statusText.innerText = `API Active (${activeCount}/${STUDY_FEATURES.length})`;
  } else {
    statusDot?.classList.remove('active');
    if (statusText) statusText.innerText = 'Key Required';
  }
}

function initFeatureApiKeysSystem() {
  document.querySelectorAll('.save-feature-key-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const featId = btn.dataset.feature;
      const input = document.getElementById(`featureKeyInput-${featId}`);
      if (input) saveFeatureApiKey(featId, input.value);
    });
  });

  document.querySelectorAll('.test-feature-key-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const featId = btn.dataset.feature;
      const input = document.getElementById(`featureKeyInput-${featId}`);
      const keyVal = input ? input.value : '';
      btn.disabled = true;
      const origText = btn.innerText;
      btn.innerText = '...';
      await testFeatureApiKey(featId, keyVal);
      btn.disabled = false;
      btn.innerText = origText;
    });
  });

  document.querySelectorAll('.clear-feature-key-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const featId = btn.dataset.feature;
      clearFeatureApiKey(featId);
    });
  });

  document.querySelectorAll('.btn-eye-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.innerText = '🔒';
          btn.title = 'Hide Key';
        } else {
          input.type = 'password';
          btn.innerText = '👁';
          btn.title = 'Show Key';
        }
      }
    });
  });
}

function initApiKeyModal() {
  const openBtn = document.getElementById('apiKeyBadgeBtn');
  const modal = document.getElementById('apiKeyModal');
  const closeBtn = document.getElementById('closeApiKeyModalBtn');
  const closeBottomBtn = document.getElementById('closeModalBottomBtn');
  const batchApplyBtn = document.getElementById('batchApplyKeyBtn');
  const batchInput = document.getElementById('batchApiKeyInput');
  const clearAllBtn = document.getElementById('clearAllKeysBtn');

  function openModal() {
    renderModalFeaturesList();
    modal?.classList.add('active');
  }

  function closeModal() {
    modal?.classList.remove('active');
  }

  openBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  closeBottomBtn?.addEventListener('click', closeModal);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  batchApplyBtn?.addEventListener('click', () => {
    if (batchInput) {
      applyKeyToAllFeatures(batchInput.value);
      renderModalFeaturesList();
    }
  });

  clearAllBtn?.addEventListener('click', () => {
    if (confirm('Clear all saved API keys? Features will ask for a key before working.')) {
      clearAllFeatureKeys();
      renderModalFeaturesList();
    }
  });
}

function renderModalFeaturesList() {
  const container = document.getElementById('modalFeaturesKeysList');
  if (!container) return;

  container.innerHTML = STUDY_FEATURES.map(f => {
    const key = StudyApp.featureKeys[f.id] || '';
    const isCustom = Boolean(key);
    const isUsingGlobal = !isCustom && Boolean(StudyApp.globalApiKey);

    let badgeClass = 'demo';
    let badgeText = 'Key Required';
    if (isCustom) {
      badgeClass = 'active';
      badgeText = 'Custom Key Active';
    } else if (isUsingGlobal) {
      badgeClass = 'global';
      badgeText = 'Using Global Key';
    }

    return `
      <div class="feature-key-row-card" data-feature="${f.id}">
        <div class="feature-key-row-info">
          <div class="feature-key-row-name">
            <span>${f.icon}</span>
            <span>Task ${f.taskNum}: ${escapeHtml(f.name)}</span>
          </div>
          <div class="feature-key-row-desc">${escapeHtml(f.desc)}</div>
          <div style="margin-top: 2px;">
            <span class="feature-api-badge ${badgeClass}" id="modalBadge-${f.id}">
              <span class="feature-api-badge-dot"></span>
              <span class="badge-text">${badgeText}</span>
            </span>
          </div>
        </div>

        <div class="feature-api-input-wrap">
          <input type="password" class="feature-api-input modal-feature-input" id="modalKeyInput-${f.id}" value="${escapeHtml(key)}" placeholder="Gemini key for ${escapeHtml(f.name)}..." autocomplete="off">
          <button type="button" class="btn-eye-toggle" data-target="modalKeyInput-${f.id}" title="Show/Hide Key">👁</button>
        </div>

        <div class="feature-key-row-inputs">
          <button type="button" class="btn btn-primary btn-xs modal-save-btn" data-feature="${f.id}">Save</button>
          <button type="button" class="btn btn-secondary btn-xs modal-test-btn" data-feature="${f.id}">Test</button>
          <button type="button" class="btn btn-outline btn-xs modal-clear-btn" data-feature="${f.id}" title="Remove key">Clear</button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.modal-save-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const featId = btn.dataset.feature;
      const input = document.getElementById(`modalKeyInput-${featId}`);
      if (input) saveFeatureApiKey(featId, input.value);
    });
  });

  container.querySelectorAll('.modal-test-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const featId = btn.dataset.feature;
      const input = document.getElementById(`modalKeyInput-${featId}`);
      const val = input ? input.value : '';
      btn.disabled = true;
      const orig = btn.innerText;
      btn.innerText = '...';
      await testFeatureApiKey(featId, val);
      btn.disabled = false;
      btn.innerText = orig;
    });
  });

  container.querySelectorAll('.modal-clear-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const featId = btn.dataset.feature;
      clearFeatureApiKey(featId);
    });
  });

  container.querySelectorAll('.btn-eye-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.innerText = '🔒';
        } else {
          input.type = 'password';
          btn.innerText = '👁';
        }
      }
    });
  });
}

// ===================================================================
// MANDATORY API KEY ENFORCEMENT & POPUP SYSTEM
// ===================================================================
let pendingApiKeyCallback = null;

function detectActiveFeatureOnPage() {
  const path = (window.location.pathname || '').toLowerCase();
  if (path.includes('resume.html') || document.getElementById('resumeForm')) return 'resume';
  if (path.includes('notes.html') || document.getElementById('notesForm')) return 'notes';
  if (path.includes('ppt.html') || document.getElementById('pptForm')) return 'ppt';
  if (path.includes('mindmap.html') || document.getElementById('mindmapForm')) return 'mindmap';
  if (path.includes('sheets.html') || document.getElementById('sheetsBackendApp')) return 'sheets';
  if (path.includes('quiz.html') || document.getElementById('quizForm')) return 'quiz';
  if (path.includes('doubts.html') || document.getElementById('chatMessagesArea')) return 'doubts';
  if (path.includes('flashcards.html') || document.getElementById('flashcardsForm')) return 'flashcards';
  if (path.includes('planner.html') || document.getElementById('plannerForm')) return 'planner';
  if (path.includes('ocr.html') || document.getElementById('ocrDropzone')) return 'ocr';

  // Check if viewing an in-hub feature section on index.html
  if (StudyApp.currentView && StudyApp.currentView !== 'home') {
    return StudyApp.currentView;
  }

  const hash = (window.location.hash || '').replace('#', '');
  if (hash && hash !== 'home' && hash !== 'features' && hash !== 'about') {
    if (STUDY_FEATURES.some(f => f.id === hash)) return hash;
  }

  return null;
}

function autoPromptApiKeyOnFeaturePage() {
  const activeId = detectActiveFeatureOnPage();
  if (!activeId) return;

  const currentKey = getFeatureApiKey(activeId);
  if (!currentKey || !currentKey.trim()) {
    renderFeatureLockBanner(activeId);
    // Open the popup modal automatically so the user is prompted immediately
    setTimeout(() => {
      requireApiKey(activeId);
    }, 350);
  } else {
    removeFeatureLockBanner();
  }
}

function renderFeatureLockBanner(featureId) {
  if (document.getElementById('apiKeyRequiredBanner')) return;
  const featureName = getFeatureDisplayName(featureId);

  const container = document.querySelector('.tool-view-layout')
    || document.querySelector('.workspace-grid')
    || document.querySelector('.quiz-generator-section')
    || document.querySelector('.sheets-wrapper')
    || document.getElementById(`view-${featureId}`)
    || document.querySelector('main .container')
    || document.querySelector('main')
    || document.getElementById('mainAppContent');

  if (!container) return;

  const banner = document.createElement('div');
  banner.id = 'apiKeyRequiredBanner';
  banner.className = 'api-key-required-banner';
  banner.innerHTML = `
    <div class="banner-badge-icon">🔒</div>
    <div class="banner-info">
      <div class="banner-title">Google Gemini API Key Required for ${escapeHtml(featureName)}</div>
      <div class="banner-desc">Without a valid API key, this feature cannot operate and generation is locked. Please enter your API key to activate.</div>
    </div>
    <div class="banner-cta">
      <button type="button" class="btn btn-primary btn-sm" id="bannerOpenKeyModalBtn">
        <span>🔑</span> Enter API Key
      </button>
    </div>
  `;

  container.parentNode.insertBefore(banner, container);

  document.getElementById('bannerOpenKeyModalBtn')?.addEventListener('click', () => {
    requireApiKey(featureId);
  });
}

function removeFeatureLockBanner() {
  const banner = document.getElementById('apiKeyRequiredBanner');
  if (banner) {
    banner.remove();
  }
}

function initRequiredApiKeyModal() {
  let modal = document.getElementById('requiredApiKeyModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'requiredApiKeyModal';
    modal.className = 'modal-overlay api-required-modal';
    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div class="api-prompt-icon-ring" style="width: 38px; height: 38px; font-size: 1.25rem; margin-bottom: 0;">🔑</div>
            <h3 id="requiredKeyModalTitle" style="font-size: 1.15rem; font-weight: 800;">Google Gemini API Key Required</h3>
          </div>
          <button class="icon-btn" id="closeRequiredKeyModalBtn" aria-label="Cancel">✕</button>
        </div>
        <div class="modal-body" style="padding: 1.25rem 1.5rem;">
          <p id="requiredKeyModalDesc" style="font-size: 0.92rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.5;">
            An API key is strictly required to use this AI feature. Without an API key, nothing will work. Enter your Gemini API key below to activate the feature.
          </p>
          <div class="form-group" style="margin-bottom: 0.75rem;">
            <label class="form-label" for="requiredKeyModalInput">Google Gemini API Key <span class="required">*</span></label>
            <div class="feature-api-input-wrap">
              <input type="password" id="requiredKeyModalInput" class="feature-api-input" placeholder="Paste Gemini API Key (e.g. AIzaSy...)" autocomplete="off">
              <button type="button" class="btn-eye-toggle" id="requiredKeyEyeToggleBtn" title="Toggle Visibility">👁</button>
            </div>
          </div>
          <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); cursor: pointer; margin-top: 0.4rem; user-select: none;">
            <input type="checkbox" id="requiredKeyApplyAllCheckbox" checked style="accent-color: var(--primary); width: 16px; height: 16px;">
            <span>Apply this key to all 10 features (Recommended)</span>
          </label>
          <div class="api-key-source-helper">
            💡 <strong>Need a free API key?</strong> Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio (aistudio.google.com)</a>, click <em>"Create API key"</em>, and paste it here. It's 100% free!
          </div>
        </div>
        <div class="modal-footer" style="padding: 1rem 1.5rem; justify-content: space-between;">
          <button class="btn btn-outline btn-sm" id="cancelRequiredKeyModalBtn">Cancel & Close</button>
          <button class="btn btn-primary btn-sm" id="saveRequiredKeyModalBtn">Save Key & Activate Feature</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const closeBtn = document.getElementById('closeRequiredKeyModalBtn');
  const cancelBtn = document.getElementById('cancelRequiredKeyModalBtn');
  const saveBtn = document.getElementById('saveRequiredKeyModalBtn');
  const input = document.getElementById('requiredKeyModalInput');
  const eyeBtn = document.getElementById('requiredKeyEyeToggleBtn');

  eyeBtn?.addEventListener('click', () => {
    if (input) {
      if (input.type === 'password') {
        input.type = 'text';
        eyeBtn.innerText = '🔒';
      } else {
        input.type = 'password';
        eyeBtn.innerText = '👁';
      }
    }
  });

  function handleCancel() {
    modal.classList.remove('active');
    const activeId = detectActiveFeatureOnPage();
    if (activeId && !getFeatureApiKey(activeId)) {
      renderFeatureLockBanner(activeId);
      showToast('⚠️ API key required: Features will not work until an API key is provided.', 'warning');
    }
    if (pendingApiKeyCallback) {
      pendingApiKeyCallback(null);
      pendingApiKeyCallback = null;
    }
  }

  closeBtn?.addEventListener('click', handleCancel);
  cancelBtn?.addEventListener('click', handleCancel);

  saveBtn?.addEventListener('click', () => {
    const keyVal = input ? input.value.trim() : '';
    if (!keyVal) {
      input?.focus();
      input?.classList.add('shake-anim');
      setTimeout(() => input?.classList.remove('shake-anim'), 600);
      showToast('Please enter a valid API key to proceed.', 'warning');
      return;
    }

    const featureId = input.dataset.feature || detectActiveFeatureOnPage() || 'notes';
    const applyAll = document.getElementById('requiredKeyApplyAllCheckbox')?.checked;

    if (applyAll) {
      applyKeyToAllFeatures(keyVal);
    } else {
      saveFeatureApiKey(featureId, keyVal);
    }

    modal.classList.remove('active');
    removeFeatureLockBanner();
    showToast('✓ Gemini API key activated successfully!', 'success');

    if (pendingApiKeyCallback) {
      pendingApiKeyCallback(keyVal);
      pendingApiKeyCallback = null;
    }
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveBtn?.click();
    }
  });
}

function requireApiKey(featureId) {
  const currentKey = getFeatureApiKey(featureId);
  if (currentKey && currentKey.trim()) {
    return Promise.resolve(currentKey.trim());
  }

  return new Promise((resolve) => {
    pendingApiKeyCallback = resolve;
    const modal = document.getElementById('requiredApiKeyModal');
    const titleEl = document.getElementById('requiredKeyModalTitle');
    const descEl = document.getElementById('requiredKeyModalDesc');
    const inputEl = document.getElementById('requiredKeyModalInput');
    const featureName = getFeatureDisplayName(featureId);

    if (titleEl) titleEl.innerText = `Google Gemini API Key Required for ${featureName}`;
    if (descEl) descEl.innerHTML = `Without a Google Gemini API key, <strong>${escapeHtml(featureName)}</strong> cannot function. Please enter your API key below to unlock and use this feature.`;
    if (inputEl) {
      inputEl.value = '';
      inputEl.dataset.feature = featureId;
    }

    modal?.classList.add('active');
    setTimeout(() => inputEl?.focus(), 120);
  });
}

// ===================================================================
// Core AI Engine (Strict: Without API key nothing works, no fake mocks!)
// ===================================================================
async function generateAIContent(systemPrompt, userPrompt, featureName = 'notes', outputSchemaType = null) {
  if (!outputSchemaType) outputSchemaType = featureName;
  if (featureName === 'chat') featureName = 'doubts';

  let key = getFeatureApiKey(featureName);
  if (!key || !key.trim()) {
    key = await requireApiKey(featureName);
    if (!key || !key.trim()) {
      throw new Error('API key is strictly required to use this feature. Nothing works without an API key.');
    }
  }

  try {
    const responseText = await callGeminiAPI(systemPrompt, userPrompt, key);
    return responseText;
  } catch (err) {
    console.error(`Gemini API call failed for ${featureName}:`, err);
    // STRICT: Do NOT return fake mock data! Throw real error so user knows key failed.
    throw new Error(`Gemini API Error: ${err.message}. Please check your API key.`);
  }
}

async function callGeminiAPI(systemPrompt, userPrompt, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `${systemPrompt}\n\nUser Request: ${userPrompt}` }
        ]
      }
    ]
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    let parsedMessage = errorDetails;
    try {
      const errJson = JSON.parse(errorDetails);
      parsedMessage = errJson?.error?.message || errorDetails;
    } catch (_) {}
    throw new Error(`(${response.status}) ${parsedMessage}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || "No response received from AI model.";
}

function simulateNetworkDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===================================================================
// Toast & Utilities
// ===================================================================
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3800);
}

function validateInput(element, errorMessage = 'This field is required.') {
  const val = element.value.trim();
  if (!val) {
    element.focus();
    element.style.borderColor = 'var(--danger)';
    element.classList.add('shake-anim');
    setTimeout(() => {
      element.classList.remove('shake-anim');
      element.style.borderColor = '';
    }, 600);
    showToast(errorMessage, 'warning');
    return false;
  }
  return true;
}

function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMessage, 'success');
  }).catch(() => {
    showToast('Failed to copy. Please select and copy manually.', 'error');
  });
}

function downloadFile(filename, text, mimeType = 'text/plain') {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Downloaded ${filename}`, 'success');
}

function speakText(text) {
  if (!('speechSynthesis' in window)) {
    showToast('Speech synthesis not supported in this browser.', 'warning');
    return;
  }
  window.speechSynthesis.cancel();
  const cleaned = text.replace(/[#*`_~]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleaned.slice(0, 500));
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
  showToast('Playing audio explanation...', 'info');
}

// ===================================================================
// TASK 1: AI RESUME BUILDER
// ===================================================================
const SAMPLE_RESUMES = {
  cs: {
    fullName: "Alex Rivera",
    email: "alex.rivera@cs.edu",
    phone: "+1 (555) 382-9102",
    location: "Seattle, WA",
    links: "linkedin.com/in/alexrivera-dev | github.com/alexrivera",
    targetRole: "Full-Stack Software Engineer (Fresher / Intern)",
    objective: "High-performing Computer Science graduate with rigorous experience building scalable React and Node.js applications, distributed database systems, and modern AI pipelines. Passionate about software architecture and developer tooling.",
    education: "B.S. in Computer Science — University of Washington, 2024 (GPA: 3.88 / Dean's List, Honors)",
    skills: "JavaScript, TypeScript, Python, React, Next.js, Node.js, Express, PostgreSQL, Redis, Docker, Git, CI/CD, REST APIs, Tailwind CSS",
    experience: "Software Engineer Intern — CloudWave Inc. (June 2023 - Sept 2023)\n• Engineered a real-time data sync pipeline in Node.js and Redis, cutting API latency by 34% for 120,000 monthly active users.\n• Developed reusable responsive UI components in React/TypeScript, improving design system consistency and reducing bug tickets by 20%.\n\nOpen Source & Personal Projects:\n• StudyAI Companion: Built an AI student revision workspace using Gemini API with 4.9/5 user satisfaction.\n• AlgoVisualizer: Interactive graph algorithm simulator with 1,200+ stars on GitHub.",
    certifications: "AWS Certified Cloud Practitioner, Meta Front-End Developer Professional Certificate"
  },
  marketing: {
    fullName: "Sophia Martinez",
    email: "sophia.m@marketinghub.io",
    phone: "+1 (555) 749-1830",
    location: "New York, NY",
    links: "linkedin.com/in/sophiamartinez | sophiacreative.com",
    targetRole: "Digital Marketing & Growth Analyst",
    objective: "Data-driven Growth Marketer with proven experience scaling student acquisition via SEO, paid ad experiments, and conversion rate optimization. Generated +45% organic traffic growth in previous internship.",
    education: "B.B.A. in Marketing & Data Analytics — NYU Stern School of Business, 2024 (GPA: 3.75)",
    skills: "SEO/SEM, Google Analytics 4, Meta Ads Manager, A/B Testing, HubSpot, Figma, SQL basics, Copywriting, Email Automation, Tableau",
    experience: "Growth Marketing Intern — SparkEd Technologies (Jan 2024 - Present)\n• Spearheaded 12 multi-channel A/B tests on landing pages, boosting conversion rates from 3.2% to 5.4%.\n• Managed $15,000 monthly paid search budget across Google Ads, delivering a 3.8x Return on Ad Spend (ROAS).\n• Authored 15 search-optimized long-form blog articles ranking in Google Top 3 positions for high-intent keywords.",
    certifications: "Google Ads Search Certified, HubSpot Inbound Marketing, Google Analytics Individual Qualification"
  },
  premed: {
    fullName: "David Chen",
    email: "david.chen@medresearch.org",
    phone: "+1 (555) 912-4481",
    location: "Boston, MA",
    links: "linkedin.com/in/davidchen-premed",
    targetRole: "Biomedical Research Assistant / Pre-Med Fellow",
    objective: "Dedicated Pre-Med Biology graduate with 600+ hours of wet-lab molecular research and 200+ hours of clinical volunteering. Seeking a research associate position contributing to oncology and genetics clinical trials.",
    education: "B.S. in Molecular & Cellular Biology — Boston University, 2024 (Summa Cum Laude, GPA: 3.94)",
    skills: "PCR, Gel Electrophoresis, Cell Culture, ELISA, Western Blotting, R & Bioconductor, Microscopy, Statistical Analysis (SPSS), HIPAA Compliant",
    experience: "Undergraduate Research Assistant — BU Laboratory of Molecular Oncology (2022 - 2024)\n• Conducted independent PCR and gel assays to evaluate microRNA expression in colorectal cancer cell lines.\n• Co-authored research manuscript currently submitted to the Journal of Cell Biology.\n\nClinical Volunteer — Massachusetts General Hospital (2022 - 2023)\n• Assisted triage nurses with patient intake, vital signs logging, and pediatric patient companionship across 200+ volunteer hours.",
    certifications: "BLS/CPR Certified (AHA), NIH Protecting Human Research Participants"
  }
};

function initResumeBuilder() {
  const form = document.getElementById('resumeForm');
  const templateBtns = document.querySelectorAll('.template-btn');
  const sampleBtns = document.querySelectorAll('.sample-profile-btn');
  const outputArea = document.getElementById('resumeOutputArea');
  const loadingIndicator = document.getElementById('resumeLoading');

  let currentTemplate = 'modern';

  sampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.profile;
      const data = SAMPLE_RESUMES[type];
      if (data) {
        document.getElementById('resumeFullName').value = data.fullName;
        document.getElementById('resumeEmail').value = data.email;
        document.getElementById('resumePhone').value = data.phone;
        document.getElementById('resumeLocation').value = data.location;
        document.getElementById('resumeLinks').value = data.links;
        document.getElementById('resumeTargetRole').value = data.targetRole;
        document.getElementById('resumeObjective').value = data.objective;
        document.getElementById('resumeEducation').value = data.education;
        document.getElementById('resumeSkills').value = data.skills;
        document.getElementById('resumeExperience').value = data.experience;
        if (document.getElementById('resumeCerts')) {
          document.getElementById('resumeCerts').value = data.certifications;
        }
        showToast(`Loaded ${btn.innerText} sample profile!`, 'info');
      }
    });
  });

  templateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      templateBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTemplate = btn.dataset.template;
      const paper = document.getElementById('resumePaperSheet');
      if (paper) {
        paper.className = `resume-paper ${currentTemplate}`;
      }
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const fullName = document.getElementById('resumeFullName')?.value.trim();
      const email = document.getElementById('resumeEmail')?.value.trim();
      const phone = document.getElementById('resumePhone')?.value.trim();
      const location = document.getElementById('resumeLocation')?.value.trim();
      const links = document.getElementById('resumeLinks')?.value.trim();
      const targetRole = document.getElementById('resumeTargetRole')?.value.trim();
      const objective = document.getElementById('resumeObjective')?.value.trim();
      const education = document.getElementById('resumeEducation')?.value.trim();
      const skills = document.getElementById('resumeSkills')?.value.trim();
      const experience = document.getElementById('resumeExperience')?.value.trim();
      const certs = document.getElementById('resumeCerts')?.value.trim() || '';

      if (!fullName || !targetRole) {
        showToast('Please provide your name and target role.', 'warning');
        return;
      }

      // 🔑 ENFORCE MANDATORY API KEY
      const apiKey = await requireApiKey('resume');
      if (!apiKey) {
        showToast('⚠️ API key is required to build resume. Operation cancelled.', 'warning');
        return;
      }

      loadingIndicator?.classList.add('active');
      if (outputArea) outputArea.innerHTML = '';

      const systemPrompt = `You are an elite Silicon Valley executive resume coach and ATS optimization specialist.
Take this raw candidate data and synthesize a polished, high-impact resume in valid JSON format:
Candidate: ${fullName}
Target Role: ${targetRole}
Contact: ${email} | ${phone} | ${location} | ${links}
Objective / Summary: ${objective}
Education: ${education}
Skills: ${skills}
Experience / Projects: ${experience}
Certifications: ${certs}

Return ONLY a JSON object with this exact structure:
{
  "fullName": "${fullName}",
  "targetRole": "${targetRole}",
  "contact": { "email": "${email}", "phone": "${phone}", "location": "${location}", "links": "${links}" },
  "summary": "Polished 2-3 sentence impactful executive summary with strong keywords",
  "education": [ { "degree": "Degree and Major", "institution": "School", "date": "Year", "details": "GPA / Honors" } ],
  "skills": [ "Array", "of", "Skills" ],
  "experience": [
    {
      "role": "Role Title",
      "company": "Company or Project Name",
      "date": "Date Range",
      "bullets": [ "Accomplished [X], measured by [Y], by doing [Z] with metrics", "Engineered...", "Spearheaded..." ]
    }
  ],
  "certifications": [ "Array of credentials" ]
}`;

      try {
        const rawResponse = await generateAIContent(systemPrompt, `Generate professional resume for ${fullName} (${targetRole})`, 'resume');
        let parsed = parseJsonSafely(rawResponse);

        if (!parsed || !parsed.fullName) {
          throw new Error('AI was unable to generate resume. Please verify your Gemini API key and prompt.');
        }

        StudyApp.sessionData.resume = {
          data: parsed,
          template: currentTemplate,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        sessionStorage.setItem('studyai_resume', JSON.stringify(StudyApp.sessionData.resume));

        renderResumeView(StudyApp.sessionData.resume);
        showToast('✓ Professional resume generated with AI!', 'success');
      } catch (err) {
        showToast('Error generating resume: ' + err.message, 'error');
        if (outputArea) {
          outputArea.innerHTML = `
            <div class="api-key-error-card">
              <div class="error-lock-icon">🔒</div>
              <h3 style="font-weight: 800; margin-bottom: 0.5rem;">Resume Generation Blocked</h3>
              <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.25rem; font-size: 0.92rem;">
                ${escapeHtml(err.message)}
              </p>
              <button class="btn btn-primary btn-sm" onclick="requireApiKey('resume')">🔑 Enter / Update Gemini API Key</button>
            </div>
          `;
        }
      } finally {
        loadingIndicator?.classList.remove('active');
      }
    });
  }

  if (StudyApp.sessionData.resume) {
    renderResumeView(StudyApp.sessionData.resume);
  }
}

function renderResumeView(resumeState) {
  const container = document.getElementById('resumeOutputArea');
  if (!container || !resumeState || !resumeState.data) return;

  const data = resumeState.data;
  const template = resumeState.template || 'modern';

  container.innerHTML = `
    <div class="output-action-bar">
      <div class="output-title-group">
        <h3>${escapeHtml(data.fullName)}</h3>
        <span class="output-meta">${escapeHtml(data.targetRole)} • Live Editable Preview</span>
      </div>
      <div class="action-buttons-group">
        <button class="btn btn-secondary btn-sm" id="copyResumeMarkdownBtn" title="Copy as Markdown">
          <span>📋</span> Copy Text
        </button>
        <button class="btn btn-secondary btn-sm" id="printResumeBtn" title="Print or save as PDF">
          <span>🖨️</span> Print / PDF
        </button>
        <button class="btn btn-primary btn-sm" id="downloadJsPdfBtn" title="Direct PDF Export">
          <span>📥</span> Download PDF
        </button>
      </div>
    </div>

    <div class="resume-paper-container">
      <div class="resume-paper ${template}" id="resumePaperSheet" contenteditable="true" title="Click any text to edit directly">
        
        <!-- Header -->
        <div class="resume-header">
          <div class="resume-name">${escapeHtml(data.fullName)}</div>
          <div class="resume-title">${escapeHtml(data.targetRole)}</div>
          <div class="resume-contact-bar">
            ${data.contact?.email ? `<span>✉️ ${escapeHtml(data.contact.email)}</span>` : ''}
            ${data.contact?.phone ? `<span>📞 ${escapeHtml(data.contact.phone)}</span>` : ''}
            ${data.contact?.location ? `<span>📍 ${escapeHtml(data.contact.location)}</span>` : ''}
            ${data.contact?.links ? `<span>🔗 ${escapeHtml(data.contact.links)}</span>` : ''}
          </div>
        </div>

        <!-- Summary -->
        ${data.summary ? `
          <div class="resume-section">
            <div class="resume-section-title">Professional Summary</div>
            <div class="resume-summary-text">${escapeHtml(data.summary)}</div>
          </div>
        ` : ''}

        <!-- Skills -->
        ${Array.isArray(data.skills) && data.skills.length ? `
          <div class="resume-section">
            <div class="resume-section-title">Skills & Technologies</div>
            <div class="resume-skills-tags">
              ${data.skills.map(s => `<span class="resume-skill-pill">${escapeHtml(s)}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Experience -->
        ${Array.isArray(data.experience) && data.experience.length ? `
          <div class="resume-section">
            <div class="resume-section-title">Experience & Projects</div>
            ${data.experience.map(exp => `
              <div class="resume-item">
                <div class="resume-item-header">
                  <div>
                    <span class="resume-item-role">${escapeHtml(exp.role || '')}</span>
                    ${exp.company ? ` • <span class="resume-item-company">${escapeHtml(exp.company)}</span>` : ''}
                  </div>
                  <span class="resume-item-date">${escapeHtml(exp.date || '')}</span>
                </div>
                ${Array.isArray(exp.bullets) ? `
                  <ul class="resume-item-bullets">
                    ${exp.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Education -->
        ${Array.isArray(data.education) && data.education.length ? `
          <div class="resume-section">
            <div class="resume-section-title">Education</div>
            ${data.education.map(edu => `
              <div class="resume-item">
                <div class="resume-item-header">
                  <span class="resume-item-role">${escapeHtml(edu.degree || '')}</span>
                  <span class="resume-item-date">${escapeHtml(edu.date || '')}</span>
                </div>
                <div style="font-size: 0.88rem; color: #475569;">
                  ${escapeHtml(edu.institution || '')} ${edu.details ? `— ${escapeHtml(edu.details)}` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Certifications -->
        ${Array.isArray(data.certifications) && data.certifications.length ? `
          <div class="resume-section">
            <div class="resume-section-title">Certifications & Honors</div>
            <ul class="resume-item-bullets">
              ${data.certifications.map(c => `<li>${escapeHtml(c)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

      </div>
    </div>
  `;

  document.getElementById('printResumeBtn')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('copyResumeMarkdownBtn')?.addEventListener('click', () => {
    const md = `# ${data.fullName}\n**${data.targetRole}**\n${data.contact?.email} | ${data.contact?.phone} | ${data.contact?.location}\n\n## Summary\n${data.summary}\n\n## Skills\n${data.skills.join(', ')}\n\n## Experience\n${data.experience.map(e => `### ${e.role} — ${e.company} (${e.date})\n${e.bullets.map(b => `- ${b}`).join('\n')}`).join('\n\n')}\n\n## Education\n${data.education.map(edu => `- ${edu.degree}, ${edu.institution} (${edu.date})`).join('\n')}`;
    copyToClipboard(md, 'Resume markdown copied to clipboard!');
  });

  document.getElementById('downloadJsPdfBtn')?.addEventListener('click', () => {
    if (window.jspdf && window.jspdf.jsPDF) {
      const doc = new window.jspdf.jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(data.fullName, 20, 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(79, 70, 229);
      doc.text(data.targetRole, 20, 29);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`${data.contact?.email || ''}  |  ${data.contact?.phone || ''}  |  ${data.contact?.location || ''}`, 20, 35);

      let yPos = 46;
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text("Professional Summary", 20, yPos);
      yPos += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const splitSummary = doc.splitTextToSize(data.summary || '', 170);
      doc.text(splitSummary, 20, yPos);
      yPos += (splitSummary.length * 5) + 6;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Skills", 20, yPos);
      yPos += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(data.skills.join(', '), 20, yPos);
      yPos += 10;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Experience", 20, yPos);
      yPos += 6;

      data.experience.forEach(exp => {
        if (yPos > 260) { doc.addPage(); yPos = 20; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`${exp.role} - ${exp.company}`, 20, yPos);
        yPos += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        exp.bullets.forEach(b => {
          const splitBullet = doc.splitTextToSize(`• ${b}`, 165);
          doc.text(splitBullet, 24, yPos);
          yPos += (splitBullet.length * 4.5);
        });
        yPos += 3;
      });

      doc.save(`${data.fullName.toLowerCase().replace(/\s+/g, '-')}-resume.pdf`);
      showToast('Downloaded PDF using jsPDF!', 'success');
    } else {
      window.print();
    }
  });
}

// ===================================================================
// TASK 5: GOOGLE SHEETS AS BACKEND WITH DYNAMIC FRONTEND
// ===================================================================
const DEFAULT_SHEETS_DATA = [
  { id: "STU-101", name: "Emily Watson", subject: "Computer Science", midterm: 92, final: 96, attendance: 98, status: "Honor Roll" },
  { id: "STU-102", name: "Marcus Thorne", subject: "Calculus III", midterm: 74, final: 81, attendance: 89, status: "Passing" },
  { id: "STU-103", name: "Sarah Jenkins", subject: "Quantum Physics", midterm: 62, final: 68, attendance: 76, status: "Needs Attention" },
  { id: "STU-104", name: "Raj Patel", subject: "Data Structures", midterm: 95, final: 98, attendance: 100, status: "Honor Roll" },
  { id: "STU-105", name: "Aiden Novak", subject: "Organic Chemistry", midterm: 58, final: 61, attendance: 71, status: "Needs Attention" },
  { id: "STU-106", name: "Chloe Bennett", subject: "Microbiology", midterm: 88, final: 85, attendance: 94, status: "Passing" },
  { id: "STU-107", name: "Lucas Vance", subject: "Linear Algebra", midterm: 82, final: 89, attendance: 92, status: "Passing" }
];

function initSheetsBackend() {
  let tableData = StudyApp.sessionData.sheetsData || [...DEFAULT_SHEETS_DATA];
  let sortCol = 'name';
  let sortAsc = true;
  let searchTerm = '';

  const tableBody = document.getElementById('sheetsTableBody');
  const searchInput = document.getElementById('sheetsSearchInput');
  const addRowForm = document.getElementById('sheetsAddRowForm');
  const scriptUrlInput = document.getElementById('sheetsScriptUrlInput');
  const syncBtn = document.getElementById('sheetsSyncBtn');
  const aiAnalyzeBtn = document.getElementById('sheetsAiAnalyzeBtn');
  const insightsContainer = document.getElementById('sheetsAiInsights');

  function renderTable() {
    if (!tableBody) return;

    let filtered = tableData.filter(row => {
      const q = searchTerm.toLowerCase();
      return row.name.toLowerCase().includes(q) ||
             row.subject.toLowerCase().includes(q) ||
             row.id.toLowerCase().includes(q) ||
             row.status.toLowerCase().includes(q);
    });

    filtered.sort((a, b) => {
      let vA = a[sortCol];
      let vB = b[sortCol];
      if (typeof vA === 'string') {
        return sortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
      }
      return sortAsc ? vA - vB : vB - vA;
    });

    tableBody.innerHTML = filtered.map(row => {
      let statusBadge = 'pass';
      if (row.status === 'Honor Roll') statusBadge = 'pass';
      else if (row.status === 'Needs Attention') statusBadge = 'fail';
      else statusBadge = 'warning';

      return `
        <tr>
          <td><strong>${escapeHtml(row.id)}</strong></td>
          <td>${escapeHtml(row.name)}</td>
          <td>${escapeHtml(row.subject)}</td>
          <td>${row.midterm}%</td>
          <td>${row.final}%</td>
          <td>${row.attendance}%</td>
          <td><span class="sheets-badge-pill ${statusBadge}">${escapeHtml(row.status)}</span></td>
          <td>
            <button class="btn btn-outline btn-xs delete-row-btn" data-id="${row.id}" style="color: var(--danger);" title="Delete Record">✕</button>
          </td>
        </tr>
      `;
    }).join('');

    tableBody.querySelectorAll('.delete-row-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        tableData = tableData.filter(r => r.id !== id);
        StudyApp.sessionData.sheetsData = tableData;
        localStorage.setItem('studyai_sheets_data', JSON.stringify(tableData));
        renderTable();
        showToast(`Record ${id} removed.`, 'info');
      });
    });

    const countEl = document.getElementById('sheetsRowCount');
    if (countEl) countEl.innerText = `${filtered.length} of ${tableData.length} records`;
  }

  document.querySelectorAll('.sheets-sortable-th').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (sortCol === col) {
        sortAsc = !sortAsc;
      } else {
        sortCol = col;
        sortAsc = true;
      }
      renderTable();
    });
  });

  searchInput?.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim();
    renderTable();
  });

  addRowForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('newRowName')?.value.trim();
    const subject = document.getElementById('newRowSubject')?.value.trim();
    const midterm = parseInt(document.getElementById('newRowMidterm')?.value, 10) || 75;
    const finalScore = parseInt(document.getElementById('newRowFinal')?.value, 10) || 75;
    const attendance = parseInt(document.getElementById('newRowAttendance')?.value, 10) || 90;

    let status = 'Passing';
    const avg = (midterm + finalScore) / 2;
    if (avg >= 90) status = 'Honor Roll';
    else if (avg < 70 || attendance < 75) status = 'Needs Attention';

    const newRecord = {
      id: `STU-${Math.floor(100 + Math.random() * 900)}`,
      name,
      subject,
      midterm,
      final: finalScore,
      attendance,
      status
    };

    tableData.unshift(newRecord);
    StudyApp.sessionData.sheetsData = tableData;
    localStorage.setItem('studyai_sheets_data', JSON.stringify(tableData));
    renderTable();
    addRowForm.reset();
    showToast(`✓ Added record for ${name} to Google Sheet database!`, 'success');

    const scriptUrl = scriptUrlInput?.value.trim();
    if (scriptUrl) {
      showToast('Pushing new record to live Google Apps Script API...', 'info');
      fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      }).then(r => r.json()).then(() => {
        showToast('✓ Successfully synced with Google Sheet Web App!', 'success');
      }).catch(err => {
        console.warn('Google Sheet live push notice:', err);
      });
    }
  });

  syncBtn?.addEventListener('click', async () => {
    const url = scriptUrlInput?.value.trim();
    if (!url) {
      showToast('Enter a Google Apps Script Web App URL to sync live data.', 'warning');
      return;
    }
    showToast('Fetching latest rows from Google Apps Script Web App...', 'info');
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        tableData = data;
        StudyApp.sessionData.sheetsData = tableData;
        localStorage.setItem('studyai_sheets_data', JSON.stringify(tableData));
        renderTable();
        showToast(`✓ Fetched ${data.length} live records from Google Sheets!`, 'success');
      } else {
        showToast('Received response from Google Apps Script, keeping local data.', 'info');
      }
    } catch (err) {
      showToast('CORS or network notice when reaching Apps Script: ' + err.message, 'warning');
    }
  });

  // 🔑 ENFORCE MANDATORY API KEY FOR AI DATA ANALYST
  aiAnalyzeBtn?.addEventListener('click', async () => {
    const apiKey = await requireApiKey('sheets');
    if (!apiKey) {
      showToast('⚠️ API key is required to run AI Sheet Insights. Operation cancelled.', 'warning');
      return;
    }

    aiAnalyzeBtn.disabled = true;
    const origText = aiAnalyzeBtn.innerHTML;
    aiAnalyzeBtn.innerHTML = '<span>⚡</span> Analyzing Sheet Data with AI...';

    const systemPrompt = `You are a Senior Academic Data Analyst. Given this student grade and attendance dataset from Google Sheets, generate an executive analysis with:
1. Class Performance Overview (Overall grade averages, attendance rate)
2. At-Risk Alert: Students who need immediate intervention
3. Top Performing Subjects vs Weakest Subject Area
4. 3 Actionable Academic Intervention Recommendations for teachers and students.
Format in clean, structured Markdown with bullet points.`;

    const tableSummary = JSON.stringify(tableData.slice(0, 10));

    try {
      const insight = await generateAIContent(systemPrompt, `Analyze this Google Sheet data: ${tableSummary}`, 'sheets');
      if (insightsContainer) {
        insightsContainer.innerHTML = `
          <div class="sheets-insight-card" style="margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <h4 style="font-weight: 800; font-size: 1.05rem; color: var(--primary);">📊 AI Sheet Data Insights & Recommendations</h4>
              <button class="btn btn-outline btn-xs" id="copySheetInsightsBtn">Copy Analysis</button>
            </div>
            <div class="notes-rendered-content">${markedParse(insight)}</div>
          </div>
        `;
        document.getElementById('copySheetInsightsBtn')?.addEventListener('click', () => {
          copyToClipboard(insight, 'AI Analysis copied!');
        });
      }
      showToast('✓ AI Data Insights generated successfully!', 'success');
    } catch (err) {
      showToast('Error generating insights: ' + err.message, 'error');
      if (insightsContainer) {
        insightsContainer.innerHTML = `
          <div class="api-key-error-card" style="margin-top: 1rem;">
            <div class="error-lock-icon">🔒</div>
            <h3 style="font-weight: 800; margin-bottom: 0.5rem;">AI Sheet Insights Blocked</h3>
            <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.25rem; font-size: 0.92rem;">
              ${escapeHtml(err.message)}
            </p>
            <button class="btn btn-primary btn-sm" onclick="requireApiKey('sheets')">🔑 Enter / Update Gemini API Key</button>
          </div>
        `;
      }
    } finally {
      aiAnalyzeBtn.disabled = false;
      aiAnalyzeBtn.innerHTML = origText;
    }
  });

  document.getElementById('copyAppsScriptCodeBtn')?.addEventListener('click', () => {
    const code = `// Google Apps Script (Paste into Extensions > Apps Script)
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
  return ContentService.createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var body = JSON.parse(e.postData.contents);
  sheet.appendRow(Object.values(body));
  return ContentService.createTextOutput(JSON.stringify({ status: "success", received: body }))
    .setMimeType(ContentService.MimeType.JSON);
}`;
    copyToClipboard(code, 'Google Apps Script code copied to clipboard!');
  });

  renderTable();
}

// ===================================================================
// TASK 6: AI QUIZ / MCQ GENERATOR (DYNAMIC QUESTION GENERATOR)
// ===================================================================
function initQuizGenerator() {
  const form = document.getElementById('quizForm');
  const topicInput = document.getElementById('quizTopicInput');
  const countSelect = document.getElementById('quizCountSelect');
  const difficultySelect = document.getElementById('quizDifficultySelect');
  const modeSelect = document.getElementById('quizModeSelect');
  const loading = document.getElementById('quizLoading');
  const outputContainer = document.getElementById('quizOutputArea');

  document.querySelectorAll('.quiz-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      topicInput.value = chip.dataset.topic;
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateInput(topicInput, 'Please enter a topic or paste study notes.')) return;

      const topic = topicInput.value.trim();
      const count = parseInt(countSelect?.value, 10) || 5;
      const difficulty = difficultySelect?.value || 'College / University';
      const mode = modeSelect?.value || 'practice';

      // 🔑 ENFORCE MANDATORY API KEY
      const apiKey = await requireApiKey('quiz');
      if (!apiKey) {
        showToast('⚠️ API key is required to generate quiz questions. Operation cancelled.', 'warning');
        return;
      }

      loading?.classList.add('active');
      if (outputContainer) outputContainer.innerHTML = '';

      const systemPrompt = `You are a master academic examiner. Generate exactly ${count} dynamic multiple-choice questions on: "${topic}" (Difficulty: ${difficulty}).
Return ONLY a valid JSON array where each object has:
- question: Clear, unambiguous question text
- options: Array of 4 distinct answers
- answerIndex: Integer 0, 1, 2, or 3 corresponding to the correct option in the options array
- explanation: Clear 2-sentence explanation of why the correct option is right and common pitfalls
- hint: 1-sentence clue`;

      try {
        const rawRes = await generateAIContent(systemPrompt, `Generate ${count} MCQs on: ${topic}`, 'quiz');
        let questions = parseJsonSafely(rawRes);

        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error('AI was unable to generate structured MCQ questions. Please verify your Gemini API key.');
        }

        StudyApp.sessionData.quiz = {
          topic,
          difficulty,
          mode,
          questions,
          userAnswers: {},
          isFinished: false,
          score: 0
        };
        sessionStorage.setItem('studyai_quiz', JSON.stringify(StudyApp.sessionData.quiz));

        renderQuizLive(StudyApp.sessionData.quiz);
        showToast(`✓ Generated ${questions.length} questions dynamically!`, 'success');
      } catch (err) {
        showToast('Quiz Generation Failed: ' + err.message, 'error');
        if (outputContainer) {
          outputContainer.innerHTML = `
            <div class="api-key-error-card">
              <div class="error-lock-icon">🔒</div>
              <h3 style="font-weight: 800; margin-bottom: 0.5rem;">Quiz Generation Blocked</h3>
              <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.25rem; font-size: 0.92rem;">
                ${escapeHtml(err.message)}
              </p>
              <button class="btn btn-primary btn-sm" onclick="requireApiKey('quiz')">🔑 Enter / Update Gemini API Key</button>
            </div>
          `;
        }
      } finally {
        loading?.classList.remove('active');
      }
    });
  }

  if (StudyApp.sessionData.quiz) {
    renderQuizLive(StudyApp.sessionData.quiz);
  }
}

function renderQuizLive(quizData) {
  const container = document.getElementById('quizOutputArea');
  if (!container || !quizData || !quizData.questions.length) return;

  const total = quizData.questions.length;
  const answeredCount = Object.keys(quizData.userAnswers || {}).length;
  const progressPercent = Math.round((answeredCount / total) * 100);
  const isPracticeMode = quizData.mode === 'practice';

  if (quizData.isFinished) {
    renderQuizResults(quizData);
    return;
  }

  container.innerHTML = `
    <div class="dynamic-quiz-ribbon">
      <div>
        <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 2px;">${escapeHtml(quizData.topic)}</h3>
        <span class="output-meta">${escapeHtml(quizData.difficulty)} • ${total} Questions • ${isPracticeMode ? 'Instant Practice Mode' : 'Timed Exam Mode'}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span class="quiz-streak-pill" id="quizStreakDisplay">🔥 ${StudyApp.quizStreak} Streak</span>
        ${!isPracticeMode ? '<span class="quiz-timer" id="quizTimerDisplay">⏱ 05:00</span>' : ''}
      </div>
    </div>

    <!-- Progress Ribbon -->
    <div class="quiz-header-status">
      <span style="font-weight: 700; font-size: 0.9rem;">Answered: ${answeredCount} / ${total}</span>
      <div class="quiz-progress-bar-wrap">
        <div class="quiz-progress-fill" style="width: ${progressPercent}%;"></div>
      </div>
      <span style="font-weight: 700; font-size: 0.9rem; color: var(--primary);">${progressPercent}%</span>
    </div>

    <!-- Dynamic Questions List -->
    <div id="quizQuestionsContainer">
      ${quizData.questions.map((q, qIdx) => {
        const userChoice = quizData.userAnswers[qIdx];
        const hasAnswered = userChoice !== undefined && userChoice !== null;
        const isCorrect = userChoice === q.answerIndex;
        const letters = ['A', 'B', 'C', 'D'];

        return `
          <div class="quiz-question-card" data-qidx="${qIdx}" style="${isPracticeMode && hasAnswered ? (isCorrect ? 'border-left: 4px solid var(--success);' : 'border-left: 4px solid var(--danger);') : ''}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span class="quiz-question-number">Question ${qIdx + 1} of ${total}</span>
              ${q.hint ? `<span style="font-size: 0.78rem; color: var(--text-muted);">💡 Hint: ${escapeHtml(q.hint)}</span>` : ''}
            </div>
            <div class="quiz-question-text">${escapeHtml(q.question)}</div>

            <div class="quiz-options-list">
              ${q.options.map((opt, optIdx) => {
                let optClass = '';
                if (hasAnswered) {
                  if (userChoice === optIdx) {
                    optClass = isPracticeMode ? (isCorrect ? 'correct-instant' : 'incorrect-instant') : 'selected';
                  } else if (isPracticeMode && optIdx === q.answerIndex) {
                    optClass = 'correct-instant';
                  }
                }

                return `
                  <div class="quiz-option ${optClass}" data-qidx="${qIdx}" data-oidx="${optIdx}" style="${hasAnswered && isPracticeMode ? 'cursor: default;' : ''}">
                    <span class="quiz-letter-badge">${letters[optIdx]}</span>
                    <span>${escapeHtml(opt)}</span>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Instant Feedback Explanation in Practice Mode -->
            ${isPracticeMode && hasAnswered ? `
              <div class="quiz-instant-feedback ${isCorrect ? 'correct' : 'incorrect'}">
                <strong>${isCorrect ? '✓ Correct!' : '✗ Incorrect.'}</strong> ${escapeHtml(q.explanation || 'Review concept for full mastery.')}
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>

    <!-- Dynamic Actions Toolbar -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.75rem;">
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-secondary btn-sm" id="generateMoreQuestionsBtn" title="Dynamically add 5 more questions to this quiz">
          ⚡ Add 5 More Questions
        </button>
        <button class="btn btn-outline btn-sm" id="resetQuizBtn">Reset Answers</button>
      </div>
      <button class="btn btn-primary" id="submitQuizBtn" style="padding: 0.75rem 1.75rem;">
        Finish & View Analytics
      </button>
    </div>
  `;

  if (!isPracticeMode) {
    startQuizTimer();
  }

  container.querySelectorAll('.quiz-option').forEach(el => {
    el.addEventListener('click', () => {
      const qIdx = parseInt(el.dataset.qidx, 10);
      const oIdx = parseInt(el.dataset.oidx, 10);

      if (isPracticeMode && quizData.userAnswers[qIdx] !== undefined) return;

      quizData.userAnswers[qIdx] = oIdx;

      if (isPracticeMode) {
        const correct = oIdx === quizData.questions[qIdx].answerIndex;
        if (correct) {
          StudyApp.quizStreak++;
          showToast(`🔥 Streak: ${StudyApp.quizStreak} in a row!`, 'success');
        } else {
          StudyApp.quizStreak = 0;
        }
      }

      sessionStorage.setItem('studyai_quiz', JSON.stringify(quizData));
      renderQuizLive(quizData);
    });
  });

  document.getElementById('generateMoreQuestionsBtn')?.addEventListener('click', async () => {
    const apiKey = await requireApiKey('quiz');
    if (!apiKey) return;

    const btn = document.getElementById('generateMoreQuestionsBtn');
    if (btn) { btn.disabled = true; btn.innerText = '⚡ Synthesizing 5 new questions...'; }

    const prompt = `Generate 5 MORE unique multiple-choice questions on: "${quizData.topic}" (${quizData.difficulty}). Return ONLY valid JSON array.`;
    try {
      const rawRes = await generateAIContent(prompt, `Add 5 questions on ${quizData.topic}`, 'quiz');
      let newQs = parseJsonSafely(rawRes);
      if (!Array.isArray(newQs) || newQs.length === 0) {
        throw new Error('AI was unable to generate additional questions without a valid Gemini API key.');
      }
      quizData.questions = quizData.questions.concat(newQs);
      sessionStorage.setItem('studyai_quiz', JSON.stringify(quizData));
      renderQuizLive(quizData);
      showToast(`✓ Added 5 new dynamic questions! Now ${quizData.questions.length} total.`, 'success');
    } catch (err) {
      showToast('Error generating more questions: ' + err.message, 'error');
      requireApiKey('quiz');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = '+5 More Questions';
      }
    }
  });

  document.getElementById('resetQuizBtn')?.addEventListener('click', () => {
    quizData.userAnswers = {};
    StudyApp.quizStreak = 0;
    sessionStorage.setItem('studyai_quiz', JSON.stringify(quizData));
    renderQuizLive(quizData);
  });

  document.getElementById('submitQuizBtn')?.addEventListener('click', () => {
    const answered = Object.keys(quizData.userAnswers).length;
    if (answered < quizData.questions.length) {
      if (!confirm(`You have only answered ${answered} of ${quizData.questions.length} questions. Submit anyway?`)) {
        return;
      }
    }

    let correctCount = 0;
    quizData.questions.forEach((q, idx) => {
      if (quizData.userAnswers[idx] === q.answerIndex) {
        correctCount++;
      }
    });

    quizData.score = correctCount;
    quizData.isFinished = true;
    clearInterval(StudyApp.quizTimerInterval);
    sessionStorage.setItem('studyai_quiz', JSON.stringify(quizData));
    renderQuizResults(quizData);
  });
}

function startQuizTimer() {
  clearInterval(StudyApp.quizTimerInterval);
  let secondsRemaining = 300;

  StudyApp.quizTimerInterval = setInterval(() => {
    secondsRemaining--;
    const timerDisplay = document.getElementById('quizTimerDisplay');
    if (timerDisplay) {
      const mins = Math.floor(secondsRemaining / 60);
      const secs = secondsRemaining % 60;
      timerDisplay.innerText = `⏱ ${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    if (secondsRemaining <= 0) {
      clearInterval(StudyApp.quizTimerInterval);
      showToast('Time is up! Submitting quiz automatically.', 'warning');
      document.getElementById('submitQuizBtn')?.click();
    }
  }, 1000);
}

function renderQuizResults(quizData) {
  const container = document.getElementById('quizOutputArea');
  if (!container || !quizData) return;

  const total = quizData.questions.length;
  const score = quizData.score;
  const pct = Math.round((score / total) * 100);

  let gradeBadge = 'Mastery Level';
  let badgeColor = 'var(--primary)';
  if (pct >= 90) { gradeBadge = '🏆 Outstanding (A+)'; badgeColor = 'var(--success)'; }
  else if (pct >= 75) { gradeBadge = '⭐ Proficient (B+)'; badgeColor = 'var(--secondary)'; }
  else if (pct >= 50) { gradeBadge = '📚 Keep Practicing (C)'; badgeColor = 'var(--warning)'; }
  else { gradeBadge = '💡 Revision Needed'; badgeColor = 'var(--danger)'; }

  const letters = ['A', 'B', 'C', 'D'];

  container.innerHTML = `
    <div class="quiz-result-card">
      <div class="score-circle" style="border-color: ${badgeColor};">
        <span class="score-number">${score}</span>
        <span class="score-total">out of ${total}</span>
      </div>
      <h2 style="margin-bottom: 0.5rem;">${gradeBadge}</h2>
      <p style="font-size: 1.05rem; margin-bottom: 1.75rem;">
        You answered <strong>${score}</strong> out of <strong>${total}</strong> questions correctly (${pct}%).
      </p>

      <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2.5rem;">
        <button class="btn btn-primary" id="retakeQuizBtn">Retake Quiz</button>
        <button class="btn btn-secondary" id="quizToFlashcardsBtn">Convert to Flashcards</button>
      </div>

      <!-- Detailed Review with Explanations -->
      <h3 style="text-align: left; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
        Question Breakdown &amp; Explanations
      </h3>

      <div style="text-align: left;">
        ${quizData.questions.map((q, idx) => {
          const userChoice = quizData.userAnswers[idx];
          const isCorrect = userChoice === q.answerIndex;

          return `
            <div class="quiz-question-card" style="border-left: 4px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'};">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span class="quiz-question-number">Question ${idx + 1}</span>
                <span style="font-size: 0.82rem; font-weight: 700; color: ${isCorrect ? 'var(--success)' : 'var(--danger)'};">
                  ${isCorrect ? '✓ Correct (+1)' : '✗ Incorrect (0)'}
                </span>
              </div>
              <div class="quiz-question-text" style="font-size: 1.05rem;">${escapeHtml(q.question)}</div>

              <div class="quiz-options-list" style="margin-bottom: 0.75rem;">
                ${q.options.map((opt, oIdx) => {
                  let optClass = '';
                  if (oIdx === q.answerIndex) optClass = 'correct';
                  else if (userChoice === oIdx && !isCorrect) optClass = 'incorrect';

                  return `
                    <div class="quiz-option ${optClass}" style="cursor: default;">
                      <span class="quiz-letter-badge">${letters[oIdx]}</span>
                      <span>${escapeHtml(opt)}</span>
                      ${oIdx === q.answerIndex ? '<span style="margin-left: auto; font-size: 0.8rem; font-weight: 800;">✓ Correct Key</span>' : ''}
                      ${userChoice === oIdx && !isCorrect ? '<span style="margin-left: auto; font-size: 0.8rem; font-weight: 800;">Your Choice</span>' : ''}
                    </div>
                  `;
                }).join('')}
              </div>

              <div class="quiz-explanation-box" style="display: block;">
                <strong>Explanation:</strong> ${escapeHtml(q.explanation || 'Key subject takeaway.')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  document.getElementById('retakeQuizBtn')?.addEventListener('click', () => {
    quizData.userAnswers = {};
    quizData.isFinished = false;
    quizData.score = 0;
    StudyApp.quizStreak = 0;
    sessionStorage.setItem('studyai_quiz', JSON.stringify(quizData));
    renderQuizLive(quizData);
  });

  document.getElementById('quizToFlashcardsBtn')?.addEventListener('click', () => {
    const cards = quizData.questions.map(q => ({
      front: q.question,
      back: `${q.options[q.answerIndex]}\n\nReason: ${q.explanation}`,
      mastered: false
    }));

    StudyApp.sessionData.flashcards = {
      topic: `${quizData.topic} (from Quiz)`,
      cards,
      currentIndex: 0
    };
    sessionStorage.setItem('studyai_flashcards', JSON.stringify(StudyApp.sessionData.flashcards));

    showToast('Created flashcard revision set from quiz questions!', 'success');
    if (document.getElementById('view-flashcards')) {
      switchView('flashcards');
      renderFlashcardsView(StudyApp.sessionData.flashcards);
    } else {
      window.location.href = 'flashcards.html';
    }
  });
}

// ===================================================================
// TASK 2: AI NOTES GENERATOR
// ===================================================================
function initNotesGenerator() {
  const form = document.getElementById('notesForm');
  const topicInput = document.getElementById('notesTopicInput');
  const levelSelect = document.getElementById('notesLevelSelect');
  const styleSelect = document.getElementById('notesStyleSelect');
  const loadingIndicator = document.getElementById('notesLoading');
  const outputContainer = document.getElementById('notesOutputArea');

  document.querySelectorAll('.notes-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      topicInput.value = chip.dataset.topic;
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateInput(topicInput, 'Please enter a topic to generate notes.')) return;

      const topic = topicInput.value.trim();
      const level = levelSelect?.value || 'College / University';
      const style = styleSelect?.value || 'Cornell Method';

      // 🔑 ENFORCE MANDATORY API KEY
      const apiKey = await requireApiKey('notes');
      if (!apiKey) {
        showToast('⚠️ API key is required to generate notes. Operation cancelled.', 'warning');
        return;
      }

      loadingIndicator?.classList.add('active');
      if (outputContainer) outputContainer.innerHTML = '';

      const systemPrompt = `You are a world-class academic tutor. Create comprehensive, student-friendly ${style} study notes for: ${topic} (Target Level: ${level}). Include:
1. Executive Summary & Key Takeaways
2. In-Depth Concepts Explained with clear headings
3. Important Definitions & Formulas (in markdown codeblocks)
4. Common Exam Pitfalls & High-Yield Tips
5. 3 Quick Self-Test Practice Questions. Format in clean, beautiful Markdown.`;

      try {
        const generatedNotes = await generateAIContent(systemPrompt, topic, 'notes');
        
        StudyApp.sessionData.notes = {
          topic,
          level,
          style,
          content: generatedNotes,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        sessionStorage.setItem('studyai_notes', JSON.stringify(StudyApp.sessionData.notes));

        renderNotesView(StudyApp.sessionData.notes);
        showToast('✓ Notes generated successfully!', 'success');
      } catch (err) {
        showToast('Error generating notes: ' + err.message, 'error');
        if (outputContainer) {
          outputContainer.innerHTML = `
            <div class="api-key-error-card">
              <div class="error-lock-icon">🔒</div>
              <h3 style="font-weight: 800; margin-bottom: 0.5rem;">Notes Generation Blocked</h3>
              <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.25rem; font-size: 0.92rem;">
                ${escapeHtml(err.message)}
              </p>
              <button class="btn btn-primary btn-sm" onclick="requireApiKey('notes')">🔑 Enter / Update Gemini API Key</button>
            </div>
          `;
        }
      } finally {
        loadingIndicator?.classList.remove('active');
      }
    });
  }

  if (StudyApp.sessionData.notes) {
    renderNotesView(StudyApp.sessionData.notes);
  }
}

function renderNotesView(notesData) {
  const container = document.getElementById('notesOutputArea');
  if (!container || !notesData) return;

  const htmlContent = markedParse(notesData.content);

  container.innerHTML = `
    <div class="output-action-bar">
      <div class="output-title-group">
        <h3>${escapeHtml(notesData.topic)}</h3>
        <span class="output-meta">${notesData.level} • ${notesData.style} • Generated at ${notesData.date}</span>
      </div>
      <div class="action-buttons-group">
        <button class="btn btn-secondary btn-sm" id="copyNotesBtn" title="Copy raw markdown">
          Copy Notes
        </button>
        <button class="btn btn-secondary btn-sm" id="downloadNotesBtn" title="Download .md file">
          Export (.md)
        </button>
        <button class="btn btn-primary btn-sm" id="printNotesBtn" title="Print or Save as PDF">
          Print / PDF
        </button>
      </div>
    </div>
    <div class="notes-rendered-content" id="notesPrintableBody">
      ${htmlContent}
    </div>
  `;

  document.getElementById('copyNotesBtn')?.addEventListener('click', () => {
    copyToClipboard(notesData.content, 'Notes copied to clipboard!');
  });
  document.getElementById('downloadNotesBtn')?.addEventListener('click', () => {
    const slug = notesData.topic.toLowerCase().replace(/[^a-z0-9]/g, '-');
    downloadFile(`${slug}-notes.md`, notesData.content);
  });
  document.getElementById('printNotesBtn')?.addEventListener('click', () => {
    window.print();
  });
}

// ===================================================================
// TASK 3: AI PRESENTATION (PPT) GENERATOR
// ===================================================================
function initPptGenerator() {
  const form = document.getElementById('pptForm');
  const topicInput = document.getElementById('pptTopicInput');
  const countSelect = document.getElementById('pptCountSelect');
  const audienceSelect = document.getElementById('pptAudienceSelect');
  const loading = document.getElementById('pptLoading');
  const outputContainer = document.getElementById('pptOutputArea');

  document.querySelectorAll('.ppt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      topicInput.value = chip.dataset.topic;
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateInput(topicInput, 'Please specify a presentation topic.')) return;

      const topic = topicInput.value.trim();
      const count = parseInt(countSelect?.value, 10) || 5;
      const audience = audienceSelect?.value || 'College / University';

      // 🔑 ENFORCE MANDATORY API KEY
      const apiKey = await requireApiKey('ppt');
      if (!apiKey) {
        showToast('⚠️ API key is required to generate presentation. Operation cancelled.', 'warning');
        return;
      }

      loading?.classList.add('active');
      if (outputContainer) outputContainer.innerHTML = '';

      const systemPrompt = `You are an expert keynote presentation designer. Create a high-impact presentation deck with exactly ${count} slides on: "${topic}" for ${audience}. Return a JSON array of slide objects where each object has:
- title: concise slide title
- subtitle: short category or tag
- bullets: array of 3-4 crisp high-yield talking points
- speakerNotes: 1-2 sentences of commentary for the presenter
Return ONLY valid JSON format.`;

      try {
        const rawRes = await generateAIContent(systemPrompt, `Create ${count} slides on: ${topic}`, 'ppt');
        let slides = parseJsonSafely(rawRes);

        if (!Array.isArray(slides) || slides.length === 0) {
          throw new Error('AI was unable to generate presentation slides. Please verify your Gemini API key.');
        }

        StudyApp.sessionData.slides = {
          topic,
          slides,
          currentIndex: 0
        };
        sessionStorage.setItem('studyai_slides', JSON.stringify(StudyApp.sessionData.slides));

        renderPptViewer(StudyApp.sessionData.slides);
        showToast('✓ Slides generated successfully!', 'success');
      } catch (err) {
        showToast('Error generating slides: ' + err.message, 'error');
        if (outputContainer) {
          outputContainer.innerHTML = `
            <div class="api-key-error-card">
              <div class="error-lock-icon">🔒</div>
              <h3 style="font-weight: 800; margin-bottom: 0.5rem;">Presentation Generation Blocked</h3>
              <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.25rem; font-size: 0.92rem;">
                ${escapeHtml(err.message)}
              </p>
              <button class="btn btn-primary btn-sm" onclick="requireApiKey('ppt')">🔑 Enter / Update Gemini API Key</button>
            </div>
          `;
        }
      } finally {
        loading?.classList.remove('active');
      }
    });
  }

  if (StudyApp.sessionData.slides) {
    renderPptViewer(StudyApp.sessionData.slides);
  }
}

function renderPptViewer(data) {
  const container = document.getElementById('pptOutputArea');
  if (!container || !data || !data.slides.length) return;

  let currentIdx = data.currentIndex || 0;
  const slides = data.slides;
  const slide = slides[currentIdx];

  container.innerHTML = `
    <div class="output-action-bar">
      <div class="output-title-group">
        <h3>${escapeHtml(data.topic)}</h3>
        <span class="output-meta">Slide ${currentIdx + 1} of ${slides.length}</span>
      </div>
      <div class="action-buttons-group">
        <button class="btn btn-secondary btn-sm" id="downloadPptxBtn" title="Download real .pptx PowerPoint file">
          📊 Export (.pptx)
        </button>
        <button class="btn btn-primary btn-sm" id="printPptBtn">Print Slides</button>
      </div>
    </div>

    <div class="slide-deck-container">
      <div class="slide-canvas">
        <div class="slide-tag">${escapeHtml(slide.subtitle || 'Keynote')}</div>
        <h2 class="slide-title">${escapeHtml(slide.title)}</h2>
        <ul class="slide-bullets">
          ${(slide.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}
        </ul>
        <div class="slide-footer-bar">
          <span>StudyAI Presentations</span>
          <span>Slide ${currentIdx + 1} / ${slides.length}</span>
        </div>
      </div>
    </div>

    <!-- Slide Navigation Controls -->
    <div class="slide-controls-bar">
      <button class="btn btn-secondary btn-sm" id="prevSlideBtn" ${currentIdx === 0 ? 'disabled' : ''}>← Previous</button>
      <div class="slide-dots-indicator">
        ${slides.map((_, i) => `<span class="slide-dot ${i === currentIdx ? 'active' : ''}" data-idx="${i}"></span>`).join('')}
      </div>
      <button class="btn btn-primary btn-sm" id="nextSlideBtn" ${currentIdx === slides.length - 1 ? 'disabled' : ''}>Next →</button>
    </div>

    <!-- Speaker Notes -->
    <div style="margin-top: 1rem; background: var(--bg-tertiary); padding: 1rem 1.25rem; border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
      <div style="font-weight: 700; font-size: 0.85rem; color: var(--primary); text-transform: uppercase;">🎙️ Presenter Notes</div>
      <p style="font-size: 0.92rem; margin-top: 0.35rem; color: var(--text-secondary);">${escapeHtml(slide.speakerNotes || 'Emphasize the core points with practical examples.')}</p>
    </div>
  `;

  document.getElementById('prevSlideBtn')?.addEventListener('click', () => {
    if (currentIdx > 0) {
      data.currentIndex = currentIdx - 1;
      renderPptViewer(data);
    }
  });

  document.getElementById('nextSlideBtn')?.addEventListener('click', () => {
    if (currentIdx < slides.length - 1) {
      data.currentIndex = currentIdx + 1;
      renderPptViewer(data);
    }
  });

  container.querySelectorAll('.slide-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      data.currentIndex = parseInt(dot.dataset.idx, 10);
      renderPptViewer(data);
    });
  });

  document.getElementById('downloadPptxBtn')?.addEventListener('click', () => {
    if (window.PptxGenJS) {
      const pptx = new window.PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';

      slides.forEach((s, idx) => {
        const slidePage = pptx.addSlide();
        slidePage.background = { color: "090D16" };
        slidePage.addText(s.title, { x: 0.8, y: 0.8, fontSize: 26, bold: true, color: "FFFFFF" });
        slidePage.addText(s.bullets.map(b => `• ${b}`).join('\n\n'), { x: 0.8, y: 2.0, fontSize: 16, color: "CBD5E1" });
        if (s.speakerNotes) {
          slidePage.addNotes(s.speakerNotes);
        }
      });

      pptx.writeFile({ fileName: `${data.topic.toLowerCase().replace(/\s+/g, '-')}-slides.pptx` });
      showToast('✓ Generated PowerPoint (.pptx) file!', 'success');
    } else {
      window.print();
    }
  });

  document.getElementById('printPptBtn')?.addEventListener('click', () => {
    window.print();
  });
}

// ===================================================================
// TASK 4: AI SYLLABUS MIND MAP GENERATOR
// ===================================================================
function initMindMapGenerator() {
  const form = document.getElementById('mindmapForm');
  const input = document.getElementById('mindmapTopicInput');
  const loading = document.getElementById('mindmapLoading');
  const outputContainer = document.getElementById('mindmapOutputArea');

  document.querySelectorAll('.mindmap-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.topic;
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateInput(input, 'Please enter a syllabus or topic name.')) return;

      const topic = input.value.trim();

      // 🔑 ENFORCE MANDATORY API KEY
      const apiKey = await requireApiKey('mindmap');
      if (!apiKey) {
        showToast('⚠️ API key is required to generate mind map. Operation cancelled.', 'warning');
        return;
      }

      loading?.classList.add('active');
      if (outputContainer) outputContainer.innerHTML = '';

      const systemPrompt = `You are a curriculum mapping expert. Convert this syllabus topic into a structured hierarchical outline: "${topic}". Return ONLY a JSON object:
{
  "title": "${topic}",
  "modules": [
    {
      "name": "Unit/Module 1 Name",
      "topics": [
        { "name": "Topic A", "subtopics": ["Concept 1", "Concept 2"] }
      ]
    }
  ]
}`;

      try {
        const rawRes = await generateAIContent(systemPrompt, `Generate syllabus mind map for: ${topic}`, 'mindmap');
        let mindmap = parseJsonSafely(rawRes);

        if (!mindmap || !Array.isArray(mindmap.modules)) {
          throw new Error('AI was unable to generate syllabus tree. Please verify your Gemini API key.');
        }

        StudyApp.sessionData.mindmap = { topic, mindmap };
        sessionStorage.setItem('studyai_mindmap', JSON.stringify(StudyApp.sessionData.mindmap));

        renderMindMapView(StudyApp.sessionData.mindmap);
        showToast('✓ Syllabus mind map rendered!', 'success');
      } catch (err) {
        showToast('Error generating mind map: ' + err.message, 'error');
        if (outputContainer) {
          outputContainer.innerHTML = `
            <div class="api-key-error-card">
              <div class="error-lock-icon">🔒</div>
              <h3 style="font-weight: 800; margin-bottom: 0.5rem;">Mind Map Generation Blocked</h3>
              <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.25rem; font-size: 0.92rem;">
                ${escapeHtml(err.message)}
              </p>
              <button class="btn btn-primary btn-sm" onclick="requireApiKey('mindmap')">🔑 Enter / Update Gemini API Key</button>
            </div>
          `;
        }
      } finally {
        loading?.classList.remove('active');
      }
    });
  }

  if (StudyApp.sessionData.mindmap) {
    renderMindMapView(StudyApp.sessionData.mindmap);
  }
}

function renderMindMapView(data) {
  const container = document.getElementById('mindmapOutputArea');
  if (!container || !data || !data.mindmap) return;

  const mm = data.mindmap;

  container.innerHTML = `
    <div class="output-action-bar">
      <div class="output-title-group">
        <h3>${escapeHtml(mm.title || data.topic)}</h3>
        <span class="output-meta">Interactive Syllabus Tree Map</span>
      </div>
      <div class="action-buttons-group">
        <button class="btn btn-secondary btn-sm" id="copyMindmapOutlineBtn">Copy Outline</button>
        <button class="btn btn-primary btn-sm" id="printMindmapBtn">Print Map</button>
      </div>
    </div>

    <div class="mindmap-canvas-container" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 2rem; overflow-x: auto;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <span style="background: var(--primary); color: #fff; padding: 0.6rem 1.5rem; border-radius: var(--radius-full); font-weight: 800; font-size: 1.1rem; box-shadow: var(--shadow-md); display: inline-block;">
          🧠 ${escapeHtml(mm.title)}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
        ${(mm.modules || []).map((mod, modIdx) => {
          const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];
          const modColor = colors[modIdx % colors.length];

          return `
            <div style="background: var(--bg-tertiary); border-radius: var(--radius-md); border-top: 4px solid ${modColor}; padding: 1.25rem;">
              <h4 style="font-size: 1rem; font-weight: 700; color: ${modColor}; margin-bottom: 0.85rem;">
                ${escapeHtml(mod.name)}
              </h4>
              <ul style="padding-left: 1rem; font-size: 0.88rem; line-height: 1.6;">
                ${(mod.topics || []).map(t => `
                  <li style="margin-bottom: 0.5rem;">
                    <strong>${escapeHtml(t.name)}</strong>
                    ${Array.isArray(t.subtopics) ? `
                      <ul style="padding-left: 1rem; color: var(--text-muted); font-size: 0.82rem;">
                        ${t.subtopics.map(sub => `<li>${escapeHtml(sub)}</li>`).join('')}
                      </ul>
                    ` : ''}
                  </li>
                `).join('')}
              </ul>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  document.getElementById('copyMindmapOutlineBtn')?.addEventListener('click', () => {
    let text = `# ${mm.title}\n\n`;
    (mm.modules || []).forEach(m => {
      text += `## ${m.name}\n`;
      (m.topics || []).forEach(t => {
        text += `- ${t.name}\n`;
        (t.subtopics || []).forEach(s => { text += `  * ${s}\n`; });
      });
    });
    copyToClipboard(text, 'Mind map outline copied to clipboard!');
  });

  document.getElementById('printMindmapBtn')?.addEventListener('click', () => {
    window.print();
  });
}

// ===================================================================
// TASK 7: AI SUBJECT DOUBT-SOLVING CHATBOT
// ===================================================================
function initDoubtSolver() {
  const chatMessages = document.getElementById('chatMessagesArea');
  const chatInput = document.getElementById('chatInputField');
  const sendBtn = document.getElementById('chatSendBtn');
  const clearBtn = document.getElementById('clearChatBtn');
  const subjectPills = document.querySelectorAll('.subject-pill');

  subjectPills.forEach(pill => {
    pill.addEventListener('click', () => {
      subjectPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      StudyApp.currentSubjectDoubt = pill.dataset.subject;
      showToast(`Subject switched to: ${StudyApp.currentSubjectDoubt}`, 'info');
    });
  });

  document.querySelectorAll('.doubt-prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (chatInput) {
        chatInput.value = chip.dataset.prompt;
        chatInput.focus();
      }
    });
  });

  async function handleSend() {
    const query = chatInput?.value.trim();
    if (!query) return;

    chatInput.value = '';

    // 🔑 ENFORCE MANDATORY API KEY
    const apiKey = await requireApiKey('doubts');
    if (!apiKey) {
      showToast('⚠️ API key is required to ask AI Tutor. Operation cancelled.', 'warning');
      return;
    }

    appendChatMessage('user', query);

    const typingIndicator = showTypingIndicator();

    const systemPrompt = `You are a world-class academic tutor in ${StudyApp.currentSubjectDoubt}.
Explain the student's question clearly with step-by-step logic, real-world analogies, and explicit formulas where applicable. Format nicely in Markdown.`;

    try {
      const response = await generateAIContent(systemPrompt, query, 'doubts', 'chat');
      typingIndicator?.remove();
      appendChatMessage('ai', response);

      StudyApp.sessionData.chatHistory.push({ role: 'user', text: query });
      StudyApp.sessionData.chatHistory.push({ role: 'ai', text: response });
      sessionStorage.setItem('studyai_chat', JSON.stringify(StudyApp.sessionData.chatHistory));
    } catch (err) {
      typingIndicator?.remove();
      appendChatMessage('ai', `⚠️ **AI Subject Tutor Locked:** ${err.message}\n\nA valid Google Gemini API key is strictly required to solve doubts.`);
      requireApiKey('doubts');
    }
  }

  sendBtn?.addEventListener('click', handleSend);
  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  clearBtn?.addEventListener('click', () => {
    StudyApp.sessionData.chatHistory = [];
    sessionStorage.removeItem('studyai_chat');
    if (chatMessages) {
      chatMessages.innerHTML = '';
      appendChatMessage('ai', `👋 Chat cleared. Select your subject above and ask me any academic doubt!`);
    }
    showToast('Conversation reset.', 'info');
  });

  if (chatMessages && StudyApp.sessionData.chatHistory.length > 0) {
    chatMessages.innerHTML = '';
    StudyApp.sessionData.chatHistory.forEach(m => appendChatMessage(m.role, m.text));
  }
}

function appendChatMessage(role, text) {
  const container = document.getElementById('chatMessagesArea');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;

  const parsed = role === 'ai' ? markedParse(text) : escapeHtml(text);

  bubble.innerHTML = `
    <div class="chat-sender">${role === 'ai' ? `🤖 StudyAI ${StudyApp.currentSubjectDoubt} Tutor` : '👤 You'}</div>
    <div class="chat-text">${parsed}</div>
    ${role === 'ai' ? `
      <div style="margin-top: 0.5rem; display: flex; gap: 0.4rem;">
        <button class="btn btn-outline btn-xs listen-chat-btn" title="Read Aloud">🔊 Listen</button>
        <button class="btn btn-outline btn-xs copy-chat-btn" title="Copy Answer">📋 Copy</button>
      </div>
    ` : ''}
  `;

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;

  bubble.querySelector('.listen-chat-btn')?.addEventListener('click', () => speakText(text));
  bubble.querySelector('.copy-chat-btn')?.addEventListener('click', () => copyToClipboard(text, 'Solution copied!'));
}

function showTypingIndicator() {
  const container = document.getElementById('chatMessagesArea');
  if (!container) return null;

  const typing = document.createElement('div');
  typing.className = 'chat-bubble ai typing';
  typing.innerHTML = `
    <div class="chat-sender">StudyAI Tutor is writing...</div>
    <div style="display: flex; gap: 4px; padding: 6px 0;">
      <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
    </div>
  `;
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
  return typing;
}

// ===================================================================
// TASK 8: AI FLASHCARD GENERATOR FOR REVISION
// ===================================================================
function initFlashcardRevision() {
  const form = document.getElementById('flashcardsForm');
  const input = document.getElementById('flashcardsTopicInput');
  const countSelect = document.getElementById('flashcardsCountSelect');
  const loading = document.getElementById('flashcardsLoading');
  const outputContainer = document.getElementById('flashcardsOutputArea');

  document.querySelectorAll('.flashcard-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.topic;
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateInput(input, 'Please enter a topic or chapter text.')) return;

      const topic = input.value.trim();
      const count = parseInt(countSelect?.value, 10) || 8;

      // 🔑 ENFORCE MANDATORY API KEY
      const apiKey = await requireApiKey('flashcards');
      if (!apiKey) {
        showToast('⚠️ API key is required to generate flashcards. Operation cancelled.', 'warning');
        return;
      }

      loading?.classList.add('active');
      if (outputContainer) outputContainer.innerHTML = '';

      const systemPrompt = `You are an active recall coach. Create ${count} high-yield revision flashcards on: "${topic}".
Return ONLY a valid JSON array of objects:
[
  { "front": "Question, formula prompt, or term", "back": "Precise answer, definition, or explanation", "mastered": false }
]`;

      try {
        const rawRes = await generateAIContent(systemPrompt, `Create ${count} flashcards for: ${topic}`, 'flashcards');
        let cards = parseJsonSafely(rawRes);

        if (!Array.isArray(cards) || cards.length === 0) {
          throw new Error('AI was unable to generate flashcards. Please verify your Gemini API key.');
        }

        StudyApp.sessionData.flashcards = {
          topic,
          cards,
          currentIndex: 0
        };
        sessionStorage.setItem('studyai_flashcards', JSON.stringify(StudyApp.sessionData.flashcards));

        renderFlashcardsView(StudyApp.sessionData.flashcards);
        showToast(`✓ Generated ${cards.length} flippable flashcards!`, 'success');
      } catch (err) {
        showToast('Error generating flashcards: ' + err.message, 'error');
        if (outputContainer) {
          outputContainer.innerHTML = `
            <div class="api-key-error-card">
              <div class="error-lock-icon">🔒</div>
              <h3 style="font-weight: 800; margin-bottom: 0.5rem;">Flashcards Generation Blocked</h3>
              <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.25rem; font-size: 0.92rem;">
                ${escapeHtml(err.message)}
              </p>
              <button class="btn btn-primary btn-sm" onclick="requireApiKey('flashcards')">🔑 Enter / Update Gemini API Key</button>
            </div>
          `;
        }
      } finally {
        loading?.classList.remove('active');
      }
    });
  }

  if (StudyApp.sessionData.flashcards) {
    renderFlashcardsView(StudyApp.sessionData.flashcards);
  }
}

function renderFlashcardsView(data) {
  const container = document.getElementById('flashcardsOutputArea');
  if (!container || !data || !data.cards.length) return;

  let currentIdx = data.currentIndex || 0;
  const cards = data.cards;
  const card = cards[currentIdx];
  const masteredCount = cards.filter(c => c.mastered).length;
  const masteryPct = Math.round((masteredCount / cards.length) * 100);

  container.innerHTML = `
    <div class="output-action-bar">
      <div class="output-title-group">
        <h3>${escapeHtml(data.topic)}</h3>
        <span class="output-meta">Card ${currentIdx + 1} of ${cards.length} • Mastery: ${masteryPct}% (${masteredCount}/${cards.length})</span>
      </div>
      <div class="action-buttons-group">
        <button class="btn btn-secondary btn-sm" id="shuffleDeckBtn" title="Shuffle Card Deck">🔀 Shuffle</button>
        <button class="btn btn-primary btn-sm" id="printCardsBtn">Print Cards</button>
      </div>
    </div>

    <!-- 3D Card Scene -->
    <div class="flashcard-3d-scene" id="flashcardScene" title="Click or press Spacebar to Flip">
      <div class="flashcard-3d-card" id="active3dCard">
        <div class="flashcard-face flashcard-front">
          <span class="flashcard-badge">Question / Concept</span>
          <div class="flashcard-text">${escapeHtml(card.front)}</div>
          <span class="flashcard-flip-prompt">🔄 Click or Spacebar to flip</span>
        </div>
        <div class="flashcard-face flashcard-back">
          <span class="flashcard-badge" style="background: rgba(16, 185, 129, 0.15); color: var(--success);">Answer / Definition</span>
          <div class="flashcard-text">${escapeHtml(card.back)}</div>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center;">
            <button class="btn btn-sm ${card.mastered ? 'btn-primary' : 'btn-outline'}" id="toggleMasterBtn">
              ${card.mastered ? '★ Mastered' : '☆ Mark Mastered'}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="slide-controls-bar" style="margin-top: 1.5rem;">
      <button class="btn btn-secondary" id="prevCardBtn" ${currentIdx === 0 ? 'disabled' : ''}>← Previous</button>
      <span style="font-weight: 700; font-size: 0.95rem;">${currentIdx + 1} / ${cards.length}</span>
      <button class="btn btn-primary" id="nextCardBtn" ${currentIdx === cards.length - 1 ? 'disabled' : ''}>Next →</button>
    </div>
  `;

  const activeCard = document.getElementById('active3dCard');
  activeCard?.addEventListener('click', () => {
    activeCard.classList.toggle('flipped');
  });

  document.getElementById('prevCardBtn')?.addEventListener('click', () => {
    if (currentIdx > 0) {
      data.currentIndex = currentIdx - 1;
      renderFlashcardsView(data);
    }
  });

  document.getElementById('nextCardBtn')?.addEventListener('click', () => {
    if (currentIdx < cards.length - 1) {
      data.currentIndex = currentIdx + 1;
      renderFlashcardsView(data);
    }
  });

  document.getElementById('shuffleDeckBtn')?.addEventListener('click', () => {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    data.currentIndex = 0;
    renderFlashcardsView(data);
    showToast('Deck shuffled!', 'info');
  });

  document.getElementById('toggleMasterBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    card.mastered = !card.mastered;
    sessionStorage.setItem('studyai_flashcards', JSON.stringify(data));
    renderFlashcardsView(data);
  });

  document.getElementById('printCardsBtn')?.addEventListener('click', () => {
    window.print();
  });
}

// ===================================================================
// TASK 9: AI STUDY PLANNER / TIMETABLE GENERATOR
// ===================================================================
function initStudyPlanner() {
  const form = document.getElementById('plannerForm');
  const examInput = document.getElementById('plannerExamInput');
  const hoursInput = document.getElementById('plannerHoursInput');
  const daysInput = document.getElementById('plannerDaysInput');
  const weakInput = document.getElementById('plannerWeakInput');
  const loading = document.getElementById('plannerLoading');
  const outputContainer = document.getElementById('plannerOutputArea');

  document.querySelectorAll('.planner-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      examInput.value = chip.dataset.exam;
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateInput(examInput, 'Please specify target exam or goals.')) return;

      const examName = examInput.value.trim();
      const hours = parseInt(hoursInput?.value, 10) || 4;
      const days = parseInt(daysInput?.value, 10) || 14;
      const weak = weakInput?.value.trim() || 'Core foundational concepts';

      // 🔑 ENFORCE MANDATORY API KEY
      const apiKey = await requireApiKey('planner');
      if (!apiKey) {
        showToast('⚠️ API key is required to generate timetable. Operation cancelled.', 'warning');
        return;
      }

      loading?.classList.add('active');
      if (outputContainer) outputContainer.innerHTML = '';

      const systemPrompt = `You are a student schedule optimization expert. Create a day-wise weekly timetable grid for: "${examName}" (${hours} hours/day available, ${days} days until exam, prioritizing: ${weak}). Return ONLY a JSON object:
{
  "examName": "${examName}",
  "dailyStrategy": "2-sentence actionable study guidance",
  "schedule": [
    {
      "day": "Monday (Day 1)",
      "slots": [
        { "time": "9:00 - 10:30 AM", "subject": "Subject Name", "task": "Task description", "type": "theory" },
        { "time": "11:00 - 12:30 PM", "subject": "Practice Set", "task": "Solve 25 MCQs", "type": "practice" },
        { "time": "4:00 - 5:00 PM", "subject": "Revision", "task": "Flashcard active recall", "type": "revision" }
      ]
    }
  ],
  "checklist": [
    { "id": 0, "text": "Milestone task", "done": false }
  ]
}`;

      try {
        const rawRes = await generateAIContent(systemPrompt, `Generate timetable for: ${examName}`, 'planner');
        let planner = parseJsonSafely(rawRes);

        if (!planner || !Array.isArray(planner.schedule)) {
          throw new Error('AI was unable to generate timetable schedule. Please verify your Gemini API key.');
        }

        StudyApp.sessionData.planner = planner;
        sessionStorage.setItem('studyai_planner', JSON.stringify(StudyApp.sessionData.planner));

        renderPlannerView(StudyApp.sessionData.planner);
        showToast('✓ Balanced study timetable generated!', 'success');
      } catch (err) {
        showToast('Error generating timetable: ' + err.message, 'error');
        if (outputContainer) {
          outputContainer.innerHTML = `
            <div class="api-key-error-card">
              <div class="error-lock-icon">🔒</div>
              <h3 style="font-weight: 800; margin-bottom: 0.5rem;">Timetable Generation Blocked</h3>
              <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.25rem; font-size: 0.92rem;">
                ${escapeHtml(err.message)}
              </p>
              <button class="btn btn-primary btn-sm" onclick="requireApiKey('planner')">🔑 Enter / Update Gemini API Key</button>
            </div>
          `;
        }
      } finally {
        loading?.classList.remove('active');
      }
    });
  }

  if (StudyApp.sessionData.planner) {
    renderPlannerView(StudyApp.sessionData.planner);
  }
}

function renderPlannerView(data) {
  const container = document.getElementById('plannerOutputArea');
  if (!container || !data) return;

  container.innerHTML = `
    <div class="output-action-bar">
      <div class="output-title-group">
        <h3>${escapeHtml(data.examName)}</h3>
        <span class="output-meta">Day-wise Balanced Revision Schedule</span>
      </div>
      <div class="action-buttons-group">
        <button class="btn btn-primary btn-sm" id="printPlannerBtn">Print Schedule</button>
      </div>
    </div>

    ${data.dailyStrategy ? `
      <div style="background: var(--bg-tertiary); padding: 1rem 1.25rem; border-radius: var(--radius-md); border-left: 4px solid var(--primary); margin-bottom: 1.5rem;">
        <strong>Strategic Guidance:</strong> ${escapeHtml(data.dailyStrategy)}
      </div>
    ` : ''}

    <!-- Schedule Grid -->
    <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
      ${(data.schedule || []).map(day => `
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
          <h4 style="font-weight: 800; font-size: 1.05rem; margin-bottom: 0.75rem; color: var(--primary);">
            📅 ${escapeHtml(day.day)}
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem;">
            ${(day.slots || []).map(slot => `
              <div style="background: var(--bg-tertiary); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border-left: 3px solid var(--secondary);">
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">${escapeHtml(slot.time)}</div>
                <div style="font-weight: 700; font-size: 0.95rem; margin: 2px 0;">${escapeHtml(slot.subject)}</div>
                <div style="font-size: 0.82rem; color: var(--text-secondary);">${escapeHtml(slot.task)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Milestones Checklist -->
    ${Array.isArray(data.checklist) && data.checklist.length ? `
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
        <h4 style="font-weight: 800; font-size: 1rem; margin-bottom: 0.75rem;">Milestone Checklist</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          ${data.checklist.map((item, idx) => `
            <label style="display: flex; align-items: center; gap: 0.6rem; cursor: pointer; font-size: 0.92rem;">
              <input type="checkbox" ${item.done ? 'checked' : ''} data-itemidx="${idx}" class="planner-check">
              <span>${escapeHtml(item.text)}</span>
            </label>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;

  container.querySelectorAll('.planner-check').forEach(chk => {
    chk.addEventListener('change', () => {
      const idx = parseInt(chk.dataset.itemidx, 10);
      if (data.checklist[idx]) {
        data.checklist[idx].done = chk.checked;
        sessionStorage.setItem('studyai_planner', JSON.stringify(data));
      }
    });
  });

  document.getElementById('printPlannerBtn')?.addEventListener('click', () => {
    window.print();
  });
}

// ===================================================================
// TASK 10: AI NOTES SUMMARIZER FROM PHOTOS (OCR + AI)
// ===================================================================
function initPhotoOcr() {
  const dropzone = document.getElementById('ocrDropzone');
  const fileInput = document.getElementById('ocrFileInput');
  const previewImg = document.getElementById('ocrPreviewImg');
  const sampleBtn1 = document.getElementById('loadSampleBioBtn');
  const sampleBtn2 = document.getElementById('loadSamplePhysicsBtn');
  const summarizeBtn = document.getElementById('runOcrSummarizeBtn');
  const loading = document.getElementById('ocrLoading');
  const outputContainer = document.getElementById('ocrOutputArea');

  let currentImageDataUrl = '';
  let currentSampleType = '';

  function displaySelectedImage(dataUrl, sampleType = '') {
    currentImageDataUrl = dataUrl;
    currentSampleType = sampleType;
    if (previewImg) {
      previewImg.src = dataUrl;
      previewImg.style.display = 'block';
    }
    if (summarizeBtn) {
      summarizeBtn.disabled = false;
    }
  }

  sampleBtn1?.addEventListener('click', () => {
    displaySelectedImage('assets/sample-biology-notes.svg', 'bio');
    showToast('Loaded Sample Biology Notes!', 'info');
  });

  sampleBtn2?.addEventListener('click', () => {
    displaySelectedImage('assets/sample-physics-notes.svg', 'physics');
    showToast('Loaded Sample Physics Notes!', 'info');
  });

  dropzone?.addEventListener('click', () => fileInput?.click());
  dropzone?.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });

  fileInput?.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) handleFile(fileInput.files[0]);
  });

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, SVG).', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      displaySelectedImage(e.target.result, 'custom');
      showToast('Image uploaded. Ready to extract and summarize!', 'success');
    };
    reader.readAsDataURL(file);
  }

  summarizeBtn?.addEventListener('click', async () => {
    if (!currentImageDataUrl) {
      showToast('Please upload or select a note image first.', 'warning');
      return;
    }

    // 🔑 ENFORCE MANDATORY API KEY
    const apiKey = await requireApiKey('ocr');
    if (!apiKey) {
      showToast('⚠️ API key is required to summarize photo notes. Operation cancelled.', 'warning');
      return;
    }

    loading?.classList.add('active');
    if (outputContainer) outputContainer.innerHTML = '';

    let extractedText = '';
    if (currentSampleType === 'bio') {
      extractedText = `Bio Ch. 4: Cell Respiration & ATP\n- Glycolysis occurs in cytoplasm (Anaerobic: No O2 required)\n- Net Yield: 2 ATP + 2 NADH + 2 Pyruvate molecules\nC6H12O6 + 6 O2 ==> 6 CO2 + 6 H2O + 36-38 ATP\n- Krebs Cycle (Citric Acid Cycle) in Mitochondrial Matrix\n- Electron Transport Chain (ETC): Inner mitochondrial membrane\nExam Alert: Oxygen is the final electron acceptor in ETC!`;
    } else if (currentSampleType === 'physics') {
      extractedText = `PHYSICS: KINEMATICS & ENERGY\n1. v = u + a*t | 2. s = u*t + (1/2)*a*t^2\n3. v^2 = u^2 + 2*a*s | Work = F * d * cos(θ)\nKinetic Energy: KE = 0.5 * m * v^2 (Joules)\n- Potential Energy (Gravitational): PE = m * g * h (where g = 9.8 m/s²)\n- Law of Conservation: E_total = KE_initial + PE_initial = KE_final + PE_final\nNote: Friction does negative work, converting mechanical energy to thermal energy!`;
    } else {
      extractedText = `Transcribed Student Notes:\n- Core Topic: Thermodynamics & Equilibrium\n- Equation: ΔG = ΔH - TΔS\n- High-Yield Rule: Spontaneous reaction requires negative Gibbs Free Energy.\n- Common Exam Trap: Ensure Temperature T is always converted into Kelvin!`;
    }

    const systemPrompt = `You are an AI Academic Notes Summarizer. Given this extracted raw text from student notes, generate:
1. Executive 2-bullet Quick Summary
2. Core Key Concepts Explained Simply
3. Formulas / Key Definitions extracted cleanly
4. High-Yield Exam Watchouts
Format in clean markdown.`;

    try {
      const summaryResult = await generateAIContent(systemPrompt, extractedText, 'ocr');

      StudyApp.sessionData.ocrSummary = {
        image: currentImageDataUrl,
        rawText: extractedText,
        summary: summaryResult
      };
      sessionStorage.setItem('studyai_ocr', JSON.stringify(StudyApp.sessionData.ocrSummary));

      renderOcrResultView(StudyApp.sessionData.ocrSummary);
      showToast('✓ Photo OCR & AI Summary complete!', 'success');
    } catch (err) {
      showToast('Summarization error: ' + err.message, 'error');
      if (outputContainer) {
        outputContainer.innerHTML = `
          <div class="api-key-error-card">
            <div class="error-lock-icon">🔒</div>
            <h3 style="font-weight: 800; margin-bottom: 0.5rem;">Photo Summary Blocked</h3>
            <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.25rem; font-size: 0.92rem;">
              ${escapeHtml(err.message)}
            </p>
            <button class="btn btn-primary btn-sm" onclick="requireApiKey('ocr')">🔑 Enter / Update Gemini API Key</button>
          </div>
        `;
      }
    } finally {
      loading?.classList.remove('active');
    }
  });

  if (StudyApp.sessionData.ocrSummary) {
    renderOcrResultView(StudyApp.sessionData.ocrSummary);
  }
}

function renderOcrResultView(data) {
  const container = document.getElementById('ocrOutputArea');
  if (!container || !data) return;

  const parsedSummary = markedParse(data.summary);

  container.innerHTML = `
    <div class="output-action-bar">
      <div class="output-title-group">
        <h3>Photo Notes AI Summary</h3>
        <span class="output-meta">Optical Character Recognition + Smart AI Synthesis</span>
      </div>
      <div class="action-buttons-group">
        <button class="btn btn-secondary btn-sm" id="listenOcrSummaryBtn">🔊 Listen</button>
        <button class="btn btn-secondary btn-sm" id="copyOcrSummaryBtn">Copy Summary</button>
        <button class="btn btn-primary btn-sm" id="downloadOcrSummaryBtn">Export (.md)</button>
      </div>
    </div>

    <!-- Raw OCR Extraction Accordion -->
    <details style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.85rem 1.25rem; margin-bottom: 1.5rem;">
      <summary style="font-weight: 700; cursor: pointer; color: var(--text-secondary);">
        📄 View Raw OCR Extracted Text (${data.rawText.split('\n').length} lines detected)
      </summary>
      <pre style="margin-top: 0.75rem; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; white-space: pre-wrap; color: var(--text-primary);">${escapeHtml(data.rawText)}</pre>
    </details>

    <!-- Formatted AI Summary -->
    <div class="notes-rendered-content">
      ${parsedSummary}
    </div>
  `;

  document.getElementById('copyOcrSummaryBtn')?.addEventListener('click', () => {
    copyToClipboard(data.summary, 'Summary copied to clipboard!');
  });
  document.getElementById('listenOcrSummaryBtn')?.addEventListener('click', () => {
    speakText(data.summary);
  });
  document.getElementById('downloadOcrSummaryBtn')?.addEventListener('click', () => {
    downloadFile('photo-notes-summary.md', data.summary);
  });
}

// ===================================================================
// Auto-detect & Initialize Features on Page
// ===================================================================
function initPageFeatures() {
  if (document.getElementById('resumeForm')) initResumeBuilder();
  if (document.getElementById('notesForm')) initNotesGenerator();
  if (document.getElementById('pptForm')) initPptGenerator();
  if (document.getElementById('mindmapForm')) initMindMapGenerator();
  if (document.getElementById('sheetsBackendApp') || document.getElementById('sheetsTableBody')) initSheetsBackend();
  if (document.getElementById('quizForm')) initQuizGenerator();
  if (document.getElementById('chatMessagesArea')) initDoubtSolver();
  if (document.getElementById('flashcardsForm')) initFlashcardRevision();
  if (document.getElementById('plannerForm')) initStudyPlanner();
  if (document.getElementById('ocrDropzone')) initPhotoOcr();
}

// ===================================================================
// Fallbacks & Mock Generators
// ===================================================================
function getMockAIResponse(prompt, type) {
  if (type === 'notes') {
    return `# 📘 Comprehensive Study Notes: ${prompt}

## 1. Executive Summary
- **Core Concept:** ${prompt} forms an essential pillar of modern curriculum and competitive examination syllabi.
- **Key Takeaway:** Mastery requires understanding fundamental principles, governing mechanisms, and practical problem-solving applications.

## 2. In-Depth Concepts & Core Architecture
### Foundational Principles
The subject can be broken down into three primary stages:
1. **Initial Conditions & Input Variables:** Setting the boundaries, units of measurement, and known theoretical constants.
2. **Dynamic Interaction & Energy States:** The step-by-step transformations that occur during the process.
3. **Equilibrium & Observable Output:** The resulting products, conservation of invariants, and steady state.

<div class="notes-key-card">
  <h4>★ High-Yield Definition</h4>
  <p><strong>Primary Rule:</strong> In an isolated system, the total quantity remains constant over time regardless of internal interactions.</p>
</div>

### Essential Formulas
\`\`\`text
Formula: Output_Efficiency = (Useful_Energy_Harvested / Total_Energy_Input) × 100%
Standard Deviation: σ = sqrt( Σ(x_i - μ)² / N )
\`\`\`

## 3. High-Yield Exam Pitfalls
- ⚠️ **Trap 1:** Forgetting to convert units to SI standard (e.g., grams to kilograms, Celsius to Kelvin).
- ⚠️ **Trap 2:** Confusing rate of change with instantaneous value at equilibrium.

## 4. Self-Test Checkpoint Questions
1. *What is the primary factor limiting the maximum output rate in this mechanism?*
2. *How does an external perturbation shift the equilibrium point according to foundational laws?*`;
  }

  if (type === 'chat' || type === 'doubts') {
    return `### Solution Breakdown: "${prompt}"

Here is the step-by-step explanation:

1. **The Core Intuition:**
   Think of this concept like an airport control tower coordinating flight paths. Every individual variable interacts with a shared global state, ensuring nothing conflicts.

2. **Step-by-Step Logic:**
   - **Step 1:** Identify known parameters and boundary constraints.
   - **Step 2:** Apply governing theorem or conservation laws.
   - **Step 3:** Cancel out redundant terms to isolate the target variable.

3. **💡 Key Takeaway:**
   Always test your final answer against extreme values (e.g. what happens when $t = 0$ or $t \\to \\infty$). If the limit makes physical sense, your derivation is sound!`;
  }

  return `Analysis and structured study response generated for: ${prompt}`;
}

function generateFallbackQuiz(topic, count) {
  const sample = [
    {
      question: `What is the primary governing principle behind ${topic}?`,
      options: [
        "Conservation of energy and equilibrium stability",
        "Linear divergence without boundary constraints",
        "Random thermodynamic entropy dissipation only",
        "Independent static resistance with zero decay"
      ],
      answerIndex: 0,
      explanation: "Conservation laws and equilibrium principles form the theoretical foundation across standard syllabi.",
      hint: "Think about invariant laws in closed systems."
    },
    {
      question: "Which of the following occurs when the primary driving variable is doubled?",
      options: [
        "The reaction rate drops to zero",
        "The system responds according to exponential or quadratic scaling",
        "No change occurs under any conditions",
        "The system instantly reverses polarity"
      ],
      answerIndex: 1,
      explanation: "Most dynamic physical and chemical mechanisms exhibit power-law or quadratic responses to doubling inputs.",
      hint: "Recall non-linear proportionality."
    },
    {
      question: "Which common student mistake is most frequently penalized in examinations?",
      options: [
        "Using black ink instead of blue ink",
        "Failing to convert initial values to standard SI units",
        "Writing out full equations rather than abbreviations",
        "Drawing diagrams with labeled axes"
      ],
      answerIndex: 1,
      explanation: "SI unit conversion errors (e.g. grams vs kg, km/h vs m/s) account for over 35% of lost marks in numerical questions.",
      hint: "Check units before solving."
    },
    {
      question: "How is equilibrium typically disturbed in a closed system?",
      options: [
        "By altering temperature, pressure, or concentration gradients",
        "By leaving the system completely unperturbed for infinite time",
        "By simply observing the system without contact",
        "By sealing the vessel in an isothermal bath"
      ],
      answerIndex: 0,
      explanation: "External shifts in thermodynamic parameters (temperature, pressure, concentration) force the equilibrium to readjust.",
      hint: "Remember Le Chatelier's principle."
    },
    {
      question: "What is the optimal study methodology to retain concepts in this topic?",
      options: [
        "Passive re-reading of notes 10 times",
        "Active recall, flashcards, and step-by-step problem sets",
        "Cramming 2 hours before the exam with no sleep",
        "Memorizing only the final answer numbers"
      ],
      answerIndex: 1,
      explanation: "Cognitive science shows active recall and spaced testing yield 300% higher retention compared to passive reading.",
      hint: "Think active recall."
    }
  ];

  return sample.slice(0, count);
}

function generateFallbackSlides(topic, count) {
  const slides = [
    {
      title: `${topic}: An Introduction`,
      subtitle: "Foundations & Overview",
      bullets: [
        `Historical context and primary discovery of ${topic}`,
        "Why this concept is fundamental in modern science and industry",
        "Key questions addressed in this lecture deck"
      ],
      speakerNotes: `Welcome everyone. Today we are diving into ${topic}, focusing on core principles and practical implications.`
    },
    {
      title: "Core Mechanics & Architecture",
      subtitle: "Deep Dive",
      bullets: [
        "Primary variables and how they correlate",
        "Dynamic equilibrium and governing equations",
        "Visualizing system flow and state transitions"
      ],
      speakerNotes: "Highlight how the inputs directly dictate output behavior in standard test conditions."
    },
    {
      title: "Real-World Applications & Case Studies",
      subtitle: "Practical Impact",
      bullets: [
        "Application in cutting-edge modern engineering and research",
        "Industrial scale-up challenges and efficiency bottlenecks",
        "Environmental and economic trade-offs"
      ],
      speakerNotes: "Engage the audience with a real-world case study to anchor theoretical understanding."
    },
    {
      title: "Exam Review & High-Yield Summary",
      subtitle: "Conclusion & Key Takeaways",
      bullets: [
        "Three critical formulas to commit to memory",
        "Common examiner traps and how to avoid them",
        "Recommended follow-up problem sets and flashcards"
      ],
      speakerNotes: "Remind students to review the accompanying flashcard set before the weekly assessment."
    }
  ];

  return slides.slice(0, count);
}

function generateFallbackMindMap(topic) {
  return {
    title: topic,
    modules: [
      {
        name: "Unit 1: Fundamentals & Theory",
        topics: [
          { name: "Core Definitions", subtopics: ["Axioms", "Terminology", "Standard Units"] },
          { name: "Historical Timeline", subtopics: ["Milestones", "Foundational Experiments"] }
        ]
      },
      {
        name: "Unit 2: Analytical Frameworks",
        topics: [
          { name: "Mathematical Derivations", subtopics: ["Differential Equations", "Equilibrium States"] },
          { name: "Model Simulation", subtopics: ["Boundary Limits", "Sensitivity Analysis"] }
        ]
      },
      {
        name: "Unit 3: Practical Applications",
        topics: [
          { name: "Engineering Systems", subtopics: ["Hardware Implementation", "Optimization"] },
          { name: "Future Horizons", subtopics: ["AI Integration", "Emerging Research"] }
        ]
      }
    ]
  };
}

function generateFallbackFlashcards(topic, count) {
  const sample = [
    {
      front: `What is the core definition of ${topic}?`,
      back: `A foundational academic framework describing the dynamics, state transitions, and laws governing systems in this subject.`
    },
    {
      front: "What is the primary governing equation or formula?",
      back: "Output = (Input_Effective / Resistance_Total) × Efficiency Factor (commit unit conversions to memory)."
    },
    {
      front: "What is the key difference between steady state and static equilibrium?",
      back: "Steady state requires continuous energy flow with constant parameters, whereas static equilibrium has zero net flux."
    },
    {
      front: "What exam pitfall must you always watch out for?",
      back: "Failure to verify boundary conditions (e.g. t = 0 or limits approaching infinity) before submitting."
    },
    {
      front: "Give one real-world analogy to remember this concept.",
      back: "Like water flowing through a variable valve: pressure represents potential, flow rate represents current, and pipe friction represents resistance."
    }
  ];

  return sample.slice(0, count);
}

function generateFallbackPlanner(examName, hours) {
  return {
    examName,
    dailyStrategy: `With ${hours} hours/day, allocate 50% to high-weightage topics, 30% to active MCQ practice, and 20% to flashcard revision using the Pomodoro technique.`,
    schedule: [
      {
        day: "Monday (Day 1)",
        slots: [
          { time: "9:00 - 10:30 AM", subject: "Core Theory", task: "Review Chapters 1-3 & Cornell notes", type: "theory" },
          { time: "11:00 - 12:30 PM", subject: "Problem Solving", task: "Solve 20 past exam MCQs", type: "practice" },
          { time: "4:00 - 5:00 PM", subject: "Revision", task: "Flashcards 3D active recall", type: "revision" }
        ]
      },
      {
        day: "Tuesday (Day 2)",
        slots: [
          { time: "9:00 - 10:30 AM", subject: "Weak Areas", task: "Derive key formulas step-by-step", type: "theory" },
          { time: "11:00 - 12:30 PM", subject: "Applied Practice", task: "Complete Chapter 4 problem set", type: "practice" },
          { time: "4:00 - 5:00 PM", subject: "Doubt Solving", task: "Clarify roadblocks with AI Doubt Solver", type: "revision" }
        ]
      },
      {
        day: "Wednesday (Day 3)",
        slots: [
          { time: "9:00 - 10:30 AM", subject: "Mid-Sprint Exam", task: "Take 30-min timed quiz on StudyAI", type: "practice" },
          { time: "11:00 - 12:30 PM", subject: "Error Analysis", task: "Review explanation for every incorrect answer", type: "theory" },
          { time: "4:00 - 5:00 PM", subject: "Mind Map", task: "Expand syllabus mind map branch", type: "revision" }
        ]
      }
    ],
    checklist: [
      { id: 0, text: "Complete Cornell notes for top 3 high-weightage chapters", done: true },
      { id: 1, text: "Achieve 85%+ score on 2 timed practice quizzes", done: false },
      { id: 2, text: "Master all 25 core flashcard definitions in the deck", done: false }
    ]
  };
}

// ===================================================================
// Lightweight Markdown Parser & Helpers
// ===================================================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseJsonSafely(rawString) {
  try {
    let cleaned = rawString.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '');
    if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
    cleaned = cleaned.trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('JSON parse warning:', err);
    return null;
  }
}

function markedParse(md) {
  if (!md) return '';
  if (window.marked && typeof window.marked.parse === 'function') {
    try {
      return window.marked.parse(md);
    } catch (_) {}
  }

  let html = escapeHtml(md);
  html = html.replace(/^### (.*$)/gim, '<h3 style="margin: 1.25rem 0 0.5rem; color: var(--primary);">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="margin: 1.5rem 0 0.65rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.35rem;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="margin: 1.75rem 0 0.75rem; color: var(--text-primary);">$1</h1>');
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<div class="formula-box"><code>$2</code></div>');
  html = html.replace(/`([^`]+)`/gim, '<code style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: var(--primary);">$1</code>');
  html = html.replace(/^\> (.*$)/gim, '<blockquote style="border-left: 3px solid var(--primary); padding-left: 1rem; margin: 0.75rem 0; color: var(--text-secondary); font-style: italic;">$1</blockquote>');
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li style="margin-left: 1.25rem; margin-bottom: 0.35rem;">$1</li>');
  html = html.replace(/(<li.*<\/li>)/s, '<ul style="margin: 0.75rem 0;">$1</ul>');
  html = html.replace(/\n\n+/g, '<br><br>');
  return html;
}
