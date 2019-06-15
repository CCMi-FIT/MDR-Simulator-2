// @flow

import * as R from 'ramda';
import type { Id } from '../metamodel';
import type { UfoaEntity, Generalisation, GSet, Association } from '../ufoa/metamodel';
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
  return ufoaDB.getEntity(inst.ei_e_id);
}

export function getEntityInstById(insts: Array<EntityInst>, eiId1: Id): ?EntityInst {
  //console.group("getEntityInstById:");
  //console.log(insts);
  //console.log(eiId1);
  //console.log(insts.find(ei => eiId(ei) === eiId1));
  //console.groupEnd();
  return insts.find(ei => eiId(ei) === eiId1);
}

export function getInstsOfEntityId(insts: Array<EntityInst>, eId: Id): Array<EntityInst> {
  return insts.filter(ei => ei.ei_e_id === eId);
}

export function getInstsIdsOfGSet(allGInsts: Array<GeneralisationInst>, generalisations: Array<Generalisation>, gSetId: Id, supEiId: Id): Array<Id> {
  const gsOfGSet: Array<Generalisation> = generalisations.filter(g => g.g_set.g_set_id === gSetId);
  const supId = gsOfGSet[0].g_sup_e_id;
  console.assert(gsOfGSet.every(g => g.g_sup_e_id === supId));
  const gInsts = allGInsts.filter(gi1 => gi1.gi_sup_ei_id === supEiId);
  return gInsts.map(gi1 => gi1.gi_sub_ei_id);
}

// Generalisation insts {{{1

export function getSupEntityInst(insts: Array<EntityInst>, gi: GeneralisationInst): EntityInst {
  //console.trace();
  const res = getEntityInstById(insts, gi.gi_sup_ei_id);
  if (!res) {
    throw(`getSupEntityInst: Entity instance ${gi.gi_sup_ei_id} referenced in gi ${gi.gi_id} does not exist`);
  } else {
    return res;
  }
}

export function getSubEntityInst(insts: Array<EntityInst>, gi: GeneralisationInst): EntityInst {
  const res = getEntityInstById(insts, gi.gi_sub_ei_id);
  if (!res) {
    throw(`getSubEntityInst: Entity instance ${gi.gi_sub_ei_id} referenced in gi ${gi.gi_id} does not exist`);
  } else {
    return res;
  }
}

export function getGIsWithSub(inst: EntityInst, gis: Array<GeneralisationInst>): Array<GeneralisationInst> {
  return gis.filter(gi => gi.gi_sub_ei_id === eiId(inst));
}

export function getGSet(gi: GeneralisationInst, ufoaDB: any): GSet {
  const g: ?Generalisation = ufoaDB.getGeneralisation(gi.gi_g_id);
  if (!g) {
    throw(`getGSet: Generalisation ${gi.gi_g_id} does not exist`);
  } else {
    return g.g_set;
  }
}

export function getSiblings(ei: EntityInst, insts: Array<EntityInst>, gInsts: Array<GeneralisationInst>, generalisations: Array<Generalisation>, gSet: GSet, supEiId: Id): Array<EntityInst> {
  const instsInGSetIds = new Set (getInstsIdsOfGSet(gInsts, generalisations, gSet.g_set_id, supEiId));
  return insts.filter(ei1 => eiId(ei1) !== eiId(ei) && instsInGSetIds.has(eiId(ei1)));
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



