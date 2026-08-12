import { afterEach, beforeEach, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeBlock } from "../src/components/common/CodeBlock";
import { LanguageContext } from "../src/context/Language";

const COPY_REVERT_DELAY = 1200;
const originalClipboard = navigator.clipboard;
const originalSetTimeout = window.setTimeout;
const originalClearTimeout = window.clearTimeout;
let revertTimers: number[] = [];

beforeEach(() => {
  revertTimers = [];
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: async () => {} },
  });
  window.setTimeout = ((handler: TimerHandler, delay?: number) => {
    const id = originalSetTimeout(handler, delay) as unknown as number;
    if (delay === COPY_REVERT_DELAY) revertTimers.push(id);
    return id;
  }) as typeof window.setTimeout;
  window.clearTimeout = ((id?: number) => {
    revertTimers = revertTimers.filter((pending) => pending !== id);
    originalClearTimeout(id);
  }) as typeof window.clearTimeout;
});

afterEach(() => {
  window.setTimeout = originalSetTimeout;
  window.clearTimeout = originalClearTimeout;
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: originalClipboard,
  });
});

test("copy confirmation cancels its revert timer when the view unmounts", async () => {
  const user = userEvent.setup();
  const view = render(
    <LanguageContext.Provider
      value={{
        language: "en",
        setLanguage: () => undefined,
        translationVersion: 0,
      }}
    >
      <CodeBlock value="sk-example" />
    </LanguageContext.Provider>,
  );

  await user.click(screen.getByRole("button", { name: "Copy" }));
  expect(revertTimers).toHaveLength(1);

  view.unmount();
  expect(revertTimers).toHaveLength(0);
});
