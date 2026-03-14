import { useMemo, useState } from "react";
import { Button, Card, Stack, Text } from "@sanity/ui";
import { set, type ObjectInputProps, useFormValue } from "sanity";

type SanityImageValue = {
  _type?: "image";
  asset?: { _type: "reference"; _ref: string };
  crop?: Record<string, unknown>;
  hotspot?: Record<string, unknown>;
};

function toCoverValue(value: SanityImageValue | undefined): SanityImageValue | null {
  if (!value?.asset?._ref) return null;
  return {
    _type: "image",
    asset: value.asset,
    crop: value.crop,
    hotspot: value.hotspot,
  };
}

export function CoverFromBulkPhotosInput(props: ObjectInputProps) {
  const [status, setStatus] = useState("");
  const galleryImages = (useFormValue(["galleryImages"]) as SanityImageValue[] | undefined) || [];

  const firstImage = useMemo(() => toCoverValue(galleryImages[0]), [galleryImages]);
  const canSetCover = Boolean(firstImage) && !props.readOnly;

  const useFirstBulkPhoto = () => {
    if (!firstImage) return;
    props.onChange(set(firstImage));
    setStatus("Cover set from first bulk photo.");
  };

  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      <Card padding={3} radius={2} tone="transparent" border>
        <Stack space={3}>
          <Button
            text="Use First Bulk Photo As Cover"
            mode="ghost"
            tone="primary"
            onClick={useFirstBulkPhoto}
            disabled={!canSetCover}
          />
          {!firstImage ? (
            <Text size={1} muted>
              Add at least one image to Bulk Photos first.
            </Text>
          ) : null}
          {status ? <Text size={1}>{status}</Text> : null}
        </Stack>
      </Card>
    </Stack>
  );
}

