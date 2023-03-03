import { MantineColor, MantineTheme } from "@mantine/core";
import { startCase } from "lodash";
import { Channel } from "src/main";

export function temp_delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Given a string, returns the first and last name.
 * @param name
 * @returns
 */
export function splitName(name: string) {
  let parts = name.split(" ");
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

  return (
    "#" +
    ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b))
      .toString(16)
      .slice(1)
  );
}

/**
 * Returns a fitting color for a given value.
 * @param theme
 * @param value
 * @returns - color name in mantine theme colors
 */
const PRESET_COLOR_MAPS: Record<string, MantineColor> = {
  complete: "blue",
  cancelled: "red",
  linkedin: "indigo",
  email: "orange",
  accepted: "green",
  active_convo: "yellow",
  bumped: "orange",
  demo: "blue",
};
export function valueToColor(theme: MantineTheme, value: string): MantineColor {
  value = value?.toLowerCase().trim().replace(" ", "_");

  if (PRESET_COLOR_MAPS[value]) {
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

export function formatToLabel(value: string) {
  if(!value) { return ''; }
  value = value.toLowerCase().replaceAll(" ", "_");
  if (value === "responded") {
    return "Bumped";
  }
  if (value === "demo_set") {
    return "Demo Scheduled";
  }
  if (value === "demo_won") {
    return "Demo Complete";
  }
  if (value === "demo_loss" || value === "demo_lost") {
    return "Demo Missed";
  }
  if (value === "linkedin") {
    return "LinkedIn";
  }
  return startCase(value.replaceAll("_", " "));
}

/* NOT USED:
export function convertStatus(status: string, toChannel: Channel): string[] {
  if(toChannel === 'LINKEDIN'){
    if(status === 'ACCEPTED') return [status];
    if(status === 'ACTIVE_CONVO') return [status];
    if(status === 'BUMPED') return ['RESPONDED'];
    if(status === 'DEMO') return ['DEMO_SET', 'DEMO_WON', 'DEMO_LOSS'];
    if(status === 'PROSPECTED') return [status];
    if(status === 'REMOVED') return ['NOT_QUALIFIED'];
    if(status === 'SENT_OUTREACH') return [status];
    if(status === 'DEMO_LOSS') return [status];
    if(status === 'DEMO_SET') return [status];
    if(status === 'DEMO_WON') return [status];
    if(status === 'NOT_QUALIFIED') return [status];
    if(status === 'RESPONDED') return [status];
    if(status === 'DEMO_LOST') return ['DEMO_LOSS'];
    if(status === 'EMAIL_OPENED') return ['ACCEPTED'];
    if(status === 'NOT_INTERESTED') return [status];
    if(status === 'NOT_SENT') return ['NOT_QUALIFIED'];
    if(status === 'SCHEDULING') return [status];
    if(status === 'UNKNOWN') return ['NOT_QUALIFIED'];
  }
  if(toChannel === 'EMAIL'){
    if(status === 'ACCEPTED') return [status];
    if(status === 'ACTIVE_CONVO') return [status];
    if(status === 'BUMPED') return ['EMAIL_OPENED'];
    if(status === 'DEMO') return ['DEMO_SET', 'DEMO_WON', 'DEMO_LOST'];
    if(status === 'PROSPECTED') return ['SENT_OUTREACH'];
    if(status === 'REMOVED') return ['UNKNOWN'];
    if(status === 'SENT_OUTREACH') return [status];
    if(status === 'DEMO_LOSS') return ['DEMO_LOST'];
    if(status === 'DEMO_SET') return [status];
    if(status === 'DEMO_WON') return [status];
    if(status === 'NOT_QUALIFIED') return ['UNKNOWN'];
    if(status === 'RESPONDED') return ['ACTIVE_CONVO'];
    if(status === 'DEMO_LOST') return [status];
    if(status === 'EMAIL_OPENED') return [status];
    if(status === 'NOT_INTERESTED') return [status];
    if(status === 'NOT_SENT') return [status];
    if(status === 'SCHEDULING') return [status];
    if(status === 'UNKNOWN') return [status];
  }
  if(toChannel === 'SELLSCALE'){
    if(status === 'ACCEPTED') return [status];
    if(status === 'ACTIVE_CONVO') return [status];
    if(status === 'BUMPED') return [status];
    if(status === 'DEMO') return [status];
    if(status === 'PROSPECTED') return [status];
    if(status === 'REMOVED') return [status];
    if(status === 'SENT_OUTREACH') return [status];
    if(status === 'DEMO_LOSS') return ['DEMO'];
    if(status === 'DEMO_SET') return ['DEMO'];
    if(status === 'DEMO_WON') return ['DEMO'];
    if(status === 'NOT_QUALIFIED') return ['REMOVED'];
    if(status === 'RESPONDED') return ['BUMPED'];
    if(status === 'DEMO_LOST') return ['DEMO'];
    if(status === 'EMAIL_OPENED') return ['ACCEPTED'];
    if(status === 'NOT_INTERESTED') return ['REMOVED'];
    if(status === 'NOT_SENT') return ['REMOVED'];
    if(status === 'SCHEDULING') return ['ACTIVE_CONVO'];
    if(status === 'UNKNOWN') return ['REMOVED'];
  }
  return [];
}
*/