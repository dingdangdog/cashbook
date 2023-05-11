package top.oldmoon.cashbook.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import top.oldmoon.cashbook.entity.DTO.ResultDTO;
import top.oldmoon.cashbook.entity.POJO.Dist;
import top.oldmoon.cashbook.service.impl.DistServiceImpl;
import top.oldmoon.cashbook.util.ResultUtils;

import java.util.List;

/**
 * 字典相关功能
 *
 * @author dingdangdog
 * @since 1.0
 */
@RestController
@RequestMapping("/dist")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class DistController {

    private final DistServiceImpl distService;

    /**
     * 根据字典类型获取字典
     */
    @GetMapping("/{type}")
    public ResultDTO<List<Dist>> getDist(@PathVariable String type) {
        List<Dist> list = distService.list(new QueryWrapper<Dist>().lambda().eq(Dist::getType, type));
        return ResultUtils.success(list);
    }
}
