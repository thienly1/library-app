import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import BookCard from "../src/parts/BookCard";
import BookForm from "../src/parts/BookForm";
import SearchBar from "../src/parts/SearchBar";
import Loading from "../src/parts/Loading";
import Message from "../src/parts/Message";

// Helper to wrap components with Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {component}
    </BrowserRouter>
  );
};

describe("BookCard Component", () => {
  const mockBook = {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    year: 1925,
    genre: "Fiction",
  };

  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render book title and author", () => {
    renderWithRouter(<BookCard book={mockBook} onDelete={mockOnDelete} />);

    expect(screen.getByText("The Great Gatsby")).toBeInTheDocument();
    expect(screen.getByText("by F. Scott Fitzgerald")).toBeInTheDocument();
  });

  it("should render book year when provided", () => {
    renderWithRouter(<BookCard book={mockBook} onDelete={mockOnDelete} />);
    expect(screen.getByText("1925")).toBeInTheDocument();
  });

  it("should render genre tag when provided", () => {
    renderWithRouter(<BookCard book={mockBook} onDelete={mockOnDelete} />);
    expect(screen.getByText("Fiction")).toBeInTheDocument();
  });

  it("should have View, Edit, and Delete buttons", () => {
    renderWithRouter(<BookCard book={mockBook} onDelete={mockOnDelete} />);

    expect(screen.getByText("View")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("should call onDelete with book id when delete is confirmed", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithRouter(<BookCard book={mockBook} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByTestId("delete-btn"));

    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it("should not call onDelete when delete is cancelled", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    renderWithRouter(<BookCard book={mockBook} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByTestId("delete-btn"));

    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});

describe("BookForm Component", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all form fields", () => {
    render(<BookForm onSubmit={mockOnSubmit} />);

    expect(screen.getByTestId("title-input")).toBeInTheDocument();
    expect(screen.getByTestId("author-input")).toBeInTheDocument();
    expect(screen.getByTestId("isbn-input")).toBeInTheDocument();
    expect(screen.getByTestId("year-input")).toBeInTheDocument();
    expect(screen.getByTestId("genre-input")).toBeInTheDocument();
  });

  it("should show validation error for empty title on submit", async () => {
    render(<BookForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByTestId("author-input"), {
      target: { value: "Test Author" },
    });

    fireEvent.click(screen.getByTestId("submit-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("title-error")).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should show validation error for empty author on submit", async () => {
    render(<BookForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByTestId("title-input"), {
      target: { value: "Test Book" },
    });

    fireEvent.click(screen.getByTestId("submit-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("author-error")).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should call onSubmit with form data when valid", async () => {
    render(<BookForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByTestId("title-input"), {
      target: { value: "Test Book" },
    });
    fireEvent.change(screen.getByTestId("author-input"), {
      target: { value: "Test Author" },
    });

    fireEvent.click(screen.getByTestId("submit-btn"));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Book",
          author: "Test Author",
        })
      );
    });
  });

  it("should populate form with initial data", () => {
    const initialData = {
      title: "Existing Book",
      author: "Existing Author",
      year: 2020,
    };

    render(<BookForm onSubmit={mockOnSubmit} initialData={initialData} />);

    expect(screen.getByTestId("title-input")).toHaveValue("Existing Book");
    expect(screen.getByTestId("author-input")).toHaveValue("Existing Author");
    expect(screen.getByTestId("year-input")).toHaveValue(2020);
  });

  it("should disable inputs when isLoading is true", () => {
    render(<BookForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByTestId("title-input")).toBeDisabled();
    expect(screen.getByTestId("author-input")).toBeDisabled();
    expect(screen.getByTestId("submit-btn")).toBeDisabled();
  });

  it("should use custom submit label", () => {
    render(<BookForm onSubmit={mockOnSubmit} submitLabel="Add Book" />);
    expect(screen.getByTestId("submit-btn")).toHaveTextContent("Add Book");
  });
});

describe("SearchBar Component", () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render search input", () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("should call onSearch when typing", () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    fireEvent.change(screen.getByTestId("search-input"), {
      target: { value: "test query" },
    });

    expect(mockOnSearch).toHaveBeenCalledWith("test query");
  });

  it("should show clear button when there is a query", () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    fireEvent.change(screen.getByTestId("search-input"), {
      target: { value: "test" },
    });

    expect(screen.getByTestId("clear-search")).toBeInTheDocument();
  });

  it("should clear search when clear button is clicked", () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByTestId("search-input");
    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.click(screen.getByTestId("clear-search"));

    expect(input).toHaveValue("");
    expect(mockOnSearch).toHaveBeenLastCalledWith("");
  });

  it("should use custom placeholder", () => {
    render(
      <SearchBar onSearch={mockOnSearch} placeholder="Custom placeholder" />
    );
    expect(
      screen.getByPlaceholderText("Custom placeholder")
    ).toBeInTheDocument();
  });
});

describe("Loading Component", () => {
  it("should render loading spinner", () => {
    render(<Loading />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });
});

describe("Message Component", () => {
  it("should render success message", () => {
    render(<Message type="success">Success!</Message>);
    expect(screen.getByTestId("message-success")).toHaveTextContent("Success!");
  });

  it("should render error message", () => {
    render(<Message type="error">Error occurred</Message>);
    expect(screen.getByTestId("message-error")).toHaveTextContent(
      "Error occurred"
    );
  });
});
