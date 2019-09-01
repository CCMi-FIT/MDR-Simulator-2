import * as _ from "lodash";
import { Id } from "./metamodel";
import * as visNetwork from "vis-network";
import * as visData from "vis-data";

export type VisId = string;
export type VisLabel = string;
export type VisColor = string;

export type Position = visNetwork.Position;

export interface BoundingBox {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export const emptyVisEdge: visNetwork.Edge = { from: "", to: "", label: "", width: 0 };

export function getBoundingBox(network: visNetwork.Network, nodeId: Id): BoundingBox {
  const bb: BoundingBox = network.getBoundingBox(nodeId);
  const topLeft = network.canvasToDOM({x: bb.left, y: bb.top});
  const bottomRight = network.canvasToDOM({x: bb.right, y: bb.bottom});
  return { left: topLeft.x, right: bottomRight.x, top: topLeft.y, bottom: bottomRight.y };
}
