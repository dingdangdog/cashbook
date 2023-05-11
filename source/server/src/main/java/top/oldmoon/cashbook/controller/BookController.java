package top.oldmoon.cashbook.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import top.oldmoon.cashbook.entity.DTO.ResultDTO;
import top.oldmoon.cashbook.entity.POJO.Book;
import top.oldmoon.cashbook.service.impl.BookServiceImpl;
import top.oldmoon.cashbook.util.ResultUtils;

/**
 * 账本相关功能
 *
 * @author dingdangdog
 * @since 1.0
 */
@RestController
@RequestMapping("/book")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class BookController {
    private final BookServiceImpl bookService;

    /**
     * 获取账本信息
     */
    @GetMapping("/{key}")
    public ResultDTO<Book> getBook(@PathVariable String key) {
        Book book = bookService.getOne(new QueryWrapper<Book>().eq("book_key", key));
        return ResultUtils.success(book);
    }

    /**
     * 创建账本
     */
    @PostMapping("/createBook")
    public ResultDTO<Book> createBook(Book book) {
        boolean save = bookService.save(book);
        if (save) {
            return ResultUtils.success(book);
        } else {
            return ResultUtils.error("账本新增失败，请重试！");
        }
    }

    /**
     * 获取全部账本
     */
//    @GetMapping("/getAll")
    public ResultDTO<?> getAll() {
        return ResultUtils.success(null);
    }
}
