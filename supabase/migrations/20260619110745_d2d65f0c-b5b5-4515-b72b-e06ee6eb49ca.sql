
-- Participants table
CREATE TABLE public.participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  mobile text NOT NULL UNIQUE,
  reward text NOT NULL,
  won boolean NOT NULL DEFAULT false
);

GRANT ALL ON public.participants TO service_role;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role (server) can access.

-- Reward pool table
CREATE TABLE public.reward_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_name text NOT NULL,
  claimed boolean NOT NULL DEFAULT false,
  claimed_at timestamptz
);

CREATE INDEX reward_pool_unclaimed_idx ON public.reward_pool (claimed) WHERE claimed = false;

GRANT ALL ON public.reward_pool TO service_role;
ALTER TABLE public.reward_pool ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role (server) can access.

-- Seed the pool with exactly 300 outcomes
INSERT INTO public.reward_pool (reward_name)
SELECT 'THAILAND_FLIGHT' FROM generate_series(1, 1)
UNION ALL
SELECT 'INR_1000_OFF' FROM generate_series(1, 200)
UNION ALL
SELECT 'TEN_PERCENT_DISCOUNT' FROM generate_series(1, 50)
UNION ALL
SELECT 'BETTER_LUCK_NEXT_TIME' FROM generate_series(1, 49);

-- Atomic draw function (security definer, runs with table owner privileges)
CREATE OR REPLACE FUNCTION public.enter_lucky_draw(p_name text, p_mobile text)
RETURNS TABLE (reward text, won boolean, already_participated boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing public.participants%ROWTYPE;
  v_pool_id uuid;
  v_reward text;
  v_won boolean;
BEGIN
  -- Validate input
  IF p_name IS NULL OR length(trim(p_name)) < 2 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;
  IF p_mobile IS NULL OR p_mobile !~ '^[6-9][0-9]{9}$' THEN
    RAISE EXCEPTION 'Invalid mobile number';
  END IF;

  -- Duplicate check
  SELECT * INTO v_existing FROM public.participants WHERE mobile = p_mobile;
  IF FOUND THEN
    RETURN QUERY SELECT v_existing.reward, v_existing.won, true;
    RETURN;
  END IF;

  -- Atomically pick one random unclaimed reward, locking it.
  SELECT id, reward_name
  INTO v_pool_id, v_reward
  FROM public.reward_pool
  WHERE claimed = false
  ORDER BY random()
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_pool_id IS NULL THEN
    -- Pool exhausted -> default to better luck
    v_reward := 'BETTER_LUCK_NEXT_TIME';
    v_won := false;
  ELSE
    UPDATE public.reward_pool
    SET claimed = true, claimed_at = now()
    WHERE id = v_pool_id;
    v_won := v_reward <> 'BETTER_LUCK_NEXT_TIME';
  END IF;

  INSERT INTO public.participants (name, mobile, reward, won)
  VALUES (trim(p_name), p_mobile, v_reward, v_won);

  RETURN QUERY SELECT v_reward, v_won, false;
END;
$$;

REVOKE ALL ON FUNCTION public.enter_lucky_draw(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enter_lucky_draw(text, text) TO service_role;
