import { Promise } from "es6-promise";

export function ajax(url: string, method: "POST" | "GET", data: any): Promise<any> {
  const params = {
    method,
    body: data ? JSON.stringify(data) : null,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
  };

  return new Promise((resolve, reject) => {
    fetch(url, params).then(
      (response: any) => {
        if (response.status !== 200) {
          reject(response.statusText);
        } else {
          if (method === "GET") {
            resolve(response.json());
          } else {
            resolve();
          }
        }
      },
      (error: any) => reject(error.message)
    );
  });
}

export function getData(url: string): Promise<any> {
  return ajax(url, "GET", null);
}

export function postData(url: string, data: any): Promise<any> {
  return ajax(url, "POST", data);
}



