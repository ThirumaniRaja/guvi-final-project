package com.campaignpro.tracking.controller;

import com.campaignpro.tracking.service.TrackingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Base64;

@Slf4j
@RestController
@RequestMapping("/api/v1/tracking")
@RequiredArgsConstructor
@Tag(name = "Tracking (public)")
public class TrackingController {

    // 1x1 transparent PNG
    private static final byte[] PIXEL = Base64.getDecoder().decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=");

    private final TrackingService trackingService;

    @GetMapping(value = "/open/{token}.png", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> open(@PathVariable String token) {
        try {
            trackingService.recordOpen(token);
        } catch (Exception e) {
            log.debug("Open tracking failed for token {}: {}", token, e.getMessage());
        }
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(PIXEL);
    }

    @GetMapping("/click/{token}")
    public ResponseEntity<Void> click(@PathVariable String token, @RequestParam("u") String url) {
        String target = url;
        try {
            target = trackingService.recordClickAndGetTargetUrl(token, url);
        } catch (Exception e) {
            log.debug("Click tracking failed for token {}: {}", token, e.getMessage());
        }
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(target)).build();
    }
}

