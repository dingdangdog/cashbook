package top.oldmoon.cashbook.runner;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

/**
 * 初始化数据库
 *
 * @author dingdangdog
 * @since 1.0
 */
@Component
public class SqliteInitRunner implements ApplicationRunner {

    @Value("${spring.datasource.url}")
    private String url;

    @Autowired
    private DataInit dataInit;
    @Override
    public void run(ApplicationArguments args) throws Exception {
        {
            /*
            初始化数据库
             */
            Connection connection = DriverManager.getConnection(url);
            Statement statement = connection.createStatement();
            /*账本表*/
            statement.execute("CREATE TABLE IF NOT EXISTS books (" +
                    "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    "book_name TEXT, " +
                    "book_key TEXT, " +
                    "create_date TEXT)");
            /*字典表*/
            statement.execute("CREATE TABLE IF NOT EXISTS dists (" +
                    "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    "`type` TEXT, " +
                    "dist_key TEXT, " +
                    "dist_value TEXT," +
                    "sort INTEGER)");
            /*流水表*/
            statement.execute("CREATE TABLE IF NOT EXISTS flows (" +
                    "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    "book_key TEXT, " +
                    "`day` TEXT, " +
                    "`type` TEXT, " +
                    "money REAL, " +
                    "pay_type TEXT, " +
                    "`name` TEXT, " +
                    "description TEXT)");
            /*服务信息表*/
            statement.execute("CREATE TABLE IF NOT EXISTS server (" +
                    "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    "version TEXT, " +
                    "environment TEXT, " +
                    "create_date TEXT)");
            statement.close();
            connection.close();
        }
        dataInit.initServer();
        dataInit.initDist();
    }
}
