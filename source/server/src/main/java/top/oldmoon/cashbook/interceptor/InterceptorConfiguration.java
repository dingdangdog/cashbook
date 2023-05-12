package top.oldmoon.cashbook.interceptor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 拦截器生效配置
 *
 * @author ddd
 * @since 1.0.0
 */
@Configuration
public class InterceptorConfiguration implements WebMvcConfigurer {
    @Autowired
    BookInterceptor bookInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(bookInterceptor);
    }
}
