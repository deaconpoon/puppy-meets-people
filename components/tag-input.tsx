"use client";

// SLICE A (US-1) — Tag input for interests (coral) / temperament (honey).
// Type + Enter/comma/Add to add; click a chip to remove; one-tap suggestions.
// An uncommitted draft is committed when focus leaves the widget, so typed
// text isn't silently lost when the user goes straight to the form's submit.

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { TraitChip } from "@/components/patterns/trait-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TagInputProps = {
  id: string;
  /** Controlled tag list. Kept duplicate-free by add(). */
  value: string[];
  onChange: (tags: string[]) => void;
  /** coral = human traits, honey = dog traits (docs/DESIGN.md). */
  tone: "coral" | "honey";
  placeholder?: string;
  suggestions?: string[];
};

export function TagInput({
  id,
  value,
  onChange,
  tone,
  placeholder,
  suggestions = [],
  ref,
}: TagInputProps & { ref?: React.Ref<HTMLInputElement> }) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Add one or more comma-separated tags (handles pasted "a, b, c").
   * Case-insensitive dedupe. If everything was a duplicate, the draft is
   * kept visible so the rejection isn't silent.
   */
  function add(raw: string) {
    const parts = raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const next = [...value];
    for (const part of parts) {
      if (!next.some((v) => v.toLowerCase() === part.toLowerCase())) {
        next.push(part);
      }
    }
    if (next.length > value.length) {
      onChange(next);
      setDraft("");
    } else if (parts.length === 0) {
      setDraft("");
    }
  }

  function remove(tag: string) {
    onChange(value.filter((v) => v !== tag));
    inputRef.current?.focus();
  }

  const remainingSuggestions = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div
      className="space-y-2"
      onBlur={(e) => {
        // Commit the draft only when focus leaves the whole widget — not when
        // it moves to the Add button, a chip, or a suggestion inside it.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          add(draft);
        }
      }}
    >
      <div className="flex gap-2">
        <Input
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) {
              (ref as React.MutableRefObject<HTMLInputElement | null>).current =
                node;
            }
          }}
          id={id}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            }
          }}
        />
        <Button type="button" variant="outline" onClick={() => add(draft)}>
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <ul className="flex list-none flex-wrap gap-2 p-0">
          {value.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                className="cursor-pointer"
                aria-label={`Remove ${tag}`}
                onClick={() => remove(tag)}
              >
                <TraitChip tone={tone}>
                  {tag}
                  <X aria-hidden className="size-3.5" />
                </TraitChip>
              </button>
            </li>
          ))}
        </ul>
      )}
      {remainingSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {remainingSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`Add ${s}`}
              className="cursor-pointer rounded-full border border-dashed border-muted-foreground/40 px-3 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
              onClick={() => {
                add(s);
                inputRef.current?.focus();
              }}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
