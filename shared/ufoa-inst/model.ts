import { Id } from "../metamodel";
import { UfoaEntity, Generalisation, GSet, Association } from "../ufoa/metamodel";
import { EntityInst, GeneralisationInst, AssocInst } from "./metamodel";
import { eiId } from "./metamodel";

// Entity insts {{{1
export function newEntityInst(entity: UfoaEntity, eiName: string = ""): EntityInst  {
  return({
    ei_e_id: entity.e_id,
    ei_name: eiName
  });
}

export function getEntityOfInst(inst: EntityInst, ufoaDB: any): UfoaEntity {
  return ufoaDB.getEntity(inst.ei_e_id);
}

export function getEntityInstById(insts: EntityInst[], eiId1: Id): EntityInst | undefined {
  return insts.find((ei: EntityInst) => eiId(ei) === eiId1);
}

export function getInstsOfEntityId(insts: EntityInst[], eId: Id): EntityInst[] {
  return insts.filter((ei: EntityInst) => ei.ei_e_id === eId);
}

export function getInstsIdsOfGSet(allGInsts: GeneralisationInst[], generalisations: Generalisation[], gSetId: Id, supEiId: Id): Id[] {
  const gsOfGSet: Generalisation[] = generalisations.filter((g: Generalisation) => g.g_set.g_set_id === gSetId);
  const supId: Id = gsOfGSet[0].g_sup_e_id;
  console.assert(gsOfGSet.every((g: Generalisation) => g.g_sup_e_id === supId));
  const gInsts = allGInsts.filter((gi1: GeneralisationInst) => gi1.gi_sup_ei_id === supEiId);
  return gInsts.map((gi1: GeneralisationInst) => gi1.gi_sub_ei_id);
}

// Generalisation insts {{{1

export function getSupEntityInst(insts: EntityInst[], gi: GeneralisationInst): EntityInst {
  //console.trace();
  const res = getEntityInstById(insts, gi.gi_sup_ei_id);
  if (!res) {
    throw(new Error(`getSupEntityInst: Entity instance ${gi.gi_sup_ei_id} referenced in gi ${gi.gi_id} does not exist`));
  } else {
    return res;
  }
}

export function getSubEntityInst(insts: EntityInst[], gi: GeneralisationInst): EntityInst {
  const res = getEntityInstById(insts, gi.gi_sub_ei_id);
  if (!res) {
    throw(new Error(`getSubEntityInst: Entity instance ${gi.gi_sub_ei_id} referenced in gi ${gi.gi_id} does not exist`));
  } else {
    return res;
  }
}

export function getGIsWithSub(inst: EntityInst, gis: GeneralisationInst[]): GeneralisationInst[] {
  return gis.filter((gi) => gi.gi_sub_ei_id === eiId(inst));
}

export function getGSet(gi: GeneralisationInst, ufoaDB: any): GSet {
  const g: Generalisation | null = ufoaDB.getGeneralisation(gi.gi_g_id);
  if (!g) {
    throw(new Error(`getGSet: Generalisation ${gi.gi_g_id} does not exist`));
  } else {
    return g.g_set;
  }
}

export function getSiblings(ei: EntityInst, insts: EntityInst[], gInsts: GeneralisationInst[], generalisations: Generalisation[], gSet: GSet, supEiId: Id): EntityInst[] {
  const instsInGSetIds = new Set (getInstsIdsOfGSet(gInsts, generalisations, gSet.g_set_id, supEiId));
  return insts.filter((ei1) => eiId(ei1) !== eiId(ei) && instsInGSetIds.has(eiId(ei1)));
}

// Associdation insts {{{1
export function getAssocOfInst(ai: AssocInst, ufoaDB: any): Association {
  const res = ufoaDB.getAssociation(ai.ai_a_id);
  if (!res) {
    throw(new Error(`Association instance ${ai.ai_id} instantiates entity ${ai.ai_a_id} that does not exist`));
  } else {
    return res;
  }
}

export function getE1EntityInst(insts: EntityInst[], ai: AssocInst): EntityInst {
  const res = getEntityInstById(insts, ai.ai_ei1_id);
  if (!res) {
    throw(new Error(`Entity instance ${ai.ai_ei1_id} referenced in gi ${ai.ai_id} does not exist`));
  } else {
    return res;
  }
}

export function getE2EntityInst(insts: EntityInst[], ai: AssocInst): EntityInst {
  const res = getEntityInstById(insts, ai.ai_ei2_id);
  if (!res) {
    throw(new Error(`Entity instance ${ai.ai_ei2_id} referenced in gi ${ai.ai_id} does not exist`));
  } else {
    return res;
  }
}
