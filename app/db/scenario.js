// @flow

import type { Id } from '../metamodel/general';
import type { Scenario, Model } from '../metamodel/scenario';
import * as scenarioModel from '../model/scenario';
import * as urls from '../urls';
import { getData, postData } from './general';

var model: Model = [];

// Scenarios

export function loadModel(): Promise<any> {
  return new Promise((resolve, reject) => {
    getData(urls.baseURL + urls.scenariosGet).then(
      data => {
        model = data;
        resolve(data);
      },
      error => reject(error));
  });
}

export function getScenarioById(scId: Id): ?Scenario {
  return scenarioModel.getScenarioById(model, scId);
}

export function newScenario(): Promise<Scenario> {
  return new Promise((resolve, reject) => {
    const newSc: Scenario = scenarioModel.newScenario(model, "New Scenario");
    postData(urls.baseURL + urls.scenarioUpdate, { scenario: JSON.stringify(newSc) }).then(
      () => { 
        model.push(newSc);
        resolve(newSc);
      },
      error => reject(error)
    );
  });
}

export function updateScenario(updatedScenario: Scenario): Promise<any> {
  return new Promise((resolve, reject) => {
    let validity = scenarioModel.updateScenario(model, updatedScenario);
    if (validity.errors) {
      reject("Scenario update failed: " + validity.errors);
    } else {
      postData(urls.baseURL + urls.scenarioUpdate, { scenario: JSON.stringify(updatedScenario) }).then(
        ()    => resolve(),
        error => reject(error)
      );
    }
  });
}

