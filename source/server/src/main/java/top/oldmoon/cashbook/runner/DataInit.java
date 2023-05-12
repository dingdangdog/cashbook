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
            File file = new ClassPathResource("dist.json").getFile();
            String fileInfo = FileUtil.getFileInfo(file);
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
