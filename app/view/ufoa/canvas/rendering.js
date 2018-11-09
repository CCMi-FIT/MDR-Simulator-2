//@flow

import type { Id, UfoaEntity, Generalisation, Association, UfoaModel } from "../../../metamodel/ufoa";
import type { EntityGraphics } from './entityGraphics'; 
import * as ufoaMeta from "../../../metamodel/ufoa";
import * as ufoaDB from "../../../db/ufoa";
import * as newEdgeDialog from "../newEdgeDialog";

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
  type: "generalisation" | "association",
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

function entity2vis(e: UfoaEntity, coords: any): VisNode {
  return Object.assign({
    id: e.e_id,
    label: ufoaMeta.entityStr(e),
    color: ufoaMeta.entityColor(e)
  }, coords);
}

function generalisation2vis(g: Generalisation): VisEdge {
  return {
    id: g.g_id,
    type: "generalisation",
    from: g.g_sup_e_id,
    to: g.g_sub_e_id,
    label: g.g_set.g_set_id,
    title: ufoaMeta.genMetaStr(g.g_set.g_meta),
    arrows: "from",
    width: 5,
    smooth: {
      type: "straightCross"
    }
  };
}

function assoc2vis(a: Association) :VisEdge {
  return {
    id: a.a_id,
    type: "association",
    from: a.a_connection1.e_id,
    to: a.a_connection2.e_id,
    label: a.a_label,
    title: ufoaMeta.assocMetaStr(a.a_meta),
    arrows: {
      to: {
        enabled: a.a_type === "member of",
        type: "circle"
      }
    },
    width: 2,
    smooth: {
      type: "cubicBezier"
    }
  };
}

export function model2vis(model: UfoaModel, entityGraphics: any): VisModel {
  const gEdges = model.generalisations.map(generalisation2vis);
  const aEdges = model.associations.map(assoc2vis);
  let nodesDataSet = new vis.DataSet();
  let edgesDataSet = new vis.DataSet();
  nodesDataSet.add(model.entities.map(e => entity2vis(e, entityGraphics[e.e_id])));
  edgesDataSet.add(gEdges.concat(aEdges));
  console.log(nodesDataSet);
  return {
    nodes: nodesDataSet,
    edges: edgesDataSet
  };
}

function addNodeHandler(nodeData, callback) {
  callback(entity2vis(ufoaDB.newEntity(), null));
}

function addEdgeHandler(edgeData, callback) {
  newEdgeDialog.render(edgeData, (edgeType: string) => {
    callback(
        edgeType === "generalisation" ? 
          generalisation2vis(ufoaDB.newGeneralisation(edgeData.from, edgeData.to))
      : edgeType === "association" ? 
          assoc2vis(ufoaDB.newAssociation(edgeData.from, edgeData.to))
      : console.error("Attempt to add an unknown edge type: " + edgeType), edgeData
    );
  });
}

const options = {
  nodes: {
    shape: "box"
  },
  physics: {
    enabled: true,
    solver: "barnesHut",
    //solver: "forceAtlas2Based",
    barnesHut: {
      gravitationalConstant: -7000,
      centralGravity: 0.3,
      springLength: 300,
      springConstant: 0.01,
      damping: 0.15,
      avoidOverlap: 1
    },
    forceAtlas2Based: {
      gravitationalConstant: -100,
      centralGravity: 0.01,
      springConstant: 0.1,
      springLength: 400,
      damping: 0.1,
      avoidOverlap: 1
    }
  },
  manipulation: {
    enabled: true,
    addNode: addNodeHandler,
    addEdge: addEdgeHandler
  }
};
  
export function renderUfoa(visModel: VisModel): any {
  const container = document.getElementById("ufoa-box");
  if (container == null) {
    console.log("#ufoa-box missing");
    return null;
  } else {
    return new vis.Network(container, visModel, options);
  }
}
