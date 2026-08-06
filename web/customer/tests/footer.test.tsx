import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Footer } from "../src/components/layout/Footer";
import { LanguageContext } from "../src/context/Language";

test("footer exposes distinct server and model status destinations", () => {
  render(
    <LanguageContext.Provider
      value={{
        language: "en",
        setLanguage: () => undefined,
        translationVersion: 0,
      }}
    >
      <Footer />
    </LanguageContext.Provider>,
  );

  expect(
    screen.getByRole("link", { name: "Server status" }).getAttribute("href"),
  ).toBe("https://status.aitokensflux.com");
  expect(
    screen.getByRole("link", { name: "Model status" }).getAttribute("href"),
  ).toBe("https://check.aitokensflux.com/group/TokenFlux");
});
