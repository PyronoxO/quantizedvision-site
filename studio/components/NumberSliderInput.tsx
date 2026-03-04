import { Card, Flex, Stack, Text } from "@sanity/ui";
import { PatchEvent, set, unset, type NumberInputProps } from "sanity";

type RangeConfig = {
  min: number;
  max: number;
  step: number;
  label: string;
  suffix?: string;
};

const FIELD_RANGES: Record<string, RangeConfig> = {
  sectionDividerOpacity: { min: 0, max: 0.4, step: 0.01, label: "Divider Opacity" },
  seamLeftTintOpacity: { min: 0, max: 0.4, step: 0.01, label: "Left Tint Opacity" },
  seamRightTintOpacity: { min: 0, max: 0.4, step: 0.01, label: "Right Tint Opacity" },
  seamTopEdgeOpacity: { min: 0, max: 0.4, step: 0.01, label: "Top Edge Opacity" },
  seamBottomEdgeOpacity: { min: 0, max: 0.4, step: 0.01, label: "Bottom Edge Opacity" },
  aboutHeroGap: { min: 0, max: 8, step: 0.1, label: "About Hero Gap", suffix: "rem" },
  aboutFirstModuleHeadingSize: { min: 0.8, max: 4, step: 0.05, label: "About Heading Size", suffix: "rem" },
  aboutFirstModuleBodySize: { min: 0.7, max: 2, step: 0.02, label: "About Body Size", suffix: "rem" },
};

const defaultRange: RangeConfig = { min: 0, max: 1, step: 0.01, label: "Value" };

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

function toStoredNumber(value: number): number {
  return Number(value.toFixed(3));
}

export function NumberSliderInput(props: NumberInputProps) {
  const fieldName = getFieldNameFromPath(props.path);
  const range = (fieldName && FIELD_RANGES[fieldName]) || defaultRange;
  const value = typeof props.value === "number" && Number.isFinite(props.value) ? props.value : range.min;
  const display = Number.isFinite(value) ? value.toFixed(2).replace(/\.00$/, "") : "";

  const commit = (next: number | null) => {
    if (next === null || Number.isNaN(next)) {
      props.onChange(PatchEvent.from(unset()));
      return;
    }
    props.onChange(PatchEvent.from(set(toStoredNumber(clamp(next, range.min, range.max)))));
  };

  return (
    <Stack space={3}>
      <Flex align="center" justify="space-between">
        <Text size={1} muted>
          {range.label}
        </Text>
        <Text size={1}>
          {display}
          {range.suffix || ""}
        </Text>
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
    </Stack>
  );
}
