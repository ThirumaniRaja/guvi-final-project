package com.campaignpro.common.util;

import java.security.SecureRandom;
import java.util.Base64;

public final class TokenUtil {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private TokenUtil() {}

    public static String randomToken(int numBytes) {
        byte[] bytes = new byte[numBytes];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public static String encode(long value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(String.valueOf(value).getBytes());
    }

    public static long decode(String token) {
        return Long.parseLong(new String(Base64.getUrlDecoder().decode(token)));
    }
}

