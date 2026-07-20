import { afterEach } from "bun:test";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
  document.title = "AI Tokens Flux";
});
