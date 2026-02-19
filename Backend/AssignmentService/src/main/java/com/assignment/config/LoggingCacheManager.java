package com.assignment.config;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

import java.util.Collection;
import java.util.stream.Collectors;

public class LoggingCacheManager implements CacheManager {

    private final CacheManager delegate;

    public LoggingCacheManager(CacheManager delegate) {
        this.delegate = delegate;
    }

    @Override
    public Cache getCache(String name) {
        Cache cache = delegate.getCache(name);
        return cache == null ? null : new LoggingRedisCache(cache);
    }

    @Override
    public Collection<String> getCacheNames() {
        return delegate.getCacheNames()
                .stream()
                .collect(Collectors.toList());
    }
}
