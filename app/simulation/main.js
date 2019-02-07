// @flow

import type { Id } from '../metamodel';
import type { VisModel } from '../diagram';
import * as ufobDiagram from "../ufob/view/diagram";
import type { SimulationState } from './metamodel';
import * as simMeta from './metamodel';
import type { UfoaEntity, Generalisation } from '../ufoa/metamodel';
import type { UfobEvent, AddEntityInstOp } from '../ufob/metamodel';
import type { EntityInst, GeneralisationInst } from '../ufoa-inst/metamodel';
import * as ufoaInstMeta from '../ufoa-inst/metamodel';
import * as ufoaInstModel from '../ufoa-inst/model';
import * as ufoaInstDiagram from '../ufoa-inst/view/diagram';
import * as ufoaDB from '../ufoa/db';
import * as ufobDB from '../ufob/db';
import * as panels from '../panels';
import * as newEntityInstModal from './view/dialogs/newEntityInstModal';
import * as chooseEntityInstModal from './view/dialogs/chooseEntityInstModal';

var simState: SimulationState = simMeta.initState;
var simError: boolean = false;

function checkSingleDefault(entity: UfoaEntity): boolean {
  return !simState.sim_ufoaInsts.find(ei => ei.ei_e_id === entity.e_id);
}

function addOp2EntityInstPmFn(eventB: UfobEvent, op: AddEntityInstOp): () => Promise<EntityInst> {
  return (() => {
    const entity = ufoaDB.getEntity(op.opa_e_id);
    if (!entity) {
      return Promise.reject(`Entity with id=${op.opa_e_id} referenced from addEntityInst operation in event ${eventB.ev_id} does not exist<br>`);
    } else {
      if (op.opa_ei_is_default) {
        if (!checkSingleDefault(entity)) {
          return Promise.reject(`Simulation error: There is already a default instance of entity "${entity.e_name}", please correct the Behaviour Model.<br>`);
        } else {
          return Promise.resolve(ufoaInstModel.newEntityInst(entity, ""));
        }
      } else {
        return newEntityInstModal.renderPm(simState.sim_ufoaInsts, entity);
      }
    }
  });
}

function sequence(tasks: Array<() => Promise<any>>, parameters = [], context = null) {
  return new Promise((resolve, reject) => {
    var nextTask = tasks.splice(0,1)[0].apply(context, parameters[0]); //Dequeue and call the first task
    var output = new Array(tasks.length + 1);
    var errorFlag = false;
    tasks.forEach((task, index) => {
      nextTask = nextTask.then(r => {
        output[index] = r;
        return task.apply(context, parameters[index+1]);
      }, e=>{
        output[index] = e;
        errorFlag = true;
        return task.apply(context, parameters[index+1]);
      });
    });
    // Last task
    nextTask.then(r=>{
      output[output.length - 1] = r;
      if (errorFlag) reject(output); else resolve(output);
    })
      .catch(e=>{
        output[output.length - 1] = e;
        reject(output);
      });
  });
}

function getEntityInstPm(insts: Array<EntityInst>, entity: UfoaEntity, choiceType: string): Promise<?EntityInst> {
  return new Promise(resolve => {
    const myInsts = insts.filter(ei => ei.ei_e_id === entity.e_id);
    if (myInsts.length === 0) {
      //console.log("No instance for " + entity.e_id);
      resolve(null);
    } else if (myInsts.length === 1) {
      //console.log("1 instance for " + entity.e_id);
      resolve(myInsts[0]);
    } else { // >1
      console.log("several instances for " + entity.e_name);
      return chooseEntityInstModal.renderPm(simState.sim_ufoaInsts.filter(ei => ei.ei_e_id === entity.e_id), entity, choiceType);
    }
  });
}

function addEdges(ufoaInstVisModel: VisModel, edges: Array<any>) {
  edges.map((edge: any) => {
    let visEdges = ufoaInstVisModel.edges;
    if (!visEdges.get(edge.id)) {
      visEdges.add(edge);
    }
  });
}

function g2gInstPmFn(g: Generalisation): () => Promise<?GeneralisationInst> {
  return (() => {
    return new Promise((resolve, reject) => {
      const sup = ufoaDB.getEntity(g.g_sup_e_id);
      const sub = ufoaDB.getEntity(g.g_sub_e_id);
      if (!sup || !sub) {
        console.error(`UFO-A model inconsistency: entity/ies does not exist: ${sup ? '' : g.g_sup_e_id} ${sub ? '' : g.g_sub_e_id}`);
        return reject();
      } else {
        getEntityInstPm(sup, `supertype of ${sub.e_name}`).then(
          supInst => {
            if (!supInst) {
              resolve(null);
            } else {
              getEntityInstPm(sub, `subtype of ${sup.e_name}`).then(
                subInst => {
                  if (!subInst) {
                    resolve(null);
                  } else {
                    resolve(ufoaInstMeta.newGenInst(g, supInst, subInst));
                  }
                }
              );
            }
          } 
        );
      }
    });
  });
}

function addGeneralisations(ufoaInstVisModel: VisModel) {
  const presentEntityInstsInGInstsIds: Array<Id> = 
    simState.sim_gInsts.reduce((acc: Array<EntityInst>, gi: GeneralisationInst) => 
      acc.concat([gi.gi_sup_ei_id, gi.gi_sub_ei_id]));
  sequence(gInstEdgesPmFns).then(
    gInsts => {
      const edges = gInsts.filter(gi => gi !== null).map(ufoaInstDiagram.gInst2vis);
      addEdges(ufoaInstVisModel, edges);
    }
  );
}

//function addAssociations(ufoaInstVisModel: VisModel) {
  //const edges = ufoaDB.getAssociations().reduce(
    //(edges, a) => {
      //const e1Inst = getEntityInst(a.a_connection1.e_id);
      //const e2Inst = getEntityInst(a.a_connection2.e_id);
      //if (e1Inst && e2Inst) {
        //const ai = ufoaInstMeta.newAssocInst(a, e1Inst, e2Inst);
        //simState.sim_assocInsts.push(ai);
        //return edges.concat(ufoaInstDiagram.assocInst2vis(ai));
      //} else {
        //return edges;
      //}
    //}, []);
  //addEdges(ufoaInstVisModel, edges);
//}

function processAddOperations(ufoaInstVisModel: VisModel, ufoaInstNetwork: any, eventB: UfobEvent) {
  const addOps = eventB.ev_add_ops;
  const newInstsPmFns = addOps.map(op => addOp2EntityInstPmFn(eventB, op));
  sequence(newInstsPmFns).then(
    newInsts => {
      simState.sim_ufoaInsts = simState.sim_ufoaInsts.concat(newInsts);
      newInsts.map(ei => ufoaInstDiagram.addEntityInst(ufoaInstVisModel, ei));
      addGeneralisations(ufoaInstVisModel);
      //addAssociations(ufoaInstVisModel);
      ufoaInstNetwork.fit({ 
        nodes: newInsts.map(ei => ufoaInstMeta.eiId(ei)),
        animation: true
      });
    },
    error => {
      panels.displayError(error);
      simError = true;
    }
  );
}

function processRemoveOperations(ufoaInstVisModel: VisModel, eventB: UfobEvent) {
  const removeOps = eventB.ev_remove_ops;
}

function markVisited(ufobVisModel: VisModel, eventB: UfobEvent) {
  ufobVisModel.nodes.update({ id: eventB.ev_id, color: "#e6de17" });
  ufobVisModel.nodes.update({ id: eventB.ev_to_situation_id, color: "#e6de17" });
}

function doStep(ufobVisModel: VisModel, ufoaInstVisModel: VisModel, ufoaInstNetwork: any, evId: Id) {
  const eventB = ufobDB.getUfobEventById(evId);
  if (!eventB) {
    console.error(`UFO-B model inconsistency: Event id=${evId} missing in DB, but present in the diagram`);
  } else {
    processRemoveOperations(ufoaInstVisModel, eventB);
    processAddOperations(ufoaInstVisModel, ufoaInstNetwork, eventB);
    markVisited(ufobVisModel, eventB);
  }
}

function dispatch(ufobVisModel: VisModel, ufoaInstVisModel: VisModel, ufoaInstNetwork: any, params: any) {
  const nodeId = params.nodes[0];
  if (nodeId) {
    const node = ufobVisModel.nodes.get(nodeId);
    let wmdaText = "";
    if (node.type === "event") {
      let ev = ufobDB.getUfobEventById(nodeId);               
      if (ev) {
        wmdaText = ev.ev_wmda_text;
      } else {
        console.error(`Inconsistency: event ${nodeId} not present in the model`);
      }
      if (simError) {
        panels.displayError("Simulation crashed, please restart it");
      } else {
        doStep(ufobVisModel, ufoaInstVisModel, ufoaInstNetwork, nodeId);
      }
    } else { // situation ... hopefully
      if (node.type === "situation") {
        let s = ufobDB.getSituationById(nodeId);               
        if (s) {
          wmdaText = s.s_wmda_text;
        } else {
          console.error(`Inconsistency: situation${nodeId} not present in the model`);
        }
      } else {
        console.error("Unknown UFO-B diagram node type: " + node.type);
      }
    }
    $('#wmda-panel').html(wmdaText);
  }
}

export function initialise(ufobVisModel: any) {
  const ufoaInstDiagramContainer = document.getElementById('ufoa-inst-diagram');
  const simUfobDiagramContainer = document.getElementById('simulation-diagram');
  if (ufoaInstDiagramContainer) {
    let ufoaInstVisModel = ufoaInstDiagram.newVis();
    let ufoaInstNetwork = ufoaInstDiagram.renderUfoaInst(ufoaInstDiagramContainer, ufoaInstVisModel);
    if (simUfobDiagramContainer) {
      let simUfobNetwork = ufobDiagram.renderUfob(ufobVisModel, simUfobDiagramContainer);
      simUfobNetwork.setOptions({ manipulation: false });
      simUfobNetwork.on("click", params => dispatch(ufobVisModel, ufoaInstVisModel, ufoaInstNetwork, params));
      simUfobNetwork.fit({ 
        nodes: ["ev40"],
        animation: false
      });
    } else {
      console.error('#simulation-diagram missing in DOM');
    }
  } else {
    console.error('#ufoa-inst-diagram missing in DOM');
  }
}



