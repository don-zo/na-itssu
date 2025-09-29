export const ROUTES = {
  HOME: "/",
  BILLS: {
    DEFAULT: "/bills",
    DETAIL: "/bills/:id",
    FILTER: "/bills/:sort/:tag",
  },
  CONFERENCE: {
    DEFAULT: "/conferences",
  },
} as const;
