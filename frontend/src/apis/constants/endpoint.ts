export const API_BASE_URL = "https://na-itssu-api.jun0.dev";
export const CHATBOT_BASE_URL = "https://na-itssu-api.jun0.dev/api/chatbot";

export const CHATBOT_ENDPOINTS = {
  CREATE_SESSION: "/session",
  SEND_MESSAGE: "/chat/stream",
};

export const BILLS_ENDPOINTS = {
  TOP_N_BY_VOTES: "/api/bills/topN/by-votes",
  GET_BILLS: "/api/bills/page",
  GET_BILLS_BY_VOTES: "/api/bills/page/by-votes",
  GET_BILLS_SEARCH: "/api/bills/search",
  BILLS: "/api/bills",
};

export const MEETINGS_ENDPOINTS = {
  GET_MEETINGS: "/api/meetings",
};
