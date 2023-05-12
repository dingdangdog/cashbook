package top.oldmoon.cashbook.entity.POJO;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Getter;
import lombok.Setter;

/**
 * 服务信息
 *
 * @author dingdangdog
 * @since 1.0
 */
@Setter
@Getter
@TableName("server")
public class Server {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String version;
    private String environment;
    private String createDate;
}
