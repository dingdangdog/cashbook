package top.oldmoon.cashbook.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import top.oldmoon.cashbook.dao.FlowDao;
import top.oldmoon.cashbook.entity.DTO.PageDTO;
import top.oldmoon.cashbook.entity.POJO.Flow;
import top.oldmoon.cashbook.entity.VO.DailyLineVO;
import top.oldmoon.cashbook.entity.VO.TypePieVO;
import top.oldmoon.cashbook.entity.param.BaseParam;
import top.oldmoon.cashbook.entity.param.FlowsPageParam;
import top.oldmoon.cashbook.service.FlowService;

import java.util.List;

/**
 * 流水功能逻辑开发
 *
 * @author dingdangdog
 * @since 1.0
 */
@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class FlowServiceImpl extends ServiceImpl<FlowDao, Flow> implements FlowService {
    private final FlowDao flowDao;

    @Override
    public PageDTO<Flow> getFlowsPage(FlowsPageParam param) {
        QueryWrapper<Flow> pageQueryWrapper = getPageQueryWrapper(param);

        Page<Flow> page = this.page(new Page<>(param.getPageNum(), param.getPageSize()), pageQueryWrapper);
        PageDTO<Flow> pageDTO = new PageDTO<>();

        pageDTO.setPageData(page.getRecords());
        pageDTO.setPageSize(page.getSize());
        pageDTO.setPageNum(page.getCurrent());
        pageDTO.setTotalPage(page.getPages());
        pageDTO.setTotalCount(page.getTotal());

        pageDTO.setTotalMoney(countTotalMoney(param));
        return pageDTO;
    }

    @Override
    public Double countTotalMoney(FlowsPageParam param) {
        return flowDao.countTotalMoney(param);
    }

    private QueryWrapper<Flow> getPageQueryWrapper(FlowsPageParam param) {
        QueryWrapper<Flow> flowQueryWrapper = new QueryWrapper<>();
        flowQueryWrapper.lambda().eq(StringUtils.hasText(param.getBookKey()), Flow::getBookKey, param.getBookKey())
                .ge(StringUtils.hasText(param.getStartDay()), Flow::getDay, param.getStartDay())
                .le(StringUtils.hasText(param.getEndDay()), Flow::getDay, param.getEndDay())
                .eq(StringUtils.hasText(param.getType()), Flow::getType, param.getType())
                .eq(StringUtils.hasText(param.getPayType()), Flow::getDay, param.getPayType())
                .like(StringUtils.hasText(param.getName()), Flow::getName, param.getName())
                .like(StringUtils.hasText(param.getDescription()), Flow::getDescription, param.getDescription());

        return flowQueryWrapper;
    }

    @Override
    public List<DailyLineVO> countDailyLine(BaseParam param) {
        return flowDao.countDailyLine(param);
    }

    @Override
    public List<TypePieVO> typePie(BaseParam param) {
        return flowDao.typePie(param);
    }
}
