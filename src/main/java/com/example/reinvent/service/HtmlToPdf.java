package com.example.reinvent.service;

import com.itextpdf.html2pdf.HtmlConverter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
// import com.itextpdf.kernel.pdf.PdfConfenerance;

public class HtmlToPdf {
    public static void main(String[] args) throws IOException {
        // Path to HTML file
        String htmlSource = "receipt.html";
        
        // Output PDF file
        String pdfDest = "receipt.pdf";
        
        // Read HTML content
        String htmlContent = new String(Files.readAllBytes(Paths.get(htmlSource)));

        // Replace dynamic placeholders in the HTML
        htmlContent = htmlContent.replace("{{date}}", java.time.LocalDate.now().toString());
        System.out.println(htmlContent);

        // Convert HTML to PDF
        HtmlConverter.convertToPdf(htmlContent, new FileOutputStream(pdfDest));

        System.out.println("PDF created successfully!");
    }
}
