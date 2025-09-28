export const ROUTES = {
  HOME: "/",
  TEST: "/test",
  BILLS: {
    DEFAULT: "/bills",
    DETAIL: "/bills/:id",
    FILTER: "/bills/:sort/:tag",
  },
} as const;
