package com.example.reinvent.service;
import java.io.File;
import java.io.FileWriter;
import java.time.LocalDate;
import java.util.Date;
import java.util.Scanner;

import org.springframework.stereotype.Service;


@Service
public class CodeGenerators {
    private static final String BASE36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    private static String toBase36(long num) {
        StringBuilder result = new StringBuilder();
        do {
            result.insert(0, BASE36.charAt((int) (num % 36)));
            num /= 36;
        } while (num > 0);
        return result.toString();
    }
    public static String generateNewCustomerId() {

        long timestamp = new Date().getTime(); // Current time in milliseconds
        String base36Id = toBase36(timestamp); // Convert timestamp to Base36

        // Pad with leading zeros if the Base36 result is shorter than 7 characters
        while (base36Id.length() < 7) {
            base36Id = "0" + base36Id;
        }

        // Ensure it's exactly 7 characters (truncate extra characters if needed)
        return base36Id.substring(base36Id.length() - 7);
    }

//-------------------------------------------------------------------------------------------

    public static String generateNewReferralId() {

        try {

            LocalDate today = LocalDate.now();
            int dayOfMonth = today.getDayOfMonth();
            int month = today.getMonthValue();
            int yearLastDigit = today.getYear() % 10;

            String path = "src/main/resources/static/char.txt";

            File file = new File(path);
            Scanner scanner = new Scanner(file);

            char c = '@';
            if (scanner.hasNextLine()) {
                String s = scanner.nextLine();
                int len = s.length();
                String mmydd1 = s.substring(0, len - 1); // fetched referalId month year and Date
                String mmydd2 = String.format("%02d%d%02d", month, yearLastDigit, dayOfMonth); // todays moth year and
                                                                                               // date

                if (mmydd1.equals(mmydd2)) {
                    c = s.charAt(len - 1);
                    if (c < 'a' && c >= 'Z')
                        c = 96;
                }
            }
            scanner.close();

            char currentChar = c;
            char nextChar = (char) (currentChar + 1);

            // Generate referral ID: MMYDDA
            String referralId = String.format("%02d%d%02d%c", month, yearLastDigit, dayOfMonth, nextChar);

            FileWriter fileWriter = new FileWriter(path);
            fileWriter.write(referralId);
            fileWriter.close();
            return referralId;
        } catch (Exception e) {
            return null;
        }
    }

    public static void main(String[] args) {
        System.out.println(generateNewCustomerId());
        System.out.println(generateNewReferralId());
    }
}
