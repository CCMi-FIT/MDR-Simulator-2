// @flow

import * as R from 'ramda';
import type { Id } from '../../metamodel';
import type { VisModel } from '../../diagram';
import * as machine from '../machine';
import type { UfobEvent, AddEntityInstOp } from '../../ufob/metamodel';
import type { EntityInst, GeneralisationInst } from '../../ufoa-inst/metamodel';
import { eiId, eiLabel } from '../../ufoa-inst/metamodel';
import * as ufoaInstModel from '../../ufoa-inst/model';
import * as ufoaInstDiagram from '../../ufoa-inst/view/diagram';
import * as ufoaDB from '../../ufoa/db';
import * as ufobDB from '../../ufob/db';
import * as panels from '../../panels';
import * as newEntityInstModal from './dialogs/newEntityInstModal';
import * as chooseEntityInstModal from './dialogs/chooseEntityInstModal';

function addOp2EntityInstPmFn(eventB: UfobEvent, op: AddEntityInstOp): () => Promise<EntityInst> {
  return (() => {
    const entity = ufoaDB.getEntity(op.opa_e_id);
    if (op.opa_ei_is_default) {
      if (!machine.checkSingleDefault(entity)) {
        return Promise.reject(`Simulation error: There is already a default instance of entity "${entity.e_name}", please correct the Behaviour Model.<br>`);
      } else {
        return Promise.resolve(ufoaInstModel.newEntityInst(entity, ""));
      }
    } else {
      return newEntityInstModal.renderPm(machine.getEntityInsts(), entity);
    }
  });
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

function selectGisPmFn(giChoicesSet: Array<GeneralisationInst>): () => Promise<GeneralisationInst> {
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

async function addGInsts(ufoaInstVisModel: VisModel) {
  const newGIs = machine.getMissingGIs();
  const gisChoicesSets = machine.getSupChoiceSets(newGIs);
  const gisChoicesArrays: Array<Array<GeneralisationInst>> = R.values(gisChoicesSets);
  const gisSelectionsPmFns = gisChoicesArrays.map(selectGisPmFn);
  let gisSelections: any = await sequence(gisSelectionsPmFns);
  const gisChoices = R.flatten((gisChoicesArrays: any)); 
  const gisNotSelected = R.difference(gisChoices, gisSelections);
  const finalGIs = R.difference(newGIs, gisNotSelected);
  machine.addGInsts(finalGIs);
  ufoaInstDiagram.addGInsts(ufoaInstVisModel, finalGIs);
}

async function addAssocsInsts(ufoaInstVisModel: VisModel) {
  const newAIs = machine.getMissingAIs();
  const finalAIs = newAIs;
  machine.addAInsts(finalAIs);
  ufoaInstDiagram.addAInsts(ufoaInstVisModel, finalAIs);
}

async function processAddOperations(ufoaInstVisModel: VisModel, ufoaInstNetwork: any, eventB: UfobEvent) {
  try {
    const addOps = eventB.ev_add_ops;
    const newEIsPmFns = addOps.map(op => addOp2EntityInstPmFn(eventB, op));
    let newEIs = await sequence(newEIsPmFns);
    machine.addEntityInsts(newEIs);
    ufoaInstDiagram.addEntityInsts(ufoaInstVisModel, newEIs);
    await addGInsts(ufoaInstVisModel);
    await addAssocsInsts(ufoaInstVisModel);
    ufoaInstNetwork.fit({ 
      nodes: newEIs.map(ei => eiId(ei)),
      animation: true
    });
  } catch (err) {
    panels.displayError(err);
    machine.invalidate();
  }
}

function processRemoveOperations(ufoaInstVisModel: VisModel, eventB: UfobEvent) {
  const removeOps = eventB.ev_remove_ops;
}

function markVisited(ufobVisModel: VisModel, eventB: UfobEvent) {
  ufobVisModel.nodes.update({ id: eventB.ev_id, color: "#e6de17" });
  ufobVisModel.nodes.update({ id: eventB.ev_to_situation_id, color: "#e6de17" });
}

export function doStep(ufobVisModel: VisModel, ufoaInstVisModel: VisModel, ufoaInstNetwork: any, evId: Id) {
  const eventB = ufobDB.getUfobEventById(evId);
  if (!eventB) {
    console.error(`UFO-B model inconsistency: Event id=${evId} missing in DB, but present in the diagram`);
  } else {
    processRemoveOperations(ufoaInstVisModel, eventB);
    processAddOperations(ufoaInstVisModel, ufoaInstNetwork, eventB);
    markVisited(ufobVisModel, eventB);
  }
}

