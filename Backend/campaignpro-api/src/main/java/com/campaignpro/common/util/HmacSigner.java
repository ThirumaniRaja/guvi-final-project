package com.campaignpro.common.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

/**
 * HMAC signing utility used to generate tamper-proof tracking tokens
 * for open/click tracking links.
 */
public final class HmacSigner {

    private static final String ALGO = "HmacSHA256";

    private HmacSigner() {}

    public static String sign(String data, String secret) {
        try {
            Mac mac = Mac.getInstance(ALGO);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), ALGO));
            byte[] out = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(out);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new IllegalStateException("Unable to sign data", e);
        }
    }

    public static boolean verify(String data, String signature, String secret) {
        String expected = sign(data, secret);
        return expected.equals(signature);
    }
}

