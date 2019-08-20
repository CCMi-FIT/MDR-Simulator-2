//@flow

import * as visNetwork from "vis-network";
import * as visData from "vis-data";
import type { UfoaEntity, Generalisation, Association, UfoaModel } from "../metamodel";
import type { VisNode, VisEdge, VisModel } from '../../diagram';
import * as ufoaMeta from "../metamodel";
import * as ufoaDB from "../db";
import * as newEdgeDialog from "./dialogs/newEdgeDialog";
import * as entityDialog from "./dialogs/entityDialog";
import * as generalisationDialog from "./dialogs/generalisationDialog";
import * as associationDialog from "./dialogs/associationDialog";

export function entity2vis(e: UfoaEntity, coords: any): VisNode {
  return Object.assign({
    id: e.e_id,
    label: ufoaMeta.entityStr(e),
    color: ufoaMeta.entityColor(e)
  }, coords);
}

export function generalisation2vis(g: Generalisation): VisEdge {
  return ({
    id: g.g_id,
    type: "generalisation",
    from: g.g_sup_e_id,
    to: g.g_sub_e_id,
    label: g.g_set.g_set_id,
    title: ufoaMeta.genMetaStr(g.g_set.g_meta),
    arrows: "from",
    width: 5,
    smooth: false
  });
}

export function assoc2vis(a: Association) :VisEdge {
  return ({
    id: a.a_id,
    type: "association",
    from: a.a_connection1.e_id,
    to: a.a_connection2.e_id,
    label: a.a_label,
    title: ufoaMeta.assocMetaStr(a.a_meta),
    arrows: {
      from: {
        enabled: a.a_type === "MemberOf",
        type: "circle"
      }
    },
    width: 2,
    smooth: false
  });
}

export function model2vis(model: UfoaModel, graphics: any): VisModel {
  const gEdges = model.generalisations.map(generalisation2vis);
  const aEdges = model.associations.map(assoc2vis);
  let nodesDataSet = new visData.DataSet();
  console.log(nodesDataSet);
  let edgesDataSet = new visData.DataSet();
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
      console.error("Attempt to add an unknown edge type: " + edgeType);
    }
  });
}

export function renderUfoa(container: HTMLElement, ufoaVisModel: VisModel): any {
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
  
  return new visNetwork.Network(container, ufoaVisModel, options);
}
