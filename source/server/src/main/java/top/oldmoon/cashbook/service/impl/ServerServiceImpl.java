package top.oldmoon.cashbook.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import top.oldmoon.cashbook.dao.ServerDao;
import top.oldmoon.cashbook.entity.POJO.Server;
import top.oldmoon.cashbook.service.ServerService;

/**
 * 服务信息
 *
 * @author dingdangdog
 * @since 1.0
 */
@Service
public class ServerServiceImpl extends ServiceImpl<ServerDao, Server> implements ServerService {
}
