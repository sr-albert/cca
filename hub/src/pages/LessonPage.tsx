import { Link, useParams } from "react-router";
import { Html } from "../components/Html";
import { lessonsByCert } from "../data";
import { useCert } from "../hooks/useCert";
import { filterToSearch } from "../lib/filters";

export default function LessonPage() {
  const cert = useCert();
  const { slug } = useParams();
  const lesson = lessonsByCert[cert].find((l) => l.slug === slug);

  if (!lesson) {
    return (
      <section>
        <h2 className="font-serif text-2xl">Lesson not found</h2>
        <Link to={`/${cert}/lessons`} className="text-accent">Back to lessons</Link>
      </section>
    );
  }

  return (
    <article className="content max-w-3xl">
      <p className="eyebrow">Domain {lesson.domain} · Task {lesson.task}</p>
      <Html as="h2" className="font-serif text-3xl" html={lesson.title} />
      <Html as="p" className="lede mt-2" html={lesson.lead} />
      {lesson.diagram && <Html className="my-6 overflow-x-auto" html={lesson.diagram} />}
      {lesson.mechanism.map((m, i) => (
        <section key={i} className="mt-5">
          <Html as="h3" className="font-serif text-xl" html={m.h} />
          <Html as="p" html={m.p} />
        </section>
      ))}
      {lesson.body && <Html className="mt-6" html={lesson.body} />}
      {lesson.questionIds.length > 0 && (
        <Link
          to={`/${cert}/practice?${filterToSearch({ ids: lesson.questionIds })}`}
          className="mt-8 inline-block rounded border border-accent px-4 py-2 font-sans text-sm no-underline"
        >
          Practice these {lesson.questionIds.length} questions
        </Link>
      )}
    </article>
  );
}
