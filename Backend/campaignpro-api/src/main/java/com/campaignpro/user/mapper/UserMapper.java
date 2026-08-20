package com.campaignpro.user.mapper;

import com.campaignpro.user.dto.UserDtos.UserResponse;
import com.campaignpro.user.entity.AppUser;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(AppUser user);
}

