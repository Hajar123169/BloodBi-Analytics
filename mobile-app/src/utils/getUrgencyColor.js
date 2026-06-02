export function getUrgencyColor(level) {
  switch (level) {
    case "CRITICAL":
      return "#D62828";

    case "HIGH":
      return "#F77F00";

    case "MEDIUM":
      return "#F4A261";

    default:
      return "#2A9D8F";
  }
}