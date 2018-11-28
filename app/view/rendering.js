//@flow

export type VisId = string;
export type VisLabel = string;
export type VisColor = string;

export type VisNode = { 
  id: VisId,
  label: VisLabel,
  color: VisColor,
  x?: number,
  y?: number
};

export type VisEdge = {
  type?: "generalisation" | "association",
  from: VisId,
  to: VisId,
  label: VisLabel,
  width: number,
  arrows?: any
};

export const emptyVisEdge = { from: "", to: "", label: "", width: 0 };

export type VisModel = {
  nodes: any,
  edges: any
};

