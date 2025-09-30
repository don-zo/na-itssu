import { useQuery } from "@tanstack/react-query";
import { meetingsService } from "../services/meetings";
import type { MeetingsResponse, MeetingsParams, Meeting } from "../types/meetings";

export const useMeetings = (params?: MeetingsParams) => {
  return useQuery<MeetingsResponse>({
    queryKey: ["meetings", params],
    queryFn: () => meetingsService.getMeetings(params),
    staleTime: 1000 * 60 * 5, // 5분
  });
};

export const useLatestMeeting = () => {
  return useQuery<Meeting>({
    queryKey: ["latestMeeting"],
    queryFn: () => meetingsService.getLatestMeeting(),
    staleTime: 1000 * 60 * 5, // 5분
  });
}; 