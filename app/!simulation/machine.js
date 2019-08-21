// @flow

import * as R from 'ramda';
import product from 'cartesian-product';
import type { Id } from "../metamodel";
import type { UfoaEntity, Generalisation, Association } from '../ufoa/metamodel';
import * as ufoaDB from '../ufoa/db';
import * as ufobDB from '../ufob/db';
import type { UfobEvent, Situation } from "../ufob/metamodel";
import type { UfobEventInst } from '../ufob-inst/metamodel';
import type { EntityInst, GeneralisationInst, AssocInst } from "../ufoa-inst/metamodel";
import * as ufoaInstMeta from '../ufoa-inst/metamodel';
import * as ufobInstMeta from '../ufob-inst/metamodel';
import * as ufoaInstModel from '../ufoa-inst/model';
import * as rules from './rules';

type Snapshot = {
  sn_evInst: UfobEventInst,
  sn_situation: Situation,
  sn_eis: Array<EntityInst>,
  sn_gis: Array<GeneralisationInst>,
  sn_ais: Array<AssocInst>
};

type SimulationState = {
  sim_snapshots: Array<Snapshot>,
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
    sim_snapshots: [],
    sim_currentEventIdx: -1,
    sim_instsIndexDict: {},
    sim_eis: [],
    sim_gis: [],
    sim_ais: [],
  };
  simError = false;
}

// Accessing {{{1

export function getFiredEventsInsts(): Array<UfobEventInst> {
  return simState.sim_snapshots.map(sn => sn.sn_evInst);
}

export function getFiredEvents(): Array<UfobEvent> {
  const firedEvs = getFiredEventsInsts().map(evi => ufobDB.getUfobEventById(evi.evi_ev_id));
  if (firedEvs.includes(null)) {
    console.error(new Error("getFiredEvents: non-existent event in an instance");
    return [];
  } else {
    // $FlowFixMe
    return firedEvs;
  }
}

export function getFiredEventsIds(): Array<Id> {
  return getFiredEvents().map(ev => ev.ev_id);
}

export function getPastSituations(): Array<Situation> {
  return simState.sim_snapshots.map(sn => sn.sn_situation);

 }

export function getPastSituationsIds(): Array<Id> {
  return getPastSituations().map(s => s.s_id);
}

export function getCurrentEvent(): UfobEvent {
  const evId = simState.sim_snapshots[simState.sim_currentEventIdx].sn_evInst.evi_ev_id;
  const ev = ufobDB.getUfobEventById(evId);
  if (!ev) {
    throw(`getCurrentEvent: event id=${evId} does not exist`);
  } else {
    return ev;
  }
}

export function getLastEvent(): ?UfobEvent {
  return R.last(getFiredEvents());
}

export function getLastSituation(): ?Situation {
  const lEv = getLastEvent();
  if (!lEv) {
    return null;
  } else {
    const sId = lEv.ev_to_situation_id;
    const s = ufobDB.getSituationById(sId);
    if (!s) {
      throw(`getLastSituation: situation id=${sId} does not exist`);
    } else {
      return s;
    }
  }
}

export function getCurrentSituation(): Situation {
  return simState.sim_snapshots[simState.sim_currentEventIdx].sn_situation;
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

export function isInPresent(): boolean {
  return simState.sim_currentEventIdx === simState.sim_snapshots.length - 1;
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

export function commitEvent(ev: UfobEvent) {
  const evi = ufobInstMeta.newEventInst("evi_" + simState.sim_snapshots.length.toString(), ev.ev_id);
  const s = ufobDB.getSituationById(ev.ev_to_situation_id);
  if (!s) {
    throw(`commitEvent: situation id=${ev.ev_to_situation_id} referenced from event id=${ev.ev_id} does not exist.`);
  } else {
    const snapshot: Snapshot = {
      sn_evInst: evi,
      sn_situation: s,
      sn_eis: simState.sim_eis,
      sn_gis: simState.sim_gis,
      sn_ais: simState.sim_ais
    };
    simState.sim_snapshots.push(snapshot);
    simState.sim_currentEventIdx = simState.sim_snapshots.length - 1;
  }
}

// Switches currentEventIdx to the specified Snapshot based on the given Situation
export function switchCurrentSituation(situation: Situation) {
  const idx = simState.sim_snapshots.findIndex(sn => sn.sn_situation.s_id === situation.s_id);
  if (idx < 0) {
    console.error(new Error(`switchCurrentSituation: s_id=${situation.s_id} not present in timeline`);
  } else {
    simState.sim_eis = R.clone(simState.sim_snapshots[idx].sn_eis);
    simState.sim_ais = R.clone(simState.sim_snapshots[idx].sn_ais);
    simState.sim_gis = R.clone(simState.sim_snapshots[idx].sn_gis);
    simState.sim_currentEventIdx = idx;
  }
}

// Cuts off all events after lastEventIdx and returnes the cut Event insts
export function moveToCurrent(): Array<UfobEventInst> {
  const splitted = R.splitAt(simState.sim_currentEventIdx + 1, simState.sim_snapshots);
  simState.sim_snapshots = splitted[0];
  return splitted[1].map(sn => sn.sn_evInst);
}


