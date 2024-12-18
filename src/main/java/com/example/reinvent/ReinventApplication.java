package com.example.reinvent;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;



@SpringBootApplication
public class ReinventApplication{

	public static void exec(String url){
		try {
			ProcessBuilder processBuilder = new ProcessBuilder("cmd.exe","/c", "start "+url);
			Process process = processBuilder.start();
			int exitCode = process.waitFor();
			System.out.println("executed with exit code: " + exitCode);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void main(String[] args) {

		SpringApplication.run(ReinventApplication.class, args);
		System.out.println("apis");
		exec("http://127.0.0.1:8090");
	}
}
