// @flow

import * as R from 'ramda';
import type { EventB, UfobModel } from '../metamodel/ufob';
import * as ufobMeta from "../metamodel/ufob";

export function getEventById(model: UfobModel, ev_id: Id): ?EventB {
  return model.events.find(ev => ev.ev_id === ev_id);
}
