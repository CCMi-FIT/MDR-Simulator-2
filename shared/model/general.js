// @flow

import type { Id } from '../metamodel/general';

export function getLastIdNo(ids: Array<Id>): number {
  return ids.reduce((maxNum: number, id: Id) => {
    const idNumStr = id.match(/\d/g);
    if (!idNumStr) {
      console.error(`Something is wrong: id ${id} does not contain a number.`);
      return -1;
    } else {
      const idNum = parseInt(idNumStr.join(""), 10);
      return idNum > maxNum ? idNum : maxNum;
    }
  }, -1);
}

