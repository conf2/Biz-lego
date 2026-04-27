export const STEPS = {
  IDEA: 1,
  BUILD: 2,
  RESULT: 3
};

export const IDEAS = ["Кофейня", "Онлайн-школа", "Магазин игрушек"];
export const BLOCKS = ["продукт", "маркетинг", "команда", "деньги"];
const KEY_BLOCKS = ["продукт", "маркетинг", "деньги"];

const BUILDING_PRESETS = {
  домики: {
    min: 3,
    max: 5,
    floors: [2, 3, 3],
    width: [58, 80],
    roofChance: 1,
    wallColors: ["#38bdf8", "#22c55e", "#f59e0b"]
  },
  замки: {
    min: 4,
    max: 6,
    floors: [3, 4, 5],
    width: [70, 96],
    roofChance: 0.85,
    wallColors: ["#94a3b8", "#a78bfa", "#60a5fa"]
  },
  заводы: {
    min: 3,
    max: 5,
    floors: [2, 2, 3],
    width: [74, 105],
    roofChance: 0.65,
    wallColors: ["#f97316", "#64748b", "#22d3ee"]
  },
  небоскребы: {
    min: 4,
    max: 7,
    floors: [5, 6, 7, 8],
    width: [54, 78],
    roofChance: 0.95,
    wallColors: ["#60a5fa", "#38bdf8", "#818cf8"]
  },
  "коммерческие здания": {
    min: 4,
    max: 6,
    floors: [3, 4, 5],
    width: [66, 90],
    roofChance: 0.9,
    wallColors: ["#f59e0b", "#34d399", "#fb7185"]
  }
};

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chance(probability) {
  return Math.random() <= probability;
}

export function createRandomDemoConstruction() {
  const theme = randomItem(Object.keys(BUILDING_PRESETS));
  const preset = BUILDING_PRESETS[theme];
  const count = randomInt(preset.min, preset.max);

  const buildings = Array.from({ length: count }, (_, idx) => {
    const floors = randomItem(preset.floors);
    const width = randomInt(preset.width[0], preset.width[1]);
    const wallColor = randomItem(preset.wallColors);

    return {
      id: `${theme}-${idx}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      kind: theme,
      label: `${theme.slice(0, 1).toUpperCase()}${theme.slice(1, 5)} ${idx + 1}`,
      width,
      floors,
      wallColor,
      base: true,
      roof: chance(preset.roofChance),
      accent: chance(0.3)
    };
  });

  return {
    id: `demo-${Date.now()}`,
    theme,
    createdAt: Date.now(),
    buildings
  };
}

export function createInitialState() {
  return {
    started: false,
    step: STEPS.IDEA,
    selectedIdea: "",
    selectedBlocks: new Set(),
    result: null,
    finished: false,
    demo: createRandomDemoConstruction(),
    startedAt: null
  };
}

export function getMissingKeyBlocks(state) {
  return KEY_BLOCKS.filter((block) => !state.selectedBlocks.has(block));
}

export function toggleBlock(state, blockName) {
  if (state.selectedBlocks.has(blockName)) {
    state.selectedBlocks.delete(blockName);
  } else {
    state.selectedBlocks.add(blockName);
  }
}

export function applyRandomDemo(state) {
  state.demo = createRandomDemoConstruction();

  const presets = [
    ["продукт", "маркетинг", "деньги"],
    ["продукт", "команда", "деньги"],
    ["продукт", "маркетинг", "команда", "деньги"]
  ];

  state.selectedBlocks = new Set(randomItem(presets));
}

export function getDemoPartStats(demo) {
  const baseCount = demo.buildings.filter((b) => b.base).length;
  const wallCount = demo.buildings.reduce((sum, building) => sum + building.floors, 0);
  const roofCount = demo.buildings.filter((b) => b.roof).length;
  const accentCount = demo.buildings.filter((b) => b.accent).length;

  return { baseCount, wallCount, roofCount, accentCount };
}

export function canGoNext(state) {
  if (state.step === STEPS.IDEA) return Boolean(state.selectedIdea);
  if (state.step === STEPS.BUILD) return state.selectedBlocks.size > 0;
  if (state.step === STEPS.RESULT) return true;
  return false;
}

export function evaluateResult(state) {
  const missing = getMissingKeyBlocks(state);
  const hasKeys = missing.length === 0;

  state.result = hasKeys
    ? {
        title: "Прибыль",
        description: "Есть продукт, продвижение и деньги — бизнес-модель собрана и готова к росту.",
        ok: true,
        recommendation: "На занятии ребёнок научится масштабировать модель и управлять рисками."
      }
    : {
        title: "Есть проблемы",
        description: `Пока не хватает ключевых блоков: ${missing.join(", ")}.`,
        ok: false,
        recommendation: "На занятии он соберёт недостающие части и поймёт, как они влияют на результат."
      };
}

export function nextStep(state) {
  if (state.step === STEPS.BUILD) {
    evaluateResult(state);
  }

  if (state.step < STEPS.RESULT) {
    state.step += 1;
    return;
  }

  state.finished = true;
}

export function resetState(state) {
  state.started = false;
  state.step = STEPS.IDEA;
  state.selectedIdea = "";
  state.selectedBlocks.clear();
  state.result = null;
  state.finished = false;
  state.demo = createRandomDemoConstruction();
  state.startedAt = null;
}

export function serializeState(state) {
  return JSON.stringify({
    started: state.started,
    step: state.step,
    selectedIdea: state.selectedIdea,
    selectedBlocks: Array.from(state.selectedBlocks),
    result: state.result,
    finished: state.finished,
    demo: state.demo,
    startedAt: state.startedAt
  });
}

export function hydrateState(state, raw) {
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    state.started = Boolean(parsed.started);
    state.step = Number(parsed.step) || STEPS.IDEA;
    state.selectedIdea = parsed.selectedIdea || "";
    state.selectedBlocks = new Set(Array.isArray(parsed.selectedBlocks) ? parsed.selectedBlocks : []);
    state.result = parsed.result || null;
    state.finished = Boolean(parsed.finished);
    state.demo = parsed.demo || createRandomDemoConstruction();
    state.startedAt = parsed.startedAt || null;
  } catch {
    // ignore malformed local state
  }
}
