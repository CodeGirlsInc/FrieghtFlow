import { useToastStore } from "./toast.store";

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("toast store", () => {
  it("should start with no toasts", () => {
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it("should add a toast", () => {
    useToastStore.getState().add("success", "Hello");
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe("success");
    expect(toasts[0].message).toBe("Hello");
    expect(toasts[0].id).toBeDefined();
  });

  it("should prepend new toasts (newest first)", () => {
    useToastStore.getState().add("info", "First");
    useToastStore.getState().add("info", "Second");
    const { toasts } = useToastStore.getState();
    expect(toasts[0].message).toBe("Second");
    expect(toasts[1].message).toBe("First");
  });

  it("should limit toasts to 3", () => {
    useToastStore.getState().add("info", "One");
    useToastStore.getState().add("info", "Two");
    useToastStore.getState().add("info", "Three");
    useToastStore.getState().add("info", "Four");
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(3);
    expect(toasts[0].message).toBe("Four");
  });

  it("should dismiss a toast by id", () => {
    useToastStore.getState().add("info", "Hello");
    const id = useToastStore.getState().toasts[0].id;
    useToastStore.getState().dismiss(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("should auto-dismiss after 4 seconds", () => {
    useToastStore.getState().add("info", "Auto");
    expect(useToastStore.getState().toasts).toHaveLength(1);

    jest.advanceTimersByTime(4000);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("should not auto-dismiss before 4 seconds", () => {
    useToastStore.getState().add("info", "Auto");
    jest.advanceTimersByTime(3999);
    expect(useToastStore.getState().toasts).toHaveLength(1);
  });
});
