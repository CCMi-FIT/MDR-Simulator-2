// @flow

import type { Id } from '../metamodel';

export type UfobEventInst = {
  evi_id: Id,
  evi_ev_id: Id
};

export function newEventInst(evi_id: Id, evi_ev_id: Id) {
  return ({
    evi_id,
    evi_ev_id
  });
}
