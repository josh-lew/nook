import {
  render,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";
import { Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import LoginScreen from "@/app/(auth)/login";

const mockSignIn = jest.fn();

jest.mock("expo-router", () => {
  const React = require("react");
  return {
    Link: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}));

async function renderLogin() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <LoginScreen />
    </SafeAreaProvider>,
  );
}

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignIn.mockResolvedValue({ error: null });
  });

  it("renders the login form", async () => {
    await renderLogin();

    expect(screen.getByText("Welcome back to Nook")).toBeOnTheScreen();
    expect(screen.getByLabelText("Email")).toBeOnTheScreen();
    expect(screen.getByLabelText("Password")).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Forgot password?" }),
    ).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Log in" })).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Create an account" }),
    ).toBeOnTheScreen();
  });

  it("shows validation errors when fields are empty", async () => {
    const user = userEvent.setup();
    await renderLogin();

    await user.press(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Email is required")).toBeOnTheScreen();
    expect(screen.getByText("Password is required")).toBeOnTheScreen();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("shows an error for an invalid email", async () => {
    const user = userEvent.setup();
    await renderLogin();

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.press(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Enter a valid email")).toBeOnTheScreen();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("calls signIn with trimmed email and password", async () => {
    const user = userEvent.setup();
    await renderLogin();

    await user.type(screen.getByLabelText("Email"), "  me@nook.test  ");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.press(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("me@nook.test", "password123");
    });
  });

  it("shows an auth error from signIn", async () => {
    mockSignIn.mockResolvedValueOnce({ error: "Invalid login credentials" });
    const user = userEvent.setup();
    await renderLogin();

    await user.type(screen.getByLabelText("Email"), "me@nook.test");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.press(screen.getByRole("button", { name: "Log in" }));

    expect(
      await screen.findByText("Invalid login credentials"),
    ).toBeOnTheScreen();
  });

  it("shows a coming soon alert for forgot password", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const user = userEvent.setup();
    await renderLogin();

    await user.press(screen.getByRole("button", { name: "Forgot password?" }));

    expect(alertSpy).toHaveBeenCalledWith(
      "Coming soon",
      "Password reset is not available yet.",
    );

    alertSpy.mockRestore();
  });
});
