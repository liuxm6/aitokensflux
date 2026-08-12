export function isValidEmail(value: string) {
  const email = value.trim();
  return (
    email.length > 0 &&
    email.length <= 50 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

export function generateUsernameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "";
  const stem = localPart
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}_-]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 13);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${stem || "user"}-${suffix}`.slice(0, 20);
}
