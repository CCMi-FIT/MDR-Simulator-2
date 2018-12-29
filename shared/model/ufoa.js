// @flow

import * as R from 'ramda';
import type { Id } from '../metamodel/general';
import type { UfoaEntity, Generalisation, GSet, Association, UfoaModel } from '../metamodel/ufoa';
import type { ValidationResult } from "../metamodel/general";
import * as meta from '../metamodel/general';
import * as ufoaMeta from "../metamodel/ufoa";
import { getLastIdNo } from './general.js';

// Entities

export function newEntity(model: UfoaModel): UfoaEntity {
  const lastIdNo = getLastIdNo(model.entities.map((e) => e.e_id));
  const newEntity = {
    e_id: `e${lastIdNo+1}`,
    e_type: "kind",
    e_name: "New Entity"
  };
  model.entities.push(newEntity);
  return newEntity;
}

export function getEntity(model: UfoaModel, e_id: Id): ?UfoaEntity {
  return model.entities.find(e => e.e_id === e_id);
}

export function updateEntity(model: UfoaModel, updatedEntity: UfoaEntity): ValidationResult {
  const validity = ufoaMeta.validateEntity(updatedEntity);
  if (validity.errors) {
    return validity;
  } else { 
    let entity = getEntity(model, updatedEntity.e_id);
    if (entity) {
      Object.assign(entity, updatedEntity); // mutated existing entity in the model
    } else {
      model.entities.push(updatedEntity); // added a new one to the model
    }
    return meta.validationResultOK;
  }
}

export function deleteEntity(model: UfoaModel, e_id: Id): UfoaModel {
  const entities2 = model.entities.filter(e => e.e_id !== e_id);
  const generalisations2 = model.generalisations.filter(g => g.g_sup_e_id !== e_id && g.g_sub_e_id !== e_id);
  const associations2 = model.associations.filter(a => a.a_connection1.e_id !== e_id && a.a_connection2.e_id !== e_id);
  return {
    entities: entities2,
    generalisations: generalisations2,
    associations: associations2
  };
}

// Generalisations

export function newGeneralisation(model: UfoaModel, g_sup_e_id: Id, g_sub_e_id: Id): Generalisation {
  const lastGIdNo = getLastIdNo(model.generalisations.map((g) => g.g_id));
  const lastGSIdNo = getLastIdNo(getGeneralisationSets(model).map((gs) => gs.g_set_id));
  const newGeneralisation = {
    g_id: `g${lastGIdNo+1}`,
    g_set: {
      g_set_id: `gs${lastGSIdNo+1}`,
      g_meta: ""
    },
    g_sup_e_id,
    g_sub_e_id
  };
  model.generalisations.push(newGeneralisation);
  return newGeneralisation;
}

export function getGeneralisation(model: UfoaModel, g_id: Id): ?Generalisation {
  return model.generalisations.find(g => g.g_id === g_id);
}

export function getGeneralisationSets(model: UfoaModel): Array<GSet> {
  return ufoaMeta.getGeneralisationSets(model);
}

export function getGSet(model: UfoaModel, g_set_id: Id): ?GSet {
  return getGeneralisationSets(model).find(gs => gs.g_set_id === g_set_id);
}

function updateGSet(model: UfoaModel, g_set_id: Id, gSetNew: GSet): void {
  model.generalisations.forEach(g => {
    if (g.g_set.g_set_id === g_set_id) {
      Object.assign(g.g_set, R.clone(gSetNew));
    }
  });
}

export function updateGeneralisation(model: UfoaModel, updatedGeneralisation: Generalisation): ValidationResult {
  const validity = ufoaMeta.validateGeneralisation(updatedGeneralisation);
  if (validity.errors) {
    return validity;
  } else { 
    let generalisation = getGeneralisation(model, updatedGeneralisation.g_id);
    if (generalisation) {
      Object.assign(generalisation, updatedGeneralisation); // mutated existing generalisation in the model
    } else {
      model.generalisations.push(updatedGeneralisation); // added a new one to the model
    }
    let originalGSet = getGSet(model, updatedGeneralisation.g_set.g_set_id);
    if (originalGSet) {
      if (!R.equals(originalGSet, updatedGeneralisation.g_set)) {
        updateGSet(model, originalGSet.g_set_id, updatedGeneralisation.g_set);
      }
    }
    return meta.validationResultOK;
  }
}

export function deleteGeneralisation(model: UfoaModel, g_id: Id): void {
  let i = model.generalisations.findIndex(e => e.g_id === g_id);
  model.generalisations.splice(i, 1);
}

// Associations

export function newAssociation(model: UfoaModel, e_id_1: Id, e_id_2: Id): Association {
  const lastIdNo = getLastIdNo(model.associations.map((a) => a.a_id));
  const newAssociation = {
    a_id: `a${lastIdNo+1}`,
    a_type: "",
    a_meta: "",
    a_connection1: {
      e_id: e_id_1,
      mult: { lower: 1 }
    },
    a_connection2: {
      e_id: e_id_2,
      mult: { lower: 1 }
    },
    a_label: ""
  };
  model.associations.push(newAssociation);
  return newAssociation;
}

export function getAssociation(model: UfoaModel, a_id: Id): ?Association {
  return model.associations.find(g => g.a_id === a_id);
}

export function getEntity1OfAssoc(model: UfoaModel, a: Association): ?UfoaEntity {
  const e = getEntity(model, a.a_connection1.e_id);
  if (!e) {
    console.error("UFO-A model internal inconsistency: `connection1.e_id` refers to non-existent entity in association " + a.a_id);
    return null;
  } else {
    return e;
  }
}

export function getEntity2OfAssoc(model: UfoaModel, a: Association): ?UfoaEntity {
  const e = getEntity(model, a.a_connection2.e_id);
  if (!e) {
    console.error("UFO-A model internal inconsistency: `connection2.e_id` refers to non-existent entity in association " + a.a_id);
    return null;
  } else {
    return e;
  }
}

export function updateAssociation(model: UfoaModel, updatedAssociation: Association): ValidationResult {
  const validity = ufoaMeta.validateAssociation(updatedAssociation);
  if (validity.errors) {
    return validity;
  } else { 
    let association = getAssociation(model, updatedAssociation.a_id);
    if (association) {
      Object.assign(association, updatedAssociation); // mutated existing association in the model
    } else {
      model.associations.push(updatedAssociation); // added a new one to the model
    }
    return meta.validationResultOK;
  }
}

export function deleteAssociation(model: UfoaModel, a_id: Id): void {
  let i = model.associations.findIndex(e => e.a_id === a_id);
  model.associations.splice(i, 1);
}

// Querying

export function isAssocOfEntity(a: Association, e: UfoaEntity): boolean {
  return a.a_connection1.e_id === e.e_id || a.a_connection2.e_id === e.e_id;
}

export function getAssocsOfEntity(model: UfoaModel, e: UfoaEntity): Array<Association> {
  return model.associations.filter(a => isAssocOfEntity(a, e));
}
  
