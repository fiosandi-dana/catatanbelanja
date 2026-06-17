"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isValidCityId } from "@/lib/cities";

const CITY_COOKIE = "pasar_city";

export async function selectCity(cityId: string) {
  if (!isValidCityId(cityId)) {
    throw new Error(`invalid city: ${cityId}`);
  }
  const store = await cookies();
  store.set(CITY_COOKIE, cityId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    httpOnly: false,
  });
  revalidatePath("/", "layout");
}

export async function getSelectedCity(): Promise<string> {
  const store = await cookies();
  const raw = store.get(CITY_COOKIE)?.value;
  if (raw && isValidCityId(raw)) return raw;
  return "bekasi";
}
