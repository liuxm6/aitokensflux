import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register({ url: "http://localhost/" });
Object.defineProperty(document, "compatMode", {
  configurable: true,
  value: "CSS1Compat",
});
