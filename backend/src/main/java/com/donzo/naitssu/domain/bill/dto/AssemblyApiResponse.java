package com.donzo.naitssu.domain.bill.dto;

import lombok.Data;

import java.util.List;

@Data
public class AssemblyApiResponse {
    private List<BillItem> bills;

    @Data
    public static class BillItem {
        private String billId;
        private String billNo;
        private String billName;
        private String proposeDate;
        private String proposer;
        private String proposerKind;
        private String stage;
        private String linkUrl;
    }
}
