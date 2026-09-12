const db = require("../db");
const sendError = require("../utils/sendError");

const COURSE_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const LESSON_TYPES = ["VIDEO", "TEXT", "DOCUMENT", "ASSESSMENT"];

function required(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function asBool(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function nullIfEmpty(value) {
  return value === "" || value === undefined ? null : value;
}

function normalizeCourse(course) {
  return {
    ...course,
    is_sequential: Boolean(course.is_sequential),
  };
}

function normalizeSection(section) {
  return {
    ...section,
    is_sequential:
      section.is_sequential === null ? null : Boolean(section.is_sequential),
  };
}

function normalizeLesson(lesson) {
  return {
    ...lesson,
    is_mandatory: Boolean(lesson.is_mandatory),
  };
}

async function assertCohortExists(id) {
  if (!id) return;

  const cohort = await db("cohorts").where({ id }).first();

  if (!cohort) {
    const error = new Error("Assigned cohort does not exist.");
    error.status = 400;
    error.code = "INVALID_COHORT";
    throw error;
  }
}

async function assertTrainerExists(id) {
  if (!id) return;

  const trainer = await db("users")
    .where({ id, role: "TRAINER" })
    .first();

  if (!trainer) {
    const error = new Error("Assigned trainer does not exist.");
    error.status = 400;
    error.code = "INVALID_TRAINER";
    throw error;
  }
}

function canReadCourse(user, course) {
  if (user.role === "ADMIN") return true;

  if (user.role === "TRAINER") {
    return course.assigned_trainer_id === user.id;
  }

  return false;
}

async function getCourseTree(courseId) {
  const course = await db("courses").where({ id: courseId }).first();

  if (!course) return null;

  const sections = await db("sections")
    .where({ course_id: courseId })
    .orderBy("sort_order")
    .orderBy("id");

  const sectionIds = sections.map((section) => section.id);

  const lessons = sectionIds.length
    ? await db("lessons")
        .whereIn("section_id", sectionIds)
        .orderBy("section_id")
        .orderBy("sort_order")
        .orderBy("id")
    : [];

  return {
    ...normalizeCourse(course),

    sections: sections.map((section) => ({
      ...normalizeSection(section),

      lessons: lessons
        .filter((lesson) => lesson.section_id === section.id)
        .map(normalizeLesson),
    })),
  };
}

function validateCourseInput(body) {
  if (!required(body.title)) {
    return {
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Course title is required.",
    };
  }

  const status = String(body.status || "DRAFT").toUpperCase();

  if (!COURSE_STATUSES.includes(status)) {
    return {
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid course status.",
    };
  }

  return null;
}

async function insertCourseStructure(trx, courseId, sections) {
  for (const [sectionIndex, section] of sections.entries()) {
    if (!required(section.title)) {
      const error = new Error("Every section needs a title.");
      error.status = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    const [sectionId] = await trx("sections").insert({
      course_id: courseId,
      title: String(section.title).trim(),
      description: section.description || null,
      sort_order:
        section.sort_order !== undefined
          ? section.sort_order
          : sectionIndex + 1,
      is_sequential:
        section.is_sequential === undefined
          ? null
          : asBool(section.is_sequential),
    });

    for (const [lessonIndex, lesson] of (
      section.lessons || []
    ).entries()) {
      const type = String(lesson.content_type || "TEXT").toUpperCase();

      if (!required(lesson.title)) {
        const error = new Error("Every lesson needs a title.");
        error.status = 400;
        error.code = "VALIDATION_ERROR";
        throw error;
      }

      if (!LESSON_TYPES.includes(type)) {
        const error = new Error("Invalid lesson type.");
        error.status = 400;
        error.code = "VALIDATION_ERROR";
        throw error;
      }

      await trx("lessons").insert({
        section_id: sectionId,
        title: String(lesson.title).trim(),
        content_type: type,
        content_url: lesson.content_url || null,
        content_body: lesson.content_body || null,
        duration_minutes: lesson.duration_minutes || 0,
        sort_order:
          lesson.sort_order !== undefined
            ? lesson.sort_order
            : lessonIndex + 1,
        is_mandatory:
          lesson.is_mandatory === undefined
            ? true
            : asBool(lesson.is_mandatory),
      });
    }
  }
}

async function createCourse(req, res) {
  const validationError = validateCourseInput(req.body);

  if (validationError) {
    return sendError(
      res,
      validationError.status,
      validationError.code,
      validationError.message
    );
  }

  const status = String(req.body.status || "DRAFT").toUpperCase();

  const assignedCohortId = nullIfEmpty(req.body.assigned_cohort_id);
  const assignedTrainerId = nullIfEmpty(req.body.assigned_trainer_id);

  await assertCohortExists(assignedCohortId);
  await assertTrainerExists(assignedTrainerId);

  const courseId = await db.transaction(async (trx) => {
    const [id] = await trx("courses").insert({
      title: String(req.body.title).trim(),
      description: req.body.description || null,
      thumbnail_url: req.body.thumbnail_url || null,
      category: req.body.category || null,
      status,
      is_sequential: asBool(req.body.is_sequential),
      assigned_cohort_id: assignedCohortId,
      assigned_trainer_id: assignedTrainerId,
      created_by: req.user.id,
      duration_estimate:
        req.body.duration_estimate !== undefined
          ? req.body.duration_estimate
          : null,
    });

    await insertCourseStructure(
      trx,
      id,
      Array.isArray(req.body.sections) ? req.body.sections : []
    );

    return id;
  });

  return res.status(201).json({
    course: await getCourseTree(courseId),
  });
}

async function listCourses(req, res) {
  const query = db("courses as c")
    .leftJoin("cohorts as co", "c.assigned_cohort_id", "co.id")
    .leftJoin("users as t", "c.assigned_trainer_id", "t.id")
    .select(
      "c.*",
      "co.name as cohort_name",
      "t.username as trainer_name"
    )
    .orderBy("c.created_at", "desc");

  if (req.user.role === "TRAINER") {
    query.where("c.assigned_trainer_id", req.user.id);
  }

  if (req.user.role === "CANDIDATE") {
    query.whereRaw("1 = 0");
  }

  if (req.query.status) {
    query.where(
      "c.status",
      String(req.query.status).toUpperCase()
    );
  }

  const courses = await query;

  return res.json({
    courses: courses.map(normalizeCourse),
  });
}

async function getCourseById(req, res) {
  const course = await getCourseTree(req.params.id);

  if (!course) {
    return sendError(res, 404, "NOT_FOUND", "Course not found.");
  }

  if (!canReadCourse(req.user, course)) {
    return sendError(
      res,
      403,
      "FORBIDDEN",
      "You cannot access this course."
    );
  }

  return res.json({ course });
}

async function updateCourse(req, res) {
  const courseId = Number(req.params.id);

  if (!Number.isInteger(courseId)) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid course ID.");
  }

  const existingCourse = await db("courses")
    .where({ id: courseId })
    .first();

  if (!existingCourse) {
    return sendError(res, 404, "NOT_FOUND", "Course not found.");
  }

  const validationError = validateCourseInput(req.body);

  if (validationError) {
    return sendError(
      res,
      validationError.status,
      validationError.code,
      validationError.message
    );
  }

  const status = String(req.body.status || "DRAFT").toUpperCase();

  const assignedCohortId = nullIfEmpty(req.body.assigned_cohort_id);
  const assignedTrainerId = nullIfEmpty(req.body.assigned_trainer_id);

  await assertCohortExists(assignedCohortId);
  await assertTrainerExists(assignedTrainerId);

  await db.transaction(async (trx) => {
    await trx("courses")
      .where({ id: courseId })
      .update({
        title: String(req.body.title).trim(),
        description: req.body.description || null,
        thumbnail_url: req.body.thumbnail_url || null,
        category: req.body.category || null,
        status,
        is_sequential: asBool(req.body.is_sequential),
        assigned_cohort_id: assignedCohortId,
        assigned_trainer_id: assignedTrainerId,

        duration_estimate:
          req.body.duration_estimate !== undefined
            ? req.body.duration_estimate
            : existingCourse.duration_estimate,

        updated_at: trx.fn.now(),
      });

    await trx("sections")
      .where({ course_id: courseId })
      .del();

    await insertCourseStructure(
      trx,
      courseId,
      Array.isArray(req.body.sections) ? req.body.sections : []
    );
  });

  return res.json({
    course: await getCourseTree(courseId),
  });
}

async function deleteCourse(req, res) {
  const courseId = Number(req.params.id);

  if (!Number.isInteger(courseId)) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid course ID.");
  }

  const deleted = await db("courses")
    .where({ id: courseId })
    .del();

  if (!deleted) {
    return sendError(res, 404, "NOT_FOUND", "Course not found.");
  }

  return res.json({
    message: "Course deleted successfully.",
  });
}

module.exports = {
  createCourse,
  listCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
