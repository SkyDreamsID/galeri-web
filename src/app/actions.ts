'use server'

import { revalidatePath } from 'next/cache'

export async function revalidateSettings() {
  revalidatePath('/', 'layout')
}
