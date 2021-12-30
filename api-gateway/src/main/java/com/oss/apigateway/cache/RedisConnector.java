package com.oss.apigateway.cache;

import com.oss.apigateway.exception.ServerException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import redis.clients.jedis.Jedis;

@Service
public class RedisConnector {

    @Value("${redis.host}")
    private String redisHost;
    @Value("${redis.port}")
    private int redisPort;

    public Jedis getConnection() throws Exception {
        try{
            return new Jedis(redisHost,redisPort);
        } catch (Exception e) {
            throw new ServerException("Error connecting to redis server " + e);
        }
    }

}