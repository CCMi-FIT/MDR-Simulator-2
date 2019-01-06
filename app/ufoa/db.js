// @flow

import type { Id } from '../metamodel';
import type { UfoaEntity, Generalisation, GSet, Association, UfoaModel } from './metamodel';
import * as ufoaMeta from './metamodel';
import * as urls from "../urls";
import * as ufoaModel from './model';
import * as ufobDB from '../ufob/db';
import { getData, postData } from '../db';

var model: UfoaModel = ufoaMeta.emptyModel;

// Model

export function loadModel(): Promise<any> {
  return new Promise((resolve, reject) => {
    getData(urls.baseURL + urls.ufoaGetModel).then(
      data => {
        model = data;
        resolve(data);
      },
      error => reject(error));
  });
}

export function loadGraphics(): Promise<any> {
  return getData(urls.baseURL + urls.ufoaGetGraphics);
}

export function saveGraphics(graphics: any): Promise<any> {
  return postData(urls.baseURL + urls.ufoaGraphicsSave, { graphics: JSON.stringify(graphics) });
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
      postData(urls.baseURL + urls.ufoaEntityUpdate, { entity: JSON.stringify(updatedEntity) }).then(
        ()    => resolve(),
        error => reject(error)
      );
    }
  });
}

export function deleteEntity(e_id: Id): Promise<any> {
  return new Promise((resolve, reject) => {
    postData(urls.baseURL + urls.ufoaEntityDelete, { e_id }).then(
      () => {
        model = ufoaModel.deleteEntity(model, e_id);
        ufobDB.entityDeletionHook(e_id);
        resolve();
      },
      error => reject(error)
    );
  });
}

// Generalisations

export function newGeneralisation(g_sup_e_id: Id, g_sub_e_id: Id): Generalisation {
  return ufoaModel.newGeneralisation(model, g_sup_e_id, g_sub_e_id);
}

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
      postData(urls.baseURL + urls.ufoaGeneralisationUpdate, { generalisation: JSON.stringify(updatedGeneralisation) }).then(
        ()    => resolve(),
        error => reject(error)
      );
    }
  });
}

export function deleteGeneralisation(g_id: Id): Promise<any> {
  return new Promise((resolve, reject) => {
    ufoaModel.deleteGeneralisation(model, g_id);
    postData(urls.baseURL + urls.ufoaGeneralisationDelete, { g_id }).then(
      ()    => resolve(),
      error => reject(error)
    );
  });
}

// Associations

export function newAssociation(e_id_1: Id, e_id_2: Id): Association {
  return ufoaModel.newAssociation(model, e_id_1, e_id_2);
}

export function getAssociation(g_id: Id): ?Association {
  return ufoaModel.getAssociation(model, g_id);
}

export function getEntity1OfAssoc(a: Association): ?UfoaEntity {
  return ufoaModel.getEntity1OfAssoc(model, a);
}

export function getEntity2OfAssoc(a: Association): ?UfoaEntity {
  return ufoaModel.getEntity2OfAssoc(model, a);
}

export function updateAssociation(updatedAssociation: Association): Promise<any> {
  return new Promise((resolve, reject) => {
    let validity = ufoaModel.updateAssociation(model, updatedAssociation);
    if (validity.errors) {
      console.error("Association update failed: " + validity.errors);
    } else {
      postData(urls.baseURL + urls.ufoaAssociationUpdate, { association: JSON.stringify(updatedAssociation) }).then(
        ()    => resolve(),
        error => reject(error)
      );
    }
  });
}

export function deleteAssociation(a_id: Id): Promise<any> {
  return new Promise((resolve, reject) => {
    ufoaModel.deleteAssociation(model, a_id);
    postData(urls.baseURL + urls.ufoaAssociationDelete, { a_id }).then(
      ()    => resolve(),
      error => reject(error)
    );
  });
}

// Querying

export function getAssocsOfEntity(e: UfoaEntity): Array<Association> {
  return ufoaModel.getAssocsOfEntity(model, e);
}
