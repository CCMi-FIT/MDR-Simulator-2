// @flow

import type { Id } from './general';

export type EntityInst = {
  ei_id: Id,
  ei_e_id: Id,
  ei_label: string
};

export type AssocInst = {
  ai_id: Id,
  ai_a_id: Id,
  ai_ei1_id: Id,
  ai_ei2_id: Id
};

export type UfoaModelInst = {
  entitiesInsts: Array<EntityInst>,
  assocsInsts: Array<AssocInst>
};
