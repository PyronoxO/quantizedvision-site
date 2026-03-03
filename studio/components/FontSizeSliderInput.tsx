import { Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { PatchEvent, set, unset, type StringInputProps } from "sanity";

type RangeConfig = {
  min: number;
  max: number;
  step: number;
  label: string;
};

const FIELD_RANGES: Record<string, RangeConfig> = {
  h1Size: { min: 2.5, max: 10, step: 0.1, label: "H1 Size" },
  h2Size: { min: 1.4, max: 5, step: 0.1, label: "H2 Size" },
  h3Size: { min: 1.1, max: 3.2, step: 0.05, label: "H3 Size" },
  h4Size: { min: 0.95, max: 2.4, step: 0.05, label: "H4 Size" },
  h5Size: { min: 0.85, max: 2, step: 0.05, label: "H5 Size" },
  h6Size: { min: 0.75, max: 1.6, step: 0.05, label: "H6 Size" },
  bodySize: { min: 0.8, max: 1.6, step: 0.02, label: "Body Size" },
};

const defaultRange: RangeConfig = { min: 0.8, max: 2.5, step: 0.05, label: "Font Size" };

function getRange(fieldName: string | undefined): RangeConfig {
  if (!fieldName) return defaultRange;
  return FIELD_RANGES[fieldName] || defaultRange;
}

function getFieldNameFromPath(path: unknown): string | undefined {
  if (!Array.isArray(path) || path.length === 0) return undefined;
  const last = path[path.length - 1] as any;
  if (typeof last === "string") return last;
  if (last && typeof last === "object" && typeof last._key === "string") return last._key;
  return undefined;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseValue(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    const direct = Number(trimmed);
    if (Number.isFinite(direct)) return direct;
    const match = trimmed.match(/-?\d+(\.\d+)?/);
    if (match) {
      const parsed = Number(match[0]);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return fallback;
}

function toStoredString(value: number): string {
  return value.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

export function FontSizeSliderInput(props: StringInputProps) {
  const fieldName = getFieldNameFromPath(props.path);
  const range = getRange(fieldName);
  const value = parseValue(props.value, range.min);
  const display = Number.isFinite(value) ? value.toFixed(2).replace(/\.00$/, "") : "";

  const commit = (next: number | null) => {
    if (next === null || Number.isNaN(next)) {
      props.onChange(PatchEvent.from(unset()));
      return;
    }
    props.onChange(PatchEvent.from(set(toStoredString(clamp(next, range.min, range.max)))));
  };

  return (
    <Stack space={3}>
      <Flex align="center" justify="space-between">
        <Text size={1} muted>
          {range.label}
        </Text>
        <Text size={1}>{display}rem</Text>
      </Flex>
      <Card padding={2} radius={2} style={{ border: "1px solid var(--card-border-color)" }}>
        <input
          type="range"
          min={range.min}
          max={range.max}
          step={range.step}
          value={value}
          onChange={(event) => commit(Number(event.currentTarget.value))}
          disabled={props.readOnly}
          style={{ width: "100%" }}
        />
      </Card>
      <TextInput
        value={display}
        onChange={(event) => {
          const raw = event.currentTarget.value.trim();
          if (!raw) {
            commit(null);
            return;
          }
          const numeric = Number(raw);
          if (!Number.isNaN(numeric)) commit(numeric);
        }}
        suffix="rem"
        disabled={props.readOnly}
      />
    </Stack>
  );
}
