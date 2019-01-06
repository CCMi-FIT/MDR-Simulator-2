// @flow

import type { Id } from '../metamodel/general';
import type { Scenario, Model } from '../metamodel/scenario';
import * as scenarioMeta from '../metamodel/scenario';
import * as scenarioModel from '../model/scenario';
import * as db from './general';
import { error } from '../logging';

const fname = "../data/scenarios.json";

// Model {{{1

export function getModel(): Promise<any> {
  return db.getModel(fname, scenarioMeta);
}

export function writeModel(model: Scenario): Promise<any> {
  return db.writeModel(fname, model);
}

export function listScenarios(): Promise<any> {
  return db.getModel(fname, scenarioMeta);
}

// Scenario {{{1

export function updateScenario(updatedScenario: any): Promise<any> {
  return db.fileOpWithLock(fname, new Promise((resolve, reject) => {
    getModel().then(
      model => {
        scenarioModel.updateScenario(model, updatedScenario);
        const validity = scenarioMeta.validateModel(model);
        if (validity.errors) {
          error("Consistency error: updating of scenario " + updatedScenario.sc_id + " with " + JSON.stringify(updatedScenario) + " would brake the model.");
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

export function deleteScenario(sc_id: Id): Promise<any> {
  return db.fileOpWithLock(fname, new Promise((resolve, reject) => { 
    getModel().then(
      model => {
        const model2: Model = scenarioModel.deleteScenario(model, sc_id);
        writeModel(model2).then(
          ()    => resolve(),
          error => reject(error)
        );
      },
      error => reject(error)
    );
  }));
}

