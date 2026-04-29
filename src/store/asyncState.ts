export type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

type AsyncSliceState = {
  loading: boolean;
  status: AsyncStatus;
  error: string | null;
};

export const setAsyncLoading = <T extends AsyncSliceState>(state: T) => {
  state.loading = true;
  state.status = "loading";
  state.error = null;
};

export const setAsyncSucceeded = <T extends AsyncSliceState>(state: T) => {
  state.loading = false;
  state.status = "succeeded";
};

export const setAsyncFailed = <T extends AsyncSliceState>(state: T, error: string) => {
  state.loading = false;
  state.status = "failed";
  state.error = error;
};
