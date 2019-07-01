//@flow

import * as R from 'ramda';
import * as vis from 'vis';
import * as React from 'react';
import type { Id } from './metamodel';
import type { UfoaEntity } from './ufoa/metamodel';
import * as ufoaMeta from './ufoa/metamodel';

export type VisId = string;
export type VisLabel = string;
export type VisColor = string;

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
    nodes: new vis.DataSet(nodes2),
    edges: new vis.DataSet(edges2)
  });
}

