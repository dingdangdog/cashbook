package top.oldmoon.cashbook.cloud.model;

/**
 * 上传数据实体
 *
 * @author dingdangdog
 * @since 1.0
 */
public class Data {
    private String key;
    private String json;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getJson() {
        return json;
    }

    public void setJson(String json) {
        this.json = json;
    }

    public Data(String key, String json) {
        this.key = key;
        this.json = json;
    }

    public Data() {
    }
}
