const db = require("../db");
const sendError = require("../utils/sendError");

const LESSON_TYPES = ["VIDEO", "TEXT", "DOCUMENT", "ASSESSMENT"];

function required(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

async function getCourseForLesson(lessonId) {
  const lesson = await db("lessons").where({ id: lessonId }).first();
  if (!lesson) return null;
  const section = await db("sections").where({ id: lesson.section_id }).first();
  const course = await db("courses").where({ id: section.course_id }).first();
  return { lesson, section, course };
}

function canModify(user, course) {
  if (user.role === "ADMIN") return true;
  if (user.role === "TRAINER") return course.assigned_trainer_id === user.id;
  return false;
}

async function createLesson(req, res) {
  const {
    section_id,
    title,
    content_type,
    content_url,
    content_body,
    duration_minutes,
    sort_order,
    is_mandatory,
  } = req.body;

  if (!required(section_id) || !required(title)) {
    return sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "section_id and title are required.",
    );
  }

  const type = String(content_type || "TEXT").toUpperCase();
  if (!LESSON_TYPES.includes(type)) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid content_type.");
  }

  const section = await db("sections").where({ id: section_id }).first();
  if (!section) return sendError(res, 404, "NOT_FOUND", "Section not found.");
  const course = await db("courses").where({ id: section.course_id }).first();
  if (!canModify(req.user, course)) {
    return sendError(res, 403, "FORBIDDEN", "You cannot edit this course.");
  }

  const [id] = await db("lessons").insert({
    section_id,
    title: String(title).trim(),
    content_type: type,
    content_url: content_url || null,
    content_body: content_body || null,
    duration_minutes: duration_minutes || 0,
    sort_order: sort_order || 1,
    is_mandatory: is_mandatory === undefined ? true : Boolean(is_mandatory),
  });

  const created = await db("lessons").where({ id }).first();
  return res.status(201).json({ lesson: created });
}

async function updateLesson(req, res) {
  const found = await getCourseForLesson(req.params.id);
  if (!found) return sendError(res, 404, "NOT_FOUND", "Lesson not found.");
  if (!canModify(req.user, found.course)) {
    return sendError(res, 403, "FORBIDDEN", "You cannot edit this course.");
  }

  const {
    title,
    content_type,
    content_url,
    content_body,
    duration_minutes,
    sort_order,
    is_mandatory,
  } = req.body;

  const updates = {};
  if (title !== undefined) updates.title = String(title).trim();
  if (content_type !== undefined) {
    const type = String(content_type).toUpperCase();
    if (!LESSON_TYPES.includes(type)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid content_type.");
    }
    updates.content_type = type;
  }
  if (content_url !== undefined) updates.content_url = content_url;
  if (content_body !== undefined) updates.content_body = content_body;
  if (duration_minutes !== undefined)
    updates.duration_minutes = duration_minutes;
  if (sort_order !== undefined) updates.sort_order = sort_order;
  if (is_mandatory !== undefined) updates.is_mandatory = Boolean(is_mandatory);

  await db("lessons").where({ id: req.params.id }).update(updates);
  const updated = await db("lessons").where({ id: req.params.id }).first();
  return res.json({ lesson: updated });
}

async function deleteLesson(req, res) {
  const found = await getCourseForLesson(req.params.id);
  if (!found) return sendError(res, 404, "NOT_FOUND", "Lesson not found.");
  if (!canModify(req.user, found.course)) {
    return sendError(res, 403, "FORBIDDEN", "You cannot edit this course.");
  }

  await db("lessons").where({ id: req.params.id }).del();
  return res.status(204).send();
}

async function reorderLessons(req, res) {
  // body: { section_id, order: [{ id, sort_order }, ...] }
  const { section_id, order } = req.body;

  if (!required(section_id) || !Array.isArray(order)) {
    return sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "section_id and order[] are required.",
    );
  }

  const section = await db("sections").where({ id: section_id }).first();
  if (!section) return sendError(res, 404, "NOT_FOUND", "Section not found.");
  const course = await db("courses").where({ id: section.course_id }).first();
  if (!canModify(req.user, course)) {
    return sendError(res, 403, "FORBIDDEN", "You cannot edit this course.");
  }

  await db.transaction(async (trx) => {
    for (const item of order) {
      await trx("lessons")
        .where({ id: item.id, section_id })
        .update({ sort_order: item.sort_order });
    }
  });

  const lessons = await db("lessons")
    .where({ section_id })
    .orderBy("sort_order")
    .orderBy("id");

  return res.json({ lessons });
}

module.exports = { createLesson, updateLesson, deleteLesson, reorderLessons };
