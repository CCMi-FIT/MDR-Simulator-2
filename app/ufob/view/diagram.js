//@flow

import * as R from 'ramda';
import * as vis from 'vis';
import type { Id } from '../../metamodel';
import type { UfobEvent, Situation, Disposition, UfobModel } from "../metamodel";
import type { VisNode, VisEdge, VisModel } from '../../diagram';
import * as diagram from '../../diagram';
import * as ufobModel from "../model";
import * as ufobDB from "../db";
import * as newNodeModal from "./dialogs/newNodeModal";
import * as situationDialog from './dialogs/situationDialog';
import * as eventDialog from './dialogs/eventDialog';

function situation2vis(s: Situation, coords: any): VisNode {
  return Object.assign({
    id: s.s_id,
    type: "situation",
    label: s.s_name,
    shape: "box"
  }, coords);
}

function event2vis(ev: UfobEvent, coords: any): VisNode {
  return Object.assign({
    id: ev.ev_id,
    type: "event",
    label: ev.ev_name,
    shape: "ellipse"
  }, coords);
}

export function mkEdge(from: Id, to: Id, label: string = "") {
  return { from, to, label, width: 2, arrows: "to" };
}

function situation2eventEdge(m: UfobModel, s: Situation, d: Disposition, ev_id: Id): VisEdge {
  const ev = ufobModel.getUfobEventyId(m, ev_id);
  if (ev) {
    return mkEdge(s.s_id, ev.ev_id, d.d_text);
  } else {
    console.error(`Model consistency error: event ${ev_id} not found`);
    return diagram.emptyVisEdge;
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

function addNodeHandler(ufobVisModel: VisModel, visNetwork, nodeData, callback) {
  newNodeModal.render(nodeData, (res: any) => {
    if (res.selection === "situation") {
      let newS: Situation = ufobDB.newSituation();
      callback(situation2vis(newS));
      visNetwork.fit({ 
        nodes: [newS.s_id],
        animation: true
      });
      situationDialog.render(newS, ufobVisModel);
    } else if (res.selection === "event") {
      let newEv: UfobEvent = ufobDB.newEvent("New event", res.ev_to_situation_id);
      callback(event2vis(newEv));
      visNetwork.fit({ 
        nodes: [newEv.ev_id],
        animation: true
      });
      eventDialog.render(newEv, ufobVisModel);
    } else {
      console.error("Attempt to add an unknown node type: " + res.selection);
    }
  });

}

export function renderUfob(ufobVisModel: VisModel, container: Element): any {
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
      addNode: (nodeData, callback) => addNodeHandler(ufobVisModel, visNetwork, nodeData, callback),
      //addEdge: (edgeData, callback) => addEdgeHandler(ufobVisModel, edgeData, callback)
    }
  };
  
  visNetwork = new vis.Network(container, ufobVisModel, options);
  return visNetwork;
}
