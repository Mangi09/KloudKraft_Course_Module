import { PlayCircle, FileText, FileBox, HelpCircle, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

const LESSON_TYPES = [
  { value: "VIDEO", label: "Video", icon: PlayCircle },
  { value: "TEXT", label: "Text", icon: FileText },
  { value: "DOCUMENT", label: "Document", icon: FileBox },
  { value: "ASSESSMENT", label: "Assessment", icon: HelpCircle },
];

let tempId = 0;
const nextTempId = () => `temp-${++tempId}`;

export default function StepStructure({ sections, onChange }) {
  const addSection = () => {
    onChange([
      ...sections,
      {
        _tempId: nextTempId(),
        title: "",
        description: "",
        is_sequential: undefined,
        lessons: [],
      },
    ]);
  };

  const updateSection = (index, patch) => {
    const next = [...sections];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeSection = (index) => {
    onChange(sections.filter((_, i) => i !== index));
  };

  const moveSection = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const addLesson = (sectionIndex) => {
    const next = [...sections];
    next[sectionIndex].lessons = [
      ...next[sectionIndex].lessons,
      {
        _tempId: nextTempId(),
        title: "",
        content_type: "VIDEO",
        content_url: "",
        content_body: "",
        duration_minutes: 0,
        is_mandatory: true,
      },
    ];
    onChange(next);
  };

  const updateLesson = (sectionIndex, lessonIndex, patch) => {
    const next = [...sections];
    next[sectionIndex].lessons[lessonIndex] = {
      ...next[sectionIndex].lessons[lessonIndex],
      ...patch,
    };
    onChange(next);
  };

  const removeLesson = (sectionIndex, lessonIndex) => {
    const next = [...sections];
    next[sectionIndex].lessons = next[sectionIndex].lessons.filter(
      (_, i) => i !== lessonIndex,
    );
    onChange(next);
  };

  const moveLesson = (sectionIndex, lessonIndex, dir) => {
    const lessons = sections[sectionIndex].lessons;
    const target = lessonIndex + dir;
    if (target < 0 || target >= lessons.length) return;
    const next = [...sections];
    const list = [...lessons];
    [list[lessonIndex], list[target]] = [list[target], list[lessonIndex]];
    next[sectionIndex].lessons = list;
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {sections.map((section, sIndex) => (
        <div
          key={section._tempId}
          className="rounded-2xl border border-app-border bg-app-panel p-5"
        >
          <div className="flex items-start gap-3">
            <div className="flex flex-col gap-1 pt-2">
              <button onClick={() => moveSection(sIndex, -1)} className="text-app-muted hover:text-app-primary">
                <ChevronUp size={16} />
              </button>
              <button onClick={() => moveSection(sIndex, 1)} className="text-app-muted hover:text-app-primary">
                <ChevronDown size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-3">
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSection(sIndex, { title: e.target.value })}
                placeholder={`Section ${sIndex + 1} title`}
                className="w-full rounded-md border border-app-border bg-transparent px-3 py-2 text-sm font-medium outline-none focus:border-app-primary"
              />

              <div className="space-y-2 pl-2">
                {section.lessons.map((lesson, lIndex) => {
                  const TypeIcon = LESSON_TYPES.find((t) => t.value === lesson.content_type)?.icon || FileText;
                  return (
                    <div
                      key={lesson._tempId}
                      className="flex items-center gap-2 rounded-md border border-app-border p-2"
                    >
                      <div className="flex flex-col">
                        <button onClick={() => moveLesson(sIndex, lIndex, -1)} className="text-app-muted hover:text-app-primary">
                          <ChevronUp size={12} />
                        </button>
                        <button onClick={() => moveLesson(sIndex, lIndex, 1)} className="text-app-muted hover:text-app-primary">
                          <ChevronDown size={12} />
                        </button>
                      </div>

                      <TypeIcon size={16} className="text-app-primary" />

                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => updateLesson(sIndex, lIndex, { title: e.target.value })}
                        placeholder="Lesson title"
                        className="flex-1 rounded-md border border-app-border bg-transparent px-2 py-1.5 text-sm outline-none focus:border-app-primary"
                      />

                      <select
                        value={lesson.content_type}
                        onChange={(e) => updateLesson(sIndex, lIndex, { content_type: e.target.value })}
                        className="rounded-md border border-app-border bg-app-panel px-2 py-1.5 text-sm outline-none"
                      >
                        {LESSON_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => removeLesson(sIndex, lIndex)}
                        className="text-app-muted hover:text-status-danger"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={() => addLesson(sIndex)}
                  className="flex items-center gap-1 text-sm font-medium text-app-primary"
                >
                  <Plus size={14} /> Add lesson
                </button>
              </div>
            </div>

            <button
              onClick={() => removeSection(sIndex)}
              className="text-app-muted hover:text-status-danger"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addSection}
        className="flex items-center gap-2 rounded-md border border-dashed border-app-border px-4 py-2 text-sm font-medium text-app-primary hover:border-app-primary"
      >
        <Plus size={16} /> Add section
      </button>
    </div>
  );
}