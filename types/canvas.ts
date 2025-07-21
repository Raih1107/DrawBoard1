export type Color = {
    r: number;
    g: number;
    b: number;
};

export type Camera = {
    x: number;
    y: number;
};

export enum LayerType {
    Rectangle,
    Ellipse,
    Path,
    Text,
    Note,
    Arrow, // ✅ New
}

export type RectangleLayer = {
    type: LayerType.Rectangle;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    value?: string;
};

export type EllipseLayer = {
    type: LayerType.Ellipse;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    value?: string;
};

export type PathLayer = {
    type: LayerType.Path;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    points: number[][]; // [ [x1, y1], [x2, y2], ... ]
    value?: string;
};

export type TextLayer = {
    type: LayerType.Text;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    value?: string;
};

export type NoteLayer = {
    type: LayerType.Note;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    value?: string;
};

// ✅ New Arrow Layer
export type ArrowLayer = {
    type: LayerType.Arrow;
    start: Point;
    end: Point;
    stroke: Color;
};

export type Point = {
    x: number;
    y: number;
};

export type XYWH = {
    x: number;
    y: number;
    height: number;
    width: number;
};

export enum Side {
    Top = 1,
    Bottom = 2,
    Left = 4,
    Right = 8,
}

// ✅ CanvasMode now includes Eraser
export enum CanvasMode {
    None,
    Pressing,
    SelectionNet,
    Translating,
    Inserting,
    Resizing,
    Pencil,
    Eraser, // ✅ New
}

// ✅ CanvasState updated to allow Eraser
export type CanvasState =
    | { mode: CanvasMode.None }
    | { mode: CanvasMode.SelectionNet; origin: Point; current?: Point }
    | { mode: CanvasMode.Translating; current: Point }
    | { mode: CanvasMode.Inserting; layerType: LayerType; }
    | { mode: CanvasMode.Pencil }
    | { mode: CanvasMode.Pressing; origin: Point }
    | { mode: CanvasMode.Resizing; initialBounds: XYWH; corner: Side }
    | { mode: CanvasMode.Eraser }; // ✅ New

// ✅ Optional: Unified Layer type if needed
export type Layer =
    | RectangleLayer
    | EllipseLayer
    | PathLayer
    | TextLayer
    | NoteLayer
    | ArrowLayer;
