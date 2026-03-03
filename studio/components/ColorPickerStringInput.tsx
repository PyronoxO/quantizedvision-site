import { Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { set, unset, type StringInputProps } from "sanity";

const HEX_COLOR_REGEX = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i;

function normalizeHex(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  const withHash = raw.startsWith("#") ? raw : `#${raw}`;
  return HEX_COLOR_REGEX.test(withHash) ? withHash.toLowerCase() : "";
}

export function ColorPickerStringInput(props: StringInputProps) {
  const value = typeof props.value === "string" ? props.value : "";
  const normalized = normalizeHex(value);
  const fallback = "#ecf2ff";

  const commitText = (nextValue: string) => {
    const trimmed = nextValue.trim();
    props.onChange(trimmed ? set(trimmed) : unset());
  };

  const commitPicker = (hexValue: string) => {
    props.onChange(set(hexValue));
  };

  return (
    <Stack space={3}>
      <Flex gap={3} align="center">
        <Card
          radius={2}
          shadow={1}
          style={{
            width: 44,
            height: 44,
            backgroundColor: normalized || fallback,
            border: "1px solid var(--card-border-color)",
          }}
        />
        <Card
          radius={2}
          padding={2}
          style={{
            width: 52,
            height: 44,
            border: "1px solid var(--card-border-color)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <input
            type="color"
            value={normalized || fallback}
            onChange={(event) => commitPicker(event.currentTarget.value)}
            disabled={props.readOnly}
            style={{ width: 32, height: 32, border: 0, background: "transparent", padding: 0 }}
          />
        </Card>
        <div style={{ flex: 1 }}>
          <TextInput
            value={value}
            onChange={(event) => commitText(event.currentTarget.value)}
            placeholder="#ecf2ff"
            disabled={props.readOnly}
          />
        </div>
      </Flex>
      <Text size={1} muted>
        Use the picker or type a HEX color. Example: #e11d48
      </Text>
    </Stack>
  );
}
