import {
  IDEAS,
  applyRandomDemo,
  canGoNext,
  createInitialState,
  hydrateState,
  nextStep,
  resetState,
  serializeState,
  toggleBlock
} from "./state.js";
import { renderContent, renderTop } from "./ui.js";

const STORAGE_KEY = "biz_lego_mvp_state_v2";
const state = createInitialState();
hydrateState(state, localStorage.getItem(STORAGE_KEY));

const els = {
  startOverlay: document.getElementById("startOverlay"),
  startBtn: document.getElementById("startBtn"),
  content: document.getElementById("content"),
  stepTitle: document.getElementById("stepTitle"),
  progressLabel: document.getElementById("progressLabel"),
  progressFill: document.getElementById("progressFill"),
  timerChip: document.getElementById("timerChip"),
  themeChip: document.getElementById("themeChip"),
  stepPills: document.getElementById("stepPills"),
  nextBtn: document.getElementById("nextBtn"),
  demoBtn: document.getElementById("demoBtn"),
  resetBtn: document.getElementById("resetBtn"),
  scene: document.getElementById("scene")
};

let audioCtx = null;
let timerId = null;

function initScene() {
  const colors = ["#38bdf8", "#22c55e", "#f59e0b", "#e879f9", "#60a5fa"];
  for (let i = 0; i < 8; i += 1) {
    const node = document.createElement("div");
    node.className = "floating-brick";
    node.style.left = `${6 + i * 11}%`;
    node.style.top = `${8 + (i % 4) * 20}%`;
    node.style.animationDelay = `${i * 0.3}s`;
    node.style.background = `linear-gradient(140deg, ${colors[i % colors.length]}, #1e293b)`;
    els.scene.appendChild(node);
  }
}

function ensureAudio() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

function playClick() {
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(520, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateTimerChip() {
  if (!state.startedAt) {
    els.timerChip.textContent = "⏱ 00:00";
    return;
  }
  const elapsed = Date.now() - state.startedAt;
  els.timerChip.textContent = `⏱ ${formatTime(elapsed)}`;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, serializeState(state));
}

function rerender() {
  if (state.started) {
    els.startOverlay.classList.add("hidden");
  }

  renderTop(state, els);
  renderContent(state, els.content, {
    onIdeaSelect: (idea) => {
      state.selectedIdea = idea;
      playClick();
      persist();
      rerender();
    },
    onBlockToggle: (block) => {
      toggleBlock(state, block);
      playClick();
      persist();
      rerender();
    },
    onCta: () => {
      alert("Заявка отправлена! Мы свяжемся с вами для записи на занятие.");
    }
  });

  updateTimerChip();
}

function startSessionIfNeeded() {
  if (!state.startedAt) state.startedAt = Date.now();
  if (timerId) return;
  timerId = setInterval(updateTimerChip, 1000);
}

function registerHotkeys() {
  document.addEventListener("keydown", (event) => {
    if (!state.started || state.finished) return;

    const key = event.key.toLowerCase();
    if (["1", "2", "3"].includes(key) && state.step === 1) {
      state.selectedIdea = IDEAS[Number(key) - 1];
      persist();
      rerender();
    }

    if (key === "d") {
      applyRandomDemo(state);
      persist();
      rerender();
    }

    if (key === "n") {
      if (!canGoNext(state)) return;
      nextStep(state);
      persist();
      rerender();
    }

    if (key === "r") {
      resetState(state);
      localStorage.removeItem(STORAGE_KEY);
      els.startOverlay.classList.remove("hidden");
      rerender();
    }
  });
}

els.startBtn.addEventListener("click", () => {
  state.started = true;
  startSessionIfNeeded();
  els.startOverlay.classList.add("hidden");
  playClick();
  persist();
  rerender();
});

els.nextBtn.addEventListener("click", () => {
  if (!canGoNext(state)) {
    alert("Сделайте выбор на текущем шаге, чтобы продолжить.");
    return;
  }
  nextStep(state);
  playClick();
  persist();
  rerender();
});

els.demoBtn.addEventListener("click", () => {
  if (!state.started || state.finished) return;
  applyRandomDemo(state);
  playClick();
  persist();
  rerender();
});

els.resetBtn.addEventListener("click", () => {
  resetState(state);
  localStorage.removeItem(STORAGE_KEY);
  els.startOverlay.classList.remove("hidden");
  rerender();
});

initScene();
registerHotkeys();
if (state.started) startSessionIfNeeded();
rerender();
