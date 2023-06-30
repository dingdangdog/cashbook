package top.oldmoon.cashbook.cloud;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import top.oldmoon.cashbook.cloud.model.System;
import top.oldmoon.cashbook.cloud.util.CommonUtils;

import java.security.NoSuchAlgorithmException;

@SpringBootApplication
@EnableScheduling
@MapperScan("top.oldmoon.cashbook.cloud.dao")
public class StartCloud {
    public static void main(String[] args) {
        SpringApplication.run(StartCloud.class, args);
    }

    @Value("${system.salt}")
    private String salt;

    @Bean
    public System initSystem() throws NoSuchAlgorithmException {
        return new System(CommonUtils.getSystem(), salt);
    }
}