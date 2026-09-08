import xss from "xss";

export function sanitize(input) {
  if (typeof input === "string") {
    return xss(input);
  }

  if (Array.isArray(input)) {
    return input.map(sanitize);
  }

  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, sanitize(value)])
    );
  }

  return input;
}