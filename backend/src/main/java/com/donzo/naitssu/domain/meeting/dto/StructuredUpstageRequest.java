package com.donzo.naitssu.domain.meeting.dto;

import com.donzo.naitssu.domain.chatbot.dto.UpstageRequest;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class StructuredUpstageRequest {
    
    private String model;
    private List<UpstageRequest.Message> messages;
    
    @JsonProperty("response_format")
    private ResponseFormat responseFormat;
    
    public StructuredUpstageRequest(String model, List<UpstageRequest.Message> messages) {
        this.model = model;
        this.messages = messages;
        this.responseFormat = createMeetingAnalysisFormat();
    }
    
    private ResponseFormat createMeetingAnalysisFormat() {
        ResponseFormat format = new ResponseFormat();
        format.setType("json_schema");
        
        JsonSchema jsonSchema = new JsonSchema();
        jsonSchema.setName("meeting_analysis");
        jsonSchema.setStrict(true);
        
        // 스키마 정의
        Map<String, Object> schema = Map.of(
            "type", "object",
            "properties", Map.of(
                "discussion_items", Map.of(
                    "type", "array",
                    "items", Map.of(
                        "type", "string",
                        "description", "주요 논의사항"
                    ),
                    "minItems", 1,
                    "maxItems", 5,
                    "description", "회의에서 논의된 주요 안건이나 이슈들 (최대 5개)"
                )
            ),
            "required", List.of("discussion_items"),
            "additionalProperties", false
        );
        
        jsonSchema.setSchema(schema);
        format.setJsonSchema(jsonSchema);
        
        return format;
    }
    
    @Data
    public static class ResponseFormat {
        private String type;
        
        @JsonProperty("json_schema")
        private JsonSchema jsonSchema;
    }
    
    @Data
    public static class JsonSchema {
        private String name;
        private boolean strict;
        private Map<String, Object> schema;
    }
}
