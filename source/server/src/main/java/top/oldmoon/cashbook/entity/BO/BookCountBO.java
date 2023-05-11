package top.oldmoon.cashbook.entity.BO;

import lombok.Getter;
import lombok.Setter;

/**
 * 账本统计实体
 *
 * @author dingdangdog
 * @since 1.0
 */
@Setter
@Getter
public class BookCountBO {
    /**
     * 账本bookKey
     */
    private String _id;
    private Double totalMoney;
}
