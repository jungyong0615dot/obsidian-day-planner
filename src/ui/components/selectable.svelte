<script lang="ts">
  import { type Snippet } from "svelte";

  import {
    MouseButton,
    touchLongPressTimeMillis,
    touchPressThresholdPixels,
    vibrationDurationMillis,
  } from "../../constants";
  import { isTouchEvent } from "../../util/dom";
  import { pointerUpOutside } from "../actions/pointer-up-outside";
  import type { HTMLActionArray } from "../actions/use-actions";

  import { type SelectionState } from "./selectable-state";

  interface ChildrenProps {
    use: HTMLActionArray;
    state: SelectionState;
    onpointerup: (event: PointerEvent) => void;
  }

  interface Props {
    children: Snippet<[ChildrenProps]>;
    selectionBlocked?: boolean;
    onSecondarySelect?: (event: MouseEvent | PointerEvent | TouchEvent) => void;
  }

  const {
    children,
    onSecondarySelect,
    selectionBlocked = false,
  }: Props = $props();

  let selectionState = $state<SelectionState>("none");
  let touchPointerId = $state<number | undefined>();
  let touchStartX = $state(0);
  let touchStartY = $state(0);
  let touchMovedPastThreshold = $state(false);
  let longPressTriggered = $state(false);
  let longPressTimer: ReturnType<typeof setTimeout> | undefined;

  function setSelection(newState: SelectionState) {
    if (newState !== "none") {
      if (selectionBlocked) {
        return;
      }

      navigator.vibrate?.(vibrationDurationMillis);
    }

    selectionState = newState;
  }

  function clear() {
    setSelection("none");
  }

  function clearLongPressTimer() {
    if (!longPressTimer) {
      return;
    }

    clearTimeout(longPressTimer);
    longPressTimer = undefined;
  }

  function clearTrackedTouch() {
    clearLongPressTimer();
    touchPointerId = undefined;
    touchMovedPastThreshold = false;
    longPressTriggered = false;
  }

  function setPrimary() {
    if (selectionState === "primary") {
      setSelection("none");

      return;
    }

    setSelection("primary");
  }

  function setSecondary(event: PointerEvent | MouseEvent | TouchEvent) {
    if (selectionState === "secondary") {
      setSelection("none");

      return;
    }

    setSelection("secondary");
    onSecondarySelect?.(event);
  }

  function exceedsTouchPressThreshold(event: PointerEvent) {
    return (
      Math.abs(event.clientX - touchStartX) > touchPressThresholdPixels ||
      Math.abs(event.clientY - touchStartY) > touchPressThresholdPixels
    );
  }

  function touchSelection(el: HTMLElement) {
    function handlePointerDown(event: PointerEvent) {
      if (!isTouchEvent(event)) {
        return;
      }

      clearTrackedTouch();
      touchPointerId = event.pointerId;
      touchStartX = event.clientX;
      touchStartY = event.clientY;
      longPressTimer = setTimeout(() => {
        longPressTriggered = true;
        setSecondary(event);
      }, touchLongPressTimeMillis);
    }

    function handlePointerMove(event: PointerEvent) {
      if (touchPointerId !== event.pointerId || touchMovedPastThreshold) {
        return;
      }

      if (!exceedsTouchPressThreshold(event)) {
        return;
      }

      touchMovedPastThreshold = true;
      clearLongPressTimer();
    }

    function handlePointerUp(event: PointerEvent) {
      if (touchPointerId !== event.pointerId) {
        return;
      }

      const shouldPromoteToPrimary =
        !longPressTriggered && !touchMovedPastThreshold;

      clearTrackedTouch();

      if (shouldPromoteToPrimary) {
        setPrimary();
      }
    }

    function handlePointerCancel(event: PointerEvent) {
      if (touchPointerId !== event.pointerId) {
        return;
      }

      clearTrackedTouch();
    }

    el.addEventListener("pointerdown", handlePointerDown);
    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerup", handlePointerUp);
    el.addEventListener("pointercancel", handlePointerCancel);

    return {
      destroy() {
        clearTrackedTouch();
        el.removeEventListener("pointerdown", handlePointerDown);
        el.removeEventListener("pointermove", handlePointerMove);
        el.removeEventListener("pointerup", handlePointerUp);
        el.removeEventListener("pointercancel", handlePointerCancel);
      },
    };
  }

  const use = [touchSelection, pointerUpOutside(clear)];

  function handlePointerUp(event: PointerEvent) {
    if (isTouchEvent(event)) {
      return;
    }

    if (event.button === MouseButton.LEFT) {
      setPrimary();
    } else if (event.button === MouseButton.RIGHT) {
      setSecondary(event);
    }
  }
</script>

<svelte:body
  onkeydown={(event: KeyboardEvent) => {
    if (event.key === "Escape") {
      clear();
    }
  }}
/>

{@render children({
  use,
  state: selectionState,
  onpointerup: handlePointerUp,
})}
