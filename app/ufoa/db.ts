import { Id, Graphics } from "../metamodel";
import { UfoaEntity, Generalisation, GSet, Association, UfoaModel } from "./metamodel";
import * as ufoaMeta from "./metamodel";
import * as urls from "./urls";
import * as ufoaModel from "./model";
import * as ufobDB from "../ufob/db";
import { getData, postData } from "../db";

var model: UfoaModel = ufoaMeta.emptyModel;

// Model {{{1

export function loadModel(): Promise<UfoaModel> {
  return new Promise((resolve, reject) => {
    getData<UfoaModel>(urls.clientURL(urls.ufoaGetModel)).then(
      (data) => {
        model = data;
        resolve(data);
      },
      (error) => reject(error));
  });
}

export function loadGraphics(): Promise<Graphics> {
  return getData<Graphics>(urls.clientURL(urls.ufoaGetGraphics));
}

export function saveGraphics(graphics: Graphics): Promise<any> {
  return postData<Graphics>(urls.clientURL(urls.ufoaGraphicsSave), graphics);
}

// Entities {{{1

export function newEntity(): UfoaEntity {
  return ufoaModel.newEntity(model);
}

export function getEntities(): UfoaEntity[] {
  return model.entities;
}

export function getEntity(eId: Id): UfoaEntity {
  const res = ufoaModel.getEntity(model, eId);
  if (!res) {
    throw(new Error(`ufoa/db/get: Entity with e_id = ${eId} does not exist`));
  } else {
    return res;
  }
}

export function updateEntity(updatedEntity: UfoaEntity): Promise<any> {
  return new Promise((resolve, reject) => {
    const validity = ufoaModel.updateEntity(model, updatedEntity);
    if (validity.errors) {
      reject("Entity update failed: " + validity.errors);
    } else {
      postData(urls.clientURL(urls.ufoaEntityUpdate), { entity: JSON.stringify(updatedEntity) }).then(
        ()     => resolve(),
        (error) => reject(error)
      );
    }
  });
}

export function deleteEntity(eId: Id): Promise<any> {
  return new Promise((resolve, reject) => {
    postData(urls.clientURL(urls.ufoaEntityDelete), { eId }).then(
      () => {
        model = ufoaModel.deleteEntity(model, eId);
        ufobDB.entityDeletionHook(eId);
        resolve();
      },
      (error) => reject(error)
    );
  });
}

// Generalisations {{{1

export function getGeneralisations(): Generalisation[] {
  return model.generalisations;
}

export function newGeneralisation(gSupEId: Id, gSubEId: Id): Generalisation {
  return ufoaModel.newGeneralisation(model, gSupEId, gSubEId);
}

export function getGeneralisation(gId: Id): Generalisation | undefined {
  return ufoaModel.getGeneralisation(model, gId);
}

export function getGeneralisationSets(): GSet[] {
  return ufoaModel.getGeneralisationSets(model);
}

export function getGSet(gSetId: Id): GSet | undefined {
  return ufoaModel.getGSet(model, gSetId);
}

export function updateGeneralisation(updatedGeneralisation: Generalisation): Promise<any> {
  return new Promise((resolve, reject) => {
    const validity = ufoaModel.updateGeneralisation(model, updatedGeneralisation);
    if (validity.errors) {
      console.error(new Error("Generalisation update failed: " + validity.errors));
    } else {
      postData(urls.clientURL(urls.ufoaGeneralisationUpdate), { generalisation: JSON.stringify(updatedGeneralisation) }).then(
        ()      => resolve(),
        (error) => reject(error)
      );
    }
  });
}

export function deleteGeneralisation(gId: Id): Promise<any> {
  return new Promise((resolve, reject) => {
    ufoaModel.deleteGeneralisation(model, gId);
    postData(urls.clientURL(urls.ufoaGeneralisationDelete), { gId }).then(
      ()      => resolve(),
      (error) => reject(error)
    );
  });
}

// Associations {{{1

export function getAssociations(): Association[] {
  return model.associations;
}

export function newAssociation(eId1: Id, eId2: Id): Association {
  return ufoaModel.newAssociation(model, eId1, eId2);
}

export function getAssociation(gId: Id): Association | undefined {
  return ufoaModel.getAssociation(model, gId);
}

export function getEntity1OfAssoc(a: Association): UfoaEntity | undefined {
  return ufoaModel.getEntity1OfAssoc(model, a);
}

export function getEntity2OfAssoc(a: Association): UfoaEntity | undefined {
  return ufoaModel.getEntity2OfAssoc(model, a);
}

export function updateAssociation(updatedAssociation: Association): Promise<any> {
  return new Promise((resolve, reject) => {
    const validity = ufoaModel.updateAssociation(model, updatedAssociation);
    if (validity.errors) {
      console.error(new Error("Association update failed: " + validity.errors));
    } else {
      postData(urls.clientURL(urls.ufoaAssociationUpdate), { association: JSON.stringify(updatedAssociation) }).then(
        ()     => resolve(),
        (error) => reject(error)
      );
    }
  });
}

export function deleteAssociation(aId: Id): Promise<any> {
  return new Promise((resolve, reject) => {
    ufoaModel.deleteAssociation(model, aId);
    postData(urls.clientURL(urls.ufoaAssociationDelete), { aId }).then(
      ()      => resolve(),
      (error) => reject(error)
    );
  });
}

// Querying {{{1

export function getAssocsOfEntity(e: UfoaEntity): Association[] {
  return ufoaModel.getAssocsOfEntity(model, e);
}
