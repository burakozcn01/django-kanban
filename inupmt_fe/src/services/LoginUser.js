import Axios from "./Axios";

export const loginUser = (data) => {
  const url = "login/";

  return Axios.post(url, data);
};
