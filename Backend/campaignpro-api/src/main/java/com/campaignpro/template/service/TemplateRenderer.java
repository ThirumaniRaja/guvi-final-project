package com.campaignpro.template.service;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Renders templates using {{placeholder}} syntax.
 * Kept as a standalone utility so the rendering engine can be swapped
 * (e.g., for a proper template engine like Thymeleaf/Freemarker) later.
 */
public final class TemplateRenderer {

    private static final Pattern PLACEHOLDER = Pattern.compile("\\{\\{\\s*(\\w+)\\s*}}");

    private TemplateRenderer() {}

    public static String render(String content, Map<String, String> variables) {
        if (content == null) return "";
        Matcher matcher = PLACEHOLDER.matcher(content);
        StringBuilder result = new StringBuilder();
        while (matcher.find()) {
            String key = matcher.group(1);
            String value = variables != null && variables.containsKey(key) ? variables.get(key) : "";
            matcher.appendReplacement(result, Matcher.quoteReplacement(value));
        }
        matcher.appendTail(result);
        return result.toString();
    }
}

