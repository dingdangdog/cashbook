package top.oldmoon.cashbook.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import top.oldmoon.cashbook.entity.DTO.ResultDTO;
import top.oldmoon.cashbook.entity.POJO.Server;
import top.oldmoon.cashbook.service.impl.ServerServiceImpl;
import top.oldmoon.cashbook.util.ResultUtils;

/**
 * 服务信息获取
 *
 * @author dingdangdog
 * @since 1.0
 */
@RestController
@RequestMapping("/server")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class ServerController {
    private final ServerServiceImpl serverService;

    @GetMapping()
    public ResultDTO<Server> getServerInfo() {
        Server server = serverService.getById(1);
        return ResultUtils.success(server);
    }
}
