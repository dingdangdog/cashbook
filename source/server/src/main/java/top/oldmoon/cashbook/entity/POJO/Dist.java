package top.oldmoon.cashbook.entity.POJO;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Getter;
import lombok.Setter;

/**
 * TODO
 *
 * @author dingdangdog
 * @since 1.0
 */
@Setter
@Getter
@TableName("dists")
public class Dist {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String type;
    private String distKey;
    private String distValue;
    private Integer sort;
}
