const STORAGE_KEY = 'sharkord.chromeColor';
const CSS_VAR = '--sharkord-chrome-color';

const applyStoredChromeColor = () => {
  const value = localStorage.getItem(STORAGE_KEY);

  if (value) {
    document.documentElement.style.setProperty(CSS_VAR, value);
  } else {
    document.documentElement.style.removeProperty(CSS_VAR);
  }
};

const setSharkordChromeColor = (color?: string | null) => {
  const value = String(color || '').trim();

  if (!value) {
    localStorage.removeItem(STORAGE_KEY);
    document.documentElement.style.removeProperty(CSS_VAR);
    return;
  }

  localStorage.setItem(STORAGE_KEY, value);
  document.documentElement.style.setProperty(CSS_VAR, value);
};

applyStoredChromeColor();

(
  window as Window & {
    setSharkordChromeColor?: (color?: string | null) => void;
  }
).setSharkordChromeColor = setSharkordChromeColor;

export { setSharkordChromeColor };