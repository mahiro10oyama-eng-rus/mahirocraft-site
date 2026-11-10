/**
 * MahiroCraft Launcher — Official Landing Page Scripts
 * Includes: Sakura/Snow Canvas Particles, Themes (Onimai Pastel & Modern Dark),
 * Interactive Launcher Mockup, AI Helper Simulator, FAQ & Modals.
 * Developed by _Mah1r0_
 */

// ==========================================
// 1. PARTICLE ENGINE (Sakura & Snowflakes)
// ==========================================

class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.mode = localStorage.getItem('mahiro_particles') || 'sakura'; // 'sakura', 'snow', 'none'
    this.particles = [];
    this.maxParticles = 35;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.animationId = null;

    this.initCanvas();
    this.bindEvents();
    this.createParticles();
    this.startLoop();
  }

  initCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.initCanvas();
    });
  }

  setMode(mode) {
    this.mode = mode;
    localStorage.setItem('mahiro_particles', mode);
    this.particles = [];
    if (mode !== 'none') {
      this.createParticles();
    } else {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    updateParticleUI(mode);
  }

  createParticles() {
    this.particles = [];
    if (this.mode === 'none') return;

    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.spawnParticle(true));
    }
  }

  spawnParticle(initial = false) {
    const isSakura = this.mode === 'sakura';
    return {
      x: Math.random() * this.width,
      y: initial ? Math.random() * this.height : -20,
      size: isSakura ? 12 + Math.random() * 10 : 3 + Math.random() * 5,
      speedX: isSakura ? (Math.random() - 0.5) * 1.5 + 0.5 : (Math.random() - 0.5) * 0.8,
      speedY: isSakura ? 1.2 + Math.random() * 1.5 : 0.8 + Math.random() * 1.2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.04,
      flip: Math.random() * Math.PI,
      flipSpeed: 0.03 + Math.random() * 0.03,
      opacity: 0.5 + Math.random() * 0.45,
      color: isSakura 
        ? (Math.random() > 0.4 ? '#FFB7CE' : '#FF7597')
        : '#FFFFFF'
    };
  }

  drawSakuraPetal(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate(p.rotation);
    this.ctx.scale(Math.cos(p.flip), 1);

    this.ctx.fillStyle = p.color;
    this.ctx.globalAlpha = p.opacity;

    // Petal Shape Bezier Curve
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
    this.ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);
    this.ctx.fill();

    // Subtle internal highlight line
    this.ctx.strokeStyle = '#FFEBF0';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 2);
    this.ctx.lineTo(0, p.size * 0.7);
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawSnowflake(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.globalAlpha = p.opacity;

    this.ctx.beginPath();
    this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  update() {
    if (this.mode === 'none') return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      p.flip += p.flipSpeed;

      if (this.mode === 'sakura') {
        this.drawSakuraPetal(p);
      } else {
        this.drawSnowflake(p);
      }

      // Wrap around edges
      if (p.y > this.height + 20 || p.x < -30 || p.x > this.width + 30) {
        this.particles[i] = this.spawnParticle(false);
      }
    }
  }

  startLoop() {
    const loop = () => {
      this.update();
      this.animationId = requestAnimationFrame(loop);
    };
    loop();
  }
}

// Global Particle Instance
let particleEngineInstance = null;

function setParticleMode(mode) {
  if (particleEngineInstance) {
    particleEngineInstance.setMode(mode);
  }
}

function updateParticleUI(mode) {
  // Header button display
  const iconDisplay = document.getElementById('particleIconDisplay');
  if (iconDisplay) {
    if (mode === 'sakura') iconDisplay.textContent = '🌸';
    else if (mode === 'snow') iconDisplay.textContent = '❄️';
    else iconDisplay.textContent = '🚫';
  }

  // Customizer buttons
  document.querySelectorAll('.particle-choice-btn').forEach(btn => {
    if (btn.getAttribute('data-particle-choice') === mode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function toggleNextParticle() {
  const current = particleEngineInstance ? particleEngineInstance.mode : 'sakura';
  const modes = ['sakura', 'snow', 'none'];
  const nextIdx = (modes.indexOf(current) + 1) % modes.length;
  const nextMode = modes[nextIdx];
  setParticleMode(nextMode);

  const titles = {
    sakura: 'Включены лепестки сакуры 🌸',
    snow: 'Включены зимние снежинки ❄️',
    none: 'Частицы отключены 🚫'
  };
  showToast(titles[nextMode]);
}

// ==========================================
// 2. THEME SWITCHER (Onimai Pastel & Dark)
// ==========================================

function setAppTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('mahiro_theme', theme);

  // Update Customizer UI buttons
  document.querySelectorAll('.theme-select-btn').forEach(btn => {
    if (btn.getAttribute('data-theme-choice') === theme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Re-draw particles
  if (particleEngineInstance) {
    particleEngineInstance.createParticles();
  }
}

function toggleAppTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'pastel';
  const nextTheme = current === 'pastel' ? 'dark' : 'pastel';
  setAppTheme(nextTheme);

  showToast(nextTheme === 'dark' ? 'Включена тема Modern Dark 🌙' : 'Включена тема Onimai Pastel 🌸');
}

// ==========================================
// 3. LAUNCHER MOCKUP INTERACTIVITY
// ==========================================

function initLauncherMockup() {
  const navItems = document.querySelectorAll('.launcher-nav-item');
  const tabContents = document.querySelectorAll('.launcher-tab-content');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');

      // Update Nav active
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Update Tab Content
      tabContents.forEach(tab => {
        if (tab.id === targetTab) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
    });
  });
}

// Play Game Simulation
let isLaunching = false;
function simulateGameLaunch() {
  if (isLaunching) return;
  isLaunching = true;

  const playBtn = document.getElementById('launcherPlayBtn');
  const playText = document.getElementById('playBtnText');

  playBtn.style.opacity = '0.8';
  playText.textContent = 'Подготовка...';

  setTimeout(() => {
    playText.textContent = 'Проверка SHA-1...';
  }, 700);

  setTimeout(() => {
    playText.textContent = 'Запуск Java 25...';
  }, 1400);

  setTimeout(() => {
    playText.textContent = 'ИГРА ЗАПУЩЕНА! 🌸';
    playBtn.style.background = 'linear-gradient(135deg, #FF7597 0%, #FFB7CE 100%)';
    showToast('✨ Minecraft 1.26.3 успешно запущен с Fabric!');
  }, 2200);

  setTimeout(() => {
    playBtn.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    playText.textContent = 'ИГРАТЬ';
    playBtn.style.opacity = '1';
    isLaunching = false;
  }, 5000);
}

// Toggle Mod Install
function toggleModInstall(btn) {
  if (btn.classList.contains('btn-installed')) {
    btn.classList.remove('btn-installed');
    btn.classList.add('btn-install');
    btn.textContent = 'Установить';
    showToast('Мод удалён из текущей сборки');
  } else {
    btn.textContent = 'Загрузка...';
    setTimeout(() => {
      btn.classList.remove('btn-install');
      btn.classList.add('btn-installed');
      btn.textContent = 'Установлено ✓';
      showToast('Мод и зависимости успешно установлены! 🧩');
    }, 600);
  }
}

// Switch Instance in Mockup
function switchActiveInstance(btn, name) {
  const rows = document.querySelectorAll('.instance-row');
  rows.forEach(r => {
    r.classList.remove('active');
    const badge = r.querySelector('.inst-status');
    if (badge) badge.remove();

    const existingBtn = r.querySelector('.btn-tiny-ghost');
    if (!existingBtn && !r.contains(btn)) {
      const b = document.createElement('button');
      b.className = 'btn-tiny-ghost';
      b.textContent = 'Выбрать';
      b.onclick = function() { switchActiveInstance(b, r.querySelector('strong').textContent); };
      r.appendChild(b);
    }
  });

  const parentRow = btn.closest('.instance-row');
  parentRow.classList.add('active');
  btn.remove();

  const currentBadge = document.createElement('span');
  currentBadge.className = 'inst-status current';
  currentBadge.textContent = 'Выбрано';
  parentRow.appendChild(currentBadge);

  // Update launcher play bar version text
  const badgeVer = document.querySelector('.bottom-version-select .badge-ver');
  if (badgeVer) {
    badgeVer.textContent = name;
  }

  showToast(`Выбрана сборка: ${name} 📦`);
}

function mockCreateInstance() {
  showToast('Открыт мастер создания изолированной сборки .NET');
}

function mockShaderApply(btn) {
  btn.textContent = 'Применено ✓';
  btn.style.background = '#10B981';
  showToast('Шейдерпак активирован в конфигурации Iris! 🎨');
}

// ==========================================
// 4. INTERACTIVE AI ASSISTANT DEMO
// ==========================================

const aiResponses = {
  crash: {
    q: '💥 Exit Code 1 при запуске',
    a: `<strong>Анализ краш-лога:</strong>
В 90% случаев Exit Code 1 на версиях 1.20 - 1.26 связан с несовместимостью модов рендеринга (например, старая версия Sodium или попытка запустить OptiFine вместе с Fabric API).
<br><br>
<strong>Решение Mahiro-Helper:</strong>
1. Обновите Fabric Loader до версии 0.16.9+ прямо в лаунчере.
2. Удалите дублирующие библиотеки шейдеров.
3. Проверьте, что в настройках выбрана Java 21 или Java 25. Лаунчер уже скачал нужный JDK!`
  },
  ram: {
    q: '🧠 Сколько ОЗУ выделить?',
    a: `<strong>Рекомендация по оперативной памяти:</strong>
• <strong>Ванилла (без модов):</strong> 2–3 ГБ.
• <strong>Легкая сборка (Fabric + Sodium + 30 модов):</strong> 4–5 ГБ.
• <strong>Тяжёлая сборка (NeoForge 150+ модов):</strong> 6–8 ГБ.
<br><br>
⚠️ <em>Совет:</em> Не выделяйте более 80% от всей физической памяти ПК, чтобы операционная система Windows и драйверы GPU не уходили в файл подкачки.`
  },
  conflict: {
    q: '⚔️ Конфликт Sodium & OptiFine',
    a: `<strong>Внимание!</strong> Sodium и OptiFine полностью несовместимы, так как оба переписывают один и тот же графический пайплайн Minecraft.
<br><br>
<strong>Лучшая современная альтернатива:</strong>
Используйте связку <strong>Sodium + Iris Shaders + Lithium</strong>. Она даёт в 2–3 раза больше FPS, поддерживает любые шейдеры BSL/Complementary и мгновенно устанавливается в 1 клик во вкладке «Моды (Modrinth)»!`
  },
  shaders: {
    q: '🎨 Как включить шейдеры?',
    a: `В лаунчере MahiroCraft шейдеры устанавливаются без ручного копирования в папку shaderpacks:
<br>
1. Перейдите во вкладку <strong>«Шейдеры»</strong> внутри лаунчера.
2. Выберите понравившийся шейдерпак (например, BSL Shaders или Complementary).
3. Нажмите <strong>«Установить и включить»</strong>. Лаунчер сам настроит Iris и профиль графики!`
  }
};

function askAiDemo(key) {
  const item = aiResponses[key];
  if (!item) return;

  appendUserMessage(item.q);

  // Simulate typing delay
  setTimeout(() => {
    appendAiMessage(item.a);
  }, 400);
}

function handleAiInput(e) {
  if (e.key === 'Enter') {
    submitCustomAi();
  }
}

function submitCustomAi() {
  const input = document.getElementById('aiCustomInput');
  const text = input.value.trim();
  if (!text) return;

  appendUserMessage(text);
  input.value = '';

  // Intelligent mock answers based on keywords
  setTimeout(() => {
    const lower = text.toLowerCase();
    let reply = '';

    if (lower.includes('краш') || lower.includes('crash') || lower.includes('вылет') || lower.includes('ошибк')) {
      reply = `Я просканировала ваш запрос по базе частых сбоев! Обычно вылеты связаны с конфликтом модов. Перейдите во вкладку <strong>«Логи»</strong> в лаунчере и нажмите кнопку <em>«Анализировать через ИИ»</em> — я найду точную строчку с ошибкой! 🌸`;
    } else if (lower.includes('памят') || lower.includes('озу') || lower.includes('ram')) {
      reply = `Для оптимальной работы сборки с Native .NET 10 мы рекомендуем выделить <strong>4 до 6 ГБ ОЗУ</strong>. Наш лаунчер автоматически применяет флаги <code>-XX:+UseZGC</code> для плавных кадров без фризов! ✨`;
    } else if (lower.includes('мод') || lower.includes('скачать') || lower.includes('modrinth')) {
      reply = `Вы можете искать и устанавливать любые моды через встроенный каталог Modrinth прямо в окне MahiroCraft! Без браузера и распаковки ZIP-файлов.`;
    } else if (lower.includes('ely') || lower.includes('скин') || lower.includes('лиценз')) {
      reply = `Вам не нужна официальная платная лицензия! В лаунчер встроен бесплатный вход через <strong>Ely.by</strong> — ваши скины и плащи будут видны другим игрокам. Также есть оффлайн-режим.`;
    } else {
      reply = `Спасибо за вопрос! Mahiro-Helper непрерывно обучается. Если вам нужна детальная помощь или вы нашли баг в Beta-версии, загляните в наш Discord сервер: <a href="https://discord.gg/RmEYpcjnNT" target="_blank" style="color: var(--accent-pink); text-decoration: underline;">https://discord.gg/RmEYpcjnNT</a> 🌸`;
    }

    appendAiMessage(reply);
  }, 500);
}

function appendUserMessage(text) {
  const chatBox = document.getElementById('aiChatBox');
  const msgEl = document.createElement('div');
  msgEl.className = 'chat-msg msg-user';
  msgEl.innerHTML = `
    <div class="msg-author">Вы:</div>
    <div class="msg-bubble">${text}</div>
  `;
  chatBox.appendChild(msgEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendAiMessage(htmlContent) {
  const chatBox = document.getElementById('aiChatBox');
  const msgEl = document.createElement('div');
  msgEl.className = 'chat-msg msg-ai';
  msgEl.innerHTML = `
    <div class="msg-author">Mahiro-Helper:</div>
    <div class="msg-bubble">${htmlContent}</div>
  `;
  chatBox.appendChild(msgEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ==========================================
// 5. FAQ ACCORDION
// ==========================================

function toggleFaq(button) {
  const item = button.closest('.faq-item');
  const allItems = document.querySelectorAll('.faq-item');

  // Close others for clean accordion look
  allItems.forEach(i => {
    if (i !== item) {
      i.classList.remove('active');
    }
  });

  item.classList.toggle('active');
}

// ==========================================
// 6. MODALS & DOWNLOAD LEGAL AGREEMENT
// ==========================================

// GitHub Release v1.0.0 URLs
const DOWNLOAD_LINKS = {
  exe: 'https://github.com/mahiro10oyama-eng-rus/mahirocraft-site/releases/download/v1.0.0/MahiroCraft_v1.0.0_Setup.exe',
  zip: 'https://github.com/mahiro10oyama-eng-rus/mahirocraft-site/releases/download/v1.0.0/MahiroCraft_v1.0.0_Portable.zip'
};

let currentDownloadFormat = 'exe'; // 'exe' | 'zip'

const legalDocsData = {
  terms: {
    title: 'Условия использования MahiroCraft',
    html: `
      <h4>1. Статус проекта и отказ от ответственности</h4>
      <p>
        <strong>MahiroCraft</strong> является независимым фанатским проектом, созданным разработчиком <strong>_Mah1r0_</strong>. 
        Лаунчер не является официальным программным обеспечением Mojang Studios, Xbox Game Studios или Microsoft Corporation, а также не спонсируется и не одобряется ими.
      </p>
      <p>
        Minecraft является зарегистрированной торговой маркой Mojang AB. Все товарные знаки, моды, шейдеры и игровые ассеты принадлежат их законным правообладателям.
      </p>

      <h4>2. Предоставление программного обеспечения</h4>
      <p>
        Клиент MahiroCraft распространяется бесплатно по принципу <em>«как есть» (AS IS)</em>. Разработчик гарантирует отсутствие встроенных майнеров, вирусов и вредоносного кода в официальных сборках, однако не несет ответственности за возможные сбои сторонних модов или несовместимости видеодрайверов.
      </p>

      <h4>3. Сервисы авторизации и скинов</h4>
      <p>
        Лаунчер использует сторонний сервис <strong>Ely.by</strong> для бесплатной доставки скинов и плащей, а также классический автономный (оффлайн) режим. Использование данных сервисов регулируется их собственными правилами.
      </p>

      <h4>4. Правила сообщества</h4>
      <p>
        Пользователям запрещается декомпилировать клиент с целью внедрения троянов, переупаковывать лаунчер со скрытым вредоносным ПО или выдавать неофициальные модифицированные версии за релизы автора <strong>_Mah1r0_</strong>.
      </p>
    `
  },
  privacy: {
    title: 'Политика конфиденциальности MahiroCraft',
    html: `
      <h4>1. Базовые принципы приватности</h4>
      <p>
        Мы категорически уважаем конфиденциальность наших пользователей. В лаунчере <strong>MahiroCraft</strong> полностью отсутствует рекламная телеметрия, скрытый сбор личных файлов, кейлоггеры и трекеры активности.
      </p>

      <h4>2. Какие данные обрабатываются локально</h4>
      <ul>
        <li><strong>Токены сессий:</strong> При входе через аккаунт Ely.by токен авторизации сохраняется исключительно на вашем локальном компьютере в зашифрованном хранилище ОС (Windows Data Protection API).</li>
        <li><strong>Файлы настроек:</strong> Конфигурации памяти RAM, пути к Java и выбранные темы оформления хранятся локально в директории лаунчера.</li>
        <li><strong>Краш-логи:</strong> При использовании ИИ-помощника Mahiro-Helper отправляются только обезличенные фрагменты Java-исключений. Личные имена пользователей и системные пути Windows очищаются перед отправкой.</li>
      </ul>

      <h4>3. Прямые соединения</h4>
      <p>
        Загрузка игровых библиотек осуществляется напрямую с официальных CDN Mojang. Загрузка модов и шейдеров происходит напрямую через публичный открытый API Modrinth.
      </p>

      <h4>4. Контакты автора</h4>
      <p>
        По любым вопросам безопасности и работы лаунчера вы можете связаться напрямую с разработчиком в Discord: <a href="https://discord.gg/RmEYpcjnNT" target="_blank" style="color: var(--accent-pink); text-decoration: underline;">https://discord.gg/RmEYpcjnNT</a>.
      </p>
    `
  }
};

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function closeModalOnBackdrop(event, modalId) {
  if (event.target.id === modalId) {
    closeModal(modalId);
  }
}

// Open Download Modal with Fresh State
function openDownloadModal() {
  const dlMainView = document.getElementById('dlMainView');
  const dlLegalView = document.getElementById('dlLegalView');
  const consentWrap = document.getElementById('consentWrap');
  const consentCb = document.getElementById('legalConsentCheckbox');
  const confirmBtn = document.getElementById('btnConfirmDownload');

  if (dlMainView) dlMainView.style.display = 'block';
  if (dlLegalView) dlLegalView.style.display = 'none';
  if (consentWrap) consentWrap.classList.remove('highlight-error');

  // Sync button state with checkbox
  if (confirmBtn && consentCb) {
    if (consentCb.checked) {
      confirmBtn.disabled = false;
      confirmBtn.classList.remove('disabled');
    } else {
      confirmBtn.disabled = true;
      confirmBtn.classList.add('disabled');
    }
  }

  openModal('downloadModal');
}

// Switch between .exe installer and .zip portable
function selectDownloadFormat(format) {
  currentDownloadFormat = format;

  const exeOpt = document.getElementById('formatExeOption');
  const zipOpt = document.getElementById('formatZipOption');

  if (format === 'exe') {
    if (exeOpt) exeOpt.classList.add('active');
    if (zipOpt) zipOpt.classList.remove('active');
  } else {
    if (zipOpt) zipOpt.classList.add('active');
    if (exeOpt) exeOpt.classList.remove('active');
  }
}

// Toggle Consent Checkbox
function handleConsentToggle(checkbox) {
  const confirmBtn = document.getElementById('btnConfirmDownload');
  const consentWrap = document.getElementById('consentWrap');

  if (consentWrap) consentWrap.classList.remove('highlight-error');

  if (confirmBtn) {
    if (checkbox.checked) {
      confirmBtn.disabled = false;
      confirmBtn.classList.remove('disabled');
    } else {
      confirmBtn.disabled = true;
      confirmBtn.classList.add('disabled');
    }
  }
}

// Click on Confirm Download
function handleConfirmedDownload() {
  const consentCb = document.getElementById('legalConsentCheckbox');
  const consentWrap = document.getElementById('consentWrap');

  if (!consentCb || !consentCb.checked) {
    if (consentWrap) {
      consentWrap.classList.add('highlight-error');
      setTimeout(() => {
        consentWrap.classList.remove('highlight-error');
      }, 700);
    }
    showToast('⚠️ Пожалуйста, подтвердите согласие с правилами для скачивания!');
    return;
  }

  const downloadUrl = DOWNLOAD_LINKS[currentDownloadFormat] || DOWNLOAD_LINKS.exe;

  // Direct download from GitHub Release v1.0.0
  window.location.href = downloadUrl;

  // Close download modal
  closeModal('downloadModal');

  // Success toast notification
  showToast('Загрузка началась! Спасибо за выбор MahiroCraft 🌸');
}

// In-Modal Legal Document Viewer
function showLegalInDownload(event, type) {
  if (event) event.preventDefault();

  const dlMainView = document.getElementById('dlMainView');
  const dlLegalView = document.getElementById('dlLegalView');
  const dlLegalTitle = document.getElementById('dlLegalTitle');
  const dlLegalContent = document.getElementById('dlLegalContent');

  const doc = legalDocsData[type];
  if (!doc) return;

  if (dlLegalTitle) dlLegalTitle.textContent = doc.title;
  if (dlLegalContent) dlLegalContent.innerHTML = doc.html;

  if (dlMainView) dlMainView.style.display = 'none';
  if (dlLegalView) dlLegalView.style.display = 'block';
}

function backToDownloadView() {
  const dlMainView = document.getElementById('dlMainView');
  const dlLegalView = document.getElementById('dlLegalView');

  if (dlLegalView) dlLegalView.style.display = 'none';
  if (dlMainView) dlMainView.style.display = 'block';
}

function acceptLegalAndReturn() {
  const consentCb = document.getElementById('legalConsentCheckbox');
  if (consentCb) {
    consentCb.checked = true;
    handleConsentToggle(consentCb);
  }
  showToast('Согласие с условиями принято ✓');
  backToDownloadView();
}

function triggerDownload(filename) {
  showToast(`Загрузка: ${filename} 🌸`);

  // Simulated download
  const blob = new Blob(
    [`MahiroCraft Launcher v1.0.0 Release\nPlatform: Native .NET 10 / Windows x64\nCreated by _Mah1r0_\nDiscord: https://discord.gg/RmEYpcjnNT\n`], 
    { type: 'text/plain;charset=utf-8' }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function copyHash(btn) {
  const hash = document.getElementById('shaHash');
  const text = hash ? hash.textContent : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Скопировано ✓';
    showToast('Контрольная сумма SHA-256 скопирована в буфер обмена!');
    setTimeout(() => {
      btn.textContent = 'Копировать';
    }, 2500);
  });
}

// ==========================================
// 7. TOAST NOTIFICATIONS
// ==========================================

function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>🌸</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3200);
}

// Toggle extra shadow/blur
function toggleSoftSounds(cb) {
  if (cb.checked) {
    document.documentElement.style.setProperty('--shadow-glow', '0 0 25px rgba(255, 117, 151, 0.35)');
    showToast('Мягкие тени и свечение включены ✨');
  } else {
    document.documentElement.style.setProperty('--shadow-glow', 'none');
    showToast('Эффекты свечения отключены');
  }
}

// ==========================================
// 8. INITIALIZATION ON DOM READY
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Particles
  particleEngineInstance = new ParticleEngine('particleCanvas');
  const savedParticles = localStorage.getItem('mahiro_particles') || 'sakura';
  updateParticleUI(savedParticles);

  // 2. Initialize Theme
  const savedTheme = localStorage.getItem('mahiro_theme') || 'pastel';
  setAppTheme(savedTheme);

  // 3. Bind Header Buttons
  const particleBtn = document.getElementById('particleToggleBtn');
  if (particleBtn) {
    particleBtn.addEventListener('click', toggleNextParticle);
  }

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleAppTheme);
  }

  // 4. Mobile Drawer Burger
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  if (burgerBtn && mobileDrawer) {
    burgerBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });

    // Close mobile drawer on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // 5. Launcher Mockup Tabs
  initLauncherMockup();

  // 6. Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(modal => {
        closeModal(modal.id);
      });
    }
  });

  console.log('🌸 MahiroCraft Launcher Landing Page loaded successfully!');
});
