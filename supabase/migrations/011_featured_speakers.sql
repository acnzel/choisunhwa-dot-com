-- 011_featured_speakers.sql
-- "이달의 강사" 섹션 테이블

create table if not exists public.featured_speakers (
  id          uuid primary key default gen_random_uuid(),

  -- 강사 참조
  speaker_id  uuid not null references public.speakers(id) on delete cascade,

  -- 어드민 입력 콘텐츠
  intro       text not null default '',       -- 한줄 소개 (max 80자)
  tags        text[] not null default '{}',  -- 추천 태그 (최대 4개)

  -- 노출 제어
  is_visible  boolean not null default true,  -- 전체 노출 여부
  home_visible boolean not null default true, -- 홈 섹션 노출 여부

  -- 노출 기간 (null = 무기한)
  start_date  date,
  end_date    date,

  -- 순서 (낮을수록 앞)
  sort_order  integer not null default 0,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 업데이트 시 updated_at 자동 갱신
create or replace function public.update_featured_speakers_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_featured_speakers_updated_at on public.featured_speakers;
create trigger trg_featured_speakers_updated_at
  before update on public.featured_speakers
  for each row execute function public.update_featured_speakers_updated_at();

-- 홈 노출용 인덱스 (is_visible, home_visible, sort_order)
create index if not exists idx_featured_speakers_home
  on public.featured_speakers (sort_order asc)
  where is_visible = true and home_visible = true;

-- RLS (service role 사용으로 bypass 가능, anon은 read only)
alter table public.featured_speakers enable row level security;

create policy "Public read featured_speakers"
  on public.featured_speakers for select
  using (true);

create policy "Service role full access featured_speakers"
  on public.featured_speakers for all
  using (auth.role() = 'service_role');
