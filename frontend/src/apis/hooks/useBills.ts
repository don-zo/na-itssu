import { useQuery } from "@tanstack/react-query";
import { billsService } from "../services/bills";
import type { BillPageParams, BillPageResponse } from "../types/bills";

export const useBills = (params?: BillPageParams) => {
  return useQuery<BillPageResponse>({
    queryKey: ["bills", params],
    queryFn: () => billsService.getBillsPage(params),
    enabled: params !== undefined,
    staleTime: 1000 * 60 * 5, // 5분
  });
};

export const useBillsByVotes = (params?: BillPageParams) => {
  return useQuery<BillPageResponse>({
    queryKey: ["billsByVotes", params],
    queryFn: () => billsService.getBillsPageByVotes(params),
    enabled: params !== undefined,
    staleTime: 1000 * 60 * 5,
  });
};

export const useBillSearch = (keyword?: string, page: number = 0) => {
  return useQuery<BillPageResponse>({
    queryKey: ["billsSearch", keyword, page],
    queryFn: () => billsService.searchBills(keyword ?? "", page),
    enabled: !!keyword && keyword.length > 0,
    staleTime: 1000 * 60 * 5,
  });
};
