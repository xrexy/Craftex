import type { LuciaError } from "lucia";

export type LuciaErrorMessage = LuciaError["message"];

export type ValueOf<T extends Record<PropertyKey, unknown>> = T[keyof T];

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type Maybe<T> = Nullable<Optional<T>>;

export type Arrayable<T> = T | T[];

export type FailableResponse<DataType = undefined, ErrorType = string> =
  | {
      failed: true;
      error: ErrorType;
    }
  | {
      failed: false;
      data: DataType;
    };

export type ValidLuciaProviderIds = "username" | "github";

export type SubmitFn<Return = void> = (e: SubmitEvent) => Return;

export * from "./drizzle";

