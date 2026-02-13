import { Layer, XYWH } from "@/types/canvas";
import { shallow, useSelf, useStorage } from "@liveblocks/react";

const boundingBox = (layers: Layer[]): XYWH | null => {
    const first = layers[0];

    if (!first) {
        return null;
    }

    // Cast to any to handle property access for union types (e.g., PathLayer)
    let left = (first as any).x;
    let right = (first as any).x + (first as any).width;
    let top = (first as any).y;
    let bottom = (first as any).y + (first as any).height;

    for (let i = 1; i < layers.length; i++) {
        const { x, y, width, height } = layers[i] as any; // Cast to any

        if (left > x) {
            left = x;
        }

        if (right < x + width) {
            right = x + width;
        }

        if (top > y) {
            top = y;
        }

        if (bottom < y + height) {
            bottom = y + height;
        }
    }

    return {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
    };
};

export const useSelectionBounds = () => {
    const selection = useSelf((me) => me.presence.selection);

    return useStorage((root) => {
        // Fallback to an empty array if selection is null to prevent .map errors
        const selectedLayers = (selection ?? [])
            .map((layerId) => root.layers.get(layerId)!)
            .filter(Boolean);

        return boundingBox(selectedLayers);
    }, shallow);
};