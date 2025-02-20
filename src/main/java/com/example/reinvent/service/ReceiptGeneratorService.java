package com.example.reinvent.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;

import com.example.reinvent.entity.Transaction;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
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
import com.itextpdf.layout.properties.VerticalAlignment;

@Service
public class ReceiptGeneratorService {
        
    public static byte[] generateReceipt(Transaction transaction, String CurrentShopName) throws IOException {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Add light background and border
            PdfPage page = pdf.addNewPage();
            PdfCanvas canvas = new PdfCanvas(page);
            Rectangle pageSize = page.getPageSize();
            canvas.fill().setFillColorRgb(0.4f, 0.4f, 0.4f);
            canvas.rectangle(0, 0, pageSize.getWidth(), pageSize.getHeight())
                    .fill().setFillColorRgb(1f, 1f, 1f);
            canvas.fill();

            canvas.setStrokeColor(ColorConstants.BLACK);
            canvas.setLineWidth(1);
            canvas.rectangle(20, 20, pageSize.getWidth() - 40, pageSize.getHeight() - 40).fill()
                    .setFillColor(ColorConstants.BLACK);
            canvas.stroke();

            // Shop name at center
            PdfFont boldFont = PdfFontFactory.createFont("Helvetica-Bold");

            Paragraph shopName = new Paragraph(CurrentShopName)
                    .setFont(boldFont)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.LEFT)
                    .setVerticalAlignment(VerticalAlignment.BOTTOM)
                    .setFontColor(ColorConstants.DARK_GRAY);
            document.add(shopName);

            // Date at top-right
            Paragraph date = new Paragraph(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                    .setFontSize(10)
                    .setFontColor(ColorConstants.DARK_GRAY)
                    .setVerticalAlignment(VerticalAlignment.TOP)
                    .setTextAlignment(TextAlignment.LEFT);
            document.add(date);

            // Invoice between horizontal lines
            document.add(new LineSeparator(new SolidLine()).setMarginTop(20));
            Paragraph invoice = new Paragraph("INVOICE")
                    .setFontSize(22)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.DARK_GRAY);
            document.add(invoice);
            document.add(new LineSeparator(new SolidLine()));

            // Customer details at left
            Paragraph detailsTitle = new Paragraph()
                    .add(new Text("Customer Details :-").simulateBold().setUnderline())
                    .setFontSize(13)
                    .setMarginLeft(30)
                    .setMarginRight(300)
                    .setFontColor(ColorConstants.GRAY)
                    .setMarginTop(30);

            // Customer Informations
            Paragraph customerDetails = new Paragraph()
                    .add(new Text("Customer ID: ").simulateBold())
                    .add(new Text(transaction.getCustomerId() + "\n"))
                    .add(new Text("Customer Name: ").simulateBold())
                    .add(new Text(transaction.getCustomerName() + "\n"))
                    .add(new Text("Contact: ").simulateBold())
                    .add(new Text(transaction.getMobile() + "\n"))
                    .setMarginLeft(40)
                    .setMarginTop(4)
                    .setFontSize(12)
                    .setFontColor(ColorConstants.BLACK);

            document.add(detailsTitle).add(customerDetails);

            // Table Headers for transaction details
            Table table = new Table(3)
                    .setMarginLeft(40)
                    .setMarginTop(60)
                    .setFontColor(ColorConstants.BLACK).setBackgroundColor(new DeviceRgb(220, 220, 220));

            table.addCell(new Cell().add(new Paragraph("Product").simulateBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.WHITE)
                    .setPaddings(0, 80, 0, 80))
                    .setBackgroundColor(ColorConstants.DARK_GRAY));
                    
            table.addCell(new Cell().add(new Paragraph("Quantity").simulateBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.WHITE)
                    .setPaddings(0, 20, 0, 20))
                    .setBackgroundColor(ColorConstants.DARK_GRAY));

            table.addCell(new Cell().add(new Paragraph("Price").simulateBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.WHITE)
                    .setPaddings(0, 30, 0, 30))
                    .setBackgroundColor(ColorConstants.DARK_GRAY));

            // Tables Cells for Transaction Details
            transaction.getDetails().forEach(detail -> {

                table.addCell(detail.getProductName()).setFontColor(ColorConstants.BLACK)
                        .setTextAlignment(TextAlignment.CENTER);
                table.addCell(detail.getQuantity() + "").setFontColor(ColorConstants.BLACK)
                        .setTextAlignment(TextAlignment.CENTER);
                table.addCell(detail.getAmount() + "").setFontColor(ColorConstants.BLACK)
                        .setTextAlignment(TextAlignment.CENTER);

            });

            // Tables Footer for Transaction Grand Total
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
