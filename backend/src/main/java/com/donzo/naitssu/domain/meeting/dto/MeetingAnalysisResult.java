package com.donzo.naitssu.domain.meeting.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeetingAnalysisResult {
    
    @JsonProperty("discussion_items")
    private List<String> discussionItems;
}
