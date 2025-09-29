package com.donzo.naitssu.domain.meeting.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class DocumentParseResponse {
    
    @JsonProperty("api")
    private String api;
    
    @JsonProperty("content")
    private Content content;
    
    @JsonProperty("elements")
    private List<Element> elements;
    
    @JsonProperty("model")
    private String model;
    
    @JsonProperty("usage")
    private Usage usage;
    
    @Data
    public static class Content {
        @JsonProperty("html")
        private String html;
        
        @JsonProperty("markdown")
        private String markdown;
        
        @JsonProperty("text")
        private String text;
    }
    
    @Data
    public static class Element {
        @JsonProperty("category")
        private String category;
        
        @JsonProperty("content")
        private Content content;
        
        @JsonProperty("coordinates")
        private List<Coordinate> coordinates;
        
        @JsonProperty("id")
        private Integer id;
        
        @JsonProperty("page")
        private Integer page;
    }
    
    @Data
    public static class Coordinate {
        @JsonProperty("x")
        private Double x;
        
        @JsonProperty("y")
        private Double y;
    }
    
    @Data
    public static class Usage {
        @JsonProperty("pages")
        private Integer pages;
    }
}
