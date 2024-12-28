package com.example.reinvent;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ReinventApplication {

	public static void exec() {
		try {
			ProcessBuilder processBuilder = new ProcessBuilder("cmd.exe", "/c", "start http://127.0.0.1:80");
			Process process = processBuilder.start();
			int exitCode = process.waitFor();
			System.out.println("executed with exit code: " + exitCode);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void main(String[] args) {
		SpringApplication.run(ReinventApplication.class, args);
		System.out.println("ready..");
		// exec();

	}
}
