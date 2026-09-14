export default function StepReview({ basics, sections, onSave, saving }) {
  const lessonCount = sections.reduce((sum, s) => sum + s.lessons.length, 0);

  return (
    <div className="space-y-5 rounded-2xl border border-app-border bg-app-panel p-6">
      <div>
        <h3 className="text-lg font-semibold">{basics.title || "Untitled course"}</h3>
        <p className="mt-1 text-sm text-app-muted">{basics.description || "No description yet."}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md border border-app-border p-3">
          <p className="text-xs text-app-muted">Category</p>
          <p className="mt-1 text-sm font-medium">{basics.category || "—"}</p>
        </div>
        <div className="rounded-md border border-app-border p-3">
          <p className="text-xs text-app-muted">Duration</p>
          <p className="mt-1 text-sm font-medium">{basics.duration_estimate || 0} min</p>
        </div>
        <div className="rounded-md border border-app-border p-3">
          <p className="text-xs text-app-muted">Sections</p>
          <p className="mt-1 text-sm font-medium">{sections.length}</p>
        </div>
        <div className="rounded-md border border-app-border p-3">
          <p className="text-xs text-app-muted">Lessons</p>
          <p className="mt-1 text-sm font-medium">{lessonCount}</p>
        </div>
      </div>

      <ol className="space-y-2 text-sm">
        {sections.map((s, i) => (
          <li key={s._tempId}>
            <span className="font-medium">{i + 1}. {s.title || "Untitled section"}</span>
            <span className="ml-2 text-app-muted">({s.lessons.length} lessons)</span>
          </li>
        ))}
      </ol>

      <div className="flex justify-end gap-3 border-t border-app-border pt-4">
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave("DRAFT")}
          className="rounded-xl border border-app-border px-5 py-2 text-sm font-bold uppercase tracking-wide hover:border-app-primary disabled:opacity-50"
        >
          Save as Draft
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave("PUBLISHED")}
          className="rounded-xl bg-app-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-app-primary/30 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Publish"}
        </button>
      </div>
    </div>
  );
}