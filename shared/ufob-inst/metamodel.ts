import { Id } from "../metamodel";

export interface UfobEventInst {
  evi_id: Id;
  evi_ev_id: Id;
}

export function newEventInst(eviId: Id, eviEvId: Id) {
  return ({
    evi_id: eviId,
    evi_ev_id: eviEvId
  });
}
