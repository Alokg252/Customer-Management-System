package com.example.reinvent.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import com.example.reinvent.entity.Transaction;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExcelExportService {

    public static byte[] exportUserDataToExcel(List<Transaction> users) {

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Users");

            // Style
            CellStyle styleCenter = workbook.createCellStyle();
            styleCenter.setAlignment(HorizontalAlignment.CENTER);

            CellStyle style = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            font.setColor(IndexedColors.BLACK1.getIndex());
            style.setFont(font);
            style.setAlignment(HorizontalAlignment.CENTER);

            // Header Row
            Row row = sheet.createRow(0);
            Cell c;
            String[] vals = { "Name", "Mobile", "Total Spent (₹)", "Last Visited" };
            for (int i = 0; i < vals.length; i++) {
                c = row.createCell(i);
                c.setCellValue(vals[i]);
                c.setCellStyle(style);
            }

            // Data Rows
            int rowIndex = 1;
            for (Transaction user : users) {
                row = sheet.createRow(rowIndex++);

                vals[0] = user.getCustomerName();
                vals[1] = user.getMobile();
                vals[2] = user.getTotalAmount() + "";
                vals[3] = LocalDateTime.parse(user.getDate(), DateTimeFormatter.ISO_DATE_TIME)
                        .format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

                for (int i = 0; i < vals.length; i++) {
                    c = row.createCell(i);
                    c.setCellValue(vals[i]);
                    c.setCellStyle(styleCenter);
                }
            }

            // Autosize Columns
            for (int i = 0; i < 4; i++)
                sheet.autoSizeColumn(i);

            // Write to ByteArrayOutputStream
            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                workbook.write(outputStream);
                return outputStream.toByteArray();
            }
        } catch (IOException e) {
            throw new RuntimeException("Error while exporting data to Excel", e);
        }
    }
}
