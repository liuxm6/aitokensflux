import { createContext } from "react";
import type { ConfirmActionConfig } from "../../types";

export const ConfirmActionContext = createContext<{
  requestConfirm: (config: ConfirmActionConfig) => void;
}>({
  requestConfirm: () => undefined,
});
