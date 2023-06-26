package top.oldmoon.cashbook.cloud.model;

/**
 * 上传日志
 *
 * @author dingdangdog
 * @since 1.0
 */
public class LogUpload {
    private Integer id;
    private String key;
    private String day;
    private String time;
    private String filePath;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public LogUpload() {
    }

    public LogUpload(Integer id, String key, String day, String time, String filePath) {
        this.id = id;
        this.key = key;
        this.day = day;
        this.time = time;
        this.filePath = filePath;
    }
}
