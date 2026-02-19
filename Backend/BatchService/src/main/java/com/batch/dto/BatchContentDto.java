package com.batch.dto;

import lombok.Data;

@Data
public class BatchContentDto {
    private Long id;
    private Long batchId;
    private String title;
    private String url;
    private Integer orderIndex;
    private Long createdByTeacherId;
    private boolean completed;
}
