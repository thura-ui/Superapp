create table public.faq_cache (
  id serial not null,
  question text not null,
  answer text not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint faq_cache_pkey primary key (id)
) TABLESPACE pg_default;