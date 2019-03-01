// @flow

import type { Id } from '../metamodel';
import type { UfoaEntity, Association } from '../ufoa/metamodel';
import type { EntityInst, GeneralisationInst, AssocInst } from './metamodel';
import { eiId } from './metamodel';

// Entity insts {{{1
export function newEntityInst(entity: UfoaEntity, ei_name: string = ""): EntityInst  {
  return({
    ei_e_id: entity.e_id,
    ei_name
  });
}

export function getEntityOfInst(inst: EntityInst, ufoaDB: any): UfoaEntity {
  const res = ufoaDB.getEntity(inst.ei_e_id);
  if (!res) {
    throw(`Entity of instance ${eiId(inst)} does not exist`);
  } else {
    return res;
  }
}

export function getEntityInstById(insts: Array<EntityInst>, eiId1: Id): ?EntityInst {
  return insts.find(ei => eiId(ei) === eiId1);
}

export function getInstsOfEntityId(insts: Array<EntityInst>, eId: Id): Array<EntityInst> {
  return insts.filter(ei => ei.ei_e_id === eId);
}

// Generalisation insts {{{1

export function getSupEntityInst(insts: Array<EntityInst>, gi: GeneralisationInst): EntityInst {
  const res = getEntityInstById(insts, gi.gi_sup_ei_id);
  if (!res) {
    throw(`Entity instance ${gi.gi_sup_ei_id} referenced in gi ${gi.gi_id} does not exist`);
  } else {
    return res;
  }
}

export function getSubEntityInst(insts: Array<EntityInst>, gi: GeneralisationInst): EntityInst {
  const res = getEntityInstById(insts, gi.gi_sub_ei_id);
  if (!res) {
    throw(`Entity instance ${gi.gi_sub_ei_id} referenced in gi ${gi.gi_id} does not exist`);
  } else {
    return res;
  }
}

// Associdation insts {{{1

export function getAssocOfInst(ai: AssocInst, ufoaDB: any): Association {
  const res = ufoaDB.getAssociation(ai.ai_a_id);
  if (!res) {
    throw(`Association instance ${ai.ai_id} instantiates entity ${ai.ai_a_id} that does not exist`);
  } else {
    return res;
  }
}

export function getE1EntityInst(insts: Array<EntityInst>, ai: AssocInst): EntityInst {
  const res = getEntityInstById(insts, ai.ai_ei1_id);
  if (!res) {
    throw(`Entity instance ${ai.ai_ei1_id} referenced in gi ${ai.ai_id} does not exist`);
  } else {
    return res;
  }
}

export function getE2EntityInst(insts: Array<EntityInst>, ai: AssocInst): EntityInst {
  const res = getEntityInstById(insts, ai.ai_ei2_id);
  if (!res) {
    throw(`Entity instance ${ai.ai_ei2_id} referenced in gi ${ai.ai_id} does not exist`);
  } else {
    return res;
  }
}



