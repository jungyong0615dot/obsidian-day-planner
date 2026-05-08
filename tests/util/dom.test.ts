import { afterEach, describe, expect, test, vi } from "vitest";

import { createAutoScroll, getScrollZones } from "../../src/util/dom";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getScrollZones", () => {
  test("uses touch client coordinates for scroll zone checks", () => {
    const el = document.createElement("div");

    Object.defineProperty(el, "clientHeight", {
      value: 200,
      configurable: true,
    });
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      top: 100,
    } as DOMRect);

    const topZones = getScrollZones(
      {
        touches: [{ clientY: 110 }],
      } as unknown as TouchEvent,
      el,
    );
    const bottomZones = getScrollZones(
      {
        touches: [{ clientY: 290 }],
      } as unknown as TouchEvent,
      el,
    );

    expect(topZones.isInTopScrollZone).toBe(true);
    expect(topZones.isInBottomScrollZone).toBe(false);
    expect(bottomZones.isInTopScrollZone).toBe(false);
    expect(bottomZones.isInBottomScrollZone).toBe(true);
  });
});

describe("createAutoScroll", () => {
  test("restarts when the direction changes", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });

    const el = document.createElement("div");
    Object.defineProperty(el, "scrollTop", {
      value: 0,
      writable: true,
      configurable: true,
    });
    const { startScroll, stopScroll } = createAutoScroll();

    startScroll({ el, direction: "up" });
    expect(frames).toHaveLength(1);

    frames.shift()?.(0);
    expect(el.scrollTop).toBe(-8);
    expect(frames).toHaveLength(1);

    startScroll({ el, direction: "down" });
    expect(frames).toHaveLength(2);

    frames.shift()?.(0);
    expect(el.scrollTop).toBe(-8);

    frames.shift()?.(0);
    expect(el.scrollTop).toBe(0);

    stopScroll();
  });
});
