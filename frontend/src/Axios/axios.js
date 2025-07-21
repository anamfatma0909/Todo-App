import axios from "axios"
const instance = axios.create({
    baseURL:"https://todo-app-backend-h0gw.onrender.com"
})
export default instance
