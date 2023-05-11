package top.oldmoon.cashbook.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import top.oldmoon.cashbook.dao.BookDao;
import top.oldmoon.cashbook.entity.POJO.Book;
import top.oldmoon.cashbook.service.BookService;

/**
 * 账本业务层
 *
 * @author dingdangdog
 * @since 1.0
 */
@Service
public class BookServiceImpl extends ServiceImpl<BookDao, Book> implements BookService {
}
