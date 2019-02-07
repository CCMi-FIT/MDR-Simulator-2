//@flow

import type { Id } from "../metamodel";
import type { UfobEvent } from "../ufob/metamodel";
import type { EntityInst, GeneralisationInst, AssocInst } from "../ufoa-inst/metamodel";

export type GenInstRec = {
  gir_g_id: Id,
  gir_sup_ei_id: Id,
  gir_sub_ei_id: Id
}

export type AssocInstRec = {
  air_a_id: Id,
  air_ei1_id: Id,
  air_ei2_id: Id
}

export type SimulationState = {
  sim_events: Array<UfobEvent>,
  sim_ufoaInsts: Array<EntityInst>,
  sim_genInsts: Array<GeneralisationInst>,
  sim_assocInsts: Array<AssocInst>,
};

export const initState: SimulationState = {
  sim_events: [],
  sim_ufoaInsts: [],
  sim_genInsts: [],
  sim_assocInsts: [],
};
