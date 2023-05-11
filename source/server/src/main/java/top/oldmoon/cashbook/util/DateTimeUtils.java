package top.oldmoon.cashbook.util;


import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;

/**
 * 日期时间处理工具类
 *
 * @author dingdangdog
 * @since 1.0
 */
public class DateTimeUtils {

    /**
     * 将当前时间格式化为默认格式格式
     *
     * @return 格式化后的字符串，如：2023-03-31 17:37:32
     * @author dingdangdog
     * @since 1.0
     */
    public static String formatNow() {
        return format(LocalDateTime.now(), DatePattern.DEFAULT_DATETIME_PATTERN);
    }

    /**
     * 将当前时间格式化为{@param pattern}格式
     *
     * @param pattern 指定格式
     * @return 格式化后的字符串
     * @author dingdangdog
     * @since 1.0
     */
    public static String formatNow(String pattern) {
        return format(LocalDateTime.now(), pattern);
    }

    public static String format(LocalDate date) {
        return format(date, DatePattern.DEFAULT_DATETIME_PATTERN);
    }

    public static String format(LocalDate date, String pattern) {
        return format(LocalDateTime.of(date, LocalTime.of(0, 0, 0)), pattern);
    }

    public static String format(LocalDateTime date) {
        return format(date, DatePattern.DEFAULT_DATETIME_PATTERN);
    }

    public static String format(LocalDateTime date, String pattern) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
        return date.format(formatter);
    }

    public static String format(LocalTime time) {
        return format(time, DatePattern.DEFAULT_DATETIME_PATTERN);
    }

    public static String format(LocalTime time, String pattern) {
        return format(LocalDateTime.of(LocalDate.now(), time), pattern);
    }

    /**
     * 将字符串日期转化为{@link LocalDateTime}
     *
     * @param dateTime 字符串日期
     * @return {@link LocalDateTime}
     * @author dingdangdog
     * @since 1.0
     */
    public static LocalDateTime parse(String dateTime) {
        return parse(dateTime, DatePattern.DEFAULT_DATETIME_PATTERN);
    }

    public static LocalDateTime parse(String dateTime, String pattern) {
        return LocalDateTime.parse(dateTime, DateTimeFormatter.ofPattern(pattern));
    }

    /**
     * 将字符串日期转化为{@link LocalDate}
     *
     * @param date 字符串日期
     * @return {@link LocalDate}
     * @author dingdangdog
     * @since 1.0
     */
    public static LocalDate parseDate(String date) {
        return parseDate(date, DatePattern.DEFAULT_DATE_PATTERN);
    }

    public static LocalDate parseDate(String date, String pattern) {
        LocalDateTime dateTime = parse(date, pattern);
        return dateTime.toLocalDate();
    }

    /**
     * 将字符串日期转化为{@link LocalTime}
     *
     * @param time 字符串日期
     * @return {@link LocalTime}
     * @author dingdangdog
     * @since 1.0
     */
    public static LocalTime parseTime(String time) {
        return parseTime(time, DatePattern.DEFAULT_TIME_PATTERN);
    }

    public static LocalTime parseTime(String time, String pattern) {
        LocalDateTime dateTime = parse(time, pattern);
        return dateTime.toLocalTime();
    }

    /**
     * 将{@link LocalDate}类型日期转为{@link Date}类型，时间默认为 `00:00:00`
     *
     * @param date 待转日期
     * @return 日期对象
     * @throws ParseException 格式化出错
     * @author dingdangdog
     * @since 1.0
     */
    public static Date toDate(LocalDate date) throws ParseException {
        SimpleDateFormat format = new SimpleDateFormat(DatePattern.DEFAULT_DATE_PATTERN);
        String dateStr = format(date, DatePattern.DEFAULT_DATE_PATTERN);
        return format.parse(dateStr);
    }

    public static Date toDate(LocalTime time) throws ParseException {
        SimpleDateFormat format = new SimpleDateFormat(DatePattern.DEFAULT_TIME_PATTERN);
        String dateStr = format(time, DatePattern.DEFAULT_DATE_PATTERN);
        return format.parse(dateStr);
    }

    public static Date toDate(LocalDateTime dateTime) throws ParseException {
        SimpleDateFormat format = new SimpleDateFormat(DatePattern.DEFAULT_DATETIME_PATTERN);
        String dateStr = format(dateTime, DatePattern.DEFAULT_DATETIME_PATTERN);
        return format.parse(dateStr);
    }

}
