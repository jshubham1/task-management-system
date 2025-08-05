package com.taskmanagement.api.dto.response;

import com.taskmanagement.api.entity.Attachment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentResponse {

    private UUID id;
    private String filename;
    private String originalFilename;
    private String mimeType;
    private Long fileSize;
    private String formattedFileSize;
    private String fileExtension;
    private Boolean isImage;
    private LocalDateTime uploadedAt;

    public static AttachmentResponse fromEntity(Attachment attachment) {
        return AttachmentResponse.builder()
                .id(attachment.getId())
                .filename(attachment.getFilename())
                .originalFilename(attachment.getOriginalFilename())
                .mimeType(attachment.getMimeType())
                .fileSize(attachment.getFileSize())
                .formattedFileSize(attachment.getFormattedFileSize())
                .fileExtension(attachment.getFileExtension())
                .isImage(attachment.isImage())
                .uploadedAt(attachment.getUploadedAt())
                .build();
    }
}
