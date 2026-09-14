export default function StepBasics({ data, onChange }) {
  const update = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-5 rounded-2xl border border-app-border bg-app-panel p-6">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          type="text"
          value={data.title}
          onChange={update("title")}
          placeholder="e.g. Introduction to Cloud Computing"
          className="mt-1 w-full rounded-md border border-app-border bg-transparent px-3 py-2 text-sm outline-none focus:border-app-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          value={data.description}
          onChange={update("description")}
          rows={4}
          placeholder="What will learners get from this course?"
          className="mt-1 w-full rounded-md border border-app-border bg-transparent px-3 py-2 text-sm outline-none focus:border-app-primary"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Category</label>
          <input
            type="text"
            value={data.category}
            onChange={update("category")}
            placeholder="e.g. Cloud, DevOps"
            className="mt-1 w-full rounded-md border border-app-border bg-transparent px-3 py-2 text-sm outline-none focus:border-app-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Duration estimate (minutes)</label>
          <input
            type="number"
            min="0"
            value={data.duration_estimate}
            onChange={update("duration_estimate")}
            className="mt-1 w-full rounded-md border border-app-border bg-transparent px-3 py-2 text-sm outline-none focus:border-app-primary"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={data.is_sequential}
          onChange={update("is_sequential")}
          className="h-4 w-4 accent-app-primary"
        />
        Sequential navigation (lessons must be completed in order)
      </label>
    </div>
  );
}