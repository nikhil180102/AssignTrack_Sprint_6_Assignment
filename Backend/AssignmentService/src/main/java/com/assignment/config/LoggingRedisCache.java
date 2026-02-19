package com.assignment.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;

@Slf4j
public class LoggingRedisCache implements Cache {

    private final Cache delegate;

    public LoggingRedisCache(Cache delegate) {
        this.delegate = delegate;
    }

    @Override
    public String getName() {
        return delegate.getName();
    }

    @Override
    public Object getNativeCache() {
        return delegate.getNativeCache();
    }

    @Override
    public ValueWrapper get(Object key) {
        ValueWrapper value = delegate.get(key);
        if (value != null) {
} else {
}
        return value;
    }

    @Override
    public <T> T get(Object key, Class<T> type) {
        T value = delegate.get(key, type);
        if (value != null) {
} else {
}
        return value;
    }

    @Override
    public <T> T get(Object key, java.util.concurrent.Callable<T> valueLoader) {
        T value = delegate.get(key, valueLoader);
        if (value != null) {
} else {
}
        return value;
    }

    @Override
    public void put(Object key, Object value) {
        delegate.put(key, value);
    }

    @Override
    public void evict(Object key) {
delegate.evict(key);
    }

    @Override
    public void clear() {
delegate.clear();
    }
}
