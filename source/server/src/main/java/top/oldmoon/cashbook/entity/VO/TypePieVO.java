package top.oldmoon.cashbook.entity.VO;

import lombok.Getter;
import lombok.Setter;

/**
 * 类型统计饼图数据实体
 *
 * @author dingdangdog
 * @since 1.0
 */
@Setter
@Getter
public class TypePieVO {
    /**
     * 消费类型
     */
    private String _id;
    private String typeSum;
}
