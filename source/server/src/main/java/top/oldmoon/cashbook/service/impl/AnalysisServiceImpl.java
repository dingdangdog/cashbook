package top.oldmoon.cashbook.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import top.oldmoon.cashbook.entity.VO.DailyLineVO;
import top.oldmoon.cashbook.entity.VO.TypePieVO;
import top.oldmoon.cashbook.entity.param.BaseParam;
import top.oldmoon.cashbook.service.AnalysisService;
import top.oldmoon.cashbook.service.FlowService;

import java.util.List;

/**
 * 分析类功能逻辑开发
 *
 * @author dingdangdog
 * @since 1.0
 */
@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class AnalysisServiceImpl implements AnalysisService {
    private final FlowService flowService;
    @Override
    public List<DailyLineVO> dailyLine(BaseParam param) {
        return flowService.countDailyLine(param);
    }

    @Override
    public List<TypePieVO> typePie(BaseParam param) {
        return flowService.typePie(param);
    }
}
