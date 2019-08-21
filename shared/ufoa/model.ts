// @flow

import * as R from 'ramda';
import { Id, ValidationResult, validationResultOK, getLastIdNo } from "../metamodel";
import { UfoaEntity, Generalisation, GSet, Association, UfoaModel, validateEntity, validateGeneralisation, validateAssociation } from "./metamodel";

// Entities

export function newEntity(model: UfoaModel): UfoaEntity {
  const lastIdNo = getLastIdNo(model.entities.map((e) => e.e_id));
  const res: UfoaEntity = {
    e_id: `e${lastIdNo + 1}`,
    e_type: "kind",
    e_name: "New Entity"
  };
  model.entities.push(res);
  return res;
}

export function getEntity(model: UfoaModel, eId: Id): UfoaEntity | null {
  return model.entities.find((e) => e.e_id === eId);
}

export function updateEntity(model: UfoaModel, updatedEntity: UfoaEntity): ValidationResult {
  const validity = validateEntity(updatedEntity);
  if (validity.errors) {
    return validity;
  } else {
    const entity = getEntity(model, updatedEntity.e_id);
    if (entity) {
      Object.assign(entity, updatedEntity); // mutated existing entity in the model
    } else {
      model.entities.push(updatedEntity); // added a new one to the model
    }
    return validationResultOK;
  }
}

export function deleteEntity(model: UfoaModel, eId: Id): UfoaModel {
  const entities2 = model.entities.filter((e) => e.e_id !== eId);
  const generalisations2 = model.generalisations.filter((g) => g.g_sup_e_id !== eId && g.g_sub_e_id !== eId);
  const associations2 = model.associations.filter((a) => a.a_connection1.e_id !== eId && a.a_connection2.e_id !== eId);
  return {
    entities: entities2,
    generalisations: generalisations2,
    associations: associations2
  };
}

// Generalisations

export function newGeneralisation(model: UfoaModel, gSupEId: Id, gSubEId: Id): Generalisation {
  const lastGIdNo = getLastIdNo(model.generalisations.map((g) => g.g_id));
  const lastGSIdNo = getLastIdNo(getGeneralisationSets(model).map((gs) => gs.g_set_id));
  const res: Generalisation = {
    g_id: `g${lastGIdNo + 1}`,
    g_set: {
      g_set_id: `gs${lastGSIdNo + 1}`,
      g_meta: ""
    },
    gSupEId,
    gSubEId
  };
  model.generalisations.push(res);
  return res;
}

export function getGeneralisation(model: UfoaModel, gId: Id): Generalisation | null {
  return model.generalisations.find((g) => g.g_id === gId);
}

export function getGeneralisationSets(model: UfoaModel): GSet[] {
  return getGeneralisationSets(model);
}

export function getGSet(model: UfoaModel, gSetId: Id): GSet | null {
  return getGeneralisationSets(model).find((gs) => gs.g_set_id === gSetId);
}

function updateGSet(model: UfoaModel, gSetId: Id, gSetNew: GSet): void {
  model.generalisations.forEach((g) => {
    if (g.g_set.g_set_id === gSetId) {
      Object.assign(g.g_set, R.clone(gSetNew));
    }
  });
}

export function updateGeneralisation(model: UfoaModel, updatedGeneralisation: Generalisation): ValidationResult {
  const validity = validateGeneralisation(updatedGeneralisation);
  if (validity.errors) {
    return validity;
  } else {
    const generalisation = getGeneralisation(model, updatedGeneralisation.g_id);
    if (generalisation) {
      Object.assign(generalisation, updatedGeneralisation); // mutated existing generalisation in the model
    } else {
      model.generalisations.push(updatedGeneralisation); // added a new one to the model
    }
    const originalGSet = getGSet(model, updatedGeneralisation.g_set.g_set_id);
    if (originalGSet) {
      if (!R.equals(originalGSet, updatedGeneralisation.g_set)) {
        updateGSet(model, originalGSet.g_set_id, updatedGeneralisation.g_set);
      }
    }
    return validationResultOK;
  }
}

export function deleteGeneralisation(model: UfoaModel, gId: Id): void {
  const i = model.generalisations.findIndex((e) => e.g_id === gId);
  model.generalisations.splice(i, 1);
}

// Associations

export function newAssociation(model: UfoaModel, eId1: Id, eId2: Id): Association {
  const lastIdNo = getLastIdNo(model.associations.map((a) => a.a_id));
  const res: Association = {
    a_id: `a${lastIdNo + 1}`,
    a_type: "",
    a_meta: "",
    a_connection1: {
      e_id: eId1,
      mult: { lower: 1 }
    },
    a_connection2: {
      e_id: eId2,
      mult: { lower: 1 }
    },
    a_label: ""
  };
  model.associations.push(res);
  return res;
}

export function getAssociation(model: UfoaModel, aId: Id): Association | null {
  return model.associations.find((g) => g.a_id === aId);
}

export function getEntity1OfAssoc(model: UfoaModel, a: Association): UfoaEntity | null {
  const e = getEntity(model, a.a_connection1.e_id);
  if (!e) {
    console.error(new Error(new Error("UFO-A model internal inconsistency: `connection1.e_id` refers to non-existent entity in association " + a.a_id);
    return null;
  } else {
    return e;
  }
}

export function getEntity2OfAssoc(model: UfoaModel, a: Association): UfoaEntity | null {
  const e = getEntity(model, a.a_connection2.e_id);
  if (!e) {
    console.error(new Error(new Error("UFO-A model internal inconsistency: `connection2.e_id` refers to non-existent entity in association " + a.a_id);
    return null;
  } else {
    return e;
  }
}

export function updateAssociation(model: UfoaModel, updatedAssociation: Association): ValidationResult {
  const validity = validateAssociation(updatedAssociation);
  if (validity.errors) {
    return validity;
  } else {
    const association = getAssociation(model, updatedAssociation.a_id);
    if (association) {
      Object.assign(association, updatedAssociation); // mutated existing association in the model
    } else {
      model.associations.push(updatedAssociation); // added a new one to the model
    }
    return validationResultOK;
  }
}

export function deleteAssociation(model: UfoaModel, aId: Id): void {
  const i = model.associations.findIndex((e) => e.a_id === aId);
  model.associations.splice(i, 1);
}

// Querying

export function isAssocOfEntity(a: Association, e: UfoaEntity): boolean {
  return a.a_connection1.e_id === e.e_id || a.a_connection2.e_id === e.e_id;
}

export function getAssocsOfEntity(model: UfoaModel, e: UfoaEntity): Association[] {
  return model.associations.filter((a) => isAssocOfEntity(a, e));
}
