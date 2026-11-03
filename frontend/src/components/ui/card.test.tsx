import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

describe("Card (FE-02)", () => {
  it("renderuje složene dijelove u ispravne tagove", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Naslov</CardTitle>
        </CardHeader>
        <CardContent>Sadržaj</CardContent>
      </Card>,
    );
    expect(screen.getByTestId("card")).toHaveClass(
      "rounded-xl",
      "bg-background",
    );
    expect(screen.getByText("Naslov").tagName).toBe("H3");
    expect(screen.getByText("Sadržaj")).toHaveClass("p-6", "pt-0");
  });

  it("spaja custom className na kartici", () => {
    render(<Card className="mt-4" data-testid="card" />);
    expect(screen.getByTestId("card")).toHaveClass("mt-4", "rounded-xl");
  });
});
