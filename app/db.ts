import axios from "axios";

export async function getData<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    axios.get(url).then(
      (result) => resolve(result.data),
      (error) => reject(error)
    );
  });
}

export async function postData<T>(url: string, data: T): Promise<any> {
  return axios.post(url, data);
}



