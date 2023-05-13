package top.oldmoon.cashbook.runner;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import top.oldmoon.cashbook.entity.POJO.Dist;
import top.oldmoon.cashbook.entity.POJO.Server;
import top.oldmoon.cashbook.service.impl.DistServiceImpl;
import top.oldmoon.cashbook.service.impl.ServerServiceImpl;
import top.oldmoon.cashbook.util.DateTimeUtils;
import top.oldmoon.cashbook.util.FileUtil;
import top.oldmoon.cashbook.util.JackJsonUtils;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 数据初始化
 *
 * @author dingdangdog
 * @since 1.0
 */
@Component
public class DataInit {

    @Autowired
    private DistServiceImpl distService;
    @Autowired
    private ServerServiceImpl serverService;

    /**
     * 初始化字典信息
     *
     * @throws IOException 异常
     */
    public void initDist() throws IOException {
        if (distService.count() <= 0) {
            String fileInfo = "[{\"type\": \"expenseType\", \"distKey\": \"饮食\", \"distValue\": \"饮食\"}, {\"type\": \"expenseType\", \"distKey\": \"娱乐\", \"distValue\": \"娱乐\"}, {\"type\": \"expenseType\", \"distKey\": \"生活\", \"distValue\": \"生活\"}, {\"type\": \"expenseType\", \"distKey\": \"鞋服\", \"distValue\": \"鞋服\"}, {\"type\": \"expenseType\", \"distKey\": \"护肤\", \"distValue\": \"护肤\"}, {\"type\": \"expenseType\", \"distKey\": \"医疗\", \"distValue\": \"医疗\"}, {\"type\": \"expenseType\", \"distKey\": \"学习\", \"distValue\": \"学习\"}, {\"type\": \"expenseType\", \"distKey\": \"社交\", \"distValue\": \"社交\"}, {\"type\": \"expenseType\", \"distKey\": \"通讯\", \"distValue\": \"通讯\"}, {\"type\": \"expenseType\", \"distKey\": \"交通\", \"distValue\": \"交通\"}, {\"type\": \"expenseType\", \"distKey\": \"住宿\", \"distValue\": \"住宿\"}, {\"type\": \"expenseType\", \"distKey\": \"其他\", \"distValue\": \"其他\"}, {\"type\": \"paymentType\", \"distKey\": \"支付宝\", \"distValue\": \"支付宝\"}, {\"type\": \"paymentType\", \"distKey\": \"微信\", \"distValue\": \"微信\"}, {\"type\": \"paymentType\", \"distKey\": \"京东白条\", \"distValue\": \"京东白条\"}, {\"type\": \"paymentType\", \"distKey\": \"刷卡\", \"distValue\": \"刷卡\"}, {\"type\": \"paymentType\", \"distKey\": \"现金\", \"distValue\": \"现金\"}, {\"type\": \"paymentType\", \"distKey\": \"其他\", \"distValue\": \"其他\"}]";
            List<Dist> distList = JackJsonUtils.parseArray(fileInfo, Dist.class);
            distService.saveBatch(distList);
        }
    }

    @Value("${server.version}")
    private String version;
    @Value("${server.environment}")
    private String environment;

    /**
     * 初始化服务器信息
     */
    public void initServer() {
        Server oldServer = serverService.getById(1);
        if (oldServer == null) {
            Server server = new Server();
            server.setVersion(version);
            server.setEnvironment(environment);
            server.setCreateDate(DateTimeUtils.format(LocalDateTime.now()));
            serverService.save(server);
        } else if (!oldServer.getVersion().equals(version) || !oldServer.getVersion().equals(environment)) {
            oldServer.setVersion(version);
            oldServer.setEnvironment(environment);
            oldServer.setCreateDate(DateTimeUtils.format(LocalDateTime.now()));
            serverService.updateById(oldServer);
        }
    }

}
