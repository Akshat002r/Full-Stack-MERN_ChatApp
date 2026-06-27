import axios from "axios";

export const axiosInstance = axios.create({
    baseURL : import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
    // Since we will be passing cookies with every request therefore 
    withCredentials : true,
});

