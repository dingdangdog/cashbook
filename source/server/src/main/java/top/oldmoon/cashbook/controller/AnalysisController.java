package top.oldmoon.cashbook.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import top.oldmoon.cashbook.entity.DTO.ResultDTO;
import top.oldmoon.cashbook.entity.VO.DailyLineVO;
import top.oldmoon.cashbook.entity.VO.TypePieVO;
import top.oldmoon.cashbook.entity.param.BaseParam;
import top.oldmoon.cashbook.service.impl.AnalysisServiceImpl;
import top.oldmoon.cashbook.util.ResultUtils;

import java.util.List;

/**
 * 分析统计相关功能
 *
 * @author dingdangdog
 * @since 1.0
 */
@RestController
@RequestMapping("/analysis")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class AnalysisController {
    private final AnalysisServiceImpl analysisService;

    /**
     * 日消费曲线
     */
    @PostMapping("/dailyLine")
    public ResultDTO<List<DailyLineVO>> dailyLine(@RequestBody BaseParam param) {
        List<DailyLineVO> list = analysisService.dailyLine(param);
        return ResultUtils.success(list);
    }

    /**
     * 消费类型统计饼图
     */
    @PostMapping("/typePie")
    public ResultDTO<List<TypePieVO>> typePie(@RequestBody BaseParam param) {
        List<TypePieVO> list = analysisService.typePie(param);
        return ResultUtils.success(list);
    }
}
