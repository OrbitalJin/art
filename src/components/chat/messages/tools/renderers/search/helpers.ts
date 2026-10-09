import { asArray, asRecord, getString } from "../../helpers";

export const resultsOf = (output: unknown) =>
  asArray(asRecord(output)?.results);

export const errorOf = (output: unknown) => getString(asRecord(output), "error");
