import { useEffect } from "react";

const ALLOWED_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isFormElement(el: EventTarget | null): boolean {
  return el instanceof Element && (ALLOWED_TAGS.has(el.tagName) || (el as HTMLElement).isContentEditable);
}

export function useNoCopy() {
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      if (!isFormElement(e.target)) e.preventDefault();
    };

    const onCopyCut = (e: ClipboardEvent) => {
      if (!isFormElement(e.target)) e.preventDefault();
    };

    const onDragStart = (e: DragEvent) => {
      if (!isFormElement(e.target)) e.preventDefault();
    };

    const onSelectStart = (e: Event) => {
      if (!isFormElement(e.target)) e.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isFormElement(e.target)) return;
      const key = e.key.toLowerCase();
      if (e.ctrlKey || e.metaKey) {
        if (["u", "s", "p", "a", "c", "x"].includes(key)) {
          e.preventDefault();
        }
      }
      if (key === "f12") e.preventDefault();
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("copy",        onCopyCut as EventListener);
    document.addEventListener("cut",         onCopyCut as EventListener);
    document.addEventListener("dragstart",   onDragStart as EventListener);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("keydown",     onKeyDown);
    document.body.classList.add("no-copy");

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("copy",        onCopyCut as EventListener);
      document.removeEventListener("cut",         onCopyCut as EventListener);
      document.removeEventListener("dragstart",   onDragStart as EventListener);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("keydown",     onKeyDown);
      document.body.classList.remove("no-copy");
    };
  }, []);
}
