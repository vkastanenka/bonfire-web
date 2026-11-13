export interface Validator<T = unknown> {
  safeParse(data: unknown):
    | { readonly success: true; readonly data: T }
    | {
        readonly success: false;
        readonly error: {
          readonly issues: readonly {
            readonly message: string;
            readonly path: readonly PropertyKey[];
          }[];
        };
      };
}
