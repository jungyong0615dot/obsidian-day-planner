<script lang="ts">
  import { File } from "lucide-svelte";

  import { getObsidianContext } from "../../context/obsidian-context";
  import { isLocal, type Task } from "../../task-types";

  const { task }: { task: Task } = $props();
  const { workspaceFacade } = getObsidianContext();

  const location = $derived(isLocal(task) ? task.location : undefined);
  const sourcePath = $derived(location?.path);
  const sourceLabel = $derived(
    sourcePath?.replace(/\.md$/, "").split("/").pop() ?? "",
  );

  function markRenderedMarkdownHost(el: HTMLElement) {
    const host = el.closest(".rendered-markdown");

    host?.classList.add("has-source-badge");

    return {
      destroy() {
        host?.classList.remove("has-source-badge");
      },
    };
  }

  async function revealSource(event: PointerEvent) {
    event.stopPropagation();

    if (!location) {
      return;
    }

    await workspaceFacade.revealLineInFile(
      location.path,
      location.position.start.line,
    );
  }
</script>

{#if sourcePath}
  <button
    class="source-badge"
    aria-label={`Reveal source file ${sourcePath}`}
    onpointerdown={(event) => event.stopPropagation()}
    onpointerup={revealSource}
    title={sourcePath}
    use:markRenderedMarkdownHost
  >
    <File class="planner-source-badge-icon" />
    <span class="source-badge-label">{sourceLabel}</span>
  </button>
{/if}

<style>
  .source-badge {
    cursor: pointer;

    position: absolute;
    z-index: 1;
    top: var(--size-2-1);
    right: var(--size-4-1);

    overflow: hidden;
    display: inline-flex;
    gap: var(--size-2-1);
    align-items: center;

    max-width: min(45%, 10rem);
    height: calc(var(--font-ui-smaller) + var(--size-4-1));
    padding: 0 var(--size-2-2);

    font-family: inherit;
    font-size: var(--font-ui-smaller);
    line-height: 1;
    color: var(--text-muted);

    opacity: 0.9;
    background-color: var(--background-primary);
    border: var(--border-base);
    border-radius: var(--radius-s);
    box-shadow: var(--shadow-stationary);
  }

  .source-badge:hover {
    color: var(--text-normal);
    opacity: 1;
    border-color: var(--color-accent);
  }

  :global(.planner-source-badge-icon) {
    flex: 0 0 auto;
    width: var(--icon-xs);
    height: var(--icon-xs);
  }

  .source-badge-label {
    overflow: hidden;
    min-width: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global(.rendered-markdown.has-source-badge .first-line-wrapper) {
    box-sizing: border-box;
    padding-right: min(45%, 10.5rem);
  }
</style>
