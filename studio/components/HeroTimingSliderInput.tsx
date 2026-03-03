import { Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { PatchEvent, set, unset, type NumberInputProps } from "sanity";

type RangeConfig = {
  min: number;
  max: number;
  step: number;
  label: string;
};

const FIELD_RANGES: Record<string, RangeConfig> = {
  autoplayMs: { min: 1200, max: 15000, step: 100, label: "Autoplay Interval" },
  transitionMs: { min: 150, max: 3000, step: 50, label: "Transition Duration" },
};

const defaultRange: RangeConfig = { min: 100, max: 10000, step: 100, label: "Timing" };

function getFieldNameFromPath(path: unknown): string | undefined {
  if (!Array.isArray(path) || path.length === 0) return undefined;
  const last = path[path.length - 1] as any;
  if (typeof last === "string") return last;
  if (last && typeof last === "object" && typeof last._key === "string") return last._key;
  return undefined;
}

function getRange(fieldName: string | undefined): RangeConfig {
  if (!fieldName) return defaultRange;
  return FIELD_RANGES[fieldName] || defaultRange;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseValue(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function HeroTimingSliderInput(props: NumberInputProps) {
  const fieldName = getFieldNameFromPath(props.path);
  const range = getRange(fieldName);
  const value = parseValue(props.value, range.min);

  const commit = (next: number | null) => {
    if (next === null || Number.isNaN(next)) {
      props.onChange(PatchEvent.from(unset()));
      return;
    }
    props.onChange(PatchEvent.from(set(Math.round(clamp(next, range.min, range.max)))));
  };

  return (
    <Stack space={3}>
      <Flex align="center" justify="space-between">
        <Text size={1} muted>
          {range.label}
        </Text>
        <Text size={1}>{Math.round(value)}ms</Text>
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
        value={String(Math.round(value))}
        onChange={(event) => {
          const raw = event.currentTarget.value.trim();
          if (!raw) {
            commit(null);
            return;
          }
          const numeric = Number(raw);
          if (!Number.isNaN(numeric)) commit(numeric);
        }}
        suffix="ms"
        disabled={props.readOnly}
      />
    </Stack>
  );
}
