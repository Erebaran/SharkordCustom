const STORAGE_KEY = 'sharkord:chrome-color';
const SECOND_COLOR_STORAGE_KEY = 'sharkord:chrome-gradient-color-2';
const GRADIENT_ENABLED_STORAGE_KEY = 'sharkord:chrome-gradient-enabled';

const CSS_VARIABLE = '--sharkord-chrome-background';
const LEGACY_CSS_VARIABLE = '--sharkord-chrome-color';

const DEFAULT_COLOR = '#18181b';
const DEFAULT_SECOND_COLOR = '#27272a';

const isValidCssColor = (value: string) => {
  const option = new Option().style;
  option.color = '';
  option.color = value;
  return option.color !== '';
};

const getSharkordChromeColor = () =>
  localStorage.getItem(STORAGE_KEY) || DEFAULT_COLOR;

const getSharkordChromeSecondColor = () =>
  localStorage.getItem(SECOND_COLOR_STORAGE_KEY) || DEFAULT_SECOND_COLOR;

const getSharkordChromeGradientEnabled = () =>
  localStorage.getItem(GRADIENT_ENABLED_STORAGE_KEY) === 'true';

const applySharkordChromeAppearance = () => {
  const first = getSharkordChromeColor();
  const second = getSharkordChromeSecondColor();
  const gradientEnabled = getSharkordChromeGradientEnabled();

  const background = gradientEnabled
    ? `linear-gradient(135deg, ${first} 0%, ${second} 100%)`
    : first;

  // Variavel canonica: aceita cor solida ou gradiente.
  document.documentElement.style.setProperty(CSS_VARIABLE, background);

  // Compatibilidade com componentes antigos/fixos de Settings que ainda
  // usam --sharkord-chrome-color.
  document.documentElement.style.setProperty(LEGACY_CSS_VARIABLE, first);
};

const setSharkordChromeColor = (value: string) => {
  const color = String(value || '').trim();

  if (!color || !isValidCssColor(color)) {
    return false;
  }

  localStorage.setItem(STORAGE_KEY, color);
  applySharkordChromeAppearance();
  return true;
};

const setSharkordChromeSecondColor = (value: string) => {
  const color = String(value || '').trim();

  if (!color || !isValidCssColor(color)) {
    return false;
  }

  localStorage.setItem(SECOND_COLOR_STORAGE_KEY, color);
  applySharkordChromeAppearance();
  return true;
};

const setSharkordChromeGradientEnabled = (enabled: boolean) => {
  localStorage.setItem(GRADIENT_ENABLED_STORAGE_KEY, String(enabled));
  applySharkordChromeAppearance();
};

const resetSharkordChromeColor = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SECOND_COLOR_STORAGE_KEY);
  localStorage.removeItem(GRADIENT_ENABLED_STORAGE_KEY);
  applySharkordChromeAppearance();
};

applySharkordChromeAppearance();

export {
  DEFAULT_COLOR,
  DEFAULT_SECOND_COLOR,
  getSharkordChromeColor,
  getSharkordChromeGradientEnabled,
  getSharkordChromeSecondColor,
  resetSharkordChromeColor,
  setSharkordChromeColor,
  setSharkordChromeGradientEnabled,
  setSharkordChromeSecondColor
};