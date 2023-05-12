package top.oldmoon.cashbook.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import top.oldmoon.cashbook.util.JackJsonUtils;
import top.oldmoon.cashbook.util.ResultUtils;

import java.util.List;

/**
 * 账本登录拦截
 *
 * @author dingdangdog
 * @since 1.0
 */
@Component
public class BookInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String requestUri = request.getRequestURI();
        if (!requestUri.contains("/book")|| !requestUri.contains("/server")) {
            String bookKey = request.getHeader("bookKey");
            if (null == bookKey) {
                response.setContentType("application/json;charset=utf-8");
                response.getWriter().println(JackJsonUtils.toJSONString(ResultUtils.error("请先打开账本！")));
                return false;
            }
        }
        return true;
    }
}
