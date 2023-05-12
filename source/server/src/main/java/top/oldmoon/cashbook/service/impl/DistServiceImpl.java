package top.oldmoon.cashbook.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import top.oldmoon.cashbook.dao.DistDao;
import top.oldmoon.cashbook.entity.POJO.Dist;
import top.oldmoon.cashbook.service.DistService;

/**
 * 字典
 *
 * @author dingdangdog
 * @since 1.0
 */
@Service
public class DistServiceImpl extends ServiceImpl<DistDao, Dist> implements DistService {
}
