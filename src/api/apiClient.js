import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://secure.madhatv.in/api/v2/",
  headers: {
    "Content-Type": "application/json",
  },
});
    


export default apiClient;
