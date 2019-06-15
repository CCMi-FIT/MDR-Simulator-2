// @flow

import * as R from 'ramda';
import type { Id } from '../../metamodel';
import type { VisModel } from '../../diagram';
import type { GSet } from '../../ufoa/metamodel';
import type { UfobEvent, AddEntityInstOp } from '../../ufob/metamodel';
import type { EntityInst, GeneralisationInst, AssocInst } from '../../ufoa-inst/metamodel';
import { eiId, eiLabel } from '../../ufoa-inst/metamodel';
import * as ufoaInstModel from '../../ufoa-inst/model';
import * as ufoaInstDiagram from '../../ufoa-inst/view/diagram';
import * as ufoaDB from '../../ufoa/db';
import * as ufobDB from '../../ufob/db';
import * as panels from '../../panels';
import * as chooseEntityInstModal from './dialogs/chooseEntityInstModal';

function addOp2EntityInsts(machine: any, eventB: UfobEvent, op: AddEntityInstOp): Array<EntityInst> {
  const entity = ufoaDB.getEntity(op.opa_e_id);
  if (op.opa_insts_names.length === 0) { // default instance
    if (!machine.checkSingleDefault(entity)) {
      throw(`Simulation error: There is already a default instance of entity "${entity.e_name}", please correct the Behaviour Model.<br>`);
    } else {
      return [ufoaInstModel.newEntityInst(entity, "")];
    }
  } else { // explicit names present
    const names = op.opa_insts_names;
    const indexedName = names.find(name1 => name1.includes("#"));
    if (indexedName) {
      const index = machine.getInstNameIndex(indexedName);
      const nameWithIndex = indexedName.replace("#", index.toString());
      const remainingNames = names.filter(name1 => name1 !== indexedName);
      const allNames = R.append(nameWithIndex, remainingNames);
      return allNames.map(name1 => ufoaInstModel.newEntityInst(entity, name1));
    } else {
      return names.map(name1 => ufoaInstModel.newEntityInst(entity, name1));
    }
  }
}

function sequence(tasks: Array<() => Promise<any>>, parameters = [], context = null) {
  return new Promise((resolve, reject) => {
    if (tasks.length === 0) {
      resolve([]);
    } else {
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
    }
  });
}

function selectGisPmFn(machine: any, giChoicesSet: Array<GeneralisationInst>): () => Promise<GeneralisationInst> {
  return (() => {
    try {
      const instsChoices = giChoicesSet.map(gi => machine.getSupEntityInst(gi));
      const supInst = machine.getSupEntityInst(giChoicesSet[0]);
      const subInst = machine.getSubEntityInst(giChoicesSet[0]);
      const entity = ufoaInstModel.getEntityOfInst(supInst, ufoaDB);
      return chooseEntityInstModal.renderPm(instsChoices, entity, `as the supertype of ${eiLabel(subInst, ufoaDB)}`).then(
        (chosenInst: EntityInst) => {
          const chosenGI: ?GeneralisationInst = giChoicesSet.find(gi => R.equals(eiId(chosenInst), gi.gi_sup_ei_id));
          if (!chosenGI) {
            console.error(`Something is wrong: chosenInst was not found in the original set`);
            return Promise.reject();
          } else {
            return Promise.resolve(chosenGI);
          }
        }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  });
}

async function addGInsts(machine:any, ufoaInstVisModel: VisModel, insts: Array<EntityInst>, presentGIs: Array<GeneralisationInst>) {
  const newGIs = machine.getMissingGIs(insts, presentGIs);
  const gisChoicesSets = machine.getSupChoiceSets(newGIs);
  const gisChoicesArrays: Array<Array<GeneralisationInst>> = R.values(gisChoicesSets);
  const gisSelectionsPmFns = gisChoicesArrays.map(fn => selectGisPmFn(machine, fn));
  let gisSelections: any = await sequence(gisSelectionsPmFns);
  const gisChoices = R.flatten((gisChoicesArrays: any)); 
  const gisNotSelected = R.difference(gisChoices, gisSelections);
  const finalGIs = R.difference(newGIs, gisNotSelected);
  machine.addGInsts(finalGIs);
  ufoaInstDiagram.addGInsts(ufoaInstVisModel, finalGIs);
}

async function addAssocsInsts(machine: any, ufoaInstVisModel: VisModel, insts: Array<EntityInst>, presentAIs: Array<AssocInst>) {
  const newAIs = machine.getMissingAIs(insts, presentAIs);
  const finalAIs = newAIs;
  machine.addAInsts(finalAIs);
  ufoaInstDiagram.addAInsts(ufoaInstVisModel, finalAIs);
}

function pruneDisjointGSs(machine: any, ufoaInstVisModel: VisModel, newEIs) {
  newEIs.forEach(ei => {
    const gis: Array<GeneralisationInst> = ufoaInstModel.getGIsWithSub(ei, machine.getGInsts());
    gis.forEach(gi => {
      const gSet: GSet = ufoaInstModel.getGSet(gi, ufoaDB);
      if (gSet.g_meta === "disjoint" || gSet.g_meta === "disjoint-complete") {
        const siblings = ufoaInstModel.getSiblings(ei, machine.getEntityInsts(), ufoaDB.getGeneralisations(), gSet);
        siblings.forEach(ei => removeEntityInst(machine, ufoaInstVisModel, ei));
      }
    });
  });
}


async function processAddOperations(machine: any, ufoaInstVisModel: VisModel, ufoaInstNetwork: any, eventB: UfobEvent) {
  try {
    const addOps = eventB.ev_add_ops;
    const newEIs = addOps.reduce(
      (acc, op) => R.concat(acc, addOp2EntityInsts(machine, eventB, op)),
      []
    );
    machine.addEntityInsts(newEIs);
    ufoaInstDiagram.addEntityInsts(ufoaInstVisModel, newEIs);
    await addGInsts(machine, ufoaInstVisModel, newEIs, []);
    await addGInsts(machine, ufoaInstVisModel, machine.getEntityInsts(), machine.getGInsts());
    await addAssocsInsts(machine, ufoaInstVisModel, newEIs, []);
    await addAssocsInsts(machine, ufoaInstVisModel, machine.getEntityInsts(), machine.getAInsts());
    pruneDisjointGSs(machine, ufoaInstVisModel, newEIs);
    ufoaInstNetwork.fit({ 
      nodes: newEIs.map(ei => eiId(ei)),
      animation: true
    });
  } catch (err) {
    panels.displayError(err);
    console.error(err);
    machine.invalidate();
  }
}

function removeEntityInst(machine: any, ufoaInstVisModel: VisModel, ei: EntityInst) {
  removeGIsOf(machine, ufoaInstVisModel, ei);
  removeAIsOf(machine, ufoaInstVisModel, ei);
  machine.removeEntityInst(ei);
  ufoaInstVisModel.nodes.remove(eiId(ei));
}

function removeGIsOf(machine: any, ufoaInstVisModel: VisModel, ei: EntityInst) {
  const insts = machine.getEntityInsts();
  const gis = machine.getGInsts().filter(gi => {
    const supi = ufoaInstModel.getSupEntityInst(insts, gi);
    const subi = ufoaInstModel.getSubEntityInst(insts, gi);
    return eiId(supi) === eiId(ei) || eiId(subi) === eiId(ei);
  });
  gis.forEach(gi => {
    machine.removeGInst(gi);
    ufoaInstVisModel.edges.remove(gi.gi_id);
  });
}

function removeAIsOf(machine: any, ufoaInstVisModel: VisModel, ei: EntityInst) {
  const insts = machine.getEntityInsts();
  const ais = machine.getAInsts().filter(ai => {
    const ei1 = ufoaInstModel.getE1EntityInst(insts, ai);
    const ei2 = ufoaInstModel.getE2EntityInst(insts, ai);
    return eiId(ei1) === eiId(ei) || eiId(ei2) === eiId(ei);
  });
  ais.forEach(ai => {
    machine.removeAInst(ai);
    ufoaInstVisModel.edges.remove(ai.ai_id);
  });
}

function processRemoveOperations(machine: any, ufoaInstVisModel: VisModel, eventB: UfobEvent) {
  const removeOps = eventB.ev_remove_ops;
}

function markVisited(ufobVisModel: VisModel, eventB: UfobEvent) {
  ufobVisModel.nodes.update({ id: eventB.ev_id, color: "#e6de17" });
  ufobVisModel.nodes.update({ id: eventB.ev_to_situation_id, color: "#e6de17" });
}

export function doStep(machine: any, ufobVisModel: VisModel, ufoaInstVisModel: VisModel, ufoaInstNetwork: any, evId: Id) {
  if (!machine.isValid()) {
    panels.displayError("Simulation crashed, please restart it");
  } else {
    const eventB = ufobDB.getUfobEventById(evId);
    if (!eventB) {
      console.error(`UFO-B model inconsistency: Event id=${evId} missing in DB, but present in the diagram`);
    } else {
      processRemoveOperations(machine, ufoaInstVisModel, eventB);
      processAddOperations(machine, ufoaInstVisModel, ufoaInstNetwork, eventB);
      markVisited(ufobVisModel, eventB);
    }
  }
}

