import { MantineColor, MantineTheme } from "@mantine/core";

export function temp_delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Given a string, returns the first and last name.
 * @param name 
 * @returns 
 */
export function splitName(name: string) {
  let parts = name.split(' ');
  return {
    first: parts[0],
    last: parts[parts.length - 1],
  };
}

/**
 * Given a date, returns a string in the format YYYY-MM-DD.
 * @param date 
 * @returns 
 */
export function formatDate(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/**
 * Given a string, returns a number between 0 and range that is consistent for the same string.
 * @param str 
 * @param range 
 * @returns - Consistent number between 0 and range
 */
export function hashString(str: string, range: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % range;
  }
  return hash;
}

/**
 * Given a number between 0 and 100, returns a color between red and green.
 * @param input 
 * @returns - Color between red and green
 */
export function percentageToColor(input: number): string {
  if (input < 0 || input > 100) {
    throw new Error("Input must be between 0 and 100");
  }

  const startColor = { r: 224, g: 49, b: 49 };
  const midColor = { r: 255, g: 212, b: 59 };
  const endColor = { r: 9, g: 146, b: 104 };

  let r, g, b;
  if (input <= 50) {
    r = startColor.r + ((midColor.r - startColor.r) * input) / 50;
    g = startColor.g + ((midColor.g - startColor.g) * input) / 50;
    b = startColor.b + ((midColor.b - startColor.b) * input) / 50;
  } else {
    r = midColor.r + ((endColor.r - midColor.r) * (input - 50)) / 50;
    g = midColor.g + ((endColor.g - midColor.g) * (input - 50)) / 50;
    b = midColor.b + ((endColor.b - midColor.b) * (input - 50)) / 50;
  }

  return "#" + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
}

/**
 * Returns a fitting color for a given value.
 * @param theme 
 * @param value 
 * @returns - color name in mantine theme colors
 */
const PRESET_COLOR_MAPS: Record<string, MantineColor> = {
  'complete': 'blue',
  'cancelled': 'red',
  'linkedin': 'indigo',
  'email': 'orange',
  'accepted': 'green',
  'active_convo': 'yellow',
  'responded': 'orange',
};
export function valueToColor(theme: MantineTheme, value: string): MantineColor {
  value = value.toLowerCase();

  if(PRESET_COLOR_MAPS[value]) {
    return PRESET_COLOR_MAPS[value];
  }

  // Get a 'random' mantine color name
  let i = 0;
  let index = hashString(value, Object.keys(theme.colors).length);
  for (let color in theme.colors) {
    if (i === index) {
      return color satisfies MantineColor;
    }
    i++;
  }

  return "gray";
}
