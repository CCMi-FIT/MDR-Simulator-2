//@flow

import type { UfobEvent } from "../ufob/metamodel";
import type { EntityInst, GeneralisationInst, AssocInst } from "../ufoa-inst/metamodel";

export type SimulationState = {
  sim_events: Array<UfobEvent>,
  sim_ufoaInsts: Array<EntityInst>,
  sim_genInsts: Array<GeneralisationInst>,
  sim_assocInsts: Array<AssocInst>
};

export const initState: SimulationState = {
  sim_events: [],
  sim_ufoaInsts: [],
  sim_genInsts: [],
  sim_assocInsts: []
};
