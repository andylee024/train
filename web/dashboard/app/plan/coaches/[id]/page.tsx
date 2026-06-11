"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Check, Plus, Play } from "lucide-react";
import { CATEGORIES, getCoach, initials, type Coach, type ProgramFAQ, type SocialLink } from "@/lib/coaches";
import { UNIVERSAL_FAQ_QUESTIONS } from "@/lib/coach-faq-questions";
import { getProfile } from "@/lib/coach-profiles";
import { useSelection } from "@/lib/use-selection";
import { SelectionBar } from "@/components/plan/selection-bar";
import { TeamSidebar } from "@/components/plan/team-sidebar";
import { PairsCarousel } from "@/components/plan/pairs-carousel";
import { WeeklySessionsViewer } from "@/components/plan/weekly-sessions-viewer";
import { cn } from "@/lib/cn";

/**
 * Coach profile page — implements docs/design/coach-profile.md.
 * Section order: Hero · Overview · Equipment · Sample Week · Highlights · Methodology (collapsed) · Pairs.
 */
export default function CoachProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const coach = getCoach(id);
  const profile = getProfile(id);
  const { selected, toggle, remove, clear, addMany, atCap } = useSelection();

  if (!coach) notFound();

  const isSelected = selected.includes(coach.id);
  const disabled = atCap && !isSelected;
  const accent = CATEGORIES[coach.category].accent;
  const catLabel = CATEGORIES[coach.category].label;

  return (
    <div className="max-w-7xl pb-24">
      <Link
        href="/plan/new"
        className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink-dim)] mb-4 transition-colors"
      >
        <ChevronLeft size={11} /> Back to Marketplace
      </Link>

      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-6 lg:items-start">
        <div className="min-w-0">
          {/* ── 1. HERO ──────────────────────────────────────────────── */}
          <div className="bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {coach.headshot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coach.headshot}
                  alt={coach.name}
                  className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                />
              ) : (
                <div
                  className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full grid place-items-center text-[16px] sm:text-[20px] font-semibold text-white tabular"
                  style={{ background: accent }}
                >
                  {initials(coach.name)}
                </div>
              )}

              <div className="min-w-0 flex-1 w-full">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h1 className="text-[20px] sm:text-[24px] font-semibold tracking-tight leading-none">
                    {coach.name}
                  </h1>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: accent }}
                  />
                  {catLabel}
                </div>
                <p className="mt-3 text-[12px] text-[var(--ink-dim)] leading-snug">
                  {coach.credentials}
                </p>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {coach.socials.map((s) => (
                    <SocialChip key={s.platform} link={s} />
                  ))}
                </div>
                <p
                  className="mt-4 text-[17px] sm:text-[19px] font-medium text-[var(--ink)] leading-tight"
                  style={{ fontStyle: "italic" }}
                >
                  &ldquo;{coach.tagline}&rdquo;
                </p>
              </div>

              <button
                onClick={() => !disabled && toggle(coach.id)}
                disabled={disabled}
                title={disabled ? "Max 3 coaches — remove one to add another" : undefined}
                className={cn(
                  "shrink-0 self-stretch sm:self-auto text-[11px] font-mono uppercase tracking-wider px-4 py-2.5 rounded-sm transition-colors flex items-center justify-center gap-1.5",
                  isSelected
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]"
                    : disabled
                      ? "bg-[var(--bg-elev-2)] text-[var(--ink-muted)] border border-[var(--line)] opacity-50 cursor-not-allowed"
                      : "bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90"
                )}
              >
                {isSelected ? <Check size={12} /> : <Plus size={12} />}
                {isSelected ? "Added" : disabled ? "Max reached" : "Add to plan"}
              </button>
            </div>
          </div>

          {/* ── 2. OVERVIEW ──────────────────────────────────────────── */}
          <Section label="Overview">
            <p className="text-[13px] text-[var(--ink-dim)] leading-relaxed">
              {coach.overview}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] tabular">
              <Chip>{coach.tags.daysPerWeek} d/wk</Chip>
              <Chip>{coach.tags.sessionLength}</Chip>
              <Chip>{coach.tags.levels.join(" / ")}</Chip>
            </div>
          </Section>

          {/* ── 3. EQUIPMENT ─────────────────────────────────────────── */}
          <Section label="Equipment">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory sm:flex-wrap sm:overflow-visible sm:snap-none">
              {coach.tags.equipment.map((e, i) => (
                <span
                  key={i}
                  className="shrink-0 snap-start inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-sm text-[11.5px] text-[var(--ink-dim)] whitespace-nowrap"
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: accent }}
                  />
                  {e}
                </span>
              ))}
            </div>
          </Section>

          {/* ── 4. SAMPLE WEEK ───────────────────────────────────────── */}
          {profile?.weekStructure && (
            <Section label="Sample Week">
              <p className="text-[11px] text-[var(--ink-muted)] mb-3">
                Click any day to see the full session.
              </p>
              <WeeklySessionsViewer
                weekStructure={profile.weekStructure}
                accent={accent}
              />
            </Section>
          )}

          {/* ── 5. HIGHLIGHTS ────────────────────────────────────────── */}
          {profile?.videos && profile.videos.length > 0 && (
            <Section label="Highlights">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {profile.videos.map((v) => (
                  <a
                    key={v.id}
                    href={`https://www.youtube.com/watch?v=${v.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md overflow-hidden hover:border-[var(--accent-line)] transition-colors block"
                  >
                    <div className="relative aspect-video bg-[var(--bg-elev-2)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors grid place-items-center">
                        <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={14} className="fill-white text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/70 backdrop-blur text-white text-[9px] font-mono tabular rounded-sm">
                        {v.duration}
                      </div>
                    </div>
                    <div className="p-2.5">
                      <div className="text-[11.5px] text-[var(--ink)] leading-snug line-clamp-2">
                        {v.title}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--ink-muted)] tabular mt-1">
                        {v.views} views
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </Section>
          )}

          {/* ── 6. ARC TIMELINE ─────────────────────────────────────── */}
          <Section label="Your 18 weeks">
            <ArcTimeline coach={coach} accent={accent} />
          </Section>

          {/* ── 7a. IS THIS FOR YOU? ─────────────────────────────────── */}
          <Section label="Is this for you?">
            <FAQList
              items={UNIVERSAL_FAQ_QUESTIONS.map((q, i) => ({
                q,
                a: coach.faqAnswers[i] ?? "",
              }))}
              accent={accent}
            />
          </Section>

          {/* ── 7b. PROGRAM FAQS ─────────────────────────────────────── */}
          <Section label="Program FAQs">
            <FAQList items={coach.programFaqs} accent={accent} />
          </Section>

          {/* ── 8. PAIRS WELL WITH ───────────────────────────────────── */}
          <Section label="Pairs well with">
            <PairsCarousel
              pairIds={coach.pairsWith}
              selected={selected}
              onToggle={toggle}
              onAddAll={() => addMany(coach.pairsWith)}
            />
          </Section>

          {/* ── 9. SOURCES ───────────────────────────────────────────── */}
          <Section label="Sources">
            <SourcesMetrics coach={coach} accent={accent} />
          </Section>
        </div>

        {/* Right rail — team sidebar */}
        <div className="hidden lg:block sticky top-4">
          <TeamSidebar selected={selected} onRemove={remove} onClear={clear} />
        </div>
      </div>

      {/* Mobile sticky selection bar */}
      <SelectionBar
        selected={selected}
        onClear={clear}
        onRemove={remove}
        onBuild={() => { /* navigate to next step; placeholder */ }}
      />
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-3">
        {label}
      </div>
      {children}
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-sm normal-case tracking-normal text-[11px] text-[var(--ink-dim)]">
      {children}
    </span>
  );
}

const PLATFORM_LABEL: Record<SocialLink["platform"], string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
};

function YoutubeIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.5 6.2c-.3-1-1-1.8-2-2.1C19.7 3.5 12 3.5 12 3.5s-7.7 0-9.5.6c-1 .3-1.7 1.1-2 2.1C0 8 0 12 0 12s0 4 .5 5.8c.3 1 1 1.8 2 2.1 1.8.6 9.5.6 9.5.6s7.7 0 9.5-.6c1-.3 1.7-1.1 2-2.1.5-1.8.5-5.8.5-5.8s0-4-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  );
}

function InstagramIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────
// ARC TIMELINE — "Your 18 weeks with [coach]"
// Universal 4-row layout: phase name · week range · focus · description.
// ──────────────────────────────────────────────────────────────────────
function ArcTimeline({ coach, accent }: { coach: Coach; accent: string }) {
  const phases = coach.arcPhases;
  if (!phases || phases.length === 0) return null;

  const totalWeeks = 18;

  return (
    <div>
      {/* Visual phase strip — proportional widths by week count */}
      <div className="hidden sm:flex w-full h-6 mb-3 rounded-sm overflow-hidden border border-[var(--line)]">
        {phases.map((p, i) => {
          const match = p.weeks.match(/W(\d+)-?(\d+)?/i);
          const start = match ? parseInt(match[1], 10) : 1;
          const end = match && match[2] ? parseInt(match[2], 10) : start;
          const widthPct = ((end - start + 1) / totalWeeks) * 100;
          return (
            <div
              key={i}
              className="flex items-center justify-center text-[9px] font-mono uppercase tracking-wider text-white tabular"
              style={{
                width: `${widthPct}%`,
                background: accent,
                opacity: 0.4 + i * 0.15,
              }}
              title={`${p.name} · ${p.weeks}`}
            >
              {p.focus}
            </div>
          );
        })}
      </div>

      {/* 4-row breakdown */}
      <div className="space-y-2">
        {phases.map((p, i) => (
          <div
            key={i}
            className="grid grid-cols-[80px_70px_1fr] gap-3 items-baseline py-2 border-b border-[var(--line-soft)] last:border-b-0"
          >
            <div className="text-[11.5px] font-medium text-[var(--ink)]">{p.name}</div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] tabular">
              {p.weeks}
            </div>
            <div className="text-[12px] text-[var(--ink-dim)] leading-snug">{p.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// FAQ LIST — shared between "Is this for you?" (universal) and "Program FAQs".
// Click-to-expand list of Q + A pairs in the coach's voice.
// ──────────────────────────────────────────────────────────────────────
function FAQList({
  items,
  accent,
}: {
  items: readonly ProgramFAQ[] | ProgramFAQ[];
  accent: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-1">
      {items.map((f, i) => (
        <details
          key={i}
          className="group bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md overflow-hidden"
        >
          <summary
            className="cursor-pointer flex items-start gap-2.5 p-3 hover:bg-[var(--bg-elev-2)] transition-colors list-none"
            style={{ caretColor: "transparent" }}
          >
            <span
              className="shrink-0 mt-0.5 inline-block w-2 transition-transform group-open:rotate-90 text-[var(--ink-muted)]"
              style={{ color: accent }}
            >
              ▸
            </span>
            <span className="text-[12.5px] font-medium text-[var(--ink)] leading-snug">
              {f.q}
            </span>
          </summary>
          <div className="px-3 pb-3 pl-[28px] text-[12px] text-[var(--ink-dim)] leading-relaxed">
            {f.a}
          </div>
        </details>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// SOURCES — Videos + Documents
// Two-bucket layout. Videos: 5 inline + expand toggle. Documents: title +
// pages + author, with "Referenced offline" tag when no URL. See TR-364.
// ──────────────────────────────────────────────────────────────────────
function SourcesMetrics({ coach, accent }: { coach: Coach; accent: string }) {
  const s = coach.sources;
  const [videosExpanded, setVideosExpanded] = useState(false);
  if (!s) return null;

  const guideUrl = `https://github.com/andylee024/train/blob/main/docs/content/training-styles/${coach.id}/guide.md`;

  const allVideos = s.videos?.analyzed ?? [];
  const inlineVideos = videosExpanded ? allVideos : allVideos.slice(0, 5);
  const hiddenCount = Math.max(0, allVideos.length - 5);

  return (
    <div className="space-y-5 text-[12px] text-[var(--ink-dim)]">
      {/* VIDEOS bucket */}
      <div>
        {s.videos && s.videos.analyzed.length > 0 ? (
          <>
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                Videos
              </span>
              {s.videos.channel && (
                <a
                  href={s.videos.channel.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10.5px] font-mono tabular text-[var(--ink-muted)] hover:text-[var(--accent)] transition-colors"
                >
                  <span className="text-[var(--ink-dim)]">
                    {s.videos.analyzed.length}
                  </span>
                  {s.videos.channel.total !== undefined && (
                    <>
                      {" "}of{" "}
                      <span className="text-[var(--ink-dim)]">
                        {s.videos.channel.total.toLocaleString()}
                      </span>
                    </>
                  )}{" "}
                  on {s.videos.channel.handle} ↗
                </a>
              )}
            </div>
            <ul className="space-y-1.5">
              {inlineVideos.map((v) => (
                <li key={v.id} className="flex items-start gap-2.5">
                  <span
                    className="shrink-0 mt-1 text-[10px] leading-none"
                    style={{ color: accent }}
                  >
                    ◯
                  </span>
                  <a
                    href={`https://www.youtube.com/watch?v=${v.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] text-[var(--ink-dim)] hover:text-[var(--accent)] transition-colors leading-snug"
                  >
                    {v.title} ↗
                  </a>
                </li>
              ))}
            </ul>
            {hiddenCount > 0 && (
              <button
                onClick={() => setVideosExpanded((v) => !v)}
                className="mt-2 text-[10.5px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--accent)] transition-colors"
              >
                {videosExpanded ? "▴ Show less" : `▾ Show ${hiddenCount} more`}
              </button>
            )}
          </>
        ) : (
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
              Videos
            </span>
            <span className="text-[11.5px] italic text-[var(--ink-muted)]">
              Hand-curated from published articles
            </span>
          </div>
        )}
      </div>

      {/* DOCUMENTS bucket */}
      {s.documents && s.documents.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
              Documents
            </span>
            <span className="text-[10.5px] font-mono tabular text-[var(--ink-dim)]">
              {s.documents.length}
            </span>
          </div>
          <ul className="space-y-2">
            {s.documents.map((d, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="shrink-0 mt-0.5 text-[11px] leading-none"
                  style={{ color: accent }}
                >
                  ▣
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] leading-snug">
                    {d.url ? (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--ink)] hover:text-[var(--accent)] transition-colors"
                      >
                        {d.title} ↗
                      </a>
                    ) : (
                      <span className="text-[var(--ink)]">{d.title}</span>
                    )}
                    {d.pages !== undefined && (
                      <span className="text-[var(--ink-muted)] ml-1 font-mono tabular text-[11px]">
                        ({d.pages.toLocaleString()} pp)
                      </span>
                    )}
                    {d.author && (
                      <span className="text-[var(--ink-muted)] ml-1">— {d.author}</span>
                    )}
                  </div>
                  {!d.url && (
                    <div className="mt-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                      Referenced offline
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-[var(--line-soft)]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] tabular">
          {s.origin === "auto-ingested" ? "Auto-ingested" : "Hand-curated"} · Last refreshed{" "}
          {s.lastRefreshed}
        </span>
        <a
          href={guideUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-mono uppercase tracking-wider text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
        >
          Read full style guide ↗
        </a>
      </div>
    </div>
  );
}

function SocialChip({ link }: { link: SocialLink }) {
  const renderIcon = () => {
    if (link.platform === "youtube") return <YoutubeIcon size={12} />;
    if (link.platform === "instagram") return <InstagramIcon size={12} />;
    return <Play size={12} />;
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      title={`${PLATFORM_LABEL[link.platform]} · @${link.handle ?? ""}`}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm bg-[var(--bg-elev-1)] border border-[var(--line)] hover:border-[var(--accent-line)] transition-colors group text-[var(--ink-muted)] hover:text-[var(--accent)]"
    >
      {renderIcon()}
      {link.followers ? (
        <span className="text-[10.5px] font-mono tabular text-[var(--ink-dim)] group-hover:text-[var(--ink)] transition-colors">
          {link.followers}
        </span>
      ) : link.handle ? (
        <span className="text-[10.5px] font-mono tabular text-[var(--ink-muted)] group-hover:text-[var(--ink-dim)] transition-colors">
          @{link.handle}
        </span>
      ) : null}
    </a>
  );
}
