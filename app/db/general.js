// @flow

export const requestFailedMsg = "Request to server failed";

export function loadData(url: string): Promise<any> {
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

