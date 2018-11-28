//@flow

import * as R from 'ramda';
import * as fs from 'fs';
import { lock } from 'proper-lockfile';
import type { RestResult } from './general';
import * as db from './general';
import type { Id, EntityType, UfoaEntity, Generalisation, UfoaModel } from '../metamodel/ufoa';
import * as ufoaMeta from '../metamodel/ufoa';
import * as ufoaModel from '../model/ufoa';

const ufoaFname = "../data/ufoa.json";
const ufoaGraphicsFname = "../data/ufoa-graphics.json";

// Model

export function getModel(): Promise<any> {
  return db.getModel(ufoaFname, ufoaMeta);
}

export function getGraphics(): Promise<any> {
  return db.getGraphics(ufoaGraphicsFname);
}

export function graphicsDelete(): Promise<any> {
  return db.graphicsDelete(ufoaGraphicsFname);
}

export function saveGraphics(graphics: any, next: (RestResult) => void): Promise<any> {
  return db.saveGraphics(ufoaGraphicsFname, graphics, next);
}

export function writeModel(model: UfoaModel) {
  db.writeModel(model, ufoaFname);
}

// Entities

export function updateEntity(updatedEntity: any, next: (RestResult) => void) {
  lock(ufoaFname).then((release) => {
    loadSetSaveEntity(updatedEntity, next);
    return release();
  });
}

function loadSetSaveEntity(updatedEntity: any, next: (RestResult) => void) {
  getModel().then((model) => {
    ufoaModel.updateEntity(model, updatedEntity);
    const validity = ufoaMeta.validateModel(model);
    if (validity.errors) {
      console.error("Consistency error: updating of entity " + updatedEntity.e_id + " with " + JSON.stringify(updatedEntity) + " would brake the model.");
      next({"error": "Internal server error on UFOA-A entity updating."});
    } else {
      writeModel(model);
      next({"result": "ok"});
    }
  }, (error) => { next({ "error": error, "e_id": updatedEntity.e_id }); });
}

export function deleteEntity(e_id: Id, next: (RestResult) => void) {
  lock(ufoaFname).then((release) => {
    getModel().then((model) => {
      ufoaModel.deleteEntity(model, e_id);
      writeModel(model);
      next({"result": "ok"});
    });
    return release();
  });
}

//TODO zkusit abstrahovat lock na withLock

// Generalisations

export function updateGeneralisation(updatedGeneralisation: any, next: (RestResult) => void) {
  lock(ufoaFname).then((release) => {
    loadSetSaveGeneralisation(updatedGeneralisation, next);
    return release();
  });
}

function loadSetSaveGeneralisation(updatedGeneralisation: any, next: (RestResult) => void) {
  getModel().then((model) => {
    ufoaModel.updateGeneralisation(model, updatedGeneralisation);
    const validity = ufoaMeta.validateModel(model);
    if (!validity) {
      console.error("Consistency error: updating of generalisation " + updatedGeneralisation.g_id + " with " + JSON.stringify(updatedGeneralisation) + " would brake the model.");
      next({"error": "Internal server error on UFOA-A generalisation updating."});
    } else {
      writeModel(model);
      next({"result": "ok"});
    }
  }, (error) => { next({ "error": error, "g_id": updatedGeneralisation.g_id }); });
}

export function deleteGeneralisation(g_id: Id, next: (RestResult) => void) {
  lock(ufoaFname).then((release) => {
    getModel().then((model) => {
      ufoaModel.deleteGeneralisation(model, g_id);
      writeModel(model);
      next({"result": "ok"});
    });
    return release();
  });
}

// Associations

export function updateAssociation(updatedAssociation: any, next: (RestResult) => void) {
  lock(ufoaFname).then((release) => {
    loadSetSaveAssociation(updatedAssociation, next);
    return release();
  });
}

function loadSetSaveAssociation(updatedAssociation: any, next: (RestResult) => void) {
  getModel().then((model) => {
    ufoaModel.updateAssociation(model, updatedAssociation);
    const validity = ufoaMeta.validateModel(model);
    if (validity.errors) {
      console.error("Consistency error: updating of association " + updatedAssociation.a_id + " with " + JSON.stringify(updatedAssociation) + " would brake the model.");
      next({"error": "Internal server error on UFOA-A association updating."});
    } else {
      writeModel(model);
      next({"result": "ok"});
    }
  }, (error) => { next({ "error": error, "a_id": updatedAssociation.a_id }); });
}

export function deleteAssociation(a_id: Id, next: (RestResult) => void) {
  lock(ufoaFname).then((release) => {
    getModel().then((model) => {
      ufoaModel.deleteAssociation(model, a_id);
      writeModel(model);
      next({"result": "ok"});
    });
    return release();
  });
}


