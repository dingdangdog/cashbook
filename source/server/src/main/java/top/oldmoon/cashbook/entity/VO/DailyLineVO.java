package top.oldmoon.cashbook.entity.VO;

import lombok.Getter;
import lombok.Setter;

/**
 * 日消费曲线数据实体
 *
 * @author dingdangdog
 * @since 1.0
 */
@Setter
@Getter
public class DailyLineVO {
    /**
     * 日期：yyyy-MM-dd
     */
    private String day;
    private String daySum;
}
