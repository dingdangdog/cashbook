package top.oldmoon.cashbook.entity.param;

import lombok.Getter;
import lombok.Setter;

/**
 * 流水分页查询条件
 *
 * @author dingdangdog
 * @since 1.0
 */
@Setter
@Getter
public class FlowsPageParam {
    private int pageNum = 1;
    private int pageSize = 10;
    private Integer id;

    private String bookKey;
    private String startDay;
    private String endDay;
    private String type;
    private String payType;
    private String name;
    private String description;
}
