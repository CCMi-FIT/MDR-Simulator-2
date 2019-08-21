import * as R from "ramda";
import { Id } from "./metamodel";
import * as visNetwork from "vis-network";
import * as visData from "vis-data";

export type VisId = string;
export type VisLabel = string;
export type VisColor = string;

export interface BoundingBox {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export const emptyVisEdge: visNetworktwork.Edge = { from: "", to: "", label: "", width: 0 };

export interface Layout {
  [key: Id]: { x: number, y: number};
}

export function getBoundingBox(network: visNetwork.Network, nodeId: Id): BoundingBox {
  const bb: BoundingBox = network.getBoundingBox(nodeId);
  const topLeft = network.canvasToDOM({x: bb.left, y: bb.top});
  const bottomRight = network.canvasToDOM({x: bb.right, y: bb.bottom});
  return { left: topLeft.x, right: bottomRight.x, top: topLeft.y, bottom: bottomRight.y };
}

export function cloneVisModel(visModel: visData.DataSet): DataSet {
  const nodes2 = R.clone(visModel.nodes.get());
  const edges2 = R.clone(visModel.edges.get());
  return ({
    nodes: new visData.DataSet(nodes2),
    edges: new visData.DataSet(edges2)
  });
}
