package top.oldmoon.cashbook.cloud.service;

import top.oldmoon.cashbook.cloud.model.Auth;
import top.oldmoon.cashbook.cloud.model.AuthInfo;
import top.oldmoon.cashbook.cloud.model.Data;

import java.io.IOException;

/**
 * 在线服务
 *
 * @author dingdangdog
 * @since 1.0
 */
public interface OnlineService {
    AuthInfo getAuth(String key);

    void upload(Auth auth, Data data) throws IOException;

    Data download(String key) throws IOException;

    boolean generateAuth(Integer sum);
}
