package top.oldmoon.cashbook.cloud.tasks;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import top.oldmoon.cashbook.cloud.dao.OnlineDao;
import top.oldmoon.cashbook.cloud.model.AuthInfo;

import java.util.List;

/**
 * 定时任务
 *
 * @author dingdangdog
 * @since 1.0
 */
@Component
public class Task {
    Logger logger = LoggerFactory.getLogger(Task.class);
    @Autowired
    OnlineDao onlineDao;

    /**
     * 授权码每天自动减少一天：每天0点10分执行
     */
//    @Scheduled(cron = "1 0 0 * * ?")
    @Scheduled(cron = "1 */5 * * * ? ")
    public void autoAuthDay(){
        try {
            logger.info("--------开始--减少授权码剩余天数--------");
            onlineDao.autoAuthDay();
            logger.info("--------完成--减少授权码剩余天数--------");
        } catch (Exception e) {
            logger.error("--------异常--减少授权码剩余天数--------");
        }
    }

    /**
     * 授权码每天重置可用次数：每天0点0分0秒执行
     */
    @Scheduled(cron = "30 */5 * * * ? ")
    public void resetAuthLimit(){
        try {
            logger.info("--------开始--重置每日授权码可用次数--------");
            onlineDao.resetAuthLimit();
            logger.info("--------完成--重置每日授权码可用次数--------");
        } catch (Exception e) {
            logger.error("--------异常--重置每日授权码可用次数--------");
        }
    }




}
