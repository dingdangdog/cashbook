package top.oldmoon.cashbook.entity.POJO;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Getter;
import lombok.Setter;

/**
 * 账本
 *
 * @author dingdangdog
 * @since 1.0
 */
@Setter
@Getter
@TableName("books")
public class Book {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String bookName;
    private String bookKey;
    private String createDate;
}
