// @flow

import type { UfoaEntity } from '../ufoa/metamodel';
import type { EntityInst } from './metamodel';

export function newEntityInst(entity: UfoaEntity, ei_name: string = ""): EntityInst  {
  return({
    ei_e_id: entity.e_id,
    ei_name
  });
}


