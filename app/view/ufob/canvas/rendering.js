//@flow

import * as vis from 'vis';
import type { EventB, Situation } from "../../../metamodel/ufob";
import * as ufobMeta from "../../../metamodel/ufob";
import * as ufobDB from "../../../db/ufob";

// TODO: vytknout

type VisId = string;
type VisLabel = string;
type VisColor = string;

export type VisNode = { 
  id: VisId,
  label: VisLabel,
  color: VisColor,
  x?: number,
  y?: number
};

export type VisEdge = {
  from: VisId,
  to: VisId,
  label: VisLabel,
  width: number,
  arrows?: any
};

export type VisModel = {
  nodes: any,
  edges: any
};

// TODO: pokracovat

function event2vis(e: EventB, coords: any): VisNode {
  return Object.assign({
    id: e.e_id,
    label: ufobMeta.entityStr(e),
    color: ufobMeta.entityColor(e)
  }, coords);
}

function generalisation2vis(g: Generalisation): VisEdge {
  return {
    id: g.g_id,
    type: "generalisation",
    from: g.g_sup_e_id,
    to: g.g_sub_e_id,
    label: g.g_set.g_set_id,
    title: ufobMeta.genMetaStr(g.g_set.g_meta),
    arrows: "from",
    width: 5,
    smooth: false
    //smooth: {
    //  type: "straightCross"
    // }
  };
}

function assoc2vis(a: Association) :VisEdge {
  return {
    id: a.a_id,
    type: "association",
    from: a.a_connection1.e_id,
    to: a.a_connection2.e_id,
    label: a.a_label,
    title: ufobMeta.assocMetaStr(a.a_meta),
    arrows: {
      from: {
        enabled: a.a_type === "member of",
        type: "circle"
      }
    },
    width: 2,
    smooth: false
    //smooth: {
    //  type: "cubicBezier"
    // }
  };
}

export function model2vis(model: UfobModel, entityGraphics: any): VisModel {
  const gEdges = model.generalisations.map(generalisation2vis);
  const aEdges = model.associations.map(assoc2vis);
  let nodesDataSet = new vis.DataSet();
  let edgesDataSet = new vis.DataSet();
  nodesDataSet.add(model.entities.map(e => entity2vis(e, entityGraphics[e.e_id])));
  edgesDataSet.add(gEdges.concat(aEdges));
  return {
    nodes: nodesDataSet,
    edges: edgesDataSet
  };
}

function addNodeHandler(ufobVisModel: VisModel, visNetwork, nodeData, callback) {
  const newEntity = ufobDB.newEntity();
  callback(entity2vis(newEntity, null));
  visNetwork.fit({ 
    nodes: [newEntity.e_id],
    animation: true
  });
  entityDialog.render(newEntity, ufobVisModel);
}

function addEdgeHandler(ufobVisModel: VisModel, edgeData, callback) {
  newEdgeDialog.render(edgeData, (edgeType: string) => {
    if (edgeType === "generalisation") {
      let newGen: Generalisation = ufobDB.newGeneralisation(edgeData.from, edgeData.to);
      callback(generalisation2vis(newGen));
      generalisationDialog.render(newGen, ufobVisModel);
    } else if (edgeType === "association") {
      let newAssoc: Association = ufobDB.newAssociation(edgeData.from, edgeData.to);
      callback(assoc2vis(newAssoc));
      associationDialog.render(newAssoc, ufobVisModel);
    } else {
      console.error("Attempt to add an unknown edge type: " + edgeType)
    }
  });
}

export function renderUfob(ufobVisModel: VisModel): any {
  const container = document.getElementById("ufob-box");
  let visNetwork;
  const options = {
    nodes: {
      shape: "box"
    },
    physics: {
      enabled: true,
      solver: "barnesHut",
      //solver: "forceAtlas2Based",
      barnesHut: {
        gravitationalConstant: -2000,
        centralGravity: 0,
        springLength: 100,
        springConstant: 0,
        damping: 0.3,
        avoidOverlap: 1
      },
      //forceAtlas2Based: {
        //gravitationalConstant: -100,
        //centralGravity: 0,
        //springConstant: 0.1,
        //springLength: 400,
        //damping: 0.1,
        //avoidOverlap: 1
      //}
    },
    interaction: {
      multiselect: true
    },
    manipulation: {
      enabled: true,
      addNode: (nodeData, callback) => addNodeHandler(ufobVisModel, visNetwork, nodeData, callback),
      addEdge: (edgeData, callback) => addEdgeHandler(ufobVisModel, edgeData, callback)
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
