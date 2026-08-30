export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

export type PageProps = {
    auth: Auth;
    [key: string]: unknown;
};
