// @flow

import type { Id, UfoaEntity } from './ufoa';
import type { EntityInst } from './ufoa-inst';

export type Disposition = {
  d_text: string,
  d_events: Array<EventB>
};

export type SituationCombinator = (Array<EntityInst>, EntityInst) => Array<EntityInst>;

export type SituationOperation = (Array<EntityInst>) => Array<EntityInst>;

export type Situation = {
  s_id: Id,
  s_name: string,
  s_operations: Array<SituationOperation>,
  s_dispositions: Array<Disposition>,
  s_story: string
};

export type EventB = {
  ev_id: Id,
  ev_name: string,
  ev_to_situation: Situation
};

export type UfobModel = Array<Situation>;

// Combinators

export type EntityCombinatorOperation = "create" | "destroy" | "switch-phase";

export const entityCombinatorOperations: Array<EntityCombinatorOperation> = ["create", "destroy", "switch-phase"];

export type EntityCombinator = {
  ec_operation: EntityCombinatorOperation,
  ec_e_id: Id
};

export type AssocCombinatorOperation = "create" | "destroy";

export const assocCombinatorOperations: Array<AssocCombinatorOperation> = ["create", "destroy"];

export type AssocCombinator = {
  ac_operation: AssocCombinatorOperation,
  ac_ai_id: Id
};

