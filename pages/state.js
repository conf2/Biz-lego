export const STEPS = {
  IDEA: 1,
  BUILD: 2,
  RESULT: 3
};

export const IDEAS = ["Кофейня", "Онлайн-школа", "Магазин игрушек"];
export const BLOCKS = ["продукт", "маркетинг", "команда", "деньги"];
const KEY_BLOCKS = ["продукт", "маркетинг", "деньги"];

const DEMO_THEMES = [
  "домики",
  "замки",
  "заводы",
  "небоскребы",
  "коммерческие здания"
];

const WALL_COLORS = ["#38bdf8", "#22c55e", "#a78bfa", "#f59e0b", "#fb7185"];

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createRandomDemoConstruction() {
  const theme = randomItem(DEMO_THEMES);
  const count = randomInt(3, 6);

  const buildings = Array.from({ length: count }, (_, idx) => {
    const floors = theme === "небоскребы" ? randomInt(5, 8) : randomInt(2, 5);
    const width = randomInt(56, theme === "замки" ? 96 : 78);
    const wallColor = randomItem(WALL_COLORS);

    return {
      id: `${theme}-${idx}-${Date.now()}`,
      label: `${theme.slice(0, 1).toUpperCase()}${theme.slice(1, 4)} ${idx + 1}`,
      width,
      floors,
      wallColor,
      base: true,
      roof: true
    };
  });

  return {
    theme,
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
    demo: createRandomDemoConstruction()
  };
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

  // Бонусная автосборка блоков под демо-сценарий.
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

  return { baseCount, wallCount, roofCount };
}

export function canGoNext(state) {
  if (state.step === STEPS.IDEA) return Boolean(state.selectedIdea);
  if (state.step === STEPS.BUILD) return state.selectedBlocks.size > 0;
  if (state.step === STEPS.RESULT) return true;
  return false;
}

export function evaluateResult(state) {
  const hasKeys = KEY_BLOCKS.every((block) => state.selectedBlocks.has(block));
  state.result = hasKeys
    ? {
        title: "Прибыль",
        description: "Есть продукт, продвижение и понимание денег — у модели хорошие шансы расти.",
        ok: true
      }
    : {
        title: "Есть проблемы",
        description: "Не хватает ключевых блоков. На занятии ребёнок увидит, как усилить модель.",
        ok: false
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
}
