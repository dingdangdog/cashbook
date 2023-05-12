package top.oldmoon.cashbook.service;

import top.oldmoon.cashbook.entity.DTO.PageDTO;
import top.oldmoon.cashbook.entity.POJO.Flow;
import top.oldmoon.cashbook.entity.VO.DailyLineVO;
import top.oldmoon.cashbook.entity.VO.TypePieVO;
import top.oldmoon.cashbook.entity.param.BaseParam;
import top.oldmoon.cashbook.entity.param.FlowsPageParam;

import java.util.List;

/**
 * 流水功能逻辑开发接口
 *
 * @author dingdangdog
 * @since 1.0
 */
public interface FlowService {
    PageDTO<Flow> getFlowsPage(FlowsPageParam param);

    Double countTotalMoney(FlowsPageParam param);

    List<DailyLineVO> countDailyLine(BaseParam param);

    List<TypePieVO> typePie(BaseParam param);
}
