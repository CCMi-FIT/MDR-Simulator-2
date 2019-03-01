// @flow

import type { Id } from '../metamodel';
import type { Generalisation, Association } from '../../ufoa/metamodel';

// Entity Inst {{{1

export type EntityInst = {
  ei_e_id: Id,
  ei_name: string
};

export function eiId(ei: ?EntityInst): string {
  return ei ? ei.ei_e_id + (ei.ei_name ? '_' + ei.ei_name : '') : '';
}

export function eiLabel(ei: EntityInst, ufoaDB: any): string {
  const entity = ufoaDB.getEntity(ei.ei_e_id);
  const eName = entity ? entity.e_name : '';
  return ei.ei_name + ' :' + eName;
}

// Generalisation Inst {{{1

export type GeneralisationInst = {
  gi_id: Id,
  gi_g_id: Id,
  gi_sup_ei_id: Id,
  gi_sub_ei_id: Id
};

export function newGenInst(g: Generalisation, supInst: EntityInst, subInst: EntityInst): GeneralisationInst {
  return ({
    gi_id: g.g_id + '_' + eiId(supInst) + '_' + eiId(subInst),
    gi_g_id: g.g_id,
    gi_sup_ei_id: eiId(supInst),
    gi_sub_ei_id: eiId(subInst)
  });
}

// Association Inst {{{1

export type AssocInst = {
  ai_id: Id,
  ai_a_id: Id,
  ai_ei1_id: Id,
  ai_ei2_id: Id
};

export function newAssocInst(a: Association, e1Inst: EntityInst, e2Inst: EntityInst): AssocInst {
  return ({
    ai_id: a.a_id + '_' + eiId(e1Inst) + '_' + eiId(e2Inst),
    ai_a_id: a.a_id,
    ai_ei1_id: eiId(e1Inst),
    ai_ei2_id: eiId(e2Inst)
  });
}

// ModelInst {{{1

export type UfoaModelInst = {
  entitiesInsts: Array<EntityInst>,
  assocsInsts: Array<AssocInst>
};
