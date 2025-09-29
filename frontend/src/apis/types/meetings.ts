export interface Meeting {
  id: number;
  confer_num: string;
  title: string;
  class_name: string;
  dae_num: string;
  conf_date: string;
  sub_name: string;
  vod_link_url: string;
  conf_link_url: string;
  pdf_link_url: string;
  conf_id: string;
  summary: string;
  discussion_items: string[];
  created_at: string;
  updated_at: string;
}

export interface MeetingsResponse {
  meetings: Meeting[];
  size: number;
  has_next: boolean;
  next_cursor: number | null;
  total_count: number | null;
}

export interface MeetingsParams {
  cursor?: number;
  size?: number;
}
