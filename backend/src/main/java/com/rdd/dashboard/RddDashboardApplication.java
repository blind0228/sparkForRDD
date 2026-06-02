package com.rdd.dashboard;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RddDashboardApplication {

	public static void main(String[] args) {
		// Load .env from current directory or ./backend
		Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();
		
		// If DB_URL is still null, try looking in ./backend
		if (dotenv.get("DB_URL") == null) {
			dotenv = Dotenv.configure()
					.directory("./backend")
					.ignoreIfMissing()
					.load();
		}

		dotenv.entries().forEach(entry -> {
			if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
				System.setProperty(entry.getKey(), entry.getValue());
			}
		});
		
		SpringApplication.run(RddDashboardApplication.class, args);
	}

}
