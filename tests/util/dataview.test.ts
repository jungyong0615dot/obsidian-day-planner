import { describe, expect, test } from "vitest";

import { hasDataviewPlugin } from "../../src/util/dataview";

describe("hasDataviewPlugin", () => {
  test("returns false when Dataview is not registered", () => {
    expect(
      hasDataviewPlugin({
        plugins: {
          plugins: {},
        },
      } as never),
    ).toBe(false);
  });

  test("returns true when Dataview is registered", () => {
    expect(
      hasDataviewPlugin({
        plugins: {
          plugins: {
            "obsidian-dataview": {},
          },
        },
      } as never),
    ).toBe(true);
  });
});
