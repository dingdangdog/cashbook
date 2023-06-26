package top.oldmoon.cashbook.cloud.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import top.oldmoon.cashbook.cloud.model.AuthInfo;
import top.oldmoon.cashbook.cloud.model.LogDownload;
import top.oldmoon.cashbook.cloud.model.LogUpload;

import java.util.List;

/**
 * 数据库
 *
 * @author dingdangdog
 * @since 1.0
 */
@Mapper
public interface OnlineDao {
    AuthInfo getAuth(@Param("key") String key);

    void saveUploadLog(@Param("upload") LogUpload upload);

    void saveDownloadLog(@Param("download") LogDownload download);

    LogUpload getLastUploadLog(@Param("key") String key);

    void generateAuth(@Param("keys") List<String> keys);
}
