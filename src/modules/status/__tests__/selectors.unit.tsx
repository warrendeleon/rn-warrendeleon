import {RootState} from "../../../redux/configStore";
import {FULFILLED, PENDING, REJECTED} from "../reducer";
import * as Selectors from "../selectors";

describe("Status selectors", () => {
  test("should give fulfilled state", () => {
    const state = {status: {testOperation: {status: FULFILLED}}} as RootState;

    expect(Selectors.wasFulfilledSelector(state, "testOperation")).toBe(true);
  });
  test("should give loading state", () => {
    const state = {status: {testOperation: {status: PENDING}}} as RootState;

    expect(Selectors.isPendingSelector(state, "testOperation")).toBe(true);
  });
  test("should give rejected state", () => {
    const state = {status: {testOperation: {status: REJECTED}}} as RootState;

    expect(Selectors.wasRejectedSelector(state, "testOperation")).toBe(true);
  });
});
