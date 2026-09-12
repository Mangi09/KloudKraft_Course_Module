import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

const API_URL = "http://localhost:5000/api";

function Courses() {
  const { token } = useAuth();

  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [step, setStep] = useState(1);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [assignedCohortId, setAssignedCohortId] = useState("");
  const [assignedTrainerId, setAssignedTrainerId] = useState("");
  const [isSequential, setIsSequential] = useState(false);

  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingCourseId, setDeletingCourseId] = useState(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message || "Failed to load courses."
        );
      }

      setCourses(data.courses || []);
    } catch (err) {
      setError(err.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadCourses();
    }
  }, [token]);

  const handleEditCourse = async (courseId) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || "Failed to load course");
      }

      const course = data.course;

      setEditingCourseId(course.id);
      setTitle(course.title || "");
      setDescription(course.description || "");
      setCategory(course.category || "");
      setStatus(course.status || "DRAFT");
      setAssignedCohortId(course.cohort_id ? String(course.cohort_id) : "");
      setAssignedTrainerId(course.trainer_id ? String(course.trainer_id) : "");
      setIsSequential(Boolean(course.is_sequential));

      setSections(
        (course.sections || []).map((section) => ({
          id: section.id,
          title: section.title || "",
          description: section.description || "",
          order_index: section.order_index ?? 1,
          lessons: (section.lessons || []).map((lesson) => ({
            id: lesson.id,
            title: lesson.title || "",
            type: lesson.type || "VIDEO",
            content_url: lesson.content_url || "",
            duration_minutes: lesson.duration_minutes ?? "",
            mandatory: Boolean(lesson.mandatory),
            order_index: lesson.order_index ?? 1,
          })),
        }))
      );

      setStep(1);
    
      setShowForm(true);
    } catch (err) {
      setError(err.message || "Failed to load course");
    }
  };
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setStatus("DRAFT");
    setAssignedCohortId("");
    setAssignedTrainerId("");
    setIsSequential(false);
    setSections([]);
    setStep(1);
    setEditingCourseId(null);
    setError("");
  };

  const addSection = () => {
    setSections((current) => [
      ...current,
      {
        title: "",
        description: "",
        is_sequential: false,
        lessons: [],
      },
    ]);
  };

  const updateSection = (sectionIndex, field, value) => {
    setSections((current) =>
      current.map((section, index) =>
        index === sectionIndex
          ? { ...section, [field]: value }
          : section
      )
    );
  };

  const removeSection = (sectionIndex) => {
    setSections((current) =>
      current.filter((_, index) => index !== sectionIndex)
    );
  };

  const addLesson = (sectionIndex) => {
    setSections((current) =>
      current.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              lessons: [
                ...section.lessons,
                {
                  title: "",
                  content_type: "TEXT",
                  content_body: "",
                  content_url: "",
                  duration_minutes: 0,
                  is_mandatory: true,
                },
              ],
            }
          : section
      )
    );
  };

  const updateLesson = (
    sectionIndex,
    lessonIndex,
    field,
    value
  ) => {
    setSections((current) =>
      current.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              lessons: section.lessons.map((lesson, lIndex) =>
                lIndex === lessonIndex
                  ? { ...lesson, [field]: value }
                  : lesson
              ),
            }
          : section
      )
    );
  };

  const removeLesson = (sectionIndex, lessonIndex) => {
    setSections((current) =>
      current.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              lessons: section.lessons.filter(
                (_, lIndex) => lIndex !== lessonIndex
              ),
            }
          : section
      )
    );
  };

  const goToStructure = () => {
    if (!title.trim()) {
      setError("Course title is required.");
      return;
    }

    setError("");
    setStep(2);
  };

  const goToReview = () => {
    for (const section of sections) {
      if (!section.title.trim()) {
        setError("Every section needs a title.");
        return;
      }

      for (const lesson of section.lessons) {
        if (!lesson.title.trim()) {
          setError("Every lesson needs a title.");
          return;
        }
      }
    }

    setError("");
    setStep(3);
  };

  const handleUpdateCourse = async () => {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(`${API_URL}/courses/${editingCourseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category.trim() || null,
          status,
          assigned_cohort_id: assignedCohortId ? Number(assignedCohortId) : null,
          assigned_trainer_id: assignedTrainerId ? Number(assignedTrainerId) : null,
          is_sequential: isSequential,
          sections: sections.map((section, sectionIndex) => ({
            title: section.title.trim(),
            description: section.description?.trim() || "",
            order_index: sectionIndex + 1,
            lessons: section.lessons.map((lesson, lessonIndex) => ({
              title: lesson.title.trim(),
              type: lesson.type,
              content_url: lesson.content_url?.trim() || null,
              duration_minutes: lesson.duration_minutes
                ? Number(lesson.duration_minutes)
                : null,
              mandatory: Boolean(lesson.mandatory),
              order_index: lessonIndex + 1,
            })),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || "Failed to update course");
      }

      await loadCourses();
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Failed to update course");
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteCourse = async (courseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingCourseId(courseId);
      setError("");

      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || "Failed to delete course");
      }

      await loadCourses();
    } catch (err) {
      setError(err.message || "Failed to delete course");
    } finally {
      setDeletingCourseId(null);
    }
  };
  const handleCreateCourse = async () => {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(`${API_URL}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          category: category.trim() || null,
          status,
          assigned_cohort_id: assignedCohortId || null,
          assigned_trainer_id: assignedTrainerId || null,
          is_sequential: isSequential,
          sections: sections.map((section, sectionIndex) => ({
            title: section.title.trim(),
            description: section.description.trim() || null,
            sort_order: sectionIndex + 1,
            is_sequential: section.is_sequential,
            lessons: section.lessons.map(
              (lesson, lessonIndex) => ({
                title: lesson.title.trim(),
                content_type: lesson.content_type,
                content_body:
                  lesson.content_body.trim() || null,
                content_url:
                  lesson.content_url.trim() || null,
                duration_minutes:
                  Number(lesson.duration_minutes) || 0,
                sort_order: lessonIndex + 1,
                is_mandatory: lesson.is_mandatory,
              })
            ),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message || "Failed to create course."
        );
      }

      resetForm();
      setShowForm(false);
      await loadCourses();
    } catch (err) {
      setError(err.message || "Failed to create course.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold">Courses</h2>
          <p className="mt-1 text-app-muted">
            Manage courses and course content.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="rounded-md bg-app-primary px-5 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            Create Course
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-md border border-status-danger px-4 py-3 text-sm text-status-danger">
          {error}
        </div>
      )}

      {showForm ? (
        <div className="rounded-xl border border-app-border bg-app-panel p-6 shadow-sm">
          <div className="mb-8">
            <h3 className="text-2xl font-semibold">
              {editingCourseId ? "Edit Course" : "Create Course"}
            </h3>

            <p className="mt-1 text-sm text-app-muted">
              Step {step} of 3 —{" "}
              {step === 1
                ? "Course Basics"
                : step === 2
                ? "Course Structure"
                : "Review"}
            </p>

            <div className="mt-4 flex gap-2">
              {[1, 2, 3].map((number) => (
                <div
                  key={number}
                  className={`h-2 flex-1 rounded-full ${
                    number <= step
                      ? "bg-app-primary"
                      : "bg-app-border"
                  }`}
                />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Course Title *
                </label>

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Enter course title"
                  className="w-full rounded-md border border-app-border bg-app-bg px-4 py-3 text-sm outline-none focus:border-app-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Enter course description"
                  rows={4}
                  className="w-full rounded-md border border-app-border bg-app-bg px-4 py-3 text-sm outline-none focus:border-app-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <input
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  placeholder="e.g. Web Development"
                  className="w-full rounded-md border border-app-border bg-app-bg px-4 py-3 text-sm outline-none focus:border-app-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  className="w-full rounded-md border border-app-border bg-app-bg px-4 py-3 text-sm outline-none focus:border-app-primary"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Assigned Cohort ID
                </label>

                <input
                  value={assignedCohortId}
                  onChange={(event) =>
                    setAssignedCohortId(event.target.value)
                  }
                  placeholder="Optional"
                  className="w-full rounded-md border border-app-border bg-app-bg px-4 py-3 text-sm outline-none focus:border-app-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Assigned Trainer ID
                </label>

                <input
                  value={assignedTrainerId}
                  onChange={(event) =>
                    setAssignedTrainerId(event.target.value)
                  }
                  placeholder="Optional"
                  className="w-full rounded-md border border-app-border bg-app-bg px-4 py-3 text-sm outline-none focus:border-app-primary"
                />
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSequential}
                  onChange={(event) =>
                    setIsSequential(event.target.checked)
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium">
                  Make lessons sequential
                </span>
              </label>

              <div className="flex justify-end gap-3 border-t border-app-border pt-5">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="rounded-md border border-app-border px-5 py-3 text-sm font-medium"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={goToStructure}
                  className="rounded-md bg-app-primary px-5 py-3 text-sm font-medium text-white hover:opacity-90"
                >
                  Next: Structure
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-semibold">
                    Course Structure
                  </h4>

                  <p className="mt-1 text-sm text-app-muted">
                    Add sections and lessons to your course.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addSection}
                  className="rounded-md bg-app-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  + Add Section
                </button>
              </div>

              {sections.length === 0 && (
                <div className="rounded-lg border border-dashed border-app-border p-8 text-center">
                  <p className="font-medium">
                    No sections added yet
                  </p>

                  <p className="mt-1 text-sm text-app-muted">
                    Add your first section to start building the
                    course.
                  </p>
                </div>
              )}

              <div className="space-y-5">
                {sections.map((section, sectionIndex) => (
                  <div
                    key={sectionIndex}
                    className="rounded-lg border border-app-border p-5"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h5 className="font-semibold">
                        Section {sectionIndex + 1}
                      </h5>

                      <button
                        type="button"
                        onClick={() =>
                          removeSection(sectionIndex)
                        }
                        className="text-sm text-status-danger hover:underline"
                      >
                        Remove Section
                      </button>
                    </div>

                    <div className="space-y-4">
                      <input
                        value={section.title}
                        onChange={(event) =>
                          updateSection(
                            sectionIndex,
                            "title",
                            event.target.value
                          )
                        }
                        placeholder="Section title"
                        className="w-full rounded-md border border-app-border bg-app-bg px-4 py-3 text-sm outline-none focus:border-app-primary"
                      />

                      <textarea
                        value={section.description}
                        onChange={(event) =>
                          updateSection(
                            sectionIndex,
                            "description",
                            event.target.value
                          )
                        }
                        placeholder="Section description"
                        rows={2}
                        className="w-full rounded-md border border-app-border bg-app-bg px-4 py-3 text-sm outline-none focus:border-app-primary"
                      />

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={section.is_sequential}
                          onChange={(event) =>
                            updateSection(
                              sectionIndex,
                              "is_sequential",
                              event.target.checked
                            )
                          }
                          className="h-4 w-4"
                        />

                        <span className="text-sm">
                          Make this section sequential
                        </span>
                      </label>

                      <div className="rounded-md bg-app-bg p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-semibold">
                            Lessons
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              addLesson(sectionIndex)
                            }
                            className="rounded-md border border-app-border px-3 py-2 text-xs font-medium hover:border-app-primary"
                          >
                            + Add Lesson
                          </button>
                        </div>

                        {section.lessons.length === 0 && (
                          <p className="text-sm text-app-muted">
                            No lessons in this section.
                          </p>
                        )}

                        <div className="space-y-4">
                          {section.lessons.map(
                            (lesson, lessonIndex) => (
                              <div
                                key={lessonIndex}
                                className="rounded-md border border-app-border bg-app-panel p-4"
                              >
                                <div className="mb-3 flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    Lesson {lessonIndex + 1}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeLesson(
                                        sectionIndex,
                                        lessonIndex
                                      )
                                    }
                                    className="text-xs text-status-danger hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                  <input
                                    value={lesson.title}
                                    onChange={(event) =>
                                      updateLesson(
                                        sectionIndex,
                                        lessonIndex,
                                        "title",
                                        event.target.value
                                      )
                                    }
                                    placeholder="Lesson title"
                                    className="rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm outline-none focus:border-app-primary"
                                  />

                                  <select
                                    value={lesson.content_type}
                                    onChange={(event) =>
                                      updateLesson(
                                        sectionIndex,
                                        lessonIndex,
                                        "content_type",
                                        event.target.value
                                      )
                                    }
                                    className="rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm outline-none focus:border-app-primary"
                                  >
                                    <option value="TEXT">
                                      Text
                                    </option>
                                    <option value="VIDEO">
                                      Video
                                    </option>
                                    <option value="DOCUMENT">
                                      Document
                                    </option>
                                    <option value="ASSESSMENT">
                                      Assessment
                                    </option>
                                  </select>

                                  <input
                                    type="number"
                                    min="0"
                                    value={lesson.duration_minutes}
                                    onChange={(event) =>
                                      updateLesson(
                                        sectionIndex,
                                        lessonIndex,
                                        "duration_minutes",
                                        event.target.value
                                      )
                                    }
                                    placeholder="Duration in minutes"
                                    className="rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm outline-none focus:border-app-primary"
                                  />

                                  <input
                                    value={lesson.content_url}
                                    onChange={(event) =>
                                      updateLesson(
                                        sectionIndex,
                                        lessonIndex,
                                        "content_url",
                                        event.target.value
                                      )
                                    }
                                    placeholder="Content URL (optional)"
                                    className="rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm outline-none focus:border-app-primary"
                                  />
                                </div>

                                <textarea
                                  value={lesson.content_body}
                                  onChange={(event) =>
                                    updateLesson(
                                      sectionIndex,
                                      lessonIndex,
                                      "content_body",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Lesson content (optional)"
                                  rows={3}
                                  className="mt-3 w-full rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm outline-none focus:border-app-primary"
                                />

                                <label className="mt-3 flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={lesson.is_mandatory}
                                    onChange={(event) =>
                                      updateLesson(
                                        sectionIndex,
                                        lessonIndex,
                                        "is_mandatory",
                                        event.target.checked
                                      )
                                    }
                                  />

                                  <span className="text-xs">
                                    Mandatory lesson
                                  </span>
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between border-t border-app-border pt-5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-md border border-app-border px-5 py-3 text-sm font-medium"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={goToReview}
                  className="rounded-md bg-app-primary px-5 py-3 text-sm font-medium text-white hover:opacity-90"
                >
                  Next: Review
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h4 className="text-xl font-semibold">
                Review Course
              </h4>

              <p className="mt-1 text-sm text-app-muted">
                {editingCourseId ? "Review the changes before updating the course" : "Review the course before creating it"}.
              </p>

              <div className="mt-5 rounded-lg border border-app-border p-5">
                <h5 className="text-lg font-semibold">
                  {title}
                </h5>

                {description && (
                  <p className="mt-2 text-sm text-app-muted">
                    {description}
                  </p>
                )}

                <div className="mt-4 text-sm">
                  <p>
                    <span className="font-medium">Category:</span>{" "}
                    {category || "Not specified"}
                  </p>

                  <p className="mt-1">
                    <span className="font-medium">Status:</span>{" "}
                    {status}
                  </p>

                  <p className="mt-1">
                    <span className="font-medium">Sections:</span>{" "}
                    {sections.length}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {sections.map((section, sectionIndex) => (
                  <div
                    key={sectionIndex}
                    className="rounded-lg border border-app-border p-4"
                  >
                    <p className="font-semibold">
                      {sectionIndex + 1}. {section.title}
                    </p>

                    {section.lessons.length > 0 ? (
                      <ul className="mt-2 space-y-1 pl-5 text-sm text-app-muted">
                        {section.lessons.map(
                          (lesson, lessonIndex) => (
                            <li key={lessonIndex}>
                              {lessonIndex + 1}. {lesson.title}{" "}
                              ({lesson.content_type})
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-app-muted">
                        No lessons
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between border-t border-app-border pt-5">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-md border border-app-border px-5 py-3 text-sm font-medium"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={editingCourseId ? handleUpdateCourse : handleCreateCourse}
                  disabled={saving}
                  className="rounded-md bg-app-primary px-5 py-3 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (editingCourseId ? "Updating..." : "Creating...") : (editingCourseId ? "Update Course" : "Create Course")}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="rounded-xl border border-app-border bg-app-panel p-8 text-center">
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-xl border border-app-border bg-app-panel p-10 text-center">
              <h3 className="text-xl font-semibold">
                No courses yet
              </h3>

              <p className="mt-2 text-app-muted">
                Create your first course to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between rounded-xl border border-app-border bg-app-panel p-6 shadow-sm"
                >
                  <div>
                    <h3 className="text-lg font-semibold">
                      {course.title}
                    </h3>

                    <p className="mt-1 text-sm text-app-muted">
                      {course.category || "Uncategorized"} ·{" "}
                      {course.status}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-app-border px-4 py-2 text-xs font-medium">
                      {course.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleEditCourse(course.id)}
                      className="rounded-md border border-app-border px-4 py-2 text-sm font-medium hover:bg-app-muted/10"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(course.id)}
                      disabled={deletingCourseId === course.id}
                      className="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingCourseId === course.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default Courses;












