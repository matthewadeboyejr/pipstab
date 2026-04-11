alter table public.trades add column ticket text;
alter table public.trades add constraint trades_user_id_ticket_key unique (user_id, ticket);
