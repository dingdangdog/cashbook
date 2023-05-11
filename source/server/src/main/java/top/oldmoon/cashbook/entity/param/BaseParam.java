package top.oldmoon.cashbook.entity.param;

import lombok.Getter;
import lombok.Setter;

/**
 * 基础查询条件
 *
 * @author dingdangdog
 * @since 1.0
 */
@Setter
@Getter
public class BaseParam {
    private String bookKey;
    private String startDay;
    private String endDay;
}
