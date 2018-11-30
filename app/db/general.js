// @flow

export const requestFailedMsg = "Request to server failed";

export function getData(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    $.get(url, (data: any, status: String) => {
      if (status !== "success") {
        console.error(status);
        reject(status);
      } else {
        resolve(data);
      }
    }).fail(() => reject(requestFailedMsg));
  });
}

export function postData(url: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    $.post(url, data, (response) => {
      if (response.error) {
        console.error(response.error);
        reject(response.error);
      } else {
        resolve(response.result);
      }
    }).fail(() => reject(requestFailedMsg));
  });
}


