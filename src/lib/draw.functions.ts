import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9][0-9]{9}$/, "Enter a valid 10-digit Indian mobile number"),
});

export type DrawResult = {
  reward:
    | "THAILAND_FLIGHT"
    | "INR_1000_OFF"
    | "TEN_PERCENT_DISCOUNT"
    | "BETTER_LUCK_NEXT_TIME";
  won: boolean;
  alreadyParticipated: boolean;
  couponCode?: string;
};

export const enterLuckyDraw = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<DrawResult> => {
    const { enterLuckyDrawService } = await import("@/lib/draw.service");

    try {
      return await enterLuckyDrawService(data.name, data.mobile);
    } catch (error) {
      console.error("[enterLuckyDraw] error", error);
      throw new Error("Something went wrong. Please try again.");
    }
  });
