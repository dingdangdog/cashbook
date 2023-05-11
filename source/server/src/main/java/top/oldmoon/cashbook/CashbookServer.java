package top.oldmoon.cashbook;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan(basePackages = "top.oldmoon.cashbook.dao")
public class CashbookServer {
    public static void main(String[] args) {
        SpringApplication.run(CashbookServer.class, args);
    }
}