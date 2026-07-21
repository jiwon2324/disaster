package com.disaster.api.disaster.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class DisasterApiResponseDTO {

    @JsonProperty("header")
    private Header header;

    @JsonProperty("body")
    private List<DisasterApiRow> body;

    @Data
    public static class Header {
        @JsonProperty("resultCode")
        private String resultCode;

        @JsonProperty("resultMsg")
        private String resultMsg;
    }

    @Data
    public static class DisasterApiRow {

        @JsonProperty("SN")
        private String sn;             // 일련번호 (apiId로 활용)

        @JsonProperty("CRT_DT")
        private String crtDt;          // 생성일시 (YYYYMMDD HH:mm:ss 또는 YYYYMMDD)

        @JsonProperty("MSG_CN")
        private String msgCn;          // 메시지 상세 내용 (title, content)

        @JsonProperty("RCPTN_RGN_NM")
        private String rcptnRgnNm;     // 수신지역명 (location)

        @JsonProperty("EMRG_STEP_NM")
        private String emrgStepNm;     // 긴급단계명 (안전안내, 긴급재난 등)

        @JsonProperty("DST_SE_NM")
        private String dstSeNm;        // 재해구분명 (호우, 화재, 지진, 태풍 등) 🌟 카테고리 매핑용

        @JsonProperty("REG_YMD")
        private String regYmd;         // 등록일자
    }
}