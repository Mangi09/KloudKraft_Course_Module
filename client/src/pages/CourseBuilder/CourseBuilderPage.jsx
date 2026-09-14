import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";
import StepBasics from "./StepBasics.jsx";
import StepStructure from "./StepStructure.jsx";
import StepReview from "./StepReview.jsx";

const STEPS = ["Basics", "Structure", "Review"];

const initialBasics = {
  title: "",
  description: "",
  category: "",
  duration_estimate: "",
  is_sequential: false,
};

export default function CourseBuilderPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [basics, setBasics] = useState(initialBasics);
  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  // Strips the temp React keys the UI needs but the API doesn't want,
  // and matches exactly what your createCourse controller expects:
  // { title, description, category, ..., sections: [{ title, ..., lessons: [...] }] }
  const buildPayload = (status) => ({
    title: basics.title.trim(),
    description: basics.description || null,
    category: basics.category || null,
    duration_estimate: basics.duration_estimate ? Number(basics.duration_estimate) : null,
    is_sequential: basics.is_sequential,
    status,
    sections: sections.map((s, sIndex) => ({
      title: s.title.trim(),
      description: s.description || null,
      sort_order: sIndex + 1,
      is_sequential: s.is_sequential,
      lessons: s.lessons.map((l, lIndex) => ({
        title: l.title.trim(),
        content_type: l.content_type,
        content_url: l.content_url || null,
        content_body: l.content_body || null,
        duration_minutes: Number(l.duration_minutes) || 0,
        sort_order: lIndex + 1,
        is_mandatory: l.is_mandatory,
      })),
    })),
  });

  const handleSave = async (status) => {
    setError(null);

    if (!basics.title.trim()) {
      setError("Course title is required.");
      setStep(0);
      return;
    }

    setSaving(true);
    try {
      // One atomic call — the backend creates the course, its sections,
      // and their lessons together in a single transaction.
      const { course } = await api.post("/courses", buildPayload(status));
      navigate(`/courses/${course.id}`);
    } catch (err) {
      setError(err.message || "Failed to save course.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2 text-sm font-medium">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                i === step
                  ? "bg-app-primary text-white"
                  : i < step
                  ? "bg-status-success text-white"
                  : "border border-app-border text-app-muted"
              }`}
            >
              {i + 1}
            </span>
            <span className={i === step ? "text-app-text" : "text-app-muted"}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-2 h-px w-8 bg-app-border" />}
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-md border border-status-danger/30 bg-status-danger/10 px-4 py-2 text-sm text-status-danger">
          {error}
        </p>
      )}

      {step === 0 && <StepBasics data={basics} onChange={setBasics} />}
      {step === 1 && <StepStructure sections={sections} onChange={setSections} />}
      {step === 2 && (
        <StepReview basics={basics} sections={sections} onSave={handleSave} saving={saving} />
      )}

      {step < 2 && (
        <div className="flex justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="rounded-xl border border-app-border px-5 py-2 text-sm font-bold uppercase tracking-wide disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={goNext}
            className="rounded-xl bg-app-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-app-primary/30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}