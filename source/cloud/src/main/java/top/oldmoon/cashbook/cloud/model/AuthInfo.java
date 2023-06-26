package top.oldmoon.cashbook.cloud.model;

/**
 * 授权信息
 *
 * @author dingdangdog
 * @since 1.0
 */
public class AuthInfo {
    /**
     * 密钥
     */
    private String key;
    /**
     * 状态：是否启用：1启用，0未启用
     */
    private int state;
    /**
     * 剩余天数：-1为无限
     */
    private int limit;
    /**
     * 当天剩余次数：默认3次
     */
    private int day;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public Integer getState() {
        return state;
    }

    public void setState(Integer state) {
        this.state = state;
    }

    public Integer getLimit() {
        return limit;
    }

    public void setLimit(Integer limit) {
        this.limit = limit;
    }

    public Integer getDay() {
        return day;
    }

    public void setDay(Integer day) {
        this.day = day;
    }
}
