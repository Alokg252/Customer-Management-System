package com.example.reinvent.service;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;

import java.time.LocalDate;

public class ReceiptPDF {
    public static void main(String[] args) throws Exception {
        PdfWriter writer = new PdfWriter("receipt.pdf");
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Add light background and border
        PdfPage page = pdf.addNewPage();
        PdfCanvas canvas = new PdfCanvas(page);
        Rectangle pageSize = page.getPageSize();
        canvas.fill().setFillColorRgb(0.3f,0.3f,0.3f);
        canvas.rectangle(0,0, pageSize.getWidth(), pageSize.getHeight()).fill().setFillColorRgb(1f,1f,0.95f);
        canvas.fill();

        canvas.setStrokeColor(ColorConstants.BLACK);
        canvas.setLineWidth(1);
        canvas.rectangle(20, 20, pageSize.getWidth() - 40, pageSize.getHeight() - 40).fill().setFillColor(ColorConstants.BLACK);
        canvas.stroke();

        // Shop name at center
        PdfFont boldFont = PdfFontFactory.createFont("Helvetica-Bold");
        Paragraph shopName = new Paragraph("Shop Name")
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

        // Customer details at left
        Paragraph customerDetails = new Paragraph()
                .add(new Text("Customer Name: ").simulateBold())
                .add(new Text("Alok Gupta\n"))
                .add(new Text("Contact: ").simulateBold())
                .add(new Text("8319237524\n"))
                .add(new Text("Address: ").simulateBold())
                .add(new Text("Durg, Bhilai\n"))
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
                
        table.addCell(new Cell().add(new Paragraph("Product").simulateBold().setTextAlignment(TextAlignment.CENTER).setPaddings(0, 80, 0, 80)));
        table.addCell(new Cell().add(new Paragraph("Quantity").simulateBold().setTextAlignment(TextAlignment.CENTER).setPaddings(0, 20, 0, 20)));
        table.addCell(new Cell().add(new Paragraph("Price").simulateBold().setTextAlignment(TextAlignment.CENTER).setPaddings(0, 30, 0, 30)));

        table.addCell("Product 1").setFontColor(ColorConstants.BLACK).setTextAlignment(TextAlignment.CENTER);
        table.addCell("2").setFontColor(ColorConstants.BLACK).setTextAlignment(TextAlignment.CENTER);
        table.addCell("$10").setFontColor(ColorConstants.BLACK).setTextAlignment(TextAlignment.CENTER);

        table.addCell("Product 2").setFontColor(ColorConstants.BLACK).setTextAlignment(TextAlignment.CENTER);
        table.addCell("1").setFontColor(ColorConstants.BLACK).setTextAlignment(TextAlignment.CENTER);
        table.addCell("$15").setFontColor(ColorConstants.BLACK).setTextAlignment(TextAlignment.CENTER);

        table.addCell(new Cell(1, 2).add(new Paragraph("Grand Total")
                                    .simulateBold()
                                    .setFontColor(ColorConstants.BLACK)));

        table.addCell(new Cell().add(new Paragraph("$35")
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
        System.out.println("PDF created successfully!");
    }
}
