import * as visNetwork from "vis-network";
import * as visData from "vis-data";
import { EntityInst, GeneralisationInst, AssocInst } from "../../ufoa-inst/metamodel";
import * as ufoaDB from "../../ufoa/db";
import * as ufoaMeta from "../../ufoa/metamodel";
import * as ufoaInstMeta from "../../ufoa-inst/metamodel";
import { UfoaVisNode, UfoaVisEdge, UfoaVisModel } from "../../ufoa/view/diagram";

export type UfoaInstVisNode = UfoaVisNode;
export type UfoaInstVisEdge = UfoaVisEdge;

export interface UfoaInstVisModel {
  nodes: visData.DataSet<UfoaInstVisNode>;
  edges: visData.DataSet<UfoaInstVisEdge>;
}

// Initialisation {{{1

export function newUfoaInstVisModel(visNodes: UfoaInstVisNode[] = [], visEdges: UfoaInstVisEdge[] = []): UfoaInstVisModel {
  return {
    nodes: new visData.DataSet(visNodes),
    edges: new visData.DataSet(visEdges)
  }
}

// General manipulation {{{1

export function addEdge(visModel: UfoaInstVisModel, edge: UfoaInstVisEdge) {
  visModel.edges.add(edge);
}

export function addEdges(visModel: UfoaInstVisModel, edges: UfoaInstVisEdge[]) {
  edges.map((edge) => addEdge(visModel, edge));
}

// Entity Inst {{{1
function eiColor(ei: EntityInst): string {
  const entity = ufoaDB.getEntity(ei.ei_e_id);
  return entity ? ufoaMeta.entityColor(entity) : "#FFFFFF";
}

function entityInst2vis(ei: EntityInst): UfoaInstVisNode {
  return ({
    id: ufoaInstMeta.eiId(ei),
    label: ufoaInstMeta.eiLabel(ei, ufoaDB),
    shape: "box",
    color: eiColor(ei)
  });
}

export function addEntityInst(visModel: UfoaInstVisModel, ei: EntityInst) {
  const newNode: UfoaInstVisNode = {
    ...entityInst2vis(ei),
    borderWidth: 5 
  };
  visModel.nodes.add(newNode);
}

export function addEntityInsts(visModel: UfoaInstVisModel, eis: EntityInst[]) {
  const nodesIds = visModel.nodes.getIds();
  const updateArray = nodesIds.map((nid) => ({ id: nid, borderWidth: 1 }));
  visModel.nodes.update(updateArray);
  eis.map((ei) => addEntityInst(visModel, ei));
}

// Generalisation Inst {{{1

export function gInst2vis(gi: GeneralisationInst): UfoaInstVisEdge {
  return ({
    id: gi.gi_id,
    type: "genInst",
    from: gi.gi_sup_ei_id,
    to: gi.gi_sub_ei_id,
    arrows: "from",
    width: 5,
    smooth: false
  });
}

export function addGInst(visModel: UfoaInstVisModel, gi: GeneralisationInst) {
  const newEdge = gInst2vis(gi);
  addEdge(visModel, newEdge);
}

export function addGInsts(visModel: UfoaInstVisModel, gis: GeneralisationInst[]) {
  gis.map((gi) => addGInst(visModel, gi));
}

// Association Inst {{{1
export function assocInst2vis(ai: AssocInst): UfoaInstVisEdge {
  const a = ufoaDB.getAssociation(ai.ai_a_id);
  if (a) {
    return ({
      id: ai.ai_id,
      type: "assocInst",
      from: ai.ai_ei1_id,
      to: ai.ai_ei2_id,
      arrows: {
        from: {
          enabled: a.a_type === "MemberOf",
          type: "circle"
        }
      },
      width: 2,
      smooth: false
    });
  } else {
    throw(new Error(`Model inconsistency: Association ${ai.ai_a_id} in AssocInst ${ai.ai_id} does not exist`));
  }
}

export function addAInst(visModel: UfoaInstVisModel, ai: AssocInst) {
  const newEdge = assocInst2vis(ai);
  addEdge(visModel, newEdge);
}

export function addAInsts(visModel: UfoaInstVisModel, ais: AssocInst[]) {
  ais.map((ai) => addAInst(visModel, ai));
}

// Render {{{1

export function renderUfoaInst(container: HTMLElement, visModel: UfoaInstVisModel): any {
  const options = {
    edges: {
      smooth: false
    },
    physics: {
      enabled: true,
      solver: "barnesHut",
      barnesHut: {
        gravitationalConstant: -20000,
        centralGravity: 0.7,
        springLength: 50,
        springConstant: 0.03,
        damping: 0.5,
        avoidOverlap: 1
      },
    },
  };
  return new visNetwork.Network(container, visModel, options);
}
