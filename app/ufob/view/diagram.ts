import * as _ from "lodash";
import * as visNetwork from "vis-network";
import * as visData from "vis-data";
import { Id, Graphics } from "../../metamodel";
import { UfobEvent, Situation, Disposition, UfobModel } from "../metamodel";
import { UfobVisNode, UfobVisEdge, UfobVisModel } from "./diagram";
import { Position } from "../../diagram";
import * as diagram from "../../diagram";
import * as ufobModel from "../model";
import * as ufobDB from "../db";
import * as newNodeModal from "./dialogs/newNodeModal";
import * as situationDialog from "./dialogs/situationDialog";
import * as eventDialog from "./dialogs/eventDialog";

export interface UfobVisNode extends visNetwork.Node {
  type: "event" | "situation";
}

export type UfobVisEdge = visNetwork.Edge;

export type UfobNodesDataSet = visData.DataSet<UfobVisNode>;
export type UfobEdgesDataSet = visData.DataSet<UfobVisEdge>;

export interface UfobVisModel {
  nodes: UfobNodesDataSet;
  edges: UfobEdgesDataSet;
}

export function newUfobVisModel(visNodes: UfobVisNode[], visEdges: UfobVisEdge[]): UfobVisModel {
  return {
    nodes: new visData.DataSet(visNodes),
    edges: new visData.DataSet(visEdges)
  }
}

export function cloneUfobVisModel(visModel: UfobVisModel): UfobVisModel {
  const nodes2 = _.clone(visModel.nodes.get());
  const edges2 = _.clone(visModel.edges.get());
  return newUfobVisModel(nodes2, edges2);
}

function situation2vis(s: Situation, coords?: Position): UfobVisNode {
  const pos = coords || {};
  return {
    ...coords,
    id: s.s_id,
    type: "situation",
    label: s.s_name,
    shape: "box"
  };
}

function event2vis(ev: UfobEvent, coords?: Position): UfobVisNode {
  const pos = coords || {};
  return {
    ...coords,
    id: ev.ev_id,
    type: "event",
    label: ev.ev_name,
    shape: "ellipse"
  };
}

export function mkEdge(from: Id, to: Id, label: string = "") {
  return { from, to, label, width: 2, arrows: "to" };
}

function situation2eventEdge(m: UfobModel, s: Situation, d: Disposition, evId: Id): UfobVisEdge {
  const ev = ufobModel.getUfobEventById(m, evId);
  if (ev) {
    return mkEdge(s.s_id, ev.ev_id, d.d_text);
  } else {
    console.error(new Error(`Model consistency error: event ${evId} not found`));
    return diagram.emptyVisEdge;
  }
}

export function model2vis(model: UfobModel, elementGraphics: Graphics): UfobVisModel {
  const nodes: UfobVisNode[] = [
    ...(model.situations.map((s) => situation2vis(s, elementGraphics[s.s_id]))),
    ...(model.events.map((ev) => event2vis(ev, elementGraphics[ev.ev_id])))
  ];
  const edges: UfobVisEdge[] = [
    ...(_.flattenDeep(model.situations.map((s) => s.s_dispositions.map((d) => d.d_events_ids.map((evId) => situation2eventEdge(model, s, d, evId)))))),
    ...(model.events.map((e) => mkEdge(e.ev_id, e.ev_to_situation_id)))
  ];
  return newUfobVisModel(nodes, edges);
}

type Callback = (n: UfobVisNode) => void;

function addNodeHandler(ufobVisModel: UfobVisModel, visNetwork1: visNetwork.Network, callback: Callback) {
  newNodeModal.render((res: any) => {
    if (res.selection === "situation") {
      const newS: Situation = ufobDB.newSituation();
      callback(situation2vis(newS));
      visNetwork1.fit({
        nodes: [newS.s_id],
        animation: true
      });
      situationDialog.render(newS, ufobVisModel);
    } else if (res.selection === "event") {
      const newEv: UfobEvent = ufobDB.newEvent("New event", res.ev_to_situation_id);
      callback(event2vis(newEv));
      visNetwork1.fit({
        nodes: [newEv.ev_id],
        animation: true
      });
      eventDialog.render(newEv, ufobVisModel);
    } else {
      console.error(new Error("Attempt to add an unknown node type: " + res.selection));
    }
  });

}

export function renderUfob(ufobVisModel: UfobVisModel, container: HTMLElement): any {
  const data: visNetwork.Data = {
    nodes: ufobVisModel.nodes.get(),
    edges: ufobVisModel.edges.get()
  };
  const network = new visNetwork.Network(container, data, {});
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
      //TODO: slepice a vejce:
      addNode: (nodeData: any, callback: Callback) => addNodeHandler(ufobVisModel, network, callback),
    }
  };
  network.setOptions(options);
  return network;
}
