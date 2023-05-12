package top.oldmoon.cashbook.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import top.oldmoon.cashbook.entity.DTO.PageDTO;
import top.oldmoon.cashbook.entity.DTO.ResultDTO;
import top.oldmoon.cashbook.entity.POJO.Book;
import top.oldmoon.cashbook.entity.POJO.Flow;
import top.oldmoon.cashbook.entity.param.FlowsPageParam;
import top.oldmoon.cashbook.service.impl.FlowServiceImpl;
import top.oldmoon.cashbook.util.DateTimeUtils;
import top.oldmoon.cashbook.util.ResultUtils;

import java.time.LocalDate;
import java.util.List;

/**
 * 流水相关功能
 *
 * @author dingdangdog
 * @since 1.0
 */
@RestController
@RequestMapping("/flow")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class FlowController {

    private final FlowServiceImpl flowService;

    /**
     * 流水分页查询
     */
    @GetMapping()
    public ResultDTO<PageDTO<Flow>> getFlowsPage(FlowsPageParam param) {
        PageDTO<Flow> flowsPage = flowService.getFlowsPage(param);
        return ResultUtils.success(flowsPage);
    }

    /**
     * 创建流水
     */
    @PostMapping()
    public ResultDTO<Flow> create(@RequestBody Flow flow) {
        boolean save = flowService.save(flow);
        if (save) {
            return ResultUtils.success(flow);
        } else {
            return ResultUtils.error("流水新增失败，请重试！");
        }
    }

    /**
     * 修改流水
     */
    @PutMapping("/{id}")
    public ResultDTO<Flow> update(@RequestBody Flow flow, @PathVariable Integer id) {
        flow.setId(id);
        boolean update = flowService.updateById(flow);
        if (update) {
            return ResultUtils.success(flow);
        } else {
            return ResultUtils.error("流水更新失败，请重试！");
        }
    }

    /**
     * 删除流水
     */
    @DeleteMapping("/{id}")
    public ResultDTO<Object> delete(@PathVariable Integer id) {
        boolean delete = flowService.removeById(id);
        if (delete) {
            return ResultUtils.success(id);
        } else {
            return ResultUtils.error("流水更新失败，请重试！");
        }
    }

    /**
     * 获取全部流水
     */
    @GetMapping("/getAll")
    public ResultDTO<List<Flow>> getAll() {
        List<Flow> list = flowService.list();
        return ResultUtils.success(list);
    }

    /**
     * TODO 导入流水
     */
    @PostMapping("/importFlows")
    public ResultDTO<Book> importFlows(@PathVariable String type) {
        return ResultUtils.success(null);
    }
}
