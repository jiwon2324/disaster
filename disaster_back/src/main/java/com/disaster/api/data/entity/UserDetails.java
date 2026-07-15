package com.disaster.api.data.entity;

import org.springframework.security.core.GrantedAuthority;

import java.io.Serializable;
import java.util.Collection;

public interface UserDetails
        extends org.springframework.security.core.userdetails.UserDetails,
        Serializable {

    @Override
    Collection<? extends GrantedAuthority> getAuthorities();

    @Override
    String getPassword();

    @Override
    String getUsername();

    @Override
    boolean isAccountNonExpired();

    @Override
    boolean isAccountNonLocked();

    @Override
    boolean isCredentialsNonExpired();

    @Override
    boolean isEnabled();
}