import { error } from './logging';

export function clientErrRes(res: any, msg: string): void {
  res.status(400);
  res.send(msg);
}

export function serverErrRes(res: any, msg: string): void {
  error(msg);
  res.status(500);
  res.send(msg);
}

export function okRes(res: any, result: any): void {
  res.status(200);
  res.json(result);
}
