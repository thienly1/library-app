import { test, expect } from "@playwright/test";

// Reset database before each test
test.beforeEach(async ({ request }) => {
  // Clean up any existing books
  const response = await request.get("http://localhost:8000/api/books");
  const books = await response.json();
  for (const book of books) {
    await request.delete(`http://localhost:8000/api/books/${book.id}`);
  }
});

test.describe("Home Page", () => {
  test("should display hero section and navigation", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Your Personal Library" })
    ).toBeVisible();
    await expect(page.getByTestId("browse-btn")).toBeVisible();
    await expect(page.getByTestId("add-btn")).toBeVisible();
  });

  test("should display library statistics", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("stats")).toBeVisible();
    await expect(page.getByTestId("total-books")).toBeVisible();
    await expect(page.getByTestId("total-authors")).toBeVisible();
    await expect(page.getByTestId("total-genres")).toBeVisible();
  });

  test("should navigate to books page from hero button", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("browse-btn").click();
    await expect(page).toHaveURL("/books");
  });
});

test.describe("Books Page", () => {
  test("should display empty state when no books", async ({ page }) => {
    await page.goto("/books");

    await expect(page.getByTestId("empty-state")).toBeVisible();
    await expect(page.getByText("No books found")).toBeVisible();
  });

  test("should navigate to add book page", async ({ page }) => {
    await page.goto("/books");

    await page.getByTestId("add-book-btn").click();
    await expect(page).toHaveURL("/books/add");
  });
});

test.describe("Add Book", () => {
  test("should create a new book successfully", async ({ page }) => {
    await page.goto("/books/add");

    await page.getByTestId("title-input").fill("The Great Gatsby");
    await page.getByTestId("author-input").fill("F. Scott Fitzgerald");
    await page.getByTestId("year-input").fill("1925");
    await page.getByTestId("genre-input").fill("Fiction");

    await page.getByTestId("submit-btn").click();

    // Should redirect to book detail page
    await expect(page).toHaveURL(/\/books\/\d+/);
    await expect(
      page.getByRole("heading", { name: "The Great Gatsby" })
    ).toBeVisible();
  });

  test("should show validation error for empty title", async ({ page }) => {
    await page.goto("/books/add");

    await page.getByTestId("author-input").fill("Test Author");
    await page.getByTestId("submit-btn").click();

    await expect(page.getByTestId("title-error")).toBeVisible();
    await expect(page.getByTestId("title-error")).toContainText(
      "Title is required"
    );
  });

  test("should show validation error for empty author", async ({ page }) => {
    await page.goto("/books/add");

    await page.getByTestId("title-input").fill("Test Book");
    await page.getByTestId("submit-btn").click();

    await expect(page.getByTestId("author-error")).toBeVisible();
    await expect(page.getByTestId("author-error")).toContainText(
      "Author is required"
    );
  });
});

test.describe("Book CRUD Operations", () => {
  test("should display books in grid after creation", async ({
    page,
    request,
  }) => {
    // Create a book via API
    await request.post("http://localhost:8000/api/books", {
      data: {
        title: "Test Book",
        author: "Test Author",
        year: 2024,
        genre: "Test Genre",
      },
    });

    await page.goto("/books");

    await expect(page.getByTestId("books-grid")).toBeVisible();
    await expect(page.getByText("Test Book", { exact: true })).toBeVisible();
    await expect(page.getByText("Test Author")).toBeVisible();
  });

  test("should view book details", async ({ page, request }) => {
    // Create a book via API
    const response = await request.post("http://localhost:8000/api/books", {
      data: {
        title: "Detail Test Book",
        author: "Detail Author",
        isbn: "978-1234567890",
        year: 2020,
        genre: "Mystery",
      },
    });
    const book = await response.json();

    await page.goto(`/books/${book.id}`);

    await expect(page.getByTestId("book-detail")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Detail Test Book" })
    ).toBeVisible();
    await expect(page.getByText("Detail Author")).toBeVisible();
    await expect(page.getByText("978-1234567890")).toBeVisible();
  });

  test("should edit a book", async ({ page, request }) => {
    // Create a book via API
    const response = await request.post("http://localhost:8000/api/books", {
      data: { title: "Original Title", author: "Original Author" },
    });
    const book = await response.json();

    await page.goto(`/books/${book.id}/edit`);

    await page.getByTestId("title-input").clear();
    await page.getByTestId("title-input").fill("Updated Title");
    await page.getByTestId("submit-btn").click();

    // Should redirect to detail page with updated title
    await expect(page).toHaveURL(`/books/${book.id}`);
    await expect(
      page.getByRole("heading", { name: "Updated Title" })
    ).toBeVisible();
  });

  test("should delete a book from detail page", async ({ page, request }) => {
    // Create a book via API
    const response = await request.post("http://localhost:8000/api/books", {
      data: { title: "To Delete", author: "Delete Author" },
    });
    const book = await response.json();

    await page.goto(`/books/${book.id}`);

    page.on("dialog", (dialog) => dialog.accept());
    await page.getByTestId("book-detail").getByTestId("delete-btn").click();

    // Should redirect to books page
    await expect(page).toHaveURL("/books");

    // Book should no longer be visible
    await expect(page.getByText("To Delete")).not.toBeVisible();
  });

  test("should delete a book from books list", async ({ page, request }) => {
    // Create a book via API
    await request.post("http://localhost:8000/api/books", {
      data: { title: "List Delete Book", author: "Test Author" },
    });

    await page.goto("/books");

    // Wait for the book card to be visible
    const bookCard = page
      .getByTestId("book-card")
      .filter({ hasText: "List Delete Book" });
    await expect(bookCard).toBeVisible();

    page.on("dialog", (dialog) => dialog.accept());
    await bookCard.getByTestId("delete-btn").click();

    // Book should be removed from list
    await expect(page.getByText("List Delete Book")).not.toBeVisible();
  });
});

test.describe("Search Functionality", () => {
  test("should search books by title", async ({ page, request }) => {
    // Create multiple books
    await request.post("http://localhost:8000/api/books", {
      data: { title: "JavaScript Guide", author: "John Doe" },
    });
    await request.post("http://localhost:8000/api/books", {
      data: { title: "Python Basics", author: "Jane Smith" },
    });

    await page.goto("/books");

    await page.getByTestId("search-input").fill("JavaScript");

    await expect(page.getByText("JavaScript Guide")).toBeVisible();
    await expect(page.getByText("Python Basics")).not.toBeVisible();
  });

  test("should search books by author", async ({ page, request }) => {
    // Create multiple books
    await request.post("http://localhost:8000/api/books", {
      data: { title: "Book One", author: "Unique Author" },
    });
    await request.post("http://localhost:8000/api/books", {
      data: { title: "Book Two", author: "Other Writer" },
    });

    await page.goto("/books");

    await page.getByTestId("search-input").fill("Unique");

    await expect(page.getByText("Book One")).toBeVisible();
    await expect(page.getByText("Book Two")).not.toBeVisible();
  });

  test("should clear search and show all books", async ({ page, request }) => {
    await request.post("http://localhost:8000/api/books", {
      data: { title: "Book A", author: "Author A" },
    });
    await request.post("http://localhost:8000/api/books", {
      data: { title: "Book B", author: "Author B" },
    });

    await page.goto("/books");

    // Search to filter
    await page.getByTestId("search-input").fill("Book A");
    await expect(page.getByText("Book B")).not.toBeVisible();

    // Clear search
    await page.getByTestId("clear-search").click();

    // Both books should be visible
    await expect(page.getByText("Book A")).toBeVisible();
    await expect(page.getByText("Book B")).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("should navigate between pages using header links", async ({ page }) => {
    await page.goto("/");

    // Use more specific selectors for nav links
    await page
      .locator(".nav-links")
      .getByRole("link", { name: "Books" })
      .click();
    await expect(page).toHaveURL("/books");

    await page
      .locator(".nav-links")
      .getByRole("link", { name: "Add Book" })
      .click();
    await expect(page).toHaveURL("/books/add");

    await page
      .locator(".nav-links")
      .getByRole("link", { name: "Home" })
      .click();
    await expect(page).toHaveURL("/");
  });
});
