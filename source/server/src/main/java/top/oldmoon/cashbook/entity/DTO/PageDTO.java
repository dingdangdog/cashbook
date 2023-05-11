package top.oldmoon.cashbook.entity.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * 分页数据封装
 *
 * @author dingdangdog
 * @since 1.0
 */
@Setter
@Getter
public class PageDTO<T> {
    private Long pageNum;
    private Long pageSize;
    private Long totalPage;
    private Long totalCount;
    private Double totalMoney;
    private List<T> pageData;
}
