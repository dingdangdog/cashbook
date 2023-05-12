package top.oldmoon.cashbook.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;
import top.oldmoon.cashbook.entity.POJO.Flow;
import top.oldmoon.cashbook.entity.VO.DailyLineVO;
import top.oldmoon.cashbook.entity.VO.TypePieVO;
import top.oldmoon.cashbook.entity.param.BaseParam;
import top.oldmoon.cashbook.entity.param.FlowsPageParam;

import java.util.List;

/**
 * 流水数据层
 *
 * @author dingdangdog
 * @since 1.0
 */
public interface FlowDao extends BaseMapper<Flow> {
    Double countTotalMoney(@Param("param") FlowsPageParam param);

    List<DailyLineVO> countDailyLine(@Param("param") BaseParam param);

    List<TypePieVO> typePie(@Param("param") BaseParam param);
}
