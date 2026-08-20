package com.campaignpro.template.mapper;

import com.campaignpro.template.dto.TemplateDtos.TemplateResponse;
import com.campaignpro.template.entity.EmailTemplate;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TemplateMapper {
    TemplateResponse toResponse(EmailTemplate template);
}

