// @flow

import type { Scenario, Model } from '../metamodel/scenario';
import * as scenarioModel from '../model/scenario';
import * as urls from '../urls';
import { getData, postData } from './general';

var model: Model = [];

// Scenarios

export function listScenarios(): Promise<any> {
  return getData(urls.baseURL + urls.scenariosList);
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
