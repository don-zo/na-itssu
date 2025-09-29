package com.donzo.naitssu.domain.meeting.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class MeetingApiResponse {
    
    @JsonProperty("nzbyfwhwaoanttzje")
    private List<Head> heads;
    
    @Data
    public static class Head {
        @JsonProperty("head")
        private List<Object> head;
        
        @JsonProperty("row")
        private List<MeetingData> row;
        
        // head와 row가 별도 객체에 있을 수 있으므로 헬퍼 메서드 추가
        public List<MeetingData> getActualRow() {
            return this.row;
        }
        
        public List<Object> getActualHead() {
            return this.head;
        }
    }
    
    @Data
    public static class MeetingData {
        @JsonProperty("CONFER_NUM")
        private String conferNum;
        
        @JsonProperty("TITLE")
        private String title;
        
        @JsonProperty("CLASS_NAME")
        private String className;
        
        @JsonProperty("DAE_NUM")
        private String daeNum;
        
        @JsonProperty("CONF_DATE")
        private String confDate;
        
        @JsonProperty("SUB_NAME")
        private String subName;
        
        @JsonProperty("VOD_LINK_URL")
        private String vodLinkUrl;
        
        @JsonProperty("CONF_LINK_URL")
        private String confLinkUrl;
        
        @JsonProperty("PDF_LINK_URL")
        private String pdfLinkUrl;
        
        @JsonProperty("CONF_ID")
        private String confId;
    }
}
