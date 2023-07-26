package top.oldmoon.cashbook.cloud.model;

/**
 * 授权结果
 *
 * @author dingdangdog
 * @since 1.0
 */
public class Auth {
    private boolean flag;

    private AuthInfo auth;

    public boolean isFlag() {
        return flag;
    }

    public void setFlag(boolean flag) {
        this.flag = flag;
    }

    public AuthInfo getAuth() {
        return auth;
    }

    public void setAuth(AuthInfo auth) {
        this.auth = auth;
    }
}
