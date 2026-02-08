do $$
begin
  begin
    alter publication supabase_realtime add table public.centers;
  exception
    when duplicate_object then
      null;
  end;
end $$;
