//@flow

import * as R from 'ramda';
import * as vis from 'vis';
import type { Id, EventB, Situation, Disposition, UfobModel } from "../../../metamodel/ufob";
import type { VisId, VisLabel, VisColor, VisNode, VisEdge, VisModel } from '../../rendering';
import * as ufobMeta from "../../../metamodel/ufob";
import * as ufobModel from "../../../model/ufob";
import * as ufobDB from "../../../db/ufob";
import * as rendering from '../../rendering';

function situation2vis(s: Situation, coords: any): VisNode {
  return Object.assign({
    id: s.s_id,
    label: s.s_name,
    shape: "box"
  }, coords);
}

function event2vis(ev: EventB, coords: any): VisNode {
  return Object.assign({
    id: ev.ev_id,
    label: ev.ev_name,
    shape: "ellipse"
  }, coords);
}

function mkEdge(from: Id, to: Id, label: string = "") {
  return { from, to, label, width: 2, arrows: "to" };
}

function situation2eventEdge(m: UfobModel, s: Situation, d: Disposition, ev_id: Id): VisEdge {
  const ev = ufobModel.getEventById(m, ev_id);
  if (ev) {
    return mkEdge(s.s_id, ev.ev_id, d.d_text);
  } else {
    console.error(`Model consistency error: event ${ev_id} not found`);
    return rendering.emptyVisEdge;
  }
}

export function model2vis(model: UfobModel, elementGraphics: any): VisModel {
  let nodesDataSet = new vis.DataSet();
  let edgesDataSet = new vis.DataSet();
  nodesDataSet.add(model.situations.map(s => situation2vis(s, elementGraphics[s.s_id])));
  nodesDataSet.add(model.events.map(ev => event2vis(ev, elementGraphics[ev.ev_id])));
  edgesDataSet.add(R.flatten(model.situations.map(s => s.s_dispositions.map(d => d.d_events_ids.map(ev_id => situation2eventEdge(model, s, d, ev_id))))));
  edgesDataSet.add(model.events.map(e => mkEdge(e.ev_id, e.ev_to_situation_id)));
  return {
    nodes: nodesDataSet,
    edges: edgesDataSet
  };
}

export function renderUfob(ufobVisModel: VisModel): any {
  const container = document.getElementById("ufob-box");
  let visNetwork;
  const options = {
    edges: {
      smooth: false
    },
    //layout: {
      //hierarchical: {
        //enabled: true,
        //sortMethod: "directed"
      //}
    //},
    physics: {
      enabled: true,
      solver: "barnesHut",
      barnesHut: {
        gravitationalConstant: -500,
        centralGravity: 0,
        springLength: 50,
        springConstant: 0,
        damping: 0.3,
        avoidOverlap: 1
      },
    },
    interaction: {
      multiselect: true
    },
    manipulation: {
      enabled: true,
      //addNode: (nodeData, callback) => addNodeHandler(ufobVisModel, visNetwork, nodeData, callback),
      //addEdge: (edgeData, callback) => addEdgeHandler(ufobVisModel, edgeData, callback)
    }
  };
  
  if (container == null) {
    console.log("#ufob-box missing");
    return null;
  } else {
    visNetwork = new vis.Network(container, ufobVisModel, options);
    return visNetwork;
  }
}
