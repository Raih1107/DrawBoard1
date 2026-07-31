import { Layer, LayerType, XYWH } from "@/types/canvas";
import { shallow, useSelf, useStorage } from "@liveblocks/react";

const layerBounds = (layer: any): { left: number; right: number; top: number; bottom: number } => {
    if (layer.type === LayerType.Line) {
        // Lines use x,y as start and x2,y2 as end — bounding box wraps both endpoints
        return {
            left: Math.min(layer.x, layer.x2),
            right: Math.max(layer.x, layer.x2),
            top: Math.min(layer.y, layer.y2),
            bottom: Math.max(layer.y, layer.y2),
        };
    }
    return {
        left: layer.x,
        right: layer.x + layer.width,
        top: layer.y,
        bottom: layer.y + layer.height,
    };
};

const boundingBox = (layers: Layer[]): XYWH | null => {
    const first = layers[0];
    if (!first) return null;

    const initial = layerBounds(first as any);
    let left = initial.left;
    let right = initial.right;
    let top = initial.top;
    let bottom = initial.bottom;

    for (let i = 1; i < layers.length; i++) {
        const b = layerBounds(layers[i] as any);
        if (left > b.left) left = b.left;
        if (right < b.right) right = b.right;
        if (top > b.top) top = b.top;
        if (bottom < b.bottom) bottom = b.bottom;
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