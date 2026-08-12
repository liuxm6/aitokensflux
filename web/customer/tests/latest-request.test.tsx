import { expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { useLatestRequest } from "../src/hooks/useLatestRequest";

type Deferred = { promise: Promise<string>; resolve: (value: string) => void };

function defer(): Deferred {
  let resolve = (_value: string) => undefined as void;
  const promise = new Promise<string>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

function LoaderHarness({
  pages,
  onApplied = () => undefined,
}: {
  pages: Deferred[];
  onApplied?: (value: string) => void;
}) {
  const [result, setResult] = useState("idle");
  const [nextPage, setNextPage] = useState(0);
  const beginRequest = useLatestRequest();

  const load = async (page: number) => {
    const isCurrent = beginRequest();
    const value = await pages[page].promise;
    if (!isCurrent()) return;
    onApplied(value);
    setResult(value);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          const page = nextPage;
          setNextPage(page + 1);
          void load(page);
        }}
      >
        Load
      </button>
      <p>{result}</p>
    </>
  );
}

test("a stale response loses to the request that replaced it", async () => {
  const pages = [defer(), defer()];
  const user = userEvent.setup({ document });

  render(<LoaderHarness pages={pages} />);
  const load = screen.getByRole("button", { name: "Load" });

  await user.click(load);
  await user.click(load);

  pages[1].resolve("second");
  await waitFor(() => expect(screen.getByText("second")).toBeTruthy());

  pages[0].resolve("first");
  await pages[0].promise;
  expect(screen.getByText("second")).toBeTruthy();
  expect(screen.queryByText("first")).toBeNull();
});

test("a response that lands after unmount is dropped instead of updating state", async () => {
  const pages = [defer()];
  const onApplied = mock((_value: string) => undefined);
  const user = userEvent.setup({ document });

  const view = render(<LoaderHarness pages={pages} onApplied={onApplied} />);
  await user.click(screen.getByRole("button", { name: "Load" }));

  view.unmount();
  pages[0].resolve("late");
  await pages[0].promise;

  expect(onApplied).toHaveBeenCalledTimes(0);
});
