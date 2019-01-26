// @flow

import type { Id } from '../metamodel';

export type EntityInst = {
  ei_e_id: Id,
  ei_name: string
};

export function eiId(ei: EntityInst): string {
  return ei.ei_e_id + '_' + ei.ei_name;
}

export function eiLabel(ei: EntityInst, ufoaDB: any): string {
  const entity = ufoaDB.getEntity(ei.ei_e_id);
  const eName = entity ? entity.e_name : '';
  return ei.ei_name + ' :' + eName;
}

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
