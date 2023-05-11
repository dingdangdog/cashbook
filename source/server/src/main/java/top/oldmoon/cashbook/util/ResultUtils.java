package top.oldmoon.cashbook.util;

import top.oldmoon.cashbook.entity.DTO.ResultDTO;

/**
 * 返回值处理工具类
 *
 * @author dingdangdog
 * @since 1.0
 */
public class ResultUtils {
    public static <T> ResultDTO<T> success(T data) {
        ResultDTO<T> result = new ResultDTO<>();
        result.setCode(200);
        result.setData(data);
        return result;
    }

    public static <T> ResultDTO<T> error(String message) {
        ResultDTO<T> result = new ResultDTO<>();
        result.setCode(500);
        result.setMessage(message);
        result.setData(null);
        return result;
    }
}
