export const port = 3050;
export let baseURL = process && process.env.NODE_ENV === "production" ?  "http://mdr-simulator.com" : "http://localhost:" + port;

export function clientURL(url: string): string {
  return baseURL + url;
}
