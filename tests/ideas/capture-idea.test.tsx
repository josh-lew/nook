import {
  render,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import CaptureIdeaScreen from "@/app/(app)/capture-idea";

const mockBack = jest.fn();
const mockInsertIdea = jest.fn();
const mockUploadProjectPhoto = jest.fn();
const mockInsertProjectPhoto = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

jest.mock("../../lib/projects", () => ({
  insertIdea: (...args: unknown[]) => mockInsertIdea(...args),
  uploadProjectPhoto: (...args: unknown[]) => mockUploadProjectPhoto(...args),
  insertProjectPhoto: (...args: unknown[]) => mockInsertProjectPhoto(...args),
}));

async function renderCapture() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <CaptureIdeaScreen />
    </SafeAreaProvider>,
  );
}

describe("Quick capture", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsertIdea.mockResolvedValue({ data: { id: "idea-1" }, error: null });
  });

  it("saves an Idea with only a title", async () => {
    const user = userEvent.setup();
    await renderCapture();

    await user.type(screen.getByLabelText("Title"), "Granny square bag");
    await user.press(screen.getByRole("button", { name: "Save idea" }));

    await waitFor(() => {
      expect(mockInsertIdea).toHaveBeenCalledWith({
        title: "Granny square bag",
        description: null,
      });
    });
    expect(mockUploadProjectPhoto).not.toHaveBeenCalled();
    await waitFor(() => expect(mockBack).toHaveBeenCalled());
  });

  it("can't save without a title", async () => {
    const user = userEvent.setup();
    await renderCapture();

    await user.type(screen.getByLabelText("Description"), "Saw it on Instagram");
    await user.press(screen.getByRole("button", { name: "Save idea" }));

    expect(await screen.findByText("Title is required")).toBeOnTheScreen();
    expect(mockInsertIdea).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("shows a save error and stays open", async () => {
    mockInsertIdea.mockResolvedValueOnce({ data: null, error: "Network down" });
    const user = userEvent.setup();
    await renderCapture();

    await user.type(screen.getByLabelText("Title"), "Tote");
    await user.press(screen.getByRole("button", { name: "Save idea" }));

    expect(await screen.findByText("Network down")).toBeOnTheScreen();
    expect(mockBack).not.toHaveBeenCalled();
  });
});
