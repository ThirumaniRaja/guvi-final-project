package com.campaignpro.security;

import com.campaignpro.user.entity.AppUser;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.List;

@Getter
public class UserPrincipal extends User {

    private final Long id;
    private final String fullName;

    public UserPrincipal(AppUser user, List<GrantedAuthority> authorities) {
        super(user.getEmail(), user.getPasswordHash(), authorities);
        this.id = user.getId();
        this.fullName = user.getFullName();
    }
}

