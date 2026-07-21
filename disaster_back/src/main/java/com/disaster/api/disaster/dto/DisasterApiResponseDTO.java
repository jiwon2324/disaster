package com.disaster.api.disaster.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DisasterApiResponseDTO {

    // =========================================================================
    // 1. 행안부 재난문자 DTO
    // =========================================================================
    @JsonProperty("header")
    private Header header;

    @JsonProperty("body")
    private List<DisasterApiRow> body;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Header {
        @JsonProperty("resultCode")
        private String resultCode;
        @JsonProperty("resultMsg")
        private String resultMsg;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DisasterApiRow {
        @JsonProperty("SN")
        private String sn;
        @JsonProperty("CRT_DT")
        private String crtDt;
        @JsonProperty("MSG_CN")
        private String msgCn;
        @JsonProperty("RCPTN_RGN_NM")
        private String rcptnRgnNm;
        @JsonProperty("EMRG_STEP_NM")
        private String emrgStepNm;
        @JsonProperty("DST_SE_NM")
        private String dstSeNm;
        @JsonProperty("REG_YMD")
        private String regYmd;
    }

    // =========================================================================
    // 2. 기상청 지진정보 DTO
    // =========================================================================
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class EarthquakeResponseDTO {
        @JsonProperty("response")
        private EqkResponse response;

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class EqkResponse {
            @JsonProperty("body")
            private EqkBody body;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class EqkBody {
            @JsonProperty("items")
            private EqkItems items;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class EqkItems {
            @JsonProperty("item")
            private List<EarthquakeItem> item;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class EarthquakeItem {
            @JsonProperty("tmSeq")
            private String tmSeq;     // 발표 일련번호
            @JsonProperty("tmEqk")
            private String tmEqk;     // 진앙시 (YYYYMMDDhhmmss)
            @JsonProperty("loc")
            private String loc;       // 진앙 위치
            @JsonProperty("mt")
            private String mt;        // 규모
            @JsonProperty("rem")
            private String rem;       // 참고사항 (내용)
            @JsonProperty("inT")
            private String inT;       // 최대진도
        }
    }

    // =========================================================================
    // 3. 산림청 산불발생통계 DTO
    // =========================================================================
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ForestFireResponseDTO {
        @JsonProperty("response")
        private FireResponse response;

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class FireResponse {
            @JsonProperty("body")
            private FireBody body;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class FireBody {
            @JsonProperty("items")
            private FireItems items;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class FireItems {
            @JsonProperty("item")
            private List<ForestFireItem> item;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class ForestFireItem {
            @JsonProperty("startyear")
            private String startyear;
            @JsonProperty("startmonth")
            private String startmonth;
            @JsonProperty("startday")
            private String startday;
            @JsonProperty("starttime")
            private String starttime;
            @JsonProperty("firecause")
            private String firecause;  // 발생원인
            @JsonProperty("locsi")
            private String locsi;      // 시도
            @JsonProperty("locgungu")
            private String locgungu;  // 시군구
            @JsonProperty("locdong")
            private String locdong;    // 동리
            @JsonProperty("damagearea")
            private String damagearea; // 피해면적
        }
    }

    // =========================================================================
    // 4. 기상청 단기예보 DTO
    // =========================================================================
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class VilageFcstResponseDTO {
        @JsonProperty("response")
        private FcstResponse response;

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class FcstResponse {
            @JsonProperty("body")
            private FcstBody body;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class FcstBody {
            @JsonProperty("items")
            private FcstItems items;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class FcstItems {
            @JsonProperty("item")
            private List<VilageFcstItem> item;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class VilageFcstItem {
            @JsonProperty("baseDate")
            private String baseDate;
            @JsonProperty("baseTime")
            private String baseTime;
            @JsonProperty("category")
            private String category;   // RN1(1시간강수량), T1H(기온), SKY(하늘상태) 등
            @JsonProperty("fcstValue")
            private String fcstValue;  // 예보 값
            @JsonProperty("nx")
            private int nx;
            @JsonProperty("ny")
            private int ny;
        }
    }
}