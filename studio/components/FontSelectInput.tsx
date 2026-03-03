import { useEffect } from "react";
import { Card, Select, Stack, Text } from "@sanity/ui";
import { set, type StringInputProps } from "sanity";

type FontOption = {
  value: string;
  label: string;
  sampleFamily: string;
  vibe: string;
};

const FONT_OPTIONS: FontOption[] = [
  { value: "orbitron", label: "Orbitron", sampleFamily: "'Orbitron', sans-serif", vibe: "Tech / angular display" },
  { value: "space-grotesk", label: "Space Grotesk", sampleFamily: "'Space Grotesk', sans-serif", vibe: "Modern editorial" },
  { value: "sora", label: "Sora", sampleFamily: "'Sora', sans-serif", vibe: "Premium geometric sans" },
  { value: "bebas-neue", label: "Bebas Neue", sampleFamily: "'Bebas Neue', sans-serif", vibe: "Poster / cinematic" },
  { value: "rajdhani", label: "Rajdhani", sampleFamily: "'Rajdhani', sans-serif", vibe: "Futuristic UI" },
  { value: "manrope", label: "Manrope", sampleFamily: "'Manrope', sans-serif", vibe: "Clean interface" },
];

const FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;600;700;800&family=Orbitron:wght@500;700;800&family=Rajdhani:wght@500;600;700&family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;700&display=swap";

function getOption(value: string | undefined): FontOption {
  return FONT_OPTIONS.find((option) => option.value === value) || FONT_OPTIONS[0];
}

export function FontSelectInput(props: StringInputProps) {
  const current = typeof props.value === "string" && props.value ? props.value : FONT_OPTIONS[0].value;
  const selected = getOption(current);

  useEffect(() => {
    const existing = document.querySelector('link[data-qv-fonts="1"]');
    if (existing) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_STYLESHEET;
    link.setAttribute("data-qv-fonts", "1");
    document.head.appendChild(link);
  }, []);

  return (
    <Stack space={3}>
      <Select
        value={current}
        onChange={(event) => props.onChange(set(event.currentTarget.value))}
        disabled={props.readOnly}
      >
        {FONT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} - {option.vibe}
          </option>
        ))}
      </Select>
      <Card
        radius={2}
        padding={3}
        tone="transparent"
        style={{ border: "1px solid var(--card-border-color)" }}
      >
        <Text size={1} muted>
          Preview
        </Text>
        <p
          style={{
            margin: "8px 0 0 0",
            fontFamily: selected.sampleFamily,
            fontSize: "1.1rem",
            lineHeight: 1.35,
            letterSpacing: "0.01em",
          }}
        >
          Neon Myth Engine for Visual Worlds
        </p>
      </Card>
    </Stack>
  );
}
