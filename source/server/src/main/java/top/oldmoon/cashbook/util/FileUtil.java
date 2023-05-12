package top.oldmoon.cashbook.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.util.Locale;

/**
 * 文件操作工具类
 *
 * @author ddd
 * @since 1.0
 */
public class FileUtil {

    private static final Logger logger = LoggerFactory.getLogger(FileUtil.class);

    public static String getFileInfo(File file) throws IOException {
        StringBuilder stringBuilder = new StringBuilder();
        FileReader fileReader = new FileReader(file);
        BufferedReader in = new BufferedReader(fileReader);

        if (checkFileSize( file.length(),50,"M")){
            throw new IllegalStateException("File to be unzipped is huge.");
        }

        try {
            String str;
            while ((str = in.readLine()) != null) {
                stringBuilder.append(str);
            }
        } catch (IOException e) {
            logger.error(e.getMessage(), e);
        } finally {
            try {
                if (in != null) {
                    in.close();
                }
            } catch (Exception e) {
                logger.error(e.getMessage(), e);
            }
            try {
                if (fileReader != null) {
                    fileReader.close();
                }
            } catch (Exception e) {
                logger.error(e.getMessage(), e);
            }
        }
        return stringBuilder.toString();
    }

    /**
     * 判断文件大小
     *
     * @param len
     *            文件长度
     * @param size
     *            限制大小
     * @param unit
     *            限制单位（B,K,M,G）
     * @return
     */
    public static boolean checkFileSize(Long len, int size, String unit) {
        double fileSize = 0;
        if ("B".equals(unit.toUpperCase(Locale.ENGLISH))) {
            fileSize = (double) len;
        } else if ("K".equals(unit.toUpperCase(Locale.ENGLISH))) {
            fileSize = (double) len / 1024;
        } else if ("M".equals(unit.toUpperCase(Locale.ENGLISH))) {
            fileSize = (double) len / 1048576;
        } else if ("G".equals(unit.toUpperCase(Locale.ENGLISH))) {
            fileSize = (double) len / 1073741824;
        }
        if (fileSize < size) {
            return false;
        }
        return true;
    }

    /**
     * @param filePath 文件路径
     * @param fileName 文件名
     * @param fileInfo 文件内容
     * @description 根据入参，保存文件
     */
    public static void saveFile(String filePath, String fileName, String fileInfo) throws IOException {
        File file = new File(filePath + fileName);
        if (!file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }
        FileWriter fw = new FileWriter(file);
        try {
            // 判断file是否存在
            if (!file.exists()) {
                // 如果不存在file文件，则创建
                file.createNewFile();
            }
            fw.write(fileInfo);
            // 这里要说明一下，write方法是写入缓存区，并没有写进file文件里面，要使用flush方法才写进去
            fw.flush();
        } catch (IOException e) {
            logger.error(e.getMessage(), e);
        } finally {
            try {
                if (fw != null) {
                    fw.close();
                }
            } catch (Exception e) {
                logger.error(e.getMessage(), e);
            }
        }
    }

}
