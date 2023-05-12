package top.oldmoon.cashbook.service;

import top.oldmoon.cashbook.entity.VO.DailyLineVO;
import top.oldmoon.cashbook.entity.VO.TypePieVO;
import top.oldmoon.cashbook.entity.param.BaseParam;

import java.util.List;

/**
 * TODO
 *
 * @author dingdangdog
 * @since 1.0
 */
public interface AnalysisService {
    List<DailyLineVO> dailyLine(BaseParam param);

    List<TypePieVO> typePie(BaseParam param);
}
