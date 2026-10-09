import { fireEvent, render, screen } from "@testing-library/react";
import DesignResultPage from "./DesignResultPage";

test("asks for body proportions before revealing the generated design", () => {
  render(
    <DesignResultPage
      prompt="A handwoven silk sari"
      generatedImage="data:image/png;base64,generated-design"
      isGenerating={false}
      generationStep={4}
      generationError=""
      onBack={() => {}}
      onGenerateAgain={() => {}}
    />
  );

  expect(screen.getByRole("heading", { name: /a considered fit/i })).toBeInTheDocument();
  expect(screen.queryByRole("img", { name: /generated threadlabs fashion design/i })).not.toBeInTheDocument();

  ["HEIGHT in cm", "BUST / CHEST in cm", "WAIST in cm", "HIPS in cm", "SHOULDER WIDTH in cm"].forEach((label, index) => {
    fireEvent.change(screen.getByLabelText(label), { target: { value: String(160 + index * 5) } });
  });

  fireEvent.click(screen.getByRole("button", { name: /reveal my final design/i }));

  expect(screen.getByRole("img", { name: /generated threadlabs fashion design/i })).toBeInTheDocument();
  expect(screen.getByText(/fit profile added/i)).toBeInTheDocument();
});
