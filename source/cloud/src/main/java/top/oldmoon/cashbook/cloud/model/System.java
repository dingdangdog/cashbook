package top.oldmoon.cashbook.cloud.model;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import top.oldmoon.cashbook.cloud.util.CommonUtils;

import java.security.NoSuchAlgorithmException;


/**
 * 系统信息
 *
 * @author dingdangdog
 * @since 1.0
 */
public class System {
    Logger logger = LoggerFactory.getLogger(System.class);
    private String key;
    private String salt;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getSalt() {
        return salt;
    }

    public void setSalt(String salt) {
        this.salt = salt;
    }

    public System(String key) {
        this.key = key;
        logger.info("SYSTEM({})", key);
    }

    public System() {
    }

    public System(String key, String salt) throws NoSuchAlgorithmException {
        this.key = key;
        this.salt = salt;
        String pass = CommonUtils.hashPassword(key, salt);
        logger.info("******SYSTEM({})******", pass);
    }
}
