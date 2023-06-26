package top.oldmoon.cashbook.cloud.util;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;
import java.util.List;

/**
 * 文件工具
 *
 * @author dingdangdog
 * @since 1.0
 */
public class FileUtils {

    public static void writeFile(String filePath, String fileInfo) throws IOException {
        Path path = Paths.get(filePath);
        Files.write(path, fileInfo.getBytes());
    }

    public static String readFile(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        List<String> lines = Files.readAllLines(path);
        StringBuilder builder = new StringBuilder();
        for (String line : lines) {
            builder.append(line);
        }
        return builder.toString();
    }
}
