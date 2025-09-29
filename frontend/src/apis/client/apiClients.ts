import axios from "axios";
import { CHATBOT_BASE_URL } from "@/apis/constants/endpoint";

export const chatbotClient = axios.create({
  baseURL: CHATBOT_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

chatbotClient.interceptors.request.use(
  (config) => {
    console.log(
      "챗봇 API Request 완료:",
      config.method?.toUpperCase(),
      config.url
    );
    return config;
  },
  (error) => {
    console.error("챗봇 요청 에러", error);
    return Promise.reject(error);
  }
);

chatbotClient.interceptors.response.use(
  (response) => {
    console.log("챗봇 API Response 완료", response.status, response.data);
    return response;
  },
  (error) => {
    console.error(
      "챗봇 응답 에러",
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);
