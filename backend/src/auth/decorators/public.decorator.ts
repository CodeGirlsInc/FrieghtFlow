import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'public';
export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true);
