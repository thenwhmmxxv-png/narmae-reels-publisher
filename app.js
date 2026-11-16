(() => {
  "use strict";

  const STORAGE_KEY = "nwh-reels-planner-v1";
  const START_DATE_KEY = "nwh-reels-start-date-v1";
  const ROLES = [
    { id: "awakening", label: "Awakening", time: "09:00", timeLabel: "9:00 AM" },
    { id: "education", label: "Education", time: "13:00", timeLabel: "1:00 PM" },
    { id: "promotion", label: "Promotion", time: "18:00", timeLabel: "6:00 PM" }
  ];
  const STAGES = [
    { id: "planned", label: "Planned" },
    { id: "scripted", label: "Scripted" },
    { id: "assets_cleared", label: "Assets cleared" },
    { id: "edited", label: "Edited" },
    { id: "scheduled", label: "Uploaded / scheduled" },
    { id: "published", label: "Published" }
  ];

  const COMMON_FIELDS = [
    { key: "theme", label: "Theme", help: "A specific subject for this Reel. Keep every post meaningfully distinct.", type: "text", required: true },
    { key: "angle", label: "Distinct angle", help: "What fresh point of view or situation makes this post different from the others?", type: "textarea", required: true, full: true },
    { key: "hook", label: "Opening hook", help: "A natural first line or visual moment that earns attention.", type: "text", required: true },
    { key: "visualDirection", label: "Live-action direction", help: "Describe a faceless, realistic moment in a recognizable Philippine setting.", type: "textarea", required: true, full: true },
    { key: "script", label: "Taglish script / voice-over", help: "Conversational, specific, and human. Avoid robotic narration and stiff corporate lines.", type: "textarea", required: true, full: true },
    { key: "caption", label: "Caption", help: "Add useful context without repeating the script word for word.", type: "textarea", required: true, full: true },
    { key: "cta", label: "Call to action", help: "For education, invite a useful response. For promotion, give a clear next step.", type: "text", required: true }
  ];

  const EDUCATION_FIELDS = [
    { key: "scenario", label: "1 · Real scenario", help: "What ordinary, believable situation is happening in the spa?", type: "textarea", required: true, full: true },
    { key: "failure", label: "2 · Process failure", help: "Where exactly does the process break down, and who or what is affected?", type: "textarea", required: true, full: true },
    { key: "consequence", label: "3 · Consequence", help: "What is the operational, financial, workforce, or client-service impact?", type: "textarea", required: true, full: true },
    { key: "procedure", label: "4 · Step-by-step correction", help: "State who acts, what they do, when and how, which record or checklist they use, and how the owner verifies it.", type: "textarea", required: true, full: true },
    { key: "example", label: "5 · Realistic example", help: "Show how the procedure works. Label any illustrative numbers clearly.", type: "textarea", required: true, full: true },
    { key: "nwhService", label: "6 · Relevant NWH support", help: "Name the service that can help. Keep internal owner/staff actions separate from NWH's external role.", type: "textarea", required: true, full: true }
  ];

  const PROMOTION_FIELDS = [
    { key: "problem", label: "Problem NWH addresses", help: "Name the specific friction or need this service helps address.", type: "textarea", required: true, full: true },
    { key: "offer", label: "Service or program", help: "Use the actual NWH offer. Do not invent prices, guarantees, or terms.", type: "text", required: true },
    { key: "included", label: "What is included", help: "List the actual service components or deliverables.", type: "textarea", required: true, full: true },
    { key: "process", label: "How engagement works", help: "Explain the real inquiry, assessment, engagement, or enrollment steps.", type: "textarea", required: true, full: true },
    { key: "boundaries", label: "Boundaries", help: "Clarify what the service does and does not include.", type: "textarea", required: true, full: true },
    { key: "nextStep", label: "Next step", help: "Tell an interested viewer exactly how to inquire or proceed.", type: "text", required: true }
  ];

  const ASSET_FIELDS = [
    { key: "footageSource", label: "Footage source / file reference", help: "Record the source or the approved local/cloud file name.", type: "text" },
    { key: "footageLicense", label: "Footage license evidence", help: "Save the exact Pixabay item page and download/license evidence. Check that it is real live-action footage and has no unsuitable logos or identifiable people.", type: "text" },
    { key: "musicMood", label: "Background music mood", help: "Optional: e.g. warm reflective, calm focused, or soft uplifting. Keep music beneath Taglish dialogue.", type: "text" },
    { key: "musicSource", label: "Music source / file reference", help: "Record the source or the approved local/cloud file name.", type: "text" },
    { key: "musicLicense", label: "Music license evidence", help: "Save the exact Pixabay track page and download/license evidence.", type: "text" },
    { key: "finalVideo", label: "Final MP4 file reference", help: "Enter the file name or storage location used for the Meta Business Suite upload.", type: "text" }
  ];

  const byId = (id) => document.getElementById(id);
  const boardEl = byId("board");
  const editor = byId("editor");
  const editorForm = byId("editor-form");
  const editorFields = byId("editor-fields");
  const toastEl = byId("toast");
  let toastTimer = null;
  let activePostId = null;
  const savedStartDate = getStoredValue(START_DATE_KEY) || "";
  let startDate = isIsoDate(savedStartDate) ? savedStartDate : "";
  let slots = loadSlots();

  function getStoredValue(key) {
    try { return localStorage.getItem(key); }
    catch (error) { return null; }
  }

  function isIsoDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  function newSlot(day, role) {
    return {
      id: `day-${String(day).padStart(2, "0")}-${role.id}`,
      day,
      time: role.time,
      role: role.id,
      status: "planned",
      theme: "",
      angle: "",
      hook: "",
      visualDirection: "",
      script: "",
      caption: "",
      cta: "",
      scenario: "",
      failure: "",
      consequence: "",
      procedure: "",
      example: "",
      nwhService: "",
      problem: "",
      offer: "",
      included: "",
      process: "",
      boundaries: "",
      nextStep: "",
      footageSource: "",
      footageLicense: "",
      musicMood: "",
      musicSource: "",
      musicLicense: "",
      finalVideo: ""
    };
  }

  function makeCampaign() {
    const result = [];
    for (let day = 1; day <= 30; day += 1) {
      for (const role of ROLES) result.push(newSlot(day, role));
    }
    return result;
  }

  function loadSlots() {
    try {
      const saved = JSON.parse(getStoredValue(STORAGE_KEY) || "null");
      if (!Array.isArray(saved) || saved.length !== 90) return makeCampaign();
      const base = makeCampaign();
      const savedById = new Map(saved.filter((item) => item && typeof item.id === "string").map((item) => [item.id, item]));
      return base.map((slot) => ({ ...slot, ...(savedById.get(slot.id) || {}) }));
    } catch (error) {
      console.warn("Saved campaign data could not be read; starting with a blank plan.", error);
      return makeCampaign();
    }
  }

  function saveSlots() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
    } catch (error) {
      showToast("This browser could not save the plan. Export a backup before closing.");
    }
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    })[char]);
  }

  function roleFor(post) {
    return ROLES.find((role) => role.id === post.role) || ROLES[0];
  }

  function labelForStatus(status) {
    return (STAGES.find((stage) => stage.id === status) || STAGES[0]).label;
  }

  function dateForDay(day) {
    if (!startDate) return "Date not set";
    const date = new Date(`${startDate}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return "Date not set";
    date.setUTCDate(date.getUTCDate() + day - 1);
    return new Intl.DateTimeFormat("en-PH", {
      day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Manila"
    }).format(date);
  }

  function typeFields(post) {
    if (post.role === "education") return EDUCATION_FIELDS;
    if (post.role === "promotion") return PROMOTION_FIELDS;
    return [];
  }

  function requiredFields(post) {
    return [...COMMON_FIELDS, ...typeFields(post)];
  }

  function normalized(value) {
    return String(value || "").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  }

  function duplicateIssues(post) {
    const issues = [];
    for (const key of ["theme", "angle", "hook"]) {
      const candidate = normalized(post[key]);
      if (!candidate) continue;
      const duplicates = slots.filter((other) => other.id !== post.id && normalized(other[key]) === candidate);
      if (duplicates.length) {
        const fieldName = key === "theme" ? "theme" : key === "angle" ? "angle" : "hook";
        issues.push(`This ${fieldName} exactly matches another Reel on ${duplicates.map((item) => `Day ${item.day} ${roleFor(item).timeLabel}`).join(", ")}.`);
      }
    }
    return issues;
  }

  function missingContent(post) {
    return requiredFields(post).filter((field) => !String(post[field.key] || "").trim());
  }

  function stageIssues(post) {
    const stageIndex = STAGES.findIndex((stage) => stage.id === post.status);
    if (stageIndex <= 0) return [];
    const issues = [];
    if (missingContent(post).length) issues.push("Complete all required content fields before marking this Reel scripted.");
    if (duplicateIssues(post).length) issues.push("Give this Reel a distinct theme, angle, and hook before moving it forward.");
    if (stageIndex >= 2) {
      const missingAssets = ["footageSource", "footageLicense", "musicSource", "musicLicense"].filter((key) => !String(post[key] || "").trim());
      if (missingAssets.length) issues.push("Record both footage and music sources and license evidence before marking assets cleared.");
    }
    if (stageIndex >= 3 && !String(post.finalVideo || "").trim()) {
      issues.push("Add the finished MP4 file reference before marking this Reel edited.");
    }
    if (stageIndex >= 4 && !startDate) {
      issues.push("Set the campaign start date before marking Reels uploaded, scheduled, or published.");
    }
    return issues;
  }

  function isContentReady(post) {
    return missingContent(post).length === 0 && duplicateIssues(post).length === 0;
  }

  function cardMarkup(post) {
    const role = roleFor(post);
    const missing = missingContent(post).length;
    const duplicates = duplicateIssues(post).length > 0;
    const stageWarnings = stageIssues(post);
    const hasContent = Boolean(post.theme || post.hook);
    const title = post.theme.trim() || "Add a distinct theme";
    const hook = post.hook.trim() || "Add a clear opening hook and a fresh angle.";
    let readiness = missing === 0 ? "Content complete" : `${missing} content detail${missing === 1 ? "" : "s"} missing`;
    if (duplicates) readiness = "Check for repeated theme, angle, or hook";
    if (stageWarnings.length) readiness = stageWarnings[0];
    const statusClass = post.status === "published" ? "published" : post.status === "scheduled" ? "scheduled" : isContentReady(post) ? "ready" : "";
    const editLabel = `Edit Day ${String(post.day).padStart(2, "0")}, ${role.timeLabel}, ${role.label} Reel`;
    return `<article class="post-card">
      <div class="post-topline"><span class="post-type ${escapeHtml(post.role)}">${escapeHtml(role.label)}</span><span class="post-time">${escapeHtml(role.timeLabel)} PHT</span></div>
      <h4 class="post-theme ${hasContent ? "" : "placeholder"}">${escapeHtml(title)}</h4>
      <p class="post-hook">${escapeHtml(hook)}</p>
      <div class="post-footer"><span class="status-pill ${statusClass}">${escapeHtml(labelForStatus(post.status))}</span><span class="readiness" title="${escapeHtml(readiness)}">${escapeHtml(readiness)}</span></div>
      <button class="card-edit" type="button" data-edit="${escapeHtml(post.id)}" aria-label="${escapeHtml(editLabel)}">Open Reel details</button>
    </article>`;
  }

  function matchesSearch(post, query) {
    if (!query) return true;
    const searchable = [
      post.theme, post.angle, post.hook, post.visualDirection, post.script, post.caption, post.cta,
      post.scenario, post.failure, post.consequence, post.procedure, post.example, post.nwhService,
      post.problem, post.offer, post.included, post.process, post.boundaries, post.nextStep
    ].join(" ").toLocaleLowerCase();
    return searchable.includes(query.toLocaleLowerCase());
  }

  function filteredSlots() {
    const query = byId("search").value.trim();
    const day = byId("day-filter").value;
    const role = byId("type-filter").value;
    const status = byId("status-filter").value;
    return slots.filter((post) =>
      (day === "all" || String(post.day) === day) &&
      (role === "all" || post.role === role) &&
      (status === "all" || post.status === status) &&
      matchesSearch(post, query)
    );
  }

  function renderBoard() {
    const filtered = filteredSlots();
    const groups = new Map();
    filtered.forEach((post) => {
      if (!groups.has(post.day)) groups.set(post.day, []);
      groups.get(post.day).push(post);
    });
    boardEl.innerHTML = [...groups.entries()].map(([day, posts]) => {
      const done = posts.filter((post) => ["scheduled", "published"].includes(post.status)).length;
      return `<section class="day-group" aria-labelledby="day-${day}-heading">
        <div class="day-heading"><h3 id="day-${day}-heading">Day ${String(day).padStart(2, "0")}<span class="day-date">${escapeHtml(dateForDay(day))}</span></h3><span class="day-count">${done}/${posts.length} scheduled or published</span></div>
        <div class="post-grid">${posts.sort((a, b) => a.time.localeCompare(b.time)).map(cardMarkup).join("")}</div>
      </section>`;
    }).join("");
    byId("empty-state").hidden = filtered.length !== 0;
    boardEl.hidden = filtered.length === 0;
    updateOverview();
  }

  function updateOverview() {
    const ready = slots.filter(isContentReady).length;
    const scheduled = slots.filter((post) => ["scheduled", "published"].includes(post.status)).length;
    const pct = Math.round((scheduled / 90) * 100);
    byId("stat-planned").textContent = "90";
    byId("stat-ready").textContent = String(ready);
    byId("stat-scheduled").textContent = String(scheduled);
    byId("progress-bar").style.width = `${pct}%`;
    document.querySelector(".progress-track").setAttribute("aria-valuenow", String(scheduled));
    byId("progress-text").textContent = scheduled
      ? `${scheduled} of 90 Reels have been uploaded and scheduled or published. Keep content distinct and save license evidence.`
      : "Start by setting a campaign date and adding a distinct angle to each Reel.";
  }

  function renderFilters() {
    const dayFilter = byId("day-filter");
    for (let day = 1; day <= 30; day += 1) {
      const option = document.createElement("option");
      option.value = String(day);
      option.textContent = `Day ${String(day).padStart(2, "0")}`;
      dayFilter.append(option);
    }
    const statusFilter = byId("status-filter");
    STAGES.forEach((stage) => {
      const option = document.createElement("option");
      option.value = stage.id;
      option.textContent = stage.label;
      statusFilter.append(option);
    });
  }

  function renderField(field, value) {
    const id = `field-${field.key}`;
    const requiredMark = field.required ? " <span aria-hidden=\"true\">*</span>" : "";
    const help = field.help ? `<span class="field-help" id="${id}-help">${escapeHtml(field.help)}</span>` : "";
    const common = `id="${id}" name="${escapeHtml(field.key)}" class="field-control"${field.required ? " required" : ""}${field.full ? "" : ""}${field.help ? ` aria-describedby="${id}-help"` : ""}`;
    const control = field.type === "textarea"
      ? `<textarea ${common} rows="3">${escapeHtml(value)}</textarea>`
      : `<input ${common} type="text" value="${escapeHtml(value)}" autocomplete="off">`;
    return `<div class="field ${field.full ? "full-width" : ""}"><label for="${id}">${escapeHtml(field.label)}${requiredMark}</label>${help}${control}</div>`;
  }

  function editFields(post) {
    const statusOptions = STAGES.map((stage) => `<option value="${stage.id}" ${post.status === stage.id ? "selected" : ""}>${escapeHtml(stage.label)}</option>`).join("");
    const statusField = `<div class="field"><label for="field-status">Production stage</label><select id="field-status" name="status" class="field-control">${statusOptions}</select><span class="field-help">Mark stages manually. Meta Business Suite is where you upload and schedule finished videos.</span></div>`;
    const common = COMMON_FIELDS.map((field) => renderField(field, post[field.key])).join("");
    const teaching = typeFields(post).map((field) => renderField(field, post[field.key])).join("");
    const assets = ASSET_FIELDS.map((field) => renderField(field, post[field.key])).join("");
    const videoQuery = pixabayVideoQuery(post);
    const musicQuery = pixabayMusicQuery(post);
    const mediaSearch = `<div class="pixabay-search full-width">
      <p><strong>Find content-matched Pixabay media</strong><br>Search for genuine live-action footage that fits this Reel and the Philippine setting. Use the same supplied Bossa Nova Soulful Music track (andriih, Pixabay item 630197) in every Reel, quietly under the voice; review the first Facebook upload for any mute/block notice before scheduling the full batch.</p>
      <div class="pixabay-search-terms"><span><strong>Video search:</strong> ${escapeHtml(videoQuery)}</span><span><strong>Music search:</strong> ${escapeHtml(musicQuery)}</span></div>
      <div class="pixabay-search-actions">
        <a class="button button-secondary" href="https://pixabay.com/videos/search/${encodeURIComponent(videoQuery)}/" target="_blank" rel="noopener noreferrer">Search matching videos</a>
        <a class="button button-secondary" href="https://pixabay.com/music/search/${encodeURIComponent(musicQuery)}/" target="_blank" rel="noopener noreferrer">Search matching music</a>
        <a class="license-link" href="https://pixabay.com/service/license-summary/" target="_blank" rel="noopener noreferrer">Review Pixabay license</a>
      </div>
      <span class="field-help">Search results are candidates, not approval. Check the exact item page, contributor, content type, and any third-party rights. Keep the source and license evidence in the fields below. Pixabay media may be used royalty-free under its license restrictions; do not redistribute a stock file on its own.</span>
    </div>`;
    return `<div class="field-section">Content brief</div>${common}${statusField}<div class="field-section">${post.role === "education" ? "Show how" : post.role === "promotion" ? "Transparent offer" : "Conversation direction"}</div>${teaching || `<div class="field full-width"><p class="field-help">Use the angle, hook, and script to invite a meaningful conversation. Keep the CTA low-pressure and avoid turning every morning post into a sales pitch.</p></div>`}<div class="field-section">Pixabay video and background music</div>${mediaSearch}<div class="field-section">Selected media and license record</div>${assets}`;
  }

  function compactQuery(parts, maxWords = 18) {
    return parts.join(" ")
      .replace(/[^\p{L}\p{N}\s-]/gu, " ")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, maxWords)
      .join(" ");
  }

  function pixabayVideoQuery(post) {
    const specific = [post.theme, post.angle, post.visualDirection].filter((value) => String(value || "").trim());
    const context = specific.length ? specific : [
      post.role === "education" ? "spa operations schedule therapist" : post.role === "promotion" ? "spa therapist training wellness" : "spa client wellness conversation"
    ];
    return compactQuery([...context, "Philippines spa faceless live action"], 22);
  }

  function pixabayMusicQuery() {
    return "andriih bossa nova soulful music 630197";
  }

  function openEditor(id) {
    const post = slots.find((item) => item.id === id);
    if (!post) return;
    activePostId = id;
    const role = roleFor(post);
    byId("editor-meta").textContent = `Day ${String(post.day).padStart(2, "0")} · ${role.timeLabel} PHT · ${role.label}`;
    byId("editor-title").textContent = post.theme.trim() || "New Reel brief";
    const existingIssues = stageIssues(post);
    byId("editor-error").textContent = existingIssues.join(" ");
    byId("editor-error").hidden = existingIssues.length === 0;
    editorFields.innerHTML = editFields(post);
    editor.showModal();
    editorFields.querySelector("input, textarea, select")?.focus({ preventScroll: true });
  }

  function closeEditor() {
    if (editor.open) editor.close();
    activePostId = null;
  }

  function saveEditor(event) {
    event.preventDefault();
    if (!activePostId) return;
    const post = slots.find((item) => item.id === activePostId);
    if (!post) return;
    const formData = new FormData(editorForm);
    const draft = { ...post };
    for (const [key, value] of formData.entries()) {
      draft[key] = String(value).trim();
    }
    const errors = stageIssues(draft);
    if (errors.length) {
      const errorEl = byId("editor-error");
      errorEl.textContent = errors.join(" ");
      errorEl.hidden = false;
      errorEl.scrollIntoView({ block: "nearest" });
      return;
    }
    Object.assign(post, draft);
    saveSlots();
    renderBoard();
    const duplicates = duplicateIssues(post);
    showToast(duplicates.length ? "Saved. Check the warning for repeated themes or hooks." : "Reel details saved in this browser.");
    closeEditor();
  }

  function contentPrompt(post = null) {
    const role = post ? roleFor(post) : null;
    const dayLine = post ? `Create the ${role.label} Reel for Day ${String(post.day).padStart(2, "0")} at ${role.timeLabel} PHT.` : "Create a batch plan for 30 days with three distinct Reels per day.";
    const filled = post ? `\nCurrent brief details:\n- Theme: ${post.theme || "To be proposed"}\n- Distinct angle: ${post.angle || "To be proposed"}\n- NWH service: ${post.nwhService || post.offer || "Use only confirmed NWH services"}` : "";
    const roleInstruction = !post
      ? "For each Awakening post, start a meaningful conversation or reframe a familiar situation without a hard sell. For each Education post, explain what is going wrong, why, and exactly how to correct it using a real scenario, failure point, consequence, step-by-step procedure, realistic example, and relevant NWH service. Include who acts, what and when, how, which record/checklist to use, and how the owner verifies the work. For each Promotion post, state the actual offer, audience, inclusions, process, boundaries, and next step. Do not invent prices, guarantees, deliverables, or terms; use [CONFIRM] for missing details."
      : post.role === "education"
        ? "For education, answer what is going wrong, why it happens, and exactly how to correct it. Structure the lesson as: real scenario; exact failure; consequence; practical steps naming who acts, what and when, how, which record/checklist to use, and how the owner verifies; realistic example; relevant NWH service."
        : post.role === "promotion"
          ? "For promotion, clearly state the problem addressed, the actual service, who it is for, what is included, how engagement works, boundaries, and the next step. Do not invent prices, guarantees, deliverables, or terms. Use [CONFIRM] for missing offer details."
          : "For awakening, start a meaningful, conversational discussion or reframe a familiar situation. Keep it relatable and avoid a hard sell.";
    return `You are creating Facebook Reels for Narmae Wellness Hub® in the Philippines. ${dayLine}${filled}\n\nCreate original concepts with distinct themes and angles. Use natural, conversational Taglish and culturally familiar Philippine spa situations. Use no U.S. industry statistics as evidence about the Philippines.\n\n${roleInstruction}\n\nNWH services are Staffing Support (identify workforce requirements and address sourcing gaps), Therapist Training (structured practical instruction and competency development), and Spa Operations Consulting (review workflows, develop procedures, clarify responsibilities, and establish suitable monitoring). Do not invent service terms, prices, guarantees, deliverables, or policies.\n\nVisual direction must describe full-frame vertical, natural live-action footage with faceless people only (backs, hands, silhouettes, over-the-shoulder views), realistic Philippine environments, lighting, movement, and ambient sound. Do not use AI-generated people or images, animation, foreign-looking footage, robotic narration, stiff acting, decorative borders, or template frames.\n\nKeep paid services distinct from free education. Explain what the owner or staff must do internally and what NWH can provide externally. Do not claim a short video replaces training or consulting.\n\nUse the same supplied MP3, “Bossa Nova Soulful Music” by andriih (Pixabay item 630197), as quiet background music across every Reel; keep spoken Taglish clear and do not suggest a replacement song. Treat it as part of the finished video, not as standalone audio. Return a concise Pixabay video search phrase matched to the theme and visual direction; the user will keep the track download record and review the first Facebook upload for any automated audio notice.\n\nReturn: post role and day; theme; distinct angle; hook; visual direction; Taglish script/voice-over; caption; CTA; role-specific teaching or offer details; Pixabay video search phrase; and Pixabay music mood/search phrase. Make every concept meaningfully different from the other campaign posts.`;
  }

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
    } catch (error) {
      showToast("Clipboard access was blocked. You can still use the prompt in content-standard.md.");
    }
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  function csvCell(value) {
    let text = String(value ?? "");
    if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  }

  function exportCsv() {
    const headings = ["day", "date_pht", "time_pht", "post_type", "stage", ...new Set([...COMMON_FIELDS, ...EDUCATION_FIELDS, ...PROMOTION_FIELDS, ...ASSET_FIELDS].map((field) => field.key))];
    const rows = slots.map((post) => {
      const role = roleFor(post);
      const record = { day: post.day, date_pht: dateForDay(post.day), time_pht: role.time, post_type: role.label, stage: labelForStatus(post.status), ...post };
      return headings.map((heading) => csvCell(record[heading])).join(",");
    });
    const csv = `\ufeff${[headings.map(csvCell).join(","), ...rows].join("\r\n")}`;
    downloadFile(`nwh-reels-schedule-${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv;charset=utf-8");
    showToast("Schedule exported. Upload and schedule finished videos in Meta Business Suite.");
  }

  function exportJson() {
    const backup = {
      app: "Narmae Wellness Hub Reels Planner",
      version: 1,
      timezone: "Asia/Manila",
      campaignStartDate: startDate || null,
      note: "This backup is a local planning record. It does not include video files or publish to Facebook.",
      slots
    };
    downloadFile(`nwh-reels-plan-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(backup, null, 2), "application/json;charset=utf-8");
    showToast("Plan backup downloaded.");
  }

  async function importJson(file) {
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      if (!Array.isArray(backup.slots) || backup.slots.length !== 90) {
        throw new Error("The file does not contain the expected 90 campaign slots.");
      }
      const expectedIds = new Set(makeCampaign().map((post) => post.id));
      const importedIds = backup.slots.map((post) => post && post.id);
      if (new Set(importedIds).size !== 90 || importedIds.some((id) => !expectedIds.has(id))) {
        throw new Error("The backup has missing or duplicate campaign slots.");
      }
      if (!window.confirm("Restore this backup and replace the planner saved in this browser?")) return;
      const base = makeCampaign();
      const importedById = new Map(backup.slots.filter((item) => item && typeof item.id === "string").map((item) => [item.id, item]));
      const editableKeys = [
        "status", ...COMMON_FIELDS.map((field) => field.key), ...EDUCATION_FIELDS.map((field) => field.key),
        ...PROMOTION_FIELDS.map((field) => field.key), ...ASSET_FIELDS.map((field) => field.key)
      ];
      slots = base.map((slot) => {
        const incoming = importedById.get(slot.id) || {};
        for (const key of editableKeys) {
          if (key === "status" && STAGES.some((stage) => stage.id === incoming[key])) slot[key] = incoming[key];
          else if (key !== "status" && typeof incoming[key] === "string") slot[key] = incoming[key];
        }
        return slot;
      });
      startDate = isIsoDate(backup.campaignStartDate) ? backup.campaignStartDate : "";
      byId("start-date").value = startDate;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
        if (startDate) localStorage.setItem(START_DATE_KEY, startDate);
        else localStorage.removeItem(START_DATE_KEY);
      } catch (error) {
        showToast("Backup loaded for this session, but this browser could not save it locally.");
      }
      renderBoard();
      showToast("Planner backup restored.");
    } catch (error) {
      showToast("That file is not a valid NWH planner backup.");
    } finally {
      byId("import-json").value = "";
    }
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function initialize() {
    renderFilters();
    byId("start-date").value = startDate;
    renderBoard();

    byId("start-date").addEventListener("change", (event) => {
      const nextStartDate = event.target.value;
      const hasScheduledPosts = slots.some((post) => ["scheduled", "published"].includes(post.status));
      if (hasScheduledPosts && nextStartDate !== startDate) {
        const confirmed = window.confirm("Changing the campaign start date changes dates shown in this planner only. It will not change Reels already scheduled or published in Meta Business Suite. Continue?");
        if (!confirmed) {
          event.target.value = startDate;
          return;
        }
      }
      startDate = isIsoDate(nextStartDate) ? nextStartDate : "";
      try {
        if (startDate) localStorage.setItem(START_DATE_KEY, startDate);
        else localStorage.removeItem(START_DATE_KEY);
      } catch (error) {
        showToast("This browser could not save the campaign date. Export a JSON backup when your plan is ready.");
      }
      renderBoard();
    });
    ["search", "day-filter", "type-filter", "status-filter"].forEach((id) => byId(id).addEventListener("input", renderBoard));
    boardEl.addEventListener("click", (event) => {
      const button = event.target.closest("[data-edit]");
      if (button) openEditor(button.dataset.edit);
    });
    editorForm.addEventListener("submit", saveEditor);
    byId("close-editor").addEventListener("click", closeEditor);
    byId("cancel-edit").addEventListener("click", closeEditor);
    byId("export-csv").addEventListener("click", exportCsv);
    byId("export-json").addEventListener("click", exportJson);
    byId("import-json-button").addEventListener("click", () => byId("import-json").click());
    byId("import-json").addEventListener("change", (event) => importJson(event.target.files?.[0]));
    byId("copy-campaign-prompt").addEventListener("click", () => copyText(contentPrompt(), "Campaign prompt copied."));
    byId("copy-post-prompt").addEventListener("click", () => {
      const post = slots.find((item) => item.id === activePostId);
      if (post) copyText(contentPrompt(post), "Prompt for this Reel copied.");
    });
    editor.addEventListener("click", (event) => {
      if (event.target === editor) closeEditor();
    });
  }

  initialize();
})();
