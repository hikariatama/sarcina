export function createCorrelationId() {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;

  return `corr-${randomPart}`;
}
