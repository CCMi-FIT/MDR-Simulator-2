// @flow

import * as R from 'ramda';
import type { Id, UfoaEntity, Generalisation, GSet, Association, Model } from '../metamodel/ufoa';
import type { ValidationResult } from "../metamodel/ufoa";
import * as ufoaMeta from "../metamodel/ufoa";

// Entities

export function getEntity(model: Model, e_id: Id): ?UfoaEntity {
  return model.entities.find(e => e.e_id === e_id);
}

export function updateEntity(model: Model, updatedEntity: UfoaEntity): ValidationResult {
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
    return ufoaMeta.validationResultOK;
  }
}

export function deleteEntity(model: Model, e_id: Id): void {
  let i = model.entities.findIndex(e => e.e_id === e_id);
  model.entities.splice(i, 1);
}

// Generalisations

export function getGeneralisation(model: Model, g_id: Id): ?Generalisation {
  return model.generalisations.find(g => g.g_id === g_id);
}

export function getGeneralisationSets(model: Model): Array<GSet> {
  return ufoaMeta.getGeneralisationSets(model);
}

export function getGSet(model: Model, g_set_id: Id): ?GSet {
  return getGeneralisationSets(model).find(gs => gs.g_set_id === g_set_id);
}

function updateGSet(model: Model, g_set_id: Id, gSetNew: GSet): void {
  model.generalisations.forEach(g => {
    if (g.g_set.g_set_id === g_set_id) {
      Object.assign(g.g_set, R.mergeDeepRight({}, gSetNew));
    }
  });
}

export function updateGeneralisation(model: Model, updatedGeneralisation: Generalisation): ValidationResult {
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
    return ufoaMeta.validationResultOK;
  }
}

export function deleteGeneralisation(model: Model, g_id: Id): void {
  let i = model.generalisations.findIndex(e => e.g_id === g_id);
  model.generalisations.splice(i, 1);
}

// Associations

export function getAssociation(model: Model, a_id: Id): ?Association {
  return model.associations.find(g => g.a_id === a_id);
}

export function updateAssociation(model: Model, updatedAssociation: Association): ValidationResult {
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
    return ufoaMeta.validationResultOK;
  }
}

export function deleteAssociation(model: Model, a_id: Id): void {
  let i = model.associations.findIndex(e => e.a_id === a_id);
  model.associations.splice(i, 1);
}
