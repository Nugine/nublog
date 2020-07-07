import { css } from "emotion";

export function toReadonly<T>(t: T): Readonly<T> {
    return Object.freeze(t);
}

export const LINK_STYLE_NAME = css`
    a {
        color: black;
    }
    a:hover{
        text-decoration: underline;
    }
`;
