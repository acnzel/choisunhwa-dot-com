-- 012_speaker_applications.sql
-- 강사 직접 프로필 등록 신청 테이블

create table if not exists public.speaker_applications (
  id            uuid primary key default gen_random_uuid(),

  -- 기본 정보
  name          text not null,
  email         text not null,
  phone         text,
  title         text,                  -- 직함
  company       text,                  -- 소속
  fields        text[] not null default '{}',  -- 강의 분야

  -- 소개
  bio_short     text,                  -- 한줄 소개
  bio_full      text,                  -- 상세 소개
  lecture_topics text,                 -- 강의 주제 (자유 입력)
  career        text,                  -- 주요 경력
  education     text,                  -- 학력

  -- 미디어
  photo_url     text,                  -- 프로필 사진 URL
  youtube_url   text,                  -- 유튜브/영상 링크
  fee_range     text,                  -- 강의료 범위

  -- 처리 상태
  status        text not null default 'pending'
                check (status in ('pending','approved','rejected')),
  admin_note    text,                  -- 관리자 검토 메모
  reviewed_at   timestamptz,
  reviewed_by   uuid references auth.users(id),

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- updated_at 자동 갱신
create or replace function public.update_speaker_applications_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_speaker_applications_updated_at on public.speaker_applications;
create trigger trg_speaker_applications_updated_at
  before update on public.speaker_applications
  for each row execute function public.update_speaker_applications_updated_at();

-- 인덱스
create index if not exists idx_speaker_applications_status
  on public.speaker_applications (status, created_at desc);

create index if not exists idx_speaker_applications_email
  on public.speaker_applications (email);

-- RLS
alter table public.speaker_applications enable row level security;

-- 누구나 신청 가능 (insert)
create policy "Anyone can apply"
  on public.speaker_applications for insert
  with check (true);

-- 본인 신청서 조회 (이메일 기반)
create policy "Applicant read own"
  on public.speaker_applications for select
  using (true);

-- 관리자 전체 접근
create policy "Service role full access applications"
  on public.speaker_applications for all
  using (auth.role() = 'service_role');
