package top.oldmoon.cashbook.cloud.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * 公共工具方法
 *
 * @author dingdangdog
 * @since 1.0
 */
public class CommonUtils {

    // 生成指定长度的随机字节数组
    public static byte[] generateRandomBytes(int length) {
        byte[] randomBytes = new byte[length];
        SecureRandom secureRandom = new SecureRandom();
        secureRandom.nextBytes(randomBytes);
        return randomBytes;
    }

    // 将字节数组转换为 16 进制字符串
    public static String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = String.format("%02x", b);
            hexString.append(hex);
        }
        return hexString.toString();
    }

    public static String getSystem() {
        String s = bytesToHex(generateRandomBytes(32));
        return s.toUpperCase();
    }

//    public static void main(String[] args) throws NoSuchAlgorithmException {

        // 将密码和盐值混合后进行加密
//        String system = getSystem();
//        String salt = "123";
//        System.out.println(password);
//        byte[] hashedPassword = hashPassword(system, salt);
//        Base64.Encoder encoder = Base64.getEncoder();
//        String encodedString = encoder.encodeToString(hashedPassword);
//        System.out.println(encodedString);

        // 验证密码
//        String hashedPassword = "XIQmIpOG+2xv0VOUC2+YjXmDLNUwJIrEmqXf+x6092g=";
//        String system = "E9B9E9B0CB4843C2E9408FA3CE88402DF7910719D9B471988F65D7B66908F18F";
//        String salt = "123";
//        boolean isMatch = verifyPassword(hashedPassword, system, salt);
//        System.out.println("Password match: " + isMatch);
//    }


    // 加密密码

    /**
     * 将system和salt进行加盐加密
     *
     * @param system 系统key
     * @param salt   系统盐
     */
    public static String hashPassword(String system, String salt) throws NoSuchAlgorithmException {
        MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
        messageDigest.reset();
        messageDigest.update(salt.getBytes(StandardCharsets.UTF_8));
        byte[] hashedPassword = messageDigest.digest(system.getBytes(StandardCharsets.UTF_8));
        Base64.Encoder encoder = Base64.getEncoder();
        return encoder.encodeToString(hashedPassword);
    }

    /**
     * 验证密码
     *
     * @param password 接口传入密钥
     * @param system   系统key
     * @param salt     系统盐
     */
    public static boolean verifyPassword(String password, String system, String salt) throws NoSuchAlgorithmException {
        String hashedSystem = hashPassword(system, salt);
        return MessageDigest.isEqual(password.getBytes(StandardCharsets.UTF_8), hashedSystem.getBytes(StandardCharsets.UTF_8));
    }
}








