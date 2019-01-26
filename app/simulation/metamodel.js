//@flow

import type { UfobEvent } from "../ufob/metamodel";
import type { EntityInst } from "../ufoa-inst/metamodel";

export type SimulationState = {
  sim_events: Array<UfobEvent>,
  sim_ufoaInsts: Array<EntityInst>
};

export const initState: SimulationState = {
  sim_events: [],
  sim_ufoaInsts: []
};
