package top.oldmoon.cashbook.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import top.oldmoon.cashbook.dao.FlowDao;
import top.oldmoon.cashbook.entity.DTO.PageDTO;
import top.oldmoon.cashbook.entity.POJO.Flow;
import top.oldmoon.cashbook.entity.param.FlowsPageParam;
import top.oldmoon.cashbook.service.FlowService;

/**
 * 流水功能逻辑开发
 *
 * @author dingdangdog
 * @since 1.0
 */
public class FlowServiceImpl extends ServiceImpl<FlowDao, Flow> implements FlowService {

    @Override
    public PageDTO<Flow> getFlowsPage(FlowsPageParam param) {
        QueryWrapper<Flow> flowQueryWrapper = new QueryWrapper<>();


        Page<Flow> page = this.page(new Page<>(param.getPageNum(), param.getPageSize()), flowQueryWrapper);
        PageDTO<Flow> pageDTO = new PageDTO<>();

        pageDTO.setPageData(page.getRecords());
        pageDTO.setPageSize(page.getSize());
        pageDTO.setPageNum(page.getCurrent());
        pageDTO.setTotalPage(page.getPages());
        pageDTO.setTotalCount(page.getTotal());

//TODO
//        pageDTO.setTotalMoney(page.getRecords());


        return pageDTO;
    }
}
