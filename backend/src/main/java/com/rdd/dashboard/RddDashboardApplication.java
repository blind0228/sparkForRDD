package com.rdd.dashboard;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class RddDashboardApplication {

	public static void main(String[] args) {
		// Load .env from current directory or ./backend
		Dotenv dotenv = loadDotenv();

		dotenv.entries().forEach(entry -> {
			if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
				System.setProperty(entry.getKey(), entry.getValue());
			}
		});
		
		SpringApplication.run(RddDashboardApplication.class, args);
	}

	@Bean
	public Dotenv dotenv() {
		return loadDotenv();
	}

	private static Dotenv loadDotenv() {
		Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();
		
		if (dotenv.get("DB_URL") == null) {
			dotenv = Dotenv.configure()
					.directory("./backend")
					.ignoreIfMissing()
					.load();
		}
		return dotenv;
	}
}
