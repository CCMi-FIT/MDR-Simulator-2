// @flow

import type { Id } from './general';

export type EntityInst = {
  ei_id: Id,
  ei_e_id: Id,
  ei_label: string
};

export type GeneralisationInst = {
  gi_id: Id,
  gi_g_id: Id,
  gi_sup_ei_id: Id,
  gi_sub_ei_id: Id
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
