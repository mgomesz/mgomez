/* =========================
   UTILIDADES
========================= */
const STORAGE_KEYS = {
  groups: "lqg_groups",
  teachers: "lqg_teachers",
  students: "lqg_students",
  subjects: "lqg_subjects",
  assignments: "lqg_assignments",
  attendance: "lqg_attendance_records",
  schoolYears: "lqg_school_years"
};

function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeText(text) {
  return String(text || "").trim().replace(/\s+/g, " ");
}

function sanitizeText(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function validateCedula(cedula) {
  return /^\d{9,12}$/.test(cedula);
}

function validateSection(section) {
  return /^\d{1,2}-\d{1,2}$/.test(section);
}

function getStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function saveAll() {
  setStorage(STORAGE_KEYS.groups, state.groups);
  setStorage(STORAGE_KEYS.teachers, state.teachers);
  setStorage(STORAGE_KEYS.students, state.students);
  setStorage(STORAGE_KEYS.subjects, state.subjects);
  setStorage(STORAGE_KEYS.assignments, state.assignments);
  setStorage(STORAGE_KEYS.attendance, state.attendanceRecords);
  setStorage(STORAGE_KEYS.schoolYears, state.schoolYears);
}

function downloadCSV(filename, headers, rows) {
  let csv = `${headers.join(",")}\n`;

  rows.forEach((row) => {
    const line = row
      .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
      .join(",");
    csv += `${line}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function parseCSVFlexible(line, separator) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === separator && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function getGroupById(groupId) {
  return state.groups.find((group) => group.id === groupId);
}

function getSubjectById(subjectId) {
  return state.subjects.find((subject) => subject.id === subjectId);
}

function getTeacherById(teacherId) {
  return state.teachers.find((teacher) => teacher.id === teacherId);
}

function resetAttendanceRows() {
  state.currentAttendanceRows = [];
  renderAttendanceTable();
}

/* =========================
   ESTADO GLOBAL
========================= */
let state = {
  groups: getStorage(STORAGE_KEYS.groups),
  teachers: getStorage(STORAGE_KEYS.teachers),
  students: getStorage(STORAGE_KEYS.students),
  subjects: getStorage(STORAGE_KEYS.subjects),
  assignments: getStorage(STORAGE_KEYS.assignments),
  attendanceRecords: getStorage(STORAGE_KEYS.attendance),
  schoolYears: getStorage(STORAGE_KEYS.schoolYears),
  currentAttendanceRows: []
};

/* =========================
   NAVEGACIÓN
========================= */
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".content-section");
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");

function showSection(sectionId) {
  sections.forEach((section) => section.classList.remove("active"));
  navLinks.forEach((link) => link.classList.remove("active"));

  const targetSection = document.getElementById(sectionId);
  const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);

  if (targetSection) targetSection.classList.add("active");
  if (activeLink) activeLink.classList.add("active");

  if (window.innerWidth <= 900 && navMenu) {
    navMenu.classList.remove("active");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }
}

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    showSection(link.dataset.section);
  });
});

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isActive = navMenu.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", String(isActive));
  });
}

/* =========================
   REFERENCIAS DOM
========================= */
/* GRUPOS */
const groupForm = document.getElementById("group-form");
const groupEditId = document.getElementById("group-edit-id");
const groupLevel = document.getElementById("group-level");
const groupSection = document.getElementById("group-section");
const updateGroupBtn = document.getElementById("update-group-btn");
const clearGroupBtn = document.getElementById("clear-group-btn");
const groupsSummary = document.getElementById("groups-summary");
const groupsTableBody = document.getElementById("groups-table-body");

/* DOCENTES */
const teacherForm = document.getElementById("teacher-form");
const teacherEditId = document.getElementById("teacher-edit-id");
const teacherCedula = document.getElementById("teacher-cedula");
const teacherFullname = document.getElementById("teacher-fullname");
const updateTeacherBtn = document.getElementById("update-teacher-btn");
const clearTeacherBtn = document.getElementById("clear-teacher-btn");
const teachersSummary = document.getElementById("teachers-summary");
const teachersTableBody = document.getElementById("teachers-table-body");

/* ESTUDIANTES */
const studentForm = document.getElementById("student-form");
const studentEditId = document.getElementById("student-edit-id");
const studentCedula = document.getElementById("student-cedula");
const studentName = document.getElementById("student-name");
const studentGroup = document.getElementById("student-group");
const updateStudentBtn = document.getElementById("update-student-btn");
const clearStudentBtn = document.getElementById("clear-student-btn");
const studentsFile = document.getElementById("students-file");
const importStudentsBtn = document.getElementById("import-students-btn");
const exportStudentsBtn = document.getElementById("export-students-btn");
const studentFilterGroup = document.getElementById("student-filter-group");
const studentsTableBody = document.getElementById("students-table-body");

/* ASIGNATURAS */
const subjectForm = document.getElementById("subject-form");
const subjectEditId = document.getElementById("subject-edit-id");
const subjectName = document.getElementById("subject-name");
const subjectLevel = document.getElementById("subject-level");
const updateSubjectBtn = document.getElementById("update-subject-btn");
const clearSubjectBtn = document.getElementById("clear-subject-btn");
const subjectsSummary = document.getElementById("subjects-summary");
const subjectsTableBody = document.getElementById("subjects-table-body");

/* CONFIGURACIÓN DEL CURSO LECTIVO */
const schoolYearForm = document.getElementById("school-year-form");
const schoolYearEditId = document.getElementById("school-year-edit-id");
const schoolYearInput = document.getElementById("school-year");

const semester1Start = document.getElementById("semester1-start");
const semester1End = document.getElementById("semester1-end");

const semester2Start = document.getElementById("semester2-start");
const semester2End = document.getElementById("semester2-end");

const conv1Start = document.getElementById("conv1-start");
const conv1End = document.getElementById("conv1-end");

const conv2Start = document.getElementById("conv2-start");
const conv2End = document.getElementById("conv2-end");

const promoStart = document.getElementById("promo-start");
const promoEnd = document.getElementById("promo-end");

const updateSchoolYearBtn = document.getElementById("update-school-year-btn");
const clearSchoolYearBtn = document.getElementById("clear-school-year-btn");
const schoolYearSummary = document.getElementById("school-year-summary");
const schoolYearTableBody = document.getElementById("school-year-table-body");

/* ASIGNACIONES */
const assignmentForm = document.getElementById("assignment-form");
const teacherName = document.getElementById("teacher-name");
const assignmentSubject = document.getElementById("assignment-subject");
const assignmentGroup = document.getElementById("assignment-group");
const assignmentSchedule = document.getElementById("assignment-schedule");
const clearAssignmentBtn = document.getElementById("clear-assignment-btn");
const assignmentsTableBody = document.getElementById("assignments-table-body");

/* ASISTENCIA */
const attendanceGroup = document.getElementById("attendance-group");
const attendanceSubject = document.getElementById("attendance-subject");
const attendanceSchedule = document.getElementById("attendance-schedule");
const attendanceDate = document.getElementById("attendance-date");
const loadAttendanceBtn = document.getElementById("load-attendance-btn");
const clearAttendanceBtn = document.getElementById("clear-attendance-btn");
const saveAttendanceBtn = document.getElementById("save-attendance-btn");
const attendanceTableBody = document.getElementById("attendance-table-body");

/* REPORTES */
const reportType = document.getElementById("report-type");
const reportStudent = document.getElementById("report-student");
const reportGroup = document.getElementById("report-group");
const reportSubject = document.getElementById("report-subject");
const reportStartDate = document.getElementById("report-start-date");
const reportEndDate = document.getElementById("report-end-date");
const generateReportBtn = document.getElementById("generate-report-btn");
const exportReportBtn = document.getElementById("export-report-btn");
const metricPresentes = document.getElementById("metric-presentes");
const metricAusentes = document.getElementById("metric-ausentes");
const metricTardias = document.getElementById("metric-tardias");
const metricJustificados = document.getElementById("metric-justificados");
const reportTableBody = document.getElementById("report-table-body");

/* =========================
   SELECTS DINÁMICOS
========================= */
function fillSelect(selectElement, items, placeholder) {
  if (!selectElement) return;

  selectElement.innerHTML = `<option value="">${placeholder}</option>`;

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.text;
    selectElement.appendChild(option);
  });
}

function refreshDynamicSelects() {
  const groupOptions = state.groups
    .slice()
    .sort((a, b) => a.section.localeCompare(b.section))
    .map((group) => ({
      value: group.id,
      text: `${group.section} - ${group.level}`
    }));

  const currentStudentGroup = studentGroup ? studentGroup.value : "";
  const currentAssignmentGroup = assignmentGroup ? assignmentGroup.value : "";
  const currentAttendanceGroup = attendanceGroup ? attendanceGroup.value : "";
  const currentReportGroup = reportGroup ? reportGroup.value : "";
  const currentFilterGroup = studentFilterGroup ? studentFilterGroup.value : "todos";

  fillSelect(studentGroup, groupOptions, "Seleccione una sección");
  fillSelect(assignmentGroup, groupOptions, "Seleccione una sección");
  fillSelect(attendanceGroup, groupOptions, "Seleccione una sección");

  if (studentGroup && [...studentGroup.options].some((opt) => opt.value === currentStudentGroup)) {
    studentGroup.value = currentStudentGroup;
  }

  if (assignmentGroup && [...assignmentGroup.options].some((opt) => opt.value === currentAssignmentGroup)) {
    assignmentGroup.value = currentAssignmentGroup;
  }

  if (attendanceGroup && [...attendanceGroup.options].some((opt) => opt.value === currentAttendanceGroup)) {
    attendanceGroup.value = currentAttendanceGroup;
  }

  if (reportGroup) {
    reportGroup.innerHTML = `<option value="">Todas</option>`;
    groupOptions.forEach((group) => {
      const option = document.createElement("option");
      option.value = group.value;
      option.textContent = group.text;
      reportGroup.appendChild(option);
    });

    if ([...reportGroup.options].some((opt) => opt.value === currentReportGroup)) {
      reportGroup.value = currentReportGroup;
    }
  }

  if (studentFilterGroup) {
    studentFilterGroup.innerHTML = `<option value="todos">Todas</option>`;
    groupOptions.forEach((group) => {
      const option = document.createElement("option");
      option.value = group.value;
      option.textContent = group.text;
      studentFilterGroup.appendChild(option);
    });

    if ([...studentFilterGroup.options].some((opt) => opt.value === currentFilterGroup)) {
      studentFilterGroup.value = currentFilterGroup;
    } else {
      studentFilterGroup.value = "todos";
    }
  }

  const subjectOptions = state.subjects
    .slice()
    .sort((a, b) => {
      if (a.name === b.name) return a.level.localeCompare(b.level);
      return a.name.localeCompare(b.name);
    })
    .map((subject) => ({
      value: subject.id,
      text: `${subject.name} - ${subject.level}`
    }));

  const currentAssignmentSubject = assignmentSubject ? assignmentSubject.value : "";
  const currentAttendanceSubject = attendanceSubject ? attendanceSubject.value : "";
  const currentReportSubject = reportSubject ? reportSubject.value : "";

  fillSelect(assignmentSubject, subjectOptions, "Seleccione una asignatura");
  fillSelect(attendanceSubject, subjectOptions, "Seleccione una asignatura");

  if (assignmentSubject && [...assignmentSubject.options].some((opt) => opt.value === currentAssignmentSubject)) {
    assignmentSubject.value = currentAssignmentSubject;
  }

  if (attendanceSubject && [...attendanceSubject.options].some((opt) => opt.value === currentAttendanceSubject)) {
    attendanceSubject.value = currentAttendanceSubject;
  }

  if (reportSubject) {
    reportSubject.innerHTML = `<option value="">Todas</option>`;
    subjectOptions.forEach((subject) => {
      const option = document.createElement("option");
      option.value = subject.value;
      option.textContent = subject.text;
      reportSubject.appendChild(option);
    });

    if ([...reportSubject.options].some((opt) => opt.value === currentReportSubject)) {
      reportSubject.value = currentReportSubject;
    }
  }

  const teacherOptions = state.teachers
    .slice()
    .sort((a, b) => a.fullname.localeCompare(b.fullname))
    .map((teacher) => ({
      value: teacher.id,
      text: `${teacher.fullname} - ${teacher.cedula}`
    }));

  const currentTeacher = teacherName ? teacherName.value : "";
  fillSelect(teacherName, teacherOptions, "Seleccione un docente");

  if (teacherName && [...teacherName.options].some((opt) => opt.value === currentTeacher)) {
    teacherName.value = currentTeacher;
  }
}

/* =========================
   GRUPOS
========================= */
function clearGroupForm() {
  groupEditId.value = "";
  groupLevel.value = "";
  groupSection.value = "";
}

function renderGroups() {
  if (!groupsTableBody || !groupsSummary) return;

  if (!state.groups.length) {
    groupsTableBody.innerHTML = `<tr><td colspan="3">No hay grupos registrados.</td></tr>`;
    groupsSummary.innerHTML = `<p class="empty-state">No hay grupos registrados.</p>`;
    return;
  }

  const sortedGroups = state.groups.slice().sort((a, b) => a.section.localeCompare(b.section));

  groupsSummary.innerHTML = sortedGroups
    .map((group) => `<div class="summary-item">${sanitizeText(group.section)} — ${sanitizeText(group.level)}</div>`)
    .join("");

  groupsTableBody.innerHTML = sortedGroups
    .map((group) => `
      <tr>
        <td>${sanitizeText(group.level)}</td>
        <td>${sanitizeText(group.section)}</td>
        <td>
          <div class="table-actions">
            <button class="action-btn edit" data-edit-group="${group.id}">Editar</button>
            <button class="action-btn delete" data-delete-group="${group.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `)
    .join("");

  document.querySelectorAll("[data-edit-group]").forEach((button) => {
    button.addEventListener("click", () => loadGroupForEdit(button.dataset.editGroup));
  });

  document.querySelectorAll("[data-delete-group]").forEach((button) => {
    button.addEventListener("click", () => deleteGroup(button.dataset.deleteGroup));
  });
}

function loadGroupForEdit(groupId) {
  const group = getGroupById(groupId);
  if (!group) return;

  groupEditId.value = group.id;
  groupLevel.value = group.level;
  groupSection.value = group.section;
  showSection("grupos");
}

function deleteGroup(groupId) {
  const group = getGroupById(groupId);
  if (!group) return;

  const groupInUseByStudents = state.students.some((student) => student.groupId === groupId);
  const groupInUseByAssignments = state.assignments.some((assignment) => assignment.groupId === groupId);
  const groupInAttendance = state.attendanceRecords.some((record) => record.groupId === groupId);

  if (groupInUseByStudents || groupInUseByAssignments || groupInAttendance) {
    alert("No se puede eliminar el grupo porque está siendo utilizado por estudiantes, carga académica o asistencia.");
    return;
  }

  if (!confirm("¿Deseas eliminar este grupo?")) return;

  state.groups = state.groups.filter((item) => item.id !== groupId);
  saveAll();
  refreshUI();
}

if (groupForm) {
  groupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const level = normalizeText(groupLevel.value);
    const section = normalizeText(groupSection.value);
    const editId = groupEditId.value;

    if (!level || !section) {
      alert("Debes completar nivel y sección.");
      return;
    }

    if (!validateSection(section)) {
      alert("La sección debe tener un formato como 7-1, 10-2 o 11-3.");
      return;
    }

    const exists = state.groups.some(
      (group) => group.section.toLowerCase() === section.toLowerCase() && group.id !== editId
    );

    if (exists) {
      alert("Ya existe un grupo con esa sección.");
      return;
    }

    if (editId) {
      state.groups = state.groups.map((group) =>
        group.id === editId ? { ...group, level, section } : group
      );
      alert("Grupo actualizado correctamente.");
    } else {
      state.groups.push({
        id: generateId("group"),
        level,
        section
      });
      alert("Grupo registrado correctamente.");
    }

    saveAll();
    clearGroupForm();
    refreshUI();
  });
}

if (updateGroupBtn) {
  updateGroupBtn.addEventListener("click", () => {
    if (!groupEditId.value) {
      alert("Primero selecciona un grupo para editar.");
      return;
    }

    groupForm.requestSubmit();
  });
}

if (clearGroupBtn) {
  clearGroupBtn.addEventListener("click", clearGroupForm);
}

/* =========================
   DOCENTES
========================= */
function clearTeacherForm() {
  teacherEditId.value = "";
  teacherCedula.value = "";
  teacherFullname.value = "";
}

function renderTeachers() {
  if (!teachersTableBody || !teachersSummary) return;

  if (!state.teachers.length) {
    teachersTableBody.innerHTML = `<tr><td colspan="3">No hay docentes registrados.</td></tr>`;
    teachersSummary.innerHTML = `<p class="empty-state">No hay docentes registrados.</p>`;
    return;
  }

  const sortedTeachers = state.teachers.slice().sort((a, b) => a.fullname.localeCompare(b.fullname));

  teachersSummary.innerHTML = sortedTeachers
    .map((teacher) => `
      <div class="summary-item">
        ${sanitizeText(teacher.fullname)} — ${sanitizeText(teacher.cedula)}
      </div>
    `)
    .join("");

  teachersTableBody.innerHTML = sortedTeachers
    .map((teacher) => `
      <tr>
        <td>${sanitizeText(teacher.cedula)}</td>
        <td>${sanitizeText(teacher.fullname)}</td>
        <td>
          <div class="table-actions">
            <button class="action-btn edit" data-edit-teacher="${teacher.id}">Editar</button>
            <button class="action-btn delete" data-delete-teacher="${teacher.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `)
    .join("");

  document.querySelectorAll("[data-edit-teacher]").forEach((button) => {
    button.addEventListener("click", () => loadTeacherForEdit(button.dataset.editTeacher));
  });

  document.querySelectorAll("[data-delete-teacher]").forEach((button) => {
    button.addEventListener("click", () => deleteTeacher(button.dataset.deleteTeacher));
  });
}

function loadTeacherForEdit(teacherId) {
  const teacher = getTeacherById(teacherId);
  if (!teacher) return;

  teacherEditId.value = teacher.id;
  teacherCedula.value = teacher.cedula;
  teacherFullname.value = teacher.fullname;
  showSection("docentes");
}

function deleteTeacher(teacherId) {
  const teacherInAssignments = state.assignments.some((assignment) => assignment.teacherId === teacherId);

  if (teacherInAssignments) {
    alert("No se puede eliminar el docente porque está siendo utilizado en carga académica.");
    return;
  }

  if (!confirm("¿Deseas eliminar este docente?")) return;

  state.teachers = state.teachers.filter((teacher) => teacher.id !== teacherId);
  saveAll();
  refreshUI();
}

if (teacherForm) {
  teacherForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const cedula = normalizeText(teacherCedula.value);
    const fullname = normalizeText(teacherFullname.value);
    const editId = teacherEditId.value;

    if (!cedula || !fullname) {
      alert("Debes completar la cédula y el nombre completo del docente.");
      return;
    }

    if (!validateCedula(cedula)) {
      alert("La cédula debe contener solo números y tener entre 9 y 12 dígitos.");
      return;
    }

    const duplicate = state.teachers.some(
      (teacher) => teacher.cedula === cedula && teacher.id !== editId
    );

    if (duplicate) {
      alert("Ya existe un docente con esa cédula.");
      return;
    }

    if (editId) {
      state.teachers = state.teachers.map((teacher) =>
        teacher.id === editId ? { ...teacher, cedula, fullname } : teacher
      );
      alert("Docente actualizado correctamente.");
    } else {
      state.teachers.push({
        id: generateId("teacher"),
        cedula,
        fullname
      });
      alert("Docente guardado correctamente.");
    }

    saveAll();
    clearTeacherForm();
    refreshUI();
  });
}

if (updateTeacherBtn) {
  updateTeacherBtn.addEventListener("click", () => {
    if (!teacherEditId.value) {
      alert("Primero selecciona un docente para editar.");
      return;
    }

    teacherForm.requestSubmit();
  });
}

if (clearTeacherBtn) {
  clearTeacherBtn.addEventListener("click", clearTeacherForm);
}

/* =========================
   ESTUDIANTES
========================= */
function clearStudentForm() {
  studentEditId.value = "";
  studentCedula.value = "";
  studentName.value = "";
  studentGroup.value = "";
}

function renderStudents() {
  if (!studentsTableBody) return;

  const filterValue = studentFilterGroup ? studentFilterGroup.value : "todos";
  let filtered = [...state.students];

  if (filterValue !== "todos") {
    filtered = filtered.filter((student) => student.groupId === filterValue);
  }

  filtered.sort((a, b) => a.name.localeCompare(b.name));

  if (!filtered.length) {
    studentsTableBody.innerHTML = `<tr><td colspan="4">No hay estudiantes registrados.</td></tr>`;
    return;
  }

  studentsTableBody.innerHTML = filtered
    .map((student) => `
      <tr>
        <td>${sanitizeText(student.cedula)}</td>
        <td>${sanitizeText(student.name)}</td>
        <td>${sanitizeText(student.groupSection)}</td>
        <td>
          <div class="table-actions">
            <button class="action-btn edit" data-edit-student="${student.id}">Editar</button>
            <button class="action-btn delete" data-delete-student="${student.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `)
    .join("");

  document.querySelectorAll("[data-edit-student]").forEach((button) => {
    button.addEventListener("click", () => loadStudentForEdit(button.dataset.editStudent));
  });

  document.querySelectorAll("[data-delete-student]").forEach((button) => {
    button.addEventListener("click", () => deleteStudent(button.dataset.deleteStudent));
  });
}

function loadStudentForEdit(studentId) {
  const student = state.students.find((item) => item.id === studentId);
  if (!student) return;

  studentEditId.value = student.id;
  studentCedula.value = student.cedula;
  studentName.value = student.name;
  studentGroup.value = student.groupId;
  showSection("estudiantes");
}

function deleteStudent(studentId) {
  const studentHasAttendance = state.attendanceRecords.some((record) => record.studentId === studentId);

  if (studentHasAttendance) {
    alert("No se puede eliminar el estudiante porque tiene registros de asistencia.");
    return;
  }

  if (!confirm("¿Deseas eliminar este estudiante?")) return;

  state.students = state.students.filter((student) => student.id !== studentId);
  saveAll();
  refreshUI();
}

if (studentForm) {
  studentForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const cedula = normalizeText(studentCedula.value);
    const name = normalizeText(studentName.value);
    const groupId = normalizeText(studentGroup.value);
    const editId = studentEditId.value;
    const group = getGroupById(groupId);

    if (!cedula || !name || !groupId) {
      alert("Debes completar todos los campos del estudiante.");
      return;
    }

    if (!group) {
      alert("La sección seleccionada no existe.");
      return;
    }

    if (!validateCedula(cedula)) {
      alert("La cédula debe contener solo números y tener entre 9 y 12 dígitos.");
      return;
    }

    const duplicate = state.students.some(
      (student) => student.cedula === cedula && student.id !== editId
    );

    if (duplicate) {
      alert("Ya existe un estudiante con esa cédula.");
      return;
    }

    const studentData = {
      cedula,
      name,
      groupId: group.id,
      groupSection: group.section
    };

    if (editId) {
      state.students = state.students.map((student) =>
        student.id === editId ? { ...student, ...studentData } : student
      );
      alert("Estudiante actualizado correctamente.");
    } else {
      state.students.push({
        id: generateId("student"),
        ...studentData
      });
      alert("Estudiante guardado correctamente.");
    }

    saveAll();
    clearStudentForm();
    refreshUI();
  });
}

if (updateStudentBtn) {
  updateStudentBtn.addEventListener("click", () => {
    if (!studentEditId.value) {
      alert("Primero selecciona un estudiante para editar.");
      return;
    }

    studentForm.requestSubmit();
  });
}

if (clearStudentBtn) {
  clearStudentBtn.addEventListener("click", clearStudentForm);
}

if (studentFilterGroup) {
  studentFilterGroup.addEventListener("change", renderStudents);
}

if (exportStudentsBtn) {
  exportStudentsBtn.addEventListener("click", () => {
    const filterValue = studentFilterGroup ? studentFilterGroup.value : "todos";
    let rows = [...state.students];

    if (filterValue !== "todos") {
      rows = rows.filter((student) => student.groupId === filterValue);
    }

    if (!rows.length) {
      alert("No hay estudiantes para exportar.");
      return;
    }

    downloadCSV(
      "estudiantes.csv",
      ["Cedula", "Nombre completo", "Seccion"],
      rows.map((student) => [student.cedula, student.name, student.groupSection])
    );
  });
}

if (importStudentsBtn) {
  importStudentsBtn.addEventListener("click", () => {
    const file = studentsFile.files[0];

    if (!file) {
      alert("Selecciona un archivo CSV.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Solo se permite importar archivos CSV.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      const text = String(event.target.result || "").trim();

      if (!text) {
        alert("El archivo está vacío.");
        return;
      }

      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");

      if (lines.length === 0) {
        alert("El archivo no contiene datos.");
        return;
      }

      let imported = 0;
      let skipped = 0;

      const separator = lines[0].includes(";") ? ";" : ",";
      const hasHeader = lines[0].toLowerCase().includes("cedula");
      const startIndex = hasHeader ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        const values = parseCSVFlexible(line, separator);

        if (values.length < 3) {
          skipped++;
          continue;
        }

        const cedula = normalizeText(values[0]);
        const name = normalizeText(values[1]);
        const groupSection = normalizeText(values[2]);

        if (!cedula || !name || !groupSection) {
          skipped++;
          continue;
        }

        if (!validateCedula(cedula)) {
          skipped++;
          continue;
        }

        const group = state.groups.find(
          (item) => item.section.toLowerCase() === groupSection.toLowerCase()
        );

        if (!group) {
          skipped++;
          continue;
        }

        const duplicate = state.students.some((student) => student.cedula === cedula);
        if (duplicate) {
          skipped++;
          continue;
        }

        state.students.push({
          id: generateId("student"),
          cedula,
          name,
          groupId: group.id,
          groupSection: group.section
        });

        imported++;
      }

      saveAll();
      refreshUI();
      studentsFile.value = "";

      alert(
        `Importación completada.\n✔ Agregados: ${imported}\n⚠ Omitidos: ${skipped}`
      );
    };

    reader.readAsText(file, "UTF-8");
  });
}

/* =========================
   ASIGNATURAS
========================= */
function clearSubjectForm() {
  subjectEditId.value = "";
  subjectName.value = "";
  subjectLevel.value = "";
}

function renderSubjects() {
  if (!subjectsTableBody || !subjectsSummary) return;

  if (!state.subjects.length) {
    subjectsTableBody.innerHTML = `<tr><td colspan="3">No hay asignaturas registradas.</td></tr>`;
    subjectsSummary.innerHTML = `<p class="empty-state">No hay asignaturas registradas.</p>`;
    return;
  }

  const sorted = state.subjects.slice().sort((a, b) => {
    if (a.name === b.name) return a.level.localeCompare(b.level);
    return a.name.localeCompare(b.name);
  });

  subjectsSummary.innerHTML = sorted
    .map((subject) => `<div class="summary-item">${sanitizeText(subject.name)} — ${sanitizeText(subject.level)}</div>`)
    .join("");

  subjectsTableBody.innerHTML = sorted
    .map((subject) => `
      <tr>
        <td>${sanitizeText(subject.name)}</td>
        <td>${sanitizeText(subject.level)}</td>
        <td>
          <div class="table-actions">
            <button class="action-btn edit" data-edit-subject="${subject.id}">Editar</button>
            <button class="action-btn delete" data-delete-subject="${subject.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `)
    .join("");

  document.querySelectorAll("[data-edit-subject]").forEach((button) => {
    button.addEventListener("click", () => loadSubjectForEdit(button.dataset.editSubject));
  });

  document.querySelectorAll("[data-delete-subject]").forEach((button) => {
    button.addEventListener("click", () => deleteSubject(button.dataset.deleteSubject));
  });
}

function loadSubjectForEdit(subjectId) {
  const subject = getSubjectById(subjectId);
  if (!subject) return;

  subjectEditId.value = subject.id;
  subjectName.value = subject.name;
  subjectLevel.value = subject.level;
  showSection("plan-estudio");
}

function deleteSubject(subjectId) {
  const inAssignments = state.assignments.some((assignment) => assignment.subjectId === subjectId);
  const inAttendance = state.attendanceRecords.some((record) => record.subjectId === subjectId);

  if (inAssignments || inAttendance) {
    alert("No se puede eliminar la asignatura porque está siendo utilizada.");
    return;
  }

  if (!confirm("¿Deseas eliminar esta asignatura?")) return;

  state.subjects = state.subjects.filter((subjectItem) => subjectItem.id !== subjectId);
  saveAll();
  refreshUI();
}

if (subjectForm) {
  subjectForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = normalizeText(subjectName.value);
    const level = normalizeText(subjectLevel.value);
    const editId = subjectEditId.value;

    if (!name || !level) {
      alert("Debes completar nombre de la asignatura y nivel.");
      return;
    }

    const exists = state.subjects.some(
      (subject) =>
        subject.name.toLowerCase() === name.toLowerCase() &&
        subject.level.toLowerCase() === level.toLowerCase() &&
        subject.id !== editId
    );

    if (exists) {
      alert("Esa asignatura ya fue registrada para ese nivel.");
      return;
    }

    if (editId) {
      state.subjects = state.subjects.map((subject) =>
        subject.id === editId ? { ...subject, name, level } : subject
      );
      alert("Asignatura actualizada correctamente.");
    } else {
      state.subjects.push({
        id: generateId("subject"),
        name,
        level
      });
      alert("Asignatura registrada correctamente.");
    }

    saveAll();
    clearSubjectForm();
    refreshUI();
  });
}

if (updateSubjectBtn) {
  updateSubjectBtn.addEventListener("click", () => {
    if (!subjectEditId.value) {
      alert("Primero selecciona una asignatura para editar.");
      return;
    }

    subjectForm.requestSubmit();
  });
}

if (clearSubjectBtn) {
  clearSubjectBtn.addEventListener("click", clearSubjectForm);
}

/* =========================
   CONFIGURACIÓN DEL CURSO LECTIVO
========================= */
function clearSchoolYearForm() {
  schoolYearEditId.value = "";
  schoolYearInput.value = "";

  semester1Start.value = "";
  semester1End.value = "";

  semester2Start.value = "";
  semester2End.value = "";

  conv1Start.value = "";
  conv1End.value = "";

  conv2Start.value = "";
  conv2End.value = "";

  promoStart.value = "";
  promoEnd.value = "";
}

function formatDateRange(start, end) {
  return `${sanitizeText(start)} al ${sanitizeText(end)}`;
}

function isValidDateRange(start, end) {
  return start && end && start <= end;
}

function validateSchoolYearData(data) {
  if (!data.year) {
    alert("Debes indicar el año lectivo.");
    return false;
  }

  if (!/^\d{4}$/.test(data.year)) {
    alert("El año lectivo debe tener 4 dígitos.");
    return false;
  }

  if (!isValidDateRange(data.semester1Start, data.semester1End)) {
    alert("Las fechas del I semestre son inválidas.");
    return false;
  }

  if (!isValidDateRange(data.semester2Start, data.semester2End)) {
    alert("Las fechas del II semestre son inválidas.");
    return false;
  }

  if (!isValidDateRange(data.conv1Start, data.conv1End)) {
    alert("Las fechas de la I convocatoria son inválidas.");
    return false;
  }

  if (!isValidDateRange(data.conv2Start, data.conv2End)) {
    alert("Las fechas de la II convocatoria son inválidas.");
    return false;
  }

  if (!isValidDateRange(data.promoStart, data.promoEnd)) {
    alert("Las fechas de Estrategia de promoción son inválidas.");
    return false;
  }

  return true;
}

function renderSchoolYears() {
  if (!schoolYearTableBody || !schoolYearSummary) return;

  if (!state.schoolYears.length) {
    schoolYearTableBody.innerHTML = `<tr><td colspan="7">No hay configuraciones registradas.</td></tr>`;
    schoolYearSummary.innerHTML = `<p class="empty-state">No hay configuración del curso lectivo registrada.</p>`;
    return;
  }

  const sorted = state.schoolYears
    .slice()
    .sort((a, b) => Number(b.year) - Number(a.year));

  schoolYearSummary.innerHTML = sorted
    .map((item) => `
      <div class="summary-item">
        <strong>Año lectivo ${sanitizeText(item.year)}</strong><br>
        I semestre: ${sanitizeText(item.semester1Start)} al ${sanitizeText(item.semester1End)}<br>
        II semestre: ${sanitizeText(item.semester2Start)} al ${sanitizeText(item.semester2End)}<br>
        I convocatoria: ${sanitizeText(item.conv1Start)} al ${sanitizeText(item.conv1End)}<br>
        II convocatoria: ${sanitizeText(item.conv2Start)} al ${sanitizeText(item.conv2End)}<br>
        Estrategia de promoción: ${sanitizeText(item.promoStart)} al ${sanitizeText(item.promoEnd)}
      </div>
    `)
    .join("");

  schoolYearTableBody.innerHTML = sorted
    .map((item) => `
      <tr>
        <td>${sanitizeText(item.year)}</td>
        <td>${formatDateRange(item.semester1Start, item.semester1End)}</td>
        <td>${formatDateRange(item.semester2Start, item.semester2End)}</td>
        <td>${formatDateRange(item.conv1Start, item.conv1End)}</td>
        <td>${formatDateRange(item.conv2Start, item.conv2End)}</td>
        <td>${formatDateRange(item.promoStart, item.promoEnd)}</td>
        <td>
          <div class="table-actions">
            <button class="action-btn edit" data-edit-school-year="${item.id}">Editar</button>
            <button class="action-btn delete" data-delete-school-year="${item.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `)
    .join("");

  document.querySelectorAll("[data-edit-school-year]").forEach((button) => {
    button.addEventListener("click", () => loadSchoolYearForEdit(button.dataset.editSchoolYear));
  });

  document.querySelectorAll("[data-delete-school-year]").forEach((button) => {
    button.addEventListener("click", () => deleteSchoolYear(button.dataset.deleteSchoolYear));
  });
}

function loadSchoolYearForEdit(id) {
  const item = state.schoolYears.find((row) => row.id === id);
  if (!item) return;

  schoolYearEditId.value = item.id;
  schoolYearInput.value = item.year;

  semester1Start.value = item.semester1Start;
  semester1End.value = item.semester1End;

  semester2Start.value = item.semester2Start;
  semester2End.value = item.semester2End;

  conv1Start.value = item.conv1Start;
  conv1End.value = item.conv1End;

  conv2Start.value = item.conv2Start;
  conv2End.value = item.conv2End;

  promoStart.value = item.promoStart;
  promoEnd.value = item.promoEnd;

  showSection("configuracion-curso");
}

function deleteSchoolYear(id) {
  if (!confirm("¿Deseas eliminar esta configuración del curso lectivo?")) return;

  state.schoolYears = state.schoolYears.filter((item) => item.id !== id);
  saveAll();
  refreshUI();
}

if (schoolYearForm) {
  schoolYearForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const editId = schoolYearEditId.value;

    const data = {
      year: normalizeText(schoolYearInput.value),
      semester1Start: normalizeText(semester1Start.value),
      semester1End: normalizeText(semester1End.value),
      semester2Start: normalizeText(semester2Start.value),
      semester2End: normalizeText(semester2End.value),
      conv1Start: normalizeText(conv1Start.value),
      conv1End: normalizeText(conv1End.value),
      conv2Start: normalizeText(conv2Start.value),
      conv2End: normalizeText(conv2End.value),
      promoStart: normalizeText(promoStart.value),
      promoEnd: normalizeText(promoEnd.value)
    };

    if (!validateSchoolYearData(data)) return;

    const duplicate = state.schoolYears.some(
      (item) => item.year === data.year && item.id !== editId
    );

    if (duplicate) {
      alert("Ya existe una configuración registrada para ese año lectivo.");
      return;
    }

    if (editId) {
      state.schoolYears = state.schoolYears.map((item) =>
        item.id === editId ? { ...item, ...data } : item
      );
      alert("Configuración del curso lectivo actualizada correctamente.");
    } else {
      state.schoolYears.push({
        id: generateId("schoolyear"),
        ...data
      });
      alert("Configuración del curso lectivo guardada correctamente.");
    }

    saveAll();
    clearSchoolYearForm();
    refreshUI();
  });
}

if (updateSchoolYearBtn) {
  updateSchoolYearBtn.addEventListener("click", () => {
    if (!schoolYearEditId.value) {
      alert("Primero selecciona una configuración para editar.");
      return;
    }

    schoolYearForm.requestSubmit();
  });
}

if (clearSchoolYearBtn) {
  clearSchoolYearBtn.addEventListener("click", clearSchoolYearForm);
}

/* =========================
   CARGA ACADÉMICA
========================= */
function clearAssignmentForm() {
  teacherName.value = "";
  assignmentSubject.value = "";
  assignmentGroup.value = "";
  assignmentSchedule.value = "";
}

function renderAssignments() {
  if (!assignmentsTableBody) return;

  if (!state.assignments.length) {
    assignmentsTableBody.innerHTML = `<tr><td colspan="5">No hay asignaciones registradas.</td></tr>`;
    return;
  }

  const rows = state.assignments
    .slice()
    .sort((a, b) => {
      const teacherA = getTeacherById(a.teacherId)?.fullname || "";
      const teacherB = getTeacherById(b.teacherId)?.fullname || "";
      return teacherA.localeCompare(teacherB);
    })
    .map((assignment) => {
      const teacher = getTeacherById(assignment.teacherId);
      const group = getGroupById(assignment.groupId);
      const subject = getSubjectById(assignment.subjectId);

      return `
        <tr>
          <td>${sanitizeText(teacher?.fullname || "")}</td>
          <td>${sanitizeText(subject?.name || "")}</td>
          <td>${sanitizeText(group?.section || "")}</td>
          <td>${sanitizeText(assignment.schedule)}</td>
          <td>
            <div class="table-actions">
              <button class="action-btn delete" data-delete-assignment="${assignment.id}">Eliminar</button>
            </div>
          </td>
        </tr>
      `;
    });

  assignmentsTableBody.innerHTML = rows.join("");

  document.querySelectorAll("[data-delete-assignment]").forEach((button) => {
    button.addEventListener("click", () => deleteAssignment(button.dataset.deleteAssignment));
  });
}

function deleteAssignment(assignmentId) {
  const assignmentInAttendance = state.attendanceRecords.some((record) => record.assignmentId === assignmentId);

  if (assignmentInAttendance) {
    alert("No se puede eliminar la asignación porque tiene asistencias registradas.");
    return;
  }

  if (!confirm("¿Deseas eliminar esta asignación?")) return;

  state.assignments = state.assignments.filter((assignment) => assignment.id !== assignmentId);
  saveAll();
  refreshUI();
}

if (assignmentForm) {
  assignmentForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const teacherId = normalizeText(teacherName.value);
    const subjectId = normalizeText(assignmentSubject.value);
    const groupId = normalizeText(assignmentGroup.value);
    const schedule = normalizeText(assignmentSchedule.value);

    if (!teacherId || !subjectId || !groupId || !schedule) {
      alert("Debes completar todos los campos de la asignación.");
      return;
    }

    const teacher = getTeacherById(teacherId);
    const subject = getSubjectById(subjectId);
    const group = getGroupById(groupId);

    if (!teacher || !subject || !group) {
      alert("El docente, la asignatura o el grupo seleccionado no existe.");
      return;
    }

    const exists = state.assignments.some(
      (assignment) =>
        assignment.teacherId === teacher.id &&
        assignment.subjectId === subject.id &&
        assignment.groupId === group.id &&
        assignment.schedule === schedule
    );

    if (exists) {
      alert("Esa asignación ya existe.");
      return;
    }

    state.assignments.push({
      id: generateId("assignment"),
      teacherId: teacher.id,
      subjectId: subject.id,
      groupId: group.id,
      schedule
    });

    saveAll();
    clearAssignmentForm();
    refreshUI();
    alert("Asignación registrada correctamente.");
  });
}

if (clearAssignmentBtn) {
  clearAssignmentBtn.addEventListener("click", clearAssignmentForm);
}

/* =========================
   ASISTENCIA
========================= */
function renderAttendanceTable() {
  if (!attendanceTableBody) return;

  const rows = state.currentAttendanceRows;

  if (!rows.length) {
    attendanceTableBody.innerHTML = `
      <tr>
        <td colspan="4">Seleccione los datos de la lección y cargue los estudiantes.</td>
      </tr>
    `;
    return;
  }

  attendanceTableBody.innerHTML = rows
    .map((row, index) => `
      <tr>
        <td>${sanitizeText(row.cedula)}</td>
        <td>${sanitizeText(row.name)}</td>
        <td>${sanitizeText(row.groupSection)}</td>
        <td>
          <select data-attendance-index="${index}">
            <option value="Presente" ${row.status === "Presente" ? "selected" : ""}>Presente</option>
            <option value="Ausente" ${row.status === "Ausente" ? "selected" : ""}>Ausente</option>
            <option value="Llegada tardía" ${row.status === "Llegada tardía" ? "selected" : ""}>Llegada tardía</option>
            <option value="Justificado" ${row.status === "Justificado" ? "selected" : ""}>Justificado</option>
          </select>
        </td>
      </tr>
    `)
    .join("");

  document.querySelectorAll("[data-attendance-index]").forEach((select) => {
    select.addEventListener("change", (e) => {
      const index = Number(e.target.dataset.attendanceIndex);
      state.currentAttendanceRows[index].status = e.target.value;
    });
  });
}

function clearAttendanceForm() {
  attendanceGroup.value = "";
  attendanceSubject.value = "";
  attendanceSchedule.value = "";
  attendanceDate.value = "";
  resetAttendanceRows();
}

function getSelectedAssignmentForAttendance() {
  const groupId = normalizeText(attendanceGroup.value);
  const subjectId = normalizeText(attendanceSubject.value);
  const schedule = normalizeText(attendanceSchedule.value);

  return state.assignments.find(
    (assignment) =>
      assignment.groupId === groupId &&
      assignment.subjectId === subjectId &&
      assignment.schedule === schedule
  );
}

[attendanceGroup, attendanceSubject, attendanceSchedule, attendanceDate].forEach((element) => {
  if (element) {
    element.addEventListener("change", () => {
      resetAttendanceRows();
    });
  }
});

if (loadAttendanceBtn) {
  loadAttendanceBtn.addEventListener("click", () => {
    const groupId = normalizeText(attendanceGroup.value);
    const subjectId = normalizeText(attendanceSubject.value);
    const scheduleValue = normalizeText(attendanceSchedule.value);
    const dateValue = normalizeText(attendanceDate.value);

    if (!groupId || !subjectId || !scheduleValue || !dateValue) {
      alert("Debes seleccionar sección, asignatura, horario y fecha.");
      return;
    }

    const group = getGroupById(groupId);
    const subject = getSubjectById(subjectId);
    const assignment = getSelectedAssignmentForAttendance();

    if (!group || !subject) {
      alert("La sección o asignatura seleccionada no existe.");
      return;
    }

    if (!assignment) {
      alert("No existe una carga académica registrada para esa sección, asignatura y horario.");
      return;
    }

    const studentsByGroup = state.students
      .filter((student) => student.groupId === groupId)
      .sort((a, b) => a.name.localeCompare(b.name));

    if (!studentsByGroup.length) {
      alert("No hay estudiantes registrados en esa sección.");
      resetAttendanceRows();
      return;
    }

    state.currentAttendanceRows = studentsByGroup.map((student) => ({
      studentId: student.id,
      cedula: student.cedula,
      name: student.name,
      groupId: student.groupId,
      groupSection: student.groupSection,
      status: "Presente"
    }));

    renderAttendanceTable();
  });
}

if (saveAttendanceBtn) {
  saveAttendanceBtn.addEventListener("click", () => {
    const groupId = normalizeText(attendanceGroup.value);
    const subjectId = normalizeText(attendanceSubject.value);
    const scheduleValue = normalizeText(attendanceSchedule.value);
    const dateValue = normalizeText(attendanceDate.value);

    if (!groupId || !subjectId || !scheduleValue || !dateValue) {
      alert("Debes completar los datos de la lección.");
      return;
    }

    if (!state.currentAttendanceRows.length) {
      alert("No hay estudiantes cargados para registrar asistencia.");
      return;
    }

    const group = getGroupById(groupId);
    const subject = getSubjectById(subjectId);
    const assignment = getSelectedAssignmentForAttendance();

    if (!group || !subject || !assignment) {
      alert("La combinación de sección, asignatura y horario no es válida.");
      return;
    }

    const alreadyExists = state.attendanceRecords.some(
      (record) =>
        record.date === dateValue &&
        record.assignmentId === assignment.id
    );

    if (alreadyExists) {
      const overwrite = confirm(
        "Ya existe un registro de asistencia con esa fecha, sección, asignatura y horario. ¿Deseas reemplazarlo?"
      );

      if (!overwrite) return;

      state.attendanceRecords = state.attendanceRecords.filter(
        (record) => !(record.date === dateValue && record.assignmentId === assignment.id)
      );
    }

    const newRecords = state.currentAttendanceRows.map((row) => ({
      id: generateId("attendance"),
      date: dateValue,
      assignmentId: assignment.id,
      studentId: row.studentId,
      cedula: row.cedula,
      studentName: row.name,
      groupId: group.id,
      group: group.section,
      subjectId: subject.id,
      subject: subject.name,
      schedule: scheduleValue,
      status: row.status
    }));

    state.attendanceRecords.push(...newRecords);

    saveAll();
    clearAttendanceForm();
    alert("Asistencia registrada correctamente.");
  });
}

if (clearAttendanceBtn) {
  clearAttendanceBtn.addEventListener("click", clearAttendanceForm);
}

/* =========================
   REPORTES
========================= */
function getFilteredReports() {
  let filtered = [...state.attendanceRecords];

  const type = reportType ? reportType.value : "general";
  const studentValue = normalizeText(reportStudent.value).toLowerCase();
  const groupValue = normalizeText(reportGroup.value);
  const subjectValue = normalizeText(reportSubject.value);
  const startDateValue = normalizeText(reportStartDate.value);
  const endDateValue = normalizeText(reportEndDate.value);

  if (startDateValue && endDateValue && startDateValue > endDateValue) {
    alert("La fecha inicial no puede ser mayor que la fecha final.");
    return [];
  }

  if (studentValue) {
    filtered = filtered.filter(
      (item) =>
        item.studentName.toLowerCase().includes(studentValue) ||
        item.cedula.includes(studentValue)
    );
  }

  if (groupValue) {
    filtered = filtered.filter((item) => item.groupId === groupValue);
  }

  if (subjectValue) {
    filtered = filtered.filter((item) => item.subjectId === subjectValue);
  }

  if (startDateValue) {
    filtered = filtered.filter((item) => item.date >= startDateValue);
  }

  if (endDateValue) {
    filtered = filtered.filter((item) => item.date <= endDateValue);
  }

  if (type === "estudiante" && !studentValue) return [];
  if (type === "seccion" && !groupValue) return [];
  if (type === "asignatura" && !subjectValue) return [];
  if (type === "fechas" && (!startDateValue || !endDateValue)) return [];

  if (type === "ausentismo") {
    const counter = {};

    filtered.forEach((item) => {
      if (item.status === "Ausente" || item.status === "Llegada tardía") {
        counter[item.studentId] = (counter[item.studentId] || 0) + 1;
      }
    });

    filtered = filtered.filter(
      (item) =>
        (item.status === "Ausente" || item.status === "Llegada tardía") &&
        counter[item.studentId] >= 2
    );
  }

  return filtered.sort((a, b) => {
    if (a.date === b.date) return a.studentName.localeCompare(b.studentName);
    return a.date.localeCompare(b.date);
  });
}

function renderReportSummary(data) {
  const presentes = data.filter((item) => item.status === "Presente").length;
  const ausentes = data.filter((item) => item.status === "Ausente").length;
  const tardias = data.filter((item) => item.status === "Llegada tardía").length;
  const justificados = data.filter((item) => item.status === "Justificado").length;

  metricPresentes.textContent = presentes;
  metricAusentes.textContent = ausentes;
  metricTardias.textContent = tardias;
  metricJustificados.textContent = justificados;
}

function renderReportTable(data) {
  if (!reportTableBody) return;

  if (!data.length) {
    reportTableBody.innerHTML = `<tr><td colspan="7">No hay registros para mostrar con los filtros seleccionados.</td></tr>`;
    return;
  }

  reportTableBody.innerHTML = data
    .map((item) => `
      <tr>
        <td>${sanitizeText(item.date)}</td>
        <td>${sanitizeText(item.cedula)}</td>
        <td>${sanitizeText(item.studentName)}</td>
        <td>${sanitizeText(item.group)}</td>
        <td>${sanitizeText(item.subject)}</td>
        <td>${sanitizeText(item.schedule)}</td>
        <td>${sanitizeText(item.status)}</td>
      </tr>
    `)
    .join("");
}

if (generateReportBtn) {
  generateReportBtn.addEventListener("click", () => {
    const data = getFilteredReports();
    renderReportSummary(data);
    renderReportTable(data);
  });
}

if (exportReportBtn) {
  exportReportBtn.addEventListener("click", () => {
    const data = getFilteredReports();

    if (!data.length) {
      alert("No hay datos para exportar.");
      return;
    }

    downloadCSV(
      "reporte_asistencia.csv",
      ["Fecha", "Cedula", "Estudiante", "Seccion", "Asignatura", "Horario", "Estado"],
      data.map((item) => [
        item.date,
        item.cedula,
        item.studentName,
        item.group,
        item.subject,
        item.schedule,
        item.status
      ])
    );
  });
}

/* =========================
   REFRESH GENERAL
========================= */
function refreshUI() {
  refreshDynamicSelects();
  renderGroups();
  renderTeachers();
  renderStudents();
  renderSubjects();
  renderSchoolYears();
  renderAssignments();
  renderAttendanceTable();
}

/* =========================
   INICIALIZACIÓN
========================= */
refreshUI();
renderReportSummary([]);
renderReportTable([]);