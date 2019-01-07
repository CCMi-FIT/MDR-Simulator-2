//@flow

export const port = 3050;
export var baseURL = "";
if (process && process.env.NODE_ENV === "production") {
  baseURL = "http://mdr-simulator.com";
} else {
  baseURL = "http://localhost:" + port;
}

export function clientURL(url: string): string {
  return baseURL + url;
}

