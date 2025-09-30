import { apiClient } from "@/apis/client/apiClients";
import { BILLS_ENDPOINTS } from "@/apis/constants/endpoint";
import type { BillTopVotesItem } from "@/apis/types/bills";

export const billsService = {
  async getTopNByVotes(n: number): Promise<BillTopVotesItem[]> {
    const res = await apiClient.get<BillTopVotesItem[]>(
      `${BILLS_ENDPOINTS.TOP_N_BY_VOTES}`,
      { params: { n } }
    );
    return res.data;
  },
};

