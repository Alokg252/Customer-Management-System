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
            CellStyle style = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            font.setColor(IndexedColors.BLACK1.getIndex());
            style.setFont(font);

            // Header Row
            Row headerRow = sheet.createRow(0);
            Cell c1 = headerRow.createCell(0);
            c1.setCellValue("Name");
            c1.setCellStyle(style);

            Cell c2 = headerRow.createCell(1);
            c2.setCellValue("Number");
            c2.setCellStyle(style);

            Cell c3 = headerRow.createCell(2);
            c3.setCellValue("Total Spent");
            c3.setCellStyle(style);

            Cell c4 = headerRow.createCell(3);
            c4.setCellValue("Last Visited");
            c4.setCellStyle(style);

            // Data Rows
            int rowIndex = 1;
            for (Transaction user : users) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(user.getCustomerName());
                row.createCell(1).setCellValue(user.getMobile());
                row.createCell(2).setCellValue(user.getTotalAmount());
                row.createCell(3).setCellValue(
                    LocalDateTime.parse(user.getDate(), DateTimeFormatter.ISO_DATE_TIME)
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                }

            // Autosize Columns
            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);

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
