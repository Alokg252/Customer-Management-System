package com.example.reinvent.service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Date;
import java.util.Scanner;

import org.springframework.stereotype.Service;

import com.example.reinvent.entity.Transaction;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;

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

    // -------------------------------------------------------------------------------------------

    public static String generateNewReferralId() {

        try {

            LocalDate today = LocalDate.now();
            int dayOfMonth = today.getDayOfMonth();
            int month = today.getMonthValue();
            int yearLastDigit = today.getYear() % 10;

            String path = "lrc.txt";
            File file = new File(path);
            Scanner scanner = null;

            try {
                scanner = new Scanner(file);
            } catch (FileNotFoundException e) {
                System.out.println("created " + file.getName() + " to store last generated referral id");
                file.createNewFile();
                // Files.getFileAttributeView(file.toPath(),
                // DosFileAttributeView.class).setHidden(true);
                scanner = new Scanner(file);
            } catch (Exception e) {
                System.out.println("idc" + e);
            }
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
            System.out.println(
                    "error:" + e);
            return null;
        }
    }

    // receipt generator
    public static byte[] generateReceipt(Transaction transaction) throws IOException {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Add light background and border
            PdfPage page = pdf.addNewPage();
            PdfCanvas canvas = new PdfCanvas(page);
            Rectangle pageSize = page.getPageSize();
            canvas.fill().setFillColorRgb(0.9f, 0.9f, 0.9f);
            canvas.rectangle(0, 0, pageSize.getWidth(), pageSize.getHeight()).fill().setFillColorRgb(1f, 1f, 0.95f);
            canvas.fill();

            canvas.setStrokeColor(ColorConstants.BLACK);
            canvas.setLineWidth(1);
            canvas.rectangle(20, 20, pageSize.getWidth() - 40, pageSize.getHeight() - 40).fill()
                    .setFillColor(ColorConstants.BLACK);
            canvas.stroke();

            // Shop name at center
            PdfFont boldFont = PdfFontFactory.createFont("Helvetica-Bold");
            Paragraph shopName = new Paragraph("INVOICE" + "")
                    .setFont(boldFont)
                    .setFontSize(18)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.DARK_GRAY);
            document.add(shopName);

            // Date at top-right
            Paragraph date = new Paragraph(LocalDate.now().toString())
                    .setFontSize(10)
                    .simulateBold()
                    .setFontColor(ColorConstants.DARK_GRAY)
                    .setTextAlignment(TextAlignment.RIGHT);
            document.add(date);

            document.add(new LineSeparator(new SolidLine()));

            // Customer details at left
            Paragraph customerDetails = new Paragraph()
                    .add(new Text("Customer ID: ").simulateBold())
                    .add(new Text(transaction.getCustomerId() + "\n"))
                    .add(new Text("Customer Name: ").simulateBold())
                    .add(new Text(transaction.getCustomerName() + "\n"))
                    .add(new Text("Contact: ").simulateBold())
                    .add(new Text(transaction.getMobile() + "\n"))
                    .setMarginLeft(40)
                    .setMarginTop(80)
                    .setFontSize(12)
                    .setFontColor(ColorConstants.BLACK);
            document.add(customerDetails);

            // Table for transaction details
            Table table = new Table(3)
                    .setMarginLeft(40)
                    .setMarginTop(40)
                    .setFontColor(ColorConstants.BLACK).setBackgroundColor(ColorConstants.WHITE);

            table.addCell(new Cell().add(new Paragraph("Product").simulateBold().setTextAlignment(TextAlignment.CENTER)
                    .setPaddings(0, 80, 0, 80)));
            table.addCell(new Cell().add(new Paragraph("Quantity").simulateBold().setTextAlignment(TextAlignment.CENTER)
                    .setPaddings(0, 20, 0, 20)));
            table.addCell(new Cell().add(new Paragraph("Price").simulateBold().setTextAlignment(TextAlignment.CENTER)
                    .setPaddings(0, 30, 0, 30)));

            transaction.getDetails().forEach(detail -> {

                table.addCell(detail.getProductName()).setFontColor(ColorConstants.BLACK)
                        .setTextAlignment(TextAlignment.CENTER);
                table.addCell(detail.getQuantity() + "").setFontColor(ColorConstants.BLACK)
                        .setTextAlignment(TextAlignment.CENTER);
                table.addCell(detail.getAmount() + "").setFontColor(ColorConstants.BLACK)
                        .setTextAlignment(TextAlignment.CENTER);

            });

            table.addCell(new Cell(1, 2).add(new Paragraph("Grand Total")
                    .simulateBold()
                    .setFontColor(ColorConstants.BLACK)));

            table.addCell(new Cell().add(new Paragraph("Rs." + transaction.getTotalAmount())
                    .simulateBold()
                    .setFontColor(ColorConstants.BLACK)));

            document.add(table);

            // Slogan
            Paragraph slogan = new Paragraph("“Your satisfaction is our priority!”")
                    .setFontSize(10)
                    .setFontColor(ColorConstants.DARK_GRAY)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setMarginTop(30);
            document.add(slogan);
            document.close();

            return baos.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
