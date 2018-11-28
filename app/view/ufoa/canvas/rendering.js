//@flow

import * as vis from 'vis';
import type { Id, UfoaEntity, Generalisation, Association, UfoaModel } from "../../../metamodel/ufoa";
import type { VisId, VisLabel, VisColor, VisNode, VisEdge, VisModel } from '../../rendering';
import * as ufoaMeta from "../../../metamodel/ufoa";
import * as ufoaDB from "../../../db/ufoa";
import * as newEdgeDialog from "../newEdgeDialog";
import * as entityDialog from "../entityDialog";
import * as generalisationDialog from "../generalisationDialog";
import * as associationDialog from "../associationDialog";

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
    title: ufoaMeta.assocMetaStr(a.a_meta),
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

export function model2vis(model: UfoaModel, graphics: any): VisModel {
  const gEdges = model.generalisations.map(generalisation2vis);
  const aEdges = model.associations.map(assoc2vis);
  let nodesDataSet = new vis.DataSet();
  let edgesDataSet = new vis.DataSet();
  nodesDataSet.add(model.entities.map(e => entity2vis(e, graphics[e.e_id])));
  edgesDataSet.add(gEdges.concat(aEdges));
  return {
    nodes: nodesDataSet,
    edges: edgesDataSet
  };
}

function addNodeHandler(ufoaVisModel: VisModel, visNetwork, nodeData, callback) {
  const newEntity = ufoaDB.newEntity();
  callback(entity2vis(newEntity, null));
  visNetwork.fit({ 
    nodes: [newEntity.e_id],
    animation: true
  });
  entityDialog.render(newEntity, ufoaVisModel);
}

function addEdgeHandler(ufoaVisModel: VisModel, edgeData, callback) {
  newEdgeDialog.render(edgeData, (edgeType: string) => {
    if (edgeType === "generalisation") {
      let newGen: Generalisation = ufoaDB.newGeneralisation(edgeData.from, edgeData.to);
      callback(generalisation2vis(newGen));
      generalisationDialog.render(newGen, ufoaVisModel);
    } else if (edgeType === "association") {
      let newAssoc: Association = ufoaDB.newAssociation(edgeData.from, edgeData.to);
      callback(assoc2vis(newAssoc));
      associationDialog.render(newAssoc, ufoaVisModel);
    } else {
      console.error("Attempt to add an unknown edge type: " + edgeType)
    }
  });
}

export function renderUfoa(ufoaVisModel: VisModel): any {
  const container = document.getElementById("ufoa-box");
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
      addNode: (nodeData, callback) => addNodeHandler(ufoaVisModel, visNetwork, nodeData, callback),
      addEdge: (edgeData, callback) => addEdgeHandler(ufoaVisModel, edgeData, callback)
    }
  };
  
  if (container == null) {
    console.log("#ufoa-box missing");
    return null;
  } else {
    visNetwork = new vis.Network(container, ufoaVisModel, options);
    return visNetwork;
  }
}
