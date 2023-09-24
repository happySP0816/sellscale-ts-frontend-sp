const getStatusBadgeColor = (value: string) => {
  const COLORS: { [key: string]: string } = {
    replied: "blue",
    outreached: "green",
    prospected: "yellow",
  };

  return COLORS[value?.toLowerCase()] || "blue";
};

const getICPScoreBadgeColor = (value: string) => {
  // Very High, High, Medium, Low, Very Low, Unscored
  const COLORS: { [key: string]: string } = {
    all: "black",
    "very high": "blue",
    high: "green",
    medium: "yellow",
    low: "red",
    "very low": "red",
    unscored: "gray",
  };

  return COLORS[value?.toLowerCase()] || "blue";
};

const getICPScoreColor = (value: string) => {
  // Very High, High, Medium, Low, Very Low, Unscored
  const COLORS: { [key: string]: string } = {
    all: "black",
    "very high": "#3B85EF",
    high: "#009512",
    medium: "#EFBA50",
    low: "#EB8231",
    "very low": "#E5564E",
    unscored: "#84818A",
  };

  return COLORS[value?.toLowerCase()] || "blue";
};

const getChannelType = (value: string) => {
  const TYPES: { [key: string]: string } = {
    linkedin: "LinkedIn",
    email: "Email",
  };

  return TYPES[value?.toLowerCase()] || "LinkedIn";
};
const getStatusMessageBadgeColor = (value: string) => {
  const COLORS: { [key: string]: { filled: string; light: string } } = {
    "very high": { filled: "#3B85EF", light: "#e7f5ff" },
    high: { filled: "#009512", light: "#ebfbee" },
    medium: { filled: "#EFBA50", light: "#fff3bf" },
    low: { filled: "#EB8231", light: "#ffe8cc" },
    "very low": { filled: "#E5564E", light: "#ffe3e3" },
    unscored: { filled: "#84818A", light: "#f1f3f5" },
  };

  return COLORS[value?.toLowerCase()] || "blue";
};

export {
  getStatusBadgeColor,
  getICPScoreBadgeColor,
  getICPScoreColor,
  getChannelType,
  getStatusMessageBadgeColor,
};
