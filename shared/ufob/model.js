// @flow

import * as R from 'ramda';
import type { Id, ValidationResult } from '../metamodel';
import { getLastIdNo, validationResultOK } from '../metamodel';
import type { UfobEvent, Situation, Disposition, UfobModel } from './metamodel';
import * as ufobMeta from "./metamodel";

// Event {{{1

export function getUfobEventById(model: UfobModel, ev_id: Id): ?UfobEvent {
  return model.events.find(ev => ev.ev_id === ev_id);
}

export function newEvent(model: UfobModel, ev_name: string, s_id: Id): UfobEvent {
  const lastIdNo = getLastIdNo(model.events.map((ev) => ev.ev_id));
  const newEvent = ufobMeta.newEvent(`ev${lastIdNo+1}`, "New Event", s_id);
  newEvent.ev_wmda_text = "";
  model.events.push(newEvent);
  return newEvent;
}

export function updateEvent(model: UfobModel, updatedEvent: UfobEvent): ValidationResult {
  const validity = ufobMeta.validateEvent(updatedEvent);
  if (validity.errors) {
    return validity;
  } else { 
    let event = getUfobEventById(model, updatedEvent.ev_id);
    if (event) {
      Object.assign(event, updatedEvent); // mutated existing event in the model
    } else {
      model.events.push(updatedEvent); // added a new one to the model
    }
    return validationResultOK;
  }
}

export function deleteEvent(model: UfobModel, ev_id: Id): void {
  const events2 = model.events.filter(ev => ev.ev_id !== ev_id);
  model.events = events2;
  model.situations.forEach(s => {
    const newDs = s.s_dispositions.filter((d: Disposition) => !d.d_events_ids.includes(ev_id));
    s.s_dispositions = newDs;
  });
}

export function getInstsNames(model: UfobModel): Array<string> {
  return model.events.reduce(
    (acc1, ev) => {
      const instsNames = ev.ev_add_ops.reduce(
        (acc2, op) => R.concat(acc2, op.opa_insts_names),
        []
      );
      return R.concat(acc1, instsNames);
    },
    []
  );
}

// Situation {{{1

export function getSituationById(model: UfobModel, s_id: Id): ?Situation {
  return model.situations.find(s => s.s_id === s_id);
}

export function newSituation(model: UfobModel): Situation {
  const lastIdNo = getLastIdNo(model.situations.map((s) => s.s_id));
  const newSituation = {
    s_id: `s${lastIdNo+1}`,
    s_name: "New Situation",
    s_dispositions: [],
    s_wmda_text: ""
  };
  model.situations.push(newSituation);
  return newSituation;
}

export function updateSituation(model: UfobModel, updatedSituation: Situation): ValidationResult {
  const validity = ufobMeta.validateSituation(updatedSituation);
  if (validity.errors) {
    return validity;
  } else { 
    let situation = getSituationById(model, updatedSituation.s_id);
    if (situation) {
      Object.assign(situation, updatedSituation); // mutated existing situation in the model
    } else {
      model.situations.push(updatedSituation); // added a new one to the model
    }
    return validationResultOK;
  }
}

export function addDisposition(situation: Situation, newD: Disposition): Situation {
  const newDs = R.append(newD, situation.s_dispositions);
  return R.mergeDeepRight(situation, { s_dispositions: newDs });
}

export function withUpdatedDisposition(situation: Situation, dText: string, newD: Disposition): Situation  {
  const oldD = situation.s_dispositions.find((d) => d.d_text === dText);
  if (oldD) {
    let newDs = R.append(newD, situation.s_dispositions.filter((d) => d.d_text !== dText));
    return R.mergeDeepRight(situation, { s_dispositions: newDs });
  } else {
    return situation;
  }
}

export function deleteDisposition(situation: Situation, dText: string): Situation {
  const newDs = situation.s_dispositions.filter(d => d.d_text !== dText);
  return R.mergeDeepRight(situation, { s_dispositions: newDs });
}

export function deleteSituation(model: UfobModel, s_id: Id): void {
  let i = model.situations.findIndex(s => s.s_id === s_id);
  model.situations.splice(i, 1);
}

// Hooks {{{1

export function entityDeletionHook(model: UfobModel, e_id: Id): UfobModel {
  // Remove those Operations that relate to the entity
  const events = model.events.map(ev => {
    const addOps2 = ev.ev_add_ops.filter(op => op.opa_e_id !== e_id);
    const removeOps2 = ev.ev_remove_ops.filter(op => op.opr_e_id !== e_id);
    return R.mergeDeepRight(ev, { ev_add_ops: addOps2, ev_remove_ops: removeOps2 });
  });
  return R.mergeDeepRight(model, { events });
}

