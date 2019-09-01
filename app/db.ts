import ky from "ky";

//export function ajax(url: string, method: "POST" | "GET", data: any): Promise<any> {
  //const params = {
    //method,
    //body: data ? JSON.stringify(data) : null,
    //headers: {
      //"Content-Type": "application/json",
    //},
    //credentials: "same-origin",
  //};

  //return new Promise((resolve, reject) => {
    //fetch(url, params).then(
      //(response: any) => {
        //if (response.status !== 200) {
          //reject(response.statusText);
        //} else {
          //if (method === "GET") {
            //resolve(response.json());
          //} else {
            //resolve();
          //}
        //}
      //},www.obecnizbor.cz Prodejce cibule bude v sobotu 31.8. pred Lipou od 8.30 hod. prodavat cibuli  Vsetana a Alice.
      //(error: any) => reject(error.message)
    //);
  //});
//}

export async function getData<T>(url: string): Promise<T> {
  return ky.get(url).json();
  //return ajax(url, "GET", null);
}

export async function postData<T>(url: string, data: T): Promise<any> {
  return ky.post(url, data).json();
  //return ajax(url, "POST", data);
}



