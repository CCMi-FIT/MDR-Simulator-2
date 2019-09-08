import * as db from "../db";
import { Id, Graphics } from "../metamodel";
import { UfoaModel } from "../ufoa/metamodel";
import * as ufoaMeta from "../ufoa/metamodel";
import * as ufoaModel from "../ufoa/model";
import * as ufobDB from "../ufob/db";
import { error } from "../logging";

const ufoaFname = "../data/ufoa.json";
const ufoaGraphicsFname = "../data/ufoa-graphics.json";

// Model {{{1

export function getModel(): Promise<UfoaModel> {
  return db.getModel<UfoaModel>(ufoaFname, ufoaMeta.validateModel);
}

export function writeModel(model: UfoaModel): Promise<any> {
  return db.writeModel(ufoaFname, model);
}

// Entities {{{1

export function updateEntity(updatedEntity: any): Promise<any> {
  return db.fileOpWithLock(ufoaFname, new Promise((resolve, reject) => {
    getModel().then(
      model => {
        ufoaModel.updateEntity(model, updatedEntity);
        const validity = ufoaMeta.validateModel(model);
        if (validity.errors) {
          error("Consistency error: updating of entity " + updatedEntity.e_id + " with " + JSON.stringify(updatedEntity) + " would brake the model.");
          reject("Validity error");
        } else {
          writeModel(model).then(
            ()    => resolve(),
            error => reject(error)
          );
        }
      },
      error => reject(error)
    );
  }));
}

export function deleteEntity(e_id: Id): Promise<any> {
  return db.fileOpWithLock(ufoaFname, new Promise((resolve, reject) => { 
    getModel().then(
      model => {
        const model2 = ufoaModel.deleteEntity(model, e_id);
        Promise.all([
          writeModel(model2),
          deleteEntityGraphics(e_id),
          ufobDB.entityDeletionHook(e_id)
        ]).then(
          ()    => resolve(),
          error => reject(error)
        );
      },
      error => reject(error)
    );
  }));
}

// Generalisations {{{1

export function updateGeneralisation(updatedGeneralisation: any): Promise<any> {
  return db.fileOpWithLock(ufoaFname, new Promise((resolve, reject) => {
    getModel().then(
      model => {
        ufoaModel.updateGeneralisation(model, updatedGeneralisation);
        const validity = ufoaMeta.validateModel(model);
        if (!validity) {
          error("Consistency error: updating of generalisation " + updatedGeneralisation.g_id + " with " + JSON.stringify(updatedGeneralisation) + " would brake the model.");
          reject("Validity error");
        } else {
          writeModel(model).then(
            ()    => resolve(),
            error => reject(error)
          );
        }
      },
      error => reject(error)
    );
  }));
}

export function deleteGeneralisation(g_id: Id): Promise<any> {
  return db.fileOpWithLock(ufoaFname, new Promise((resolve, reject) => {
    getModel().then(
      model => {
        ufoaModel.deleteGeneralisation(model, g_id);
        writeModel(model).then(
          ()    => resolve(),
          error => reject(error)
        );
      },
      error => reject(error)
    );
  }));
}

// Associations {{{1

export function updateAssociation(updatedAssociation: any): Promise<any> {
  return db.fileOpWithLock(ufoaFname, new Promise((resolve, reject) => {
    getModel().then(
      model => {
        ufoaModel.updateAssociation(model, updatedAssociation);
        const validity = ufoaMeta.validateModel(model);
        if (validity.errors) {
          error("Consistency error: updating of association " + updatedAssociation.a_id + " with " + JSON.stringify(updatedAssociation) + " would brake the model.");
          reject("Validity error");
        } else {
          writeModel(model).then(
            ()    => resolve(),
            error => reject(error)
          );
        }
      }, 
      error => reject(error)
    );
  }));
}

export function deleteAssociation(a_id: Id): Promise<any> {
  return db.fileOpWithLock(ufoaFname, new Promise((resolve, reject) => {
    getModel().then(
      model => {
        ufoaModel.deleteAssociation(model, a_id);
        writeModel(model).then(
          ()    => resolve(),
          error => reject(error)
        );
      }, 
      error => reject(error)
    );
  }));
}

// Graphics {{{1

export function getGraphics(): Promise<Graphics> {
  return db.getGraphics(ufoaGraphicsFname);
}

export function graphicsDelete(): Promise<any> {
  return db.graphicsDelete(ufoaGraphicsFname);
}

export function saveGraphics(graphics: any): Promise<any> {
  return db.saveGraphics(ufoaGraphicsFname, graphics);
}

function deleteEntityGraphics(e_id: Id): Promise<any> {
  return db.graphicsElementDelete(ufoaGraphicsFname, e_id);
}
