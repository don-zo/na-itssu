import axios from "axios";
import { MEETINGS_ENDPOINTS, API_BASE_URL } from "../constants/endpoint";
import type { MeetingsResponse, MeetingsParams } from "../types/meetings";

// 회의 API용 axios 인스턴스
const meetingsClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
meetingsClient.interceptors.request.use(
  (config) => {
    console.log(
      "Meetings API Request:",
      config.method?.toUpperCase(),
      config.url,
      config.params
    );
    return config;
  },
  (error) => {
    console.error("Meetings API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
meetingsClient.interceptors.response.use(
  (response) => {
    console.log("Meetings API Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error(
      "Meetings API Response Error:",
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

export const meetingsService = {
  getMeetings: async (params?: MeetingsParams): Promise<MeetingsResponse> => {
    try {
      const response = await meetingsClient.get<MeetingsResponse>(
        MEETINGS_ENDPOINTS.GET_MEETINGS,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("회의 목록 조회 실패:", error);
      throw error;
    }
  },
};
