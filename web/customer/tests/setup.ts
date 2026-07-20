import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach } from "bun:test";
import { cleanup } from "@testing-library/react";

GlobalRegistrator.register({ url: "http://localhost/" });
document.open();
document.write("<!doctype html><html><head></head><body></body></html>");
document.close();
Object.defineProperty(document, "compatMode", {
  configurable: true,
  value: "CSS1Compat",
});

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
  document.title = "AI Tokens Flux";
});
