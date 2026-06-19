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
};

export const enterLuckyDraw = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<DrawResult> => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data: result, error } = await supabaseAdmin.rpc(
      "enter_lucky_draw" as never,
      { p_name: data.name, p_mobile: data.mobile } as never,
    );

    if (error) {
      console.error("[enterLuckyDraw] RPC error", error);
      throw new Error("Something went wrong. Please try again.");
    }

    const row = Array.isArray(result) ? result[0] : result;
    if (!row) throw new Error("No result from draw");

    return {
      reward: row.reward,
      won: row.won,
      alreadyParticipated: row.already_participated,
    };
  });
