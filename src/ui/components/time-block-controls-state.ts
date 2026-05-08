export type TimeBlockSelectionState = "primary" | "secondary" | "none";

export function shouldShowTimeBlockControls(
  selectionState: TimeBlockSelectionState,
) {
  return selectionState === "primary";
}
