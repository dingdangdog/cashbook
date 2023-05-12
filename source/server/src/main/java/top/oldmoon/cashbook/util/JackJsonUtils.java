package top.oldmoon.cashbook.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalTimeSerializer;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * json 工具类
 *
 * @author jason
 * 2020/2/15 8:48 下午
 */
@Slf4j
public final class JackJsonUtils {

    /**
     * 默认日期时间格式
     */
    private static final String DEFAULT_DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

    /**
     * 默认日期格式
     */
    private static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";

    /**
     * 默认时间格式
     */
    private static final String DEFAULT_TIME_FORMAT = "HH:mm:ss";

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private JackJsonUtils() {
        throw new IllegalStateException("Utility class");
    }

    static {
        JavaTimeModule javaTimeModule = new JavaTimeModule();
        javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_TIME_FORMAT)));
        javaTimeModule.addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_TIME_FORMAT)));

        javaTimeModule.addSerializer(LocalDate.class, new LocalDateSerializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_FORMAT)));
        javaTimeModule.addDeserializer(LocalDate.class, new LocalDateDeserializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_FORMAT)));

        javaTimeModule.addSerializer(LocalTime.class, new LocalTimeSerializer(DateTimeFormatter.ofPattern(DEFAULT_TIME_FORMAT)));
        javaTimeModule.addDeserializer(LocalTime.class, new LocalTimeDeserializer(DateTimeFormatter.ofPattern(DEFAULT_TIME_FORMAT)));

        OBJECT_MAPPER.registerModule(javaTimeModule);

        OBJECT_MAPPER.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    }

    /**
     * 对象转为json
     *
     * @param object
     * @return
     */
    @SneakyThrows
    public static String toJSONString(Object object) {
        return OBJECT_MAPPER.writeValueAsString(object);
    }

    /**
     * json转为对象
     *
     * @param json
     * @return
     */
    @SneakyThrows
    public static Object parseObject(String json) {
        return OBJECT_MAPPER.readValue(json, Object.class);
    }

    /**
     * json转为对象
     *
     * @param json
     * @return
     */
    @SneakyThrows
    public static <T> T parseObject(String json, Class<T> clazz) {
        return OBJECT_MAPPER.readValue(json, clazz);
    }

    /**
     * 根据TypeReference格式化数据
     *
     * @author hupg
     * @since 2022/8/19 9:46
     */
    public static <T> T parseType(String content, TypeReference<T> valueTypeRef) {
        try {
            return OBJECT_MAPPER.readValue(content, valueTypeRef);
        } catch (IOException e) {
            log.error(e.getMessage(), e);
            return null;
        }
    }

    /**
     * 转换list
     *
     * @param json  json
     * @param clazz 实体类类型
     * @param <T>
     * @return
     */
    @SneakyThrows
    public static <T> List<T> parseArray(String json, Class<T> clazz) {
        final JavaType javaType = OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, clazz);
        return OBJECT_MAPPER.readValue(json, javaType);
    }


}
