import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge (FE-02)", () => {
  it("koristi default varijantu", () => {
    render(<Badge>Novo</Badge>);
    const el = screen.getByText("Novo");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveClass("bg-primary/10", "text-primary");
  });

  it("mijenja boje po varijanti", () => {
    render(<Badge variant="danger">Otkazano</Badge>);
    expect(screen.getByText("Otkazano")).toHaveClass(
      "bg-danger/10",
      "text-danger",
    );
  });

  it("zadržava custom className", () => {
    render(<Badge className="ml-2">Uživo</Badge>);
    expect(screen.getByText("Uživo")).toHaveClass("ml-2", "rounded-full");
  });
});
