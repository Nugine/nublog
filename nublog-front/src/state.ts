import constate from "constate";

import { useUser } from "./hooks";

export const [UserProvider, useUserCtx] = constate(useUser);
