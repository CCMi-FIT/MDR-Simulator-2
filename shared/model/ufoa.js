// @flow

import * as R from 'ramda';
import type { Id, UfoaEntity, Generalisation, GSet, Association, AssocType, AssocMeta, Connection, Label, UfoaModel } from '../metamodel/ufoa';
import type { ValidationResult } from "../metamodel/ufoa";
import * as ufoaMeta from "../metamodel/ufoa";

// Common

function getLastIdNo(ids: Array<Id>): number {
  return ids.reduce((maxNum: number, id: Id) => {
    const idNumStr = id.match(/\d/g);
    if (!idNumStr) {
      console.error(`Something is wrong: id ${id} does not contain a number.`);
      return -1;
    } else {
      const idNum = parseInt(idNumStr.join(""), 10);
      return idNum > maxNum ? idNum : maxNum;
    }
  }, -1);
}

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
    return ufoaMeta.validationResultOK;
  }
}

export function deleteEntity(model: UfoaModel, e_id: Id): void {
  let i = model.entities.findIndex(e => e.e_id === e_id);
  model.entities.splice(i, 1);
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
      Object.assign(g.g_set, R.mergeDeepRight({}, gSetNew));
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
    return ufoaMeta.validationResultOK;
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
    return ufoaMeta.validationResultOK;
  }
}

export function deleteAssociation(model: UfoaModel, a_id: Id): void {
  let i = model.associations.findIndex(e => e.a_id === a_id);
  model.associations.splice(i, 1);
}