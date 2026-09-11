const db = require("../db");
const sendError = require("../utils/sendError");

function required(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

async function getCourseForSection(sectionId) {
  const section = await db("sections").where({ id: sectionId }).first();
  if (!section) return null;
  const course = await db("courses").where({ id: section.course_id }).first();
  return { section, course };
}

function canModify(user, course) {
  if (user.role === "ADMIN") return true;
  if (user.role === "TRAINER") return course.assigned_trainer_id === user.id;
  return false;
}

async function createSection(req, res) {
  const { course_id, title, description, sort_order, is_sequential } = req.body;

  if (!required(course_id) || !required(title)) {
    return sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "course_id and title are required.",
    );
  }

  const course = await db("courses").where({ id: course_id }).first();
  if (!course) return sendError(res, 404, "NOT_FOUND", "Course not found.");
  if (!canModify(req.user, course)) {
    return sendError(res, 403, "FORBIDDEN", "You cannot edit this course.");
  }

  const [id] = await db("sections").insert({
    course_id,
    title: String(title).trim(),
    description: description || null,
    sort_order: sort_order || 1,
    is_sequential: is_sequential === undefined ? null : Boolean(is_sequential),
  });

  const created = await db("sections").where({ id }).first();
  return res.status(201).json({ section: created });
}

async function updateSection(req, res) {
  const found = await getCourseForSection(req.params.id);
  if (!found) return sendError(res, 404, "NOT_FOUND", "Section not found.");
  if (!canModify(req.user, found.course)) {
    return sendError(res, 403, "FORBIDDEN", "You cannot edit this course.");
  }

  const { title, description, sort_order, is_sequential } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = String(title).trim();
  if (description !== undefined) updates.description = description;
  if (sort_order !== undefined) updates.sort_order = sort_order;
  if (is_sequential !== undefined) {
    updates.is_sequential =
      is_sequential === null ? null : Boolean(is_sequential);
  }

  await db("sections").where({ id: req.params.id }).update(updates);
  const updated = await db("sections").where({ id: req.params.id }).first();
  return res.json({ section: updated });
}

async function deleteSection(req, res) {
  const found = await getCourseForSection(req.params.id);
  if (!found) return sendError(res, 404, "NOT_FOUND", "Section not found.");
  if (!canModify(req.user, found.course)) {
    return sendError(res, 403, "FORBIDDEN", "You cannot edit this course.");
  }

  await db("sections").where({ id: req.params.id }).del();
  return res.status(204).send();
}

async function reorderSections(req, res) {
  // body: { course_id, order: [{ id, sort_order }, ...] }
  const { course_id, order } = req.body;

  if (!required(course_id) || !Array.isArray(order)) {
    return sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "course_id and order[] are required.",
    );
  }

  const course = await db("courses").where({ id: course_id }).first();
  if (!course) return sendError(res, 404, "NOT_FOUND", "Course not found.");
  if (!canModify(req.user, course)) {
    return sendError(res, 403, "FORBIDDEN", "You cannot edit this course.");
  }

  await db.transaction(async (trx) => {
    for (const item of order) {
      await trx("sections")
        .where({ id: item.id, course_id })
        .update({ sort_order: item.sort_order });
    }
  });

  const sections = await db("sections")
    .where({ course_id })
    .orderBy("sort_order")
    .orderBy("id");

  return res.json({ sections });
}

module.exports = {
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
};
