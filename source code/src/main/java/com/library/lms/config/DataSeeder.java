package com.library.lms.config;

import com.library.lms.entity.*;
import com.library.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@SuppressWarnings("null")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(User.builder().username("admin").email("admin@lms.com")
                    .password(passwordEncoder.encode("Admin@123")).role(Role.ADMIN).enabled(true).build());
            userRepository.save(User.builder().username("librarian").email("librarian@lms.com")
                    .password(passwordEncoder.encode("Lib@1234")).role(Role.LIBRARIAN).enabled(true).build());
            userRepository.save(User.builder().username("member").email("member@lms.com")
                    .password(passwordEncoder.encode("Member@123")).role(Role.MEMBER).enabled(true).build());
        }

        if (categoryRepository.count() == 0) {
            categoryRepository.save(Category.builder().name("Fiction").description("Fictional literature").build());
            categoryRepository.save(Category.builder().name("Science").description("Scientific books").build());
            categoryRepository.save(Category.builder().name("Technology").description("Tech and programming").build());
            categoryRepository.save(Category.builder().name("History").description("Historical books").build());
        }

        if (authorRepository.count() == 0) {
            authorRepository.save(Author.builder().name("George Orwell").nationality("British")
                    .biography("English novelist and journalist.").build());
            authorRepository.save(Author.builder().name("Robert C. Martin").nationality("American")
                    .biography("Software engineer and author of Clean Code.").build());
            authorRepository.save(Author.builder().name("Yuval Noah Harari").nationality("Israeli")
                    .biography("Historian and author of Sapiens.").build());
        }

        if (bookRepository.count() == 0) {
            Author orwell = authorRepository.findAll().get(0);
            Author martin = authorRepository.findAll().get(1);
            Author harari = authorRepository.findAll().get(2);
            Category fiction = categoryRepository.findAll().get(0);
            Category tech = categoryRepository.findAll().get(2);
            Category history = categoryRepository.findAll().get(3);

            bookRepository.save(Book.builder().title("1984").isbn("9780451524935").author(orwell)
                    .category(fiction).publicationYear(1949).totalCopies(5).availableCopies(5)
                    .description("Dystopian social science fiction novel.").build());
            bookRepository.save(Book.builder().title("Clean Code").isbn("9780132350884").author(martin)
                    .category(tech).publicationYear(2008).totalCopies(3).availableCopies(3)
                    .description("A handbook of agile software craftsmanship.").build());
            bookRepository.save(Book.builder().title("Sapiens: A Brief History of Humankind").isbn("9780062316097")
                    .author(harari).category(history).publicationYear(2011).totalCopies(4).availableCopies(4)
                    .description("An exploration of human history.").build());
        }

        if (memberRepository.count() == 0) {
            memberRepository.save(Member.builder().fullName("Ram Sharma").email("ram.sharma@example.com")
                    .phone("9800000001").address("Pokhara, Nepal").membershipDate(LocalDate.now())
                    .status(Member.MemberStatus.ACTIVE).build());
            memberRepository.save(Member.builder().fullName("Sita Gurung").email("sita.gurung@example.com")
                    .phone("9800000002").address("Kathmandu, Nepal").membershipDate(LocalDate.now())
                    .status(Member.MemberStatus.ACTIVE).build());
        }
    }
}
