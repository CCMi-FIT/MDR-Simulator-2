import * as _ from "lodash";
import { Id } from "../metamodel";
import { UfoaEntity, Generalisation, Association } from "../ufoa/metamodel";
import * as ufoaDB from "../ufoa/db";
import * as ufobDB from "../ufob/db";
import { UfobEvent, Situation } from "../ufob/metamodel";
import { UfobEventInst } from "../ufob-inst/metamodel";
import { EntityInst, GeneralisationInst, AssocInst } from "../ufoa-inst/metamodel";
import * as ufoaInstMeta from "../ufoa-inst/metamodel";
import * as ufobInstMeta from "../ufob-inst/metamodel";
import * as ufoaInstModel from "../ufoa-inst/model";
import * as rules from "./rules";

interface Snapshot {
  sn_evInst: UfobEventInst;
  sn_situation: Situation;
  sn_eis: EntityInst[];
  sn_gis: GeneralisationInst[];
  sn_ais: AssocInst[];
}

interface SimulationState {
  sim_snapshots: Snapshot[];
  sim_currentEventIdx: number;
  sim_instsIndexDict: { [key: string]: number };
  sim_eis: EntityInst[];
  sim_gis: GeneralisationInst[];
  sim_ais: AssocInst[];
}

var simState: SimulationState;
var simError: boolean;

// Cartesian
const product = (...args: any[]) => args.reduce((a, b) => (
    _.flatten(
      a.map((x: any) => b.map((y: any) => x.concat([y]))))
    )
  , [[]]
)

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
export function getFiredEventsInsts(): UfobEventInst[] {
  return simState.sim_snapshots.map((sn) => sn.sn_evInst);
}

export function getFiredEvents(): UfobEvent[] {
  return getFiredEventsInsts().reduce(
    (res: UfobEvent[], evi: UfobEventInst) => {
      const mev = ufobDB.getUfobEventById(evi.evi_ev_id);
      if (mev) {
	return [ ...res, mev ];
      } else {
	console.error(new Error("getFiredEvents: non-existent event in an instance"));
	return res;
      }
    },
    []
  );
}

export function getFiredEventsIds(): Id[] {
  return getFiredEvents().map((ev) => ev.ev_id);
}

export function getPastSituations(): Situation[] {
  return simState.sim_snapshots.map((sn) => sn.sn_situation);

 }

export function getPastSituationsIds(): Id[] {
  return getPastSituations().map((s) => s.s_id);
}

export function getCurrentEvent(): UfobEvent {
  const evId = simState.sim_snapshots[simState.sim_currentEventIdx].sn_evInst.evi_ev_id;
  const ev = ufobDB.getUfobEventById(evId);
  if (!ev) {
    throw(new Error(`getCurrentEvent: event id=${evId} does not exist`));
  } else {
    return ev;
  }
}

export function getLastEvent(): UfobEvent | undefined {
  return _.last(getFiredEvents());
}

export function getLastSituation(): Situation | null {
  const lEv = getLastEvent();
  if (!lEv) {
    return null;
  } else {
    const sId = lEv.ev_to_situation_id;
    const s = ufobDB.getSituationById(sId);
    if (!s) {
      throw(new Error(`getLastSituation: situation id=${sId} does not exist`));
    } else {
      return s;
    }
  }
}

export function getCurrentSituation(): Situation {
  return simState.sim_snapshots[simState.sim_currentEventIdx].sn_situation;
}

export function getEntityInsts(): EntityInst[] {
  return simState.sim_eis;
}

export function getGInsts(): GeneralisationInst[] {
  return simState.sim_gis;
}

export function getAInsts(): AssocInst[] {
  return simState.sim_ais;
}

export function getEntityInstById(eiId: Id): EntityInst | undefined {
  return ufoaInstModel.getEntityInstById(getEntityInsts(), eiId);
}

export function getEntityInstsOf(eId: Id): EntityInst[] {
  return getEntityInsts().filter((ei) => ei.ei_e_id === eId);
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
  return !simState.sim_eis.find((ei) => ei.ei_e_id === entity.e_id);
}

export function isValid(): boolean {
  return !simError;
}

export function isInPresent(): boolean {
  return simState.sim_currentEventIdx === simState.sim_snapshots.length - 1;
}

export function getMissingGIs(insts: EntityInst[], presentGIs: GeneralisationInst[]): GeneralisationInst[] {
  const allGIs = ufoaDB.getGeneralisations().reduce(
    (resGIs: GeneralisationInst[], g: Generalisation) => {
      const supInsts = insts.filter((ei) => ei.ei_e_id === g.g_sup_e_id);
      const subInsts = insts.filter((ei) => ei.ei_e_id === g.g_sub_e_id);
      const cartesian: EntityInst[][] = product(supInsts, subInsts);
      const gisPossible = cartesian.map(([supInst, subInst]) => ufoaInstMeta.newGenInst(g, supInst, subInst));
      const gis = gisPossible.filter((gi) => rules.checkGIrules(insts, presentGIs, gi));
      return resGIs.concat(gis);
    },
    []
  );
  return _.difference(allGIs, presentGIs);
}

export function getMissingAIs(insts: EntityInst[], presentAIs: AssocInst[]): AssocInst[] {
  const allAIs = ufoaDB.getAssociations().reduce(
    (resAIs: AssocInst[], a: Association) => {
      const e1Insts = insts.filter((ei) => ei.ei_e_id === a.a_connection1.e_id);
      const e2Insts = insts.filter((ei) => ei.ei_e_id === a.a_connection2.e_id);
      const cartesian = product(e1Insts, e2Insts);
      const aisPossible: AssocInst[] = cartesian.map(
	([e1Inst, e2Inst]: [EntityInst, EntityInst]) => ufoaInstMeta.newAssocInst(a, e1Inst, e2Inst)
      );
      const ais = aisPossible.filter((ai: AssocInst) => rules.checkAIrules(insts, presentAIs, ai));
      return resAIs.concat(ais);
    },
    []
  );
  return _.difference(allAIs, presentAIs);
}

export type GIChoiceSets = EntityInst[][];

interface SupDict {
  [key: string]: GeneralisationInst[];
}

export function getSupChoiceSets(gis: GeneralisationInst[]): SupDict {
  const outgoingDict: SupDict = gis.reduce(
    (outgoingDict1: SupDict, gi: GeneralisationInst) => {
      const subiId: Id = gi.gi_sub_ei_id;
      if (subiId in outgoingDict1) {
        outgoingDict1[subiId] = [ ...outgoingDict1[subiId], gi ];
        return outgoingDict1;
      } else {
        outgoingDict1[subiId] = [gi];
        return outgoingDict1;
      }
    },
    {}
  );
  // return just those items where length > 1
  return _.keys(outgoingDict).reduce(
    (res: SupDict, key: Id) => {
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
export function setEntityInsts(eis: EntityInst[]): string[] {
  simState.sim_eis = [];
  return addEntityInsts(eis);
}

export function addEntityInsts(eis: EntityInst[]): string[] {
  const msgs: string[] = [];
  simState.sim_eis = simState.sim_eis.concat(eis);
  if (msgs.length > 0) {
    simError = true;
  }
  return msgs;
}

export function addGInsts(gis: GeneralisationInst[]): string[] {
  const msgs: string[] = [];
  simState.sim_gis = simState.sim_gis.concat(gis);
  if (msgs.length > 0) {
    simError = true;
  }
  return msgs;
}

export function addAInsts(ais: AssocInst[]): string[] {
  const msgs: string[] = [];
  simState.sim_ais = simState.sim_ais.concat(ais);
  if (msgs.length > 0) {
    simError = true;
  }
  return msgs;
}

export function removeEntityInst(ei: EntityInst) {
  simState.sim_eis = getEntityInsts().filter((ei1) => ufoaInstMeta.eiId(ei1) !== ufoaInstMeta.eiId(ei));
}

export function removeGInst(gi: GeneralisationInst) {
  simState.sim_gis = getGInsts().filter((gi1) => gi1.gi_id !== gi.gi_id);
}

export function removeAInst(ai: AssocInst) {
  simState.sim_ais = getAInsts().filter((ai1) => ai1.ai_id !== ai.ai_id);
}

export function invalidate() {
  simError = true;
}

export function commitEvent(ev: UfobEvent) {
  const evi = ufobInstMeta.newEventInst("evi_" + simState.sim_snapshots.length.toString(), ev.ev_id);
  const s = ufobDB.getSituationById(ev.ev_to_situation_id);
  if (!s) {
    throw(new Error(`commitEvent: situation id=${ev.ev_to_situation_id} referenced from event id=${ev.ev_id} does not exist.`));
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
  const idx = simState.sim_snapshots.findIndex((sn) => sn.sn_situation.s_id === situation.s_id);
  if (idx < 0) {
    console.error(new Error(`switchCurrentSituation: s_id=${situation.s_id} not present in timeline`));
  } else {
    simState.sim_eis = _.clone(simState.sim_snapshots[idx].sn_eis);
    simState.sim_ais = _.clone(simState.sim_snapshots[idx].sn_ais);
    simState.sim_gis = _.clone(simState.sim_snapshots[idx].sn_gis);
    simState.sim_currentEventIdx = idx;
  }
}

// Cuts off all events after lastEventIdx and returnes the cut Event insts
export function moveToCurrent(): UfobEventInst[] {
  const l = simState.sim_snapshots.length;
  const i = simState.sim_currentEventIdx;
  const dropped = _.takeRight(simState.sim_snapshots, l - i);
  simState.sim_snapshots = _.dropRight(simState.sim_snapshots, l - i);
  return dropped.map((sn) => sn.sn_evInst);
}
