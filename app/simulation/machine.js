// @flow

import * as R from 'ramda';
import product from 'cartesian-product';
import type { Id } from "../metamodel";
import type { UfoaEntity, Generalisation, Association } from '../ufoa/metamodel';
import * as ufoaDB from '../ufoa/db';
import type { UfobEvent } from "../ufob/metamodel";
import type { UfobEventInst } from '../ufob-inst/metamodel';
import type { EntityInst, GeneralisationInst, AssocInst } from "../ufoa-inst/metamodel";
import * as ufoaInstMeta from '../ufoa-inst/metamodel';
import * as ufobInstMeta from '../ufob-inst/metamodel';
import * as ufoaInstModel from '../ufoa-inst/model';
import * as rules from './rules';

type SimulationState = {
  sim_eventsInsts: Array<UfobEventInst>,
  sim_currentEventIdx: number;
  sim_instsIndexDict: { [key: string]: number },
  sim_eis: Array<EntityInst>,
  sim_gis: Array<GeneralisationInst>,
  sim_ais: Array<AssocInst>,
};

var simState: SimulationState;
var simError: boolean;

// Initialization {{{1

export function initialize() {
  simState = {
    sim_eventsInsts: [],
    sim_currentEventIdx: -1,
    sim_instsIndexDict: {},
    sim_eis: [],
    sim_gis: [],
    sim_ais: [],
  };
  simError = false;
}

// Accessing {{{1

export function getEvents(): Array<UfobEventInst> {
  return simState.sim_eventsInsts;
}

export function getEntityInsts(): Array<EntityInst> {
  return simState.sim_eis;
}

export function getGInsts(): Array<GeneralisationInst> {
  return simState.sim_gis;
}

export function getAInsts(): Array<AssocInst> {
  return simState.sim_ais;
}


export function getEntityInstById(eiId: Id): ?EntityInst {
  return ufoaInstModel.getEntityInstById(getEntityInsts(), eiId);
}

export function getEntityInstsOf(eId: Id): Array<EntityInst> {
  return getEntityInsts().filter(ei => ei.ei_e_id === eId);
}

export function getSupEntityInst(gi: GeneralisationInst): EntityInst {
  return ufoaInstModel.getSupEntityInst(getEntityInsts(), gi);
}

export function getSubEntityInst(gi: GeneralisationInst): EntityInst {
  return ufoaInstModel.getSubEntityInst(getEntityInsts(), gi);
}

// Querying {{{1

export function getInstNameIndex(instName: string): number {
  if (simState.sim_instsIndexDict[instName]) {
    const newVal = simState.sim_instsIndexDict[instName] + 1;
    simState.sim_instsIndexDict[instName] = newVal;
    return newVal;
  } else { // not present
    const newVal = 1;
    simState.sim_instsIndexDict[instName] = newVal;
    return newVal;
  }
}

export function checkSingleDefault(entity: UfoaEntity): boolean {
  return !simState.sim_eis.find(ei => ei.ei_e_id === entity.e_id);
}

export function isValid(): boolean {
  return !simError;
}

export function isCurrentEv(evi: UfobEventInst): boolean {
  return simState.sim_eventsInsts[simState.sim_currentEventIdx].evi_id === evi.evi_id;
}

export function getMissingGIs(insts: Array<EntityInst>, presentGIs: Array<GeneralisationInst>): Array<GeneralisationInst> {
  const allGIs = ufoaDB.getGeneralisations().reduce(
    (resGIs: Array<GeneralisationInst>, g: Generalisation) => {
      const supInsts = insts.filter(ei => ei.ei_e_id === g.g_sup_e_id);
      const subInsts = insts.filter(ei => ei.ei_e_id === g.g_sub_e_id);
      const cartesian = product([supInsts, subInsts]);
      const gisPossible = cartesian.map(([supInst, subInst]) => ufoaInstMeta.newGenInst(g, supInst, subInst));     
      const gis = gisPossible.filter(gi => rules.checkGIrules(insts, presentGIs, gi));
      //if (g.g_id === "g3") {
        //debugger;
      //}
      return resGIs.concat(gis);
    },
    [] 
  );
  return R.difference(allGIs, presentGIs);
}

export function getMissingAIs(insts: Array<EntityInst>, presentAIs: Array<AssocInst>): Array<AssocInst> {
  const allAIs = ufoaDB.getAssociations().reduce(
    (resAIs: Array<AssocInst>, a: Association) => {
      const e1Insts = insts.filter(ei => ei.ei_e_id === a.a_connection1.e_id);
      const e2Insts = insts.filter(ei => ei.ei_e_id === a.a_connection2.e_id);
      const cartesian = product([e1Insts, e2Insts]);
      const aisPossible = cartesian.map(([e1Inst, e2Inst]) => ufoaInstMeta.newAssocInst(a, e1Inst, e2Inst));     
      const ais = aisPossible.filter(ai => rules.checkAIrules(insts, presentAIs, ai));
      return resAIs.concat(ais);
    },
    [] 
  );
  return R.difference(allAIs, presentAIs);
}

export type GIChoiceSets = Array<Array<EntityInst>>;

export function getSupChoiceSets(gis: Array<GeneralisationInst>): any {
  let outgoingDict = gis.reduce(
    (outgoingDict, gi) => {
      const subiId = gi.gi_sub_ei_id;
      if (subiId in outgoingDict) {
        outgoingDict[subiId] = R.append(gi, outgoingDict[subiId]);
        return outgoingDict;
      } else {
        outgoingDict[subiId] = [gi];
        return outgoingDict;
      }
    },
    {}
  );
  return R.keys(outgoingDict).reduce(
    (res, key) => {
      if (outgoingDict[key].length > 1) {
        res[key] = outgoingDict[key];
        return res;
      } else {
        return res;
      }
    },
    {}
  );
}

// Operation {{{1

export function setEntityInsts(eis: Array<EntityInst>): Array<string> {
  simState.sim_eis = [];
  return addEntityInsts(eis);
}

export function addEntityInsts(eis: Array<EntityInst>): Array<string> {
  let msgs: Array<string> = [];
  simState.sim_eis = simState.sim_eis.concat(eis);
  if (msgs.length > 0) {
    simError = true;
  }
  return msgs;
}

export function addGInsts(gis: Array<GeneralisationInst>): Array<string> {
  let msgs: Array<string> = [];
  simState.sim_gis = simState.sim_gis.concat(gis);
  if (msgs.length > 0) {
    simError = true;
  }
  return msgs;
}

export function addAInsts(ais: Array<AssocInst>): Array<string> {
  let msgs: Array<string> = [];
  simState.sim_ais = simState.sim_ais.concat(ais);
  if (msgs.length > 0) {
    simError = true;
  }
  return msgs;
}

export function removeEntityInst(ei: EntityInst) {
  simState.sim_eis = getEntityInsts().filter(ei1 => ufoaInstMeta.eiId(ei1) !== ufoaInstMeta.eiId(ei));
}

export function removeGInst(gi: GeneralisationInst) {
  simState.sim_gis = getGInsts().filter(gi1 => gi1.gi_id !== gi.gi_id);
}

export function removeAInst(ai: AssocInst) {
  simState.sim_ais = getAInsts().filter(ai1 => ai1.ai_id !== ai.ai_id);
}

export function invalidate() {
  simError = true;
}

export function addEvent(ev: UfobEvent) {
  const evi = ufobInstMeta.newEventInst("evi_" + simState.sim_eventsInsts.length.toString(), ev.ev_id);
  simState.sim_eventsInsts.push(evi);
  simState.sim_currentEventIdx = simState.sim_eventsInsts.length - 1;
}

export function switchCurrent(evi: UfobEventInst) {
  const idx = simState.sim_eventsInsts.findIndex(evi1 => evi1.evi_id === evi.evi_id);
  if (idx < 0) {
    console.error(`switchCurrent: evi_id=${evi.evi_id} not present in events log`);
  } else {
    simState.sim_currentEventIdx = idx;
  }
}


