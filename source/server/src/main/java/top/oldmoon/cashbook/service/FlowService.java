package top.oldmoon.cashbook.service;

import top.oldmoon.cashbook.entity.DTO.PageDTO;
import top.oldmoon.cashbook.entity.POJO.Flow;
import top.oldmoon.cashbook.entity.param.FlowsPageParam;

/**
 * 流水功能逻辑开发接口
 *
 * @author dingdangdog
 * @since 1.0
 */
public interface FlowService {
    PageDTO<Flow> getFlowsPage(FlowsPageParam param);
}
