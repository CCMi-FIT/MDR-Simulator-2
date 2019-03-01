// @flow

import type { Id } from '../metamodel';
import type { UfoaEntity } from '../ufoa/metamodel';
import type { EntityInst, GeneralisationInst } from './metamodel';
import { eiId } from './metamodel';

export function newEntityInst(entity: UfoaEntity, ei_name: string = ""): EntityInst  {
  return({
    ei_e_id: entity.e_id,
    ei_name
  });
}

export function getEntityOfInst(inst: EntityInst, ufoaDB: any): ?UfoaEntity {
  return ufoaDB.getEntity(inst.ei_e_id);
}

export function getEntityInstById(insts: Array<EntityInst>, eiId1: Id): ?EntityInst {
  return insts.find(ei => eiId(ei) === eiId1);
}

export function getSupEntityInst(insts: Array<EntityInst>, gi: GeneralisationInst): EntityInst {
  return getEntityInstById(insts, gi.gi_sup_ei_id);
}

export function getSubEntityInst(insts: Array<EntityInst>, gi: GeneralisationInst): EntityInst {
  return getEntityInstById(insts, gi.gi_sub_ei_id);
}

