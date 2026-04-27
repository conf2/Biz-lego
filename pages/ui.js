import { BLOCKS, IDEAS, STEPS, getDemoPartStats } from "./state.js";

export function getStepTitle(step) {
  if (step === STEPS.IDEA) return "Шаг 1: Выберите идею";
  if (step === STEPS.BUILD) return "Шаг 2: Соберите бизнес";
  return "Шаг 3: Результат";
}

function renderDemoConstruction(demo) {
  const { baseCount, wallCount, roofCount } = getDemoPartStats(demo);

  return `
    <div class="panel">
      <h3>🎲 Демо-конструкция: ${demo.theme}</h3>
      <p class="muted">Основание, стены и крыша собраны как реальная мини-модель города.</p>

      <div class="city-preview">
        ${demo.buildings.map((building) => `
          <div class="building">
            ${building.roof ? `<div class="lego-part lego-roof" style="--part-width:${building.width + 6}px"></div>` : ""}
            ${Array.from({ length: building.floors }, () => `<div class="lego-part lego-wall" style="--part-width:${building.width}px; --wall-color:${building.wallColor}"></div>`).join("")}
            ${building.base ? `<div class="lego-part lego-base" style="--part-width:${building.width + 10}px"></div>` : ""}
            <div class="building-label">${building.label}</div>
          </div>
        `).join("")}
      </div>

      <div class="parts-legend">
        <span class="pill">Основания: ${baseCount}</span>
        <span class="pill">Стены: ${wallCount}</span>
        <span class="pill">Крыши: ${roofCount}</span>
      </div>
    </div>
  `;
}

export function renderContent(state, contentEl, handlers) {
  if (state.finished) {
    contentEl.innerHTML = `
      <div class="panel">
        <h2>Ребёнок только что собрал модель бизнеса</h2>
        <p class="muted">На занятии он сделает это в реальности.</p>
        <button id="ctaBtn" class="btn success">Записаться на занятие</button>
      </div>
      ${renderDemoConstruction(state.demo)}
    `;
    contentEl.querySelector("#ctaBtn").addEventListener("click", handlers.onCta);
    return;
  }

  if (state.step === STEPS.IDEA) {
    contentEl.innerHTML = `
      <div class="panel">
        <h3>Выберите идею бизнеса</h3>
        <div class="choice-grid">
          ${IDEAS.map((idea) => `
            <button class="choice ${state.selectedIdea === idea ? "active" : ""}" data-idea="${idea}">
              ${idea}
            </button>
          `).join("")}
        </div>
      </div>
      ${renderDemoConstruction(state.demo)}
    `;

    contentEl.querySelectorAll("[data-idea]").forEach((btn) => {
      btn.addEventListener("click", () => handlers.onIdeaSelect(btn.dataset.idea));
    });
    return;
  }

  const resultHtml = state.result
    ? `<div class="panel"><h3>${state.result.title}</h3><p class="muted">${state.result.description}</p></div>`
    : "";

  contentEl.innerHTML = `
    <div class="panel">
      <h3>Добавьте блоки бизнеса</h3>
      <div class="brick-zone">
        ${BLOCKS.map((block) => `
          <article class="brick ${state.selectedBlocks.has(block) ? "active" : ""}" data-block="${block}">
            <strong>${block}</strong>
            <p class="muted">Клик, чтобы добавить в модель.</p>
          </article>
        `).join("")}
      </div>
    </div>

    <div class="panel">
      <h3>Ваша модель</h3>
      <div class="lego-preview">
        ${BLOCKS.map((block) => `
          <span class="mini ${state.selectedBlocks.has(block) ? "active" : ""}">${block}</span>
        `).join("")}
      </div>
    </div>

    ${renderDemoConstruction(state.demo)}
    ${state.step === STEPS.RESULT ? resultHtml : ""}
  `;

  contentEl.querySelectorAll("[data-block]").forEach((card) => {
    card.addEventListener("click", () => handlers.onBlockToggle(card.dataset.block));
  });
}

export function renderTop(state, elements) {
  elements.stepTitle.textContent = getStepTitle(state.step);
  elements.progressLabel.textContent = `${Math.min(state.step, 3)} / 3`;
  elements.progressFill.style.width = `${(Math.min(state.step, 3) / 3) * 100}%`;

  const canUseDemo = state.started && !state.finished;
  elements.demoBtn.disabled = !canUseDemo;
  elements.demoBtn.style.opacity = canUseDemo ? "1" : "0.5";

  if (state.finished) {
    elements.nextBtn.textContent = "Готово";
    elements.nextBtn.disabled = true;
    elements.nextBtn.style.opacity = "0.5";
    return;
  }

  elements.nextBtn.disabled = false;
  elements.nextBtn.style.opacity = "1";
  elements.nextBtn.textContent = state.step < STEPS.RESULT ? "Далее" : "Показать финал";
}
