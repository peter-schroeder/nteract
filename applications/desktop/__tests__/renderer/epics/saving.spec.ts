jest.mock("fs");
import { actions, makeNotebookContentRecord } from "@nteract/core";
import * as Immutable from "immutable";
import { ActionsObservable } from "redux-observable";
import { toArray } from "rxjs/operators";

import { saveAsEpic, saveEpic } from "../../../src/notebook/epics/saving";

describe("saveEpic", () => {
  test("saves the file using the notebook in the state tree", async () => {
    const contentRef = "123";
    const notificationSystem = { addNotification: jest.fn() };

    const state = {
      app: Immutable.Map({
        version: "0.0.0-test",
        notificationSystem
      }),
      core: {
        entities: {
          contents: {
            byRef: Immutable.Map({
              "123": makeNotebookContentRecord()
            })
          },
          kernels: {
            byRef: Immutable.Map({
              k1: {}
            })
          }
        }
      }
    };

    const responses = await saveEpic(
      ActionsObservable.of(actions.save({ contentRef })),
      { value: state }
    )
      .pipe(toArray())
      .toPromise();

    // TODO: This should be testing that the mocks for fs were called with the
    // filename and notebook from the state tree

    expect(responses).toEqual([
      actions.saveFulfilled({
        contentRef,
        model: { last_modified: expect.any(Date) }
      })
    ]);
  });
});

describe("saveAsEpic", () => {
  test("works when passed actions of type SAVE_AS", async () => {
    const contentRef = "123";

    const state = {
      app: Immutable.Map({
        version: "0.0.0-test"
      }),
      core: {
        entities: {
          contents: {
            byRef: Immutable.Map({
              "123": makeNotebookContentRecord()
            })
          },
          kernels: {
            byRef: Immutable.Map({
              k1: {}
            })
          }
        }
      }
    };

    const responses = await saveAsEpic(
      ActionsObservable.of(
        actions.saveAs({ filepath: "great-filename", contentRef })
      ),
      { value: state }
    )
      .pipe(toArray())
      .toPromise();

    expect(responses).toEqual([
      actions.changeFilename({ filepath: "great-filename", contentRef }),
      actions.save({ contentRef })
    ]);
  });
});
