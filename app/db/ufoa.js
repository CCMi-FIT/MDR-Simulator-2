// @flow

import type { Id, UfoaEntity, Generalisation, GSet, Association, Model } from '../metamodel/ufoa';
import * as ufoaMeta from '../metamodel/ufoa';
import * as urls from "../urls";
import * as ufoaModel from '../model/ufoa';

var model: Model = ufoaMeta.emptyModel;

const requestFailedMsg = "Request to server failed";

// Model

export function loadModel(): Promise<any> {
  return new Promise((resolve, reject) => {
    console.log("Loading UFO-A model...");
    $.get(urls.baseURL + urls.ufoaGetModel, (data: Model, status: String) => {
      if (status !== "success") {
        console.error(status);
        reject(status);
      } else {
        model = data;
        resolve(model);
      }
    }).fail(() => reject(requestFailedMsg));
  });
}

// Entities

export function newEntity(): UfoaEntity {
  return ufoaModel.newEntity(model);
}

export function getEntities(): Array<UfoaEntity> {
  return model.entities;
}

export function getEntity(e_id: Id): ?UfoaEntity {
  return ufoaModel.getEntity(model, e_id);
}

export function updateEntity(updatedEntity: UfoaEntity): Promise<any> {
  return new Promise((resolve, reject) => {
    let validity = ufoaModel.updateEntity(model, updatedEntity);
    if (validity.errors) {
      reject("Entity update failed: " + validity.errors);
    } else {
      $.post(urls.baseURL + urls.ufoaEntityUpdate, { entity: JSON.stringify(updatedEntity) }, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.result);
        }
      }).fail(() => reject(requestFailedMsg));
    }
  });
}

export function deleteEntity(e_id: Id): Promise<any> {
  return new Promise((resolve, reject) => {
    ufoaModel.deleteEntity(model, e_id);
    $.post(urls.baseURL + urls.ufoaEntityDelete, { e_id }, (response) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response.result);
      }
    }).fail(() => reject(requestFailedMsg));
  });
}

// Generalisations

export function getGeneralisation(g_id: Id): ?Generalisation {
  return ufoaModel.getGeneralisation(model, g_id);
}

export function getGeneralisationSets(): Array<GSet> {
  return ufoaModel.getGeneralisationSets(model);
}
  
export function getGSet(g_set_id: Id): ?GSet {
  return ufoaModel.getGSet(model, g_set_id);
}

export function updateGeneralisation(updatedGeneralisation: Generalisation): Promise<any> {
  return new Promise((resolve, reject) => {
    let validity = ufoaModel.updateGeneralisation(model, updatedGeneralisation);
    if (validity.errors) {
      console.error("Generalisation update failed: " + validity.errors);
    } else {
      $.post(urls.baseURL + urls.generalisationUpdate, { generalisation: JSON.stringify(updatedGeneralisation) }, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.result);
        }
      }).fail(() => reject(requestFailedMsg));
    }
  });
}

export function deleteGeneralisation(g_id: Id): Promise<any> {
  return new Promise((resolve, reject) => {
    ufoaModel.deleteGeneralisation(model, g_id);
    $.post(urls.baseURL + urls.ufoaGeneralisationDelete, { g_id }, (response) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response.result);
      }
    }).fail(() => reject(requestFailedMsg));
  });
}

// Associations

export function getAssociation(g_id: Id): ?Association {
  return ufoaModel.getAssociation(model, g_id);
}

export function updateAssociation(updatedAssociation: Association): Promise<any> {
  return new Promise((resolve, reject) => {
    let validity = ufoaModel.updateAssociation(model, updatedAssociation);
    if (validity.errors) {
      console.error("Association update failed: " + validity.errors);
    } else {
      $.post(urls.baseURL + urls.associationUpdate, { association: JSON.stringify(updatedAssociation) }, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.result);
        }
      }).fail(() => reject(requestFailedMsg));
    }
  });
}

export function deleteAssociation(a_id: Id): Promise<any> {
  return new Promise((resolve, reject) => {
    ufoaModel.deleteAssociation(model, a_id);
    $.post(urls.baseURL + urls.ufoaAssociationDelete, { a_id }, (response) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response.result);
      }
    }).fail(() => reject(requestFailedMsg));
  });
}

