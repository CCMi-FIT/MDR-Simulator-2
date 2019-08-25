import * as _ from "lodash";
import { Id } from "../../metamodel";
import { UfoaInstVisModel } from "../../ufoa-inst/view/diagram";
import { GSet } from "../../ufoa/metamodel";
import { UfobEvent, AddEntityInstOp } from "../../ufob/metamodel";
import { UfobVisModel, UfobVisNode } from "../../ufob/view/diagram";
import { EntityInst, GeneralisationInst, AssocInst, eiId, eiLabel } from "../../ufoa-inst/metamodel";
import * as ufoaInstModel from "../../ufoa-inst/model";
import * as ufoaInstDiagram from "../../ufoa-inst/view/diagram";
import * as ufoaDB from "../../ufoa/db";
import * as ufobDB from "../../ufob/db";
import * as panels from "../../panels";
import * as chooseEntityInstModal from "./dialogs/chooseEntityInstModal";

const unvisitedCol = "#97C2FC";
const visitedEvCol = "#f7ef4f";
const visitedSCol = "#b5ec17";

function addOp2EntityInsts(machine: any, eventB: UfobEvent, op: AddEntityInstOp): EntityInst[] {
  const entity = ufoaDB.getEntity(op.opa_e_id);
  if (op.opa_insts_names.length === 0) { // default instance
    if (!machine.checkSingleDefault(entity)) {
      throw(new Error(`Simulation error: There is already a default instance of entity "${entity.e_name}", please correct the Behaviour Model.`));
    } else {
      return [ufoaInstModel.newEntityInst(entity, "")];
    }
  } else { // explicit names present
    const names = op.opa_insts_names;
    const indexedName = names.find((name1) => name1.includes("#"));
    if (indexedName) {
      const index = machine.getInstNameIndex(indexedName);
      const nameWithIndex = indexedName.replace("#", index.toString());
      const remainingNames = names.filter((name1) => name1 !== indexedName);
      const allNames = [ ...remainingNames, nameWithIndex ];
      return allNames.map((name1) => ufoaInstModel.newEntityInst(entity, name1));
    } else {
      return names.map((name1) => ufoaInstModel.newEntityInst(entity, name1));
    }
  }
}

function sequence(tasks: (() => Promise<any>)[], parameters = [], context = null) {
  return new Promise((resolve, reject) => {
    if (tasks.length === 0) {
      resolve([]);
    } else {
      let nextTask = tasks.splice(0, 1)[0].apply(context, parameters[0]); //Dequeue and call the first task
      let output = new Array(tasks.length + 1);
      let errorFlag = false;
      tasks.forEach((task, index) => {
        nextTask = nextTask.then((r) => {
          output[index] = r;
          return task.apply(context, parameters[index + 1]);
        }, (e) => {
          output[index] = e;
          errorFlag = true;
          return task.apply(context, parameters[index + 1]);
        });
      });
      // Last task
      nextTask.then((r) => {
        output[output.length - 1] = r;
        if (errorFlag) { reject(output); } else { resolve(output); }
      })
        .catch((e) => {
          output[output.length - 1] = e;
          reject(output);
        });
    }
  });
}

function selectGisPmFn(machine: any, giChoicesSet: GeneralisationInst[]): () => Promise<GeneralisationInst> {
  return (() => {
    try {
      const instsChoices = giChoicesSet.map((gi) => machine.getSupEntityInst(gi));
      const supInst = machine.getSupEntityInst(giChoicesSet[0]);
      const subInst = machine.getSubEntityInst(giChoicesSet[0]);
      const entity = ufoaInstModel.getEntityOfInst(supInst, ufoaDB);
      return chooseEntityInstModal.renderPm(instsChoices, entity, `as the supertype of ${eiLabel(subInst, ufoaDB)}`).then(
        (chosenInst: EntityInst) => {
          const chosenGI: GeneralisationInst | undefined = giChoicesSet.find((gi) => _.isEqual(eiId(chosenInst), gi.gi_sup_ei_id));
          if (!chosenGI) {
            console.error(new Error(`Something is wrong: chosenInst was not found in the original set`));
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

async function addGInsts(machine: any, ufoaInstVisModel: UfoaInstVisModel, insts: EntityInst[], presentGIs: GeneralisationInst[]) {
  const newGIs = machine.getMissingGIs(insts, presentGIs);
  const gisChoicesSets = machine.getSupChoiceSets(newGIs);
  const gisChoicesArrays: GeneralisationInst[][] = _.values(gisChoicesSets);
  const gisSelectionsPmFns = gisChoicesArrays.map((fn) => selectGisPmFn(machine, fn));
  const gisSelections: any = await sequence(gisSelectionsPmFns);
  const gisChoices = _.flattenDeep(gisChoicesArrays);
  const gisNotSelected = _.difference(gisChoices, gisSelections);
  const finalGIs = _.difference(newGIs, gisNotSelected);
  machine.addGInsts(finalGIs);
  ufoaInstDiagram.addGInsts(ufoaInstVisModel, finalGIs);
}

async function addAssocsInsts(machine: any, ufoaInstVisModel: UfoaInstVisModel, insts: EntityInst[], presentAIs: AssocInst[]) {
  const newAIs = machine.getMissingAIs(insts, presentAIs);
  const finalAIs = newAIs;
  machine.addAInsts(finalAIs);
  ufoaInstDiagram.addAInsts(ufoaInstVisModel, finalAIs);
}

function pruneDisjointGSs(machine: any, ufoaInstVisModel: UfoaInstVisModel, newEIs: EntityInst[]) {
  newEIs.forEach((ei) => {
    const gis: GeneralisationInst[] = ufoaInstModel.getGIsWithSub(ei, machine.getGInsts());
    gis.forEach((gi) => {
      const gSet: GSet = ufoaInstModel.getGSet(gi, ufoaDB);
      if (gSet.g_meta === "disjoint" || gSet.g_meta === "disjoint-complete") {
        const siblings = ufoaInstModel.getSiblings(ei, machine.getEntityInsts(), machine.getGInsts(), ufoaDB.getGeneralisations(), gSet, gi.gi_sup_ei_id);
        siblings.forEach((ei1) => removeEntityInst(machine, ufoaInstVisModel, ei1));
      }
    });
  });
}

async function processAddOperations(machine: any, ufoaInstVisModel: UfoaInstVisModel, ufoaInstNetwork: any, eventB: UfobEvent) {
  try {
    const addOps: AddEntityInstOp[] = eventB.ev_add_ops;
    const newEIs: EntityInst[] = addOps.reduce(
      (acc: EntityInst[], op: AddEntityInstOp) => ([ ...acc, ...addOp2EntityInsts(machine, eventB, op) ]),
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
      nodes: newEIs.map((ei: EntityInst) => eiId(ei)),
      animation: true
    });
  } catch (err) {
    panels.displayError(err);
    console.error(new Error(err));
    machine.invalidate();
  }
}

function removeEntityInst(machine: any, ufoaInstVisModel: UfoaInstVisModel, ei: EntityInst) {
  removeGIsOf(machine, ufoaInstVisModel, ei);
  removeAIsOf(machine, ufoaInstVisModel, ei);
  machine.removeEntityInst(ei);
  ufoaInstVisModel.nodes.remove(eiId(ei));
}

function removeGIsOf(machine: any, ufoaInstVisModel: UfoaInstVisModel, ei: EntityInst) {
  const insts: EntityInst[] = machine.getEntityInsts();
  const gis: GeneralisationInst[] = machine.getGInsts().filter((gi: GeneralisationInst) => {
    const supi: EntityInst = ufoaInstModel.getSupEntityInst(insts, gi);
    const subi: EntityInst = ufoaInstModel.getSubEntityInst(insts, gi);
    return eiId(supi) === eiId(ei) || eiId(subi) === eiId(ei);
  });
  gis.forEach((gi: GeneralisationInst) => {
    machine.removeGInst(gi);
    ufoaInstVisModel.edges.remove(gi.gi_id);
  });
}

function removeAIsOf(machine: any, ufoaInstVisModel: UfoaInstVisModel, ei: EntityInst) {
  const insts: EntityInst[] = machine.getEntityInsts();
  const ais: AssocInst[] = machine.getAInsts().filter((ai: AssocInst) => {
    const ei1: EntityInst = ufoaInstModel.getE1EntityInst(insts, ai);
    const ei2: EntityInst = ufoaInstModel.getE2EntityInst(insts, ai);
    return eiId(ei1) === eiId(ei) || eiId(ei2) === eiId(ei);
  });
  ais.forEach((ai: AssocInst) => {
    machine.removeAInst(ai);
    ufoaInstVisModel.edges.remove(ai.ai_id);
  });
}

function processRemoveOperations(machine: any, ufoaInstVisModel: UfoaInstVisModel, eventB: UfobEvent) {
  const removeOps = eventB.ev_remove_ops;
}

export function colorise(ufobVisModel: UfobVisModel, machine: any) {
  const nodes: UfobVisNode[] = ufobVisModel.nodes.get();
  nodes.forEach((n: UfobVisNode) => {
    switch (n.type) {
      case "event":
        if (machine.getFiredEventsIds().includes(n.id)) {
          ufobVisModel.nodes.update({ id: n.id, color: visitedEvCol });
        } else {
          ufobVisModel.nodes.update({ id: n.id, color: unvisitedCol });
        }
        break;
      case "situation":
        if (machine.getPastSituationsIds().includes(n.id)) {
          ufobVisModel.nodes.update({ id: n.id, color: visitedSCol });
        } else {
          ufobVisModel.nodes.update({ id: n.id, color: unvisitedCol });
        }
        break;
    }
  });
}

export async function doStep(machine: any, ufobVisModel: UfobVisModel, ufoaInstVisModel: UfoaInstVisModel, ufoaInstNetwork: any, evId: Id) {
  if (!machine.isValid()) {
    panels.displayError("Simulation crashed, please restart it");
  } else {
    const eventB: UfobEvent | undefined = ufobDB.getUfobEventById(evId);
    if (!eventB) {
      console.error(new Error(`UFO-B model inconsistency: Event id=${evId} missing in DB, but present in the diagram`));
    } else {
      await processRemoveOperations(machine, ufoaInstVisModel, eventB);
      await processAddOperations(machine, ufoaInstVisModel, ufoaInstNetwork, eventB);
      await machine.commitEvent(eventB);
      await colorise(ufobVisModel, machine);
    }
  }
}
