package com.campaignpro.contact.mapper;

import com.campaignpro.contact.dto.ContactDtos.ContactGroupResponse;
import com.campaignpro.contact.dto.ContactDtos.ContactResponse;
import com.campaignpro.contact.entity.Contact;
import com.campaignpro.contact.entity.ContactGroup;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ContactMapper {

    ContactResponse toResponse(Contact contact);

    default ContactGroupResponse toGroupResponse(ContactGroup group) {
        if (group == null) return null;
        return new ContactGroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getMembers() == null ? 0 : group.getMembers().size(),
                group.getCreatedAt()
        );
    }
}

