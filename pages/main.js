import {
  applyRandomDemo,
  canGoNext,
  createInitialState,
  nextStep,
  resetState,
  toggleBlock
} from "./state.js";
import { renderContent, renderTop } from "./ui.js";

const state = createInitialState();

const els = {
  startOverlay: document.getElementById("startOverlay"),
  startBtn: document.getElementById("startBtn"),
  content: document.getElementById("content"),
  stepTitle: document.getElementById("stepTitle"),
  progressLabel: document.getElementById("progressLabel"),
  progressFill: document.getElementById("progressFill"),
  nextBtn: document.getElementById("nextBtn"),
  demoBtn: document.getElementById("demoBtn"),
  resetBtn: document.getElementById("resetBtn"),
  scene: document.getElementById("scene")
};

let audioCtx = null;

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

function rerender() {
  renderTop(state, els);
  renderContent(state, els.content, {
    onIdeaSelect: (idea) => {
      state.selectedIdea = idea;
      playClick();
      rerender();
    },
    onBlockToggle: (block) => {
      toggleBlock(state, block);
      playClick();
      rerender();
    },
    onCta: () => {
      alert("Заявка отправлена! Мы свяжемся с вами для записи на занятие.");
    }
  });
}

els.startBtn.addEventListener("click", () => {
  state.started = true;
  els.startOverlay.classList.add("hidden");
  playClick();
  rerender();
});

els.nextBtn.addEventListener("click", () => {
  if (!canGoNext(state)) {
    alert("Сделайте выбор на текущем шаге, чтобы продолжить.");
    return;
  }
  nextStep(state);
  playClick();
  rerender();
});

els.demoBtn.addEventListener("click", () => {
  if (!state.started || state.finished) return;
  applyRandomDemo(state);
  playClick();
  rerender();
});

els.resetBtn.addEventListener("click", () => {
  resetState(state);
  els.startOverlay.classList.remove("hidden");
  rerender();
});

initScene();
rerender();
