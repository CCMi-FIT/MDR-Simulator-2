// @flow

import type { Id } from '../metamodel/general';
import type { Scenario, Model } from '../metamodel/scenario';
import * as scenarioMeta from '../metamodel/scenario';
import type { ValidationResult } from "../metamodel/general";
import * as meta from "../metamodel/general";
import { getLastIdNo } from './general';

// Scenario {{{1

export function getScenario(model: Model, sc_id: Id): ?Scenario {
  return model.find(sc => sc.sc_id === sc_id);
}

export function newScenario(model: Model, sc_name: string): Scenario {
  const lastIdNo = getLastIdNo(model.map(sc => sc.sc_id));
  const newScenario: Scenario = {
    sc_id: `sc${lastIdNo+1}`,
    sc_name,
    sc_ev_insts: []
  };
  model.push(newScenario);
  return newScenario;
}

export function updateScenario(model: Model, updatedScenario: Scenario): ValidationResult {
  const validity = scenarioMeta.validateScenario(updatedScenario);
  if (validity.errors) {
    return validity;
  } else { 
    let scenario = getScenario(model, updatedScenario.sc_id);
    if (scenario) {
      Object.assign(scenario, updatedScenario); // mutated existing scenario in the model
    } else {
      model.push(updatedScenario); // added a new one to the model
    }
    return meta.validationResultOK;
  }
}

