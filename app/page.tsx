import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import Counter from "@/components/Counter";
import Orbit from "@/components/Orbit";
import ContactMenu from "@/components/ContactMenu";
import Spotlight from "@/components/Spotlight";
import ContactOptions from "@/components/ContactOptions";
import { profile, stats, projects, principles, skills, experience, education } from "@/data/content";

function SectionHead({ index, title }: { index: string; title: string }) {
  return (
    <Reveal y={32}>
      <div className="sec-head">
        <span className="idx">{index}</span>
        <h2>{title}</h2>
      </div>
    </Reveal>
  );
}

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <section className="hero">
          <div className="wrap">
            <div className="hero-grid">
              <Reveal instant>
                <div className="pill"><span className="dot" />{profile.status}</div>
                <h1>
                  <span className="dim">{profile.headline}</span>
                  <span className="accent">{profile.headlineAccent}</span>
                </h1>
                <p className="intro">{profile.intro}</p>
                <p className="name-line">— <b>{profile.name}</b> · {profile.role} · {profile.location}</p>
                <div className="cta">
                  <ContactMenu email={profile.email} phone={profile.phone} />
                  <a href="#work" className="btn"><span className="lg">See my work ↓</span><span className="sm">Work</span></a>
                  <a href={profile.resume} className="btn" target="_blank" rel="noreferrer">Resume<i className="ar"> ↗</i></a>
                  <a href={profile.github} className="btn" target="_blank" rel="noreferrer">GitHub<i className="ar"> ↗</i></a>
                </div>
              </Reveal>
              <Reveal instant delay={0.2}><Orbit /></Reveal>
            </div>
          </div>
          <div className="scroll-cue" aria-hidden="true"><span>scroll</span><i /></div>
        </section>

        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <Reveal>
              <div className="stats">
                {stats.map((s) => (
                  <div className="stat" key={s.label}>
                    <div className="num"><Counter to={s.value} suffix={s.suffix} /></div>
                    <div className="cap">{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section id="work">
          <div className="wrap">
            <SectionHead index="01" title="Selected work" />
            {projects.map((p, n) => (
              <Reveal key={p.title}>
                <Spotlight>
                  <div className="p-head">
                    <div>
                      <span className="pidx">0{n + 1} / 0{projects.length}</span>
                      <h3>{p.title}</h3>
                    </div>
                    <span className="badge">{p.status}</span>
                  </div>
                  <p className="tag">{p.tagline}</p>
                  <p className="problem">{p.problem}</p>
                  <ul>
                    {p.highlights.map((h, i) => (
                      <Reveal as="li" key={h} y={22} delay={i * 0.08}>{h}</Reveal>
                    ))}
                  </ul>
                  {p.results && (
                    <div className="results">
                      {p.results.map((r) => (
                        <div key={r.label}><b>{r.value}</b><span>{r.label}</span></div>
                      ))}
                    </div>
                  )}
                  {p.role && <p className="role"><b>My role · </b>{p.role}</p>}
                  <div className="flow">
                    {p.flow.map((f, i) => (
                      <span key={f} style={{ display: "contents" }}>
                        <Reveal as="span" className="node" y={14} delay={i * 0.09}>{f}</Reveal>
                        {i < p.flow.length - 1 && <span className="arr">→</span>}
                      </span>
                    ))}
                  </div>
                  <div className="stack">{p.stack.map((s) => <span key={s}>{s}</span>)}</div>
                  {(p.live || p.repo) && (
                    <div className="p-links">
                      {p.live && <a href={p.live} target="_blank" rel="noreferrer">Live demo ↗</a>}
                      {p.repo && <a href={p.repo} target="_blank" rel="noreferrer">Source ↗</a>}
                    </div>
                  )}
                </Spotlight>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="thinking">
          <div className="wrap">
            <SectionHead index="02" title="How I think" />
            <div className="grid2">
              {principles.map((p, i) => (
                <Reveal key={p.title} delay={(i % 2) * 0.1}>
                  <div className="card">
                    <span className="n">0{i + 1}</span>
                    <h4>{p.title}</h4>
                    <p>{p.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="skills">
          <div className="wrap">
            <SectionHead index="03" title="Toolbox" />
            {skills.map((s, i) => (
              <Reveal key={s.group} y={36} delay={Math.min(i * 0.05, 0.2)}>
                <div className="skill-row">
                  <div className="g">{s.group}</div>
                  <div className="i">{s.items.map((it) => <span key={it}>{it}</span>)}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section>
          <div className="wrap">
            <SectionHead index="04" title="Experience & education" />
            {experience.map((e) => (
              <Reveal key={e.role} y={36}>
                <div className="exp">
                  <div className="when">{e.when}</div>
                  <div><h4>{e.role}</h4><p>{e.detail}</p></div>
                </div>
              </Reveal>
            ))}
            <Reveal y={36}>
              <div className="exp" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="when">{education.when}</div>
                <div><h4>{education.degree}</h4><p>{education.school}</p></div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="contact" className="contact">
          <div className="wrap">
            <Reveal>
              <div className="contact-photo"><img src="/akhand.jpg" alt={profile.name} /></div>
            </Reveal>
            <Reveal delay={0.08}>
              <h2>Have something worth building?<br /><span>Let&apos;s talk.</span></h2>
              <p className="warm">{profile.contactLine}</p>
            </Reveal>
            <Reveal delay={0.16}>
              <ContactOptions email={profile.email} phone={profile.phone} />
              <div className="socials">
                <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <footer>
        © {new Date().getFullYear()} {profile.name}
        <div className="hint">press <kbd>T</kbd> to switch theme</div>
      </footer>
    </>
  );
}
