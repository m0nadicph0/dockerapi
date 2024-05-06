import { randomNumber } from "https://deno.land/x/random_number@2.0.0/mod.ts";

export function cname(prefix: string) {
  return `${prefix}-${randomNumber({ min: 1000, max: 9999 })}`;
}
