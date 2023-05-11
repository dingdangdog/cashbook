package top.oldmoon.cashbook.entity.DTO;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * 统一返回数据封装
 *
 * @author dingdangdog
 * @since 1.0
 */
@Setter
@Getter
public class ResultDTO<T> {
    private int code;
    private T data;
    private String message;
}
