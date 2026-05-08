import { describe, expect, test, vi } from "vitest";

import { dataviewChange } from "../../src/redux/dataview/dataview-slice";
import { editCanceled } from "../../src/redux/global-slice";
import { createReactor } from "../../src/redux/store";
import { defaultSettingsForTests } from "../../src/settings";

describe("task refresh signals", () => {
  test("dataview changes trigger a task refresh signal immediately", async () => {
    const reactor = createReactor({
      listPropsParser: {} as never,
      vault: {} as never,
      metadataCache: {} as never,
      preloadedState: {
        obsidian: {
          visibleDays: [],
        },
        settings: {
          settings: defaultSettingsForTests,
        },
      },
    });

    const values: object[] = [];
    const unsubscribe = reactor.taskUpdateTrigger.subscribe((value) => {
      values.push(value as object);
    });

    reactor.dispatch(editCanceled());

    await vi.waitUntil(() => values.length > 0);
    const initialValue = values.at(-1);

    reactor.dispatch(dataviewChange("notes/day.md"));

    await vi.waitUntil(() => values.length > 1);

    expect(values.at(-1)).not.toBe(initialValue);

    unsubscribe();
  });
});
