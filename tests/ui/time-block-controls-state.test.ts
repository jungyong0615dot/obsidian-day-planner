import { describe, expect, test } from "vitest";

import { shouldShowTimeBlockControls } from "../../src/ui/components/time-block-controls-state";

describe("shouldShowTimeBlockControls", () => {
  test("does not activate controls for an unselected all-day block", () => {
    expect(shouldShowTimeBlockControls("none")).toBe(false);
    expect(shouldShowTimeBlockControls("secondary")).toBe(false);
  });

  test("activates controls only for the primary selection", () => {
    expect(shouldShowTimeBlockControls("primary")).toBe(true);
  });
});
