//@flow

import * as R from "ramda";
import * as visData from "vis-data";
import * as React from "react";
import type { Id } from "./metamodel";
import type { UfoaEntity } from "./ufoa/metamodel";
import * as ufoaMeta from "./ufoa/metamodel";

export type VisId = string;
export type VisLabel = string;
export type VisColor = string;

export type Coords = {
  x: number,
  y: number
};

type BoundingBox = {
  top: number,
  left: number,
  right: number,
  bottom: number
};

export type VisNode = { 
  id: VisId,
  label: VisLabel,
  color?: VisColor,
  x?: number,
  y?: number
};

export type VisEdge = {
  type?: "generalisation" | "association" | "genInst" | "assocInst",
  from: VisId,
  to: VisId,
  label?: VisLabel,
  width: number,
  arrows?: any
};

export const emptyVisEdge = { from: "", to: "", label: "", width: 0 };

export type VisModel = {
  nodes: any,
  edges: any
};

export type Layout = {
  [key: Id]: { x: number, y: number}
}

export function getBoundingBox(network: any, nodeId: Id): BoundingBox {
  const bb: BoundingBox = network.getBoundingBox(nodeId);
  const topLeft = network.canvasToDOM({x: bb.left, y: bb.top});
  const bottomRight = network.canvasToDOM({x: bb.right, y: bb.bottom});
  return { left: topLeft.x, right: bottomRight.x, top: topLeft.y, bottom: bottomRight.y };
}

export function renderEntity(e: UfoaEntity) {
  return (
    <div className="entity-box" style={{backgroundColor: ufoaMeta.entityColor(e)}}>
      {ufoaMeta.entityTypeStr(e)}
      <br/>
      {e.e_name}
    </div>);
}

export function cloneVisModel(visModel: VisModel): VisModel {
  const nodes2 = R.clone(visModel.nodes.get());
  const edges2 = R.clone(visModel.edges.get());
  return ({
    nodes: new visData.DataSet(nodes2),
    edges: new visData.DataSet(edges2)
  });
}

