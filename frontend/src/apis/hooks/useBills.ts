import { useQuery } from "@tanstack/react-query";
import { billsService } from "../services/bills";
import type { BillPageParams, BillPageResponse } from "../types/bills";

export const useBills = (params?: BillPageParams) => {
  return useQuery<BillPageResponse>({
    queryKey: ["bills", params],
    queryFn: () => billsService.getBillsPage(params),
    staleTime: 1000 * 60 * 5, // 5분
  });
};
