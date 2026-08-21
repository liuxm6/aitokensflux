import { expect, test } from "bun:test";
import { getCodeSendLabel } from "../src/helpers/auth-copy";
import { getApiKeyDisplayName } from "../src/helpers/api-keys";

test("unnamed api keys use a localized fallback", () => {
  expect(getApiKeyDisplayName({ name: "prod" }, "en")).toBe("prod");
  expect(getApiKeyDisplayName({ name: "" }, "en")).toBe("Unnamed key");
  expect(getApiKeyDisplayName({ name: "  " }, "zh")).toBe("未命名密钥");
});

test("code-send cooldown uses a localized seconds label", () => {
  expect(getCodeSendLabel("en", 0)).toBe("Get code");
  expect(getCodeSendLabel("en", 30)).toBe("30s");
  expect(getCodeSendLabel("zh", 30)).toBe("30秒");
});
