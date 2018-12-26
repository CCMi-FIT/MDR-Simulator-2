//@flow

import * as db from './general';
import type { Id } from '../metamodel/general';
import type { UfoaModel } from '../metamodel/ufoa';
import * as ufoaMeta from '../metamodel/ufoa';
import * as ufoaModel from '../model/ufoa';
import { error } from '../logging';

const ufoaFname = "../data/ufoa.json";
const ufoaGraphicsFname = "../data/ufoa-graphics.json";

// Model

export function getModel(): Promise<any> {
  return db.getModel(ufoaFname, ufoaMeta);
}

export function writeModel(model: UfoaModel): Promise<any> {
  return db.writeModel(ufoaFname, model);
}

// Entities

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
        writeModel(model2).then(
          () => deleteEntityGraphics(e_id).then(
            ()    => resolve(),
            error => reject(error)
          ),
          error => { error(error); reject(error); }
        );
      }
    );
  }));
}

// Generalisations

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

// Associations

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

// Graphics

export function getGraphics(): Promise<any> {
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
