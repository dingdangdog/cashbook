package top.oldmoon.cashbook.entity.POJO;


import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Getter;
import lombok.Setter;

/**
 * 流水实体
 *
 * @author dingdangdog
 * @since 1.0
 */
@Setter
@Getter
@TableName("flows")
public class Flow {
    @TableId(type = IdType.AUTO)
    private Integer id;

    private String bookKey;

    private String day;

    private String type;

    private Double money;

    private String payType;

    private String name;

    private String description;
}
