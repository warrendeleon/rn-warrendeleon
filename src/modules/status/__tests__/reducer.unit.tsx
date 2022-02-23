import {StatusState} from "../../../models/StatusState/StatusState";
import {FULFILLED, PENDING, REJECTED, statusReducer} from "../reducer";

describe("Status reducer", () => {
  const initialState: StatusState = {};

  test("should have a module", () => {
    expect(statusReducer).toBeDefined();
  });

  test("should mark testOperation as pending", () => {
    const action = statusReducer(initialState, {
      type: "testOperation/pending",
    });
    expect(action.testOperation).toStrictEqual({status: PENDING});
  });

  test("should mark testOperation as fulfilled", () => {
    const action = statusReducer(initialState, {
      type: "testOperation/fulfilled",
    });
    expect(action.testOperation).toStrictEqual({status: FULFILLED});
  });

  test("should mark testOperation as rejected", () => {
    const action = statusReducer(initialState, {
      payload: {
        detail: "An error",
      },
      type: "testOperation/rejected",
    });
    const expected = {detail: "An error", status: REJECTED};
    expect(action.testOperation).toStrictEqual(expected);
  });

  test("should ignore other actions", () => {
    const action = statusReducer(initialState, {type: "not me please"});
    expect(action).toBe(initialState);
  });
});
